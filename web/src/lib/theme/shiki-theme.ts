import type { ThemeStyles } from "./resolve";

/**
 * CSS variable names for syntax highlighting
 * These are used in the Shiki theme and set via inline styles
 */
export const SYNTAX_CSS_VARS = {
  comment: "--syntax-comment",
  keyword: "--syntax-keyword",
  string: "--syntax-string",
  number: "--syntax-number",
  function: "--syntax-function",
  variable: "--syntax-variable",
  type: "--syntax-type",
  operator: "--syntax-operator",
  property: "--syntax-property",
  punctuation: "--syntax-punctuation",
  diffAdd: "--syntax-diff-add",
  diffDelete: "--syntax-diff-delete",
} as const;

/**
 * Generate a Shiki theme that uses CSS variables
 * This allows the theme to be registered once and colors to change via CSS
 * Based on OpenCode's approach in packages/ui/src/context/marked.tsx
 */
export function generateCSSVarShikiTheme(name = "better-share") {
  return {
    name,
    type: "dark" as const,
    colors: {
      "editor.background": "transparent",
      "editor.foreground": "var(--text)",
      "gitDecoration.addedResourceForeground": `var(${SYNTAX_CSS_VARS.diffAdd})`,
      "gitDecoration.deletedResourceForeground": `var(${SYNTAX_CSS_VARS.diffDelete})`,
    },
    settings: [],
    fg: "var(--text)",
    bg: "transparent",
    tokenColors: [
      // Comments
      {
        scope: ["comment", "punctuation.definition.comment", "string.comment"],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.comment})`,
        },
      },
      // Keywords
      {
        scope: ["keyword", "storage", "storage.type"],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.keyword})`,
        },
      },
      // Operators
      {
        scope: [
          "keyword.operator",
          "storage.type.function.arrow",
          "punctuation.separator.key-value",
        ],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.operator})`,
        },
      },
      // Strings
      {
        scope: [
          "string",
          "punctuation.definition.string",
          "string punctuation.section.embedded source",
        ],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.string})`,
        },
      },
      // Numbers and constants
      {
        scope: [
          "constant",
          "constant.numeric",
          "constant.language",
          "entity.name.constant",
          "variable.other.constant",
        ],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.number})`,
        },
      },
      // Functions
      {
        scope: ["entity.name.function", "support.function", "meta.function-call"],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.function})`,
        },
      },
      // Variables
      {
        scope: ["variable", "variable.other", "variable.parameter"],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.variable})`,
        },
      },
      // Types
      {
        scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.type})`,
        },
      },
      // Properties
      {
        scope: ["variable.other.property", "meta.property-name", "entity.other.attribute-name"],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.property})`,
        },
      },
      // Tags (HTML/JSX)
      {
        scope: ["entity.name.tag", "support.class.component"],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.variable})`,
        },
      },
      // Punctuation
      {
        scope: ["punctuation", "meta.brace", "meta.bracket"],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.punctuation})`,
        },
      },
      // Diff markers
      {
        scope: ["markup.deleted", "meta.diff.header.from-file", "punctuation.definition.deleted"],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.diffDelete})`,
        },
      },
      {
        scope: ["markup.inserted", "meta.diff.header.to-file", "punctuation.definition.inserted"],
        settings: {
          foreground: `var(${SYNTAX_CSS_VARS.diffAdd})`,
        },
      },
    ],
    semanticTokenColors: {
      comment: `var(${SYNTAX_CSS_VARS.comment})`,
      string: `var(${SYNTAX_CSS_VARS.string})`,
      number: `var(${SYNTAX_CSS_VARS.number})`,
      keyword: `var(${SYNTAX_CSS_VARS.keyword})`,
      variable: `var(${SYNTAX_CSS_VARS.variable})`,
      parameter: `var(${SYNTAX_CSS_VARS.variable})`,
      property: `var(${SYNTAX_CSS_VARS.property})`,
      function: `var(${SYNTAX_CSS_VARS.function})`,
      method: `var(${SYNTAX_CSS_VARS.function})`,
      type: `var(${SYNTAX_CSS_VARS.type})`,
      class: `var(${SYNTAX_CSS_VARS.type})`,
      namespace: `var(${SYNTAX_CSS_VARS.type})`,
    },
  };
}

/**
 * Generate CSS variables for syntax highlighting from theme styles
 * These are applied to the component wrapper to make the Shiki theme work
 */
export function generateSyntaxCSSVars(themeStyles: ThemeStyles): Record<string, string> {
  return {
    [SYNTAX_CSS_VARS.comment]: themeStyles.syntaxComment,
    [SYNTAX_CSS_VARS.keyword]: themeStyles.syntaxKeyword,
    [SYNTAX_CSS_VARS.string]: themeStyles.syntaxString,
    [SYNTAX_CSS_VARS.number]: themeStyles.syntaxNumber,
    [SYNTAX_CSS_VARS.function]: themeStyles.syntaxFunction,
    [SYNTAX_CSS_VARS.variable]: themeStyles.syntaxVariable,
    [SYNTAX_CSS_VARS.type]: themeStyles.syntaxType,
    [SYNTAX_CSS_VARS.operator]: themeStyles.syntaxOperator,
    [SYNTAX_CSS_VARS.property]: themeStyles.syntaxFunction, // Use function color for properties
    [SYNTAX_CSS_VARS.punctuation]: themeStyles.textMuted,
    [SYNTAX_CSS_VARS.diffAdd]: themeStyles.diffAdded,
    [SYNTAX_CSS_VARS.diffDelete]: themeStyles.diffRemoved,
  };
}

/**
 * Generate CSS overrides for @pierre/diffs unsafeCSS option
 * This applies our theme colors to the diff viewer backgrounds and UI elements
 */
export function generateDiffCSS(themeStyles: ThemeStyles): string {
  return `
    :host {
      --diffs-bg-buffer-override: ${themeStyles.bgSecondary};
      --diffs-bg-context-override: ${themeStyles.bg};
      --diffs-bg-hover-override: ${themeStyles.bgElement};
      --diffs-bg-separator-override: ${themeStyles.bgSecondary};
      
      --diffs-fg-number-override: ${themeStyles.textMuted};
      --diffs-fg-number-addition-override: ${themeStyles.diffAdded};
      --diffs-fg-number-deletion-override: ${themeStyles.diffRemoved};
      
      --diffs-addition-color-override: ${themeStyles.diffAdded};
      --diffs-deletion-color-override: ${themeStyles.diffRemoved};
      
      --diffs-bg-addition-override: ${themeStyles.diffAddedBg};
      --diffs-bg-addition-number-override: ${themeStyles.diffAddedBg};
      --diffs-bg-addition-hover-override: ${themeStyles.diffAddedBg};
      --diffs-bg-addition-emphasis-override: ${themeStyles.diffAdded}40;
      
      --diffs-bg-deletion-override: ${themeStyles.diffRemovedBg};
      --diffs-bg-deletion-number-override: ${themeStyles.diffRemovedBg};
      --diffs-bg-deletion-hover-override: ${themeStyles.diffRemovedBg};
      --diffs-bg-deletion-emphasis-override: ${themeStyles.diffRemoved}40;
    }
  `;
}
