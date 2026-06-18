import { StyleSheet, Text, View, type DimensionValue } from "react-native";
import { formatRemaining } from "@/features/session/formatTime";
import { spacing } from "@/theme/tokens";

type SessionProgressBarProps = Readonly<{
  progress: number;
  remainingSeconds: number;
  accent: string;
}>;

// Тонкая строка прогресса всей практики + оставшееся время. Не конкурирует с орбом:
// без фона/рамки, цвет заполнения — под текущее состояние.
export function SessionProgressBar({ progress, remainingSeconds, accent }: SessionProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const widthPercent: DimensionValue = `${Math.round(clamped * 100)}%`;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: widthPercent, backgroundColor: accent }]} />
      </View>
      <Text style={styles.remaining}>{formatRemaining(remainingSeconds)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    marginTop: spacing.md,
    gap: 6,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.09)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
  remaining: {
    alignSelf: "flex-end",
    color: "#8FA1B7",
    fontSize: 12,
    fontWeight: "600",
  },
});
