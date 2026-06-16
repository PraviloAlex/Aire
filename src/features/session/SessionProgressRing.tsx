import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type SessionProgressRingProps = Readonly<{
  size: number;
  progress: number;
  color: string;
  strokeWidth?: number;
}>;

export function SessionProgressRing({
  size,
  progress,
  color,
  strokeWidth = 3,
}: SessionProgressRingProps) {
  const cx = size / 2;
  const r = cx - strokeWidth * 2;
  const circumference = 2 * Math.PI * r;
  const animatedProgress = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [animatedProgress, progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ position: "absolute", width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={cx}
          cy={cx}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={cx}
          originY={cx}
        />
      </Svg>
    </View>
  );
}
