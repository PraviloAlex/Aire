import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { learnArticles } from "@/data/learnArticles";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { MicroCard } from "@/features/learn/MicroCard";
import { homeScreenTones } from "@/theme/gradients";
import { colors, fontFamily, radius, spacing } from "@/theme/tokens";

const ALL = "Все";
const CATEGORIES = [ALL, ...Array.from(new Set(learnArticles.map((a) => a.category)))];

const GLASS_BG = "rgba(255,255,255,0.05)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

export default function LearnScreen() {
  const [cat, setCat] = useState(ALL);
  const articles = cat === ALL ? learnArticles : learnArticles.filter((a) => a.category === cat);

  return (
    <ScreenBackground
      id="learnBg"
      top={homeScreenTones.top}
      mid={homeScreenTones.mid}
      base={homeScreenTones.base}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.heading}>Уроки</Text>
          <Text style={styles.sub}>Коротко и по делу. Читай когда нужно.</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, cat === c && styles.chipActive]}
              onPress={() => setCat(c)}
              accessibilityRole="button"
            >
              <Text style={[styles.chipLabel, cat === c && styles.chipLabelActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {articles.map((article) => (
            <MicroCard key={article.id} article={article} />
          ))}
        </View>
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
  header: {
    gap: spacing.sm,
  },
  heading: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
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
  list: {
    gap: spacing.md,
  },
});
