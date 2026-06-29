import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toggle } from "@/features/common/Toggle";
import { WaterRipple } from "@/features/common/WaterRipple";
import { useSettings } from "@/features/settings/SettingsContext";
import { soundscapes } from "@/data/soundscapes";
import { editorial, editorialFont } from "@/theme/editorial";
import type { CenterDisplayMode, OrbStyle, SessionFont } from "@/types/breathing";

const CENTER_OPTIONS: readonly { mode: CenterDisplayMode; label: string }[] = [
  { mode: "phase_count", label: "Фаза + счёт" },
  { mode: "phase", label: "Только фаза" },
  { mode: "clean", label: "Чисто" },
];

const ORB_OPTIONS: readonly { style: OrbStyle; label: string }[] = [
  { style: "shader", label: "Шейдер" },
  { style: "classic", label: "Классический" },
];

const FONT_OPTIONS: readonly { font: SessionFont; label: string }[] = [
  { font: "serif", label: "Серифный" },
  { font: "sans", label: "Рубленый" },
];

// Светлое превью орба: шейдер — мягкое «дыхание» кругами, классический — чёткое кольцо.
// Тёмный шейдер-орб остаётся в сессии; здесь — editorial-акцент (WaterRipple / кольцо), глина.
function OrbPreview({ kind, selected }: { kind: OrbStyle; selected: boolean }) {
  return (
    <View style={[styles.orbThumb, selected && styles.orbThumbSelected]}>
      {kind === "shader" ? (
        <View style={styles.orbShaderField}>
          <WaterRipple size={58} color={editorial.clay} mode="breathing" ringCount={3} />
        </View>
      ) : (
        <View style={styles.orbClassicRing}>
          <View style={styles.orbClassicInner} />
        </View>
      )}
      {selected ? (
        <View style={styles.orbCheck}>
          <Ionicons name="checkmark" size={13} color={editorial.paper} />
        </View>
      ) : null}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    cueSettings,
    centerDisplay,
    orbStyle,
    sessionFont,
    defaultDurationMinutes,
    defaultSoundscapeId,
    pulseEnabled,
    setCenterDisplay,
    setOrbStyle,
    setSessionFont,
    setDefaultDurationMinutes,
    setHapticsEnabled,
    setSoundEnabled,
    setVoiceEnabled,
    setAmbientEnabled,
    setDefaultSoundscapeId,
    setPulseEnabled,
  } = useSettings();

  const orbLabel = ORB_OPTIONS.find((option) => option.style === orbStyle)?.label ?? "";

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Назад"
          >
            <Ionicons name="arrow-back" size={22} color={editorial.ink} />
          </Pressable>
        </View>
        <Text style={styles.heading}>Настройки</Text>

        <Pressable style={({ pressed }) => [styles.premiumCard, pressed && styles.pressed]}>
          <View style={styles.premiumIcon}>
            <Ionicons name="star" size={20} color={editorial.clay} />
          </View>
          <View style={styles.premiumCopy}>
            <Text style={styles.premiumTitle}>Aire Premium</Text>
            <Text style={styles.premiumSub}>Новые орбы, темы и аналитика</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={editorial.inkFaint} />
        </Pressable>

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
                  <Ionicons name="lock-closed-outline" size={22} color={editorial.inkFaint} />
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

          <View style={styles.card}>
            <Text style={styles.settingTitle}>Шрифт в сессии</Text>
            <Text style={styles.settingCopy}>Каким шрифтом писать фазы во время практики.</Text>
            <View style={styles.segmentRow}>
              {FONT_OPTIONS.map((option) => (
                <Pressable
                  key={option.font}
                  style={[styles.segmentButton, sessionFont === option.font && styles.segmentButtonActive]}
                  onPress={() => setSessionFont(option.font)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sessionFont === option.font }}
                >
                  <Text style={[styles.segmentLabel, sessionFont === option.font && styles.segmentLabelActive]}>
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
              <Toggle value={cueSettings.soundEnabled} onValueChange={setSoundEnabled} />
            </View>

            <View style={styles.groupDivider} />

            <View style={[styles.groupRow, styles.settingRow]}>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Вибрация</Text>
                <Text style={styles.settingCopy}>Тактильные сигналы фаз (кроме сна).</Text>
              </View>
              <Toggle value={cueSettings.hapticsEnabled} onValueChange={setHapticsEnabled} />
            </View>

            <View style={styles.groupDivider} />

            <View style={[styles.groupRow, styles.settingRow]}>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Голосовое ведение</Text>
                <Text style={styles.settingCopy}>Голос называет фазу — можно закрыть глаза.</Text>
              </View>
              <Toggle value={cueSettings.voiceEnabled} onValueChange={setVoiceEnabled} />
            </View>

            <View style={styles.groupDivider} />

            <View style={[styles.groupRow, styles.settingRow]}>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Фоновый звук</Text>
                <Text style={styles.settingCopy}>Мягкий эмбиент на время практики.</Text>
              </View>
              <Toggle value={cueSettings.ambientEnabled} onValueChange={setAmbientEnabled} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Атмосфера</Text>

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.settingTitle}>Фон по умолчанию</Text>
              <Text style={styles.cardHeaderValue}>
                {soundscapes.find((s) => s.id === defaultSoundscapeId)?.title ?? "Тишина"}
              </Text>
            </View>
            <Text style={styles.settingCopy}>Фоновый звук включается, если в настройках включён «Фоновый звук».</Text>
            <View style={styles.segmentRow}>
              {soundscapes.map((s) => (
                <Pressable
                  key={s.id}
                  style={[
                    styles.segmentButton,
                    defaultSoundscapeId === s.id && styles.segmentButtonActive,
                  ]}
                  onPress={() => setDefaultSoundscapeId(s.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: defaultSoundscapeId === s.id }}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      defaultSoundscapeId === s.id && styles.segmentLabelActive,
                    ]}
                  >
                    {s.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Пульс</Text>
          <View style={styles.groupCard}>
            <View style={[styles.groupRow, styles.settingRow]}>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Замер пульса</Text>
                <Text style={styles.settingCopy}>
                  Оценка ЧСС по камере до и после практики.
                </Text>
              </View>
              <Toggle value={pulseEnabled} onValueChange={setPulseEnabled} />
            </View>
          </View>
          {pulseEnabled && (
            <Text style={styles.note}>
              Замер пульса — потребительская оценка по камере, не медицинское
              измерение. Данные не покидают устройство.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>О приложении</Text>
          <Text style={styles.note}>
            Aire не ставит диагнозы, не измеряет давление и не заменяет медицинскую помощь.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: editorial.paper },
  content: { paddingHorizontal: 24, paddingBottom: 48, gap: 24 },
  topBar: { marginBottom: -8 },
  backBtn: { padding: 6, alignSelf: "flex-start" },
  pressed: { opacity: 0.82 },
  heading: {
    fontFamily: editorialFont.serif,
    color: editorial.ink,
    fontSize: 34,
    fontWeight: "400",
    lineHeight: 38,
    letterSpacing: -1,
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: editorial.hairline,
    borderRadius: 16,
    padding: 16,
    backgroundColor: editorial.paperRaised,
  },
  premiumIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(192,87,58,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumCopy: { flex: 1, gap: 3 },
  premiumTitle: {
    fontFamily: editorialFont.sans,
    color: editorial.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  premiumSub: {
    fontFamily: editorialFont.sans,
    color: editorial.inkSoft,
    fontSize: 12,
    lineHeight: 16,
  },
  section: { gap: 12 },
  sectionLabel: {
    fontFamily: editorialFont.sans,
    color: editorial.inkFaint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginLeft: 2,
  },
  card: {
    gap: 16,
    borderWidth: 1,
    borderColor: editorial.hairline,
    borderRadius: 16,
    padding: 16,
    backgroundColor: editorial.paperRaised,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  cardHeaderValue: {
    fontFamily: editorialFont.sans,
    color: editorial.clay,
    fontSize: 12,
    fontWeight: "700",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  settingText: { flex: 1, gap: 3 },
  settingTitle: {
    fontFamily: editorialFont.sans,
    color: editorial.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  settingCopy: {
    fontFamily: editorialFont.sans,
    color: editorial.inkSoft,
    fontSize: 12,
    lineHeight: 16,
  },
  orbGallery: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 2,
    paddingRight: 16,
  },
  orbItem: { width: 84, alignItems: "center", gap: 10 },
  orbThumb: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    borderColor: editorial.hairline,
    backgroundColor: editorial.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  orbThumbSelected: { borderWidth: 2, borderColor: editorial.clay },
  orbShaderField: {
    width: "100%",
    height: "100%",
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
  },
  orbClassicRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: editorial.clay,
    alignItems: "center",
    justifyContent: "center",
  },
  orbClassicInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(192,87,58,0.5)",
  },
  orbThumbSoon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: editorial.hairline,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
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
    backgroundColor: editorial.clay,
    borderWidth: 2,
    borderColor: editorial.paper,
  },
  orbItemLabel: {
    fontFamily: editorialFont.sans,
    color: editorial.inkSoft,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  orbItemLabelActive: { color: editorial.ink },
  segmentRow: { flexDirection: "row", gap: 8 },
  segmentButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: editorial.hairline,
    borderRadius: 12,
    backgroundColor: editorial.paperRaised,
  },
  segmentButtonActive: { borderColor: editorial.clay, backgroundColor: editorial.clay },
  segmentLabel: {
    fontFamily: editorialFont.sans,
    color: editorial.inkSoft,
    fontSize: 13,
    fontWeight: "700",
  },
  segmentLabelActive: { color: editorial.paper },
  groupCard: {
    borderWidth: 1,
    borderColor: editorial.hairline,
    borderRadius: 16,
    backgroundColor: editorial.paperRaised,
    overflow: "hidden",
  },
  groupRow: { paddingHorizontal: 16, paddingVertical: 15, gap: 12 },
  groupSegment: { marginTop: 2 },
  groupDivider: { height: 1, backgroundColor: editorial.hairline },
  note: {
    fontFamily: editorialFont.sans,
    color: editorial.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 2,
  },
});
