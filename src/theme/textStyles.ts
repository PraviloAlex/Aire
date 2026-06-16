import type { TextStyle } from "react-native";
import { colors, fontFamily } from "./tokens";

export const textStyles: {
  screenHeading: TextStyle;
  sectionHeading: TextStyle;
  cardTitle: TextStyle;
  body: TextStyle;
  caption: TextStyle;
} = {
  screenHeading: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  sectionHeading: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  cardTitle: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    fontFamily: fontFamily.body,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily.body,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
};
