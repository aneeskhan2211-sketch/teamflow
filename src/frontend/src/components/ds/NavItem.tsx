import React from "react";
import { useState } from "react";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "../../tokens";

const NAV_ITEM_HEIGHT = 32;

interface NavItemProps {
  label: string;
  accent: string;
  selected?: boolean;
  indent?: number;
  level?: "top" | "sub";
  onClick?: () => void;
  count?: number;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  "data-ocid"?: string;
}

function NavItemInner({
  label,
  accent,
  selected = false,
  indent = 0,
  level,
  onClick,
  count,
  icon,
  meta,
  "data-ocid": dataOcid,
}: NavItemProps) {
  const [hovered, setHovered] = useState(false);

  const isSub = level === "sub" || (indent !== undefined && indent > 0);
  const paddingLeft = isSub ? SPACING[8] : SPACING[4];

  const style: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: NAV_ITEM_HEIGHT,
    minHeight: NAV_ITEM_HEIGHT,
    maxHeight: NAV_ITEM_HEIGHT,
    boxSizing: "border-box",
    paddingLeft,
    paddingRight: SPACING[4],
    marginLeft: SPACING[2],
    marginRight: SPACING[2],
    borderRadius: RADII.md,
    fontSize: isSub ? TYPOGRAPHY.sizes.caption : TYPOGRAPHY.sizes.small,
    fontWeight: isSub ? TYPOGRAPHY.weights.regular : TYPOGRAPHY.weights.medium,
    color: selected
      ? accent
      : isSub
        ? COLORS.text.secondary
        : COLORS.text.primary,
    background: selected
      ? `${accent}1A`
      : hovered
        ? COLORS.interactive.hover
        : "transparent",
    cursor: "pointer",
    userSelect: "none",
    lineHeight: TYPOGRAPHY.lineHeights.normal,
    textAlign: "left",
  };

  const countStyle: React.CSSProperties = {
    marginLeft: SPACING[1],
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.text.tertiary,
    fontWeight: TYPOGRAPHY.weights.regular,
  };

  return (
    <button
      type="button"
      className="nav-item-transition"
      style={{
        ...style,
        background: style.background as string,
        border: "none",
        gap: SPACING[2],
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-ocid={dataOcid}
    >
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && <span style={countStyle}>{count}</span>}
      {meta !== undefined && <span style={countStyle}>{meta}</span>}
    </button>
  );
}

export const NavItem = React.memo(NavItemInner);
