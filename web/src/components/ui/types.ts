import type { ThemeStyles } from "@/lib/theme";

/**
 * Common props for themed components
 */
export interface ThemedProps {
  themeStyles: ThemeStyles;
}

/**
 * Re-export ThemeStyles for convenience
 */
export type { ThemeStyles };
