import { Pressable, StyleSheet, View } from "react-native";
import { editorial } from "@/theme/editorial";

type ToggleProps = Readonly<{
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
}>;

// Переключатель на editorial-токенах. Заменяет нативный <Switch>, который на
// web/iOS перебивает trackColor системным (зелёным) акцентом в положении ON.
export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 46, height: 28, borderRadius: 14, padding: 3, justifyContent: "center" },
  trackOn: { backgroundColor: editorial.clay },
  trackOff: { backgroundColor: editorial.hairline },
  thumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: editorial.paperRaised },
  thumbOn: { alignSelf: "flex-end" },
  thumbOff: { alignSelf: "flex-start" },
});
