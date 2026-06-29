import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { situations } from "@/data/situations";
import { SituationCard } from "@/features/situations/SituationCard";
import { editorial, editorialFont } from "@/theme/editorial";

export default function PracticesScreen() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Назад">
          <Ionicons name="chevron-back" size={22} color={editorial.ink} />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.heading}>Ситуации</Text>
          <Text style={styles.sub}>Реальные моменты. Реальная поддержка.</Text>
        </View>

        <View style={styles.list}>
          {situations.map((situation) => (
            <SituationCard key={situation.id} situation={situation} />
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
  list: { gap: 12 },
});
