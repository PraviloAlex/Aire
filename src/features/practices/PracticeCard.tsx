import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { goalLabels } from "@/data/breathingPractices";
import { StateOrb } from "@/features/common/StateOrb";
import { stateOrbColors } from "@/theme/gradients";
import { colors, radius, spacing, stateColors } from "@/theme/tokens";
import type { BreathingPractice } from "@/types/breathing";
import { formatMinutes } from "@/utils/formatDuration";

type PracticeCardProps = Readonly<{
  practice: BreathingPractice;
  compact?: boolean;
}>;

export function PracticeCard({ practice, compact = false }: PracticeCardProps) {
  const accent = stateColors[practice.goal];

  return (
    <Link href={`/session/${practice.id}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: `${accent}12`, borderColor: `${accent}2E` },
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
      >
        <View style={styles.header}>
          <StateOrb size={38} colors={stateOrbColors[practice.goal]} />
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{practice.title}</Text>
            <Text style={styles.subtitle}>{practice.subtitle}</Text>
          </View>
          <Text style={[styles.duration, { color: accent }]}>
            {formatMinutes(practice.durationSeconds)}
          </Text>
        </View>
        {!compact && <Text style={styles.summary}>{practice.summary}</Text>}
        <View style={styles.footer}>
          <Text style={[styles.goal, { color: accent }]}>{goalLabels[practice.goal]}</Text>
          <Text style={styles.intensity}>{practice.intensity}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.75,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: "#EAF0F8",
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  duration: {
    fontSize: 13,
    fontWeight: "700",
  },
  summary: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goal: {
    fontSize: 12,
    fontWeight: "700",
  },
  intensity: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
