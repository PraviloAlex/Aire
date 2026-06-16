import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { goalLabels } from "@/data/breathingPractices";
import { stateColors, colors, radius, spacing } from "@/theme/tokens";
import type { BreathingGoal } from "@/types/breathing";

type GoalValue = BreathingGoal | "all";

type GoalFilterProps = Readonly<{
  value: GoalValue;
  onChange: (goal: GoalValue) => void;
  includeAll?: boolean;
}>;

const orderedGoals: readonly BreathingGoal[] = [
  "calm",
  "focus",
  "fear",
  "recover",
  "sleep",
  "pain",
  "irritation",
];

export function GoalFilter({ value, onChange, includeAll = true }: GoalFilterProps) {
  const options: readonly GoalValue[] = includeAll ? ["all", ...orderedGoals] : orderedGoals;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {options.map((goal) => {
        const selected = value === goal;
        const accent = goal === "all" ? colors.text : stateColors[goal];

        return (
          <Pressable
            key={goal}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(goal)}
            style={[
              styles.chip,
              selected && {
                backgroundColor: accent,
                borderColor: accent
              }
            ]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {goal === "all" ? "Все" : goalLabels[goal]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  chip: {
    minHeight: 42,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  selectedLabel: {
    color: colors.surface
  }
});
