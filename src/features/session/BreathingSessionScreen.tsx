import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { ShaderOrb } from "@/features/session/orbShader/ShaderOrb";
import { getPhaseHint } from "@/features/session/phaseHints";
import { SessionProgressBar } from "@/features/session/SessionProgressBar";
import { SessionReflection } from "@/features/session/SessionReflection";
import { getPhaseRemainingSeconds, useBreathingTimer } from "@/features/session/useBreathingTimer";
import { useSessionAudioCues } from "@/features/session/useSessionAudioCues";
import { useSessionHapticCues } from "@/features/session/useSessionHapticCues";
import { useSettings } from "@/features/settings/SettingsContext";
import { sessionScreenTones } from "@/theme/gradients";
import { useTheme } from "@/theme/ThemeProvider";
import { fontFamily, radius, spacing } from "@/theme/tokens";
import type { BreathingGoal, BreathingPhaseName, BreathingPractice } from "@/types/breathing";

type BreathingSessionScreenProps = Readonly<{
  practice: BreathingPractice;
}>;

const ORB_SIZE = 300;
const PREP_SECONDS = 3;
// Подсказки фаз временно скрыты: тексты допишем и включим позже.
const SHOW_PHASE_HINTS = false;

const phaseActionLabels: Record<BreathingPhaseName, string> = {
  inhale: "Вдох",
  sigh: "Вдох",
  hold: "Пауза",
  pause: "Пауза",
  exhale: "Выдох",
  rest: "Пауза",
};

export function BreathingSessionScreen({ practice }: BreathingSessionScreenProps) {
  const router = useRouter();
  const { cueSettings } = useSettings();
  const { stateColors, setMode } = useTheme();
  const timer = useBreathingTimer(practice.pattern);
  const { cuePhaseChange } = useSessionAudioCues(cueSettings);
  const { cuePhaseChange: cueHapticPhaseChange } = useSessionHapticCues(cueSettings);
  const { isCompleted, isRunning, pause, reset, snapshot, start } = timer;
  const [prepRemaining, setPrepRemaining] = useState(PREP_SECONDS);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const textScale = useRef(new Animated.Value(1)).current;
  const textAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideAnim = useRef<Animated.CompositeAnimation | null>(null);
  const phaseKey = `${snapshot.roundIndex}-${snapshot.phaseIndex}`;
  const goal = practice.goal;
  const accent = stateColors[goal];
  const tones = sessionScreenTones[goal];
  const isPreparing = snapshot.status === "idle" && prepRemaining > 0;
  const phaseRemainingSeconds = getPhaseRemainingSeconds(snapshot);
  const currentPhaseName = snapshot.currentPhase.name;
  const currentPhaseDuration = snapshot.currentPhase.durationSeconds;
  const instructionLabel = isPreparing ? "Готовься" : phaseActionLabels[currentPhaseName];
  const instructionSeconds = isPreparing ? prepRemaining : phaseRemainingSeconds;
  const progressValue = isPreparing ? 0 : snapshot.progress;
  const remainingValue = isPreparing ? practice.durationSeconds : snapshot.totalRemainingSeconds;
  const phaseHint = isPreparing ? undefined : getPhaseHint(goal, currentPhaseName);

  useEffect(() => {
    setPrepRemaining(PREP_SECONDS);
    reset();
  }, [practice.id, reset]);

  useEffect(() => {
    if (!isPreparing) {
      return undefined;
    }
    const timeout = setTimeout(() => {
      setPrepRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isPreparing, prepRemaining]);

  useEffect(() => {
    if (prepRemaining === 0 && snapshot.status === "idle") {
      start();
    }
  }, [prepRemaining, snapshot.status, start]);

  useEffect(() => {
    if (!isPreparing && snapshot.status === "running") {
      cuePhaseChange(snapshot.currentPhase, phaseKey);
      cueHapticPhaseChange(snapshot.currentPhase, phaseKey);
    }
  }, [cueHapticPhaseChange, cuePhaseChange, isPreparing, phaseKey, snapshot.currentPhase, snapshot.status]);

  useEffect(() => {
    setMode(goal === "fear" ? "fear" : "default");
    return () => setMode("default");
  }, [goal, setMode]);

  useEffect(() => {
    if (isPreparing) return;
    const toValue =
      currentPhaseName === "inhale" || currentPhaseName === "sigh" || currentPhaseName === "hold"
        ? 1.02
        : 0.98;
    textAnimRef.current?.stop();
    textAnimRef.current = Animated.timing(textScale, {
      toValue,
      duration: currentPhaseDuration * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
    textAnimRef.current.start();
  }, [phaseKey, isPreparing, currentPhaseName, currentPhaseDuration, textScale]);

  const showControls = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideAnim.current?.stop();
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    hideTimer.current = setTimeout(() => {
      hideAnim.current = Animated.timing(controlsOpacity, {
        toValue: 0.15,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      });
      hideAnim.current.start();
    }, 3000);
  }, [controlsOpacity]);

  useEffect(() => {
    if (isRunning && !isPreparing) {
      showControls();
    } else {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideAnim.current?.stop();
    };
  }, [isRunning, isPreparing, showControls, controlsOpacity]);

  const handleRestart = useCallback(() => {
    reset();
    setPrepRemaining(PREP_SECONDS);
  }, [reset]);

  const handlePrimaryPress = useCallback(() => {
    if (isPreparing) return;
    if (isRunning) {
      pause();
      return;
    }
    start();
  }, [isPreparing, isRunning, pause, start]);

  const handleStop = useCallback(() => {
    pause();
    router.push("/");
  }, [pause, router]);

  if (isCompleted) {
    return (
      <SessionReflection
        goal={goal as BreathingGoal}
        practiceId={practice.id}
        durationSeconds={practice.durationSeconds}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <ScreenBackground id="sessionBg" top={tones.top} mid={tones.mid} base={tones.base}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Link href="/" asChild>
            <Pressable style={styles.topButton} accessibilityRole="button" accessibilityLabel="Назад">
              <Ionicons name="chevron-back" size={28} color="#F2F6FA" />
            </Pressable>
          </Link>
          <Pressable
            style={styles.topButton}
            onPress={handleStop}
            accessibilityRole="button"
            accessibilityLabel="Завершить сессию"
          >
            <Text style={styles.endText}>End</Text>
          </Pressable>
        </View>

        <SessionProgressBar progress={progressValue} remainingSeconds={remainingValue} accent={accent} />

        <TouchableWithoutFeedback
          onPress={() => {
            if (isRunning && !isPreparing) showControls();
          }}
          accessibilityRole="none"
        >
          <View style={styles.center}>
            <View style={styles.orbWrap}>
              <ShaderOrb
                goal={goal}
                phaseName={snapshot.currentPhase.name}
                durationSeconds={snapshot.currentPhase.durationSeconds}
                phaseElapsedSeconds={snapshot.phaseElapsedSeconds}
                isPreparing={isPreparing}
                running={isRunning && !isPreparing}
                size={ORB_SIZE}
              />
              <Animated.View style={[styles.centerText, { transform: [{ scale: textScale }] }]} pointerEvents="none">
                <Text style={styles.verb}>{instructionLabel}</Text>
                <Text style={styles.sec}>{instructionSeconds}</Text>
              </Animated.View>
            </View>
            {SHOW_PHASE_HINTS && phaseHint ? <Text style={styles.hint}>{phaseHint}</Text> : null}
          </View>
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.bottom, { opacity: controlsOpacity }]}>
          <View style={styles.controls}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: `${accent}22` }, isPreparing && styles.disabled]}
              onPress={handlePrimaryPress}
              accessibilityRole="button"
              accessibilityLabel={isRunning ? "Пауза" : "Продолжить"}
              disabled={isPreparing}
            >
              <Ionicons name={isRunning ? "pause" : "play"} size={28} color="#DCE8F4" />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    justifyContent: "space-between",
  },
  topBar: {
    width: "100%",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  endText: {
    color: "#8FA1B7",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  orbWrap: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  verb: {
    fontFamily: fontFamily.display,
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "700",
    lineHeight: 44,
    textAlign: "center",
  },
  sec: {
    fontFamily: fontFamily.display,
    color: "#FFFFFF",
    fontSize: 58,
    fontWeight: "700",
    lineHeight: 64,
  },
  hint: {
    color: "#8191A6",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 260,
  },
  phraseBlock: {
    marginTop: spacing.xxl,
    minWidth: 220,
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.035)",
  },
  statePhrase: {
    color: "#EAF0F8",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  followText: {
    color: "#8191A6",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  bottom: {
    width: "100%",
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
});
