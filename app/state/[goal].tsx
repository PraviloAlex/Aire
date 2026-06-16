import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect, useLocalSearchParams, type Href } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { breathingPractices, goalSubtitles } from "@/data/breathingPractices";
import { homeStateContent } from "@/features/home/homeStateContent";
import { editorial, editorialFont } from "@/theme/editorial";
import { stateColors } from "@/theme/tokens";
import type { BreathingGoal, BreathingPractice } from "@/types/breathing";
import { formatMinutes } from "@/utils/formatDuration";
import { getPracticeChoicesForState } from "@/utils/practiceFilters";

function isValidGoal(goal: string | undefined): goal is BreathingGoal {
  return goal !== undefined && goal in stateColors;
}

function cycleForPractice(practice: BreathingPractice): string {
  return practice.pattern.phases.map((phase) => phase.durationSeconds).join("·");
}

type ChoiceCardProps = Readonly<{
  goal: BreathingGoal;
  practice: BreathingPractice;
  index: number;
}>;

function ChoiceCard({ goal, practice, index }: ChoiceCardProps) {
  const accent = stateColors[goal];

  return (
    <Link href={`/session/${practice.id}` as Href} asChild>
      <Pressable
        style={({ pressed }) => [styles.choice, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${practice.title}. ${practice.subtitle}. Начать`}
      >
        <View style={styles.choiceCopy}>
          {index === 0 ? <Text style={[styles.badge, { color: accent }]}>Рекомендуем начать</Text> : null}
          <Text style={styles.choiceTitle}>{practice.title}</Text>
          <Text style={styles.choiceSub}>{practice.subtitle}</Text>
          <Text style={styles.summary}>{practice.summary}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={[styles.cycle, { color: accent }]}>{cycleForPractice(practice)}</Text>
          <Text style={styles.minutes}>{formatMinutes(practice.durationSeconds)}</Text>
          <Ionicons name="arrow-forward" size={17} color={accent} />
        </View>
      </Pressable>
    </Link>
  );
}

export default function StatePracticeChooserRoute() {
  const insets = useSafeAreaInsets();
  const { goal } = useLocalSearchParams<{ goal: string }>();

  if (!isValidGoal(goal)) {
    return <Redirect href="/" />;
  }

  const content = homeStateContent[goal];
  const choices = getPracticeChoicesForState(breathingPractices, goal);

  if (choices.length === 0) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) + 18 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Link href="/" asChild>
            <Pressable style={styles.back} accessibilityRole="button" accessibilityLabel="Назад">
              <Ionicons name="chevron-back" size={22} color={editorial.ink} />
            </Pressable>
          </Link>
          <Text style={styles.kicker}>Варианты дыхания</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.heading}>{content.title}</Text>
          <Text style={styles.sub}>{goalSubtitles[goal]}</Text>
        </View>

        <View style={styles.list}>
          {choices.map((practice, index) => (
            <ChoiceCard key={practice.id} goal={goal} practice={practice} index={index} />
          ))}
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
    paddingBottom: 36,
  },
  topRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10,
  },
  kicker: {
    fontFamily: editorialFont.sans,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: editorial.inkFaint,
  },
  header: {
    marginTop: 12,
    marginBottom: 20,
  },
  heading: {
    fontFamily: editorialFont.serif,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "400",
    color: editorial.ink,
    letterSpacing: -0.8,
  },
  sub: {
    fontFamily: editorialFont.sans,
    fontSize: 14,
    lineHeight: 21,
    color: editorial.inkSoft,
    marginTop: 8,
    maxWidth: 280,
  },
  list: {
    gap: 12,
  },
  choice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: editorial.hairline,
    paddingTop: 14,
    paddingBottom: 14,
  },
  pressed: {
    opacity: 0.62,
  },
  choiceCopy: {
    flex: 1,
  },
  badge: {
    fontFamily: editorialFont.sans,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  choiceTitle: {
    fontFamily: editorialFont.serif,
    fontSize: 23,
    lineHeight: 26,
    fontWeight: "400",
    color: editorial.ink,
    letterSpacing: -0.25,
  },
  choiceSub: {
    fontFamily: editorialFont.sans,
    fontSize: 12,
    lineHeight: 17,
    color: editorial.inkSoft,
    marginTop: 2,
  },
  summary: {
    fontFamily: editorialFont.sans,
    fontSize: 12,
    lineHeight: 18,
    color: editorial.inkSoft,
    marginTop: 8,
  },
  meta: {
    minWidth: 58,
    alignItems: "flex-end",
    gap: 5,
    paddingTop: 6,
  },
  cycle: {
    fontFamily: editorialFont.sans,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  minutes: {
    fontFamily: editorialFont.sans,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: editorial.inkFaint,
  },
});
