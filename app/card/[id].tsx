import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getArticleById } from "@/data/learnArticles";
import { editorial, editorialFont } from "@/theme/editorial";

export default function CardRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = getArticleById(id);

  if (!article) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyTitle}>Карточка не найдена</Text>
        <Link href="/" asChild>
          <Pressable style={styles.homeButton}>
            <Text style={styles.homeButtonText}>На главный</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.category}>
          {article.category.toUpperCase()} · {article.readingTime.toUpperCase()}
        </Text>
        <Text style={styles.title}>{article.title}</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.body}>{article.body}</Text>

      <Link href="/" asChild replace>
        <Pressable style={styles.homeButton}>
          <Text style={styles.homeButtonText}>На главный</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: editorial.paper },
  content: { gap: 20, padding: 24, paddingBottom: 80, paddingTop: 40 },
  emptyScreen: { flex: 1, justifyContent: "center", gap: 16, padding: 24, backgroundColor: editorial.paper },
  emptyTitle: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 26 },
  header: { gap: 12 },
  category: { color: editorial.clay, fontSize: 12, fontWeight: "700", letterSpacing: 1.5 },
  title: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 32, lineHeight: 38 },
  divider: { height: 2, width: 40, borderRadius: 1, backgroundColor: editorial.clay, opacity: 0.7 },
  body: { fontFamily: editorialFont.sans, color: editorial.ink, fontSize: 15, lineHeight: 26 },
  homeButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: editorial.clay,
    marginTop: 8,
  },
  homeButtonText: { color: editorial.paper, fontSize: 15, fontWeight: "700" },
});
