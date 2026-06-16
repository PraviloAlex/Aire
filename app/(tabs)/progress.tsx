import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { goalLabels } from "@/data/breathingPractices";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { useProgressStats } from "@/features/progress/useProgressStats";
import { homeScreenTones } from "@/theme/gradients";
import { colors, fontFamily, radius, spacing, stateColors } from "@/theme/tokens";

type Period = "week" | "month" | "all";

const PERIODS: readonly { key: Period; label: string }[] = [
  { key: "week", label: "Неделя" },
  { key: "month", label: "Месяц" },
  { key: "all", label: "Всё" },
];

const GLASS_BG = "rgba(255,255,255,0.05)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

function MetricCard({ value, label, accent }: { value: string; label: string; accent?: string }) {
  return (
    <View style={styles.metricCard}>
      <Text
        style={[
          styles.metricValue,
          accent ? { color: accent, fontSize: 22, lineHeight: 28 } : undefined,
        ]}
        numberOfLines={accent ? 1 : undefined}
        adjustsFontSizeToFit={Boolean(accent)}
        minimumFontScale={0.6}
      >
        {value}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const [period, setPeriod] = useState<Period>("week");
  const { stats, isLoading } = useProgressStats();
  const accent = stats.topGoal ? stateColors[stats.topGoal] : colors.calm;
  const topGoalLabel = stats.topGoal ? goalLabels[stats.topGoal] : "—";
  const sessionCount = period === "week" ? stats.weekSessions : stats.totalSessions;

  if (isLoading) {
    return (
      <ScreenBackground
        id="progressBg"
        top={homeScreenTones.top}
        mid={homeScreenTones.mid}
        base={homeScreenTones.base}
      />
    );
  }

  return (
    <ScreenBackground
      id="progressBg"
      top={homeScreenTones.top}
      mid={homeScreenTones.mid}
      base={homeScreenTones.base}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Прогресс</Text>

        <View style={styles.chips}>
          {PERIODS.map(({ key, label }) => (
            <Pressable
              key={key}
              style={[styles.chip, period === key && styles.chipActive]}
              onPress={() => setPeriod(key)}
              accessibilityRole="button"
            >
              <Text style={[styles.chipLabel, period === key && styles.chipLabelActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {stats.isFirstTime ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Начни с одной сессии</Text>
            <Text style={styles.emptyBody}>
              Aire покажет прогресс после первой завершённой практики.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.metricsGrid}>
              <MetricCard value={String(sessionCount)} label="сессий" />
              <MetricCard value={String(stats.totalMinutes)} label="минут" />
              <MetricCard value={String(stats.totalSessions)} label={"моментов\nпод контролем"} />
              <MetricCard value={topGoalLabel} label="любимое состояние" accent={accent} />
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>
                {"Ты вернулся к контролю "}
                <Text style={{ color: accent }}>{stats.totalSessions}</Text>
                {" раз"}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 104,
    gap: spacing.xl,
  },
  heading: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  chips: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: GLASS_BG,
  },
  chipActive: {
    borderColor: "rgba(255,255,255,0.30)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  chipLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  chipLabelActive: {
    color: "#EAF0F8",
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radius.lg,
    padding: spacing.xl,
    backgroundColor: GLASS_BG,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: "#EAF0F8",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "47%",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: GLASS_BG,
    gap: spacing.xs,
  },
  metricValue: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 44,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: GLASS_BG,
    alignItems: "center",
  },
  summaryText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});
