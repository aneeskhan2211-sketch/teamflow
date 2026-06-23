import { COLORS, RADII, TRANSITIONS, TYPOGRAPHY } from "../tokens";

interface LandingPageProps {
  onLogin: () => void;
}

/**
 * Hero landing page — all content is immediately visible on first paint.
 * Entrance animations run via CSS @keyframes so they never cause layout shift
 * (browser accounts for them in the initial layout pass).
 */
export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "100dvh",
        maxHeight: "100dvh",
        backgroundImage:
          "url(/assets/images/teamflow-hero-illustration-new.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      data-ocid="landing.page"
    >
      {/* Copy block — vertically centered, left-aligned */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: "clamp(1.5rem, 7vw, 7rem)",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          {/* Headline */}
          <h1
            className="font-display font-bold"
            style={{
              fontSize: "clamp(2.25rem, 4vw, 4rem)",
              lineHeight: 1.08,
              color: COLORS.neutral[900],
              letterSpacing: "-0.025em",
            }}
          >
            One workspace. <br />
            Everything your
            <br />
            team needs.
          </h1>

          {/* Subheadline */}
          <p
            className="font-body"
            style={{
              fontSize: "clamp(0.95rem, 1.15vw, 1.125rem)",
              lineHeight: 1.65,
              color: COLORS.neutral[700],
              marginTop: "1.1rem",
              maxWidth: 400,
            }}
          >
            Stop switching between tools. Chat, tasks, docs, and calendars — all
            in one place.
          </p>

          {/* CTA */}
          <div style={{ marginTop: "2rem" }}>
            <button
              type="button"
              onClick={onLogin}
              className="font-body inline-flex items-center justify-center font-semibold"
              style={{
                fontSize: TYPOGRAPHY.sizes.body,
                padding: "12px 28px",
                borderRadius: RADII.pill,
                background: COLORS.neutral[900],
                color: COLORS.neutral[0],
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.01em",
                transition: `background ${TRANSITIONS.fast}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  COLORS.neutral[800];
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  COLORS.neutral[900];
              }}
              data-ocid="landing.cta_button"
            >
              Get started free →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
