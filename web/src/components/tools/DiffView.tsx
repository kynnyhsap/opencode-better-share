"use client";

import type { ThemeRegistrationResolved } from "@pierre/diffs";
import { registerCustomTheme } from "@pierre/diffs";
import { PatchDiff } from "@pierre/diffs/react";
import { type CSSProperties, useEffect, useState } from "react";
import type { ThemeStyles } from "@/lib/theme";
import { generateCSSVarShikiTheme, generateDiffCSS, generateSyntaxCSSVars } from "@/lib/theme";

// Custom theme name for our dynamic theme
const CUSTOM_THEME_NAME = "better-share";

// Track if theme has been registered (module-level singleton)
let themeRegistered = false;

// Register the theme once at module load time
function ensureThemeRegistered() {
  if (themeRegistered) return;

  registerCustomTheme(CUSTOM_THEME_NAME, () => {
    const theme = generateCSSVarShikiTheme(CUSTOM_THEME_NAME);
    return Promise.resolve(theme as unknown as ThemeRegistrationResolved);
  });

  themeRegistered = true;
}

interface DiffViewProps {
  diff: string;
  filePath?: string;
  themeStyles?: ThemeStyles;
}

/**
 * Diff view component using @pierre/diffs
 * Uses split (side-by-side) view like OpenCode TUI
 * Supports theme customization via CSS variables and Shiki syntax highlighting
 */
export function DiffView({ diff, themeStyles }: DiffViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    ensureThemeRegistered();
    setIsClient(true);
  }, []);

  if (!diff) {
    return null;
  }

  // Generate CSS overrides for diff colors
  const unsafeCSS = themeStyles ? generateDiffCSS(themeStyles) : undefined;

  // Generate CSS variables for syntax highlighting
  const syntaxVars = themeStyles ? generateSyntaxCSSVars(themeStyles) : {};

  // Use custom theme if registered, otherwise fall back to github-dark
  const themeName = isClient ? CUSTOM_THEME_NAME : "github-dark";

  return (
    <div style={syntaxVars as CSSProperties}>
      <PatchDiff
        patch={diff}
        options={{
          theme: themeName,
          diffStyle: "split",
          diffIndicators: "classic",
          disableFileHeader: true,
          disableLineNumbers: false,
          overflow: "scroll",
          unsafeCSS,
        }}
        style={{
          fontSize: "0.75rem",
        }}
      />
    </div>
  );
}
