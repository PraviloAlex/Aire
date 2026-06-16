import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StateOrb } from "@/features/common/StateOrb";
import { stateOrbColors } from "@/theme/gradients";
import { colors, radius, spacing } from "@/theme/tokens";
import type { LearnArticle } from "@/types/breathing";

type MicroCardProps = Readonly<{
  article: LearnArticle;
}>;

const GLASS_BG = "rgba(255,255,255,0.05)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

export function MicroCard({ article }: MicroCardProps) {
  const primaryGoal = article.goals[0];
  const orbColors = primaryGoal ? stateOrbColors[primaryGoal] : stateOrbColors.calm;

  return (
    <Link href={`/card/${article.id}` as Href} asChild>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="link"
        accessibilityLabel={article.title}
      >
        <View style={styles.header}>
          <StateOrb size={36} colors={orbColors} />
          <View style={styles.meta}>
            <Text style={styles.category}>{article.category.toUpperCase()}</Text>
            <Text style={styles.readingTime}>{article.readingTime}</Text>
          </View>
        </View>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.body} numberOfLines={2}>
          {article.body}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: GLASS_BG,
  },
  cardPressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  meta: {
    flex: 1,
    gap: 3,
  },
  category: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  readingTime: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#EAF0F8",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  body: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
