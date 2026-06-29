import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { goalLabels } from "@/data/breathingPractices";
import {
  clampSeconds,
  totalSeconds,
  type CustomPattern,
  type CustomPhaseSeconds,
} from "@/features/custom/customPattern";
import { loadCustomPatterns } from "@/features/custom/customPatternStorage";
import { editorial, editorialFont } from "@/theme/editorial";
import { stateColors } from "@/theme/tokens";
import type { BreathingGoal } from "@/types/breathing";

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

// Нижняя плашка-вход в «Свой ритм» + всплывающий лист: состояния и сохранённые ритмы.
export function CustomRhythmBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [presets, setPresets] = useState<readonly CustomPattern[]>([]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void (async () => {
      const list = await loadCustomPatterns();
      if (active) setPresets(list);
    })();
    return () => {
      active = false;
    };
  }, [open]);

  const openState = useCallback(
    (goal: BreathingGoal) => {
      setOpen(false);
      router.push(`/custom?goal=${goal}`);
    },
    [router]
  );

  const launchPreset = useCallback(
    (id: string) => {
      setOpen(false);
      router.push(`/session/custom?id=${id}`);
    },
    [router]
  );

  const configureBlank = useCallback(() => {
    setOpen(false);
    router.push("/custom");
  }, [router]);

  return (
    <>
      <View style={styles.fade} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="customBarFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={editorial.paper} stopOpacity={0} />
              <Stop offset="0.55" stopColor={editorial.paper} stopOpacity={0.85} />
              <Stop offset="1" stopColor={editorial.paper} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#customBarFade)" />
        </Svg>
      </View>

      <View style={styles.wrap} pointerEvents="box-none">
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Свой ритм: выбрать состояние или сохранённый ритм"
          style={({ pressed }) => [styles.bar, pressed ? styles.pressed : null]}
        >
          <View style={styles.barDot} />
          <View style={styles.barCopy}>
            <Text style={styles.barTitle}>Свой ритм</Text>
            <Text style={styles.barSub}>Выбери состояние и дыши по-своему</Text>
          </View>
          <Ionicons name="chevron-up" size={18} color={editorial.clay} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.scrim}
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Закрыть"
          />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Свой ритм</Text>
            <Text style={styles.sheetSub}>Выбери состояние — подставим базовый ритм</Text>

            <View style={styles.stateGrid}>
              {GOALS.map((goal) => (
                <Pressable
                  key={goal}
                  style={styles.stateChip}
                  onPress={() => openState(goal)}
                  accessibilityRole="button"
                  accessibilityLabel={`${goalLabels[goal]}: открыть базовый ритм`}
                >
                  <View style={[styles.stateDot, { backgroundColor: stateColors[goal] }]} />
                  <Text style={styles.stateLabel} numberOfLines={1}>{goalLabels[goal]}</Text>
                </Pressable>
              ))}
            </View>

            {presets.length > 0 ? (
              <>
                <Text style={styles.eyebrow}>Мои ритмы</Text>
                <ScrollView style={styles.presetScroll} contentContainerStyle={styles.presetList} showsVerticalScrollIndicator={false}>
                  {presets.map((preset) => (
                    <Pressable
                      key={preset.id}
                      style={styles.presetRow}
                      onPress={() => launchPreset(preset.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Запустить ${preset.name || "ритм"}`}
                    >
                      <View style={[styles.presetDot, { backgroundColor: stateColors[preset.goal] }]} />
                      <View style={styles.presetText}>
                        <Text style={styles.presetName}>{preset.name.trim() || "Без названия"}</Text>
                        <Text style={styles.presetMeta}>{rhythmLabel(preset.seconds)} · {formatTotal(totalSeconds(preset))}</Text>
                      </View>
                      <View style={styles.presetPlay}>
                        <Ionicons name="play" size={15} color={editorial.clay} />
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <Pressable style={styles.blankBtn} onPress={configureBlank} accessibilityRole="button" accessibilityLabel="Настроить с нуля">
              <Text style={styles.blankLabel}>Настроить с нуля</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 156 },
  wrap: { position: "absolute", left: 20, right: 20, bottom: 76 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: editorial.sosBg,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  pressed: { opacity: 0.88 },
  barDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: editorial.clay },
  barCopy: { flex: 1 },
  barTitle: {
    fontFamily: editorialFont.sans,
    fontSize: 14,
    fontWeight: "700",
    color: editorial.sosText,
    letterSpacing: -0.1,
  },
  barSub: { fontFamily: editorialFont.sans, fontSize: 11, color: editorial.sosSub, marginTop: 1 },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  scrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(33,29,24,0.45)" },
  sheet: {
    backgroundColor: editorial.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    gap: 10,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: editorial.hairline,
    marginBottom: 8,
  },
  sheetTitle: { fontFamily: editorialFont.serif, fontSize: 26, color: editorial.ink },
  sheetSub: { fontFamily: editorialFont.sans, fontSize: 13, color: editorial.inkSoft, marginBottom: 4 },
  stateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "47%",
    backgroundColor: editorial.paperRaised,
    borderColor: editorial.hairline,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stateDot: { width: 7, height: 7, borderRadius: 4 },
  stateLabel: { fontFamily: editorialFont.sans, fontSize: 13, fontWeight: "600", color: editorial.ink, flexShrink: 1 },
  eyebrow: {
    fontFamily: editorialFont.sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: editorial.inkFaint,
    marginTop: 8,
  },
  presetScroll: { maxHeight: 200 },
  presetList: { gap: 8, paddingBottom: 4 },
  presetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: editorial.paperRaised,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  presetDot: { width: 10, height: 10, borderRadius: 5 },
  presetText: { flex: 1, gap: 2 },
  presetName: { fontFamily: editorialFont.serif, fontSize: 16, color: editorial.ink },
  presetMeta: { fontFamily: editorialFont.sans, fontSize: 12, color: editorial.inkSoft },
  presetPlay: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(192,87,58,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  blankBtn: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: editorial.hairline,
    marginTop: 6,
  },
  blankLabel: { fontFamily: editorialFont.sans, fontSize: 15, fontWeight: "600", color: editorial.inkSoft },
});
