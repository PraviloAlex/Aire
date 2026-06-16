import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";

type RippleMode = "ambient" | "breathing";

type WaterRippleProps = Readonly<{
  size: number;
  color: string;
  mode?: RippleMode;
  ringCount?: number;
  durationMs?: number; // ambient: период расхождения одного кольца
  inhaleMs?: number; // breathing
  holdMs?: number; // breathing
  exhaleMs?: number; // breathing
}>;

const USE_NATIVE_DRIVER = Platform.OS !== "web";

// Круги на воде — фирменный «дыхательный» акцент Aire. Два режима:
//  • ambient   — кольца расходятся из центра и тают (фоновый ритм покоя);
//  • breathing — вложенные кольца вместе расширяются на вдохе и сжимаются на выдохе.
export function WaterRipple(props: WaterRippleProps) {
  if (props.mode === "breathing") {
    return (
      <BreathingRings
        size={props.size}
        color={props.color}
        ringCount={props.ringCount ?? 3}
        inhaleMs={props.inhaleMs ?? 4000}
        holdMs={props.holdMs ?? 0}
        exhaleMs={props.exhaleMs ?? 4000}
      />
    );
  }
  return (
    <AmbientRipple
      size={props.size}
      color={props.color}
      ringCount={props.ringCount ?? 3}
      durationMs={props.durationMs ?? 5000}
    />
  );
}

type AmbientProps = Readonly<{ size: number; color: string; ringCount: number; durationMs: number }>;

function AmbientRipple({ size, color, ringCount, durationMs }: AmbientProps) {
  const progresses = useRef(
    Array.from({ length: ringCount }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const stagger = durationMs / ringCount;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const loops: Animated.CompositeAnimation[] = [];

    // Сдвиг старта на время — дальше период одинаковый, интервал между кольцами ровный.
    progresses.forEach((value, index) => {
      const timer = setTimeout(() => {
        const loop = Animated.loop(
          Animated.timing(value, {
            toValue: 1,
            duration: durationMs,
            easing: Easing.out(Easing.ease),
            useNativeDriver: USE_NATIVE_DRIVER,
          })
        );
        loops.push(loop);
        loop.start();
      }, index * stagger);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
      loops.forEach((loop) => loop.stop());
    };
  }, [progresses, durationMs, ringCount]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]} {...DECORATIVE}>
      {progresses.map((value, index) => {
        const scale = value.interpolate({ inputRange: [0, 1], outputRange: [0.12, 1] });
        const opacity = value.interpolate({
          inputRange: [0, 0.12, 1],
          outputRange: [0, 0.55, 0],
        });
        return (
          <Animated.View
            key={`ring-${index}`}
            style={[
              styles.ring,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderColor: color,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
      <View style={[styles.center, { backgroundColor: color }]} />
    </View>
  );
}

type BreathingProps = Readonly<{
  size: number;
  color: string;
  ringCount: number;
  inhaleMs: number;
  holdMs: number;
  exhaleMs: number;
}>;

function BreathingRings({ size, color, ringCount, inhaleMs, holdMs, exhaleMs }: BreathingProps) {
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: inhaleMs,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(holdMs),
        Animated.timing(breath, {
          toValue: 0,
          duration: exhaleMs,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(holdMs),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breath, inhaleMs, holdMs, exhaleMs]);

  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });

  return (
    <View style={[styles.wrap, { width: size, height: size }]} {...DECORATIVE}>
      <Animated.View style={[styles.group, { width: size, height: size, transform: [{ scale }] }]}>
        {Array.from({ length: ringCount }, (_unused, index) => {
          const factor = (index + 1) / ringCount;
          const ringSize = size * factor;
          return (
            <View
              key={`ring-${index}`}
              style={[
                styles.ring,
                {
                  width: ringSize,
                  height: ringSize,
                  borderRadius: ringSize / 2,
                  borderColor: color,
                  opacity: 0.7 - index * 0.2,
                },
              ]}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

const DECORATIVE = {
  pointerEvents: "none" as const,
  accessibilityElementsHidden: true,
  importantForAccessibility: "no-hide-descendants" as const,
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  group: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
  },
  center: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
