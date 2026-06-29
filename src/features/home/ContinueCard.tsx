import { Link, type Href } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { getPracticeById } from "@/data/breathingPractices";
import { editorial, editorialFont } from "@/theme/editorial";

type ContinueCardProps = Readonly<{
  practiceId: string;
}>;

const webShadow =
  Platform.OS === "web"
    ? ({ boxShadow: "0 4px 16px rgba(33,29,24,0.10)" } as object)
    : undefined;

export function ContinueCard({ practiceId }: ContinueCardProps) {
  const practice = getPracticeById(practiceId);
  if (!practice) return null;

  const href = `/session/${practice.id}` as Href;
  const eyebrow = "Продолжить";

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${eyebrow}: ${practice.title}`}
      >
        {({ pressed }) => (
          <View style={[styles.card, webShadow, pressed && styles.pressed]}>
            <View style={styles.body}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={styles.title}>{practice.title}</Text>
              <Text style={styles.sub}>{practice.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: editorial.paperRaised,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: editorial.hairline,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.82,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontFamily: editorialFont.sans,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: editorial.clay,
  },
  title: {
    fontFamily: editorialFont.sans,
    fontSize: 15,
    fontWeight: "700",
    color: editorial.ink,
    letterSpacing: -0.1,
    marginTop: 2,
  },
  sub: {
    fontFamily: editorialFont.sans,
    fontSize: 12,
    color: editorial.inkSoft,
    marginTop: 1,
  },
  arrow: {
    fontSize: 17,
    color: editorial.clay,
  },
});
