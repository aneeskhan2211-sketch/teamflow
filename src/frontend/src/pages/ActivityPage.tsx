import { DsBadge, NavItem, PageHeader, SectionLabel } from "@/components/ds";
import { AVATAR_COLORS, COLORS, RADII, SPACING, TYPOGRAPHY } from "@/tokens";
import {
  IconBrandHipchat,
  IconCalendar,
  IconFile,
  IconListCheck,
  IconMessage,
  IconUsers,
} from "@tabler/icons-react";
import type React from "react";
import { useMemo, useSyncExternalStore } from "react";
import { useActivityFeed, useUsers } from "../hooks/useBackend";

// ─── Types ────────────────────────────────────────────────────────────────────

type Module =
  | "Tasks"
  | "Documents"
  | "Chat"
  | "Calendar"
  | "Projects"
  | "Notes"
  | "Sheets"
  | "Presentations"
  | "People"
  | "Settings";

const ALL_MODULES: Module[] = [
  "Tasks",
  "Documents",
  "Chat",
  "Calendar",
  "Projects",
  "Notes",
  "Sheets",
  "Presentations",
  "People",
  "Settings",
];

// ─── Module config ────────────────────────────────────────────────────────────

const MODULE_CONFIG: Record<
  string,
  {
    color: string;
    icon: React.ReactNode;
    badgeVariant:
      | "danger"
      | "info"
      | "success"
      | "warning"
      | "neutral"
      | "default";
  }
> = {
  Tasks: {
    color: COLORS.modules.tasks,
    icon: <IconListCheck size={12} />,
    badgeVariant: "danger",
  },
  Documents: {
    color: COLORS.modules.documents,
    icon: <IconFile size={12} />,
    badgeVariant: "info",
  },
  Chat: {
    color: COLORS.modules.chat,
    icon: <IconBrandHipchat size={12} />,
    badgeVariant: "neutral",
  },
  Calendar: {
    color: COLORS.modules.calendar,
    icon: <IconCalendar size={12} />,
    badgeVariant: "default",
  },
  Projects: {
    color: COLORS.modules.projects,
    icon: <IconUsers size={12} />,
    badgeVariant: "warning",
  },
  Notes: {
    color: COLORS.modules.notes,
    icon: <IconFile size={12} />,
    badgeVariant: "warning",
  },
  Sheets: {
    color: COLORS.modules.sheets,
    icon: <IconFile size={12} />,
    badgeVariant: "success",
  },
  Presentations: {
    color: COLORS.modules.presentations,
    icon: <IconFile size={12} />,
    badgeVariant: "success",
  },
  People: {
    color: COLORS.modules.people,
    icon: <IconUsers size={12} />,
    badgeVariant: "info",
  },
  Settings: {
    color: COLORS.modules.settings,
    icon: <IconFile size={12} />,
    badgeVariant: "neutral",
  },
};

// ─── Shared filter state ───────────────────────────────────────────────────────

type Filter = "all" | Module | string;

let _filter: Filter = "all";
const _listeners = new Set<() => void>();

function setFilter(f: Filter) {
  _filter = f;
  for (const l of _listeners) {
    l();
  }
}

function subscribeFilter(cb: () => void) {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

function getFilter() {
  return _filter;
}

function useActivityFilter() {
  return useSyncExternalStore(subscribeFilter, getFilter);
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function tsToMs(ts: bigint): number {
  const raw = Number(ts);
  return raw > 32503680000000 ? Math.floor(raw / 1_000_000) : raw;
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function dateGroup(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);
  const weekStart = new Date(todayStart.getTime() - 6 * 86_400_000);
  if (d >= todayStart) return "Today";
  if (d >= yesterdayStart) return "Yesterday";
  if (d >= weekStart) return "Earlier this week";
  return "Older";
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColorForId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Avatar component ─────────────────────────────────────────────────────────

function Avatar({
  initials,
  color,
  size = 32,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: RADII.pill,
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: TYPOGRAPHY.sizes.caption,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.neutral[0],
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

// ─── Single activity row ─────────────────────────────────────────────────────

function ActivityRow({
  actor,
  initials,
  avatarColor,
  action,
  subject,
  module,
  timestampMs,
  index,
}: {
  actor: string;
  initials: string;
  avatarColor: string;
  action: string;
  subject: string;
  module: string;
  timestampMs: number;
  index: number;
}) {
  const mod = MODULE_CONFIG[module] ?? MODULE_CONFIG.Tasks;
  return (
    <div
      data-ocid={`activity.item.${index + 1}`}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: SPACING[3],
        padding: `${SPACING[3]}px ${SPACING[6]}px`,
        borderBottom: `1px solid ${COLORS.border.subtle}`,
        background: COLORS.surface.panel3,
      }}
    >
      <Avatar initials={initials} color={avatarColor} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: SPACING[2],
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: COLORS.text.primary,
            }}
          >
            {actor}
          </span>
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.secondary,
            }}
          >
            {action}
          </span>
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              fontWeight: TYPOGRAPHY.weights.medium,
              color: COLORS.text.primary,
              maxWidth: 260,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subject}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: SPACING[2],
            marginTop: SPACING[1],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: SPACING[1],
              color: mod.color,
            }}
          >
            {mod.icon}
            <DsBadge
              label={module}
              variant={mod.badgeVariant}
              style={{ fontSize: TYPOGRAPHY.sizes.micro }}
            />
          </div>
          <span
            style={{
              fontSize: TYPOGRAPHY.sizes.caption,
              color: COLORS.text.tertiary,
            }}
          >
            {relativeTime(timestampMs)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Date group header ────────────────────────────────────────────────────────

function DateGroupHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: `${SPACING[2]}px ${SPACING[6]}px`,
        fontSize: TYPOGRAPHY.sizes.caption,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.text.tertiary,
        textTransform: "uppercase",
        letterSpacing: TYPOGRAPHY.letterSpacing.widest,
        background: COLORS.neutral[50],
        borderBottom: `1px solid ${COLORS.border.subtle}`,
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}
    >
      {label}
    </div>
  );
}

// ─── Secondary Panel ─────────────────────────────────────────────────────────

export function SecondaryPanel() {
  const activeFilter = useActivityFilter();
  const { data: feed = [] } = useActivityFeed();
  const { data: users = [] } = useUsers();

  const people = useMemo(() => {
    const map = new Map<
      string,
      { name: string; initials: string; color: string }
    >();
    for (const entry of feed) {
      if (map.has(entry.userId)) continue;
      const user = users.find((u) => String(u.id) === entry.userId);
      const name = user?.name ?? `User ${entry.userId}`;
      map.set(entry.userId, {
        name,
        initials: initialsFromName(name),
        color: avatarColorForId(entry.userId),
      });
    }
    return Array.from(map.values());
  }, [feed, users]);

  const accent = COLORS.modules.activity as string;

  return (
    <div
      data-ocid="activity.secondary_panel"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: `${SPACING[2]}px 0` }}>
        <SectionLabel label="Feed" />
        <div
          style={{ display: "flex", flexDirection: "column", gap: SPACING[1] }}
        >
          <NavItem
            label="All Activity"
            accent={accent}
            selected={activeFilter === "all"}
            onClick={() => setFilter("all")}
            data-ocid="activity.filter.all"
          />
        </div>

        <SectionLabel label="By Module" />
        <div
          style={{ display: "flex", flexDirection: "column", gap: SPACING[1] }}
        >
          {ALL_MODULES.map((mod) => (
            <NavItem
              key={mod}
              label={mod}
              accent={MODULE_CONFIG[mod]?.color ?? accent}
              selected={activeFilter === mod}
              onClick={() => setFilter(mod)}
              data-ocid={`activity.filter.${mod.toLowerCase()}`}
            />
          ))}
        </div>

        <SectionLabel label="By Person" />
        <div
          style={{ display: "flex", flexDirection: "column", gap: SPACING[1] }}
        >
          {people.map((p) => (
            <NavItem
              key={p.name}
              label={p.name}
              accent={p.color}
              selected={activeFilter === p.name}
              onClick={() => setFilter(p.name)}
              level="sub"
              data-ocid={`activity.filter.person.${p.initials.toLowerCase()}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function MainPanel() {
  const activeFilter = useActivityFilter();
  const { data: feed = [], isLoading } = useActivityFeed();
  const { data: users = [] } = useUsers();

  const entries = useMemo(() => {
    return feed.map((entry) => {
      const user = users.find((u) => String(u.id) === entry.userId);
      const name = user?.name ?? `User ${entry.userId}`;
      return {
        id: Number(entry.id),
        actor: name,
        initials: initialsFromName(name),
        avatarColor: avatarColorForId(entry.userId),
        action: entry.action,
        subject: entry.description,
        module: entry.moduleName,
        timestampMs: tsToMs(entry.timestamp),
      };
    });
  }, [feed, users]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return entries;
    if (ALL_MODULES.includes(activeFilter as Module)) {
      return entries.filter(
        (e) => e.module.toLowerCase() === activeFilter.toLowerCase(),
      );
    }
    return entries.filter((e) => e.actor === activeFilter);
  }, [entries, activeFilter]);

  const grouped = useMemo(() => {
    const order = ["Today", "Yesterday", "Earlier this week", "Older"];
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const g = dateGroup(item.timestampMs);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return order
      .filter((g) => map.has(g))
      .map((g) => ({ group: g, items: map.get(g)! }));
  }, [filtered]);

  const filterLabel = activeFilter === "all" ? "All Activity" : activeFilter;
  const totalCount = filtered.length;

  return (
    <div
      data-ocid="activity.main_panel"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <PageHeader
        title={filterLabel}
        subtitle={`${totalCount} event${totalCount !== 1 ? "s" : ""}`}
        stats={[
          { label: "Today", value: 8 },
          { label: "This Week", value: 31 },
          { label: "Total", value: filtered.length },
        ]}
      />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: COLORS.surface.panel3,
        }}
        data-ocid="activity.feed"
      >
        {isLoading ? (
          <div
            data-ocid="activity.loading_state"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: SPACING[3],
              color: COLORS.text.tertiary,
            }}
          >
            <div
              style={{
                width: SPACING[8],
                height: SPACING[8],
                borderRadius: RADII.pill,
                border: `2px solid ${COLORS.modules.activity}`,
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
              }}
            />
            <span style={{ fontSize: TYPOGRAPHY.sizes.body }}>
              Loading activity...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="activity.empty_state"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: 200,
              gap: SPACING[3],
              color: COLORS.text.tertiary,
            }}
          >
            <IconMessage size={32} strokeWidth={1.5} />
            <span style={{ fontSize: TYPOGRAPHY.sizes.body }}>
              No activity for this filter
            </span>
          </div>
        ) : (
          grouped.map((group, gi) => {
            let rowIndex =
              gi === 0
                ? 0
                : grouped.slice(0, gi).reduce((s, g) => s + g.items.length, 0);
            return (
              <div key={group.group}>
                <DateGroupHeader label={group.group} />
                {group.items.map((item, i) => (
                  <ActivityRow
                    key={item.id}
                    actor={item.actor}
                    initials={item.initials}
                    avatarColor={item.avatarColor}
                    action={item.action}
                    subject={item.subject}
                    module={item.module}
                    timestampMs={item.timestampMs}
                    index={rowIndex + i}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────

export default function ActivityPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <MainPanel />
    </div>
  );
}
