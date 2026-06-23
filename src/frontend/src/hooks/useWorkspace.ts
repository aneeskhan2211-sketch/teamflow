import React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { UserRole } from "../types";
import type { ModuleId } from "../types";
import { useAuth } from "./useAuth";

export type TaskFilter = "myTasks" | "today" | "thisWeek" | "list";

// -- Sub-context types --------------------------------------------------

interface CoreContextType {
  activeModule: ModuleId;
  setActiveModule: (m: ModuleId) => void;
  activeChannelId: number;
  setActiveChannelId: (id: number) => void;
  activeTaskListId: number;
  setActiveTaskListId: (id: number) => void;
  activeTaskFilter: TaskFilter;
  setActiveTaskFilter: (f: TaskFilter) => void;
  activeDocumentId: number | null;
  setActiveDocumentId: (id: number | null) => void;
  activityFilter: string;
  setActivityFilter: (f: string) => void;
  currentSlideIndex: number;
  setCurrentSlideIndex: (i: number) => void;
  currentUserId: number;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
}

interface SidebarContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
}

interface UIContextType {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (v: boolean) => void;
}

// Public API -- merged shape unchanged for all call sites
export interface WorkspaceContextType
  extends CoreContextType,
    SidebarContextType,
    UIContextType {}

const CoreContext = createContext<CoreContextType | null>(null);
const SidebarContext = createContext<SidebarContextType | null>(null);
const UIContext = createContext<UIContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeModule, setActiveModule] = useState<ModuleId>("chat");
  const [activeChannelId, setActiveChannelId] = useState(1);
  const [activeTaskListId, setActiveTaskListId] = useState(1);
  const [activeTaskFilter, setActiveTaskFilter] =
    useState<TaskFilter>("myTasks");
  const [activeDocumentId, setActiveDocumentId] = useState<number | null>(null);
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { currentUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("sidebarCollapsed");
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleSidebar = React.useCallback(
    () => setSidebarCollapsed((prev) => !prev),
    [],
  );

  const coreValue = useMemo<CoreContextType>(
    () => ({
      activeModule,
      setActiveModule,
      activeChannelId,
      setActiveChannelId,
      activeTaskListId,
      setActiveTaskListId,
      activeTaskFilter,
      setActiveTaskFilter,
      activeDocumentId,
      setActiveDocumentId,
      activityFilter,
      setActivityFilter,
      currentSlideIndex,
      setCurrentSlideIndex,
      currentUserId: currentUser?.id !== undefined ? Number(currentUser.id) : 1,
      currentUserRole: ((currentUser?.role as string) ?? "member") as UserRole,
      setCurrentUserRole: (_role: UserRole) => {},
    }),
    [
      activeModule,
      activeChannelId,
      activeTaskListId,
      activeTaskFilter,
      activeDocumentId,
      activityFilter,
      currentSlideIndex,
      currentUser,
    ],
  );

  const sidebarValue = useMemo<SidebarContextType>(
    () => ({ sidebarCollapsed, setSidebarCollapsed, toggleSidebar }),
    [sidebarCollapsed, toggleSidebar],
  );

  const uiValue = useMemo<UIContextType>(
    () => ({
      searchOpen,
      setSearchOpen,
      notificationsOpen,
      setNotificationsOpen,
      darkMode,
      setDarkMode,
    }),
    [searchOpen, notificationsOpen, darkMode],
  );

  return React.createElement(
    CoreContext.Provider,
    { value: coreValue },
    React.createElement(
      SidebarContext.Provider,
      { value: sidebarValue },
      React.createElement(UIContext.Provider, { value: uiValue }, children),
    ),
  );
}

export function useWorkspace(): WorkspaceContextType {
  const core = useContext(CoreContext);
  const sidebar = useContext(SidebarContext);
  const ui = useContext(UIContext);
  if (!core || !sidebar || !ui)
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  return { ...core, ...sidebar, ...ui };
}

/** Convenience hook — returns the current user's role and a flag for common checks. */
export function useCurrentRole() {
  const { currentUserRole } = useWorkspace();
  return {
    role: currentUserRole,
    isViewer: currentUserRole === "guest",
    canEdit: currentUserRole !== "guest",
  };
}
