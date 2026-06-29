// Нативная заглушка: замер пульса через камеру реализован только в веб-версии.
import { StyleSheet, Text, View } from "react-native";

type Props = Readonly<{
  onFrame: (redAvg: number, fps: number) => void;
  onError: (msg: string) => void;
}>;

export function PulseCamera({ onError: _onError }: Props) {
  return (
    <View style={styles.stub}>
      <Text style={styles.text}>
        Замер пульса доступен в веб-версии Aire.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stub: {
    padding: 16,
    alignItems: "center",
  },
  text: {
    color: "#8892A4",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
});
