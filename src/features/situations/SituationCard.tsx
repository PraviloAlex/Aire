import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { breathingPractices } from "@/data/breathingPractices";
import { getPracticeForSituation } from "@/data/situations";
import { editorial, editorialFont } from "@/theme/editorial";
import type { Situation } from "@/types/breathing";

type SituationCardProps = Readonly<{
  situation: Situation;
}>;

export function SituationCard({ situation }: SituationCardProps) {
  const practice = getPracticeForSituation(situation, breathingPractices);
  const href = (practice ? `/session/${practice.id}` : "/") as Href;

  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel={`${situation.label}. ${situation.sublabel}`}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={situation.icon as ComponentProps<typeof Ionicons>["name"]} size={18} color={editorial.clay} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>{situation.label}</Text>
          <Text style={styles.sublabel}>{situation.sublabel}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={editorial.inkFaint} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: editorial.hairline,
    backgroundColor: editorial.paperRaised,
  },
  pressed: { opacity: 0.7 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(192,87,58,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: 3 },
  label: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 16 },
  sublabel: { fontFamily: editorialFont.sans, color: editorial.inkSoft, fontSize: 12, lineHeight: 17 },
});
