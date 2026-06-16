import type {
  BreathingPattern,
  BreathingPhase,
  SessionStatus,
  TimerSnapshot
} from "@/types/breathing";

export function getPatternDuration(pattern: BreathingPattern): number {
  const roundDuration = pattern.phases.reduce(
    (total, phase) => total + Math.max(0, phase.durationSeconds),
    0
  );

  return roundDuration * Math.max(1, pattern.rounds);
}

export function getPhaseRemainingSeconds(snapshot: TimerSnapshot): number {
  if (snapshot.status === "completed") {
    return 0;
  }

  const phaseDuration = Math.max(0, snapshot.currentPhase.durationSeconds);
  const elapsed = Math.max(0, snapshot.phaseElapsedSeconds);

  return Math.max(0, Math.ceil(phaseDuration - elapsed));
}

export function createTimerSnapshot(
  pattern: BreathingPattern,
  status: SessionStatus = "idle"
): TimerSnapshot {
  const firstPhase = getSafePhases(pattern)[0];

  return {
    status,
    phaseIndex: 0,
    roundIndex: 0,
    phaseElapsedSeconds: 0,
    totalElapsedSeconds: 0,
    totalRemainingSeconds: getPatternDuration(pattern),
    currentPhase: firstPhase,
    progress: 0
  };
}

export function advanceTimerSnapshot(
  pattern: BreathingPattern,
  snapshot: TimerSnapshot,
  seconds = 1
): TimerSnapshot {
  if (snapshot.status !== "running") {
    return snapshot;
  }

  const phases = getSafePhases(pattern);
  const totalDuration = getPatternDuration(pattern);
  const nextElapsed = Math.min(totalDuration, snapshot.totalElapsedSeconds + Math.max(0, seconds));

  if (nextElapsed >= totalDuration) {
    return {
      ...snapshot,
      status: "completed",
      phaseElapsedSeconds: snapshot.currentPhase.durationSeconds,
      totalElapsedSeconds: totalDuration,
      totalRemainingSeconds: 0,
      progress: 1
    };
  }

  let cursor = 0;
  const roundDuration = phases.reduce((total, phase) => total + phase.durationSeconds, 0);
  const roundIndex = Math.floor(nextElapsed / roundDuration);
  const elapsedInRound = nextElapsed % roundDuration;
  let phaseIndex = 0;

  for (let index = 0; index < phases.length; index += 1) {
    const phase = phases[index];
    if (elapsedInRound < cursor + phase.durationSeconds) {
      phaseIndex = index;
      break;
    }
    cursor += phase.durationSeconds;
  }

  const currentPhase = phases[phaseIndex];

  return {
    ...snapshot,
    phaseIndex,
    roundIndex,
    phaseElapsedSeconds: elapsedInRound - cursor,
    totalElapsedSeconds: nextElapsed,
    totalRemainingSeconds: totalDuration - nextElapsed,
    currentPhase,
    progress: nextElapsed / totalDuration
  };
}

function getSafePhases(pattern: BreathingPattern): readonly BreathingPhase[] {
  const safePhases = pattern.phases.filter((phase) => phase.durationSeconds > 0);

  if (safePhases.length > 0) {
    return safePhases;
  }

  return [
    {
      name: "rest",
      label: "Отдых",
      shortLabel: "Отдых",
      durationSeconds: 1,
      cueTone: "none"
    }
  ];
}
