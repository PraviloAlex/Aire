import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useProgressStats } from "@/features/progress/useProgressStats";
import { editorial, editorialFont } from "@/theme/editorial";

export default function ProgressScreen() {
  const router = useRouter();
  const { stats, isLoading } = useProgressStats();

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Назад">
          <Ionicons name="chevron-back" size={22} color={editorial.ink} />
        </Pressable>

        <Text style={styles.eyebrow}>ПРОГРЕСС</Text>
        <Text style={styles.heading}>{stats.isFirstTime ? "Начни с одного спокойного шага" : "Шаг сохранён"}</Text>
        <Text style={styles.sub}>
          {stats.isFirstTime
            ? "После первой сессии Aire покажет здесь короткий итог."
            : "Ты завершил практику. Этого достаточно на сегодня."}
        </Text>

        <View style={styles.card}>
          {isLoading ? (
            <Text style={styles.cardText}>Собираем итог…</Text>
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

        <Pressable style={styles.homeButton} onPress={() => router.replace("/")} accessibilityRole="button" accessibilityLabel="На главный экран">
          <Text style={styles.homeButtonText}>На главный экран</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: editorial.paper },
  content: { paddingHorizontal: 24, paddingTop: 26, paddingBottom: 104, gap: 14 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginLeft: -8, marginBottom: 2 },
  eyebrow: { color: editorial.inkFaint, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  heading: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 32, lineHeight: 36 },
  sub: { color: editorial.inkSoft, fontSize: 14, lineHeight: 20, marginBottom: 4 },
  card: { backgroundColor: editorial.paperRaised, borderRadius: 16, padding: 20, gap: 16 },
  cardTitle: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 19, lineHeight: 24 },
  cardText: { color: editorial.inkSoft, fontSize: 14, lineHeight: 21 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: editorial.hairline,
    paddingVertical: 16,
  },
  statBlock: { flex: 1, gap: 4 },
  statDivider: { width: 1, alignSelf: "stretch", backgroundColor: editorial.hairline, marginHorizontal: 12 },
  statValue: { fontFamily: editorialFont.serif, color: editorial.clay, fontSize: 38, lineHeight: 42 },
  statLabel: { color: editorial.inkFaint, fontSize: 12, fontWeight: "700", lineHeight: 16 },
  homeButton: { alignItems: "center", justifyContent: "center", minHeight: 52, borderRadius: 12, backgroundColor: editorial.clay, marginTop: 4 },
  homeButtonText: { color: editorial.paper, fontSize: 15, fontWeight: "700" },
});
