import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { goalLabels } from "@/data/breathingPractices";
import { fearCopy } from "@/data/fearCopy";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { BreathingOrb } from "@/features/session/BreathingOrb";
import { SessionProgressRing } from "@/features/session/SessionProgressRing";
import { SessionReflection } from "@/features/session/SessionReflection";
import { getPhaseRemainingSeconds, useBreathingTimer } from "@/features/session/useBreathingTimer";
import { useSessionAudioCues } from "@/features/session/useSessionAudioCues";
import { useSessionHapticCues } from "@/features/session/useSessionHapticCues";
import { useSettings } from "@/features/settings/SettingsContext";
import { sessionScreenTones } from "@/theme/gradients";
import { useTheme } from "@/theme/ThemeProvider";
import { fontFamily, spacing, typography } from "@/theme/tokens";
import type { BreathingGoal, BreathingPhaseName, BreathingPractice } from "@/types/breathing";
import { formatDuration } from "@/utils/formatDuration";

type BreathingSessionScreenProps = Readonly<{
  practice: BreathingPractice;
}>;

const RING_SIZE = 230;
const ORB_SIZE = 184;
const PREP_SECONDS = 3;

const phaseActionLabels: Record<BreathingPhaseName, string> = {
  inhale: "Вдох",
  sigh: "Вдох",
  hold: "Задержка",
  pause: "Пауза",
  exhale: "Выдох",
  rest: "Отдых",
};

export function BreathingSessionScreen({ practice }: BreathingSessionScreenProps) {
  const router = useRouter();
  const { cueSettings, setSoundEnabled } = useSettings();
  const { colors, stateColors, setMode } = useTheme();
  const timer = useBreathingTimer(practice.pattern);
  const { cuePhaseChange } = useSessionAudioCues(cueSettings);
  const { cuePhaseChange: cueHapticPhaseChange } = useSessionHapticCues(cueSettings);
  const { isCompleted, isRunning, pause, reset, snapshot, start } = timer;
  const [prepRemaining, setPrepRemaining] = useState(PREP_SECONDS);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideAnim = useRef<Animated.CompositeAnimation | null>(null);
  const phaseKey = `${snapshot.roundIndex}-${snapshot.phaseIndex}`;
  const goal = practice.goal;
  const isFear = goal === "fear";
  const accent = stateColors[goal];
  const tones = sessionScreenTones[goal];
  const elapsed = Math.max(0, practice.durationSeconds - snapshot.totalRemainingSeconds);
  const isPreparing = snapshot.status === "idle" && prepRemaining > 0;
  const phaseRemainingSeconds = getPhaseRemainingSeconds(snapshot);
  const instructionLabel = isPreparing ? "Приготовься" : phaseActionLabels[snapshot.currentPhase.name];
  const instructionSeconds = isPreparing ? prepRemaining : phaseRemainingSeconds;

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
              <Ionicons name="chevron-back" size={24} color="#C7D0DE" />
            </Pressable>
          </Link>
          <Text style={styles.topTitle}>{goalLabels[goal]}</Text>
          <Pressable
            style={styles.topButton}
            onPress={() => setSoundEnabled(!cueSettings.soundEnabled)}
            accessibilityRole="button"
            accessibilityLabel={cueSettings.soundEnabled ? "Выключить звук" : "Включить звук"}
          >
            <Ionicons
              name={cueSettings.soundEnabled ? "volume-high-outline" : "volume-mute-outline"}
              size={22}
              color="#C7D0DE"
            />
          </Pressable>
        </View>

        <TouchableWithoutFeedback
          onPress={() => { if (isRunning && !isPreparing) showControls(); }}
          accessibilityRole="none"
        >
          <View style={styles.center}>
          <View style={styles.orbWrap}>
            <SessionProgressRing size={RING_SIZE} progress={snapshot.progress} color={accent} strokeWidth={2} />
            <BreathingOrb
              goal={goal}
              phaseName={snapshot.currentPhase.name}
              durationSeconds={snapshot.currentPhase.durationSeconds}
              running={isRunning && !isPreparing}
              size={ORB_SIZE}
            />
            <View style={styles.centerText} pointerEvents="none">
              <Text style={styles.verb}>{instructionLabel}</Text>
              <Text style={styles.sec}>{instructionSeconds} сек</Text>
            </View>
          </View>
          {isFear && (
            <Text style={styles.fearHint}>
              {isPreparing ? fearCopy.preparation : fearCopy.hint}
            </Text>
          )}
          <Text style={styles.time}>
            {formatDuration(elapsed)} / {formatDuration(practice.durationSeconds)}
          </Text>
          </View>
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.bottom, { opacity: controlsOpacity }]}>
          <View style={styles.controls}>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleStop}
              accessibilityRole="button"
              accessibilityLabel="Завершить сессию"
            >
              <Ionicons name="close" size={22} color="#C7D0DE" />
            </Pressable>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: accent }, isPreparing && styles.disabled]}
              onPress={handlePrimaryPress}
              accessibilityRole="button"
              accessibilityLabel={isRunning ? "Пауза" : "Продолжить"}
              disabled={isPreparing}
            >
              <Ionicons name={isRunning ? "pause" : "play"} size={26} color="#06121F" />
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
  topTitle: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  orbWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
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
    gap: 4,
  },
  verb: {
    fontFamily: fontFamily.display,
    color: "#EAF6FA",
    fontSize: 34,
    fontWeight: "700",
  },
  sec: {
    color: "#A9C2CC",
    fontSize: 14,
    fontWeight: "500",
  },
  fearHint: {
    color: "#8892A4",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.3,
    paddingHorizontal: 24,
  },
  time: {
    color: "#8090A4",
    fontSize: typography.caption,
    fontWeight: "600",
    letterSpacing: 1,
  },
  bottom: {
    width: "100%",
    alignItems: "center",
    gap: spacing.md,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
  },
  primaryButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
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
});
