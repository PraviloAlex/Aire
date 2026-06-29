import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { sessionOrbMockupVariants, type SessionOrbMockupVariant } from "@/features/mockups/sessionOrbMockupData";
import { fontFamily, radius, spacing } from "@/theme/tokens";

const CARD_WIDTH = 356;
const PHONE_HEIGHT = 640;
const ORB_SIZE = 230;
const C = ORB_SIZE / 2;
const RING_R = 106;

function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const [x1, y1] = polar(cx, cy, r, startDeg);
  const [x2, y2] = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

// Размытый слой: CSS-blur через RN-web style. SVG-фильтры на web-экспорте не рендерятся,
// поэтому мягкий свет даём здесь, а резкие детали — отдельным слоем сверху.
function BlurLayer({ amount, children }: { amount: number; children: ReactNode }) {
  return <View style={[styles.layer, { filter: `blur(${amount}px)` } as object]}>{children}</View>;
}

function ProgressRing({ variant, sweepDeg, trackOpacity }: { variant: SessionOrbMockupVariant; sweepDeg: number; trackOpacity: number }) {
  return (
    <>
      <Circle cx={C} cy={C} r={RING_R} fill="none" stroke={variant.colors.glow} strokeOpacity={String(trackOpacity)} strokeWidth="2" />
      <Path
        d={arcPath(C, C, RING_R, 0, sweepDeg)}
        fill="none"
        stroke={variant.colors.accent}
        strokeOpacity="0.9"
        strokeLinecap="round"
        strokeWidth="3.5"
      />
    </>
  );
}

// A — Aurora: многоцветный размытый свет, без жёсткого края. Язык Endel / Siri.
function AuroraOrb({ variant }: { variant: SessionOrbMockupVariant }) {
  const id = variant.id;
  return (
    <View style={styles.orbWrap}>
      <BlurLayer amount={20}>
        <Svg width={ORB_SIZE} height={ORB_SIZE}>
          <Circle cx={C} cy={C} r={90} fill={variant.colors.field} fillOpacity="0.14" />
          <Circle cx={150} cy={152} r={56} fill={variant.colors.edge} fillOpacity="0.75" />
          <Circle cx={84} cy={150} r={48} fill={variant.colors.field} fillOpacity="0.55" />
          <Circle cx={152} cy={90} r={40} fill="#B06CC9" fillOpacity="0.3" />
          <Circle cx={94} cy={86} r={50} fill={variant.colors.core} fillOpacity="0.6" />
          <Circle cx={90} cy={74} r={26} fill="#FFFFFF" fillOpacity="0.6" />
        </Svg>
      </BlurLayer>
      <Svg width={ORB_SIZE} height={ORB_SIZE} style={styles.layer}>
        <Defs>
          <RadialGradient id={`${id}-bloom`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={variant.colors.glow} stopOpacity="0.2" />
            <Stop offset="62%" stopColor={variant.colors.glow} stopOpacity="0.05" />
            <Stop offset="100%" stopColor={variant.colors.glow} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={C} cy={C} r={116} fill={`url(#${id}-bloom)`} />
        <Circle cx={C} cy={C} r={90} fill="none" stroke={variant.colors.core} strokeOpacity="0.16" strokeWidth="1" />
        <ProgressRing variant={variant} sweepDeg={248} trackOpacity={0.1} />
      </Svg>
      <View style={styles.orbText} pointerEvents="none">
        <Text style={styles.thinPhase}>{variant.phase}</Text>
        <Text style={styles.thinCountdown}>{variant.countdown}</Text>
      </View>
    </View>
  );
}

// B — Crystal glass: тёмное стекло, свет огибает нижнюю кромку. Объект, а не пятно.
function CrystalOrb({ variant }: { variant: SessionOrbMockupVariant }) {
  const id = variant.id;
  return (
    <View style={styles.orbWrap}>
      <Svg width={ORB_SIZE} height={ORB_SIZE} style={styles.layer}>
        <Defs>
          <RadialGradient id={`${id}-body`} cx="50%" cy="40%" r="62%">
            <Stop offset="0%" stopColor={variant.colors.field} stopOpacity="0.26" />
            <Stop offset="58%" stopColor={variant.colors.edge} stopOpacity="0.55" />
            <Stop offset="100%" stopColor={variant.colors.edge} stopOpacity="0.94" />
          </RadialGradient>
          <RadialGradient id={`${id}-bloom`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={variant.colors.glow} stopOpacity="0.18" />
            <Stop offset="60%" stopColor={variant.colors.glow} stopOpacity="0.04" />
            <Stop offset="100%" stopColor={variant.colors.glow} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={C} cy={C} r={112} fill={`url(#${id}-bloom)`} />
        <Circle cx={C} cy={C} r={90} fill={`url(#${id}-body)`} />
      </Svg>

      {/* Размытый свет: полумесяц снизу-справа + внутреннее преломление + малый блик. */}
      <BlurLayer amount={6}>
        <Svg width={ORB_SIZE} height={ORB_SIZE}>
          <Path d={arcPath(C, C, 82, 96, 198)} fill="none" stroke={variant.colors.glow} strokeOpacity="0.95" strokeLinecap="round" strokeWidth="7" />
          <Path d={arcPath(C, C, 82, 112, 180)} fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeLinecap="round" strokeWidth="2.5" />
          <Circle cx={C + 8} cy={C + 14} r={52} fill="none" stroke={variant.colors.core} strokeOpacity="0.12" strokeWidth="1.4" />
          <Ellipse cx={86} cy={70} rx="16" ry="9" fill="#FFFFFF" fillOpacity="0.9" rotation="-24" originX={86} originY={70} />
        </Svg>
      </BlurLayer>

      <Svg width={ORB_SIZE} height={ORB_SIZE} style={styles.layer}>
        <Circle cx={C} cy={C} r={90} fill="none" stroke={variant.colors.core} strokeOpacity="0.34" strokeWidth="1.4" />
        <ProgressRing variant={variant} sweepDeg={210} trackOpacity={0.08} />
      </Svg>
      <View style={styles.orbText} pointerEvents="none">
        <Text style={styles.thinPhase}>{variant.phase}</Text>
        <Text style={styles.thinCountdown}>{variant.countdown}</Text>
      </View>
    </View>
  );
}

// C — Ring field: без заливки, концентрические кольца + светящееся ядро. Геометрия.
function RingFieldOrb({ variant }: { variant: SessionOrbMockupVariant }) {
  const id = variant.id;
  return (
    <View style={styles.orbWrap}>
      <BlurLayer amount={10}>
        <Svg width={ORB_SIZE} height={ORB_SIZE}>
          <Circle cx={C} cy={C} r={70} fill={variant.colors.glow} fillOpacity="0.16" />
          <Circle cx={C} cy={C} r={26} fill={variant.colors.glow} fillOpacity="0.65" />
        </Svg>
      </BlurLayer>
      <Svg width={ORB_SIZE} height={ORB_SIZE} style={styles.layer}>
        <Defs>
          <RadialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="45%" stopColor={variant.colors.core} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={variant.colors.glow} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={C} cy={C} r={42} fill="none" stroke={variant.colors.accent} strokeOpacity="0.5" strokeWidth="1.4" />
        <Circle cx={C} cy={C} r={66} fill="none" stroke={variant.colors.core} strokeOpacity="0.28" strokeWidth="1.2" />
        <Circle cx={C} cy={C} r={88} fill="none" stroke={variant.colors.glow} strokeOpacity="0.16" strokeWidth="1" />
        <Circle cx={C} cy={C} r={13} fill={`url(#${id}-core)`} />
        <ProgressRing variant={variant} sweepDeg={300} trackOpacity={0.12} />
      </Svg>
    </View>
  );
}

function DirectionOrb({ variant }: { variant: SessionOrbMockupVariant }) {
  if (variant.direction === "asset") return <AuroraOrb variant={variant} />;
  if (variant.direction === "minimal") return <CrystalOrb variant={variant} />;
  return <RingFieldOrb variant={variant} />;
}

function ScreenWash({ variant }: { variant: SessionOrbMockupVariant }) {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <RadialGradient id={`${variant.id}-bg-top`} cx="76%" cy="0%" r="86%">
          <Stop offset="0%" stopColor={variant.colors.top} />
          <Stop offset="48%" stopColor={variant.colors.mid} />
          <Stop offset="100%" stopColor={variant.colors.base} />
        </RadialGradient>
        <RadialGradient id={`${variant.id}-bg-glow`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={variant.colors.glow} stopOpacity="0.16" />
          <Stop offset="68%" stopColor={variant.colors.glow} stopOpacity="0.05" />
          <Stop offset="100%" stopColor={variant.colors.glow} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${variant.id}-bg-top)`} />
      <Circle cx="50%" cy="42%" r="190" fill={`url(#${variant.id}-bg-glow)`} />
    </Svg>
  );
}

function DirectionCard({ variant }: { variant: SessionOrbMockupVariant }) {
  const textOutside = variant.direction === "outside-text";

  return (
    <View style={styles.card}>
      <ScreenWash variant={variant} />
      <View style={styles.cardTop}>
        <Text style={styles.back}>‹</Text>
        <Text style={styles.end}>End</Text>
      </View>

      <View style={styles.cardBody}>
        {textOutside && (
          <View style={styles.outsideTextBlock}>
            <Text style={styles.outsidePhase}>{variant.phase}</Text>
            <Text style={styles.outsideCountdown}>{variant.countdown}</Text>
          </View>
        )}
        <DirectionOrb variant={variant} />
        <Text style={styles.phrase}>{variant.phrase}</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.roundButton}>
          <Text style={styles.controlIcon}>Ⅱ</Text>
        </View>
        <View style={styles.roundButton}>
          <Text style={styles.controlIcon}>♪</Text>
        </View>
      </View>

      <View style={styles.decisionPanel}>
        <View style={styles.decisionHeader}>
          <Text style={[styles.variantLabel, { color: variant.colors.accent }]}>{variant.label}</Text>
          <Text style={styles.variantTitle}>{variant.title}</Text>
        </View>
        <Text style={styles.principle}>{variant.principle}</Text>
        {variant.notes.map((note) => (
          <Text key={note} style={styles.note}>
            {note}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function SessionOrbMockups() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Aire visual reset</Text>
        <Text style={styles.heading}>Session direction board</Text>
        <Text style={styles.subheading}>Три разных визуальных языка орба. Production сессия не меняется до выбора.</Text>
      </View>

      {sessionOrbMockupVariants.map((variant) => (
        <DirectionCard key={variant.id} variant={variant} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050812",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    width: CARD_WIDTH,
    gap: spacing.xs,
  },
  kicker: {
    color: "#6BE2F2",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heading: {
    fontFamily: fontFamily.display,
    color: "#F2F6FA",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
  },
  subheading: {
    color: "rgba(230,238,247,0.58)",
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: PHONE_HEIGHT,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cardTop: {
    zIndex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    color: "#F2F6FA",
    backgroundColor: "rgba(255,255,255,0.07)",
    fontSize: 34,
    lineHeight: 39,
    textAlign: "center",
  },
  end: {
    color: "rgba(242,246,250,0.68)",
    fontSize: 15,
    fontWeight: "500",
  },
  cardBody: {
    zIndex: 1,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  orbWrap: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  layer: {
    position: "absolute",
    width: ORB_SIZE,
    height: ORB_SIZE,
  },
  orbText: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  thinPhase: {
    fontFamily: fontFamily.display,
    color: "#EAFBFF",
    fontSize: 22,
    fontWeight: "400",
    letterSpacing: 1,
    opacity: 0.8,
  },
  thinCountdown: {
    fontFamily: fontFamily.display,
    color: "#F4FEFF",
    fontSize: 70,
    fontWeight: "200",
    lineHeight: 78,
  },
  outsideTextBlock: {
    alignItems: "center",
  },
  outsidePhase: {
    fontFamily: fontFamily.display,
    color: "#F4FBFF",
    fontSize: 30,
    fontWeight: "600",
    letterSpacing: 1,
  },
  outsideCountdown: {
    fontFamily: fontFamily.display,
    color: "#F4FBFF",
    fontSize: 56,
    fontWeight: "300",
    lineHeight: 62,
  },
  phrase: {
    color: "rgba(232,241,250,0.74)",
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 26,
    textAlign: "center",
  },
  controls: {
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 80,
    paddingBottom: spacing.lg,
  },
  roundButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(220,244,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.045)",
  },
  controlIcon: {
    color: "#EAF6FF",
    fontSize: 24,
    fontWeight: "400",
  },
  decisionPanel: {
    zIndex: 1,
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.09)",
    paddingTop: spacing.md,
  },
  decisionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  variantLabel: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  variantTitle: {
    color: "#F2F6FA",
    fontSize: 15,
    fontWeight: "800",
  },
  principle: {
    color: "rgba(242,246,250,0.72)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  note: {
    color: "rgba(242,246,250,0.52)",
    fontSize: 12,
    lineHeight: 17,
  },
});
