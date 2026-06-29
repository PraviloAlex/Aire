export type SessionOrbMockupDirection = "asset" | "minimal" | "outside-text";

export type SessionOrbMockupVariant = Readonly<{
  id: string;
  direction: SessionOrbMockupDirection;
  label: string;
  title: string;
  principle: string;
  phase: string;
  countdown: string;
  phrase: string;
  notes: readonly string[];
  colors: Readonly<{
    top: string;
    mid: string;
    base: string;
    core: string;
    field: string;
    edge: string;
    glow: string;
    accent: string;
  }>;
}>;

export const sessionOrbMockupVariants: readonly SessionOrbMockupVariant[] = [
  {
    id: "aurora-field",
    direction: "asset",
    label: "A",
    title: "Aurora field",
    principle: "Живой многоцветный свет с сильным размытием. Язык Endel / Siri.",
    phase: "Вдох",
    countdown: "4",
    phrase: "Вернись к контролю",
    notes: [
      "Самый «дорогой» и атмосферный, но самый сложный по балансу.",
      "Размытие через SVG-фильтры, без PNG-ассетов.",
      "Цвет можно гнать под состояние — здесь cyan calm.",
    ],
    colors: {
      top: "#0F2434",
      mid: "#06131F",
      base: "#03070D",
      core: "#DBFBFF",
      field: "#45C9DE",
      edge: "#0B2C3E",
      glow: "#8DF4FF",
      accent: "#77EFF9",
    },
  },
  {
    id: "crystal-glass",
    direction: "minimal",
    label: "B",
    title: "Crystal glass",
    principle: "Тёмное стекло; свет огибает кромку снизу. Объект, а не пятно.",
    phase: "Выдох",
    countdown: "6",
    phrase: "Спокойно выдохни",
    notes: [
      "Читается как настоящий стеклянный шар.",
      "Светящийся полумесяц снизу — главный признак стекла.",
      "Здесь emerald — показывает, что цвет состояния гибкий.",
    ],
    colors: {
      top: "#0C2A22",
      mid: "#06140F",
      base: "#030A07",
      core: "#BFFBE4",
      field: "#34C79A",
      edge: "#06241A",
      glow: "#62EAC0",
      accent: "#46E0A6",
    },
  },
  {
    id: "ring-field",
    direction: "outside-text",
    label: "C",
    title: "Ring field",
    principle: "Без заливки: концентрические кольца + светящееся ядро. Геометрия.",
    phase: "Готовься",
    countdown: "3",
    phrase: "Фаза и число вынесены наружу",
    notes: [
      "Самый чистый и лёгкий язык, как у Apple-дыхалки.",
      "Текст снаружи — не борется с длинными русскими словами.",
      "Ядро дышит, внешнее кольцо = прогресс. Здесь violet.",
    ],
    colors: {
      top: "#182139",
      mid: "#0B1020",
      base: "#050711",
      core: "#E0D6FF",
      field: "#8B79E0",
      edge: "#1C1535",
      glow: "#A390FF",
      accent: "#9B86FF",
    },
  },
] as const;
