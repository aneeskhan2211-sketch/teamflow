import {
  DsBadge,
  DsButton,
  DsCard,
  DsInput,
  DsSelect,
  EmptyModuleState,
  NavItem,
  PageHeader,
  SectionLabel,
} from "@/components/ds";
import { MODULE_ACCENTS } from "@/moduleAccents";
import {
  COLORS,
  RADII,
  SPACING,
  STATUS_DOT_LG,
  STATUS_DOT_MD,
  STATUS_DOT_SIZE,
  TYPOGRAPHY,
} from "@/tokens";
import {
  IconArrowLeft,
  IconBriefcase,
  IconCalendarStats,
  IconClock,
  IconMail,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useState,
  useSyncExternalStore,
} from "react";
import {
  useAddPerson,
  usePeople,
  useRemoveMember,
  useUpdatePerson,
} from "../hooks/useBackend";

// ─── Types ────────────────────────────────────────────────────────────────────

type OnlineStatus = "online" | "away" | "offline";
type FilterKey = "all" | "online" | string;
type MemberRole = "owner" | "admin" | "member" | "viewer";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  userRole: MemberRole;
  department: string;
  email: string;
  status: OnlineStatus;
  initials: string;
}

const ACCENT = MODULE_ACCENTS.people;

// ─── Module-level store (no Context, no Provider) ────────────────────────────────────

type PeopleState = {
  activeFilter: FilterKey;
  selectedMemberId: string | null;
  createOpen: boolean;
};

let _state: PeopleState = {
  activeFilter: "all",
  selectedMemberId: null,
  createOpen: false,
};
const _listeners = new Set<() => void>();

function getSnapshot(): PeopleState {
  return _state;
}
function subscribe(cb: () => void): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}
function setState(partial: Partial<PeopleState>) {
  _state = { ..._state, ...partial };
  for (const cb of _listeners) cb();
}

function usePeopleStore(): [PeopleState, (p: Partial<PeopleState>) => void] {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  const set = useCallback((p: Partial<PeopleState>) => setState(p), []);
  return [snap, set];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function normalizeStatus(s: string): OnlineStatus {
  if (s === "online" || s === "away" || s === "offline") return s;
  return "offline";
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_COLOR: Record<OnlineStatus, string> = {
  online: COLORS.semantic.success,
  away: COLORS.semantic.warning,
  offline: COLORS.neutral[300],
};

const STATUS_LABEL: Record<OnlineStatus, string> = {
  online: "Online",
  away: "Away",
  offline: "Offline",
};

// ─── Role helpers ─────────────────────────────────────────────────────────────

const ROLE_BADGE_VARIANT: Record<
  MemberRole,
  "success" | "info" | "neutral" | "default"
> = {
  owner: "success",
  admin: "info",
  member: "neutral",
  viewer: "default",
};

const ROLE_LABEL: Record<MemberRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

function normalizeRole(r: string): MemberRole {
  if (r === "owner" || r === "admin" || r === "member" || r === "viewer")
    return r;
  return "member";
}

const AVATAR_PALETTE = [
  COLORS.semantic.info,
  COLORS.brand,
  COLORS.semantic.warning,
  COLORS.semantic.success,
  COLORS.semantic.danger,
  MODULE_ACCENTS.people,
  MODULE_ACCENTS.chat,
  MODULE_ACCENTS.calendar,
  MODULE_ACCENTS.projects,
  MODULE_ACCENTS.notes,
];

function avatarColor(id: string): string {
  return AVATAR_PALETTE[(Number(id) - 1) % AVATAR_PALETTE.length];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function MemberAvatar({
  member,
  size = 40,
}: { member: TeamMember; size?: number }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: RADII.pill,
          background: avatarColor(member.id),
          color: COLORS.neutral[0],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.35,
          fontWeight: TYPOGRAPHY.weights.semibold,
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        {member.initials}
      </div>
      <span
        style={{
          position: "absolute",
          bottom: 1,
          right: 1,
          width: size > 48 ? STATUS_DOT_LG : STATUS_DOT_MD,
          height: size > 48 ? STATUS_DOT_LG : STATUS_DOT_MD,
          borderRadius: RADII.pill,
          background: STATUS_COLOR[member.status],
          border: `2px solid ${COLORS.surface.panel3}`,
          display: "block",
        }}
      />
    </div>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({
  member,
  index,
  onSelect,
}: { member: TeamMember; index: number; onSelect: (id: string) => void }) {
  return (
    <DsCard
      padding={SPACING[3]}
      shadow="subtle"
      onClick={() => onSelect(member.id)}
    >
      <div
        data-ocid={`people.member_card.${index + 1}`}
        style={{ display: "flex", alignItems: "center", gap: SPACING[3] }}
      >
        <MemberAvatar member={member} size={40} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: SPACING[2],
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontSize: TYPOGRAPHY.sizes.body,
                fontWeight: TYPOGRAPHY.weights.semibold,
                color: COLORS.text.primary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 1,
                minWidth: 0,
              }}
            >
              {member.name}
            </span>
            <DsBadge
              label={ROLE_LABEL[member.userRole]}
              variant={ROLE_BADGE_VARIANT[member.userRole]}
            />
          </div>
          <div
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.secondary,
              marginTop: SPACING[1],
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {member.role}
          </div>
          <div
            style={{
              marginTop: SPACING[1],
              display: "flex",
              alignItems: "center",
              gap: SPACING[1],
            }}
          >
            <span
              style={{
                width: STATUS_DOT_SIZE,
                height: STATUS_DOT_SIZE,
                borderRadius: RADII.pill,
                background: STATUS_COLOR[member.status],
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: TYPOGRAPHY.sizes.caption,
                color: COLORS.text.tertiary,
              }}
            >
              {STATUS_LABEL[member.status]}
            </span>
          </div>
        </div>
        <DsBadge label={member.department} />
      </div>
    </DsCard>
  );
}

// ─── Profile row ──────────────────────────────────────────────────────────────

function ProfileRow({
  icon,
  label,
  value,
}: { icon: ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: SPACING[3],
        padding: `${SPACING[3]}px 0`,
        borderBottom: `1px solid ${COLORS.border.subtle}`,
      }}
    >
      <span
        style={{
          color: COLORS.text.tertiary,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: TYPOGRAPHY.sizes.small,
          color: COLORS.text.tertiary,
          minWidth: 80,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{ fontSize: TYPOGRAPHY.sizes.small, color: COLORS.text.primary }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Inline Profile ───────────────────────────────────────────────────────────

function MemberProfile({
  member,
  onBack,
  onUpdate,
  onRemove,
}: {
  member: TeamMember;
  onBack: () => void;
  onUpdate: (id: number, data: Partial<TeamMember>) => void;
  onRemove: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<MemberRole>(member.userRole);
  const [editForm, setEditForm] = useState({
    name: member.name,
    role: member.role,
    email: member.email,
    department: member.department,
    status: member.status,
  });

  const handleSave = () => {
    onUpdate(Number(member.id), { ...editForm, userRole: selectedRole });
    setIsEditing(false);
  };

  return (
    <div style={{ padding: `${SPACING[6]}px`, maxWidth: 580 }}>
      <div
        style={{
          marginBottom: SPACING[4],
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <DsButton
          variant="ghost"
          size="sm"
          onClick={onBack}
          title="Back to directory"
        >
          <span
            style={{ display: "flex", alignItems: "center", gap: SPACING[1] }}
          >
            <IconArrowLeft size={14} />
            Back to directory
          </span>
        </DsButton>
        <div style={{ display: "flex", gap: SPACING[2] }}>
          <DsButton
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Cancel edit" : "Edit member"}
          >
            {isEditing ? "Cancel" : "Edit"}
          </DsButton>
          <DsButton
            variant="ghost"
            size="sm"
            onClick={() => onRemove(Number(member.id))}
            title="Remove member"
          >
            Remove
          </DsButton>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: SPACING[5],
          marginBottom: SPACING[5],
        }}
      >
        <MemberAvatar member={member} size={72} />
        <div style={{ minWidth: 0, flex: 1 }}>
          {isEditing ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: SPACING[3],
              }}
            >
              <DsInput
                value={editForm.name}
                onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
                accentColor={ACCENT}
                style={{
                  fontSize: TYPOGRAPHY.sizes.h2,
                  fontWeight: TYPOGRAPHY.weights.bold,
                  width: "100%",
                }}
              />
              <DsInput
                value={editForm.role}
                onChange={(v) => setEditForm((f) => ({ ...f, role: v }))}
                accentColor={ACCENT}
                style={{ fontSize: TYPOGRAPHY.sizes.body, width: "100%" }}
              />
              <div
                style={{
                  display: "flex",
                  gap: SPACING[2],
                  alignItems: "center",
                }}
              >
                <DsSelect
                  value={editForm.status}
                  onChange={(v) =>
                    setEditForm((f) => ({
                      ...f,
                      status: v as OnlineStatus,
                    }))
                  }
                  options={[
                    { value: "online", label: "Online" },
                    { value: "away", label: "Away" },
                    { value: "offline", label: "Offline" },
                  ]}
                  style={{ fontSize: TYPOGRAPHY.sizes.small }}
                />
                <DsButton
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  title="Save changes"
                >
                  Save changes
                </DsButton>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[2],
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    fontSize: TYPOGRAPHY.sizes.h2,
                    fontWeight: TYPOGRAPHY.weights.bold,
                    color: COLORS.text.primary,
                    margin: 0,
                    lineHeight: TYPOGRAPHY.lineHeights.tight,
                  }}
                >
                  {member.name}
                </h2>
                <DsBadge
                  label={ROLE_LABEL[selectedRole]}
                  variant={ROLE_BADGE_VARIANT[selectedRole]}
                />
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.sizes.body,
                  color: COLORS.text.secondary,
                  marginTop: SPACING[1],
                }}
              >
                {member.role}
              </div>
              <div
                style={{
                  marginTop: SPACING[2],
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[2],
                }}
              >
                <DsBadge label={member.department} />
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: SPACING[1],
                  }}
                >
                  <span
                    style={{
                      width: SPACING[2],
                      height: SPACING[2],
                      borderRadius: RADII.pill,
                      background: STATUS_COLOR[member.status],
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: TYPOGRAPHY.sizes.small,
                      color: COLORS.text.secondary,
                    }}
                  >
                    {STATUS_LABEL[member.status]}
                  </span>
                </span>
              </div>
              {/* Role selector — inline, no modal */}
              <div
                style={{
                  marginTop: SPACING[3],
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[2],
                }}
              >
                <span
                  style={{
                    fontSize: TYPOGRAPHY.sizes.small,
                    color: COLORS.text.tertiary,
                    minWidth: 40,
                  }}
                >
                  Role
                </span>
                <DsSelect
                  data-ocid="people.role_select"
                  value={selectedRole}
                  onChange={(v) => setSelectedRole(v as MemberRole)}
                  options={[
                    { value: "admin", label: "Admin" },
                    { value: "member", label: "Member" },
                    { value: "viewer", label: "Viewer" },
                  ]}
                  style={{ fontSize: TYPOGRAPHY.sizes.small, width: "auto" }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.border.default}` }}>
        {isEditing ? (
          <div
            style={{
              padding: `${SPACING[3]}px 0`,
              display: "flex",
              flexDirection: "column",
              gap: SPACING[3],
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: SPACING[3] }}
            >
              <span
                style={{
                  color: COLORS.text.tertiary,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <IconMail size={15} />
              </span>
              <span
                style={{
                  fontSize: TYPOGRAPHY.sizes.small,
                  color: COLORS.text.tertiary,
                  minWidth: 80,
                  flexShrink: 0,
                }}
              >
                Email
              </span>
              <DsInput
                type="email"
                value={editForm.email}
                onChange={(v) => setEditForm((f) => ({ ...f, email: v }))}
                accentColor={ACCENT}
                style={{ flex: 1, fontSize: TYPOGRAPHY.sizes.small }}
              />
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: SPACING[3] }}
            >
              <span
                style={{
                  color: COLORS.text.tertiary,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <IconUsers size={15} />
              </span>
              <span
                style={{
                  fontSize: TYPOGRAPHY.sizes.small,
                  color: COLORS.text.tertiary,
                  minWidth: 80,
                  flexShrink: 0,
                }}
              >
                Department
              </span>
              <DsInput
                value={editForm.department}
                onChange={(v) => setEditForm((f) => ({ ...f, department: v }))}
                accentColor={ACCENT}
                style={{ flex: 1, fontSize: TYPOGRAPHY.sizes.small }}
              />
            </div>
          </div>
        ) : (
          <>
            <ProfileRow
              icon={<IconMail size={15} />}
              label="Email"
              value={member.email}
            />
            <ProfileRow
              icon={<IconBriefcase size={15} />}
              label="Department"
              value={member.department}
            />
            <ProfileRow
              icon={<IconClock size={15} />}
              label="Last active"
              value={
                member.status === "online"
                  ? "Active now"
                  : member.status === "away"
                    ? "Away · a few minutes ago"
                    : "Offline · last seen today"
              }
            />
            <ProfileRow
              icon={<IconCalendarStats size={15} />}
              label="Member since"
              value="Jan 2025"
            />
            <ProfileRow
              icon={<IconUsers size={15} />}
              label="Reports to"
              value="—"
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Inline Add Form ──────────────────────────────────────────────────────────

function NewMemberInlineForm({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    department: "",
  });
  const addPerson = useAddPerson();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    const initials = getInitials(form.name);
    addPerson.mutate(
      {
        name: form.name.trim(),
        role: form.role.trim() || "Member",
        email: form.email.trim(),
        department: form.department.trim() || "General",
        avatarInitials: initials,
      },
      {
        onSuccess: () => {
          setForm({ name: "", role: "", email: "", department: "" });
          onClose();
        },
      },
    );
  };

  if (!open) return null;

  return (
    <div
      data-ocid="people.new_member_form"
      style={{
        padding: SPACING[4],
        borderBottom: `1px solid ${COLORS.border.subtle}`,
        background: COLORS.surface.panel3,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: SPACING[3] }}
      >
        <div style={{ display: "flex", gap: SPACING[3] }}>
          <DsInput
            placeholder="Full name"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            accentColor={ACCENT}
            style={{ flex: 1, fontSize: TYPOGRAPHY.sizes.small }}
            data-ocid="people.input.name"
          />
          <DsInput
            placeholder="Role"
            value={form.role}
            onChange={(v) => setForm((f) => ({ ...f, role: v }))}
            accentColor={ACCENT}
            style={{ flex: 1, fontSize: TYPOGRAPHY.sizes.small }}
            data-ocid="people.input.role"
          />
        </div>
        <div style={{ display: "flex", gap: SPACING[3] }}>
          <DsInput
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            accentColor={ACCENT}
            style={{ flex: 1, fontSize: TYPOGRAPHY.sizes.small }}
            data-ocid="people.input.email"
          />
          <DsInput
            placeholder="Department"
            value={form.department}
            onChange={(v) => setForm((f) => ({ ...f, department: v }))}
            accentColor={ACCENT}
            style={{ flex: 1, fontSize: TYPOGRAPHY.sizes.small }}
            data-ocid="people.input.department"
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: SPACING[2],
            justifyContent: "flex-end",
          }}
        >
          <DsButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            type="button"
            title="Cancel"
          >
            Cancel
          </DsButton>
          <DsButton
            variant="primary"
            size="sm"
            type="submit"
            disabled={
              addPerson.isPending || !form.name.trim() || !form.email.trim()
            }
            title="Add member"
          >
            {addPerson.isPending ? "Adding..." : "Add member"}
          </DsButton>
        </div>
      </form>
    </div>
  );
}

// ─── SecondaryPanel ───────────────────────────────────────────────────────────

export function SecondaryPanel() {
  const [{ activeFilter }, set] = usePeopleStore();
  const { data: people = [] } = usePeople();

  function select(f: FilterKey) {
    set({ activeFilter: f, selectedMemberId: null });
  }

  const members = people.map((p) => ({
    id: String(p.id),
    name: p.name,
    role: p.role,
    userRole: normalizeRole(p.role),
    department: p.department,
    email: p.email,
    status: normalizeStatus(p.status),
    initials: p.avatarInitials,
  }));

  const departments = Array.from(new Set(members.map((m) => m.department)));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          paddingTop: SPACING[1],
        }}
      >
        <SectionLabel label="Directory" />
        <NavItem
          label="All Members"
          accent={ACCENT}
          selected={activeFilter === "all"}
          onClick={() => select("all")}
          count={members.length}
          data-ocid="people.filter.all"
        />
        <NavItem
          label="Online"
          accent={ACCENT}
          selected={activeFilter === "online"}
          onClick={() => select("online")}
          count={members.filter((m) => m.status === "online").length}
          data-ocid="people.filter.online"
        />

        <SectionLabel label="Department" />
        {departments.map((dept) => (
          <NavItem
            key={dept}
            label={dept}
            accent={ACCENT}
            selected={activeFilter === dept}
            onClick={() => select(dept)}
            count={members.filter((m) => m.department === dept).length}
            data-ocid={`people.filter.${dept.toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MainPanel ────────────────────────────────────────────────────────────────

export function MainPanel() {
  const [{ activeFilter, selectedMemberId, createOpen }, set] =
    usePeopleStore();
  const { data: people = [], isLoading } = usePeople();
  const updatePerson = useUpdatePerson();
  const removeMember = useRemoveMember();

  const members = people.map((p) => ({
    id: String(p.id),
    name: p.name,
    role: p.role,
    userRole: normalizeRole(p.role),
    department: p.department,
    email: p.email,
    status: normalizeStatus(p.status),
    initials: p.avatarInitials,
  }));

  const filtered = members.filter((m) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "online") return m.status === "online";
    return m.department === activeFilter;
  });

  const selectedMember = selectedMemberId
    ? (members.find((m) => m.id === selectedMemberId) ?? null)
    : null;

  const handleUpdate = (id: number, data: Partial<TeamMember>) => {
    updatePerson.mutate({
      id,
      name: data.name ?? "",
      role: data.role ?? "",
      email: data.email ?? "",
      department: data.department ?? "",
      status: data.status ?? "offline",
    });
  };

  const handleRemove = (id: number) => {
    removeMember.mutate(id, {
      onSuccess: () => set({ selectedMemberId: null }),
    });
  };

  const memberCount = members.length;
  const adminCount = members.filter(
    (m) => m.userRole === "admin" || m.userRole === "owner",
  ).length;
  const filterTitle = selectedMember
    ? selectedMember.name
    : activeFilter === "all"
      ? "All Members"
      : activeFilter === "online"
        ? "Online"
        : activeFilter;
  const headerSubtitle = selectedMember
    ? `${selectedMember.role} · ${selectedMember.department}`
    : `${memberCount} member${memberCount !== 1 ? "s" : ""}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <PageHeader
        title={filterTitle}
        subtitle={headerSubtitle}
        primaryAction={
          selectedMember
            ? undefined
            : {
                label: "Add Member",
                icon: <IconPlus size={14} />,
                onClick: () => set({ createOpen: true }),
              }
        }
        stats={[
          { label: "Members", value: memberCount },
          { label: "Admins", value: adminCount },
          {
            label: "Online",
            value: members.filter((m) => m.status === "online").length,
          },
        ]}
      />
      {selectedMember ? (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <MemberProfile
            member={selectedMember}
            onBack={() => set({ selectedMemberId: null })}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
          />
        </div>
      ) : (
        <>
          <NewMemberInlineForm
            open={createOpen}
            onClose={() => set({ createOpen: false })}
          />
          <div style={{ flex: 1, overflowY: "auto", padding: SPACING[5] }}>
            {isLoading ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: TYPOGRAPHY.sizes.small,
                    color: COLORS.text.secondary,
                  }}
                >
                  Loading members...
                </span>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyModuleState
                icon={<IconUsers size={32} />}
                accent={ACCENT}
                title="No members in this view"
                description="Try selecting a different filter from the sidebar."
              />
            ) : (
              <div
                data-ocid="people.member_list"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: SPACING[3],
                }}
              >
                {filtered.map((member, i) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    index={i}
                    onSelect={(id) => set({ selectedMemberId: id })}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default function PeoplePage() {
  return null;
}
