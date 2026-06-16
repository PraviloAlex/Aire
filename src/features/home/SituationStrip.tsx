import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { breathingPractices } from "@/data/breathingPractices";
import { getPracticeForSituation, situations } from "@/data/situations";
import { colors, radius, spacing, stateColors, typography } from "@/theme/tokens";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export function SituationStrip() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>или по ситуации</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {situations.map((situation) => {
          const practice = getPracticeForSituation(situation, breathingPractices);
          const href = (practice ? `/session/${practice.id}` : "/practices") as Href;
          const accent = stateColors[situation.goal];
          return (
            <Link key={situation.id} href={href} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.chip,
                  { borderColor: accent },
                  pressed && styles.chipPressed,
                ]}
                accessibilityRole="link"
                accessibilityLabel={situation.label}
              >
                <Ionicons
                  name={situation.icon as IoniconName}
                  size={15}
                  color={accent}
                />
                <Text style={styles.chipLabel}>{situation.label}</Text>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  kicker: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.14)",
    flexShrink: 0,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 0,
  },
});
