import type React from "react";
import { useState } from "react";
import { COLORS, RADII, SPACING, TRANSITIONS, TYPOGRAPHY } from "../../tokens";

interface EmptyModuleStateProps {
  icon: React.ReactNode;
  accent: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyModuleState({
  icon,
  accent,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyModuleStateProps) {
  const [btnHovered, setBtnHovered] = useState(false);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    minHeight: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  };

  const iconBoxStyle: React.CSSProperties = {
    width: 64,
    height: 64,
    background: `${accent}1A`,
    borderRadius: RADII.xl,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: accent,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.sizes.h3,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING[4],
    lineHeight: TYPOGRAPHY.lineHeights.tight,
  };

  const descStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.text.secondary,
    marginTop: 6,
    maxWidth: 280,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
  };

  const btnStyle: React.CSSProperties = {
    marginTop: SPACING[5],
    border: `1px solid ${accent}`,
    color: accent,
    background: btnHovered ? `${accent}14` : "transparent",
    padding: `${SPACING[2]}px ${SPACING[4]}px`,
    borderRadius: RADII.md,
    fontSize: TYPOGRAPHY.sizes.small,
    fontWeight: TYPOGRAPHY.weights.medium,
    cursor: "pointer",
    transition: `background ${TRANSITIONS.normal}`,
    outline: "none",
    lineHeight: TYPOGRAPHY.lineHeights.normal,
  };

  return (
    <div style={containerStyle}>
      <div style={iconBoxStyle}>{icon}</div>
      <div style={titleStyle}>{title}</div>
      <div style={descStyle}>{description}</div>
      {actionLabel && (
        <button
          type="button"
          style={btnStyle}
          onClick={onAction}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
