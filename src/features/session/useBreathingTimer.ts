import { useCallback, useEffect, useMemo, useState } from "react";
import type { BreathingPattern, TimerSnapshot } from "@/types/breathing";
import {
  advanceTimerSnapshot,
  createTimerSnapshot,
  getPhaseRemainingSeconds,
  getPatternDuration
} from "@/features/session/timerCore";

const TICK_SECONDS = 1;

export function useBreathingTimer(pattern: BreathingPattern) {
  const initialSnapshot = useMemo(() => createTimerSnapshot(pattern), [pattern]);
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(initialSnapshot);

  useEffect(() => {
    setSnapshot(initialSnapshot);
  }, [initialSnapshot]);

  useEffect(() => {
    if (snapshot.status !== "running") {
      return undefined;
    }

    const interval = setInterval(() => {
      setSnapshot((current) => advanceTimerSnapshot(pattern, current, TICK_SECONDS));
    }, TICK_SECONDS * 1000);

    return () => clearInterval(interval);
  }, [pattern, snapshot.status]);

  const start = useCallback(() => {
    setSnapshot((current) => ({
      ...current,
      status: current.status === "completed" ? "completed" : "running"
    }));
  }, []);

  const pause = useCallback(() => {
    setSnapshot((current) => ({
      ...current,
      status: current.status === "completed" ? "completed" : "paused"
    }));
  }, []);

  const reset = useCallback(() => {
    setSnapshot(createTimerSnapshot(pattern));
  }, [pattern]);

  const restart = useCallback(() => {
    setSnapshot(createTimerSnapshot(pattern, "running"));
  }, [pattern]);

  return {
    snapshot,
    start,
    pause,
    reset,
    restart,
    isRunning: snapshot.status === "running",
    isCompleted: snapshot.status === "completed"
  };
}

export { advanceTimerSnapshot, createTimerSnapshot, getPhaseRemainingSeconds, getPatternDuration };
