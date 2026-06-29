export type PulseQuality = "good" | "weak" | "none";

export type PulseReading = Readonly<{
  bpm: number | null;
  quality: PulseQuality;
}>;
