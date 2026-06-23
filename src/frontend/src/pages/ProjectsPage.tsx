import {
  DsBadge,
  DsButton,
  DsIconButton,
  DsInput,
  DsSelect,
  DsTextarea,
  EmptyModuleState,
  NavItem,
  PageHeader,
  SectionLabel,
} from "@/components/ds";
import {
  useAllTasks,
  useCreateMilestone,
  useCreateProject,
  useCreateTask,
  useDeleteMilestone,
  useDeleteProject,
  usePeople,
  useProjectMilestones,
  useProjects,
  useToggleMilestone,
} from "@/hooks/useBackend";
import { MODULE_ACCENTS } from "@/moduleAccents";
import {
  AVATAR_COLORS,
  COLORS,
  GAP_XS,
  ICON_BOX_LG,
  RADII,
  SHADOWS,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "@/tokens";
import {
  IconCheck,
  IconFolderOpen,
  IconLayoutGrid,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

import { useState, useSyncExternalStore } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectStatus = "active" | "on-hold" | "complete";
type StatusFilter = "all" | ProjectStatus;

// ─── Module-level selection store (no context, cross-panel sync) ─────────────

let _selectedProjectId: number | null = null;
const _projectListeners = new Set<() => void>();

function _setSelectedProjectId(id: number | null) {
  if (_selectedProjectId !== id) {
    _selectedProjectId = id;
    for (const l of _projectListeners) l();
  }
}

function _subscribeProjects(cb: () => void) {
  _projectListeners.add(cb);
  return () => _projectListeners.delete(cb);
}

function useProjectsStore(): [number | null, (id: number | null) => void] {
  const id = useSyncExternalStore(
    _subscribeProjects,
    () => _selectedProjectId,
    () => _selectedProjectId,
  );
  return [id, _setSelectedProjectId];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCENT = MODULE_ACCENTS.projects;

function statusVariant(s: string): "info" | "warning" | "success" {
  if (s === "active") return "info";
  if (s === "on-hold") return "warning";
  return "success";
}

function statusLabel(s: string): string {
  if (s === "active") return "Active";
  if (s === "on-hold") return "On Hold";
  if (s === "complete") return "Complete";
  return s;
}

// statusBg removed — DsBadge variant handles status colors

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "on-hold", label: "On Hold" },
  { id: "complete", label: "Complete" },
];

const PROJECT_COLORS = [
  ACCENT,
  COLORS.semantic.info,
  COLORS.semantic.success,
  COLORS.semantic.danger,
  COLORS.semantic.warning,
  COLORS.brand,
  MODULE_ACCENTS.chat,
  MODULE_ACCENTS.presentations,
];

function initialsFor(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarColorFor(id: string): string {
  const index = id.charCodeAt(0);
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

const ICON_BOX = ICON_BOX_LG; // 36px icon box — token constant
const GAP_SM = GAP_XS; // 6px gap — token constant

// ─── Member avatars stack ─────────────────────────────────────────────────────

function MemberAvatars({
  memberIds,
  size = 24,
}: { memberIds: string[]; size?: number }) {
  const { data: people = [] } = usePeople();
  const members = memberIds
    .map((id) => people.find((p) => String(p.id) === id))
    .filter(Boolean);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {members.slice(0, 4).map((m, i) => (
        <div
          key={String(m!.id)}
          style={{
            width: size,
            height: size,
            borderRadius: RADII.pill,
            background: avatarColorFor(String(m!.id)),
            color: COLORS.neutral[0],
            fontSize: size * 0.45,
            fontWeight: TYPOGRAPHY.weights.semibold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: i > 0 ? -size * 0.3 : 0,
            border: `2px solid ${COLORS.neutral[0]}`,
            flexShrink: 0,
          }}
        >
          {m!.avatarInitials || initialsFor(m!.name)}
        </div>
      ))}
      {members.length > 4 && (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: RADII.pill,
            background: COLORS.neutral[200],
            color: COLORS.text.secondary,
            fontSize: size * 0.4,
            fontWeight: TYPOGRAPHY.weights.medium,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: -size * 0.3,
            border: `2px solid ${COLORS.neutral[0]}`,
            flexShrink: 0,
          }}
        >
          +{members.length - 4}
        </div>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  value,
  total,
  color,
}: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          height: SPACING[1],
          background: COLORS.neutral[200],
          borderRadius: RADII.pill,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: RADII.pill,
            transition: `width ${TRANSITIONS.slow}`,
          }}
        />
      </div>
      <div
        style={{
          fontSize: TYPOGRAPHY.sizes.caption,
          color: COLORS.text.tertiary,
          marginTop: SPACING[1],
          fontWeight: TYPOGRAPHY.weights.medium,
        }}
      >
        {value}/{total} milestones
      </div>
    </div>
  );
}

// ─── Inline new project form ──────────────────────────────────────────────────

function NewProjectForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const createProject = useCreateProject();

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    createProject.mutate(
      {
        name: trimmed,
        description: description.trim(),
        status,
        color,
        ownerId: "1",
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div
      data-ocid="projects.new_project_form"
      style={{
        margin: `${SPACING[4]}px ${SPACING[6]}px`,
        padding: SPACING[4],
        background: COLORS.neutral[0],
        border: `1px solid ${COLORS.border.default}`,
        borderRadius: RADII.lg,
        display: "flex",
        flexDirection: "column",
        gap: SPACING[3],
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: TYPOGRAPHY.sizes.small,
            fontWeight: TYPOGRAPHY.weights.semibold,
            color: COLORS.text.primary,
          }}
        >
          New project
        </span>
        <DsIconButton
          size="sm"
          variant="ghost"
          title="Close"
          onClick={onClose}
          aria-label="Close form"
          data-ocid="projects.new_project_form.close_button"
        >
          <IconX size={14} />
        </DsIconButton>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: GAP_SM }}>
        <label
          htmlFor="proj-name"
          style={{
            fontSize: TYPOGRAPHY.sizes.caption,
            fontWeight: TYPOGRAPHY.weights.medium,
            color: COLORS.text.secondary,
          }}
        >
          Project name
        </label>
        <DsInput
          id="proj-name"
          placeholder="e.g. Website Redesign"
          value={name}
          onChange={setName}
          accentColor={ACCENT}
          data-ocid="projects.new_project_form.input"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: GAP_SM }}>
        <label
          htmlFor="proj-desc"
          style={{
            fontSize: TYPOGRAPHY.sizes.caption,
            fontWeight: TYPOGRAPHY.weights.medium,
            color: COLORS.text.secondary,
          }}
        >
          Description
        </label>
        <DsTextarea
          id="proj-desc"
          placeholder="What is this project about?"
          value={description}
          onChange={setDescription}
          rows={2}
          accentColor={ACCENT}
          data-ocid="projects.new_project_form.textarea"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: GAP_SM }}>
        <label
          htmlFor="proj-status"
          style={{
            fontSize: TYPOGRAPHY.sizes.caption,
            fontWeight: TYPOGRAPHY.weights.medium,
            color: COLORS.text.secondary,
          }}
        >
          Status
        </label>
        <DsSelect
          id="proj-status"
          value={status}
          onChange={(v) => setStatus(v as ProjectStatus)}
          options={[
            { value: "active", label: "Active" },
            { value: "on-hold", label: "On Hold" },
            { value: "complete", label: "Complete" },
          ]}
          data-ocid="projects.new_project_form.select"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: GAP_SM }}>
        <span
          style={{
            fontSize: TYPOGRAPHY.sizes.caption,
            fontWeight: TYPOGRAPHY.weights.medium,
            color: COLORS.text.secondary,
          }}
        >
          Color
        </span>
        <div style={{ display: "flex", gap: SPACING[2], flexWrap: "wrap" }}>
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: SPACING[6],
                height: SPACING[6],
                borderRadius: RADII.pill,
                background: c,
                border:
                  color === c
                    ? `2px solid ${COLORS.text.primary}`
                    : "2px solid transparent",
                cursor: "pointer",
                flexShrink: 0,
              }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <div
        style={{ display: "flex", justifyContent: "flex-end", gap: SPACING[2] }}
      >
        <DsButton
          variant="secondary"
          size="sm"
          onClick={onClose}
          title="Cancel"
        >
          Cancel
        </DsButton>
        <DsButton
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!name.trim() || createProject.isPending}
          title="Create project"
          data-ocid="projects.new_project_form.submit_button"
        >
          {createProject.isPending ? "Creating..." : "Create project"}
        </DsButton>
      </div>
    </div>
  );
}

// ─── SecondaryPanel ───────────────────────────────────────────────────────────

export function SecondaryPanel() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: allTasks = [] } = useAllTasks();
  const [selectedId, setSelectedId] = useProjectsStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered =
    statusFilter === "all"
      ? projects
      : projects.filter((p) => p.status === statusFilter);

  const counts: Record<string, number> = {
    all: projects.length,
    active: 0,
    "on-hold": 0,
    complete: 0,
  };
  for (const p of projects) {
    counts[p.status] = (counts[p.status] || 0) + 1;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: SPACING[4],
        }}
      >
        <SectionLabel label="Filter" />
        <div>
          {STATUS_FILTERS.map((f) => (
            <NavItem
              key={f.id}
              label={
                counts[f.id] > 0 ? `${f.label} (${counts[f.id]})` : f.label
              }
              accent={ACCENT}
              selected={statusFilter === f.id}
              onClick={() => {
                setStatusFilter(f.id);
                setSelectedId(null);
              }}
              data-ocid={`projects.filter.${f.id}`}
            />
          ))}
        </div>

        {/* Projects header row with + button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${SPACING[3]}px ${SPACING[3]}px ${SPACING[1]}px`,
          }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: COLORS.text.tertiary,
              textTransform: "uppercase",
              letterSpacing: TYPOGRAPHY.letterSpacing.wider,
            }}
          >
            Projects
          </span>
        </div>

        {isLoading ? (
          <div
            style={{
              paddingLeft: SPACING[8],
              paddingRight: SPACING[4],
              paddingTop: SPACING[2],
              fontSize: TYPOGRAPHY.sizes.caption,
              color: COLORS.text.tertiary,
            }}
          >
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              paddingLeft: SPACING[8],
              paddingRight: SPACING[4],
              paddingTop: SPACING[2],
              fontSize: TYPOGRAPHY.sizes.caption,
              color: COLORS.text.tertiary,
            }}
          >
            No projects
          </div>
        ) : (
          filtered.map((p, i) => {
            const taskCount = allTasks.filter(
              (t) => t.projectId === p.id,
            ).length;
            return (
              <NavItem
                key={String(p.id)}
                label={p.name}
                accent={ACCENT}
                selected={selectedId === Number(p.id)}
                level="sub"
                onClick={() => setSelectedId(Number(p.id))}
                data-ocid={`projects.item.${i + 1}`}
                icon={
                  <div
                    style={{
                      width: SPACING[2],
                      height: SPACING[2],
                      borderRadius: RADII.pill,
                      background: p.color,
                      flexShrink: 0,
                    }}
                  />
                }
                meta={taskCount > 0 ? `${taskCount} tasks` : undefined}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Project card (grid item) ─────────────────────────────────────────────────

function ProjectCard({
  project,
  taskCount,
  milestoneCount,
  completedMilestones,
  onClick,
}: {
  project: import("@/backend").Project;
  taskCount: number;
  milestoneCount: number;
  completedMilestones: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`projects.card.${project.id}`}
      style={{
        background: COLORS.neutral[0],
        border: `1px solid ${COLORS.border.default}`,
        borderRadius: RADII.lg,
        overflow: "hidden",
        cursor: "pointer",
        transition: `box-shadow ${TRANSITIONS.fast}, transform ${TRANSITIONS.fast}`,
        padding: 0,
        textAlign: "left",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 220,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = SHADOWS.medium;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = SHADOWS.none;
      }}
    >
      <div
        style={{ height: SPACING[1], background: project.color, flexShrink: 0 }}
      />
      <div
        style={{
          padding: SPACING[4],
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: SPACING[3],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: TYPOGRAPHY.sizes.body,
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: COLORS.text.primary,
              lineHeight: TYPOGRAPHY.lineHeights.tight,
            }}
          >
            {project.name}
          </h3>
          <DsBadge
            label={statusLabel(project.status)}
            variant={statusVariant(project.status)}
          />
        </div>
        {project.description && (
          <p
            style={{
              margin: 0,
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.secondary,
              lineHeight: TYPOGRAPHY.lineHeights.normal,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.description}
          </p>
        )}
        <ProgressBar
          value={completedMilestones}
          total={milestoneCount}
          color={project.color}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <MemberAvatars
            memberIds={(project as { memberIds?: string[] }).memberIds || []}
            size={22}
          />
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              color: COLORS.text.tertiary,
              fontWeight: TYPOGRAPHY.weights.medium,
            }}
          >
            {taskCount} {taskCount === 1 ? "task" : "tasks"}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── MainPanel ────────────────────────────────────────────────────────────────

export function MainPanel() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: allTasks = [] } = useAllTasks();
  const [selectedId, setSelectedId] = useProjectsStore();
  const [showForm, setShowForm] = useState(false);

  const selectedProject = projects.find((p) => Number(p.id) === selectedId);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        background: COLORS.surface.panel3,
      }}
    >
      <PageHeader
        title={selectedProject ? selectedProject.name : "Projects"}
        subtitle={
          selectedProject
            ? `${selectedProject.status === "active" ? "Active" : selectedProject.status === "on-hold" ? "On Hold" : "Complete"} · ${allTasks.filter((t) => t.projectId === selectedProject.id).length} tasks`
            : `${projects.length} project${projects.length !== 1 ? "s" : ""}`
        }
        primaryAction={
          selectedProject
            ? undefined
            : {
                label: "New project",
                icon: <IconPlus size={14} />,
                onClick: () => setShowForm(!showForm),
              }
        }
        stats={[
          {
            label: "Active",
            value: projects.filter((p) => p.status === "active").length,
          },
          { label: "Total", value: projects.length },
        ]}
      />

      {showForm && !selectedProject && (
        <NewProjectForm onClose={() => setShowForm(false)} />
      )}

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: COLORS.text.tertiary,
              fontSize: TYPOGRAPHY.sizes.small,
            }}
          >
            Loading projects...
          </div>
        ) : !selectedProject ? (
          projects.length === 0 ? (
            <EmptyModuleState
              icon={<IconFolderOpen size={32} />}
              accent={ACCENT}
              title="No projects yet"
              description="Create your first project to start tracking work and milestones."
              actionLabel="New project"
              onAction={() => setShowForm(true)}
            />
          ) : (
            <div
              data-ocid="projects.grid"
              style={{ padding: `${SPACING[5]}px ${SPACING[6]}px` }}
            >
              {/* Empty-selection call to action */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[3],
                  marginBottom: SPACING[5],
                  padding: `${SPACING[4]}px ${SPACING[5]}px`,
                  background: `${ACCENT}08`,
                  border: `1px dashed ${ACCENT}40`,
                  borderRadius: RADII.lg,
                }}
              >
                <div
                  style={{
                    width: ICON_BOX,
                    height: ICON_BOX,
                    borderRadius: RADII.md,
                    background: `${ACCENT}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ACCENT,
                    flexShrink: 0,
                  }}
                >
                  <IconLayoutGrid size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.sizes.small,
                      fontWeight: TYPOGRAPHY.weights.semibold,
                      color: COLORS.text.primary,
                      marginBottom: SPACING[1],
                    }}
                  >
                    Select a project to view details
                  </div>
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.sizes.caption,
                      color: COLORS.text.secondary,
                    }}
                  >
                    Choose from the list on the left, or create a new project
                    below.
                  </div>
                </div>
                <DsButton
                  variant="primary"
                  size="sm"
                  onClick={() => setShowForm(true)}
                  title="New project"
                  data-ocid="projects.empty_cta.primary_button"
                >
                  <IconPlus size={13} style={{ marginRight: 4 }} /> New project
                </DsButton>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: SPACING[4],
                }}
              >
                {projects.map((p) => {
                  const taskCount = allTasks.filter(
                    (t) => t.projectId === p.id,
                  ).length;
                  return (
                    <ProjectCard
                      key={String(p.id)}
                      project={p}
                      taskCount={taskCount}
                      milestoneCount={4}
                      completedMilestones={2}
                      onClick={() => setSelectedId(Number(p.id))}
                    />
                  );
                })}
              </div>
            </div>
          )
        ) : (
          <ProjectDetail
            project={selectedProject}
            onBack={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Project detail ───────────────────────────────────────────────────────────

function ProjectDetail({
  project,
  onBack,
}: { project: import("@/backend").Project; onBack: () => void }) {
  const { data: milestones = [], isLoading: milestonesLoading } =
    useProjectMilestones(Number(project.id));
  const { data: allTasks = [] } = useAllTasks();
  const toggleMilestone = useToggleMilestone();
  const createMilestone = useCreateMilestone();
  const createTask = useCreateTask();
  const deleteMilestone = useDeleteMilestone();
  const deleteProject = useDeleteProject();
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [showMilestoneInput, setShowMilestoneInput] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const completedCount = milestones.filter((m) => m.completed).length;
  const projectTasks = allTasks.filter((t) => t.projectId === project.id);

  function handleAddMilestone() {
    const trimmed = newMilestoneTitle.trim();
    if (!trimmed) return;
    createMilestone.mutate(
      { projectId: Number(project.id), title: trimmed, dueDate: null },
      {
        onSuccess: () => {
          setNewMilestoneTitle("");
          setShowMilestoneInput(false);
        },
      },
    );
  }

  function handleDeleteProject() {
    if (confirmingDelete) {
      deleteProject.mutate(Number(project.id), { onSuccess: onBack });
    } else {
      setConfirmingDelete(true);
    }
  }

  return (
    <div
      data-ocid="projects.detail"
      style={{
        padding: `${SPACING[5]}px ${SPACING[6]}px`,
        display: "flex",
        flexDirection: "column",
        gap: SPACING[6],
        maxWidth: 720,
      }}
    >
      {/* Description + status */}
      <div
        style={{ display: "flex", alignItems: "flex-start", gap: SPACING[3] }}
      >
        <div
          style={{
            width: SPACING[3],
            height: SPACING[3],
            borderRadius: RADII.pill,
            background: project.color,
            flexShrink: 0,
            marginTop: 4,
          }}
        />
        <div style={{ flex: 1 }}>
          {project.description && (
            <p
              style={{
                margin: 0,
                fontSize: TYPOGRAPHY.sizes.body,
                color: COLORS.text.secondary,
                lineHeight: TYPOGRAPHY.lineHeights.relaxed,
              }}
            >
              {project.description}
            </p>
          )}
        </div>
        <DsBadge
          label={statusLabel(project.status)}
          variant={statusVariant(project.status)}
        />
      </div>

      {/* Meta row: members + progress */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING[6],
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: SPACING[2] }}>
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              color: COLORS.text.tertiary,
              fontWeight: TYPOGRAPHY.weights.medium,
            }}
          >
            Team
          </span>
          <MemberAvatars
            memberIds={(project as { memberIds?: string[] }).memberIds || []}
            size={26}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <ProgressBar
            value={completedCount}
            total={milestones.length}
            color={project.color}
          />
        </div>
      </div>

      {/* Tasks section */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: SPACING[3],
          }}
        >
          <div
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: COLORS.text.tertiary,
              textTransform: "uppercase",
              letterSpacing: TYPOGRAPHY.letterSpacing.widest,
            }}
          >
            Tasks
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: SPACING[3] }}
          >
            <span
              style={{
                fontSize: TYPOGRAPHY.sizes.caption,
                color: COLORS.text.tertiary,
              }}
            >
              {projectTasks.length} total
            </span>
            <DsButton
              size="sm"
              variant="secondary"
              onClick={() => {
                createTask.mutate({
                  title: "New task",
                  description: "",
                  assigneeIds: [],
                  dueDate: null,
                  priority: "medium",
                  status: "todo",
                  listId: 1,
                  projectId: Number(project.id),
                  tags: [],
                });
              }}
              data-ocid="projects.add_task_button"
            >
              <IconPlus size={14} style={{ marginRight: 6 }} />
              Add Task
            </DsButton>
          </div>
        </div>
        {projectTasks.length === 0 ? (
          <div
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.tertiary,
              padding: `${SPACING[3]}px 0`,
            }}
          >
            No tasks yet.
          </div>
        ) : (
          <div
            style={{
              border: `1px solid ${COLORS.border.default}`,
              borderRadius: RADII.lg,
              overflow: "hidden",
            }}
          >
            {projectTasks.map((t, i) => (
              <div
                key={String(t.id)}
                style={{
                  padding: `${SPACING[3]}px ${SPACING[4]}px`,
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[3],
                  borderBottom:
                    i < projectTasks.length - 1
                      ? `1px solid ${COLORS.border.subtle}`
                      : "none",
                  background: COLORS.surface.panel3,
                }}
              >
                <div
                  style={{
                    width: SPACING[2],
                    height: SPACING[2],
                    borderRadius: RADII.pill,
                    background:
                      t.status === "done"
                        ? COLORS.semantic.success
                        : t.status === "inProgress"
                          ? COLORS.semantic.info
                          : t.status === "blocked"
                            ? COLORS.semantic.danger
                            : COLORS.neutral[300],
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: TYPOGRAPHY.sizes.small,
                    color:
                      t.status === "done"
                        ? COLORS.text.tertiary
                        : COLORS.text.primary,
                    textDecoration:
                      t.status === "done" ? "line-through" : "none",
                    lineHeight: TYPOGRAPHY.lineHeights.normal,
                  }}
                >
                  {t.title}
                </span>
                {t.priority !== "normal" && (
                  <DsBadge
                    label={t.priority}
                    variant={
                      t.priority === "urgent"
                        ? "danger"
                        : t.priority === "high"
                          ? "warning"
                          : "success"
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Milestones section */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: SPACING[3],
          }}
        >
          <div
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: COLORS.text.tertiary,
              textTransform: "uppercase",
              letterSpacing: TYPOGRAPHY.letterSpacing.widest,
            }}
          >
            Milestones
          </div>
          {milestones.length > 0 && (
            <span
              style={{
                fontSize: TYPOGRAPHY.sizes.caption,
                color: COLORS.text.tertiary,
              }}
            >
              {completedCount}/{milestones.length} done
            </span>
          )}
        </div>

        {milestonesLoading ? (
          <div
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.tertiary,
              padding: `${SPACING[3]}px 0`,
            }}
          >
            Loading milestones...
          </div>
        ) : milestones.length === 0 ? (
          <div
            data-ocid="projects.milestones.empty_state"
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.tertiary,
              padding: `${SPACING[3]}px 0`,
            }}
          >
            No milestones yet.
          </div>
        ) : (
          <div
            style={{
              border: `1px solid ${COLORS.border.default}`,
              borderRadius: RADII.lg,
              overflow: "hidden",
            }}
          >
            {milestones.map((m, i) => (
              <div
                key={String(m.id)}
                style={{
                  padding: `${SPACING[3]}px ${SPACING[4]}px`,
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[3],
                  borderBottom:
                    i < milestones.length - 1
                      ? `1px solid ${COLORS.border.subtle}`
                      : "none",
                  background: m.completed
                    ? COLORS.neutral[50]
                    : COLORS.surface.panel3,
                  transition: `background ${TRANSITIONS.fast}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleMilestone.mutate(Number(m.id))}
                  data-ocid={`projects.milestone.checkbox.${i + 1}`}
                  style={{
                    width: SPACING[5],
                    height: SPACING[5],
                    borderRadius: RADII.sm,
                    border: `2px solid ${m.completed ? ACCENT : COLORS.border.default}`,
                    background: m.completed ? ACCENT : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    padding: 0,
                  }}
                  aria-label={m.title}
                >
                  {m.completed && (
                    <IconCheck size={12} color={COLORS.neutral[0]} />
                  )}
                </button>
                <span
                  style={{
                    flex: 1,
                    fontSize: TYPOGRAPHY.sizes.small,
                    color: m.completed
                      ? COLORS.text.tertiary
                      : COLORS.text.primary,
                    textDecoration: m.completed ? "line-through" : "none",
                    lineHeight: TYPOGRAPHY.lineHeights.normal,
                  }}
                >
                  {m.title}
                </span>
                <DsIconButton
                  size="sm"
                  variant="ghost"
                  title={`Delete ${m.title}`}
                  aria-label={`Delete ${m.title}`}
                  onClick={() => deleteMilestone.mutate(Number(m.id))}
                  data-ocid={`projects.milestone.delete_button.${i + 1}`}
                >
                  <IconTrash size={14} />
                </DsIconButton>
              </div>
            ))}
          </div>
        )}

        {showMilestoneInput ? (
          <div
            style={{
              display: "flex",
              gap: SPACING[2],
              marginTop: SPACING[3],
              alignItems: "center",
            }}
          >
            <DsInput
              placeholder="Milestone title"
              value={newMilestoneTitle}
              onChange={setNewMilestoneTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddMilestone();
                if (e.key === "Escape") {
                  setNewMilestoneTitle("");
                  setShowMilestoneInput(false);
                }
              }}
              accentColor={ACCENT}
              style={{ flex: 1 }}
              data-ocid="projects.milestone.input"
            />
            <DsButton
              variant="primary"
              size="sm"
              onClick={handleAddMilestone}
              disabled={!newMilestoneTitle.trim() || createMilestone.isPending}
              title="Add milestone"
              data-ocid="projects.milestone.add_button"
            >
              {createMilestone.isPending ? "Adding..." : "Add"}
            </DsButton>
            <DsButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setNewMilestoneTitle("");
                setShowMilestoneInput(false);
              }}
              title="Cancel"
            >
              Cancel
            </DsButton>
          </div>
        ) : (
          <DsButton
            variant="ghost"
            size="sm"
            onClick={() => setShowMilestoneInput(true)}
            data-ocid="projects.milestone.open_input_button"
            title="Add milestone"
            style={{
              marginTop: SPACING[3],
              width: "100%",
              justifyContent: "center",
            }}
          >
            <IconPlus size={14} /> Add milestone
          </DsButton>
        )}
      </section>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: SPACING[2],
          paddingTop: SPACING[4],
          borderTop: `1px solid ${COLORS.border.subtle}`,
        }}
      >
        <DsButton
          variant="secondary"
          size="sm"
          onClick={onBack}
          title="Back to list"
          data-ocid="projects.detail.back_button"
        >
          Back to list
        </DsButton>
        {confirmingDelete ? (
          <div
            style={{ display: "flex", alignItems: "center", gap: SPACING[2] }}
          >
            <span
              style={{
                fontSize: TYPOGRAPHY.sizes.small,
                color: COLORS.text.secondary,
              }}
            >
              Are you sure?
            </span>
            <DsButton
              variant="danger"
              size="sm"
              onClick={handleDeleteProject}
              disabled={deleteProject.isPending}
              title="Confirm delete"
              data-ocid="projects.detail.confirm_delete_button"
            >
              {deleteProject.isPending ? "Deleting..." : "Delete"}
            </DsButton>
            <DsButton
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
              title="Cancel"
            >
              Cancel
            </DsButton>
          </div>
        ) : (
          <DsButton
            variant="danger"
            size="sm"
            onClick={handleDeleteProject}
            disabled={deleteProject.isPending}
            title="Delete project"
            data-ocid="projects.detail.delete_button"
          >
            {deleteProject.isPending ? "Deleting..." : "Delete project"}
          </DsButton>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return <MainPanel />;
}
