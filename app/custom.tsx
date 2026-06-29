import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { goalLabels } from "@/data/breathingPractices";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import {
  clampRounds,
  clampSeconds,
  DEFAULT_CUSTOM_PATTERN,
  isPlayable,
  totalSeconds,
  type CustomPattern,
  type CustomPhaseSeconds,
} from "@/features/custom/customPattern";
import {
  deleteCustomPattern,
  generateCustomId,
  loadCustomDraft,
  loadCustomPatterns,
  saveCustomDraft,
  saveCustomPattern,
} from "@/features/custom/customPatternStorage";
import { homeScreenTones } from "@/theme/gradients";
import { colors, fontFamily, radius, spacing, stateColors } from "@/theme/tokens";
import type { BreathingGoal } from "@/types/breathing";

const PHASE_ROWS: readonly { key: keyof CustomPhaseSeconds; label: string }[] = [
  { key: "inhale", label: "Вдох" },
  { key: "holdIn", label: "Задержка после вдоха" },
  { key: "exhale", label: "Выдох" },
  { key: "holdOut", label: "Задержка после выдоха" },
];

const GOALS: readonly BreathingGoal[] = ["calm", "focus", "recover", "sleep", "fear", "pain", "irritation"];

function formatTotal(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} с`;
  if (s === 0) return `${m} мин`;
  return `${m} мин ${s} с`;
}

function rhythmLabel(seconds: CustomPhaseSeconds): string {
  return [seconds.inhale, seconds.holdIn, seconds.exhale, seconds.holdOut]
    .map((value) => clampSeconds(value))
    .join("–");
}

export default function CustomPatternScreen() {
  const router = useRouter();
  const [seconds, setSeconds] = useState<CustomPhaseSeconds>(DEFAULT_CUSTOM_PATTERN.seconds);
  const [rounds, setRounds] = useState<number>(DEFAULT_CUSTOM_PATTERN.rounds);
  const [goal, setGoal] = useState<BreathingGoal>(DEFAULT_CUSTOM_PATTERN.goal);
  const [name, setName] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [presets, setPresets] = useState<readonly CustomPattern[]>([]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [list, draft] = await Promise.all([loadCustomPatterns(), loadCustomDraft()]);
      if (!active) return;
      setPresets(list);
      if (draft) {
        setSeconds(draft.seconds);
        setRounds(draft.rounds);
        setGoal(draft.goal);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const accent = stateColors[goal];
  const current: CustomPattern = { id: editingId ?? "draft", name, goal, rounds, seconds };
  const total = totalSeconds(current);
  const canPlay = isPlayable(current);

  const adjustPhase = useCallback((key: keyof CustomPhaseSeconds, delta: number) => {
    setSeconds((prev) => ({ ...prev, [key]: clampSeconds(prev[key] + delta) }));
  }, []);

  const adjustRounds = useCallback((delta: number) => {
    setRounds((prev) => clampRounds(prev + delta));
  }, []);

  const handleStart = useCallback(async () => {
    if (!canPlay) return;
    await saveCustomDraft({ ...current, id: "draft" });
    router.push("/session/custom");
  }, [canPlay, current, router]);

  const handleSavePreset = useCallback(async () => {
    const id = editingId ?? generateCustomId();
    const toSave: CustomPattern = { id, name, goal, rounds, seconds };
    const next = await saveCustomPattern(toSave);
    setPresets(next);
    setEditingId(id);
  }, [editingId, name, goal, rounds, seconds]);

  const handleEditPreset = useCallback((preset: CustomPattern) => {
    setSeconds(preset.seconds);
    setRounds(preset.rounds);
    setGoal(preset.goal);
    setName(preset.name);
    setEditingId(preset.id);
  }, []);

  const handleDeletePreset = useCallback(async (id: string) => {
    const next = await deleteCustomPattern(id);
    setPresets(next);
    setEditingId((cur) => (cur === id ? null : cur));
  }, []);

  const handleNew = useCallback(() => {
    setSeconds(DEFAULT_CUSTOM_PATTERN.seconds);
    setRounds(DEFAULT_CUSTOM_PATTERN.rounds);
    setGoal(DEFAULT_CUSTOM_PATTERN.goal);
    setName("");
    setEditingId(null);
  }, []);

  return (
    <ScreenBackground id="customBg" top={homeScreenTones.top} mid={homeScreenTones.mid} base={homeScreenTones.base}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.closeChip} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Назад">
            <Ionicons name="chevron-back" size={20} color="#C9D4E0" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.heading}>Свой паттерн</Text>
            <Text style={styles.sub}>Настройте ритм под себя — бесплатно</Text>
          </View>
        </View>

        <View style={styles.card}>
          {PHASE_ROWS.map((row) => (
            <View key={row.key} style={styles.stepRow}>
              <Text style={styles.stepLabel}>{row.label}</Text>
              <View style={styles.stepper}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => adjustPhase(row.key, -1)}
                  accessibilityRole="button"
                  accessibilityLabel={`${row.label}: меньше`}
                >
                  <Ionicons name="remove" size={18} color="#C9D4E0" />
                </Pressable>
                <Text style={styles.stepValue}>{clampSeconds(seconds[row.key])}<Text style={styles.stepUnit}> с</Text></Text>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => adjustPhase(row.key, 1)}
                  accessibilityRole="button"
                  accessibilityLabel={`${row.label}: больше`}
                >
                  <Ionicons name="add" size={18} color="#C9D4E0" />
                </Pressable>
              </View>
            </View>
          ))}

          <View style={[styles.stepRow, styles.stepRowLast]}>
            <Text style={styles.stepLabel}>Раунды</Text>
            <View style={styles.stepper}>
              <Pressable style={styles.stepBtn} onPress={() => adjustRounds(-1)} accessibilityRole="button" accessibilityLabel="Раунды: меньше">
                <Ionicons name="remove" size={18} color="#C9D4E0" />
              </Pressable>
              <Text style={styles.stepValue}>{clampRounds(rounds)}</Text>
              <Pressable style={styles.stepBtn} onPress={() => adjustRounds(1)} accessibilityRole="button" accessibilityLabel="Раунды: больше">
                <Ionicons name="add" size={18} color="#C9D4E0" />
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.totalLine}>
          Ритм {rhythmLabel(seconds)} · длительность {formatTotal(total)}
        </Text>

        <Text style={styles.eyebrow}>Состояние</Text>
        <View style={styles.goalRow}>
          {GOALS.map((g) => {
            const isActive = g === goal;
            return (
              <Pressable
                key={g}
                onPress={() => setGoal(g)}
                style={[
                  styles.goalPill,
                  isActive ? { backgroundColor: stateColors[g], borderColor: stateColors[g] } : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={goalLabels[g]}
              >
                <Text style={[styles.goalPillText, isActive ? styles.goalPillTextActive : null]}>{goalLabels[g]}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Название пресета (необязательно)"
          placeholderTextColor={colors.textMuted}
          style={styles.nameInput}
          maxLength={40}
        />

        <Pressable
          style={[styles.primaryButton, { backgroundColor: accent }, !canPlay ? styles.disabled : null]}
          onPress={handleStart}
          disabled={!canPlay}
          accessibilityRole="button"
          accessibilityLabel="Запустить"
        >
          <Text style={styles.primaryText}>Запустить</Text>
        </Pressable>

        <View style={styles.secondaryRow}>
          <Pressable style={styles.secondaryButton} onPress={handleSavePreset} accessibilityRole="button" accessibilityLabel="Сохранить пресет">
            <Text style={styles.secondaryText}>{editingId ? "Обновить пресет" : "Сохранить пресет"}</Text>
          </Pressable>
          {editingId ? (
            <Pressable style={styles.secondaryButton} onPress={handleNew} accessibilityRole="button" accessibilityLabel="Новый паттерн">
              <Text style={styles.secondaryText}>Новый</Text>
            </Pressable>
          ) : null}
        </View>

        {presets.length > 0 ? (
          <View style={styles.presetsBlock}>
            <Text style={styles.eyebrow}>Мои пресеты</Text>
            {presets.map((preset) => (
              <View key={preset.id} style={styles.presetCard}>
                <Pressable
                  style={styles.presetMain}
                  onPress={() => router.push(`/session/custom?id=${preset.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Запустить ${preset.name || "пресет"}`}
                >
                  <View style={[styles.presetDot, { backgroundColor: stateColors[preset.goal] }]} />
                  <View style={styles.presetTextWrap}>
                    <Text style={styles.presetName}>{preset.name.trim() || "Без названия"}</Text>
                    <Text style={styles.presetMeta}>
                      {rhythmLabel(preset.seconds)} · {formatTotal(totalSeconds(preset))}
                    </Text>
                  </View>
                  <Ionicons name="play" size={18} color={stateColors[preset.goal]} />
                </Pressable>
                <Pressable
                  style={styles.presetIconBtn}
                  onPress={() => handleEditPreset(preset)}
                  accessibilityRole="button"
                  accessibilityLabel={`Изменить ${preset.name || "пресет"}`}
                >
                  <Ionicons name="create-outline" size={18} color="#8892A4" />
                </Pressable>
                <Pressable
                  style={styles.presetIconBtn}
                  onPress={() => handleDeletePreset(preset.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Удалить ${preset.name || "пресет"}`}
                >
                  <Ionicons name="trash-outline" size={18} color="#8892A4" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: 26, paddingBottom: 104, gap: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  closeChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 2 },
  heading: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  sub: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: 1,
  },
  stepRowLast: { borderBottomWidth: 0 },
  stepLabel: { color: "#E7EDF5", fontSize: 15, fontWeight: "600", flex: 1, paddingRight: spacing.md },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: { color: "#F2F6FA", fontSize: 18, fontWeight: "700", minWidth: 52, textAlign: "center" },
  stepUnit: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  totalLine: { color: "#9DB0C4", fontSize: 13, fontWeight: "600", textAlign: "center" },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  goalRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  goalPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  goalPillText: { color: "#C5D0DD", fontSize: 13, fontWeight: "600" },
  goalPillTextActive: { color: "#06121F", fontWeight: "700" },
  nameInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: "#F1ECE3",
    fontSize: 15,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#06121F", fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.5 },
  secondaryRow: { flexDirection: "row", gap: spacing.md },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: "#D6DEE8", fontSize: 14, fontWeight: "600" },
  presetsBlock: { gap: spacing.sm, marginTop: spacing.sm },
  presetCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  presetMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md },
  presetDot: { width: 10, height: 10, borderRadius: 5 },
  presetTextWrap: { flex: 1, gap: 2 },
  presetName: { color: "#EAF0F8", fontSize: 15, fontWeight: "700" },
  presetMeta: { color: colors.textMuted, fontSize: 12, fontWeight: "500" },
  presetIconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
});
