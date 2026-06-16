import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getPracticeById } from "@/data/breathingPractices";
import { BreathingSessionScreen } from "@/features/session/BreathingSessionScreen";
import { colors, radius, spacing } from "@/theme/tokens";

export default function SessionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const practice = getPracticeById(id);

  if (!practice) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Сессия не найдена</Text>
        <Text style={styles.copy}>Выберите практику из каталога и запустите ее снова.</Text>
        <Link href="/practices" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Открыть практики</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return <BreathingSessionScreen practice={practice} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.background
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900"
  },
  copy: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24
  },
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.text
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "900"
  }
});
