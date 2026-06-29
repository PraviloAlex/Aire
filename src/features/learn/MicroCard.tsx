import { useRouter, type Href } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { editorial, editorialFont } from "@/theme/editorial";
import type { LearnArticle } from "@/types/breathing";

type MicroCardProps = Readonly<{
  article: LearnArticle;
}>;

const webShadow =
  Platform.OS === "web" ? ({ boxShadow: "0 4px 16px rgba(33,29,24,0.08)" } as object) : undefined;

export function MicroCard({ article }: MicroCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, webShadow, pressed ? styles.pressed : null]}
      onPress={() => router.push(`/card/${article.id}` as Href)}
      accessibilityRole="button"
      accessibilityLabel={article.title}
    >
      <View style={styles.metaRow}>
        <View style={styles.dot} />
        <Text style={styles.category}>{article.category.toUpperCase()}</Text>
        <Text style={styles.readingTime}>{article.readingTime}</Text>
      </View>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.body} numberOfLines={2}>{article.body}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    borderWidth: 1,
    borderColor: editorial.hairline,
    borderRadius: 16,
    padding: 16,
    backgroundColor: editorial.paperRaised,
  },
  pressed: { opacity: 0.7 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: editorial.clay },
  category: { flex: 1, color: editorial.inkFaint, fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  readingTime: { color: editorial.inkFaint, fontSize: 12, fontWeight: "600" },
  title: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: editorialFont.sans, color: editorial.inkSoft, fontSize: 13, lineHeight: 18 },
});
