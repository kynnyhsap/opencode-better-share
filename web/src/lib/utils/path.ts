/**
 * Normalize path to show relative from project root
 * Finds common project indicators and truncates the path
 */
export function normalizePath(path: string): string {
  const indicators = ["/src/", "/lib/", "/app/", "/components/", "/packages/"];
  for (const indicator of indicators) {
    const idx = path.indexOf(indicator);
    if (idx !== -1) {
      return `..${path.slice(idx)}`;
    }
  }
  // Fallback: just show last 2 segments
  const parts = path.split("/");
  if (parts.length > 2) {
    return `../${parts.slice(-2).join("/")}`;
  }
  return path;
}
