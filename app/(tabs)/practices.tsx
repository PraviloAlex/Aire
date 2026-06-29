import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { situations } from "@/data/situations";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { SituationCard } from "@/features/situations/SituationCard";
import { homeScreenTones } from "@/theme/gradients";
import { colors, fontFamily, radius, spacing } from "@/theme/tokens";

export default function PracticesScreen() {
  return (
    <ScreenBackground
      id="situationsBg"
      top={homeScreenTones.top}
      mid={homeScreenTones.mid}
      base={homeScreenTones.base}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.heading}>Ситуации</Text>
          <Text style={styles.sub}>Реальные моменты. Реальная поддержка.</Text>
        </View>

        <Link href="/custom" asChild>
          <Pressable style={styles.customCard} accessibilityRole="button" accessibilityLabel="Свой ритм">
            <View style={styles.customIcon}>
              <Ionicons name="add" size={20} color="#06121F" />
            </View>
            <View style={styles.customTextWrap}>
              <Text style={styles.customTitle}>Свой ритм</Text>
              <Text style={styles.customSub}>Настройте вдох, выдох и задержки под себя</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </Link>

        <View style={styles.list}>
          {situations.map((situation) => (
            <SituationCard key={situation.id} situation={situation} />
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
  customCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  customIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.calm,
    alignItems: "center",
    justifyContent: "center",
  },
  customTextWrap: { flex: 1, gap: 2 },
  customTitle: { color: "#EAF0F8", fontSize: 16, fontWeight: "700" },
  customSub: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  list: {
    gap: spacing.md,
  },
});
