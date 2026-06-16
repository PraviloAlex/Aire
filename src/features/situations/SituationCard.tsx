import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { breathingPractices } from "@/data/breathingPractices";
import { getPracticeForSituation } from "@/data/situations";
import { StateOrb } from "@/features/common/StateOrb";
import { stateOrbColors } from "@/theme/gradients";
import { colors, fontFamily, radius, spacing, stateColors } from "@/theme/tokens";
import type { Situation } from "@/types/breathing";

type SituationCardProps = Readonly<{
  situation: Situation;
}>;

const webCardShadow =
  Platform.OS === "web"
    ? ({
        boxShadow: "0 4px 24px rgba(0,0,0,0.35), 0 1px 8px rgba(0,0,0,0.18)",
      } as any)
    : undefined;

export function SituationCard({ situation }: SituationCardProps) {
  const accent = stateColors[situation.goal];
  const practice = getPracticeForSituation(situation, breathingPractices);
  const href = (practice ? `/session/${practice.id}` : "/") as Href;

  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: `${accent}12`, borderColor: `${accent}2E` },
          webCardShadow,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${situation.label}. ${situation.sublabel}`}
      >
        <StateOrb
          size={38}
          colors={stateOrbColors[situation.goal]}
          icon={situation.icon as React.ComponentProps<typeof Ionicons>["name"]}
        />
        <View style={styles.copy}>
          <Text style={styles.label}>{situation.label}</Text>
          <Text style={styles.sublabel}>{situation.sublabel}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 15,
    fontWeight: "700",
  },
  sublabel: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
});
