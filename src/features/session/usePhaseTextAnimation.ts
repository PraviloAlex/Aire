import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import type { BreathingPhaseName } from "@/types/breathing";

type UsePhaseTextAnimationArgs = Readonly<{
  isPreparing: boolean;
  phaseKey: string;
  currentPhaseName: BreathingPhaseName;
  currentPhaseDurationSeconds: number;
}>;

type PhaseTextAnimation = Readonly<{
  textScale: Animated.Value;
  textOpacity: Animated.Value;
}>;

/**
 * Анимация центрального текста фазы: лёгкое масштабирование под фазу
 * (вдох/задержка — растёт, выдох/пауза — сжимается) + мягкий crossfade
 * при смене фазы. Орб не трогает.
 */
export function usePhaseTextAnimation({
  isPreparing,
  phaseKey,
  currentPhaseName,
  currentPhaseDurationSeconds,
}: UsePhaseTextAnimationArgs): PhaseTextAnimation {
  const textScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const scaleAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const fadeAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPreparing) return;

    const toValue =
      currentPhaseName === "inhale" || currentPhaseName === "sigh" || currentPhaseName === "hold"
        ? 1.02
        : 0.98;

    scaleAnimRef.current?.stop();
    scaleAnimRef.current = Animated.timing(textScale, {
      toValue,
      duration: currentPhaseDurationSeconds * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
    scaleAnimRef.current.start();

    // Crossfade: текст новой фазы мягко проявляется (~300ms).
    fadeAnimRef.current?.stop();
    textOpacity.setValue(0);
    fadeAnimRef.current = Animated.timing(textOpacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
    fadeAnimRef.current.start();
  }, [phaseKey, isPreparing, currentPhaseName, currentPhaseDurationSeconds, textScale, textOpacity]);

  return { textScale, textOpacity };
}
