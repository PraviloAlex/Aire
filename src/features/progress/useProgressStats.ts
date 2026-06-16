import { useEffect, useState } from "react";
import { loadSessionHistory } from "@/storage/sessionStorage";
import { computeProgressStats, type ProgressStats } from "@/features/progress/progressStats";

const EMPTY_STATS: ProgressStats = {
  totalSessions: 0,
  totalMinutes: 0,
  topGoal: null,
  weekSessions: 0,
  isFirstTime: true,
};

export function useProgressStats(): { stats: ProgressStats; isLoading: boolean } {
  const [stats, setStats] = useState<ProgressStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessionHistory()
      .then((records) => setStats(computeProgressStats(records)))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}
