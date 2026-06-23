import {
  IconActivity,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconFileText,
  IconFolder,
  IconMessage,
  IconNote,
  IconPresentation,
  IconSettings,
  IconSquareCheck,
  IconTable,
  IconUsers,
} from "@tabler/icons-react";
import { useLayoutEffect, useRef, useState } from "react";
import { DsIconButton } from "../components/ds";
import { useWorkspace } from "../hooks/useWorkspace";
import { MODULE_ACCENTS } from "../moduleAccents";
import {
  COLORS,
  ICON_BTN_SM,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "../tokens";
import type { ModuleId } from "../types";

type IconComponent = React.ComponentType<{
  size?: number;
  style?: React.CSSProperties;
}>;

const ICON_MAP: Record<string, IconComponent> = {
  IconSquareCheck,
  IconFileText,
  IconCalendar,
  IconMessage,
  IconTable,
  IconNote,
  IconPresentation,
  IconFolder,
  IconUsers,
  IconActivity,
  IconSettings,
};

export default function Sidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar } =
    useWorkspace();

  // Suppress width transition on the very first render to prevent layout shift.
  const [enableTransitions, setEnableTransitions] = useState(false);
  const hasMountedRef = useRef(false);
  useLayoutEffect(() => {
    hasMountedRef.current = true;
    const id = requestAnimationFrame(() => {
      setEnableTransitions(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  type ModuleEntry = {
    id: ModuleId;
    label: string;
    icon: keyof typeof ICON_MAP;
    accent: string;
  };

  const modules: ModuleEntry[] = [
    {
      id: "tasks",
      label: "Tasks",
      icon: "IconSquareCheck",
      accent: MODULE_ACCENTS.tasks,
    },
    {
      id: "documents",
      label: "Documents",
      icon: "IconFileText",
      accent: MODULE_ACCENTS.documents,
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "IconCalendar",
      accent: MODULE_ACCENTS.calendar,
    },
    {
      id: "chat",
      label: "Chat",
      icon: "IconMessage",
      accent: MODULE_ACCENTS.chat,
    },
    {
      id: "sheets",
      label: "Sheets",
      icon: "IconTable",
      accent: MODULE_ACCENTS.sheets,
    },
    {
      id: "notes",
      label: "Notes",
      icon: "IconNote",
      accent: MODULE_ACCENTS.notes,
    },
    {
      id: "presentations",
      label: "Presentations",
      icon: "IconPresentation",
      accent: MODULE_ACCENTS.presentations,
    },
    {
      id: "projects",
      label: "Projects",
      icon: "IconFolder",
      accent: MODULE_ACCENTS.projects,
    },
    {
      id: "people",
      label: "People",
      icon: "IconUsers",
      accent: MODULE_ACCENTS.people,
    },
    {
      id: "activity",
      label: "Activity",
      icon: "IconActivity",
      accent: MODULE_ACCENTS.activity,
    },
  ];

  const expandedWidth = 172;
  const collapsedWidth = 56;
  const sidebarWidth = sidebarCollapsed ? collapsedWidth : expandedWidth;

  return (
    <aside
      data-ocid="sidebar"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        borderRight: `1px solid ${COLORS.border.default}`,
        background: COLORS.surface.panel1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
        transition: enableTransitions
          ? `width ${TRANSITIONS.slow}, min-width ${TRANSITIONS.slow}`
          : "none",
      }}
    >
      {/* Module nav icons */}
      <nav
        style={{
          flex: 1,
          padding: "8px 0",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflow: "hidden",
        }}
      >
        {modules.map((item) => {
          const isActive = activeModule === item.id;
          const IconComp = ICON_MAP[item.icon];
          return (
            <button
              key={item.id}
              type="button"
              data-ocid={`sidebar.nav.${item.id}`}
              onClick={() => setActiveModule(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: SPACING[2],
                width: "100%",
                height: 36,
                background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
                border: "none",
                borderLeft: isActive
                  ? `2px solid ${item.accent}`
                  : "2px solid transparent",
                borderRadius: 0,
                cursor: "pointer",
                paddingLeft: sidebarCollapsed
                  ? (collapsedWidth - 18) / 2 - 1
                  : 9,
                paddingRight: sidebarCollapsed ? (collapsedWidth - 18) / 2 : 10,
                transition: enableTransitions
                  ? `padding-left ${TRANSITIONS.slow}, padding-right ${TRANSITIONS.slow}, background ${TRANSITIONS.normal}, border-left-color ${TRANSITIONS.normal}`
                  : "none",
                flexShrink: 0,
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {IconComp && (
                <IconComp
                  size={18}
                  style={{
                    color: isActive ? item.accent : "rgba(255,255,255,0.48)",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  color: isActive
                    ? "rgba(255,255,255,0.92)"
                    : "rgba(255,255,255,0.52)",
                  fontSize: TYPOGRAPHY.sizes.small,
                  fontWeight: isActive
                    ? TYPOGRAPHY.weights.medium
                    : TYPOGRAPHY.weights.regular,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  opacity: sidebarCollapsed ? 0 : 1,
                  maxWidth: sidebarCollapsed ? 0 : 140,
                  transition: enableTransitions
                    ? `opacity ${TRANSITIONS.slow}, max-width ${TRANSITIONS.slow}`
                    : "none",
                  pointerEvents: sidebarCollapsed ? "none" : "auto",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Expand/collapse toggle pinned at bottom */}
      <div
        style={{
          padding: SPACING[2],
          paddingLeft: sidebarCollapsed
            ? (collapsedWidth - ICON_BTN_SM) / 2
            : SPACING[2],
          paddingRight: sidebarCollapsed
            ? (collapsedWidth - ICON_BTN_SM) / 2
            : SPACING[2],
          display: "flex",
          justifyContent: "flex-start",
          transition: enableTransitions
            ? `padding-left ${TRANSITIONS.slow}, padding-right ${TRANSITIONS.slow}`
            : "none",
        }}
      >
        <DsIconButton
          size="sm"
          variant="ghost"
          data-ocid="sidebar.toggle"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleSidebar}
          style={{
            color: "rgba(255,255,255,0.35)",
            transition: enableTransitions
              ? `background ${TRANSITIONS.normal}, color ${TRANSITIONS.normal}`
              : "none",
          }}
        >
          {sidebarCollapsed ? (
            <IconChevronRight size={14} />
          ) : (
            <IconChevronLeft size={14} />
          )}
        </DsIconButton>
      </div>
    </aside>
  );
}
