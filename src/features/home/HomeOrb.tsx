import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { colors } from "@/theme/tokens";

export function HomeOrb() {
  // Single master "breath" value (0 = contracted, 1 = expanded), eased like a real breath.
  const breath = useRef(new Animated.Value(0)).current;
  // Independent slow shimmer keeps the core feeling alive between breaths.
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const glint = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    glint.start();
    return () => {
      breathing.stop();
      glint.stop();
    };
  }, [breath, shimmer]);

  // Staggered depth: outer layers travel further than inner ones, creating a slow bloom.
  const glowScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.2] });
  const ring2Scale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.14] });
  const ring1Scale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.08] });
  const orbScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.04] });
  const fieldOpacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.95] });
  const coreOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });

  return (
    <View style={styles.wrap}>
      {/* Glow: scale only, no opacity. Shadow creates the halo. */}
      <Animated.View style={[styles.glow, { transform: [{ scale: glowScale }] }]} />
      <Animated.View
        style={[styles.ring2, { opacity: fieldOpacity, transform: [{ scale: ring2Scale }] }]}
      />
      <Animated.View
        style={[styles.ring1, { opacity: fieldOpacity, transform: [{ scale: ring1Scale }] }]}
      />
      <Animated.View
        style={[styles.orb, { opacity: coreOpacity, transform: [{ scale: orbScale }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 144,
    height: 144,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${colors.calm}0A`,
    shadowColor: colors.calm,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.90,
    shadowRadius: 70,
    elevation: 30,
  },
  ring2: {
    position: "absolute",
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 1,
    borderColor: `${colors.calm}22`,
    backgroundColor: "transparent",
  },
  ring1: {
    position: "absolute",
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1,
    borderColor: `${colors.calm}38`,
    backgroundColor: "transparent",
  },
  orb: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: `${colors.calm}55`,
    backgroundColor: "rgba(79,195,212,0.04)",
  },
});
