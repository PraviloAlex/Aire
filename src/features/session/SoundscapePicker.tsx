import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { soundscapes } from "@/data/soundscapes";
import { stateOrbColors } from "@/theme/gradients";
import { colors, fontFamily, radius, spacing } from "@/theme/tokens";
import type { BreathingGoal } from "@/types/breathing";

type ChipOption = Readonly<{ id: string | null; label: string }>;

const CHIPS: readonly ChipOption[] = [
  { id: null, label: "Авто" },
  ...soundscapes.filter((s) => s.id !== "none").map((s) => ({ id: s.id, label: s.title })),
  { id: "none", label: "Тихо" },
];

type Props = Readonly<{
  goal: BreathingGoal;
  selected: string | null;
  onSelect: (id: string | null) => void;
}>;

export function SoundscapePicker({ goal, selected, onSelect }: Props) {
  const accent = stateOrbColors[goal].glow;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>ФОН</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {CHIPS.map((chip) => {
          const isSelected = chip.id === selected;
          return (
            <Pressable
              key={String(chip.id)}
              style={[
                styles.chip,
                isSelected && {
                  backgroundColor: `${accent}22`,
                  borderColor: `${accent}66`,
                },
              ]}
              onPress={() => onSelect(chip.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Фон: ${chip.label}`}
            >
              <Text style={[styles.chipLabel, isSelected && { color: accent }]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
        <View style={styles.rowPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginLeft: 2,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: 2,
  },
  rowPadding: {
    width: spacing.xl,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  chipLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: "600",
  },
});
