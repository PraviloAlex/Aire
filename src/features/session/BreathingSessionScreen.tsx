import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { PulseMeasureSheet } from "@/features/biofeedback/PulseMeasureSheet";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { BreathingOrb } from "@/features/session/BreathingOrb";
import { ShaderOrb } from "@/features/session/orbShader/ShaderOrb";
import { getPhaseHint } from "@/features/session/phaseHints";
import { SessionProgressBar } from "@/features/session/SessionProgressBar";
import { SessionReflection } from "@/features/session/SessionReflection";
import { resolveSoundscape } from "@/features/session/soundscapeMix";
import { usePhaseTextAnimation } from "@/features/session/usePhaseTextAnimation";
import { getPhaseRemainingSeconds, useBreathingTimer } from "@/features/session/useBreathingTimer";
import { useSessionAudioCues } from "@/features/session/useSessionAudioCues";
import { useSessionHapticCues } from "@/features/session/useSessionHapticCues";
import { useSessionPulse } from "@/features/session/useSessionPulse";
import { useTapHintAnimation } from "@/features/session/useTapHintAnimation";
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
  const { cueSettings, centerDisplay, orbStyle, defaultSoundscapeId, pulseEnabled } = useSettings();
  const { stateColors, setMode } = useTheme();
  const [sessionSoundscapeId] = useState<string | null>(null);
  const timer = useBreathingTimer(practice.pattern);

  const resolvedSoundscape = useMemo(
    () => resolveSoundscape(sessionSoundscapeId, defaultSoundscapeId, practice.goal),
    [sessionSoundscapeId, defaultSoundscapeId, practice.goal]
  );

  const { cuePhaseChange } = useSessionAudioCues(cueSettings, resolvedSoundscape);
  const { cuePhaseChange: cueHapticPhaseChange } = useSessionHapticCues(cueSettings, practice.goal);
  const { isCompleted, isRunning, pause, reset, snapshot, start } = timer;
  const [prepRemaining, setPrepRemaining] = useState(PREP_SECONDS);
  const elapsedRef = useRef(0);
  elapsedRef.current = snapshot.totalElapsedSeconds;
  const phaseKey = `${snapshot.roundIndex}-${snapshot.phaseIndex}`;
  const goal = practice.goal;
  const accent = stateColors[goal];
  const tones = sessionScreenTones[goal];
  // Мягкое свечение только на круглой кнопке и только на web (см. DESIGN-GUIDE).
  const primaryGlow = Platform.OS === "web" ? ({ boxShadow: `0 6px 22px ${accent}40` } as object) : undefined;
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

  const { bpmBefore, isPulseMeasureOpen, openPulseMeasure, closePulseMeasure, completePulseMeasure } =
    useSessionPulse({ isPreparing });
  const { textScale, textOpacity } = usePhaseTextAnimation({
    isPreparing,
    phaseKey,
    currentPhaseName,
    currentPhaseDurationSeconds: currentPhaseDuration,
  });
  const { hintOpacity, hideHint } = useTapHintAnimation({ isRunning, isPreparing });

  useEffect(() => {
    setPrepRemaining(PREP_SECONDS);
    reset();
  }, [practice.id, reset]);

  useEffect(() => {
    if (!isPreparing || isPulseMeasureOpen) {
      return undefined;
    }
    const timeout = setTimeout(() => {
      setPrepRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isPreparing, prepRemaining, isPulseMeasureOpen]);

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

  const handleRestart = useCallback(() => {
    reset();
    setPrepRemaining(PREP_SECONDS);
  }, [reset]);

  const handlePrimaryPress = useCallback(() => {
    if (isPreparing) return;
    if (isRunning) {
      hideHint();
      pause();
      return;
    }
    start();
  }, [isPreparing, isRunning, pause, start, hideHint]);

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
        bpmBefore={bpmBefore ?? undefined}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <ScreenBackground id="sessionBg" top={tones.top} mid={tones.mid} base={tones.base}>
      <PulseMeasureSheet
        visible={isPulseMeasureOpen}
        onDone={completePulseMeasure}
        onClose={closePulseMeasure}
      />
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.closeChip}
            onPress={handleStop}
            accessibilityRole="button"
            accessibilityLabel="Закрыть сессию"
          >
            <Ionicons name="close" size={18} color="#C9D4E0" />
          </Pressable>
          <SessionProgressBar progress={progressValue} remainingSeconds={remainingValue} accent={accent} />
        </View>

        <TouchableWithoutFeedback onPress={handlePrimaryPress} accessibilityRole="none">
          <View style={styles.center}>
            <View style={styles.orbWrap}>
              {orbStyle === "classic" ? (
                <BreathingOrb
                  goal={goal}
                  phaseName={snapshot.currentPhase.name}
                  durationSeconds={snapshot.currentPhase.durationSeconds}
                  running={isRunning && !isPreparing}
                  size={ORB_SIZE}
                />
              ) : (
                <ShaderOrb
                  goal={goal}
                  phaseName={snapshot.currentPhase.name}
                  durationSeconds={snapshot.currentPhase.durationSeconds}
                  phaseElapsedSeconds={snapshot.phaseElapsedSeconds}
                  isPreparing={isPreparing}
                  running={isRunning && !isPreparing}
                  size={ORB_SIZE}
                />
              )}
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
          {isPreparing ? (
            <View style={styles.prepControls}>
              {pulseEnabled && (
                <Pressable
                  onPress={openPulseMeasure}
                  style={styles.pulseChip}
                  accessibilityRole="button"
                  accessibilityLabel="Замерить пульс до сессии"
                >
                  <Text style={styles.pulseChipLabel}>
                    {bpmBefore != null ? `♥ ${bpmBefore} уд/мин` : "♥ Замерить пульс"}
                  </Text>
                </Pressable>
              )}
            </View>
          ) : isPaused ? (
            <View style={styles.controlRow}>
              <View style={styles.controlItem}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={handleRestart}
                  accessibilityRole="button"
                  accessibilityLabel="Начать заново"
                >
                  <Ionicons name="refresh-outline" size={20} color="#A9B6C6" />
                </Pressable>
                <Text style={styles.controlLabel}>Заново</Text>
              </View>

              <View style={styles.controlItem}>
                <Pressable
                  style={[styles.primaryButton, { backgroundColor: accent }, primaryGlow]}
                  onPress={start}
                  accessibilityRole="button"
                  accessibilityLabel="Продолжить"
                >
                  <Ionicons name="play" size={28} color="#06121F" />
                </Pressable>
                <Text style={styles.controlLabelPrimary}>Продолжить</Text>
              </View>

              <View style={styles.controlItem}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={handleStop}
                  accessibilityRole="button"
                  accessibilityLabel="Завершить сессию"
                >
                  <Ionicons name="checkmark-outline" size={20} color="#A9B6C6" />
                </Pressable>
                <Text style={styles.controlLabel}>Завершить</Text>
              </View>
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
    gap: spacing.md,
  },
  closeChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
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
  controlRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  controlItem: {
    alignItems: "center",
    gap: 6,
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  controlLabel: {
    color: "#5E7088",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  controlLabelPrimary: {
    color: "#7C8DA0",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  tapHint: {
    color: "#6E8093",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  prepControls: {
    width: "100%",
    gap: spacing.md,
    alignItems: "center",
  },
  pulseChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  pulseChipLabel: {
    color: "#8892A4",
    fontSize: 13,
    fontWeight: "600",
  },
});
