import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

type ScreenBackgroundProps = Readonly<{
  id: string;
  top: string;
  mid: string;
  base: string;
  children?: ReactNode;
}>;

export function ScreenBackground({ id, top, mid, base, children }: ScreenBackgroundProps) {
  const gradId = `${id}_g`;
  return (
    <View style={[styles.root, { backgroundColor: base }]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <RadialGradient id={gradId} cx="80%" cy="0%" r="65%">
            <Stop offset="0%" stopColor={top} />
            <Stop offset="45%" stopColor={mid} />
            <Stop offset="100%" stopColor={base} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
