import {
  COLORS,
  RADII,
  SHADOWS,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "@/tokens";
import type { CSSProperties } from "react";

export interface DsSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  style?: CSSProperties;
  id?: string;
  name?: string;
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
  transition: `border-color ${TRANSITIONS.fast}, box-shadow ${TRANSITIONS.fast}`,
  lineHeight: TYPOGRAPHY.lineHeights.normal,
  appearance: "auto",
  cursor: "pointer",
  boxShadow: SHADOWS.subtle,
} as const;

export function DsSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  style,
  id,
  name,
  "data-ocid": dataOcid,
}: DsSelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      data-ocid={dataOcid}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...baseStyle,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
