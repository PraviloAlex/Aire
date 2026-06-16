import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getArticleById } from "@/data/learnArticles";
import { colors, radius, spacing, stateColors, typography } from "@/theme/tokens";
import type { BreathingGoal } from "@/types/breathing";

function isValidGoal(g: string | undefined): g is BreathingGoal {
  return g !== undefined && g in stateColors;
}

export default function CardRoute() {
  const { id, goal } = useLocalSearchParams<{ id: string; goal?: string }>();
  const article = getArticleById(id);
  const accent = isValidGoal(goal) ? stateColors[goal] : colors.focus;

  if (!article) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyTitle}>Карточка не найдена</Text>
        <Link href="/" asChild>
          <Pressable style={[styles.homeButton, { backgroundColor: colors.focus }]}>
            <Text style={styles.homeButtonText}>На главный</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.category, { color: accent }]}>
          {article.category.toUpperCase()} · {article.readingTime.toUpperCase()}
        </Text>
        <Text style={styles.title}>{article.title}</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: accent }]} />

      <Text style={styles.body}>{article.body}</Text>

      <Link href="/" asChild replace>
        <Pressable style={[styles.homeButton, { backgroundColor: accent }]}>
          <Text style={styles.homeButtonText}>На главный</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.xl,
    padding: spacing.xl,
    paddingBottom: 80,
    paddingTop: spacing.xxl,
  },
  emptyScreen: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  header: {
    gap: spacing.md,
  },
  category: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900",
    lineHeight: 40,
  },
  divider: {
    height: 2,
    width: 40,
    borderRadius: 1,
    opacity: 0.6,
  },
  body: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 28,
  },
  homeButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  homeButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "900",
  },
});
