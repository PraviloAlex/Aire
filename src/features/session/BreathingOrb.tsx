import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { getOrbPhaseTarget } from "@/features/session/orbMotion";
import { stateOrbColors } from "@/theme/gradients";
import { stateColors } from "@/theme/tokens";
import type { BreathingGoal, BreathingPhaseName } from "@/types/breathing";

type BreathingOrbProps = Readonly<{
  goal: BreathingGoal;
  phaseName: BreathingPhaseName;
  durationSeconds: number;
  running: boolean;
  size?: number;
}>;

type OrbProfile = Readonly<{
  groupScale: [number, number];
  coreScale: [number, number];
  fieldOpacity: [number, number];
  glowOpacity: [number, number];
}>;

const ORB_PROFILES: Record<BreathingGoal, OrbProfile> = {
  calm: {
    groupScale: [0.9, 1.08],
    coreScale: [0.96, 1.03],
    fieldOpacity: [0.42, 0.72],
    glowOpacity: [0.16, 0.34],
  },
  focus: {
    groupScale: [0.92, 1.06],
    coreScale: [0.97, 1.02],
    fieldOpacity: [0.46, 0.76],
    glowOpacity: [0.14, 0.3],
  },
  fear: {
    groupScale: [0.9, 1.08],
    coreScale: [0.96, 1.03],
    fieldOpacity: [0.48, 0.78],
    glowOpacity: [0.18, 0.36],
  },
  recover: {
    groupScale: [0.91, 1.07],
    coreScale: [0.96, 1.025],
    fieldOpacity: [0.42, 0.7],
    glowOpacity: [0.14, 0.3],
  },
  sleep: {
    groupScale: [0.92, 1.055],
    coreScale: [0.97, 1.015],
    fieldOpacity: [0.34, 0.58],
    glowOpacity: [0.1, 0.24],
  },
  pain: {
    groupScale: [0.93, 1.05],
    coreScale: [0.98, 1.015],
    fieldOpacity: [0.32, 0.56],
    glowOpacity: [0.08, 0.2],
  },
  irritation: {
    groupScale: [0.9, 1.07],
    coreScale: [0.96, 1.025],
    fieldOpacity: [0.4, 0.7],
    glowOpacity: [0.12, 0.3],
  },
};

export function BreathingOrb({ goal, phaseName, durationSeconds, running, size = 184 }: BreathingOrbProps) {
  const accent = stateColors[goal];
  const tones = stateOrbColors[goal];
  const profile = ORB_PROFILES[goal];
  const breath = useRef(new Animated.Value(0)).current;
  const emphasis = useRef(new Animated.Value(0)).current;
  const coreOpacity = useRef(new Animated.Value(0.68)).current;

  useEffect(() => {
    const target = getOrbPhaseTarget(phaseName, running);
    const duration = target.isStill ? 520 : Math.max(600, durationSeconds * 1000);

    Animated.parallel([
      Animated.timing(breath, {
        toValue: target.breathTarget,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(emphasis, {
        toValue: target.emphasisTarget,
        duration: target.isStill ? 420 : duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(coreOpacity, {
        toValue: target.coreOpacityTarget,
        duration: 420,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [breath, coreOpacity, durationSeconds, emphasis, phaseName, running]);

  const groupScale = breath.interpolate({ inputRange: [0, 1], outputRange: profile.groupScale });
  const coreScale = breath.interpolate({ inputRange: [0, 1], outputRange: profile.coreScale });
  const fieldOpacity = emphasis.interpolate({ inputRange: [0, 1], outputRange: profile.fieldOpacity });
  const glowOpacity = emphasis.interpolate({ inputRange: [0, 1], outputRange: profile.glowOpacity });

  const outerSize = size;
  const coreSize = size * 0.92;

  const webGlow =
    Platform.OS === "web"
      ? ({
          boxShadow: `0 0 ${Math.round(size * 0.24)}px ${tones.glow}40`,
        } as any)
      : undefined;

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View
        style={[
          styles.breathGroup,
          {
            width: outerSize,
            height: outerSize,
            transform: [{ scale: groupScale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.glow,
            {
              width: coreSize * 1.3,
              height: coreSize * 1.3,
              borderRadius: (coreSize * 1.3) / 2,
              backgroundColor: `${accent}22`,
              opacity: glowOpacity,
            },
            webGlow,
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              borderColor: `${accent}28`,
              opacity: fieldOpacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.core,
            {
              width: coreSize,
              height: coreSize,
              borderRadius: coreSize / 2,
              borderColor: `${tones.core}4D`,
              backgroundColor: `${accent}18`,
              opacity: coreOpacity,
              transform: [{ scale: coreScale }],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
  },
  breathGroup: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  core: {
    position: "absolute",
    borderWidth: 1.5,
  },
});
