import type React from "react";
import { useState } from "react";
import { COLORS, RADII, SHADOWS, TRANSITIONS, TYPOGRAPHY } from "../../tokens";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface DsButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  title?: string;
  "aria-label"?: string;
  "data-ocid"?: string;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { base: React.CSSProperties; hover: React.CSSProperties }
> = {
  primary: {
    base: {
      background: COLORS.text.primary,
      color: COLORS.neutral[0],
      border: `1px solid ${COLORS.text.primary}`,
      boxShadow: SHADOWS.subtle,
    },
    hover: {
      background: COLORS.neutral[900],
      border: `1px solid ${COLORS.neutral[900]}`,
    },
  },
  secondary: {
    base: {
      background: COLORS.neutral[100],
      color: COLORS.text.primary,
      border: `1px solid ${COLORS.border.default}`,
    },
    hover: { background: COLORS.neutral[200] },
  },
  ghost: {
    base: {
      background: "transparent",
      color: COLORS.text.secondary,
      border: "none",
    },
    hover: { background: COLORS.interactive.hover },
  },
  danger: {
    base: {
      background: COLORS.semantic.danger,
      color: COLORS.neutral[0],
      border: "none",
    },
    hover: { filter: "brightness(0.9)" },
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: "4px 10px",
    fontSize: TYPOGRAPHY.sizes.caption,
    borderRadius: RADII.md,
    height: 32,
  },
  md: {
    padding: "7px 16px",
    fontSize: TYPOGRAPHY.sizes.small,
    borderRadius: RADII.md,
    height: 36,
  },
  lg: {
    padding: "10px 20px",
    fontSize: TYPOGRAPHY.sizes.body,
    borderRadius: RADII.lg,
  },
};

export function DsButton({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  style,
  type = "button",
  title,
  "aria-label": ariaLabel,
  "data-ocid": dataOcid,
}: DsButtonProps) {
  const [hovered, setHovered] = useState(false);

  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const computedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontWeight: TYPOGRAPHY.weights.medium,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: `background ${TRANSITIONS.normal}, border-color ${TRANSITIONS.normal}, opacity ${TRANSITIONS.normal}`,
    opacity: disabled ? 0.45 : 1,
    lineHeight: 1,
    userSelect: "none",
    outline: "none",
    ...variantStyle.base,
    ...(hovered && !disabled ? variantStyle.hover : {}),
    ...sizeStyle,
    ...style,
  };

  return (
    <button
      type={type}
      style={computedStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      data-ocid={dataOcid}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}
