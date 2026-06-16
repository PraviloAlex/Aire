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
import { getCardForGoal } from "@/data/learnArticles";
import { RATING_ORDER, ratingFaces, reflectionTriggers } from "@/data/reflectionContent";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { generateId, saveSessionRecord } from "@/storage/sessionStorage";
import { sessionScreenTones } from "@/theme/gradients";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, stateColors, typography } from "@/theme/tokens";
import type { BreathingGoal, ReflectionRating } from "@/types/breathing";

type SessionReflectionProps = Readonly<{
  goal: BreathingGoal;
  practiceId: string;
  durationSeconds: number;
  onRestart: () => void;
}>;

export function SessionReflection({ goal, practiceId, durationSeconds, onRestart }: SessionReflectionProps) {
  const router = useRouter();
  const { colors, setMode } = useTheme();
  const accent = stateColors[goal];
  const tones = sessionScreenTones[goal];

  const [rating, setRating] = useState<ReflectionRating | null>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saveError, setSaveError] = useState(false);
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
      trigger: trigger ?? undefined,
      note: note.trim() || undefined,
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
      router.replace("/");
    }
  };

  const handleSkip = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    const ok = await saveSessionRecord({
      id: generateId(),
      practiceId,
      goal,
      durationSeconds,
      completedAt: new Date().toISOString(),
      reflection: null,
    });
    if (!ok) {
      isSavingRef.current = false;
      setSaveError(true);
      return;
    }
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
      </ScrollView>
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
});
