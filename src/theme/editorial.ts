import { Platform } from "react-native";

// Светлая «editorial» тема Aire: тёплая бумага, чернила, один глиняный акцент.
// Вдохновлено эталоном KukuPaste, но в светлом журнальном ключе.
// Применяется по экранам поэтапно (первый — главный).
export const editorial = {
  paper:       "#F4F0E7", // тёплый фон-бумага
  paperRaised: "#FFFFFF", // приподнятые поверхности
  ink:         "#211D18", // основной текст (тёплый near-black)
  inkSoft:     "#847B6B", // вторичный текст
  inkFaint:    "#9A917F", // надстрочники, лейблы
  hairline:    "rgba(42,38,32,0.13)", // волосяные разделители
  clay:        "#C0573A", // единственный акцент
  index:       "#B3A994", // номера индекса
  // Тёмная SOS-плашка
  sosBg:       "#211D18",
  sosText:     "#F4F0E7",
  sosSub:      "#A89C8A",
  sosPulse:    "#E8754F",
} as const;

// Serif (Fraunces) для заголовков, гротеск для текста. На web грузится из Google Fonts
// (см. app/_layout.tsx); на нативе — системный serif как запасной вариант.
export const editorialFont = {
  serif: Platform.OS === "web" ? "Fraunces, Georgia, 'Times New Roman', serif" : "serif",
  sans:  Platform.OS === "web" ? "Manrope, system-ui, sans-serif" : undefined,
} as const;
