import { useCallback, useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

type UseTapHintAnimationArgs = Readonly<{
  isRunning: boolean;
  isPreparing: boolean;
}>;

type TapHintAnimation = Readonly<{
  hintOpacity: Animated.Value;
  hideHint: () => void;
}>;

/**
 * Разовый хинт «коснись, чтобы пауза»: показывается один раз в начале
 * сессии и плавно гаснет. `hideHint` мгновенно скрывает его (например,
 * когда пользователь сам ставит паузу).
 */
export function useTapHintAnimation({ isRunning, isPreparing }: UseTapHintAnimationArgs): TapHintAnimation {
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const hintAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const hintShownRef = useRef(false);

  useEffect(() => {
    if (isRunning && !isPreparing && !hintShownRef.current) {
      hintShownRef.current = true;
      hintOpacity.setValue(1);
      hintAnimRef.current = Animated.sequence([
        Animated.delay(3200),
        Animated.timing(hintOpacity, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]);
      hintAnimRef.current.start();
    }
    return () => hintAnimRef.current?.stop();
  }, [isRunning, isPreparing, hintOpacity]);

  const hideHint = useCallback(() => {
    hintOpacity.setValue(0);
  }, [hintOpacity]);

  return { hintOpacity, hideHint };
}
