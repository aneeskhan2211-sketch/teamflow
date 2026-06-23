import type React from "react";
import { useAuth } from "../hooks/useAuth";
import { DsButton } from "./ds/DsButton";

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** If true, hides for viewers/guests — defaults to true */
  requiresEdit?: boolean;
  style?: React.CSSProperties;
  "data-ocid"?: string;
}

/**
 * Wraps DsButton with role-awareness.
 * Renders nothing when the user is a viewer/guest and requiresEdit is true.
 */
export function ActionButton({
  label,
  onClick,
  icon,
  size = "md",
  variant = "primary",
  requiresEdit = true,
  style,
  "data-ocid": dataOcid,
}: ActionButtonProps) {
  const { canEdit } = useAuth();

  if (requiresEdit && !canEdit) return null;

  return (
    <DsButton
      variant={variant}
      size={size}
      onClick={onClick}
      style={style}
      data-ocid={dataOcid}
    >
      {icon && (
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      )}
      {label}
    </DsButton>
  );
}
