import type React from "react";
import { COLORS, RADII, TYPOGRAPHY } from "../../tokens";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface DsBadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: React.CSSProperties;
}

const VARIANT_STYLES: Record<
  BadgeVariant,
  { background: string; color: string }
> = {
  default: {
    background: COLORS.neutral[100],
    color: COLORS.text.secondary,
  },
  success: {
    background: COLORS.semantic.successBg,
    color: COLORS.semantic.successFg,
  },
  warning: {
    background: COLORS.semantic.warningBg,
    color: COLORS.semantic.warningFg,
  },
  danger: {
    background: COLORS.semantic.dangerBg,
    color: COLORS.semantic.dangerFg,
  },
  info: {
    background: COLORS.semantic.infoBg,
    color: COLORS.semantic.infoFg,
  },
  neutral: {
    background: COLORS.neutral[100],
    color: COLORS.text.tertiary,
  },
};

export function DsBadge({ label, variant = "default", style }: DsBadgeProps) {
  const variantStyle = VARIANT_STYLES[variant];

  const computedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.medium,
    padding: "2px 8px",
    borderRadius: RADII.pill,
    lineHeight: 1.5,
    ...variantStyle,
    ...style,
  };

  return <span style={computedStyle}>{label}</span>;
}
