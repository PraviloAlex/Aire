import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { learnArticles } from "@/data/learnArticles";
import { MicroCard } from "@/features/learn/MicroCard";
import { editorial, editorialFont } from "@/theme/editorial";

const ALL = "Все";
const CATEGORIES = [ALL, ...Array.from(new Set(learnArticles.map((a) => a.category)))];

export default function LearnScreen() {
  const router = useRouter();
  const [cat, setCat] = useState(ALL);
  const articles = cat === ALL ? learnArticles : learnArticles.filter((a) => a.category === cat);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Назад">
          <Ionicons name="chevron-back" size={22} color={editorial.ink} />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.heading}>Уроки</Text>
          <Text style={styles.sub}>Коротко и по делу. Читай когда нужно.</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORIES.map((c) => {
            const active = cat === c;
            return (
              <Pressable key={c} style={[styles.chip, active ? styles.chipActive : null]} onPress={() => setCat(c)} accessibilityRole="button">
                <Text style={[styles.chipLabel, active ? styles.chipLabelActive : null]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.list}>
          {articles.map((article) => (
            <MicroCard key={article.id} article={article} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: editorial.paper },
  content: { paddingHorizontal: 24, paddingTop: 26, paddingBottom: 104, gap: 18 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  header: { gap: 6 },
  heading: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 30, lineHeight: 34 },
  sub: { color: editorial.inkSoft, fontSize: 14, lineHeight: 20 },
  chips: { gap: 8, paddingRight: 24 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: editorial.hairline,
    backgroundColor: editorial.paperRaised,
  },
  chipActive: { backgroundColor: editorial.clay, borderColor: editorial.clay },
  chipLabel: { color: editorial.inkSoft, fontSize: 13, fontWeight: "600" },
  chipLabelActive: { color: editorial.paper, fontWeight: "700" },
  list: { gap: 12 },
});
