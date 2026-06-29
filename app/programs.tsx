import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { programs } from "@/data/programs";
import { useActiveProgram } from "@/features/programs/useActiveProgram";
import { editorial, editorialFont } from "@/theme/editorial";

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { start, program: activeProgram } = useActiveProgram();

  async function handleStart(programId: string) {
    await start(programId);
    router.back();
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 16) + 14 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Программы</Text>
        <Text style={styles.sub}>
          Выбери протокол и делай одну практику в день.
        </Text>

        <View style={styles.list}>
          {programs.map((p) => {
            const isActive = activeProgram?.id === p.id;
            return (
              <Pressable
                key={p.id}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressed,
                  isActive && styles.cardActive,
                ]}
                onPress={() => (isActive ? router.push(`/program/${p.id}`) : handleStart(p.id))}
                accessibilityRole="button"
                accessibilityLabel={p.title}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardEyebrow}>{p.lengthDays} ДНЕЙ</Text>
                  {isActive ? (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>Активна</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.cardSub}>{p.subtitle}</Text>
                <View style={styles.cardCta}>
                  <Text style={styles.cardCtaText}>
                    {isActive ? "Продолжить →" : "Начать протокол →"}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: editorial.paper,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  heading: {
    fontFamily: editorialFont.serif,
    fontSize: 32,
    fontWeight: "300",
    color: editorial.ink,
    letterSpacing: -1,
    marginBottom: 6,
  },
  sub: {
    fontFamily: editorialFont.sans,
    fontSize: 14,
    color: editorial.inkSoft,
    lineHeight: 20,
    marginBottom: 24,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: editorial.paperRaised,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: editorial.hairline,
    padding: 20,
    gap: 4,
  },
  cardActive: {
    borderColor: editorial.clay,
  },
  pressed: {
    opacity: 0.82,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardEyebrow: {
    fontFamily: editorialFont.sans,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: editorial.clay,
  },
  activePill: {
    backgroundColor: editorial.clay,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  activePillText: {
    fontFamily: editorialFont.sans,
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontFamily: editorialFont.sans,
    fontSize: 18,
    fontWeight: "700",
    color: editorial.ink,
    letterSpacing: -0.3,
  },
  cardSub: {
    fontFamily: editorialFont.sans,
    fontSize: 13,
    color: editorial.inkSoft,
    lineHeight: 18,
    marginTop: 2,
  },
  cardCta: {
    marginTop: 12,
  },
  cardCtaText: {
    fontFamily: editorialFont.sans,
    fontSize: 13,
    fontWeight: "700",
    color: editorial.clay,
    letterSpacing: 0.3,
  },
});
