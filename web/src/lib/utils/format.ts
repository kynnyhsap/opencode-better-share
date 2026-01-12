/**
 * Format duration from milliseconds to seconds string
 */
export function formatDuration(startMs: number, endMs?: number): string {
  if (!endMs) return "";
  const durationSec = (endMs - startMs) / 1000;
  return `${durationSec.toFixed(1)}s`;
}
