import type React from "react";
import { COLORS, SPACING, TYPOGRAPHY } from "../../tokens";

interface SectionLabelProps {
  label: string;
}

export function SectionLabel({ label }: SectionLabelProps) {
  const style: React.CSSProperties = {
    fontSize: TYPOGRAPHY.sizes.micro,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    paddingLeft: SPACING[4],
    paddingRight: SPACING[4],
    paddingTop: SPACING[2],
    paddingBottom: SPACING[1],
    marginLeft: SPACING[2],
    marginRight: SPACING[2],
    userSelect: "none",
    lineHeight: 1.2,
    textAlign: "left",
  };

  return <div style={style}>{label}</div>;
}
