import {
  IconActivity,
  IconAt,
  IconBell,
  IconSpeakerphone,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useMarkAllNotificationsRead } from "../hooks/useBackend";
import { useWorkspace } from "../hooks/useWorkspace";
import { COLORS, SPACING, TRANSITIONS, TYPOGRAPHY } from "../tokens";
import type { NotifType } from "../types";
import { DsButton, DsIconButton } from "./ds";

interface NotifItem {
  id: number;
  title: string;
  body: string;
  notifType: NotifType;
  isRead: boolean;
  createdAt: bigint;
}

function relativeTime(ts: bigint): string {
  const diff = Date.now() - Number(ts);
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const MOCK_NOTIFICATIONS: NotifItem[] = [
  {
    id: 1,
    title: "Alex mentioned you",
    body: "@you in #general: Can you review the doc?",
    notifType: "mention",
    isRead: false,
    createdAt: BigInt(Date.now() - 300000),
  },
  {
    id: 2,
    title: "Task assigned",
    body: "Fix login bug in production was assigned to you",
    notifType: "activity",
    isRead: false,
    createdAt: BigInt(Date.now() - 900000),
  },
  {
    id: 3,
    title: "New announcement",
    body: "Company all-hands meeting scheduled for Friday",
    notifType: "update",
    isRead: true,
    createdAt: BigInt(Date.now() - 3600000),
  },
  {
    id: 4,
    title: "Document shared",
    body: "Product Roadmap 2026 was shared with you",
    notifType: "activity",
    isRead: true,
    createdAt: BigInt(Date.now() - 7200000),
  },
];

type IconComp = React.ComponentType<{
  size?: number;
  style?: React.CSSProperties;
}>;

const TYPE_ICON: Record<NotifType, IconComp> = {
  mention: IconAt,
  activity: IconActivity,
  update: IconSpeakerphone,
};

const TYPE_COLOR: Record<NotifType, string> = {
  mention: COLORS.brand,
  activity: COLORS.semantic.info,
  update: COLORS.semantic.warning,
};

// NotificationsPanel renders as an absolute-positioned dropdown anchored
// to its container (the bell button wrapper in TopBar).
// No fixed overlay — contained within the document flow of the header area.
export default function NotificationsPanel() {
  const { setNotificationsOpen, currentUserId } = useWorkspace();
  const panelRef = useRef<HTMLDivElement>(null);
  const markAll = useMarkAllNotificationsRead();

  // Close on outside click — deferred so the bell click doesn’t race
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    const id = setTimeout(() => document.addEventListener("click", handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", handler);
    };
  }, [setNotificationsOpen]);

  return (
    <div
      ref={panelRef}
      data-ocid="notifications.panel"
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        width: 320,
        maxHeight: 440,
        background: COLORS.surface.panel3,
        border: `1px solid ${COLORS.border.default}`,
        borderRadius: 10,
        boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 200,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 14px",
          borderBottom: `1px solid ${COLORS.border.default}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: SPACING[2] }}>
          <IconBell size={15} style={{ color: COLORS.text.tertiary }} />
          <span
            style={{
              fontWeight: TYPOGRAPHY.weights.semibold,
              fontSize: TYPOGRAPHY.sizes.small,
            }}
          >
            Notifications
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: SPACING[1] }}>
          <DsButton
            variant="ghost"
            size="sm"
            data-ocid="notifications.mark_all_read_button"
            onClick={() => {
              markAll.mutate(currentUserId);
              setNotificationsOpen(false);
            }}
          >
            Mark all read
          </DsButton>
          <DsIconButton
            size="sm"
            variant="ghost"
            data-ocid="notifications.close_button"
            onClick={() => setNotificationsOpen(false)}
            aria-label="Close notifications"
            title="Close notifications"
          >
            <IconX size={14} />
          </DsIconButton>
        </div>
      </div>

      {/* Notification list */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {MOCK_NOTIFICATIONS.length === 0 ? (
          <div
            data-ocid="notifications.empty_state"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 120,
              gap: SPACING[2],
              color: COLORS.text.tertiary,
              fontSize: TYPOGRAPHY.sizes.small,
            }}
          >
            <IconBell size={28} style={{ opacity: 0.3 }} />
            <span>No notifications yet</span>
          </div>
        ) : (
          MOCK_NOTIFICATIONS.map((notif, i) => {
            const Icon = TYPE_ICON[notif.notifType];
            const color = TYPE_COLOR[notif.notifType];
            return (
              <button
                type="button"
                key={notif.id}
                data-ocid={`notifications.item.${i + 1}`}
                style={{
                  all: "unset",
                  display: "flex",
                  width: "100%",
                  gap: 10,
                  padding: "11px 14px",
                  borderBottom: `1px solid ${COLORS.border.default}`,
                  background: notif.isRead ? "transparent" : `${color}06`,
                  cursor: "pointer",
                  transition: `background ${TRANSITIONS.fast}`,
                  boxSizing: "border-box",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationsOpen(false);
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = (
                    e.currentTarget as HTMLButtonElement
                  ).style.background = notif.isRead
                    ? COLORS.interactive.hover
                    : `${color}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    notif.isRead ? "transparent" : `${color}06`;
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: `${color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <Icon size={14} style={{ color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: COLORS.text.primary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notif.title}
                    </span>
                    <span
                      style={{
                        color: COLORS.text.tertiary,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {relativeTime(notif.createdAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      color: COLORS.text.tertiary,
                      margin: "2px 0 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {notif.body}
                  </p>
                </div>
                {!notif.isRead && (
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: color,
                      flexShrink: 0,
                      marginTop: 5,
                    }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
