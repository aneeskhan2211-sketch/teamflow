import type React from "react";
import { COLORS, SPACING, TYPOGRAPHY } from "../../tokens";

interface Panel2HeaderProps {
  icon: React.ReactNode;
  label: string;
  accent: string;
}

export function Panel2Header({ icon, label, accent }: Panel2HeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: SPACING[2],
        paddingTop: SPACING[3],
        paddingLeft: SPACING[4],
        paddingRight: SPACING[4],
        paddingBottom: SPACING[2],
        marginLeft: SPACING[2],
        marginRight: SPACING[2],
        flexShrink: 0,
      }}
      data-ocid="panel2.header"
    >
      <span style={{ display: "flex", alignItems: "center", color: accent }}>
        {icon}
      </span>
      <span
        style={{
          fontSize: TYPOGRAPHY.sizes.body,
          fontWeight: TYPOGRAPHY.weights.medium,
          color: COLORS.text.primary,
        }}
      >
        {label}
      </span>
    </div>
  );
}
