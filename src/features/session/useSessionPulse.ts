import { useCallback, useEffect, useState } from "react";

type UseSessionPulseArgs = Readonly<{
  isPreparing: boolean;
}>;

type SessionPulse = Readonly<{
  bpmBefore: number | null;
  isPulseMeasureOpen: boolean;
  openPulseMeasure: () => void;
  closePulseMeasure: () => void;
  completePulseMeasure: (bpm: number | null) => void;
}>;

/**
 * Состояние замера пульса до сессии: хранит результат (`bpmBefore`),
 * управляет шитом замера и автоматически закрывает его, как только
 * сессия вышла из фазы подготовки.
 */
export function useSessionPulse({ isPreparing }: UseSessionPulseArgs): SessionPulse {
  const [bpmBefore, setBpmBefore] = useState<number | null>(null);
  const [isPulseMeasureOpen, setIsPulseMeasureOpen] = useState(false);

  // Закрыть шит замера автоматически, если сессия уже стартовала.
  useEffect(() => {
    if (!isPreparing) {
      setIsPulseMeasureOpen(false);
    }
  }, [isPreparing]);

  const openPulseMeasure = useCallback(() => setIsPulseMeasureOpen(true), []);
  const closePulseMeasure = useCallback(() => setIsPulseMeasureOpen(false), []);
  const completePulseMeasure = useCallback((bpm: number | null) => {
    setBpmBefore(bpm);
    setIsPulseMeasureOpen(false);
  }, []);

  return { bpmBefore, isPulseMeasureOpen, openPulseMeasure, closePulseMeasure, completePulseMeasure };
}
