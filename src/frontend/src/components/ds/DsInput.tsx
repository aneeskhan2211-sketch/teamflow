import {
  COLORS,
  RADII,
  SHADOWS,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "@/tokens";
import { type CSSProperties, forwardRef, useState } from "react";

export interface DsInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  name?: string;
  autoComplete?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
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
  transition: `border-color ${TRANSITIONS.fast}, box-shadow ${TRANSITIONS.fast}`,
  lineHeight: TYPOGRAPHY.lineHeights.normal,
} as const;

export const DsInput = forwardRef<HTMLInputElement, DsInputProps>(
  function DsInputInner(
    {
      value,
      onChange,
      placeholder,
      type = "text",
      disabled,
      className,
      style,
      id,
      name,
      autoComplete,
      onKeyDown,
      onBlur,
      accentColor = COLORS.interactive.focus,
      "data-ocid": dataOcid,
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false);

    return (
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={className}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onKeyDown={onKeyDown}
        data-ocid={dataOcid}
        style={{
          ...baseStyle,
          borderColor: focused ? accentColor : COLORS.border.default,
          boxShadow: focused
            ? `0 0 0 2px ${accentColor}26, ${SHADOWS.subtle}`
            : SHADOWS.subtle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "text",
          ...style,
        }}
      />
    );
  },
);
