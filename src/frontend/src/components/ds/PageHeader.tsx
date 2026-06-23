import React from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  COLORS,
  PAGE_HEADER_HEIGHT,
  RADII,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "../../tokens";
import { DsButton } from "./DsButton";
import { DsIconButton } from "./DsIconButton";

export interface ViewControl {
  id: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface StatPill {
  label: string;
  value: string | number;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  stats?: StatPill[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  viewControls?: ViewControl[];
  hideActionForViewers?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  stats,
  primaryAction,
  viewControls,
  hideActionForViewers = true,
}: PageHeaderProps) {
  const { isViewer } = useAuth();
  const showPrimaryAction =
    primaryAction && !(hideActionForViewers && isViewer);

  return (
    <div
      style={{
        width: "100%",
        height: PAGE_HEADER_HEIGHT,
        overflow: "hidden",
        padding: `${SPACING[2]}px ${SPACING[6]}px`,
        borderBottom: `1px solid ${COLORS.border.default}`,
        boxSizing: "border-box" as const,
        flexShrink: 0,
        backgroundColor: COLORS.surface.panel3,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: SPACING[4],
          width: "100%",
        }}
      >
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: SPACING[1],
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: TYPOGRAPHY.sizes.h3,
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: COLORS.text.primary,
              margin: 0,
              lineHeight: TYPOGRAPHY.lineHeights.tight,
              whiteSpace: "nowrap" as const,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </h1>

          {(subtitle || (stats && stats.length > 0)) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: SPACING[3],
                flexWrap: "wrap",
              }}
            >
              {subtitle && (
                <span
                  style={{
                    fontSize: TYPOGRAPHY.sizes.small,
                    color: COLORS.text.secondary,
                    lineHeight: TYPOGRAPHY.lineHeights.tight,
                  }}
                >
                  {subtitle}
                </span>
              )}

              {subtitle && stats && stats.length > 0 && (
                <div
                  style={{
                    width: 1,
                    height: SPACING[2],
                    backgroundColor: COLORS.border.default,
                    flexShrink: 0,
                  }}
                />
              )}

              {stats && stats.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: SPACING[3],
                  }}
                >
                  {stats.map((stat, idx) => (
                    <React.Fragment key={stat.label}>
                      {idx > 0 && (
                        <div
                          style={{
                            width: 1,
                            height: SPACING[3],
                            backgroundColor: COLORS.border.default,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: SPACING[1],
                        }}
                      >
                        <span
                          style={{
                            fontSize: TYPOGRAPHY.sizes.body,
                            fontWeight: TYPOGRAPHY.weights.bold,
                            color: COLORS.text.primary,
                            lineHeight: TYPOGRAPHY.lineHeights.tight,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {stat.value}
                        </span>
                        <span
                          style={{
                            fontSize: TYPOGRAPHY.sizes.caption,
                            fontWeight: TYPOGRAPHY.weights.medium,
                            color: COLORS.text.tertiary,
                            lineHeight: TYPOGRAPHY.lineHeights.tight,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {stat.label}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: SPACING[2],
            flexShrink: 0,
          }}
        >
          {viewControls && viewControls.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${COLORS.border.default}`,
                borderRadius: RADII.md,
                overflow: "hidden",
              }}
            >
              {viewControls.map((ctrl, idx) => (
                <DsIconButton
                  key={ctrl.id}
                  size="md"
                  active={ctrl.active}
                  title={ctrl.label}
                  aria-label={ctrl.label}
                  onClick={ctrl.onClick}
                  data-ocid={`view_control.${ctrl.id}`}
                  style={{
                    borderRadius: 0,
                    borderRight:
                      idx === viewControls.length - 1
                        ? "none"
                        : `1px solid ${COLORS.border.default}`,
                    color: ctrl.active
                      ? COLORS.text.primary
                      : COLORS.text.secondary,
                  }}
                >
                  {ctrl.icon}
                </DsIconButton>
              ))}
            </div>
          )}

          {showPrimaryAction && (
            <DsButton
              variant="primary"
              size="md"
              onClick={primaryAction.onClick}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[2],
                }}
              >
                {primaryAction.icon && primaryAction.icon}
                {primaryAction.label}
              </span>
            </DsButton>
          )}
        </div>
      </div>
    </div>
  );
}
