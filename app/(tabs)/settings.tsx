import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { useSettings } from "@/features/settings/SettingsContext";
import { homeScreenTones } from "@/theme/gradients";
import { colors, fontFamily, radius, spacing } from "@/theme/tokens";
import type { CenterDisplayMode, OrbStyle } from "@/types/breathing";

const GLASS_BG = "rgba(255,255,255,0.05)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

const CENTER_OPTIONS: readonly { mode: CenterDisplayMode; label: string }[] = [
  { mode: "phase_count", label: "Фаза + счёт" },
  { mode: "phase", label: "Только фаза" },
  { mode: "clean", label: "Чисто" },
];

const ORB_OPTIONS: readonly { style: OrbStyle; label: string }[] = [
  { style: "shader", label: "Шейдер" },
  { style: "classic", label: "Классический" },
];

export default function SettingsScreen() {
  const {
    cueSettings,
    centerDisplay,
    orbStyle,
    defaultDurationMinutes,
    setCenterDisplay,
    setOrbStyle,
    setDefaultDurationMinutes,
    setHapticsEnabled,
    setSoundEnabled,
  } = useSettings();

  return (
    <ScreenBackground
      id="profileBg"
      top={homeScreenTones.top}
      mid={homeScreenTones.mid}
      base={homeScreenTones.base}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Профиль</Text>

        <View style={styles.premiumCard}>
          <View style={styles.premiumIcon}>
            <Ionicons name="star" size={20} color="#E5C16B" />
          </View>
          <View style={styles.premiumCopy}>
            <Text style={styles.premiumTitle}>Aire Premium</Text>
            <Text style={styles.premiumSub}>
              Персональные программы и расширенная аналитика
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Звуковые сигналы</Text>
              <Text style={styles.settingCopy}>Мягкий сигнал при смене фазы дыхания.</Text>
            </View>
            <Switch value={cueSettings.soundEnabled} onValueChange={setSoundEnabled} />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Вибрация</Text>
              <Text style={styles.settingCopy}>Заготовка для будущих тактильных сигналов.</Text>
            </View>
            <Switch value={cueSettings.hapticsEnabled} onValueChange={setHapticsEnabled} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.settingTitle}>Длительность по умолчанию</Text>
          <View style={styles.durationRow}>
            {[3, 5, 8].map((minutes) => (
              <Pressable
                key={minutes}
                style={[
                  styles.durationButton,
                  defaultDurationMinutes === minutes && styles.durationButtonActive,
                ]}
                onPress={() => setDefaultDurationMinutes(minutes)}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.durationLabel,
                    defaultDurationMinutes === minutes && styles.durationLabelActive,
                  ]}
                >
                  {minutes} мин
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.settingTitle}>Что в центре орба</Text>
          <Text style={styles.settingCopy}>Что показывать во время практики.</Text>
          <View style={styles.durationRow}>
            {CENTER_OPTIONS.map((option) => (
              <Pressable
                key={option.mode}
                style={[
                  styles.durationButton,
                  centerDisplay === option.mode && styles.durationButtonActive,
                ]}
                onPress={() => setCenterDisplay(option.mode)}
                accessibilityRole="button"
                accessibilityState={{ selected: centerDisplay === option.mode }}
              >
                <Text
                  style={[
                    styles.durationLabel,
                    centerDisplay === option.mode && styles.durationLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.settingTitle}>Орб</Text>
          <Text style={styles.settingCopy}>Шейдерный орб или классический.</Text>
          <View style={styles.durationRow}>
            {ORB_OPTIONS.map((option) => (
              <Pressable
                key={option.style}
                style={[
                  styles.durationButton,
                  orbStyle === option.style && styles.durationButtonActive,
                ]}
                onPress={() => setOrbStyle(option.style)}
                accessibilityRole="button"
                accessibilityState={{ selected: orbStyle === option.style }}
              >
                <Text
                  style={[
                    styles.durationLabel,
                    orbStyle === option.style && styles.durationLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.note}>
          Aire не ставит диагнозы, не измеряет давление и не заменяет медицинскую помощь.
        </Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 104,
    gap: spacing.xl,
  },
  heading: {
    fontFamily: fontFamily.display,
    color: "#EAF0F8",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(212,170,90,0.30)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: "rgba(212,170,90,0.08)",
  },
  premiumIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(212,170,90,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumCopy: {
    flex: 1,
    gap: 3,
  },
  premiumTitle: {
    color: "#EAF0F8",
    fontSize: 15,
    fontWeight: "700",
  },
  premiumSub: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: GLASS_BG,
  },
  divider: {
    height: 1,
    backgroundColor: GLASS_BORDER,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  settingText: {
    flex: 1,
    gap: 3,
  },
  settingTitle: {
    color: "#EAF0F8",
    fontSize: 15,
    fontWeight: "700",
  },
  settingCopy: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  durationRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  durationButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radius.md,
    backgroundColor: GLASS_BG,
  },
  durationButtonActive: {
    borderColor: "rgba(255,255,255,0.30)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  durationLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  durationLabelActive: {
    color: "#EAF0F8",
  },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
