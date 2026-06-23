import { TaskPriority, TaskStatus } from "@/backend";
import type { Task } from "@/backend";
import {
  IconCheckbox,
  IconLayoutKanban,
  IconList,
  IconPlus,
  IconSquareCheck,
  IconX,
} from "@tabler/icons-react";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useAllTasks,
  useCreateTask,
  useProjects,
  useTaskLists,
  useUpdateTaskStatus,
} from "../hooks/useBackend";
import { useCurrentRole, useWorkspace } from "../hooks/useWorkspace";

// ─── Priority & Status helpers ────────────────────────────────────────────────

function priorityLabel(p: TaskPriority): string {
  const map: Record<string, string> = {
    urgent: "Urgent",
    high: "High",
    normal: "Normal",
    low: "Low",
  };
  return map[p] ?? p;
}

function priorityDotColor(p: TaskPriority): string {
  const map: Record<string, string> = {
    urgent: COLORS.semantic.danger as string,
    high: COLORS.semantic.warning as string,
    normal: COLORS.semantic.info as string,
    low: COLORS.text.tertiary as string,
  };
  return map[p] ?? (COLORS.text.tertiary as string);
}

function priorityVariant(
  p: TaskPriority,
): "danger" | "warning" | "info" | "neutral" {
  const map: Record<string, "danger" | "warning" | "info" | "neutral"> = {
    urgent: "danger",
    high: "warning",
    normal: "info",
    low: "neutral",
  };
  return map[p] ?? "neutral";
}

function statusLabel(s: TaskStatus): string {
  const map: Record<string, string> = {
    todo: "To do",
    inProgress: "In progress",
    blocked: "Blocked",
    done: "Done",
  };
  return map[s] ?? s;
}

function statusVariant(
  s: TaskStatus,
): "neutral" | "info" | "warning" | "success" {
  const map: Record<string, "neutral" | "info" | "warning" | "success"> = {
    todo: "neutral",
    inProgress: "info",
    blocked: "warning",
    done: "success",
  };
  return map[s] ?? "neutral";
}

function tsToMs(ts: bigint): number {
  // Backend timestamps are nanoseconds; convert to milliseconds
  const raw = Number(ts);
  // If > year 3000 in ms, it's nanoseconds
  return raw > 32503680000000 ? Math.floor(raw / 1_000_000) : raw;
}

function formatDate(ts: bigint | null | undefined): string {
  if (ts == null) return "—";
  const ms = tsToMs(ts);
  if (ms === 0) return "—";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isToday(ts: bigint | null | undefined): boolean {
  if (ts == null) return false;
  const ms = tsToMs(ts);
  if (ms === 0) return false;
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(ts: bigint | null | undefined): boolean {
  if (ts == null) return false;
  const ms = tsToMs(ts);
  if (ms === 0) return false;
  const d = new Date(ms);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return d >= weekStart && d < weekEnd;
}

// ─── Avatar Chip ──────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  COLORS.modules.documents,
  COLORS.modules.sheets,
  COLORS.modules.notes,
  COLORS.modules.calendar,
] as string[];

function AvatarChip({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      style={{
        background: color,
        color: COLORS.neutral[0] as string,
        fontSize: TYPOGRAPHY.sizes.micro,
        fontWeight: TYPOGRAPHY.weights.semibold,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: SPACING[5],
        height: SPACING[5],
        borderRadius: RADII.pill,
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}

// ─── Tasks page shared context (links SecondaryPanel ↔ MainPanel) ─────────────

import {
  DsBadge,
  DsButton,
  DsIconButton,
  DsInput,
  DsSelect,
  EmptyModuleState,
  NavItem,
  PageHeader,
  SectionLabel,
} from "../components/ds";
import { MODULE_ACCENTS } from "../moduleAccents";
import {
  COLORS,
  ICON_BTN_SM,
  RADII,
  SHADOWS,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "../tokens";

// ICON_BTN_SM (24) imported from tokens

interface TasksCtx {
  activeView: "list" | "board";
  setActiveView: (v: "list" | "board") => void;
  selectedTask: Task | null;
  setSelectedTask: (t: Task | null) => void;
  createOpen: boolean;
  setCreateOpen: (v: boolean) => void;
}

const TasksContext = createContext<TasksCtx | null>(null);

function useTasksCtx(): TasksCtx {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasksCtx: missing TasksProvider");
  return ctx;
}

// ─── Secondary Panel ─────────────────────────────────────────────────────────

function TasksSecondaryPanelInner() {
  const {
    activeTaskListId,
    setActiveTaskListId,
    activeTaskFilter: activeFilter,
    setActiveTaskFilter: setActiveFilter,
  } = useWorkspace();
  const { data: taskLists = [] } = useTaskLists();
  const { data: allTasks = [] } = useAllTasks();

  const myTasksCount = allTasks.length;
  const todayCount = allTasks.filter((t) => isToday(t.dueDate)).length;
  const weekCount = allTasks.filter((t) => isThisWeek(t.dueDate)).length;

  function listCount(listId: number) {
    return allTasks.filter((t) => Number(t.listId) === listId).length;
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
      data-ocid="tasks.secondary_panel"
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        <SectionLabel label="Filters" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <NavItem
            label="Assigned to me"
            accent={COLORS.modules.tasks as string}
            selected={activeFilter === "myTasks"}
            count={myTasksCount}
            onClick={() => setActiveFilter("myTasks")}
            data-ocid="tasks.filter.my_tasks"
          />
          <NavItem
            label="Today"
            accent={COLORS.modules.tasks as string}
            selected={activeFilter === "today"}
            count={todayCount > 0 ? todayCount : undefined}
            onClick={() => setActiveFilter("today")}
            data-ocid="tasks.filter.today"
          />
          <NavItem
            label="This week"
            accent={COLORS.modules.tasks as string}
            selected={activeFilter === "thisWeek"}
            count={weekCount > 0 ? weekCount : undefined}
            onClick={() => setActiveFilter("thisWeek")}
            data-ocid="tasks.filter.this_week"
          />
        </div>

        <SectionLabel label="Lists" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {taskLists.map((list) => {
            const isSelected =
              activeFilter === "list" &&
              Number(activeTaskListId) === Number(list.id);
            return (
              <NavItem
                key={String(list.id)}
                label={list.name}
                accent={COLORS.modules.tasks as string}
                selected={isSelected}
                count={listCount(Number(list.id))}
                onClick={() => {
                  setActiveFilter("list");
                  setActiveTaskListId(Number(list.id));
                }}
                data-ocid={`tasks.list.${list.id}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Task List View ───────────────────────────────────────────────────────────

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (t: Task) => void;
}

function TaskListView({ tasks, onTaskClick }: TaskListViewProps) {
  const updateStatus = useUpdateTaskStatus();

  const handleCheckbox = useCallback(
    (e: React.MouseEvent, task: Task) => {
      e.stopPropagation();
      const next: TaskStatus =
        task.status === TaskStatus.done ? TaskStatus.todo : TaskStatus.done;
      updateStatus.mutate({ id: Number(task.id), status: next });
    },
    [updateStatus],
  );

  const activeTasks = tasks.filter((t) => t.status !== TaskStatus.done);
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.done);

  if (tasks.length === 0) {
    return (
      <div data-ocid="tasks.empty_state" style={{ flex: 1, display: "flex" }}>
        <EmptyModuleState
          icon={<IconSquareCheck size={28} />}
          accent={COLORS.modules.tasks as string}
          title="No tasks yet"
          description="Create your first task to get started."
          actionLabel="New task"
          onAction={() => {}}
        />
      </div>
    );
  }

  function TaskRow({ task, index }: { task: Task; index: number }) {
    const isDone = task.status === TaskStatus.done;
    return (
      <DsButton
        key={String(task.id)}
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onTaskClick(task)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: SPACING[3],
          paddingLeft: SPACING[6],
          paddingRight: SPACING[6],
          paddingTop: 10,
          paddingBottom: 10,
          borderBottom: `1px solid ${COLORS.border.subtle}`,
          borderRadius: 0,
          textAlign: "left",
          background: COLORS.surface.panel3,
          height: "auto",
          justifyContent: "flex-start",
        }}
        data-ocid={`tasks.item.${index + 1}`}
      >
        {/* Checkbox */}
        <span
          style={{ position: "relative", width: 16, height: 16, flexShrink: 0 }}
          data-ocid={`tasks.checkbox.${index + 1}`}
        >
          <input
            type="checkbox"
            readOnly
            checked={isDone}
            onClick={(e) => handleCheckbox(e, task)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
              margin: 0,
            }}
            aria-label={`Mark task ${task.title} as done`}
          />
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: RADII.sm,
              border: `2px solid ${isDone ? COLORS.neutral[800] : COLORS.neutral[300]}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: `border-color ${TRANSITIONS.fast}, background ${TRANSITIONS.fast}`,
              background: isDone ? COLORS.neutral[800] : "transparent",
              pointerEvents: "none",
            }}
          >
            {isDone && (
              <svg
                width="9"
                height="7"
                viewBox="0 0 9 7"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 3.5l2.5 2.5 4.5-5"
                  stroke={COLORS.neutral[0]}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </span>

        {/* Title */}
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: TYPOGRAPHY.sizes.small,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: isDone ? COLORS.text.tertiary : COLORS.text.primary,
            textDecoration: isDone ? "line-through" : "none",
          }}
        >
          {task.title}
        </span>

        {/* Assignee avatar */}
        <div
          style={{
            width: 64,
            display: "flex",
            justifyContent: "flex-end",
            gap: SPACING[1],
            flexShrink: 0,
          }}
        >
          {task.assigneeIds.slice(0, 2).map((aid) => (
            <AvatarChip
              key={aid}
              initials={String.fromCharCode(65 + ((Number(aid) - 1) % 26))}
              color={AVATAR_COLORS[Number(aid) % AVATAR_COLORS.length]}
            />
          ))}
        </div>

        {/* Due date */}
        <span
          style={{
            width: 64,
            textAlign: "right",
            fontSize: TYPOGRAPHY.sizes.small,
            flexShrink: 0,
            color: COLORS.text.secondary,
          }}
        >
          {formatDate(task.dueDate)}
        </span>

        {/* Priority — dot + badge */}
        <span
          style={{
            width: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: RADII.pill,
              background: priorityDotColor(task.priority),
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <DsBadge
            label={priorityLabel(task.priority)}
            variant={priorityVariant(task.priority)}
          />
        </span>

        {/* Status badge */}
        <span
          style={{
            width: 96,
            display: "flex",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <DsBadge
            label={statusLabel(task.status)}
            variant={statusVariant(task.status)}
          />
        </span>
      </DsButton>
    );
  }

  return (
    <div
      style={{ flex: 1, overflowY: "auto", background: COLORS.surface.panel3 }}
      data-ocid="tasks.list"
    >
      {/* Column headers */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING[3],
          paddingLeft: SPACING[6],
          paddingRight: SPACING[6],
          paddingTop: SPACING[2],
          paddingBottom: SPACING[2],
          fontSize: TYPOGRAPHY.sizes.micro,
          fontWeight: TYPOGRAPHY.weights.semibold,
          textTransform: "uppercase",
          letterSpacing: TYPOGRAPHY.letterSpacing.widest,
          borderBottom: `1px solid ${COLORS.border.default}`,
          position: "sticky",
          top: 0,
          color: COLORS.text.tertiary,
          background: COLORS.surface.panel3,
        }}
      >
        <span style={{ width: 16, flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0 }}>Task</span>
        <span style={{ width: 64, textAlign: "right" }}>Assignee</span>
        <span style={{ width: 64, textAlign: "right" }}>Due</span>
        <span style={{ width: 96, textAlign: "right" }}>Priority</span>
        <span style={{ width: 96, textAlign: "right" }}>Status</span>
      </div>

      {/* Active tasks */}
      {activeTasks.map((task, i) => (
        <TaskRow key={String(task.id)} task={task} index={i} />
      ))}

      {/* Completed section */}
      {completedTasks.length > 0 && (
        <>
          <div
            style={{
              paddingLeft: SPACING[6],
              paddingRight: SPACING[6],
              paddingTop: SPACING[2],
              paddingBottom: SPACING[2],
              fontSize: TYPOGRAPHY.sizes.micro,
              fontWeight: TYPOGRAPHY.weights.semibold,
              textTransform: "uppercase",
              letterSpacing: TYPOGRAPHY.letterSpacing.widest,
              color: COLORS.text.tertiary,
              borderBottom: `1px solid ${COLORS.border.subtle}`,
            }}
          >
            Completed
          </div>
          {completedTasks.map((task, i) => (
            <TaskRow
              key={String(task.id)}
              task={task}
              index={activeTasks.length + i}
            />
          ))}
        </>
      )}
    </div>
  );
}

// ─── Task Board View ──────────────────────────────────────────────────────────

const BOARD_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: TaskStatus.todo, label: "To do" },
  { status: TaskStatus.inProgress, label: "In progress" },
  { status: TaskStatus.blocked, label: "Blocked" },
  { status: TaskStatus.done, label: "Done" },
];

function TaskBoardView({ tasks, onTaskClick }: TaskListViewProps) {
  return (
    <div
      style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}
      data-ocid="tasks.board"
    >
      <div
        style={{
          display: "flex",
          gap: SPACING[4],
          padding: SPACING[4],
          height: "100%",
          minWidth: "max-content",
        }}
      >
        {BOARD_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              className="flex flex-col gap-2"
              style={{ minWidth: 260, width: 260 }}
              data-ocid={`tasks.board.${col.status}`}
            >
              {/* Column header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[2],
                  paddingLeft: SPACING[1],
                  paddingRight: SPACING[1],
                  paddingTop: SPACING[2],
                  paddingBottom: SPACING[2],
                }}
              >
                <span
                  style={{
                    fontSize: TYPOGRAPHY.sizes.caption,
                    fontWeight: TYPOGRAPHY.weights.semibold,
                    textTransform: "uppercase",
                    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
                    color: COLORS.text.primary,
                  }}
                >
                  {col.label}
                </span>
                <span
                  style={{
                    fontSize: TYPOGRAPHY.sizes.micro,
                    fontWeight: TYPOGRAPHY.weights.medium,
                    paddingLeft: 6,
                    paddingRight: 6,
                    paddingTop: 2,
                    paddingBottom: 2,
                    borderRadius: RADII.pill,
                    background: COLORS.neutral[100],
                    color: COLORS.text.tertiary,
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Task cards */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: SPACING[2],
                  overflowY: "auto",
                  flex: 1,
                  paddingBottom: SPACING[4],
                }}
              >
                {colTasks.length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 64,
                      borderRadius: RADII.lg,
                      border: `2px dashed ${COLORS.border.default}`,
                      fontSize: TYPOGRAPHY.sizes.caption,
                      color: COLORS.text.tertiary,
                    }}
                    data-ocid={`tasks.board.${col.status}.empty_state`}
                  >
                    No tasks
                  </div>
                )}
                {colTasks.map((task, i) => (
                  <DsButton
                    key={String(task.id)}
                    type="button"
                    variant="ghost"
                    onClick={() => onTaskClick(task)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: SPACING[2],
                      padding: SPACING[3],
                      borderRadius: RADII.lg,
                      border: `1px solid ${COLORS.border.default}`,
                      textAlign: "left",
                      transition: `box-shadow ${TRANSITIONS.fast}`,
                      width: "100%",
                      background: COLORS.surface.panel3,
                      height: "auto",
                      justifyContent: "flex-start",
                    }}
                    data-ocid={`tasks.board.item.${i + 1}`}
                  >
                    <span
                      style={{
                        fontSize: TYPOGRAPHY.sizes.small,
                        fontWeight: TYPOGRAPHY.weights.medium,
                        color: COLORS.text.primary,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {task.title}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: SPACING[2],
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: SPACING[1],
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: RADII.pill,
                            background: priorityDotColor(task.priority),
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: TYPOGRAPHY.sizes.caption,
                            color: COLORS.text.secondary,
                          }}
                        >
                          {priorityLabel(task.priority)}
                        </span>
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {task.dueDate != null && Number(task.dueDate) > 0 && (
                          <span
                            style={{
                              fontSize: TYPOGRAPHY.sizes.micro,
                              color: COLORS.text.tertiary,
                            }}
                          >
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                        {task.assigneeIds.slice(0, 1).map((aid) => (
                          <AvatarChip
                            key={aid}
                            initials={String.fromCharCode(
                              65 + ((Number(aid) - 1) % 26),
                            )}
                            color={
                              AVATAR_COLORS[Number(aid) % AVATAR_COLORS.length]
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </DsButton>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Task Detail Panel ────────────────────────────────────────────────────────

function TaskDetailPanel({
  task,
  onClose,
}: { task: Task; onClose: () => void }) {
  const updateStatus = useUpdateTaskStatus();
  const { data: projects = [] } = useProjects();
  const project = projects.find((p) => Number(p.id) === Number(task.projectId));

  return (
    <div
      style={{
        width: 340,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flexShrink: 0,
        borderLeft: `1px solid ${COLORS.border.default}`,
        overflowY: "auto",
        background: COLORS.surface.panel3,
      }}
      data-ocid="tasks.dialog"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${SPACING[3]}px ${SPACING[4]}px`,
          borderBottom: `1px solid ${COLORS.border.default}`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontWeight: TYPOGRAPHY.weights.semibold,
            fontSize: TYPOGRAPHY.sizes.small,
            color: COLORS.text.primary,
          }}
        >
          Task Details
        </span>
        <DsIconButton
          size="sm"
          variant="ghost"
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          title="Close detail panel"
          data-ocid="tasks.close_button"
        >
          <IconX size={16} />
        </DsIconButton>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: SPACING[5],
          padding: SPACING[4],
        }}
      >
        {/* Title */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: SPACING[1] }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.semibold,
              textTransform: "uppercase",
              letterSpacing: TYPOGRAPHY.letterSpacing.wider,
              color: COLORS.text.tertiary,
            }}
          >
            Title
          </span>
          <p
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              fontWeight: TYPOGRAPHY.weights.medium,
              color: COLORS.text.primary,
              margin: 0,
            }}
          >
            {task.title}
          </p>
          {project && (
            <span
              style={{
                fontSize: TYPOGRAPHY.sizes.caption,
                color: COLORS.text.secondary,
                marginTop: SPACING[1],
              }}
            >
              Project:{" "}
              <span
                style={{
                  fontWeight: TYPOGRAPHY.weights.medium,
                  color: COLORS.text.primary,
                }}
              >
                {project.name}
              </span>
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: SPACING[1],
            }}
          >
            <span
              style={{
                fontSize: TYPOGRAPHY.sizes.caption,
                fontWeight: TYPOGRAPHY.weights.semibold,
                textTransform: "uppercase",
                letterSpacing: TYPOGRAPHY.letterSpacing.wider,
                color: COLORS.text.tertiary,
              }}
            >
              Description
            </span>
            <p
              style={{
                fontSize: TYPOGRAPHY.sizes.small,
                color: COLORS.text.primary,
                margin: 0,
              }}
            >
              {task.description}
            </p>
          </div>
        )}

        {/* Status */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: SPACING[1] + 2,
          }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.semibold,
              textTransform: "uppercase",
              letterSpacing: TYPOGRAPHY.letterSpacing.wider,
              color: COLORS.text.tertiary,
            }}
          >
            Status
          </span>
          <div
            style={{ display: "flex", alignItems: "center", gap: SPACING[2] }}
          >
            <DsSelect
              value={task.status}
              onChange={(v) =>
                updateStatus.mutate({
                  id: Number(task.id),
                  status: v as unknown as TaskStatus,
                })
              }
              options={[
                { value: "todo", label: "To do" },
                { value: "inProgress", label: "In progress" },
                { value: "blocked", label: "Blocked" },
                { value: "done", label: "Done" },
              ]}
              data-ocid="tasks.select"
              style={{ width: "auto", fontSize: TYPOGRAPHY.sizes.small }}
            />
            <DsBadge
              label={statusLabel(task.status)}
              variant={statusVariant(task.status)}
            />
          </div>
        </div>

        {/* Priority */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: SPACING[1] + 2,
          }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.semibold,
              textTransform: "uppercase",
              letterSpacing: TYPOGRAPHY.letterSpacing.wider,
              color: COLORS.text.tertiary,
            }}
          >
            Priority
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: SPACING[1] + 2,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: RADII.pill,
                background: priorityDotColor(task.priority),
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <DsBadge
              label={priorityLabel(task.priority)}
              variant={priorityVariant(task.priority)}
            />
          </span>
        </div>

        {/* Due date */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: SPACING[1] }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.semibold,
              textTransform: "uppercase",
              letterSpacing: TYPOGRAPHY.letterSpacing.wider,
              color: COLORS.text.tertiary,
            }}
          >
            Due Date
          </span>
          <p
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.primary,
              margin: 0,
            }}
          >
            {formatDate(task.dueDate)}
          </p>
        </div>

        {/* Assignees */}
        {task.assigneeIds.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: SPACING[1] + 2,
            }}
          >
            <span
              style={{
                fontSize: TYPOGRAPHY.sizes.caption,
                fontWeight: TYPOGRAPHY.weights.semibold,
                textTransform: "uppercase",
                letterSpacing: TYPOGRAPHY.letterSpacing.wider,
                color: COLORS.text.tertiary,
              }}
            >
              Assignees
            </span>
            <div
              style={{ display: "flex", gap: SPACING[1] + 2, flexWrap: "wrap" }}
            >
              {task.assigneeIds.map((aid) => (
                <div
                  key={aid}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: SPACING[1] + 2,
                  }}
                >
                  <AvatarChip
                    initials={String.fromCharCode(
                      65 + ((Number(aid) - 1) % 26),
                    )}
                    color={AVATAR_COLORS[Number(aid) % AVATAR_COLORS.length]}
                  />
                  <span
                    style={{
                      fontSize: TYPOGRAPHY.sizes.caption,
                      color: COLORS.text.secondary,
                    }}
                  >
                    User {Number(aid)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: SPACING[1] + 2,
            }}
          >
            <span
              style={{
                fontSize: TYPOGRAPHY.sizes.caption,
                fontWeight: TYPOGRAPHY.weights.semibold,
                textTransform: "uppercase",
                letterSpacing: TYPOGRAPHY.letterSpacing.wider,
                color: COLORS.text.tertiary,
              }}
            >
              Tags
            </span>
            <div
              style={{ display: "flex", gap: SPACING[1] + 2, flexWrap: "wrap" }}
            >
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: TYPOGRAPHY.sizes.caption,
                    padding: `2px ${SPACING[2]}px`,
                    borderRadius: RADII.pill,
                    background: COLORS.neutral[100],
                    color: COLORS.text.secondary,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mark complete */}
        {task.status !== TaskStatus.done && (
          <DsButton
            variant="primary"
            size="sm"
            onClick={() =>
              updateStatus.mutate({
                id: Number(task.id),
                status: TaskStatus.done,
              })
            }
            data-ocid="tasks.confirm_button"
          >
            <IconSquareCheck size={16} />
            Mark complete
          </DsButton>
        )}

        {/* Comments placeholder */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: SPACING[2] }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.semibold,
              textTransform: "uppercase",
              letterSpacing: TYPOGRAPHY.letterSpacing.wider,
              color: COLORS.text.tertiary,
            }}
          >
            Comments
          </span>
          <div
            className="flex items-center justify-center h-16 rounded-lg text-xs"
            style={{
              background: COLORS.neutral[100],
              color: COLORS.text.tertiary,
            }}
          >
            No comments yet
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Task Dialog ───────────────────────────────────────────────────────

// ─── Inline New Task Form ────────────────────────────────────────────────────
// Fixed-height row that collapses to height 0 when closed.
// No content below it shifts — overflow:hidden holds the space.

function NewTaskInlineForm({
  open,
  onClose,
  defaultListId,
}: { open: boolean; onClose: () => void; defaultListId: number }) {
  const [title, setTitle] = useState("");
  const createTask = useCreateTask();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      // Small defer so the height animation starts before focus
      const id = setTimeout(() => inputRef.current?.focus(), 16);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        setTitle("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate(
      {
        title: title.trim(),
        description: "",
        assigneeIds: [],
        dueDate: null,
        priority: TaskPriority.normal,
        status: TaskStatus.todo,
        listId: Number(defaultListId),
        tags: [],
      },
      {
        onSuccess: () => {
          setTitle("");
          onClose();
        },
      },
    );
  };

  const handleCancel = () => {
    setTitle("");
    onClose();
  };

  return (
    <div
      data-ocid="tasks.new_task_form"
      style={{
        overflow: "hidden",
        maxHeight: open ? 56 : 0,
        transition: `max-height ${TRANSITIONS.slow}`,
        // Reserve the border-b slot so the list rows don't shift
        borderBottom: open ? `1px solid ${COLORS.border.subtle}` : "none",
        background: COLORS.surface.panel3,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 56,
          padding: `0 ${SPACING[6]}px`,
        }}
      >
        {/* Checkbox placeholder — keeps visual column alignment */}
        <span
          style={{
            width: 16,
            height: 16,
            flexShrink: 0,
            borderRadius: 3,
            border: `2px solid ${COLORS.border.strong}`,
          }}
        />

        {/* Task name input */}
        <DsInput
          ref={inputRef}
          data-ocid="tasks.input"
          type="text"
          value={title}
          onChange={setTitle}
          placeholder="Task name..."
          accentColor={COLORS.modules.tasks as string}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            fontSize: TYPOGRAPHY.sizes.small,
            boxShadow: "none",
            padding: 0,
            minWidth: 0,
          }}
        />

        {/* Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <DsButton
            type="submit"
            variant="primary"
            size="sm"
            disabled={createTask.isPending || !title.trim()}
            data-ocid="tasks.submit_button"
          >
            {createTask.isPending ? "Saving..." : "Save"}
          </DsButton>
          <DsIconButton
            size="sm"
            variant="ghost"
            type="button"
            onClick={handleCancel}
            aria-label="Cancel new task"
            data-ocid="tasks.cancel_button"
          >
            <IconX size={14} />
          </DsIconButton>
        </div>
      </form>
    </div>
  );
}

// ─── Named panel exports (consumed by Layout.tsx) ────────────────────────────

// SecondaryPanel reads activeTaskFilter from useWorkspace (shared global state)
export function SecondaryPanel() {
  return <TasksSecondaryPanelInner />;
}

// MainPanel owns the UI-only state: view, selectedTask, createOpen
export function MainPanel() {
  return (
    <TasksPageProvider>
      <TasksMainPanelInner />
    </TasksPageProvider>
  );
}

// ─── Provider wraps MainPanel so it has access to UI-only state ──────────────

function TasksPageProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<"list" | "board">("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <TasksContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedTask,
        setSelectedTask,
        createOpen,
        setCreateOpen,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

// ─── Main panel inner (needs TasksContext) ────────────────────────────────────

function TasksMainPanelInner() {
  const { canEdit } = useCurrentRole();
  const { activeTaskListId, activeTaskFilter: activeFilter } = useWorkspace();
  const {
    activeView,
    setActiveView,
    selectedTask,
    setSelectedTask,
    createOpen,
    setCreateOpen,
  } = useTasksCtx();

  const { data: allTasks = [], isLoading } = useAllTasks();
  const { data: taskLists = [] } = useTaskLists();

  const activeTitle = (() => {
    switch (activeFilter) {
      case "myTasks":
        return "My Tasks";
      case "today":
        return "Today";
      case "thisWeek":
        return "This Week";
      case "list": {
        const found = taskLists.find(
          (l) => Number(l.id) === Number(activeTaskListId),
        );
        return found ? found.name : "Task List";
      }
    }
  })();

  const filteredTasks = (() => {
    switch (activeFilter) {
      case "myTasks":
        return allTasks;
      case "today":
        return allTasks.filter((t) => isToday(t.dueDate));
      case "thisWeek":
        return allTasks.filter((t) => isThisWeek(t.dueDate));
      case "list":
        return allTasks.filter(
          (t) => Number(t.listId) === Number(activeTaskListId),
        );
      default:
        return allTasks;
    }
  })();

  const handleNewTask = useCallback(() => setCreateOpen(true), [setCreateOpen]);
  const handleTaskClick = useCallback(
    (t: Task) => setSelectedTask(t),
    [setSelectedTask],
  );
  const handleCloseDetail = useCallback(
    () => setSelectedTask(null),
    [setSelectedTask],
  );
  const handleCloseCreate = useCallback(
    () => setCreateOpen(false),
    [setCreateOpen],
  );

  const activeCount = filteredTasks.filter(
    (t) => t.status !== TaskStatus.done,
  ).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <PageHeader
        title={activeTitle}
        subtitle={`${activeCount} active`}
        primaryAction={
          canEdit
            ? {
                label: "New task",
                icon: <IconPlus size={14} />,
                onClick: handleNewTask,
              }
            : undefined
        }
        viewControls={[
          {
            id: "list",
            icon: <IconList size={16} />,
            label: "List view",
            active: activeView === "list",
            onClick: () => setActiveView("list"),
          },
          {
            id: "board",
            icon: <IconLayoutKanban size={16} />,
            label: "Board view",
            active: activeView === "board",
            onClick: () => setActiveView("board"),
          },
        ]}
        stats={[
          { label: "Open", value: activeCount },
          {
            label: "Completed",
            value: allTasks.filter((t) => t.status === "done").length,
          },
          {
            label: "Overdue",
            value: allTasks.filter(
              (t) =>
                t.dueDate &&
                new Date(Number(t.dueDate)) < new Date() &&
                t.status !== "done",
            ).length,
          },
        ]}
      />

      {isLoading ? (
        <div
          className="flex flex-1 items-center justify-center"
          data-ocid="tasks.loading_state"
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor: `${COLORS.modules.tasks} transparent transparent`,
              }}
            />
            <span className="text-sm" style={{ color: COLORS.text.tertiary }}>
              Loading tasks...
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* Inline new task form — collapses to height 0, no layout shift */}
          {activeView === "list" && (
            <NewTaskInlineForm
              open={createOpen}
              onClose={handleCloseCreate}
              defaultListId={activeTaskListId}
            />
          )}

          {activeView === "list" ? (
            <TaskListView tasks={filteredTasks} onTaskClick={handleTaskClick} />
          ) : (
            <TaskBoardView
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
            />
          )}
        </div>
      )}

      {selectedTask && (
        <TaskDetailPanel task={selectedTask} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

// ─── Tasks Page (standalone) ──────────────────────────────────────────────────

export { SecondaryPanel as TasksSecondaryPanel };
export { MainPanel as TasksMainPanel };
export default function TasksPage() {
  return (
    <TasksPageProvider>
      <TasksSecondaryPanelInner />
      <TasksMainPanelInner />
    </TasksPageProvider>
  );
}
