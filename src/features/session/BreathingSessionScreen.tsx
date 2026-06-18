import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { generateId, saveSessionRecord } from "@/storage/sessionStorage";
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
  const { cueSettings, centerDisplay } = useSettings();
  const { stateColors, setMode } = useTheme();
  const timer = useBreathingTimer(practice.pattern);
  const { cuePhaseChange } = useSessionAudioCues(cueSettings);
  const { cuePhaseChange: cueHapticPhaseChange } = useSessionHapticCues(cueSettings, practice.goal);
  const { isCompleted, isRunning, pause, reset, snapshot, start } = timer;
  const [prepRemaining, setPrepRemaining] = useState(PREP_SECONDS);
  const elapsedRef = useRef(0);
  elapsedRef.current = snapshot.totalElapsedSeconds;
  const textScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const textFadeRef = useRef<Animated.CompositeAnimation | null>(null);
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const hintAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const hintShownRef = useRef(false);
  const phaseKey = `${snapshot.roundIndex}-${snapshot.phaseIndex}`;
  const goal = practice.goal;
  const accent = stateColors[goal];
  const tones = sessionScreenTones[goal];
  const isPreparing = snapshot.status === "idle" && prepRemaining > 0;
  const isPaused = snapshot.status === "paused";
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

    // Crossfade: текст новой фазы мягко проявляется (~300ms), орб не трогаем.
    textFadeRef.current?.stop();
    textOpacity.setValue(0);
    textFadeRef.current = Animated.timing(textOpacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
    textFadeRef.current.start();
  }, [phaseKey, isPreparing, currentPhaseName, currentPhaseDuration, textScale, textOpacity]);

  // Разовый хинт «коснись, чтобы пауза» — показываем один раз в начале и плавно гасим.
  useEffect(() => {
    if (isRunning && !isPreparing && !hintShownRef.current) {
      hintShownRef.current = true;
      hintOpacity.setValue(1);
      hintAnimRef.current = Animated.sequence([
        Animated.delay(3200),
        Animated.timing(hintOpacity, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]);
      hintAnimRef.current.start();
    }
    return () => hintAnimRef.current?.stop();
  }, [isRunning, isPreparing, hintOpacity]);

  const handleRestart = useCallback(() => {
    reset();
    setPrepRemaining(PREP_SECONDS);
  }, [reset]);

  const handlePrimaryPress = useCallback(() => {
    if (isPreparing) return;
    if (isRunning) {
      hintOpacity.setValue(0);
      pause();
      return;
    }
    start();
  }, [isPreparing, isRunning, pause, start, hintOpacity]);

  const handleStop = useCallback(() => {
    const elapsed = elapsedRef.current;
    if (elapsed > 0) {
      void saveSessionRecord({
        id: generateId(),
        practiceId: practice.id,
        goal,
        durationSeconds: Math.round(elapsed),
        completedAt: new Date().toISOString(),
        reflection: null,
        completed: false,
      });
    }
    pause();
    router.push("/");
  }, [pause, router, practice.id, goal]);

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
          <Pressable
            style={styles.topButton}
            onPress={handleStop}
            accessibilityRole="button"
            accessibilityLabel="Закрыть сессию"
          >
            <Ionicons name="close" size={28} color="#F2F6FA" />
          </Pressable>
        </View>

        <SessionProgressBar progress={progressValue} remainingSeconds={remainingValue} accent={accent} />

        <TouchableWithoutFeedback onPress={handlePrimaryPress} accessibilityRole="none">
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
              {centerDisplay !== "clean" ? (
                <Animated.View
                  style={[styles.centerText, { opacity: textOpacity, transform: [{ scale: textScale }] }]}
                  pointerEvents="none"
                >
                  <Text style={styles.verb}>{instructionLabel}</Text>
                  {centerDisplay === "phase_count" ? (
                    <Text style={styles.sec}>{instructionSeconds}</Text>
                  ) : null}
                </Animated.View>
              ) : null}
            </View>
            {SHOW_PHASE_HINTS && phaseHint ? <Text style={styles.hint}>{phaseHint}</Text> : null}
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.bottom}>
          {isPaused ? (
            <View style={styles.pausedControls}>
              <Pressable
                style={[styles.primaryButton, { backgroundColor: `${accent}22` }]}
                onPress={start}
                accessibilityRole="button"
                accessibilityLabel="Продолжить"
              >
                <Ionicons name="play" size={28} color="#DCE8F4" />
              </Pressable>
              <Pressable onPress={handleStop} accessibilityRole="button" accessibilityLabel="Завершить сессию">
                <Text style={styles.finishLink}>Завершить</Text>
              </Pressable>
            </View>
          ) : (
            <Animated.Text style={[styles.tapHint, { opacity: hintOpacity }]}>
              Коснись, чтобы пауза
            </Animated.Text>
          )}
        </View>
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
    color: "#F2F6FA",
    fontSize: 34,
    fontWeight: "600",
    lineHeight: 40,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  sec: {
    fontFamily: fontFamily.display,
    color: "#EAF2FA",
    fontSize: 56,
    fontWeight: "600",
    lineHeight: 62,
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
    minHeight: 90,
    justifyContent: "center",
  },
  pausedControls: {
    width: "100%",
    alignItems: "center",
    gap: spacing.lg,
  },
  primaryButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  finishLink: {
    color: "#8FA1B7",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  tapHint: {
    color: "#6E8093",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
