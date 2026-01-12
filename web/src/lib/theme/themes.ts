// Import all TUI theme JSON files
import auraTheme from "../themes/aura.json";
import ayuTheme from "../themes/ayu.json";
import catppuccinTheme from "../themes/catppuccin.json";
import catppuccinFrappeTheme from "../themes/catppuccin-frappe.json";
import catppuccinMacchiatoTheme from "../themes/catppuccin-macchiato.json";
import cobalt2Theme from "../themes/cobalt2.json";
import cursorTheme from "../themes/cursor.json";
import draculaTheme from "../themes/dracula.json";
import everforestTheme from "../themes/everforest.json";
import flexokiTheme from "../themes/flexoki.json";
import githubTheme from "../themes/github.json";
import gruvboxTheme from "../themes/gruvbox.json";
import kanagawaTheme from "../themes/kanagawa.json";
import lucentOrngTheme from "../themes/lucent-orng.json";
import materialTheme from "../themes/material.json";
import matrixTheme from "../themes/matrix.json";
import mercuryTheme from "../themes/mercury.json";
import monokaiTheme from "../themes/monokai.json";
import nightowlTheme from "../themes/nightowl.json";
import nordTheme from "../themes/nord.json";
import oneDarkTheme from "../themes/one-dark.json";
import opencodeTheme from "../themes/opencode.json";
import orngTheme from "../themes/orng.json";
import osakaJadeTheme from "../themes/osaka-jade.json";
import palenightTheme from "../themes/palenight.json";
import rosepineTheme from "../themes/rosepine.json";
import solarizedTheme from "../themes/solarized.json";
import synthwave84Theme from "../themes/synthwave84.json";
import tokyonightTheme from "../themes/tokyonight.json";
import vercelTheme from "../themes/vercel.json";
import vesperTheme from "../themes/vesper.json";
import zenburnTheme from "../themes/zenburn.json";
import type { TuiTheme } from "./types";

export const THEMES: Record<string, TuiTheme> = {
  opencode: opencodeTheme as TuiTheme,
  aura: auraTheme as TuiTheme,
  ayu: ayuTheme as TuiTheme,
  "catppuccin-frappe": catppuccinFrappeTheme as TuiTheme,
  "catppuccin-macchiato": catppuccinMacchiatoTheme as TuiTheme,
  catppuccin: catppuccinTheme as TuiTheme,
  cobalt2: cobalt2Theme as TuiTheme,
  cursor: cursorTheme as TuiTheme,
  dracula: draculaTheme as TuiTheme,
  everforest: everforestTheme as TuiTheme,
  flexoki: flexokiTheme as TuiTheme,
  github: githubTheme as TuiTheme,
  gruvbox: gruvboxTheme as TuiTheme,
  kanagawa: kanagawaTheme as TuiTheme,
  "lucent-orng": lucentOrngTheme as TuiTheme,
  material: materialTheme as TuiTheme,
  matrix: matrixTheme as TuiTheme,
  mercury: mercuryTheme as TuiTheme,
  monokai: monokaiTheme as TuiTheme,
  nightowl: nightowlTheme as TuiTheme,
  nord: nordTheme as TuiTheme,
  "one-dark": oneDarkTheme as TuiTheme,
  orng: orngTheme as TuiTheme,
  "osaka-jade": osakaJadeTheme as TuiTheme,
  palenight: palenightTheme as TuiTheme,
  rosepine: rosepineTheme as TuiTheme,
  solarized: solarizedTheme as TuiTheme,
  synthwave84: synthwave84Theme as TuiTheme,
  tokyonight: tokyonightTheme as TuiTheme,
  vercel: vercelTheme as TuiTheme,
  vesper: vesperTheme as TuiTheme,
  zenburn: zenburnTheme as TuiTheme,
};

// Theme display names
const THEME_NAMES: Record<string, string> = {
  opencode: "OpenCode",
  aura: "Aura",
  ayu: "Ayu",
  "catppuccin-frappe": "Catppuccin Frappé",
  "catppuccin-macchiato": "Catppuccin Macchiato",
  catppuccin: "Catppuccin",
  cobalt2: "Cobalt2",
  cursor: "Cursor",
  dracula: "Dracula",
  everforest: "Everforest",
  flexoki: "Flexoki",
  github: "GitHub",
  gruvbox: "Gruvbox",
  kanagawa: "Kanagawa",
  "lucent-orng": "Lucent Orng",
  material: "Material",
  matrix: "Matrix",
  mercury: "Mercury",
  monokai: "Monokai",
  nightowl: "Night Owl",
  nord: "Nord",
  "one-dark": "One Dark",
  orng: "Orng",
  "osaka-jade": "Osaka Jade",
  palenight: "Palenight",
  rosepine: "Rosé Pine",
  solarized: "Solarized",
  synthwave84: "Synthwave '84",
  tokyonight: "Tokyo Night",
  vercel: "Vercel",
  vesper: "Vesper",
  zenburn: "Zenburn",
};

export const THEME_LIST = Object.keys(THEMES).map((id) => ({
  id,
  name: THEME_NAMES[id] || id,
}));

export const DEFAULT_THEME_ID = "opencode";
