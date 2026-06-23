import { MODULE_ACCENTS } from "./moduleAccents";
export type ModuleId =
  | "chat"
  | "tasks"
  | "documents"
  | "calendar"
  | "sheets"
  | "notes"
  | "presentations"
  | "projects"
  | "people"
  | "activity"
  | "settings";

export type UserRole = "owner" | "admin" | "member" | "guest";

export type TaskPriority = "urgent" | "high" | "normal" | "low";

export type TaskStatus = "todo" | "inProgress" | "blocked" | "done";

export type NotifType = "mention" | "activity" | "update";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  title: string;
  department: string;
}

export interface Channel {
  id: number;
  name: string;
  topic: string;
  workspaceId: number;
  createdAt: bigint;
}

export interface Message {
  id: number;
  channelId: number;
  authorId: number;
  content: string;
  createdAt: bigint;
}

export interface DirectMessage {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  createdAt: bigint;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assigneeIds: number[];
  dueDate: bigint | null;
  priority: TaskPriority;
  status: TaskStatus;
  projectId: number | null;
  tags: string[];
  listId: number;
  createdAt: bigint;
}

export interface TaskList {
  id: number;
  name: string;
  workspaceId: number;
  projectId: number | null;
  isPersonal: boolean;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  authorId: number;
  workspaceId: number;
  folderId: number | null;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  workspaceId: number;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  body: string;
  notifType: NotifType;
  isRead: boolean;
  createdAt: bigint;
  sourceId: number | null;
  sourceType: string | null;
}

export interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: string;
  accent: string;
}

export const MODULE_CONFIGS: ModuleConfig[] = [
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
  {
    id: "settings",
    label: "Settings",
    icon: "IconSettings",
    accent: MODULE_ACCENTS.settings,
  },
];
