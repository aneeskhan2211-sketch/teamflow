import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useState } from "react";
import { DsButton } from "../components/ds/DsButton";
import { DsInput } from "../components/ds/DsInput";
import { AVATAR_COLORS, COLORS, RADII, SPACING, TYPOGRAPHY } from "../tokens";

const DEFAULT_COLOR: string = AVATAR_COLORS[0];

export default function OnboardingPage() {
  const { actor } = useActor(createActor);
  const [workspaceName, setWorkspaceName] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [avatarColor, setAvatarColor] = useState(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;
    if (!workspaceName.trim()) {
      setError("Workspace name is required.");
      return;
    }
    if (!name.trim()) {
      setError("Your name is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await actor.completeOnboarding(
        name.trim(),
        workspaceName.trim(),
        title.trim(),
        department.trim(),
        avatarColor,
      );
      window.location.reload();
    } catch (_err) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleSkip() {
    if (!actor) return;
    setSubmitting(true);
    try {
      await actor.registerUser("User", "", DEFAULT_COLOR);
      await actor.completeOnboarding(
        "User",
        "My Workspace",
        "",
        "",
        DEFAULT_COLOR,
      );
      window.location.reload();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div
      data-ocid="onboarding.page"
      style={{
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.surface.panel2,
        padding: `${SPACING[4]}px`,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: COLORS.surface.panel3,
          border: `1px solid ${COLORS.border.default}`,
          borderRadius: RADII.xl,
          padding: `${SPACING[10]}px ${SPACING[8]}px`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            textAlign: "center",
            marginBottom: SPACING[8],
          }}
        >
          <span
            className="font-display"
            style={{
              fontSize: 22,
              fontWeight: TYPOGRAPHY.weights.bold,
              color: COLORS.text.primary,
              letterSpacing: "-0.03em",
            }}
          >
            Team
            <span style={{ color: COLORS.brand }}>Flow</span>
          </span>
          <p
            style={{
              marginTop: SPACING[2],
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.secondary,
              lineHeight: TYPOGRAPHY.lineHeights.normal,
            }}
          >
            Let's set up your workspace
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: SPACING[4],
            }}
          >
            <div>
              <label
                htmlFor="onboarding-workspace-name"
                style={{
                  display: "block",
                  fontSize: TYPOGRAPHY.sizes.small,
                  fontWeight: TYPOGRAPHY.weights.medium,
                  color: COLORS.text.primary,
                  marginBottom: SPACING[1],
                }}
              >
                Workspace name
              </label>
              <DsInput
                id="onboarding-workspace-name"
                data-ocid="onboarding.workspace_name_input"
                placeholder="e.g. Acme Corp"
                value={workspaceName}
                onChange={(v) => setWorkspaceName(v)}
              />
            </div>

            <div>
              <label
                htmlFor="onboarding-name"
                style={{
                  display: "block",
                  fontSize: TYPOGRAPHY.sizes.small,
                  fontWeight: TYPOGRAPHY.weights.medium,
                  color: COLORS.text.primary,
                  marginBottom: SPACING[1],
                }}
              >
                Your name
              </label>
              <DsInput
                id="onboarding-name"
                data-ocid="onboarding.name_input"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(v) => setName(v)}
              />
            </div>

            <div>
              <label
                htmlFor="onboarding-title"
                style={{
                  display: "block",
                  fontSize: TYPOGRAPHY.sizes.small,
                  fontWeight: TYPOGRAPHY.weights.medium,
                  color: COLORS.text.secondary,
                  marginBottom: SPACING[1],
                }}
              >
                Title{" "}
                <span
                  style={{
                    fontWeight: TYPOGRAPHY.weights.regular,
                    color: COLORS.text.tertiary,
                  }}
                >
                  — optional
                </span>
              </label>
              <DsInput
                id="onboarding-title"
                data-ocid="onboarding.title_input"
                placeholder="e.g. Product Designer"
                value={title}
                onChange={(v) => setTitle(v)}
              />
            </div>

            <div>
              <label
                htmlFor="onboarding-department"
                style={{
                  display: "block",
                  fontSize: TYPOGRAPHY.sizes.small,
                  fontWeight: TYPOGRAPHY.weights.medium,
                  color: COLORS.text.secondary,
                  marginBottom: SPACING[1],
                }}
              >
                Department{" "}
                <span
                  style={{
                    fontWeight: TYPOGRAPHY.weights.regular,
                    color: COLORS.text.tertiary,
                  }}
                >
                  — optional
                </span>
              </label>
              <DsInput
                id="onboarding-department"
                data-ocid="onboarding.department_input"
                placeholder="e.g. Engineering"
                value={department}
                onChange={(v) => setDepartment(v)}
              />
            </div>

            {/* Avatar color picker */}
            <div>
              <label
                htmlFor="onboarding-avatar-color"
                style={{
                  display: "block",
                  fontSize: TYPOGRAPHY.sizes.small,
                  fontWeight: TYPOGRAPHY.weights.medium,
                  color: COLORS.text.primary,
                  marginBottom: SPACING[2],
                }}
              >
                Avatar colour
              </label>
              <div
                id="onboarding-avatar-color"
                style={{ display: "flex", gap: SPACING[2], flexWrap: "wrap" }}
                data-ocid="onboarding.avatar_color_picker"
              >
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select avatar colour ${color}`}
                    onClick={() => setAvatarColor(color)}
                    data-ocid={`onboarding.avatar_color.${color.replace("#", "")}`}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: color,
                      border: "none",
                      cursor: "pointer",
                      boxShadow:
                        avatarColor === color
                          ? `0 0 0 2px ${COLORS.surface.panel3}, 0 0 0 4px ${color}`
                          : "none",
                      transition: "box-shadow 0.15s ease",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p
                data-ocid="onboarding.error_state"
                style={{
                  fontSize: TYPOGRAPHY.sizes.small,
                  color: COLORS.semantic.danger,
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}

            <DsButton
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting}
              data-ocid="onboarding.submit_button"
              style={{ width: "100%", marginTop: SPACING[2] }}
            >
              {submitting ? "Setting up…" : "Set up workspace"}
            </DsButton>
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: SPACING[4] }}>
          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting}
            data-ocid="onboarding.skip_button"
            style={{
              background: "none",
              border: "none",
              cursor: submitting ? "default" : "pointer",
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.tertiary,
              padding: `${SPACING[1]}px ${SPACING[2]}px`,
              borderRadius: RADII.sm,
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!submitting)
                (e.currentTarget as HTMLButtonElement).style.color =
                  COLORS.text.secondary;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                COLORS.text.tertiary;
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
