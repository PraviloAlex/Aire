import { ScrollView, StyleSheet, Text, View } from "react-native";
import { situations } from "@/data/situations";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { SituationCard } from "@/features/situations/SituationCard";
import { homeScreenTones } from "@/theme/gradients";
import { colors, fontFamily, spacing } from "@/theme/tokens";

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
  list: {
    gap: spacing.md,
  },
});
