import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useRef, useState, type ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getPracticeById } from "@/data/breathingPractices";
import { getCardForGoal } from "@/data/learnArticles";
import { RATING_ORDER, ratingFaces, reflectionTriggers } from "@/data/reflectionContent";
import { PulseMeasureSheet } from "@/features/biofeedback/PulseMeasureSheet";
import { pluralizeRu } from "@/features/common/pluralizeRu";
import { useSettings } from "@/features/settings/SettingsContext";
import { generateId, saveSessionRecord } from "@/storage/sessionStorage";
import { editorial, editorialFont } from "@/theme/editorial";
import { stateColors } from "@/theme/tokens";
import type { BreathingGoal, ReflectionRating } from "@/types/breathing";

const PROGRESS_UPDATE_ROUTE = "/(tabs)/progress" as Href;
const CLAY = editorial.clay;
const CLAY_FILL = "rgba(192,87,58,0.10)";
const DANGER = "#C0392B";

type SessionReflectionProps = Readonly<{
  goal: BreathingGoal;
  practiceId: string;
  durationSeconds: number;
  bpmBefore?: number;
  onRestart: () => void;
}>;

export function SessionReflection({ goal, practiceId, durationSeconds, bpmBefore, onRestart }: SessionReflectionProps) {
  const router = useRouter();
  const { pulseEnabled } = useSettings();
  const practice = getPracticeById(practiceId);
  const minutes = Math.round(durationSeconds / 60);

  const [rating, setRating] = useState<ReflectionRating | null>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [bpmAfter, setBpmAfter] = useState<number | null>(null);
  const [showAfterMeasure, setShowAfterMeasure] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const isSavingRef = useRef(false);

  const handleSave = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaveError(false);
    const ok = await saveSessionRecord({
      id: generateId(),
      practiceId,
      goal,
      durationSeconds,
      completedAt: new Date().toISOString(),
      reflection: rating,
      completed: true,
      trigger: trigger ?? undefined,
      note: note.trim() || undefined,
      bpmBefore,
      bpmAfter: bpmAfter ?? undefined,
    });
    if (!ok) {
      isSavingRef.current = false;
      setSaveError(true);
      return;
    }
    const article = getCardForGoal(goal);
    if (article) {
      router.replace(`/card/${article.id}?goal=${goal}` as Href);
    } else {
      router.replace(PROGRESS_UPDATE_ROUTE);
    }
  };

  const handleSkip = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaveError(false);
    const ok = await saveSessionRecord({
      id: generateId(),
      practiceId,
      goal,
      durationSeconds,
      completedAt: new Date().toISOString(),
      reflection: null,
      completed: true,
      bpmBefore,
      bpmAfter: bpmAfter ?? undefined,
    });
    if (!ok) {
      isSavingRef.current = false;
      setSaveError(true);
      return;
    }
    router.replace(PROGRESS_UPDATE_ROUTE);
  };

  const handleChooseOther = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    await saveSessionRecord({
      id: generateId(),
      practiceId,
      goal,
      durationSeconds,
      completedAt: new Date().toISOString(),
      reflection: null,
      completed: true,
    });
    router.replace("/");
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>СЕССИЯ ЗАВЕРШЕНА</Text>
        <Text style={styles.heading}>Как ты сейчас?</Text>
        <Text style={styles.subheading}>Это помогает Aire подбирать практики</Text>

        <View style={styles.ratingRow}>
          {RATING_ORDER.map((value) => {
            const face = ratingFaces[value];
            const isSelected = rating === value;
            return (
              <Pressable
                key={value}
                style={[styles.ratingCard, isSelected ? styles.ratingCardActive : null]}
                onPress={() => setRating(isSelected ? null : value)}
                accessibilityRole="button"
                accessibilityLabel={face.label.replace("\n", " ")}
                accessibilityState={{ selected: isSelected }}
              >
                <Ionicons
                  name={face.icon as ComponentProps<typeof Ionicons>["name"]}
                  size={26}
                  color={isSelected ? CLAY : editorial.inkFaint}
                />
                <Text style={[styles.ratingLabel, isSelected ? styles.ratingLabelActive : null]}>{face.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.statsBlock}>
          <Text style={styles.statLine}>
            {minutes} мин дыхания
            {practice
              ? ` · ${practice.pattern.rounds} ${pluralizeRu(practice.pattern.rounds, ["цикл", "цикла", "циклов"])}`
              : ""}
          </Text>
          {practice ? (
            <View style={styles.practiceRow}>
              <View style={[styles.goalDot, { backgroundColor: stateColors[goal] }]} />
              <Text style={styles.statPractice}>Практика: {practice.title}</Text>
            </View>
          ) : null}
        </View>

        {pulseEnabled && (
          <View style={styles.pulseBlock}>
            <Text style={styles.pulseSectionLabel}>ПУЛЬС</Text>
            {bpmBefore != null && bpmAfter != null ? (
              <View style={styles.pulseDeltaRow}>
                <Text style={styles.pulseDeltaText}>{bpmBefore} → {bpmAfter} уд/мин</Text>
                <Text style={[styles.pulseDeltaChange, { color: bpmAfter < bpmBefore ? CLAY : DANGER }]}>
                  {bpmAfter < bpmBefore ? "▼" : "▲"} {Math.abs(bpmAfter - bpmBefore)}
                </Text>
              </View>
            ) : bpmAfter != null ? (
              <Text style={styles.pulseSingle}>{bpmAfter} уд/мин</Text>
            ) : bpmBefore != null ? (
              <View style={styles.pulseMeasureRow}>
                <Text style={styles.pulseSingle}>До: {bpmBefore} уд/мин</Text>
                <Pressable style={styles.measureBtn} onPress={() => setShowAfterMeasure(true)} accessibilityRole="button">
                  <Text style={styles.measureBtnLabel}>Замерить после →</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.measureBtn} onPress={() => setShowAfterMeasure(true)} accessibilityRole="button">
                <Text style={styles.measureBtnLabel}>Замерить пульс</Text>
              </Pressable>
            )}
            <Text style={styles.pulseDisclaimer}>Оценка, не медицинское измерение.</Text>
          </View>
        )}

        {!showDetails ? (
          <Pressable
            style={styles.detailsToggle}
            onPress={() => setShowDetails(true)}
            accessibilityRole="button"
            accessibilityLabel="Добавить детали"
          >
            <Ionicons name="add" size={16} color={editorial.inkSoft} />
            <Text style={styles.detailsToggleLabel}>Добавить детали</Text>
          </Pressable>
        ) : null}

        {showDetails ? (
          <>
        <Text style={styles.sectionLabel}>Что повлияло?</Text>
        <View style={styles.chipRow}>
          {reflectionTriggers.map((t) => {
            const isActive = trigger === t;
            return (
              <Pressable
                key={t}
                style={[styles.chip, isActive ? styles.chipActive : null]}
                onPress={() => setTrigger(isActive ? null : t)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.chipLabel, isActive ? styles.chipLabelActive : null]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          style={styles.noteInput}
          placeholder="Добавить заметку…"
          placeholderTextColor={editorial.inkFaint}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          accessibilityLabel="Заметка к сессии"
        />
          </>
        ) : null}

        {saveError && <Text style={styles.saveErrorText}>Не удалось сохранить. Попробуй ещё раз.</Text>}

        <Pressable style={styles.saveButton} onPress={() => { void handleSave(); }} accessibilityRole="button">
          <Text style={styles.saveLabel}>Сохранить</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={() => { void handleSkip(); }} accessibilityRole="button">
          <Text style={styles.skipLabel}>Пропустить</Text>
        </Pressable>

        <Pressable style={styles.restartButton} onPress={onRestart} accessibilityRole="button">
          <Text style={styles.restartLabel}>Повторить сессию →</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={() => { void handleChooseOther(); }} accessibilityRole="button">
          <Text style={styles.skipLabel}>Выбрать другое</Text>
        </Pressable>
      </ScrollView>

      <PulseMeasureSheet
        visible={showAfterMeasure}
        onDone={(bpm) => { setBpmAfter(bpm); setShowAfterMeasure(false); }}
        onClose={() => setShowAfterMeasure(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: editorial.paper },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 104, gap: 16 },
  kicker: { fontFamily: editorialFont.sans, color: editorial.inkFaint, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  heading: { fontFamily: editorialFont.serif, color: editorial.ink, fontSize: 32, lineHeight: 36 },
  subheading: { fontFamily: editorialFont.sans, color: editorial.inkSoft, fontSize: 14, lineHeight: 20, marginTop: -6 },
  ratingRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  ratingCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: editorial.hairline,
    backgroundColor: editorial.paperRaised,
    gap: 6,
  },
  ratingCardActive: { borderColor: CLAY, backgroundColor: CLAY_FILL },
  ratingLabel: { fontFamily: editorialFont.sans, color: editorial.inkSoft, fontSize: 11, fontWeight: "600", textAlign: "center" },
  ratingLabelActive: { color: CLAY, fontWeight: "700" },
  statsBlock: {
    backgroundColor: editorial.paperRaised,
    borderColor: editorial.hairline,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 5,
  },
  statLine: { fontFamily: editorialFont.sans, color: editorial.ink, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  practiceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  goalDot: { width: 8, height: 8, borderRadius: 4 },
  statPractice: { fontFamily: editorialFont.sans, color: editorial.inkSoft, fontSize: 13, lineHeight: 18 },
  sectionLabel: {
    fontFamily: editorialFont.sans,
    color: editorial.inkFaint,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 4,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: editorial.hairline,
    backgroundColor: editorial.paperRaised,
  },
  chipActive: { backgroundColor: CLAY, borderColor: CLAY },
  chipLabel: { fontFamily: editorialFont.sans, color: editorial.inkSoft, fontSize: 13, fontWeight: "600" },
  chipLabelActive: { color: editorial.paper, fontWeight: "700" },
  noteInput: {
    backgroundColor: editorial.paperRaised,
    borderColor: editorial.hairline,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: editorial.ink,
    fontFamily: editorialFont.sans,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 80,
    textAlignVertical: "top",
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: editorial.hairline,
  },
  detailsToggleLabel: { fontFamily: editorialFont.sans, color: editorial.inkSoft, fontSize: 14, fontWeight: "600" },
  saveErrorText: { fontFamily: editorialFont.sans, color: DANGER, fontSize: 13, fontWeight: "600", textAlign: "center" },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: CLAY,
    marginTop: 4,
  },
  saveLabel: { fontFamily: editorialFont.sans, color: editorial.paper, fontSize: 16, fontWeight: "700" },
  skipButton: { alignItems: "center", paddingVertical: 10 },
  skipLabel: { fontFamily: editorialFont.sans, color: editorial.inkSoft, fontSize: 15, fontWeight: "600" },
  restartButton: { alignItems: "center", paddingVertical: 10 },
  restartLabel: { fontFamily: editorialFont.sans, color: CLAY, fontSize: 15, fontWeight: "700" },
  pulseBlock: {
    backgroundColor: editorial.paperRaised,
    borderColor: editorial.hairline,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  pulseSectionLabel: {
    fontFamily: editorialFont.sans,
    color: editorial.inkFaint,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  pulseDeltaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 },
  pulseDeltaText: { fontFamily: editorialFont.sans, color: editorial.ink, fontSize: 16, fontWeight: "700" },
  pulseDeltaChange: { fontFamily: editorialFont.sans, fontSize: 16, fontWeight: "700" },
  pulseSingle: { fontFamily: editorialFont.sans, color: editorial.ink, fontSize: 15, fontWeight: "600" },
  pulseMeasureRow: { gap: 8 },
  measureBtn: { paddingVertical: 4 },
  measureBtnLabel: { fontFamily: editorialFont.sans, color: CLAY, fontSize: 14, fontWeight: "700" },
  pulseDisclaimer: { fontFamily: editorialFont.sans, color: editorial.inkSoft, fontSize: 11, lineHeight: 15 },
});
