/**
 * tokens.ts — Single source of truth for all TeamFlow design tokens.
 *
 * Pure JS/TS values only — no CSS var() references.
 * Import MODULE_ACCENTS from moduleAccents.ts for COLORS.modules.
 */

import { MODULE_ACCENTS } from "./moduleAccents";

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export const COLORS = {
  neutral: {
    0: "#FFFFFF",
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
    950: "#0A0F1A",
  },
  surface: {
    panel1: "#1E1F21",
    panel2: "#EBEBEB",
    panel3: "#FFFFFF",
    header: "#FFFFFF",
    subheader: "transparent",
    footer: "oklch(0.26 0.015 260)",
  },
  text: {
    primary: "#1a1a2e",
    secondary: "#4B5563",
    tertiary: "#9CA3AF",
    onDark: "rgba(255,255,255,0.87)",
    disabled: "#D1D5DB",
  },
  border: {
    default: "#E5E3E0",
    strong: "#D1D0CE",
    subtle: "#F0EFED",
  },
  interactive: {
    hover: "#F3F4F6",
    selected: "rgba(0,0,0,0.06)",
    focus: "#2563EB",
  },
  semantic: {
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
    info: "#2563EB",
    // Badge background/foreground pairs
    successBg: "#DCFCE7",
    successFg: "#15803D",
    warningBg: "#FEF3C7",
    warningFg: "#92400E",
    dangerBg: "#FEE2E2",
    dangerFg: "#991B1B",
    infoBg: "#DBEAFE",
    infoFg: "#1E40AF",
  },
  brand: "#7C3AED",
  modules: MODULE_ACCENTS,
} as const;

// ---------------------------------------------------------------------------
// Spacing (4px base scale)
// ---------------------------------------------------------------------------

export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const TYPOGRAPHY = {
  sizes: {
    micro: 10,
    caption: 12,
    small: 13,
    body: 14,
    bodyLg: 16,
    h3: 18,
    h2: 20,
    h1: 24,
    display: 32,
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    normal: 0,
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.08em",
  },
} as const;

// ---------------------------------------------------------------------------
// Radii
// ---------------------------------------------------------------------------

export const RADII = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  pill: 9999,
} as const;

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

export const SHADOWS = {
  subtle: "0 1px 2px rgba(0,0,0,0.06)",
  medium: "0 2px 8px rgba(0,0,0,0.10)",
  elevated: "0 8px 24px rgba(0,0,0,0.14)",
  none: "none",
} as const;

// ---------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------

export const TRANSITIONS = {
  fast: "100ms ease",
  normal: "100ms ease",
  slow: "150ms ease",
} as const;

// ---------------------------------------------------------------------------
// Explicit size constants (so modules never do arithmetic)
// ---------------------------------------------------------------------------

export const ICON_BTN_SM = SPACING[1] * 6; // 24px small icon button
export const ICON_BTN_MD = SPACING[1] * 8; // 32px medium icon button
export const ICON_BTN_LG = SPACING[1] * 10; // 40px large icon button
export const ICON_BOX_LG = 36; // 36px icon box (project/feature icons)
export const SHEET_CELL_WIDTH = 140; // spreadsheet cell width
export const SHEET_CELL_HEIGHT = 28; // spreadsheet cell height
export const SHEET_ROW_NUM_WIDTH = 44; // row number gutter
export const NOTE_LIST_WIDTH = 280; // notes secondary panel list width
export const GAP_XS = 6; // extra-small gap (6px)
export const TAB_HEIGHT = 28; // tab bar item height
export const TAB_BAR_HEIGHT = 36; // tab bar container height
export const TAB_PAD_H = 14; // horizontal tab padding
export const STATUS_DOT_SIZE = 6; // status indicator dot size — small variant (matches SPACING[1]+2)
export const STATUS_DOT_LG = 14; // status indicator dot size — large avatar variant (matches SPACING[3]+2)
export const STATUS_DOT_MD = 10; // status indicator dot size — medium variant (matches SPACING[1]+6)

export const AVATAR_SM = 34; // small avatar size used in Chat
export const ICON_XS = 22; // extra-small icon size used in Calendar
export const SEARCH_W = 200; // standard search input width
export const INPUT_HEIGHT = 32; // standard input height
export const PAGE_HEADER_HEIGHT = 64; // guaranteed min-height of every panel-3 topbar
export const SUBTOOLBAR_HEIGHT = 40; // secondary toolbar (search/filter bars) below PageHeader

export const AVATAR_COLORS = [
  "#7C3AED",
  "#3498DB",
  "#27AE60",
  "#E74C3C",
  "#E67E22",
  "#9B59B6",
  "#1ABC9C",
  "#F39C12",
] as const;

// ---------------------------------------------------------------------------
// Default export — all token groups combined
// ---------------------------------------------------------------------------

const tokens = {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADII,
  SHADOWS,
  TRANSITIONS,
};

export default tokens;
