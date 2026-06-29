import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useActiveProgram } from "./useActiveProgram";
import { editorial, editorialFont } from "@/theme/editorial";

export function ProgramCard() {
  const router = useRouter();
  const { program, progress, currentDay, todayPractice, isLoading } = useActiveProgram();

  if (isLoading) return null;

  if (!program || !progress || currentDay === null) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => router.push("/programs")}
        accessibilityRole="button"
        accessibilityLabel="Выбрать программу"
      >
        <View style={styles.body}>
          <Text style={styles.eyebrow}>ПРОГРАММА</Text>
          <Text style={styles.title}>Выбери протокол</Text>
          <Text style={styles.sub}>7 или 14 дней — серия формирует привычку</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </Pressable>
    );
  }

  const totalDays = program.lengthDays;
  const completedCount = progress.completedDays.length;
  const dots = Array.from({ length: Math.min(totalDays, 10) }, (_, i) => i + 1);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/program/${program.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${program.title}, день ${currentDay} из ${totalDays}`}
    >
      <View style={styles.body}>
        <Text style={styles.eyebrow}>
          ПРОГРАММА · ДЕНЬ {currentDay} ИЗ {totalDays}
        </Text>
        <Text style={styles.title}>{program.title}</Text>
        {todayPractice ? (
          <Text style={styles.sub}>
            Сегодня: {todayPractice.title} · {Math.round(todayPractice.durationSeconds / 60)} мин
          </Text>
        ) : null}
        {totalDays <= 10 ? (
          <View style={styles.dots}>
            {dots.map((d) => (
              <View
                key={d}
                style={[
                  styles.dot,
                  progress.completedDays.includes(d) && styles.dotDone,
                  d === currentDay && styles.dotCurrent,
                ]}
              />
            ))}
          </View>
        ) : (
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.round((completedCount / totalDays) * 100)}%` },
              ]}
            />
          </View>
        )}
      </View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
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
    gap: 3,
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
  dots: {
    flexDirection: "row",
    gap: 5,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: editorial.hairline,
    borderWidth: 1,
    borderColor: editorial.index,
  },
  dotDone: {
    backgroundColor: editorial.index,
    borderColor: editorial.index,
  },
  dotCurrent: {
    backgroundColor: editorial.clay,
    borderColor: editorial.clay,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: editorial.hairline,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: editorial.clay,
  },
  arrow: {
    fontSize: 17,
    color: editorial.clay,
  },
});
