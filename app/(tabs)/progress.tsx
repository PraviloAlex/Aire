import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { useProgressStats } from "@/features/progress/useProgressStats";
import { homeScreenTones } from "@/theme/gradients";
import { colors, fontFamily, radius, spacing } from "@/theme/tokens";

const GLASS_BG = "rgba(255,255,255,0.055)";
const GLASS_BORDER = "rgba(255,255,255,0.10)";

export default function ProgressScreen() {
  const router = useRouter();
  const { stats, isLoading } = useProgressStats();

  const returnHome = () => {
    router.replace("/");
  };

  return (
    <ScreenBackground
      id="progressBg"
      top={homeScreenTones.top}
      mid={homeScreenTones.mid}
      base={homeScreenTones.base}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Progress update</Text>
        <Text style={styles.heading}>
          {stats.isFirstTime ? "Начни с одного спокойного шага" : "Шаг сохранен"}
        </Text>
        <Text style={styles.subheading}>
          {stats.isFirstTime
            ? "После первой сессии Aire покажет здесь короткий итог."
            : "Ты завершил практику. Этого достаточно на сегодня."}
        </Text>

        <View style={styles.card}>
          {isLoading ? (
            <Text style={styles.cardText}>Собираем итог...</Text>
          ) : stats.isFirstTime ? (
            <Text style={styles.cardText}>Вернись на главный экран и выбери состояние.</Text>
          ) : (
            <>
              <Text style={styles.cardTitle}>Ты вернулся к контролю</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{stats.totalSessions}</Text>
                  <Text style={styles.statLabel}>сессий всего</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{stats.totalMinutes}</Text>
                  <Text style={styles.statLabel}>минут практики</Text>
                </View>
              </View>
              <Text style={styles.cardText}>Маленький шаг. Лучше состояние. Лучше день.</Text>
            </>
          )}
        </View>

        <Pressable style={styles.homeButton} onPress={returnHome} accessibilityRole="button">
          <Text style={styles.homeButtonText}>На главный экран</Text>
        </Pressable>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  kicker: {
    color: colors.calm,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heading: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  subheading: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radius.xl,
    padding: spacing.xl,
    backgroundColor: GLASS_BG,
    gap: spacing.lg,
  },
  cardTitle: {
    color: "#EAF0F8",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  cardText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: GLASS_BORDER,
    paddingVertical: spacing.lg,
  },
  statBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  statDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: GLASS_BORDER,
    marginHorizontal: spacing.md,
  },
  statValue: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 44,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  homeButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.calm,
  },
  homeButtonText: {
    color: "#06121F",
    fontSize: 15,
    fontWeight: "800",
  },
});
