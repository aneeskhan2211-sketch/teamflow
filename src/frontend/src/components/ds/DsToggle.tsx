import {
  COLORS,
  RADII,
  SHADOWS,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "@/tokens";

// Toggle dimensions derived entirely from SPACING tokens — no magic numbers.
const TRACK_W = SPACING[10]; // 40px
const TRACK_H = SPACING[5] + 2; // 22px (SPACING[5]=20 + 2)
const KNOB = TRACK_H - 4; // 18px
const TRAVEL = TRACK_W - KNOB - 4; // 18px

export interface DsToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  /** Optional label text rendered to the right */
  label?: string;
  /** Optional description rendered below the label */
  description?: string;
  /** Accent colour when checked — defaults to COLORS.interactive.focus */
  accentColor?: string;
  "data-ocid"?: string;
}

export function DsToggle({
  checked,
  onChange,
  disabled,
  label,
  description,
  accentColor = COLORS.interactive.focus,
  "data-ocid": dataOcid,
}: DsToggleProps) {
  const track = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      data-ocid={dataOcid}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: TRACK_W,
        height: TRACK_H,
        borderRadius: RADII.pill,
        border: "none",
        background: checked ? accentColor : COLORS.neutral[300],
        cursor: disabled ? "not-allowed" : "pointer",
        padding: SPACING[0] + 2,
        transition: `background ${TRANSITIONS.fast}`,
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          display: "block",
          width: KNOB,
          height: KNOB,
          borderRadius: "50%",
          background: COLORS.neutral[0],
          boxShadow: SHADOWS.subtle,
          transform: checked ? `translateX(${TRAVEL}px)` : "translateX(0px)",
          transition: `transform ${TRANSITIONS.fast}`,
        }}
      />
    </button>
  );

  if (!label && !description) return track;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: SPACING[4],
        padding: `${SPACING[3]}px 0`,
        borderBottom: `1px solid ${COLORS.border.subtle}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {label && (
          <div
            style={{
              fontSize: TYPOGRAPHY.sizes.body,
              fontWeight: TYPOGRAPHY.weights.medium,
              color: COLORS.text.primary,
            }}
          >
            {label}
          </div>
        )}
        {description && (
          <div
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.secondary,
              marginTop: 2,
            }}
          >
            {description}
          </div>
        )}
      </div>
      {track}
    </div>
  );
}
