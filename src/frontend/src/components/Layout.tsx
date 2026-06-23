import { useWorkspace } from "../hooks/useWorkspace";

import {
  IconActivity,
  IconCalendar,
  IconCheckbox,
  IconFile,
  IconFolder,
  IconMessageCircle,
  IconNote,
  IconPresentation,
  IconSettings,
  IconTable,
  IconUsers,
} from "@tabler/icons-react";

const moduleIconMap: Record<string, React.ReactNode> = {
  tasks: <IconCheckbox size={20} />,
  documents: <IconFile size={20} />,
  calendar: <IconCalendar size={20} />,
  chat: <IconMessageCircle size={20} />,
  sheets: <IconTable size={20} />,
  notes: <IconNote size={20} />,
  presentations: <IconPresentation size={20} />,
  projects: <IconFolder size={20} />,
  people: <IconUsers size={20} />,
  activity: <IconActivity size={20} />,
  settings: <IconSettings size={20} />,
};
import type React from "react";
import { Suspense, lazy } from "react";
import { MODULE_ACCENTS, MODULE_LABELS } from "../moduleAccents";
// Active modules — static imports (always needed)
import {
  MainPanel as ChatMainPanel,
  SecondaryPanel as ChatSecondaryPanel,
  ChatStateProvider,
} from "../pages/ChatPage";
import {
  MainPanel as DocumentsMainPanel,
  SecondaryPanel as DocumentsSecondaryPanel2,
} from "../pages/DocumentsPage";
import {
  MainPanel as TasksMainPanel,
  SecondaryPanel as TasksSecondaryPanel,
} from "../pages/TasksPage";

// Stub modules — lazy-loaded to reduce initial bundle size
const CalendarSecondaryPanel = lazy(() =>
  import("../pages/CalendarPage").then((m) => ({ default: m.SecondaryPanel })),
);
const CalendarMainPanel = lazy(() =>
  import("../pages/CalendarPage").then((m) => ({ default: m.MainPanel })),
);
const SheetsSecondaryPanel = lazy(() =>
  import("../pages/SheetsPage").then((m) => ({ default: m.SecondaryPanel })),
);
const SheetsMainPanel = lazy(() =>
  import("../pages/SheetsPage").then((m) => ({ default: m.MainPanel })),
);
const NotesSecondaryPanel = lazy(() =>
  import("../pages/NotesPage").then((m) => ({ default: m.SecondaryPanel })),
);
const NotesMainPanel = lazy(() =>
  import("../pages/NotesPage").then((m) => ({ default: m.MainPanel })),
);
const PresentationsSecondaryPanel = lazy(() =>
  import("../pages/PresentationsPage").then((m) => ({
    default: m.SecondaryPanel,
  })),
);
const PresentationsMainPanel = lazy(() =>
  import("../pages/PresentationsPage").then((m) => ({ default: m.MainPanel })),
);
const ProjectsSecondaryPanel = lazy(() =>
  import("../pages/ProjectsPage").then((m) => ({ default: m.SecondaryPanel })),
);
const ProjectsMainPanel = lazy(() =>
  import("../pages/ProjectsPage").then((m) => ({ default: m.MainPanel })),
);
const PeopleSecondaryPanel = lazy(() =>
  import("../pages/PeoplePage").then((m) => ({ default: m.SecondaryPanel })),
);
const PeopleMainPanel = lazy(() =>
  import("../pages/PeoplePage").then((m) => ({ default: m.MainPanel })),
);
const ActivitySecondaryPanel = lazy(() =>
  import("../pages/ActivityPage").then((m) => ({ default: m.SecondaryPanel })),
);
const ActivityMainPanel = lazy(() =>
  import("../pages/ActivityPage").then((m) => ({ default: m.MainPanel })),
);
const SettingsSecondaryPanel = lazy(() =>
  import("../pages/SettingsPage").then((m) => ({ default: m.SecondaryPanel })),
);
const SettingsMainPanel = lazy(() =>
  import("../pages/SettingsPage").then((m) => ({ default: m.MainPanel })),
);
import { COLORS, TYPOGRAPHY } from "../tokens";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Panel2Header } from "./ds";

function ModuleLoadingFallback() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.text.tertiary,
        fontSize: TYPOGRAPHY.sizes.small,
      }}
    >
      Loading…
    </div>
  );
}

export default function Layout() {
  const { activeModule } = useWorkspace();

  function renderSecondaryPanel() {
    switch (activeModule) {
      case "chat":
        return <ChatSecondaryPanel />;
      case "tasks":
        return <TasksSecondaryPanel />;
      case "documents":
        return <DocumentsSecondaryPanel2 />;
      case "calendar":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <CalendarSecondaryPanel />
          </Suspense>
        );
      case "sheets":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <SheetsSecondaryPanel />
          </Suspense>
        );
      case "notes":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <NotesSecondaryPanel />
          </Suspense>
        );
      case "presentations":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <PresentationsSecondaryPanel />
          </Suspense>
        );
      case "projects":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <ProjectsSecondaryPanel />
          </Suspense>
        );
      case "people":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <PeopleSecondaryPanel />
          </Suspense>
        );
      case "activity":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <ActivitySecondaryPanel />
          </Suspense>
        );
      case "settings":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <SettingsSecondaryPanel />
          </Suspense>
        );
      default:
        return null;
    }
  }

  function renderMainPanel() {
    switch (activeModule) {
      case "chat":
        return <ChatMainPanel />;
      case "tasks":
        return <TasksMainPanel />;
      case "documents":
        return <DocumentsMainPanel />;
      case "calendar":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <CalendarMainPanel />
          </Suspense>
        );
      case "sheets":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <SheetsMainPanel />
          </Suspense>
        );
      case "notes":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <NotesMainPanel />
          </Suspense>
        );
      case "presentations":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <PresentationsMainPanel />
          </Suspense>
        );
      case "projects":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <ProjectsMainPanel />
          </Suspense>
        );
      case "people":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <PeopleMainPanel />
          </Suspense>
        );
      case "activity":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <ActivityMainPanel />
          </Suspense>
        );
      case "settings":
        return (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <SettingsMainPanel />
          </Suspense>
        );
      default:
        return null;
    }
  }

  const activeAccent = MODULE_ACCENTS[activeModule] ?? COLORS.text.secondary;
  const activeLabel = MODULE_LABELS[activeModule] ?? activeModule;
  const activeIcon = moduleIconMap[activeModule] ?? null;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: COLORS.surface.panel3,
        color: COLORS.text.primary,
      }}
    >
      <TopBar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        {/* Right side: sub-header + two-panel row */}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {/* Panel row: panel 2 + panel 3 — chat wraps both panels in a shared context */}
          {activeModule === "chat" ? (
            <ChatStateProvider>
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Panel 2 shell */}
                <div
                  style={{
                    width: 200,
                    minWidth: 200,
                    maxWidth: 200,
                    flexShrink: 0,
                    height: "100%",
                    overflow: "hidden",
                    background: COLORS.surface.panel2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  data-ocid="layout.panel2"
                >
                  <Panel2Header
                    icon={activeIcon}
                    label={activeLabel}
                    accent={activeAccent}
                  />
                  <div
                    style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
                  >
                    {renderSecondaryPanel()}
                  </div>
                </div>
                {/* Panel 3 shell */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: "100%",
                    overflow: "hidden",
                    background: COLORS.surface.panel3,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                  }}
                  data-ocid="layout.panel3"
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      overflowY: "scroll",
                      minHeight: 0,
                    }}
                  >
                    {renderMainPanel()}
                  </div>
                </div>
              </div>
            </ChatStateProvider>
          ) : (
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Panel 2 shell */}
              <div
                style={{
                  width: 200,
                  minWidth: 200,
                  maxWidth: 200,
                  flexShrink: 0,
                  height: "100%",
                  overflow: "hidden",
                  background: COLORS.surface.panel2,
                  display: "flex",
                  flexDirection: "column",
                }}
                data-ocid="layout.panel2"
              >
                <Panel2Header
                  icon={activeIcon}
                  label={activeLabel}
                  accent={activeAccent}
                />
                <div
                  style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
                >
                  {renderSecondaryPanel()}
                </div>
              </div>
              {/* Panel 3 shell */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  overflow: "hidden",
                  background: COLORS.surface.panel3,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
                data-ocid="layout.panel3"
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    overflowY: "scroll",
                    minHeight: 0,
                  }}
                >
                  {renderMainPanel()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
