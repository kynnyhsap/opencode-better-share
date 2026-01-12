"use client";

import type { ComponentType, JSX } from "react";
import { useMemo } from "react";
import { Streamdown } from "streamdown";
import type { ColorScheme } from "@/lib/theme";
import type { ThemeStyles } from "./ShareViewer";

interface MarkdownContentProps {
  content: string;
  colorScheme: ColorScheme;
  themeStyles: ThemeStyles;
}

type Components = {
  [Key in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[Key]>;
};

function createMarkdownComponents(themeStyles: ThemeStyles): Components {
  const headingStyle = {
    color: themeStyles.markdownHeading,
    fontWeight: 600,
    marginTop: "1.25em",
    marginBottom: "0.5em",
  };

  return {
    // Headings
    h1: ({ children, ...props }) => (
      <h1 style={{ ...headingStyle, fontSize: "1.5em" }} {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 style={{ ...headingStyle, fontSize: "1.25em" }} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 style={{ ...headingStyle, fontSize: "1.1em" }} {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 style={{ ...headingStyle, fontSize: "1em" }} {...props}>
        {children}
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 style={{ ...headingStyle, fontSize: "0.9em" }} {...props}>
        {children}
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 style={{ ...headingStyle, fontSize: "0.85em" }} {...props}>
        {children}
      </h6>
    ),

    // Links
    a: ({ children, ...props }) => (
      <a
        style={{
          color: themeStyles.markdownLink,
          textDecoration: "none",
        }}
        {...props}
      >
        {children}
      </a>
    ),

    // Inline code
    code: ({ children, className, ...props }) => {
      // If it has a className, it's likely a code block (handled by Shiki)
      if (className) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      // Inline code
      return (
        <code
          style={{
            color: themeStyles.markdownCode,
            backgroundColor: themeStyles.bgSecondary,
            padding: "0.15em 0.4em",
            borderRadius: "4px",
            fontSize: "0.9em",
          }}
          {...props}
        >
          {children}
        </code>
      );
    },

    // Strong/bold
    strong: ({ children, ...props }) => (
      <strong style={{ color: themeStyles.markdownStrong, fontWeight: 600 }} {...props}>
        {children}
      </strong>
    ),

    // Blockquote
    blockquote: ({ children, ...props }) => (
      <blockquote
        style={{
          borderLeft: `3px solid ${themeStyles.markdownHeading}`,
          paddingLeft: "1em",
          margin: "1em 0",
          color: themeStyles.textMuted,
        }}
        {...props}
      >
        {children}
      </blockquote>
    ),

    // Lists - use dashes like TUI
    ul: ({ children, ...props }) => (
      <ul
        style={{
          paddingLeft: "0",
          margin: "0.5em 0",
          listStyle: "none",
        }}
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol style={{ paddingLeft: "1.5em", margin: "0.5em 0" }} {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li
        style={{
          margin: "0.25em 0",
          display: "flex",
          gap: "0.5em",
        }}
        {...props}
      >
        <span style={{ color: themeStyles.primary }}>-</span>
        <span>{children}</span>
      </li>
    ),

    // Paragraphs
    p: ({ children, ...props }) => (
      <p style={{ margin: "0.75em 0" }} {...props}>
        {children}
      </p>
    ),

    // Horizontal rule
    hr: (props) => (
      <hr
        style={{
          border: "none",
          borderTop: `1px solid ${themeStyles.border}`,
          margin: "1.5em 0",
        }}
        {...props}
      />
    ),

    // Tables - no header background, consistent border color
    table: ({ children, ...props }) => (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          margin: "1em 0",
        }}
        {...props}
      >
        {children}
      </table>
    ),
    thead: ({ children, ...props }) => <thead {...props}>{children}</thead>,
    tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
    tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
    th: ({ children, ...props }) => (
      <th
        style={{
          padding: "0.5em 1em",
          textAlign: "left",
          fontWeight: 600,
          color: themeStyles.markdownHeading,
          border: `1px solid ${themeStyles.border}`,
        }}
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        style={{
          padding: "0.5em 1em",
          border: `1px solid ${themeStyles.border}`,
        }}
        {...props}
      >
        {children}
      </td>
    ),
  };
}

export function MarkdownContent({ content, colorScheme, themeStyles }: MarkdownContentProps) {
  const isDark = colorScheme === "dark";

  const components = useMemo(() => createMarkdownComponents(themeStyles), [themeStyles]);

  return (
    <div
      className={isDark ? "dark" : ""}
      style={{
        fontSize: "0.875rem",
        lineHeight: 1.7,
        color: themeStyles.text,
      }}
    >
      <Streamdown
        mode="static"
        shikiTheme={isDark ? ["github-dark", "github-light"] : ["github-light", "github-dark"]}
        controls={false}
        components={components}
      >
        {content}
      </Streamdown>
    </div>
  );
}
