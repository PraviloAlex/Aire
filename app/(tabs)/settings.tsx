import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { ScreenBackground } from "@/features/common/ScreenBackground";
import { useSettings } from "@/features/settings/SettingsContext";
import { homeScreenTones, stateOrbColors } from "@/theme/gradients";
import { colors, fontFamily, radius, spacing } from "@/theme/tokens";
import type { CenterDisplayMode, OrbStyle } from "@/types/breathing";

const GLASS_BG = "rgba(255,255,255,0.05)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";
const ACCENT = stateOrbColors.calm.glow; // #4FC3D4 — нейтральный бренд-акцент настроек
const ORB_CORE = stateOrbColors.calm.core; // #8CE6F5

const CENTER_OPTIONS: readonly { mode: CenterDisplayMode; label: string }[] = [
  { mode: "phase_count", label: "Фаза + счёт" },
  { mode: "phase", label: "Только фаза" },
  { mode: "clean", label: "Чисто" },
];

const ORB_OPTIONS: readonly { style: OrbStyle; label: string }[] = [
  { style: "shader", label: "Шейдер" },
  { style: "classic", label: "Классический" },
];

// Превью орба для галереи: шейдер — мягкое свечение, классический — чёткое кольцо.
function OrbPreview({ kind, selected }: { kind: OrbStyle; selected: boolean }) {
  return (
    <View style={[styles.orbThumb, { borderColor: selected ? ACCENT : "rgba(255,255,255,0.10)" }]}>
      {kind === "shader" ? (
        <View style={[styles.orbShaderField, { backgroundColor: `${ORB_CORE}26` }]}>
          <View style={[styles.orbShaderCore, { backgroundColor: `${ORB_CORE}99` }]} />
        </View>
      ) : (
        <View style={[styles.orbClassicRing, { borderColor: `${ORB_CORE}73` }]}>
          <View style={[styles.orbClassicInner, { borderColor: `${ORB_CORE}B3` }]} />
        </View>
      )}
      {selected ? (
        <View style={[styles.orbCheck, { backgroundColor: ACCENT }]}>
          <Ionicons name="checkmark" size={13} color="#06121F" />
        </View>
      ) : null}
    </View>
  );
}

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

  const orbLabel = ORB_OPTIONS.find((option) => option.style === orbStyle)?.label ?? "";

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
            <Text style={styles.premiumSub}>Новые орбы, темы и аналитика</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9A917F" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Внешний вид</Text>

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.settingTitle}>Орб</Text>
              <Text style={styles.cardHeaderValue}>{orbLabel}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.orbGallery}
            >
              {ORB_OPTIONS.map((option) => {
                const isActive = orbStyle === option.style;
                return (
                  <Pressable
                    key={option.style}
                    style={styles.orbItem}
                    onPress={() => setOrbStyle(option.style)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`Орб: ${option.label}`}
                  >
                    <OrbPreview kind={option.style} selected={isActive} />
                    <Text style={[styles.orbItemLabel, isActive && styles.orbItemLabelActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
              <View style={styles.orbItem}>
                <View style={styles.orbThumbSoon}>
                  <Ionicons name="lock-closed-outline" size={22} color="#7C8DA0" />
                </View>
                <Text style={styles.orbItemLabel}>Скоро</Text>
              </View>
            </ScrollView>
          </View>

          <View style={styles.card}>
            <Text style={styles.settingTitle}>Что в центре орба</Text>
            <Text style={styles.settingCopy}>Что показывать во время практики.</Text>
            <View style={styles.segmentRow}>
              {CENTER_OPTIONS.map((option) => (
                <Pressable
                  key={option.mode}
                  style={[
                    styles.segmentButton,
                    centerDisplay === option.mode && styles.segmentButtonActive,
                  ]}
                  onPress={() => setCenterDisplay(option.mode)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: centerDisplay === option.mode }}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      centerDisplay === option.mode && styles.segmentLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Практика</Text>

          <View style={styles.groupCard}>
            <View style={styles.groupRow}>
              <Text style={styles.settingTitle}>Длительность по умолчанию</Text>
              <View style={[styles.segmentRow, styles.groupSegment]}>
                {[3, 5, 8].map((minutes) => (
                  <Pressable
                    key={minutes}
                    style={[
                      styles.segmentButton,
                      defaultDurationMinutes === minutes && styles.segmentButtonActive,
                    ]}
                    onPress={() => setDefaultDurationMinutes(minutes)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: defaultDurationMinutes === minutes }}
                  >
                    <Text
                      style={[
                        styles.segmentLabel,
                        defaultDurationMinutes === minutes && styles.segmentLabelActive,
                      ]}
                    >
                      {minutes} мин
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.groupDivider} />

            <View style={[styles.groupRow, styles.settingRow]}>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Звуковые сигналы</Text>
                <Text style={styles.settingCopy}>Мягкий сигнал при смене фазы.</Text>
              </View>
              <Switch value={cueSettings.soundEnabled} onValueChange={setSoundEnabled} />
            </View>

            <View style={styles.groupDivider} />

            <View style={[styles.groupRow, styles.settingRow]}>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Вибрация</Text>
                <Text style={styles.settingCopy}>Тактильные сигналы фаз (кроме сна).</Text>
              </View>
              <Switch value={cueSettings.hapticsEnabled} onValueChange={setHapticsEnabled} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>О приложении</Text>
          <Text style={styles.note}>
            Aire не ставит диагнозы, не измеряет давление и не заменяет медицинскую помощь.
          </Text>
        </View>
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
  section: {
    gap: spacing.md,
  },
  sectionLabel: {
    color: "#9A917F",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginLeft: 2,
  },
  card: {
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: GLASS_BG,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  cardHeaderValue: {
    color: "#7C8DA0",
    fontSize: 12,
    fontWeight: "600",
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
  orbGallery: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 2,
    paddingRight: spacing.lg,
  },
  orbItem: {
    width: 84,
    alignItems: "center",
    gap: 10,
  },
  orbThumb: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  orbShaderField: {
    width: "100%",
    height: "100%",
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
  },
  orbShaderCore: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  orbClassicRing: {
    width: "100%",
    height: "100%",
    borderRadius: 41,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  orbClassicInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
  },
  orbThumbSoon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
  },
  orbCheck: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: homeScreenTones.base,
  },
  orbItemLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  orbItemLabelActive: {
    color: "#DCE8F4",
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segmentButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radius.md,
    backgroundColor: GLASS_BG,
  },
  segmentButtonActive: {
    borderColor: "rgba(255,255,255,0.30)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  segmentLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  segmentLabelActive: {
    color: "#EAF0F8",
  },
  groupCard: {
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: radius.lg,
    backgroundColor: GLASS_BG,
    overflow: "hidden",
  },
  groupRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 15,
    gap: spacing.md,
  },
  groupSegment: {
    marginTop: 2,
  },
  groupDivider: {
    height: 1,
    backgroundColor: GLASS_BORDER,
  },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 2,
  },
});
