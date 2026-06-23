import type React from "react";
import { useState } from "react";
import { COLORS, RADII, SHADOWS, TRANSITIONS } from "../../tokens";

type ShadowKey = "subtle" | "medium" | "elevated" | "none";

interface DsCardProps {
  children: React.ReactNode;
  padding?: number;
  shadow?: ShadowKey;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function DsCard({
  children,
  padding = 16,
  shadow = "subtle",
  style,
  onClick,
}: DsCardProps) {
  const [hovered, setHovered] = useState(false);
  const isClickable = !!onClick;

  const computedStyle: React.CSSProperties = {
    background:
      hovered && isClickable ? COLORS.neutral[50] : COLORS.surface.panel3,
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: RADII.lg,
    boxShadow: SHADOWS[shadow],
    padding,
    cursor: isClickable ? "pointer" : undefined,
    transition: `background ${TRANSITIONS.fast}`,
    ...style,
  };

  if (isClickable) {
    return (
      <button
        type="button"
        style={{
          ...computedStyle,
          border: `1px solid ${COLORS.border.default}`,
          width: "100%",
          textAlign: "left",
        }}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </button>
    );
  }

  return <div style={computedStyle}>{children}</div>;
}
