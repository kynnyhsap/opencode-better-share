import type { ColorScheme, ResolvedTheme, TuiTheme } from "./types";

/**
 * Resolve a TUI theme to actual color values for a given color scheme
 */
export function resolveTheme(theme: TuiTheme, colorScheme: ColorScheme): ResolvedTheme {
  const { defs, theme: tokens } = theme;
  const mode = colorScheme === "dark" ? "dark" : "light";

  const resolved: ResolvedTheme = {};

  // Helper to resolve a color reference
  const resolveColor = (ref: string): string => {
    // If it's a reference to a def, look it up
    if (ref in defs) {
      return defs[ref];
    }
    // Otherwise it's a raw color value
    return ref;
  };

  // Resolve all theme tokens
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === "object" && value !== null && mode in value) {
      const colorRef = (value as Record<string, string>)[mode];
      resolved[key] = resolveColor(colorRef);
    }
  }

  return resolved;
}

/**
 * Convert resolved theme to a style object for React components
 */
export function themeToStyles(resolved: ResolvedTheme) {
  return {
    // Core
    primary: resolved.primary || "#fab283",
    secondary: resolved.secondary || "#5c9cf5",
    accent: resolved.accent || "#9d7cd8",
    error: resolved.error || "#e06c75",
    warning: resolved.warning || "#f5a742",
    success: resolved.success || "#7fd88f",
    info: resolved.info || "#56b6c2",

    // Text
    text: resolved.text || "#eeeeee",
    textMuted: resolved.textMuted || "#808080",

    // Backgrounds
    bg: resolved.background || "#0a0a0a",
    bgSecondary: resolved.backgroundPanel || "#141414",
    bgElement: resolved.backgroundElement || "#1e1e1e",

    // Borders
    border: resolved.border || "#484848",
    borderActive: resolved.borderActive || "#606060",
    borderWeak: resolved.borderSubtle || "#3c3c3c",

    // Markdown
    markdownHeading: resolved.markdownHeading || "#9d7cd8",
    markdownText: resolved.markdownText || "#eeeeee",
    markdownLink: resolved.markdownLink || "#fab283",
    markdownLinkText: resolved.markdownLinkText || "#56b6c2",
    markdownCode: resolved.markdownCode || "#7fd88f",
    markdownStrong: resolved.markdownStrong || "#f5a742",

    // Syntax
    syntaxComment: resolved.syntaxComment || "#808080",
    syntaxKeyword: resolved.syntaxKeyword || "#9d7cd8",
    syntaxString: resolved.syntaxString || "#7fd88f",
    syntaxFunction: resolved.syntaxFunction || "#fab283",
    syntaxVariable: resolved.syntaxVariable || "#e06c75",
    syntaxNumber: resolved.syntaxNumber || "#f5a742",
    syntaxType: resolved.syntaxType || "#e5c07b",
    syntaxOperator: resolved.syntaxOperator || "#56b6c2",

    // Diff
    diffAdded: resolved.diffAdded || "#4fd6be",
    diffRemoved: resolved.diffRemoved || "#c53b53",
    diffAddedBg: resolved.diffAddedBg || "#20303b",
    diffRemovedBg: resolved.diffRemovedBg || "#37222c",
  };
}

export type ThemeStyles = ReturnType<typeof themeToStyles>;
