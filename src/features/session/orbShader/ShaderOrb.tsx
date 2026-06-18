import { BreathingOrb } from "@/features/session/BreathingOrb";
import type { BreathingGoal, BreathingPhaseName } from "@/types/breathing";

type ShaderOrbProps = Readonly<{
  goal: BreathingGoal;
  phaseName: BreathingPhaseName;
  durationSeconds: number;
  phaseElapsedSeconds: number;
  isPreparing: boolean;
  running: boolean;
  size?: number;
}>;

// Native/умолчательный fallback: богатый WebGL-эффект только в ShaderOrb.web.tsx.
// На native рендерим прежний орб, чтобы не было регрессий.
export function ShaderOrb({ goal, phaseName, durationSeconds, running, size }: ShaderOrbProps) {
  return (
    <BreathingOrb
      goal={goal}
      phaseName={phaseName}
      durationSeconds={durationSeconds}
      running={running}
      size={size}
    />
  );
}
