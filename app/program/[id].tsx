import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getProgramById } from "@/data/programs";
import { getPracticeById } from "@/data/breathingPractices";
import { useActiveProgram } from "@/features/programs/useActiveProgram";
import { editorial, editorialFont } from "@/theme/editorial";
import type { Href } from "expo-router";

export default function ProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { progress, currentDay, complete } = useActiveProgram();

  const program = getProgramById(id ?? "");

  if (!program) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.notFound}>Программа не найдена</Text>
      </View>
    );
  }

  const completedDays = progress?.programId === program.id ? progress.completedDays : [];
  const activeCurrent = progress?.programId === program.id ? currentDay : null;

  async function handleStartDay(day: number, practiceId: string) {
    router.push(`/session/${practiceId}` as Href);
    await complete(day);
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
        <Text style={styles.eyebrow}>{program.lengthDays} ДНЕЙ</Text>
        <Text style={styles.heading}>{program.title}</Text>
        <Text style={styles.sub}>{program.subtitle}</Text>

        <View style={styles.dayList}>
          {program.days.map((d) => {
            const practice = getPracticeById(d.practiceId);
            const isDone = completedDays.includes(d.day);
            const isCurrent = d.day === activeCurrent;
            const isFuture = !isDone && !isCurrent && activeCurrent !== null && d.day > activeCurrent;

            return (
              <Pressable
                key={d.day}
                style={({ pressed }) => [
                  styles.dayCard,
                  isDone && styles.dayCardDone,
                  isCurrent && styles.dayCardCurrent,
                  isFuture && styles.dayCardFuture,
                  pressed && !isFuture && styles.pressed,
                ]}
                onPress={() => {
                  if (!isFuture && practice) {
                    void handleStartDay(d.day, practice.id);
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={`День ${d.day}: ${practice?.title ?? d.practiceId}`}
                disabled={isFuture}
              >
                <View style={styles.dayNum}>
                  <Text style={[styles.dayNumText, isDone && styles.dayNumDone, isCurrent && styles.dayNumCurrent]}>
                    {isDone ? "✓" : String(d.day)}
                  </Text>
                </View>
                <View style={styles.dayBody}>
                  <Text style={[styles.dayTitle, isFuture && styles.textMuted]}>
                    {practice?.title ?? d.practiceId}
                  </Text>
                  <Text style={styles.dayFocus}>{d.focus}</Text>
                  {practice && !isFuture ? (
                    <Text style={styles.dayDuration}>
                      {Math.round(practice.durationSeconds / 60)} мин
                    </Text>
                  ) : null}
                </View>
                {isCurrent ? <Text style={styles.dayArrow}>→</Text> : null}
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
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  notFound: {
    fontFamily: editorialFont.sans,
    fontSize: 16,
    color: editorial.inkSoft,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  eyebrow: {
    fontFamily: editorialFont.sans,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: editorial.clay,
    marginBottom: 6,
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
  dayList: {
    gap: 10,
  },
  dayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: editorial.paperRaised,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: editorial.hairline,
    padding: 14,
  },
  dayCardDone: {
    opacity: 0.6,
  },
  dayCardCurrent: {
    borderColor: editorial.clay,
  },
  dayCardFuture: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
  dayNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: editorial.paper,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: editorial.hairline,
  },
  dayNumText: {
    fontFamily: editorialFont.sans,
    fontSize: 13,
    fontWeight: "700",
    color: editorial.inkSoft,
  },
  dayNumDone: {
    color: editorial.index,
  },
  dayNumCurrent: {
    color: editorial.clay,
  },
  dayBody: {
    flex: 1,
    gap: 2,
  },
  dayTitle: {
    fontFamily: editorialFont.sans,
    fontSize: 14,
    fontWeight: "700",
    color: editorial.ink,
    letterSpacing: -0.1,
  },
  dayFocus: {
    fontFamily: editorialFont.sans,
    fontSize: 12,
    color: editorial.inkSoft,
    lineHeight: 17,
  },
  dayDuration: {
    fontFamily: editorialFont.sans,
    fontSize: 11,
    color: editorial.index,
    marginTop: 2,
  },
  textMuted: {
    color: editorial.inkSoft,
  },
  dayArrow: {
    fontSize: 16,
    color: editorial.clay,
  },
});
