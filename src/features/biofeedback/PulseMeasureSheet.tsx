import { useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { radius, spacing } from "@/theme/tokens";
import { PulseCamera } from "./PulseCamera";
import { usePulseMeasurement } from "./usePulseMeasurement";

const ACCENT = "#4FC3D4";
const BG = "#06121F";
const SURFACE = "rgba(255,255,255,0.06)";
const BORDER = "rgba(255,255,255,0.10)";
const TEXT = "#E8EAF0";
const MUTED = "#8892A4";

type Props = Readonly<{
  visible: boolean;
  onDone: (bpm: number | null) => void;
  onClose: () => void;
}>;

export function PulseMeasureSheet({ visible, onDone, onClose }: Props) {
  const { phase, progress, reading, errorMsg, start, cancel, handleFrame, handleError } =
    usePulseMeasurement();

  // Сброс состояния при каждом открытии шита
  useEffect(() => {
    if (visible) cancel();
  }, [visible, cancel]);

  const handleDone = () => {
    onDone(reading?.bpm ?? null);
    cancel();
  };

  const handleClose = () => {
    cancel();
    onClose();
  };

  const handleRetry = () => {
    cancel();
    start();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Закрыть">
            <Text style={styles.closeBtnLabel}>✕</Text>
          </Pressable>
          <Text style={styles.title}>Замер пульса</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Камера (скрытая, web-only) */}
        {phase === "measuring" && (
          <PulseCamera onFrame={handleFrame} onError={handleError} />
        )}

        {/* Контент */}
        <View style={styles.body}>
          {phase === "idle" && (
            <>
              <Text style={styles.icon}>♥</Text>
              <Text style={styles.instruction}>
                Приложи указательный палец к задней камере вплотную.
              </Text>
              <Text style={styles.note}>
                Держи руку неподвижно 25 секунд. Можно прикрыть вспышку.
              </Text>
            </>
          )}

          {phase === "measuring" && (
            <>
              <Text style={styles.progressPercent}>
                {Math.round(progress * 100)}%
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { flex: Math.max(0.001, progress) }]} />
                {progress < 0.999 && <View style={{ flex: Math.max(0.001, 1 - progress) }} />}
              </View>
              <Text style={styles.instruction}>Держи палец неподвижно…</Text>
            </>
          )}

          {phase === "done" && reading && (
            <View style={styles.resultBlock}>
              {reading.bpm !== null ? (
                <>
                  <View style={styles.bpmRow}>
                    <Text style={styles.bpmValue}>{reading.bpm}</Text>
                    <Text style={styles.bpmUnit}>уд/мин</Text>
                  </View>
                  <Text style={styles.qualityLabel}>
                    {reading.quality === "good"
                      ? "Хороший сигнал"
                      : "Слабый сигнал — приложи плотнее"}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.noSignal}>Не удалось измерить</Text>
                  <Text style={styles.qualityLabel}>
                    Приложи палец плотнее и попробуй ещё раз
                  </Text>
                </>
              )}
            </View>
          )}

          {phase === "error" && (
            <View style={styles.resultBlock}>
              <Text style={styles.noSignal}>Камера недоступна</Text>
              <Text style={styles.qualityLabel}>
                {errorMsg ?? "Проверь разрешения браузера"}
              </Text>
            </View>
          )}
        </View>

        {/* Действия */}
        <View style={styles.actions}>
          {phase === "idle" && (
            <Pressable style={styles.primaryBtn} onPress={start} accessibilityRole="button">
              <Text style={styles.primaryLabel}>Начать замер</Text>
            </Pressable>
          )}

          {(phase === "done" || phase === "error") && (
            <>
              <Pressable style={styles.primaryBtn} onPress={handleDone} accessibilityRole="button">
                <Text style={styles.primaryLabel}>
                  {reading?.bpm != null ? "Принять" : "Пропустить"}
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={handleRetry} accessibilityRole="button">
                <Text style={styles.secondaryLabel}>Повторить</Text>
              </Pressable>
            </>
          )}

          <Text style={styles.disclaimer}>
            Оценка, не медицинское измерение. Данные не покидают устройство.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xxl,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnLabel: {
    color: MUTED,
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 36,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    fontSize: 56,
    color: ACCENT,
    lineHeight: 68,
  },
  instruction: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
  },
  note: {
    color: MUTED,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  progressPercent: {
    color: ACCENT,
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 56,
  },
  progressTrack: {
    width: "100%",
    maxWidth: 280,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: SURFACE,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
  },
  progressFill: {
    backgroundColor: ACCENT,
    borderRadius: radius.pill,
  },
  resultBlock: {
    alignItems: "center",
    gap: spacing.md,
  },
  bpmRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  bpmValue: {
    color: ACCENT,
    fontSize: 72,
    fontWeight: "700",
    lineHeight: 80,
  },
  bpmUnit: {
    color: MUTED,
    fontSize: 16,
    fontWeight: "600",
    paddingBottom: 12,
  },
  qualityLabel: {
    color: MUTED,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  noSignal: {
    color: TEXT,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  actions: {
    gap: spacing.md,
    alignItems: "center",
  },
  primaryBtn: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 17,
    borderRadius: radius.pill,
    backgroundColor: ACCENT,
  },
  primaryLabel: {
    color: "#06121F",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryBtn: {
    paddingVertical: spacing.sm,
  },
  secondaryLabel: {
    color: MUTED,
    fontSize: 15,
    fontWeight: "600",
  },
  disclaimer: {
    color: MUTED,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
});
