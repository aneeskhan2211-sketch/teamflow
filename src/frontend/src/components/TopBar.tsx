import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  IconBell,
  IconLogout,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import React from "react";
import { useEffect } from "react";
import { useCurrentUser } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useBackend";
import { useWorkspace } from "../hooks/useWorkspace";
import {
  COLORS,
  ICON_BTN_MD,
  RADII,
  SHADOWS,
  TRANSITIONS,
  TYPOGRAPHY,
} from "../tokens";
import NotificationsPanel from "./NotificationsPanel";
import SearchOverlay from "./SearchOverlay";
import WordMark from "./WordMark";
import { DsIconButton } from "./ds";

export default function TopBar() {
  const {
    searchOpen,
    setSearchOpen,
    notificationsOpen,
    setNotificationsOpen,
    setActiveModule,
    currentUserId,
  } = useWorkspace();

  const { clear: iiClear } = useInternetIdentity();

  const [avatarMenuOpen, setAvatarMenuOpen] = React.useState(false);
  const avatarRef = React.useRef<HTMLDivElement>(null);

  const { data: currentUserData } = useCurrentUser();

  const { data: notifications } = useNotifications(currentUserId);
  const unreadCount =
    notifications?.filter((n) => !(n as { isRead: boolean }).isRead).length ??
    0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSearchOpen]);

  // Close avatar menu when clicking outside — listener only attached while open
  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [avatarMenuOpen]);

  // Shared icon size — all icons in the top bar on the same grid
  const ICON_SIZE = 18;
  // Icon button hit target (square, centered)
  // ICON_BTN_MD from tokens used below
  // Bar height
  const BAR_H = 60;
  // Avatar diameter — proportional to bar height
  const AVATAR_D = ICON_BTN_MD;

  return (
    <header
      data-ocid="topbar"
      style={{
        height: BAR_H,
        minHeight: BAR_H,
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${COLORS.border.default}`,
        position: "relative",
        zIndex: 30,
        flexShrink: 0,
        background: COLORS.surface.header,
        padding: "0 16px",
        gap: 0,
      }}
    >
      {/* Left: TeamFlow wordmark — dominant brand element */}
      <WordMark size={18} style={{ marginRight: 20, flexShrink: 0 }} />

      {/* Flex spacer before search */}
      <div style={{ flex: 1 }} />

      {/* Center: search bar — position:relative so SearchOverlay anchors here */}
      <div style={{ width: 300, flexShrink: 0, position: "relative" }}>
        <button
          type="button"
          data-ocid="topbar.search_trigger"
          onClick={() => setSearchOpen(true)}
          aria-label="Open search (Ctrl+K)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            height: 34,
            padding: "0 10px",
            background: COLORS.neutral[100],
            border: `1px solid ${COLORS.border.default}`,
            borderRadius: RADII.lg,
            cursor: "text",
            color: COLORS.text.tertiary,
            fontSize: TYPOGRAPHY.sizes.small,
          }}
        >
          <IconSearch size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          <span style={{ flex: 1, textAlign: "left" }}>Search workspace</span>
          <kbd
            style={{
              fontSize: TYPOGRAPHY.sizes.micro,
              padding: "2px 5px",
              background: COLORS.neutral[200],
              border: `1px solid ${COLORS.border.default}`,
              borderRadius: RADII.sm,
              color: COLORS.text.tertiary,
              lineHeight: 1.5,
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            ⌘K
          </kbd>
        </button>
        {searchOpen && <SearchOverlay />}
      </div>

      {/* Flex spacer after search */}
      <div style={{ flex: 1 }} />

      {/* Right: bell + avatar — consistent gap, same icon grid */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Bell notification button — position:relative wrapper so NotificationsPanel anchors here */}
        <div style={{ position: "relative" }}>
          <DsIconButton
            size="md"
            variant="ghost"
            active={notificationsOpen}
            data-ocid="topbar.notifications_button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label={`Notifications${
              unreadCount > 0 ? `, ${unreadCount} unread` : ""
            }`}
            title="Notifications"
            style={{ position: "relative" }}
          >
            <IconBell size={ICON_SIZE} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  minWidth: 14,
                  height: 14,
                  borderRadius: 7,
                  background: COLORS.semantic.danger,
                  color: COLORS.neutral[0],
                  fontSize: TYPOGRAPHY.sizes.micro,
                  fontWeight: TYPOGRAPHY.weights.bold,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </DsIconButton>
          {notificationsOpen && <NotificationsPanel />}
        </div>

        {/* Avatar + dropdown */}
        <div ref={avatarRef} style={{ position: "relative" }}>
          <button
            type="button"
            data-ocid="topbar.user_avatar"
            aria-label="User menu"
            aria-haspopup="true"
            aria-expanded={avatarMenuOpen}
            onClick={() => setAvatarMenuOpen((v) => !v)}
            style={{
              width: AVATAR_D,
              height: AVATAR_D,
              borderRadius: "50%",
              background: currentUserData?.avatarColor || COLORS.brand,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: TYPOGRAPHY.weights.semibold,
              fontSize: TYPOGRAPHY.sizes.small,
              flexShrink: 0,
              position: "relative",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {currentUserData?.name
              ? currentUserData.name
                  .split(" ")
                  .map((w: string) => w[0] ?? "")
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "?"}
            <span
              style={{
                position: "absolute",
                bottom: 1,
                right: 1,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLORS.semantic.success,
                border: `1.5px solid ${COLORS.surface.header}`,
                pointerEvents: "none",
              }}
            />
          </button>

          {/* Dropdown menu */}
          {avatarMenuOpen && (
            <div
              data-ocid="topbar.avatar_dropdown"
              role="menu"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 168,
                background: COLORS.surface.panel3,
                border: `1px solid ${COLORS.border.default}`,
                borderRadius: RADII.lg,
                boxShadow: SHADOWS.elevated,
                padding: "4px 0",
                zIndex: 200,
              }}
            >
              {/* User info header */}
              <div
                style={{
                  padding: "8px 12px 6px",
                  borderBottom: `1px solid ${COLORS.border.subtle}`,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    fontSize: TYPOGRAPHY.sizes.small,
                    fontWeight: TYPOGRAPHY.weights.semibold,
                    color: COLORS.text.primary,
                  }}
                >
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.sizes.small,
                      fontWeight: TYPOGRAPHY.weights.semibold,
                      color: COLORS.text.primary,
                    }}
                  >
                    {currentUserData?.name || "You"}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.sizes.caption,
                    color: COLORS.text.tertiary,
                    marginTop: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.sizes.caption,
                      color: COLORS.text.tertiary,
                      marginTop: 1,
                    }}
                  >
                    {currentUserData?.email || currentUserData?.title || ""}
                  </div>
                </div>
              </div>

              {/* Settings item */}
              <button
                type="button"
                role="menuitem"
                data-ocid="topbar.avatar_menu.settings"
                onClick={() => {
                  setActiveModule("settings");
                  setAvatarMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "6px 12px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: TYPOGRAPHY.sizes.small,
                  color: COLORS.text.primary,
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = COLORS.interactive.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <IconSettings
                  size={14}
                  style={{ color: COLORS.text.secondary }}
                />
                Settings
              </button>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: COLORS.border.subtle,
                  margin: "4px 0",
                }}
              />

              {/* Sign out */}
              <button
                type="button"
                role="menuitem"
                data-ocid="topbar.avatar_menu.sign_out"
                onClick={() => {
                  setAvatarMenuOpen(false);
                  try {
                    iiClear();
                    localStorage.clear();
                  } catch {}
                  window.location.reload();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "6px 12px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: TYPOGRAPHY.sizes.small,
                  color: COLORS.text.secondary,
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = COLORS.interactive.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <IconLogout size={14} style={{ color: COLORS.text.tertiary }} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
