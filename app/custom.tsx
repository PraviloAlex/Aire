import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { goalLabels } from "@/data/breathingPractices";
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
import { editorial, editorialFont } from "@/theme/editorial";
import { stateColors } from "@/theme/tokens";
import type { BreathingGoal } from "@/types/breathing";

const PHASE_ROWS: readonly { key: keyof CustomPhaseSeconds; label: string }[] = [
  { key: "inhale", label: "Вдох" },
  { key: "holdIn", label: "Пауза" },
  { key: "exhale", label: "Выдох" },
  { key: "holdOut", label: "Пауза" },
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
    .join("·");
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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Назад">
            <Ionicons name="chevron-back" size={22} color={editorial.ink} />
          </Pressable>
          <Text style={styles.eyebrow}>СВОЙ РИТМ</Text>
        </View>

        <Text style={styles.heading}>Свой ритм</Text>
        <Text style={styles.sub}>Настройте вдох, паузы и выдох под себя</Text>

        <View style={styles.card}>
          {PHASE_ROWS.map((row, index) => (
            <View key={row.key} style={[styles.phaseRow, index === PHASE_ROWS.length - 1 ? styles.phaseRowLast : null]}>
              <Text style={styles.phaseLabel}>{row.label}</Text>
              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={() => adjustPhase(row.key, -1)} accessibilityRole="button" accessibilityLabel={`${row.label}: меньше`}>
                  <Ionicons name="remove" size={16} color={editorial.inkSoft} />
                </Pressable>
                <Text style={styles.stepValue}>{clampSeconds(seconds[row.key])}</Text>
                <Pressable style={styles.stepBtn} onPress={() => adjustPhase(row.key, 1)} accessibilityRole="button" accessibilityLabel={`${row.label}: больше`}>
                  <Ionicons name="add" size={16} color={editorial.inkSoft} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryText}>
            <Text style={styles.summaryRhythm}>Ритм {rhythmLabel(seconds)}</Text>
            <Text style={styles.summaryMeta}>{clampRounds(rounds)} раундов · {formatTotal(total)}</Text>
          </View>
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtn} onPress={() => adjustRounds(-1)} accessibilityRole="button" accessibilityLabel="Раунды: меньше">
              <Ionicons name="remove" size={16} color={editorial.inkSoft} />
            </Pressable>
            <Text style={styles.roundsLabel}>раунды</Text>
            <Pressable style={styles.stepBtn} onPress={() => adjustRounds(1)} accessibilityRole="button" accessibilityLabel="Раунды: больше">
              <Ionicons name="add" size={16} color={editorial.inkSoft} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionEyebrow}>Состояние</Text>
        <View style={styles.goalRow}>
          {GOALS.map((g) => {
            const isActive = g === goal;
            return (
              <Pressable
                key={g}
                onPress={() => setGoal(g)}
                style={[styles.goalPill, isActive ? styles.goalPillActive : null]}
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
          placeholderTextColor={editorial.inkFaint}
          style={styles.nameInput}
          maxLength={40}
        />

        <Pressable
          style={[styles.primaryButton, !canPlay ? styles.disabled : null]}
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
            <Pressable style={styles.secondaryButton} onPress={handleNew} accessibilityRole="button" accessibilityLabel="Новый ритм">
              <Text style={styles.secondaryText}>Новый</Text>
            </Pressable>
          ) : null}
        </View>

        {presets.length > 0 ? (
          <View style={styles.presetsBlock}>
            <Text style={styles.sectionEyebrow}>Мои пресеты</Text>
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
                    <Text style={styles.presetMeta}>{rhythmLabel(preset.seconds)} · {formatTotal(totalSeconds(preset))}</Text>
                  </View>
                  <Ionicons name="play" size={18} color={editorial.clay} />
                </Pressable>
                <Pressable style={styles.presetIconBtn} onPress={() => handleEditPreset(preset)} accessibilityRole="button" accessibilityLabel={`Изменить ${preset.name || "пресет"}`}>
                  <Ionicons name="create-outline" size={18} color={editorial.inkSoft} />
                </Pressable>
                <Pressable style={styles.presetIconBtn} onPress={() => handleDeletePreset(preset.id)} accessibilityRole="button" accessibilityLabel={`Удалить ${preset.name || "пресет"}`}>
                  <Ionicons name="trash-outline" size={18} color={editorial.inkSoft} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: editorial.paper },
  content: { paddingHorizontal: 24, paddingTop: 26, paddingBottom: 104, gap: 14 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  eyebrow: { color: editorial.inkFaint, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  heading: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 34, lineHeight: 38 },
  sub: { color: editorial.inkSoft, fontSize: 14, lineHeight: 20, marginBottom: 4 },
  card: { backgroundColor: editorial.paperRaised, borderRadius: 16, paddingHorizontal: 18 },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomColor: editorial.hairline,
    borderBottomWidth: 1,
  },
  phaseRowLast: { borderBottomWidth: 0 },
  phaseLabel: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 18, flex: 1 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: editorial.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: { color: editorial.clay, fontSize: 19, fontWeight: "500", minWidth: 30, textAlign: "center" },
  roundsLabel: { color: editorial.inkFaint, fontSize: 12, fontWeight: "600" },
  summaryCard: {
    backgroundColor: editorial.paperRaised,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryText: { flex: 1, gap: 2 },
  summaryRhythm: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 20 },
  summaryMeta: { color: editorial.inkSoft, fontSize: 13 },
  sectionEyebrow: {
    color: editorial.inkFaint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 4,
  },
  goalRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goalPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: editorial.hairline,
    backgroundColor: editorial.paperRaised,
  },
  goalPillActive: { backgroundColor: editorial.clay, borderColor: editorial.clay },
  goalPillText: { color: editorial.inkSoft, fontSize: 13, fontWeight: "600" },
  goalPillTextActive: { color: editorial.paper, fontWeight: "700" },
  nameInput: {
    backgroundColor: editorial.paperRaised,
    borderColor: editorial.hairline,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: editorial.ink,
    fontSize: 15,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: editorial.clay,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: editorial.paper, fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.45 },
  secondaryRow: { flexDirection: "row", gap: 12 },
  secondaryButton: { flex: 1, minHeight: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: editorial.inkSoft, fontSize: 14, fontWeight: "600" },
  presetsBlock: { gap: 8, marginTop: 4 },
  presetCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: editorial.paperRaised,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 8,
  },
  presetMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  presetDot: { width: 10, height: 10, borderRadius: 5 },
  presetTextWrap: { flex: 1, gap: 2 },
  presetName: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 16 },
  presetMeta: { color: editorial.inkSoft, fontSize: 12 },
  presetIconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
});
