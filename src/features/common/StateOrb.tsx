import { Ionicons } from "@expo/vector-icons";
import { useId } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import type { OrbColors } from "@/theme/gradients";

type IconName = keyof typeof Ionicons.glyphMap;

type StateOrbProps = Readonly<{
  size: number;
  colors: OrbColors;
  icon?: IconName;
  iconColor?: string;
}>;

// Светящаяся точка: яркий центр → цвет состояния → прозрачность.
// Никакого тёмного «ободка» — орб растворяется в фоне.
export function StateOrb({ size, colors, icon, iconColor }: StateOrbProps) {
  const uid = useId().replace(/:/g, "");
  const c = size / 2;
  const r = size * 0.46;

  const webGlow =
    Platform.OS === "web"
      ? ({
          borderRadius: c,
          boxShadow: `0 0 ${Math.round(size * 0.7)}px ${colors.glow}55`,
        } as any)
      : undefined;

  return (
    <View
      style={[
        { width: size, height: size, alignItems: "center", justifyContent: "center" },
        webGlow,
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`orb-${uid}`} cx="50%" cy="42%" r="55%">
            <Stop offset="0%" stopColor={colors.core} stopOpacity={1} />
            <Stop offset="42%" stopColor={colors.mid} stopOpacity={0.92} />
            <Stop offset="74%" stopColor={colors.glow} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={colors.glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={c} cy={c} r={r} fill={`url(#orb-${uid})`} />
      </Svg>
      {icon ? (
        <View style={styles.iconWrap} pointerEvents="none">
          <Ionicons name={icon} size={Math.round(size * 0.3)} color={iconColor ?? "#0A0F18"} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
