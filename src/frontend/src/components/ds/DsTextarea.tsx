import {
  COLORS,
  RADII,
  SHADOWS,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "@/tokens";
import { type CSSProperties, useState } from "react";

export interface DsTextareaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
  name?: string;
  /** Accent colour for focus ring — defaults to COLORS.interactive.focus */
  accentColor?: string;
  "data-ocid"?: string;
}

const baseStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontSize: TYPOGRAPHY.sizes.body,
  color: COLORS.text.primary,
  background: COLORS.surface.panel3,
  border: `1px solid ${COLORS.border.default}`,
  borderRadius: RADII.md,
  padding: `${SPACING[2]}px ${SPACING[3]}px`,
  outline: "none",
  resize: "vertical",
  lineHeight: TYPOGRAPHY.lineHeights.normal,
  transition: `border-color ${TRANSITIONS.fast}, box-shadow ${TRANSITIONS.fast}`,
} as const;

export function DsTextarea({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
  className,
  style,
  id,
  name,
  accentColor = COLORS.interactive.focus,
  "data-ocid": dataOcid,
}: DsTextareaProps) {
  const [focused, setFocused] = useState(false);

  return (
    <textarea
      id={id}
      name={name}
      rows={rows}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      data-ocid={dataOcid}
      style={{
        ...baseStyle,
        borderColor: focused ? accentColor : COLORS.border.default,
        boxShadow: focused
          ? `0 0 0 2px ${accentColor}26, ${SHADOWS.subtle}`
          : SHADOWS.subtle,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "auto",
        ...style,
      }}
    />
  );
}
