import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  clampSeconds,
  totalSeconds,
  type CustomPattern,
  type CustomPhaseSeconds,
} from "@/features/custom/customPattern";
import { loadCustomPatterns } from "@/features/custom/customPatternStorage";
import { editorial, editorialFont } from "@/theme/editorial";
import { stateColors } from "@/theme/tokens";

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

// Нижняя плашка-вход в «Свой ритм» + всплывающий лист с пресетами.
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

  const launchPreset = useCallback(
    (id: string) => {
      setOpen(false);
      router.push(`/session/custom?id=${id}`);
    },
    [router]
  );

  const configureNew = useCallback(() => {
    setOpen(false);
    router.push("/custom");
  }, [router]);

  return (
    <>
      <View style={styles.wrap} pointerEvents="box-none">
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Свой ритм: выбрать или настроить дыхание"
          style={({ pressed }) => [styles.bar, pressed ? styles.pressed : null]}
        >
          <View style={styles.barDot} />
          <View style={styles.barCopy}>
            <Text style={styles.barTitle}>Свой ритм</Text>
            <Text style={styles.barSub}>Выбери или настрой своё дыхание</Text>
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
            <Text style={styles.sheetSub}>Запусти сохранённый ритм или настрой новый</Text>

            {presets.length > 0 ? (
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
                    <Ionicons name="play" size={18} color={editorial.clay} />
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyHint}>Пока нет сохранённых ритмов — настрой первый.</Text>
            )}

            <Pressable style={styles.primaryBtn} onPress={configureNew} accessibilityRole="button" accessibilityLabel="Настроить новый ритм">
              <Ionicons name="add" size={18} color={editorial.paper} />
              <Text style={styles.primaryLabel}>Настроить новый ритм</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  sheetSub: { fontFamily: editorialFont.sans, fontSize: 13, color: editorial.inkSoft, marginBottom: 6 },
  presetScroll: { maxHeight: 260 },
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
  emptyHint: { fontFamily: editorialFont.sans, fontSize: 13, color: editorial.inkSoft, paddingVertical: 12 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: editorial.clay,
    borderRadius: 12,
    minHeight: 54,
    marginTop: 6,
  },
  primaryLabel: { fontFamily: editorialFont.sans, fontSize: 16, fontWeight: "700", color: editorial.paper },
});
