import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { radius } from "@/theme/tokens";

type SceneTone = "calm" | "focus" | "fear" | "recover" | "sleep";

type StateMiniSceneProps = Readonly<{
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: SceneTone;
}>;

const toneLayout: Record<SceneTone, { orbLeft: number; iconLeft: number; bandOpacity: number }> = {
  calm: { orbLeft: 50, iconLeft: 62, bandOpacity: 0.34 },
  focus: { orbLeft: 72, iconLeft: 78, bandOpacity: 0.28 },
  fear: { orbLeft: 34, iconLeft: 54, bandOpacity: 0.38 },
  recover: { orbLeft: 58, iconLeft: 70, bandOpacity: 0.30 },
  sleep: { orbLeft: 76, iconLeft: 82, bandOpacity: 0.32 },
};

export function StateMiniScene({ accent, icon, tone }: StateMiniSceneProps) {
  const layout = toneLayout[tone];

  return (
    <View style={[styles.scene, { borderColor: `${accent}42`, backgroundColor: `${accent}16` }]}>
      <View style={[styles.backBand, { backgroundColor: `${accent}20`, opacity: layout.bandOpacity }]} />
      <View style={[styles.orbGlow, { backgroundColor: `${accent}26`, left: layout.orbLeft }]} />
      <View style={[styles.orbCore, { backgroundColor: `${accent}2E`, left: layout.orbLeft + 22 }]} />
      <View style={[styles.iconDisc, { backgroundColor: `${accent}24`, left: layout.iconLeft }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    height: 48,
    overflow: "hidden",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  backBand: {
    position: "absolute",
    left: -12,
    right: -12,
    top: 9,
    height: 30,
    borderRadius: radius.pill,
  },
  orbGlow: {
    position: "absolute",
    top: -14,
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  orbCore: {
    position: "absolute",
    top: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  iconDisc: {
    position: "absolute",
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
