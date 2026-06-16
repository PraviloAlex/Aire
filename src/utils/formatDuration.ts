export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatMinutes(totalSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));

  return `${minutes} мин`;
}
