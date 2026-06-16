import { describe, expect, it } from "vitest";
import type { BreathingPattern } from "@/types/breathing";
import {
  advanceTimerSnapshot,
  createTimerSnapshot,
  getPhaseRemainingSeconds,
  getPatternDuration
} from "@/features/session/useBreathingTimer";

const pattern: BreathingPattern = {
  rounds: 2,
  phases: [
    {
      name: "inhale",
      label: "Вдох",
      shortLabel: "Вдох",
      durationSeconds: 4,
      cueTone: "start"
    },
    {
      name: "exhale",
      label: "Выдох",
      shortLabel: "Выдох",
      durationSeconds: 6,
      cueTone: "soft"
    }
  ]
};

describe("getPatternDuration", () => {
  it("calculates total duration across rounds", () => {
    expect(getPatternDuration(pattern)).toBe(20);
  });
});

describe("advanceTimerSnapshot", () => {
  it("advances to the next breathing phase after phase duration", () => {
    const snapshot = createTimerSnapshot(pattern, "running");
    const advanced = advanceTimerSnapshot(pattern, snapshot, 4);

    expect(advanced.phaseIndex).toBe(1);
    expect(advanced.currentPhase.name).toBe("exhale");
    expect(advanced.totalRemainingSeconds).toBe(16);
  });

  it("does not advance while paused", () => {
    const snapshot = createTimerSnapshot(pattern, "paused");
    const advanced = advanceTimerSnapshot(pattern, snapshot, 10);

    expect(advanced).toBe(snapshot);
  });

  it("marks the session completed at the end", () => {
    const snapshot = createTimerSnapshot(pattern, "running");
    const advanced = advanceTimerSnapshot(pattern, snapshot, 20);

    expect(advanced.status).toBe("completed");
    expect(advanced.totalRemainingSeconds).toBe(0);
    expect(advanced.progress).toBe(1);
  });
});

describe("getPhaseRemainingSeconds", () => {
  it("returns the full current phase duration at phase start", () => {
    const snapshot = createTimerSnapshot(pattern, "running");

    expect(getPhaseRemainingSeconds(snapshot)).toBe(4);
  });

  it("returns remaining seconds during the current phase", () => {
    const snapshot = createTimerSnapshot(pattern, "running");
    const advanced = advanceTimerSnapshot(pattern, snapshot, 1);

    expect(getPhaseRemainingSeconds(advanced)).toBe(3);
  });

  it("returns the next phase duration at an exact phase boundary", () => {
    const snapshot = createTimerSnapshot(pattern, "running");
    const advanced = advanceTimerSnapshot(pattern, snapshot, 4);

    expect(advanced.currentPhase.name).toBe("exhale");
    expect(getPhaseRemainingSeconds(advanced)).toBe(6);
  });

  it("returns zero for a completed session", () => {
    const snapshot = createTimerSnapshot(pattern, "running");
    const completed = advanceTimerSnapshot(pattern, snapshot, 20);

    expect(getPhaseRemainingSeconds(completed)).toBe(0);
  });

  it("derives remaining seconds safely for a paused snapshot", () => {
    const snapshot = createTimerSnapshot(pattern, "paused");

    expect(getPhaseRemainingSeconds(snapshot)).toBe(4);
  });
});
