import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getPracticeById } from "@/data/breathingPractices";
import { getCardForGoal } from "@/data/learnArticles";
import { RATING_ORDER, ratingFaces, reflectionTriggers } from "@/data/reflectionContent";
import { PulseMeasureSheet } from "@/features/biofeedback/PulseMeasureSheet";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { pluralizeRu } from "@/features/common/pluralizeRu";
import { useSettings } from "@/features/settings/SettingsContext";
import { generateId, saveSessionRecord } from "@/storage/sessionStorage";
import { sessionScreenTones } from "@/theme/gradients";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, stateColors, typography } from "@/theme/tokens";
import type { BreathingGoal, ReflectionRating } from "@/types/breathing";

const PROGRESS_UPDATE_ROUTE = "/(tabs)/progress" as Href;

type SessionReflectionProps = Readonly<{
  goal: BreathingGoal;
  practiceId: string;
  durationSeconds: number;
  bpmBefore?: number;
  onRestart: () => void;
}>;

export function SessionReflection({ goal, practiceId, durationSeconds, bpmBefore, onRestart }: SessionReflectionProps) {
  const router = useRouter();
  const { colors, setMode } = useTheme();
  const { pulseEnabled } = useSettings();
  const accent = stateColors[goal];
  const tones = sessionScreenTones[goal];
  const practice = getPracticeById(practiceId);
  const minutes = Math.round(durationSeconds / 60);

  const [rating, setRating] = useState<ReflectionRating | null>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [bpmAfter, setBpmAfter] = useState<number | null>(null);
  const [showAfterMeasure, setShowAfterMeasure] = useState(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    setMode(goal === "fear" ? "fear" : "default");
    return () => setMode("default");
  }, [goal, setMode]);

  const handleSave = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaveError(false);
    const ok = await saveSessionRecord({
      id: generateId(),
      practiceId,
      goal,
      durationSeconds,
      completedAt: new Date().toISOString(),
      reflection: rating,
      completed: true,
      trigger: trigger ?? undefined,
      note: note.trim() || undefined,
      bpmBefore,
      bpmAfter: bpmAfter ?? undefined,
    });
    if (!ok) {
      isSavingRef.current = false;
      setSaveError(true);
      return;
    }
    const article = getCardForGoal(goal);
    if (article) {
      router.replace(`/card/${article.id}?goal=${goal}` as Href);
    } else {
      router.replace(PROGRESS_UPDATE_ROUTE);
    }
  };

  const handleSkip = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaveError(false);
    const ok = await saveSessionRecord({
      id: generateId(),
      practiceId,
      goal,
      durationSeconds,
      completedAt: new Date().toISOString(),
      reflection: null,
      completed: true,
      bpmBefore,
      bpmAfter: bpmAfter ?? undefined,
    });
    if (!ok) {
      isSavingRef.current = false;
      setSaveError(true);
      return;
    }
    router.replace(PROGRESS_UPDATE_ROUTE);
  };

  const handleChooseOther = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    await saveSessionRecord({
      id: generateId(),
      practiceId,
      goal,
      durationSeconds,
      completedAt: new Date().toISOString(),
      reflection: null,
      completed: true,
    });
    router.replace("/");
  };

  return (
    <ScreenBackground id={`reflectionBg-${goal}`} top={tones.top} mid={tones.mid} base={tones.base}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>Сессия завершена</Text>
        <Text style={styles.heading}>Как ты сейчас?</Text>
        <Text style={styles.subheading}>Это помогает Aire подбирать практики</Text>

        <View style={styles.ratingRow}>
          {RATING_ORDER.map((value) => {
            const face = ratingFaces[value];
            const isSelected = rating === value;
            return (
              <Pressable
                key={value}
                style={[
                  styles.ratingCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && { borderColor: accent, backgroundColor: `${accent}18` },
                ]}
                onPress={() => setRating(isSelected ? null : value)}
                accessibilityRole="button"
                accessibilityLabel={face.label.replace("\n", " ")}
                accessibilityState={{ selected: isSelected }}
              >
                <Ionicons
                  name={face.icon as React.ComponentProps<typeof Ionicons>["name"]}
                  size={28}
                  color={isSelected ? accent : colors.textMuted}
                />
                <Text style={[styles.ratingLabel, isSelected && { color: accent }]}>
                  {face.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.statsBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.statLine}>
            {minutes} мин дыхания
            {practice
              ? ` · ${practice.pattern.rounds} ${pluralizeRu(practice.pattern.rounds, ["цикл", "цикла", "циклов"])}`
              : ""}
          </Text>
          {practice ? (
            <Text style={styles.statPractice}>Практика: {practice.title}</Text>
          ) : null}
        </View>

        {pulseEnabled && (
          <View style={[styles.pulseBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.pulseSectionLabel}>ПУЛЬС</Text>
            {bpmBefore != null && bpmAfter != null ? (
              <View style={styles.pulseDeltaRow}>
                <Text style={styles.pulseDeltaText}>
                  {bpmBefore} → {bpmAfter} уд/мин
                </Text>
                <Text
                  style={[
                    styles.pulseDeltaChange,
                    { color: bpmAfter < bpmBefore ? "#4FC3D4" : "#E57373" },
                  ]}
                >
                  {bpmAfter < bpmBefore ? "▼" : "▲"} {Math.abs(bpmAfter - bpmBefore)}
                </Text>
              </View>
            ) : bpmAfter != null ? (
              <Text style={styles.pulseSingle}>{bpmAfter} уд/мин</Text>
            ) : bpmBefore != null ? (
              <View style={styles.pulseMeasureRow}>
                <Text style={styles.pulseSingle}>До: {bpmBefore} уд/мин</Text>
                <Pressable
                  style={styles.measureBtn}
                  onPress={() => setShowAfterMeasure(true)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.measureBtnLabel, { color: accent }]}>
                    Замерить после →
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.measureBtn}
                onPress={() => setShowAfterMeasure(true)}
                accessibilityRole="button"
              >
                <Text style={[styles.measureBtnLabel, { color: accent }]}>
                  Замерить пульс
                </Text>
              </Pressable>
            )}
            <Text style={styles.pulseDisclaimer}>Оценка, не медицинское измерение.</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Что повлияло?</Text>
        <View style={styles.chipRow}>
          {reflectionTriggers.map((t) => {
            const isActive = trigger === t;
            return (
              <Pressable
                key={t}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isActive && { borderColor: accent, backgroundColor: `${accent}18` },
                ]}
                onPress={() => setTrigger(isActive ? null : t)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.chipLabel, isActive && { color: accent }]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          style={[styles.noteInput, { backgroundColor: colors.surface, borderColor: colors.border }]}
          placeholder="Добавить заметку…"
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          accessibilityLabel="Заметка к сессии"
        />

        {saveError && (
          <Text style={styles.saveErrorText}>
            Не удалось сохранить. Попробуй ещё раз.
          </Text>
        )}

        <Pressable
          style={[styles.saveButton, { backgroundColor: accent }]}
          onPress={() => { void handleSave(); }}
          accessibilityRole="button"
        >
          <Text style={styles.saveLabel}>Сохранить</Text>
        </Pressable>

        <Pressable
          style={styles.skipButton}
          onPress={() => { void handleSkip(); }}
          accessibilityRole="button"
        >
          <Text style={styles.skipLabel}>Пропустить</Text>
        </Pressable>

        <Pressable
          style={styles.restartButton}
          onPress={onRestart}
          accessibilityRole="button"
        >
          <Text style={[styles.restartLabel, { color: accent }]}>Повторить сессию →</Text>
        </Pressable>

        <Pressable
          style={styles.skipButton}
          onPress={() => { void handleChooseOther(); }}
          accessibilityRole="button"
        >
          <Text style={styles.skipLabel}>Выбрать другое</Text>
        </Pressable>
      </ScrollView>

      <PulseMeasureSheet
        visible={showAfterMeasure}
        onDone={(bpm) => { setBpmAfter(bpm); setShowAfterMeasure(false); }}
        onClose={() => setShowAfterMeasure(false)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: 104,
    gap: spacing.lg,
  },
  kicker: {
    color: "#8892A4",
    fontSize: typography.caption,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  heading: {
    color: "#E8EAF0",
    fontSize: typography.heading,
    fontWeight: "700",
    lineHeight: 32,
  },
  subheading: {
    color: "#8892A4",
    fontSize: 14,
    lineHeight: 20,
    marginTop: -spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ratingCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  ratingLabel: {
    color: "#8892A4",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  sectionLabel: {
    color: "#8892A4",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipLabel: {
    color: "#8892A4",
    fontSize: 13,
    fontWeight: "600",
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: "#E8EAF0",
    fontSize: 14,
    lineHeight: 21,
    minHeight: 80,
    textAlignVertical: "top",
  },
  statsBlock: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  statLine: {
    color: "#8892A4",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  statPractice: {
    color: "#8892A4",
    fontSize: 13,
    lineHeight: 19,
  },
  saveErrorText: {
    color: "#E57373",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  saveButton: {
    alignItems: "center",
    paddingVertical: 17,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    shadowColor: "#4FC3D4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  saveLabel: {
    color: "#06121F",
    fontSize: typography.body,
    fontWeight: "800",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  skipLabel: {
    color: "#8892A4",
    fontSize: typography.body,
    fontWeight: "600",
  },
  restartButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  restartLabel: {
    fontSize: typography.body,
    fontWeight: "700",
  },
  pulseBlock: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  pulseSectionLabel: {
    color: "#8892A4",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  pulseDeltaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  pulseDeltaText: {
    color: "#E8EAF0",
    fontSize: 16,
    fontWeight: "700",
  },
  pulseDeltaChange: {
    fontSize: 16,
    fontWeight: "700",
  },
  pulseSingle: {
    color: "#E8EAF0",
    fontSize: 15,
    fontWeight: "600",
  },
  pulseMeasureRow: {
    gap: spacing.sm,
  },
  measureBtn: {
    paddingVertical: 4,
  },
  measureBtnLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  pulseDisclaimer: {
    color: "#8892A4",
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.75,
  },
});
