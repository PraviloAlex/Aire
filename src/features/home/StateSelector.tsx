import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { breathingPractices } from "@/data/breathingPractices";
import { HOME_STATE_ORDER, homeStateContent } from "@/features/home/homeStateContent";
import { editorial, editorialFont } from "@/theme/editorial";
import type { BreathingGoal } from "@/types/breathing";
import { getPracticeChoicesForState } from "@/utils/practiceFilters";

function hrefForGoal(goal: BreathingGoal): Href {
  return `/state/${goal}` as Href;
}

type GoalInfo = Readonly<{ minutes: string; cycle: string }>;

// Минуты + «рисунок» цикла дыхания (секунды фаз через ·, напр. 4·7·8).
function infoForGoal(goal: BreathingGoal): GoalInfo {
  const practice = getPracticeChoicesForState(breathingPractices, goal)[0];
  if (!practice) return { minutes: "", cycle: "" };
  const minutes = `${Math.max(1, Math.round(practice.durationSeconds / 60))} мин`;
  const cycle = practice.pattern.phases.map((phase) => phase.durationSeconds).join("·");
  return { minutes, cycle };
}

type StateRowProps = Readonly<{ goal: BreathingGoal }>;

function StateRow({ goal }: StateRowProps) {
  const content = homeStateContent[goal];
  const { minutes, cycle } = infoForGoal(goal);

  return (
    <Link href={hrefForGoal(goal)} asChild>
      <Pressable
        style={styles.item}
        accessibilityRole="button"
        accessibilityLabel={`${content.title}. ${content.subtitle}. Цикл ${cycle} секунд, ${minutes}`}
      >
        <View style={styles.main}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.sub}>{content.subtitle}</Text>
        </View>
        <View style={styles.metaCol}>
          {cycle ? <Text style={styles.cycle}>{cycle}</Text> : null}
          {minutes ? <Text style={styles.meta}>{minutes}</Text> : null}
        </View>
      </Pressable>
    </Link>
  );
}

export function StateSelector() {
  return (
    <View style={styles.wrap}>
      {HOME_STATE_ORDER.map((goal) => (
        <View key={goal}>
          <StateRow goal={goal} />
          <View style={styles.rule} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
  },
  rule: {
    height: 1,
    backgroundColor: editorial.hairline,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 6,
  },
  main: {
    flex: 1,
  },
  title: {
    fontFamily: editorialFont.serif,
    fontSize: 20,
    fontWeight: "400",
    color: editorial.ink,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  sub: {
    fontFamily: editorialFont.sans,
    fontSize: 11,
    color: editorial.inkSoft,
    marginTop: 1,
  },
  metaCol: {
    alignItems: "flex-end",
    gap: 3,
    paddingTop: 6,
  },
  cycle: {
    fontFamily: editorialFont.sans,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: editorial.clay,
  },
  meta: {
    fontFamily: editorialFont.sans,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: editorial.inkFaint,
  },
});
