import { useCallback, useRef, useState } from "react";
import { estimateBpm } from "./estimateBpm";
import type { PulseReading } from "./ppgTypes";

const MEASURE_SECONDS = 25;

export type MeasurePhase = "idle" | "measuring" | "done" | "error";

export type UsePulseMeasurementResult = Readonly<{
  phase: MeasurePhase;
  progress: number;
  reading: PulseReading | null;
  errorMsg: string | null;
  start: () => void;
  cancel: () => void;
  handleFrame: (redAvg: number, fps: number) => void;
  handleError: (msg: string) => void;
}>;

export function usePulseMeasurement(): UsePulseMeasurementResult {
  const [phase, setPhase] = useState<MeasurePhase>("idle");
  const [progress, setProgress] = useState(0);
  const [reading, setReading] = useState<PulseReading | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const signalRef = useRef<number[]>([]);

  const start = useCallback(() => {
    signalRef.current = [];
    setProgress(0);
    setReading(null);
    setErrorMsg(null);
    setPhase("measuring");
  }, []);

  const cancel = useCallback(() => {
    signalRef.current = [];
    setProgress(0);
    setReading(null);
    setErrorMsg(null);
    setPhase("idle");
  }, []);

  const handleFrame = useCallback((redAvg: number, fps: number) => {
    signalRef.current.push(redAvg);
    const target = fps * MEASURE_SECONDS;
    const p = Math.min(signalRef.current.length / target, 1);
    setProgress(p);
    if (signalRef.current.length >= target) {
      const result = estimateBpm(signalRef.current, fps);
      setReading(result);
      setPhase("done");
    }
  }, []);

  const handleError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setPhase("error");
  }, []);

  return { phase, progress, reading, errorMsg, start, cancel, handleFrame, handleError };
}
