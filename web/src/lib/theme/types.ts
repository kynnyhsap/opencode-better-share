/**
 * TUI Theme types - matches OpenCode TUI theme format
 */

export type ColorScheme = "light" | "dark";

/** Theme definitions - raw color values */
export type ThemeDefs = Record<string, string>;

/**
 * Theme token value can be:
 * - A reference string to a def (e.g., "darkFg")
 * - A raw hex color (e.g., "#ffffff")
 * - An object with dark/light variants (e.g., { dark: "darkFg", light: "lightFg" })
 */
export type ThemeTokenValue = string | { dark: string; light: string };

/** Theme tokens - the actual theme colors */
export type ThemeTokens = Record<string, ThemeTokenValue>;

/** Complete TUI theme definition */
export interface TuiTheme {
  $schema?: string;
  defs: ThemeDefs;
  theme: ThemeTokens;
}

/** Resolved theme with actual color values */
export type ResolvedTheme = Record<string, string>;
