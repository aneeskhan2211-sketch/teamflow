import {
  IconFileText,
  IconMessage,
  IconSearch,
  IconSquareCheck,
  IconX,
} from "@tabler/icons-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "../hooks/useWorkspace";
import {
  AVATAR_COLORS,
  COLORS,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "../tokens";
import type { ModuleId } from "../types";
import { DsIconButton } from "./ds";

interface SearchResult {
  type: string;
  id: number;
  title: string;
  sub: string;
  accent: string;
  module: ModuleId;
}

const MOCK_RESULTS: SearchResult[] = [
  {
    type: "channel",
    id: 1,
    title: "#general",
    sub: "Channel · TeamFlow",
    accent: AVATAR_COLORS[5],
    module: "chat",
  },
  {
    type: "channel",
    id: 2,
    title: "#announcements",
    sub: "Channel · TeamFlow",
    accent: AVATAR_COLORS[5],
    module: "chat",
  },
  {
    type: "channel",
    id: 3,
    title: "#random",
    sub: "Channel · TeamFlow",
    accent: AVATAR_COLORS[5],
    module: "chat",
  },
  {
    type: "task",
    id: 4,
    title: "Design new landing page",
    sub: "Task · High priority",
    accent: AVATAR_COLORS[3],
    module: "tasks",
  },
  {
    type: "task",
    id: 5,
    title: "Fix login bug in production",
    sub: "Task · Urgent",
    accent: AVATAR_COLORS[3],
    module: "tasks",
  },
  {
    type: "task",
    id: 6,
    title: "Write Q3 report",
    sub: "Task · Normal priority",
    accent: AVATAR_COLORS[3],
    module: "tasks",
  },
  {
    type: "document",
    id: 7,
    title: "Product Roadmap 2026",
    sub: "Document · Updated 2 days ago",
    accent: AVATAR_COLORS[1],
    module: "documents",
  },
  {
    type: "document",
    id: 8,
    title: "Team Onboarding Guide",
    sub: "Document · Updated last week",
    accent: AVATAR_COLORS[1],
    module: "documents",
  },
];

// Static constants defined at module level — not recreated on every render
const TYPE_ICON: Record<
  string,
  React.ComponentType<{ size?: number; style?: React.CSSProperties }>
> = {
  channel: IconMessage,
  task: IconSquareCheck,
  document: IconFileText,
};

const TYPE_LABELS: Record<string, string> = {
  channel: "Channels",
  task: "Tasks",
  document: "Documents",
};

function groupResults(items: SearchResult[]): Record<string, SearchResult[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    },
    {} as Record<string, SearchResult[]>,
  );
}

// SearchOverlay renders as an inline panel anchored below the TopBar search
// trigger. It sits in document flow — no fixed overlay, no backdrop.
// The parent (TopBar) provides position:relative context via a wrapper.
export default function SearchOverlay() {
  const { setSearchOpen, setActiveModule } = useWorkspace();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered =
    query.trim().length > 0
      ? MOCK_RESULTS.filter(
          (r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.sub.toLowerCase().includes(query.toLowerCase()),
        )
      : MOCK_RESULTS;

  const grouped = groupResults(filtered);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape or outside click
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    // Defer so the triggering click doesn’t immediately close the panel
    const id = setTimeout(
      () => document.addEventListener("click", handleClick),
      0,
    );
    return () => {
      window.removeEventListener("keydown", handleKey);
      clearTimeout(id);
      document.removeEventListener("click", handleClick);
    };
  }, [setSearchOpen]);

  return (
    <div
      ref={panelRef}
      data-ocid="search_overlay"
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: 520,
        maxWidth: "calc(100vw - 32px)",
        background: COLORS.surface.panel3,
        borderRadius: 10,
        boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
        border: `1px solid ${COLORS.border.default}`,
        overflow: "hidden",
        zIndex: 200,
      }}
    >
      {/* Search input row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING[2],
          padding: `${SPACING[2] + 2}px ${SPACING[3] + 2}px`,
          borderBottom: `1px solid ${COLORS.border.default}`,
        }}
      >
        <IconSearch
          size={16}
          style={{ color: COLORS.text.tertiary, flexShrink: 0 }}
        />
        <input
          ref={inputRef}
          data-ocid="search_overlay.search_input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search workspace..."
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            fontSize: TYPOGRAPHY.sizes.body,
            color: COLORS.text.primary,
            outline: "none",
          }}
        />
        <DsIconButton
          size="sm"
          variant="ghost"
          data-ocid="search_overlay.close_button"
          onClick={() => setSearchOpen(false)}
          aria-label="Close search"
          title="Close search"
        >
          <IconX size={15} />
        </DsIconButton>
      </div>

      {/* Results */}
      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div
            data-ocid="search_overlay.empty_state"
            style={{
              padding: "28px 16px",
              textAlign: "center",
              color: COLORS.text.tertiary,
            }}
          >
            No results for &ldquo;{query}&rdquo;
          </div>
        ) : (
          Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div
                style={{
                  padding: `${SPACING[2]}px ${SPACING[3] + 2}px ${SPACING[1] - 1}px`,
                  fontSize: TYPOGRAPHY.sizes.micro,
                  fontWeight: TYPOGRAPHY.weights.semibold,
                  textTransform: "uppercase" as const,
                  color: COLORS.text.tertiary,
                }}
              >
                {TYPE_LABELS[type] ?? type}
              </div>
              {items.map((item) => {
                const Icon = TYPE_ICON[item.type];
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-ocid={`search_overlay.result.${item.id}`}
                    onClick={() => {
                      setActiveModule(item.module);
                      setSearchOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: SPACING[2],
                      width: "100%",
                      padding: `7px ${SPACING[3] + 2}px`,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left" as const,
                      transition: `background ${TRANSITIONS.fast}`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        COLORS.interactive.hover;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "none";
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: `${item.accent}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {Icon && (
                        <Icon size={13} style={{ color: item.accent }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: TYPOGRAPHY.sizes.small,
                          color: COLORS.text.primary,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          color: COLORS.text.tertiary,
                        }}
                      >
                        {item.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
