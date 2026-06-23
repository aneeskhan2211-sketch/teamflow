import type React from "react";
import {
  COLORS,
  ICON_BTN_LG,
  ICON_BTN_MD,
  ICON_BTN_SM,
  RADII,
  TRANSITIONS,
} from "../../tokens";

export interface DsIconButtonProps {
  /** Button size — maps to ICON_BTN_SM (24px), ICON_BTN_MD (32px), ICON_BTN_LG (40px) */
  size?: "sm" | "md" | "lg";
  /** ghost = transparent bg with hover; filled = brand bg */
  variant?: "ghost" | "filled";
  /** Whether the button is in an active/selected state */
  active?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  /** Extra classes forwarded to the button element */
  className?: string;
  /** Accessible label — required for icon-only buttons */
  title?: string;
  "aria-label"?: string;
  "data-ocid"?: string;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<NonNullable<DsIconButtonProps["size"]>, number> = {
  sm: ICON_BTN_SM,
  md: ICON_BTN_MD,
  lg: ICON_BTN_LG,
};

export function DsIconButton({
  size = "md",
  variant = "ghost",
  active = false,
  onClick,
  children,
  className,
  title,
  type = "button",
  style,
  ...rest
}: DsIconButtonProps) {
  const dim = SIZE_MAP[size];

  const baseBackground =
    variant === "filled"
      ? COLORS.brand
      : active
        ? COLORS.interactive.selected
        : "transparent";

  const baseColor =
    variant === "filled" ? COLORS.neutral[0] : COLORS.text.secondary;

  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      className={className}
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dim,
        height: dim,
        borderRadius: RADII.md,
        border: "none",
        cursor: "pointer",
        background: baseBackground,
        color: baseColor,
        flexShrink: 0,
        padding: 0,
        transition: `background ${TRANSITIONS.fast}, color ${TRANSITIONS.fast}`,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (active || variant === "filled") return;
        e.currentTarget.style.background = COLORS.interactive.hover;
      }}
      onMouseLeave={(e) => {
        if (active || variant === "filled") return;
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}
