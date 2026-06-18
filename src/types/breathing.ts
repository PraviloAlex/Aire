export type BreathingGoal =
  | "calm"
  | "focus"
  | "fear"
  | "recover"
  | "sleep"
  | "pain"
  | "irritation";

export type BreathingPhaseName =
  | "inhale"
  | "hold"
  | "exhale"
  | "pause"
  | "sigh"
  | "rest";

export type PracticeIntensity = "gentle" | "balanced" | "active";

export type SessionStatus = "idle" | "running" | "paused" | "completed";

export type BreathingPhase = Readonly<{
  name: BreathingPhaseName;
  label: string;
  shortLabel: string;
  durationSeconds: number;
  cueTone: "start" | "shift" | "soft" | "none";
}>;

export type BreathingPattern = Readonly<{
  rounds: number;
  phases: readonly BreathingPhase[];
}>;

export type BreathingPractice = Readonly<{
  id: string;
  title: string;
  subtitle: string;
  goal: BreathingGoal;
  goals: readonly BreathingGoal[];
  durationSeconds: number;
  intensity: PracticeIntensity;
  recommended: boolean;
  evidenceLevel?: "strong" | "moderate" | "gentle" | "experimental";
  homePriority?: number;
  summary: string;
  benefits: readonly string[];
  safetyNote: string;
  pattern: BreathingPattern;
}>;

export type SessionCueSettings = Readonly<{
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}>;

// Что показывать в центре орба во время сессии.
export type CenterDisplayMode = "phase_count" | "phase" | "clean";

export type TimerSnapshot = Readonly<{
  status: SessionStatus;
  phaseIndex: number;
  roundIndex: number;
  phaseElapsedSeconds: number;
  totalElapsedSeconds: number;
  totalRemainingSeconds: number;
  currentPhase: BreathingPhase;
  progress: number;
}>;

export type LearnArticle = Readonly<{
  id: string;
  title: string;
  category: string;
  readingTime: string;
  readSeconds: number;
  goals: readonly BreathingGoal[];
  body: string;
}>;

export type ReflectionRating = "worse" | "same" | "better" | "much_better";

export type Situation = Readonly<{
  id: string;
  label: string;
  sublabel: string;
  goal: BreathingGoal;
  icon: string;
}>;

export type SessionRecord = Readonly<{
  id: string;
  practiceId: string;
  goal: BreathingGoal;
  durationSeconds: number;
  completedAt: string;
  reflection: ReflectionRating | null;
  trigger?: string;
  note?: string;
}>;
