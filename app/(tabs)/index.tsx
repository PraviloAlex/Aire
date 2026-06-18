import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WaterRipple } from "@/features/common/WaterRipple";
import { ContinueCard } from "@/features/home/ContinueCard";
import { SosBar } from "@/features/home/SosBar";
import { StateSelector } from "@/features/home/StateSelector";
import { usePersonalization } from "@/features/home/usePersonalization";
import { editorial, editorialFont } from "@/theme/editorial";

const DAYS_RU = [
  "Воскресенье", "Понедельник", "Вторник",
  "Среда", "Четверг", "Пятница", "Суббота",
] as const;

function partOfDay(hour: number): string {
  if (hour < 5) return "ночь";
  if (hour < 12) return "утро";
  if (hour < 17) return "день";
  if (hour < 22) return "вечер";
  return "ночь";
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { hasHistory, lastPracticeId } = usePersonalization();
  const now = new Date();
  const eyebrow = `${DAYS_RU[now.getDay()]} · ${partOfDay(now.getHours())}`;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) + 14 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <View style={styles.streak}>
            <View style={styles.streakDot} />
            <Text style={styles.streakNum}>0</Text>
            <Text style={styles.streakLabel}>дней</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.orbBg} pointerEvents="none">
            <WaterRipple size={168} color={editorial.clay} mode="breathing" />
          </View>
          <Text style={styles.heroHeading}>
            Как ты{"\n"}
            <Text style={styles.heroEm}>сейчас?</Text>
          </Text>
          <Text style={styles.heroSub}>
            Выбери состояние и начинай дышать.
          </Text>
        </View>

        {hasHistory && lastPracticeId ? (
          <ContinueCard practiceId={lastPracticeId} />
        ) : null}
        <StateSelector />
      </ScrollView>
      <SosBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: editorial.paper,
  },
  content: {
    paddingHorizontal: 26,
    paddingBottom: 190,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontFamily: editorialFont.sans,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: editorial.inkFaint,
  },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  streakDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: editorial.clay,
  },
  streakNum: {
    fontFamily: editorialFont.sans,
    fontSize: 12,
    fontWeight: "700",
    color: editorial.ink,
  },
  streakLabel: {
    fontFamily: editorialFont.sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: editorial.inkFaint,
  },
  hero: {
    marginTop: 8,
    position: "relative",
  },
  orbBg: {
    position: "absolute",
    top: 2,
    right: 16,
    opacity: 0.85,
    zIndex: 0,
  },
  heroHeading: {
    fontFamily: editorialFont.serif,
    fontSize: 48,
    lineHeight: 48,
    fontWeight: "300",
    color: editorial.ink,
    letterSpacing: -1.5,
    marginTop: 18,
    zIndex: 1,
  },
  heroEm: {
    fontStyle: "italic",
    fontWeight: "400",
  },
  heroSub: {
    fontFamily: editorialFont.sans,
    fontSize: 14,
    color: editorial.inkSoft,
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 230,
    zIndex: 1,
  },
});
