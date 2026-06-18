import { StyleSheet, Text, View, type DimensionValue } from "react-native";
import { formatRemaining } from "@/features/session/formatTime";

type SessionProgressBarProps = Readonly<{
  progress: number;
  remainingSeconds: number;
  accent: string;
}>;

// Капсула «прогресс + время» в одном пилюле-контейнере. Живёт в верхней строке
// рядом с крестиком: всё мета-инфо собрано в один объект, ничего не висит отдельно.
export function SessionProgressBar({ progress, remainingSeconds, accent }: SessionProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const widthPercent: DimensionValue = `${Math.round(clamped * 100)}%`;

  return (
    <View style={styles.capsule}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: widthPercent, backgroundColor: accent }]} />
      </View>
      <Text style={styles.time}>{formatRemaining(remainingSeconds)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  capsule: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  track: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
  time: {
    color: "#9FB0C2",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },
});
