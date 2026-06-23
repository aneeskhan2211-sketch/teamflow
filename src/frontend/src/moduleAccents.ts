/**
 * Single source of truth for module accent colours and display labels.
 * Import from here — never define local accent constants in page files.
 */

export const MODULE_ACCENTS: Record<string, string> = {
  tasks: "#E74C3C",
  documents: "#3498DB",
  calendar: "#5DADE2",
  chat: "#9B59B6",
  sheets: "#27AE60",
  notes: "#E67E22",
  presentations: "#1ABC9C",
  projects: "#F39C12",
  people: "#5DADE2",
  activity: "#95A5A6",
  settings: "#95A5A6",
};

export const MODULE_LABELS: Record<string, string> = {
  tasks: "Tasks",
  documents: "Documents",
  calendar: "Calendar",
  chat: "Chat",
  sheets: "Sheets",
  notes: "Notes",
  presentations: "Presentations",
  projects: "Projects",
  people: "People",
  activity: "Activity",
  settings: "Settings",
};
