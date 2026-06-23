import { COLORS } from "../tokens";
interface WordMarkProps {
  /** Font size in px — defaults to 14 */
  size?: number;
  /** Additional inline styles on the wrapper span */
  style?: React.CSSProperties;
  className?: string;
}

/**
 * TeamFlow typographic wordmark.
 * "Team" renders in the primary text color; "Flow" in the brand accent.
 * No icon, no logo graphic — pure type.
 */
export default function WordMark({
  size = 14,
  style,
  className,
}: WordMarkProps) {
  return (
    <span
      className={className}
      style={{
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        whiteSpace: "nowrap",
        lineHeight: 1,
        fontFamily: "var(--font-display, inherit)",
        userSelect: "none",
        ...style,
      }}
    >
      <span style={{ color: COLORS.text.primary }}>Team</span>
      <span style={{ color: COLORS.brand }}>Flow</span>
    </span>
  );
}
