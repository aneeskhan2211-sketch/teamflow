import {
  DsBadge,
  DsButton,
  DsCard,
  DsInput,
  DsSelect,
  DsTextarea,
  DsToggle,
  NavItem,
  PageHeader,
  SectionLabel,
} from "@/components/ds";
import {
  AVATAR_COLORS,
  COLORS,
  RADII,
  SHADOWS,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "@/tokens";
import {
  IconCheck,
  IconCopy,
  IconLanguage,
  IconLink,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import type React from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  useAssignMemberRole,
  useAuth,
  useCurrentUser,
  useGenerateInviteCode,
  useGetWorkspaceMembers,
  useRemoveMemberByPrincipal,
  useUpdateMyProfile,
} from "../hooks/useAuth";
import {
  useUpdateUserSettings,
  useUpdateWorkspaceSettings,
  useUserSettings,
  useWorkspaceSettings,
} from "../hooks/useBackend";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SectionId =
  | "workspace"
  | "members"
  | "profile"
  | "notifications"
  | "appearance";

const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: "workspace", label: "Workspace" },
  { id: "members", label: "Members" },
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
];

const accent = COLORS.modules.settings as string;

// ─── Module-level active section store ───────────────────────────────────────

const SECTION_LABELS: Record<SectionId, string> = {
  workspace: "Workspace Settings",
  members: "Members",
  profile: "Profile",
  notifications: "Notifications",
  appearance: "Appearance",
};

let _settingsSection: SectionId = "workspace";
const _settingsSectionListeners = new Set<() => void>();

function _setSettingsSection(s: SectionId) {
  if (_settingsSection !== s) {
    _settingsSection = s;
    for (const l of _settingsSectionListeners) l();
  }
}

function _subscribeSettingsSection(cb: () => void) {
  _settingsSectionListeners.add(cb);
  return () => _settingsSectionListeners.delete(cb);
}

function useSettingsSection(): [SectionId, (s: SectionId) => void] {
  const s = useSyncExternalStore(
    _subscribeSettingsSection,
    () => _settingsSection,
    () => _settingsSection,
  );
  return [s, _setSettingsSection];
}

// ---------------------------------------------------------------------------
// Role badge helpers
// ---------------------------------------------------------------------------

type MemberRole = "owner" | "admin" | "member" | "guest";

function roleBadgeStyle(role: MemberRole): React.CSSProperties {
  if (role === "owner")
    return {
      background: COLORS.semantic.infoBg,
      color: COLORS.brand,
    };
  if (role === "admin")
    return {
      background: COLORS.semantic.infoBg,
      color: COLORS.semantic.infoFg,
    };
  if (role === "member")
    return {
      background: COLORS.neutral[100],
      color: COLORS.text.secondary,
    };
  return {
    background: COLORS.semantic.warningBg,
    color: COLORS.semantic.warningFg,
  };
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function FieldLabel({
  htmlFor,
  children,
}: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: TYPOGRAPHY.sizes.small,
        fontWeight: TYPOGRAPHY.weights.medium,
        color: COLORS.text.secondary,
        marginBottom: SPACING[1],
      }}
    >
      {children}
    </label>
  );
}

// (shared input base style consumed via DsInput / DsTextarea from components/ds)

// local DsInput replaced by shared DsInput from components/ds
// local DsTextarea replaced by shared DsTextarea from components/ds
// local ToggleSwitch / ToggleRow replaced by shared DsToggle from components/ds

function SaveRow({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: SPACING[3],
        marginTop: SPACING[5],
      }}
    >
      <DsButton
        variant="primary"
        size="sm"
        onClick={onSave}
        title="Save changes"
      >
        Save changes
      </DsButton>
      {saved && (
        <span
          style={{
            fontSize: TYPOGRAPHY.sizes.small,
            color: COLORS.semantic.success,
            fontWeight: TYPOGRAPHY.weights.medium,
          }}
        >
          Saved
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section components
// ---------------------------------------------------------------------------

function WorkspaceSection() {
  const { data: settings } = useWorkspaceSettings();
  const update = useUpdateWorkspaceSettings();
  const [name, setName] = useState(settings?.name ?? "TeamFlow HQ");
  const [description, setDescription] = useState(settings?.description ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setDescription(settings.description);
    }
  }, [settings]);

  function handleSave() {
    update.mutate(
      { name, description },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  }

  return (
    <DsCard style={{ marginBottom: SPACING[6] }} padding={SPACING[6]}>
      <div
        style={{ display: "flex", flexDirection: "column", gap: SPACING[4] }}
      >
        <div>
          <FieldLabel htmlFor="ws-name">Workspace name</FieldLabel>
          <DsInput
            id="ws-name"
            value={name}
            onChange={setName}
            placeholder="Enter workspace name"
            accentColor={accent}
            data-ocid="settings.workspace.name_input"
          />
        </div>
        <div>
          <FieldLabel htmlFor="ws-desc">Description</FieldLabel>
          <DsTextarea
            id="ws-desc"
            value={description}
            onChange={setDescription}
            placeholder="Describe your workspace"
            rows={3}
            accentColor={accent}
            data-ocid="settings.workspace.description_input"
          />
        </div>
      </div>
      <SaveRow onSave={handleSave} saved={saved} />
    </DsCard>
  );
}

// ---------------------------------------------------------------------------
// Members section
// ---------------------------------------------------------------------------

function MemberAvatar({
  name,
  color,
  size = 36,
}: { name: string; color: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: RADII.pill,
        background: color || COLORS.brand,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.neutral[0],
        fontSize:
          size <= 32 ? TYPOGRAPHY.sizes.caption : TYPOGRAPHY.sizes.small,
        fontWeight: TYPOGRAPHY.weights.semibold,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

function MembersSection() {
  const { data: members = [], isLoading } = useGetWorkspaceMembers();
  const { currentUser } = useAuth();
  const assignRole = useAssignMemberRole();
  const removeMember = useRemoveMemberByPrincipal();
  const generateCode = useGenerateInviteCode();

  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);

  const currentRole = currentUser?.role as MemberRole | undefined;
  const canManage = currentRole === "owner" || currentRole === "admin";

  const inviteUrl = inviteCode
    ? `${window.location.origin}/join?code=${inviteCode}`
    : "";

  function handleGenerateInvite() {
    setCodeLoading(true);
    generateCode.mutate(undefined, {
      onSuccess: (code) => {
        setInviteCode(code);
        setCodeLoading(false);
      },
      onError: () => setCodeLoading(false),
    });
  }

  function handleCopyInvite() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ marginBottom: SPACING[6] }}>
      {/* Members list */}
      <DsCard padding={SPACING[6]}>
        {isLoading ? (
          <div
            data-ocid="settings.members.loading_state"
            style={{
              padding: `${SPACING[4]}px 0`,
              color: COLORS.text.tertiary,
              fontSize: TYPOGRAPHY.sizes.small,
            }}
          >
            Loading members…
          </div>
        ) : members.length === 0 ? (
          <div
            data-ocid="settings.members.empty_state"
            style={{
              padding: `${SPACING[4]}px 0`,
              color: COLORS.text.tertiary,
              fontSize: TYPOGRAPHY.sizes.small,
            }}
          >
            No members yet. Generate an invite link to add people.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {members.map((m, idx) => {
              const memberRole = m.role as unknown as MemberRole;
              const isOwner = memberRole === "owner";
              const isSelf = currentUser && m.id === currentUser.id;
              return (
                <div
                  key={String(m.id)}
                  data-ocid={`settings.members.item.${idx + 1}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: SPACING[3],
                    padding: `${SPACING[3]}px 0`,
                    borderBottom:
                      idx < members.length - 1
                        ? `1px solid ${COLORS.border.subtle}`
                        : "none",
                  }}
                >
                  <MemberAvatar name={m.name} color={m.avatarColor} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: TYPOGRAPHY.sizes.small,
                        fontWeight: TYPOGRAPHY.weights.medium,
                        color: COLORS.text.primary,
                        display: "flex",
                        alignItems: "center",
                        gap: SPACING[2],
                      }}
                    >
                      {m.name}
                      {isSelf && (
                        <span
                          style={{
                            fontSize: TYPOGRAPHY.sizes.micro,
                            color: COLORS.text.tertiary,
                          }}
                        >
                          (you)
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: TYPOGRAPHY.sizes.caption,
                        color: COLORS.text.tertiary,
                        marginTop: SPACING[0],
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.email}
                    </div>
                  </div>

                  {/* Role badge or selector */}
                  {canManage && !isOwner && !isSelf ? (
                    <DsSelect
                      value={String(m.role)}
                      onChange={(newRole) => {
                        if (m.principal) {
                          assignRole.mutate({
                            targetPrincipal: m.principal,
                            role: newRole,
                          });
                        }
                      }}
                      options={[
                        { value: "admin", label: "Admin" },
                        { value: "member", label: "Member" },
                        { value: "guest", label: "Viewer" },
                      ]}
                      style={{ width: 100, fontSize: TYPOGRAPHY.sizes.caption }}
                      data-ocid={`settings.members.role_select.${idx + 1}`}
                    />
                  ) : (
                    <DsBadge
                      label={
                        isOwner
                          ? "Owner"
                          : memberRole === "admin"
                            ? "Admin"
                            : memberRole === "guest"
                              ? "Viewer"
                              : "Member"
                      }
                      style={roleBadgeStyle(memberRole)}
                    />
                  )}

                  {/* Remove button for admins/owners */}
                  {canManage && !isOwner && !isSelf && (
                    <DsButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (m.principal) {
                          removeMember.mutate(m.principal);
                        }
                      }}
                      title="Remove member"
                      aria-label="Remove member"
                      data-ocid={`settings.members.remove_button.${idx + 1}`}
                      style={{
                        color: COLORS.semantic.danger,
                        padding: `${SPACING[1]}px ${SPACING[2]}px`,
                      }}
                    >
                      <IconTrash size={14} />
                    </DsButton>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DsCard>

      {/* Invite section */}
      {canManage && (
        <DsCard style={{ marginTop: SPACING[4] }} padding={SPACING[6]}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: inviteUrl ? SPACING[3] : 0,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.sizes.small,
                  fontWeight: TYPOGRAPHY.weights.medium,
                  color: COLORS.text.primary,
                }}
              >
                Invite people
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.sizes.caption,
                  color: COLORS.text.tertiary,
                  marginTop: 2,
                }}
              >
                Generate a link to invite new members
              </div>
            </div>
            <DsButton
              variant="secondary"
              size="sm"
              onClick={handleGenerateInvite}
              disabled={codeLoading}
              data-ocid="settings.members.generate_invite_button"
            >
              <IconLink size={13} />
              {codeLoading ? "Generating…" : "Generate invite link"}
            </DsButton>
          </div>

          {inviteUrl && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: SPACING[2],
                marginTop: SPACING[3],
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: COLORS.neutral[100],
                  border: `1px solid ${COLORS.border.default}`,
                  borderRadius: RADII.md,
                  padding: `${SPACING[2]}px ${SPACING[3]}px`,
                  fontSize: TYPOGRAPHY.sizes.caption,
                  color: COLORS.text.secondary,
                  fontFamily: "monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                data-ocid="settings.members.invite_url_input"
              >
                {inviteUrl}
              </div>
              <DsButton
                variant="secondary"
                size="sm"
                onClick={handleCopyInvite}
                data-ocid="settings.members.copy_invite_button"
              >
                {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                {copied ? "Copied" : "Copy"}
              </DsButton>
            </div>
          )}
        </DsCard>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile section (enhanced with title, department, avatar color)
// ---------------------------------------------------------------------------

function ProfileSection() {
  const { data: currentUser } = useCurrentUser();
  const { data: settings } = useUserSettings();
  const update = useUpdateMyProfile();

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [avatarColor, setAvatarColor] = useState<string>(AVATAR_COLORS[0]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setTitle(currentUser.title || "");
      setDepartment(currentUser.department || "");
      setAvatarColor(currentUser.avatarColor || AVATAR_COLORS[0]);
    } else if (settings) {
      setName(settings.displayName || "");
    }
  }, [currentUser, settings]);

  const initials = name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleSave() {
    update.mutate(
      { name, title, department, avatarColor },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  }

  return (
    <DsCard style={{ marginBottom: SPACING[6] }} padding={SPACING[6]}>
      {/* Preview row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING[4],
          marginBottom: SPACING[5],
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: RADII.pill,
            background: avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.neutral[0],
            fontSize: TYPOGRAPHY.sizes.h3,
            fontWeight: TYPOGRAPHY.weights.semibold,
            flexShrink: 0,
            userSelect: "none",
          }}
          data-ocid="settings.profile.avatar"
        >
          {initials || "?"}
        </div>
        <div>
          <div
            style={{
              fontSize: TYPOGRAPHY.sizes.body,
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: COLORS.text.primary,
            }}
          >
            {name || "Your Name"}
          </div>
          {(title || department) && (
            <div
              style={{
                fontSize: TYPOGRAPHY.sizes.small,
                color: COLORS.text.secondary,
                marginTop: 2,
              }}
            >
              {[title, department].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: SPACING[4] }}
      >
        <div>
          <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
          <DsInput
            id="profile-name"
            value={name}
            onChange={setName}
            placeholder="Your full name"
            accentColor={accent}
            data-ocid="settings.profile.name_input"
          />
        </div>
        <div>
          <FieldLabel htmlFor="profile-title">Job title</FieldLabel>
          <DsInput
            id="profile-title"
            value={title}
            onChange={setTitle}
            placeholder="e.g. Product Designer"
            accentColor={accent}
            data-ocid="settings.profile.title_input"
          />
        </div>
        <div>
          <FieldLabel htmlFor="profile-dept">Department</FieldLabel>
          <DsInput
            id="profile-dept"
            value={department}
            onChange={setDepartment}
            placeholder="e.g. Engineering"
            accentColor={accent}
            data-ocid="settings.profile.department_input"
          />
        </div>

        {/* Avatar color picker */}
        <div>
          <FieldLabel>Avatar color</FieldLabel>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: SPACING[2],
              marginTop: SPACING[1],
            }}
          >
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Avatar color ${c}`}
                data-ocid={`settings.profile.avatar_color.${c.replace("#", "")}`}
                onClick={() => setAvatarColor(c)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: RADII.pill,
                  background: c,
                  border:
                    avatarColor === c
                      ? `3px solid ${COLORS.text.primary}`
                      : "2px solid transparent",
                  cursor: "pointer",
                  padding: 0,
                  outline: "none",
                  transition: `border-color ${TRANSITIONS.fast}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <SaveRow onSave={handleSave} saved={saved} />
    </DsCard>
  );
}

function NotificationsSection() {
  const { data: settings } = useUserSettings();
  const update = useUpdateUserSettings();
  const [desktopNotifs, setDesktopNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [mentionAlerts, setMentionAlerts] = useState(true);

  const emailNotifs = settings?.notificationsEnabled ?? true;

  function toggleEmailNotifs(checked: boolean) {
    if (!settings) return;
    update.mutate({
      displayName: settings.displayName,
      email: settings.email,
      notificationsEnabled: checked,
      theme: settings.theme,
    });
  }

  return (
    <DsCard style={{ marginBottom: SPACING[6] }} padding={SPACING[6]}>
      <div>
        <DsToggle
          label="Email Notifications"
          description="Receive activity updates via email"
          checked={emailNotifs}
          onChange={toggleEmailNotifs}
          accentColor={accent}
          data-ocid="settings.notifications.email_switch"
        />
        <DsToggle
          label="Desktop Notifications"
          description="Show browser push notifications for new messages"
          checked={desktopNotifs}
          onChange={setDesktopNotifs}
          accentColor={accent}
          data-ocid="settings.notifications.desktop_switch"
        />
        <DsToggle
          label="Weekly Digest"
          description="Get a summary of activity every Monday morning"
          checked={weeklyDigest}
          onChange={setWeeklyDigest}
          accentColor={accent}
          data-ocid="settings.notifications.digest_switch"
        />
        <DsToggle
          label="@Mention Alerts"
          description="Notify immediately when someone mentions you"
          checked={mentionAlerts}
          onChange={setMentionAlerts}
          accentColor={accent}
          data-ocid="settings.notifications.mention_switch"
        />
      </div>
    </DsCard>
  );
}

function AppearanceSection() {
  const { data: settings } = useUserSettings();
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("America/New_York");

  return (
    <DsCard style={{ marginBottom: SPACING[6] }} padding={SPACING[6]}>
      {/* Dark mode toggle — non-functional, UI only */}
      <div style={{ marginBottom: SPACING[5] }}>
        <SectionLabel label="Theme" />
        <DsToggle
          label="Dark Mode"
          description="Switch to a darker interface (coming soon)"
          checked={settings?.theme === "dark"}
          onChange={() => {}}
          accentColor={accent}
          data-ocid="settings.appearance.dark_mode_switch"
        />
      </div>

      {/* Language + timezone */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: SPACING[4] }}
      >
        <div>
          <FieldLabel htmlFor="lang-select">
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <IconLanguage size={13} />
              Language
            </span>
          </FieldLabel>
          <DsSelect
            id="lang-select"
            value={language}
            onChange={setLanguage}
            options={[
              { value: "en", label: "English" },
              { value: "fr", label: "Français" },
              { value: "de", label: "Deutsch" },
              { value: "es", label: "Español" },
              { value: "ja", label: "日本語" },
            ]}
            data-ocid="settings.appearance.language_select"
          />
        </div>
        <div>
          <FieldLabel htmlFor="tz-select">
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <IconWorld size={13} />
              Timezone
            </span>
          </FieldLabel>
          <DsSelect
            id="tz-select"
            value={timezone}
            onChange={setTimezone}
            options={[
              { value: "America/New_York", label: "Eastern Time (ET)" },
              { value: "America/Chicago", label: "Central Time (CT)" },
              { value: "America/Denver", label: "Mountain Time (MT)" },
              { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
              { value: "Europe/London", label: "London (GMT)" },
              { value: "Europe/Paris", label: "Paris (CET)" },
              { value: "Asia/Tokyo", label: "Tokyo (JST)" },
              { value: "Asia/Shanghai", label: "Shanghai (CST)" },
            ]}
            data-ocid="settings.appearance.timezone_select"
          />
        </div>
      </div>
    </DsCard>
  );
}

// ---------------------------------------------------------------------------
// Secondary Panel
// ---------------------------------------------------------------------------

export function SecondaryPanel() {
  const [selected, setSelected] = useSettingsSection();

  function scrollTo(id: SectionId) {
    setSelected(id);
    const el = document.getElementById(`settings-section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div
      data-ocid="settings.secondary_panel"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        <SectionLabel label="Settings" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              accent={accent}
              selected={selected === item.id}
              onClick={() => scrollTo(item.id)}
              data-ocid={`settings.nav.${item.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export function MainPanel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection] = useSettingsSection();
  const { data: userSettingsData } = useUserSettings();
  const userDisplayName = userSettingsData?.displayName ?? "";
  const { data: workspaceMembers = [] } = useGetWorkspaceMembers();
  const { currentUser } = useAuth();
  const currentRole = (currentUser?.role as string | undefined) ?? "Member";

  return (
    <div
      data-ocid="settings.main_panel"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <PageHeader
        title={SECTION_LABELS[activeSection]}
        subtitle={
          activeSection === "profile" && userDisplayName
            ? userDisplayName
            : undefined
        }
        stats={[
          { label: "Members", value: workspaceMembers.length },
          { label: "Role", value: currentRole },
        ]}
      />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `${SPACING[6]}px`,
          maxWidth: 680,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <section id="settings-section-workspace">
          <WorkspaceSection />
        </section>
        <section id="settings-section-members">
          <MembersSection />
        </section>
        <section id="settings-section-profile">
          <ProfileSection />
        </section>
        <section id="settings-section-notifications">
          <NotificationsSection />
        </section>
        <section id="settings-section-appearance">
          <AppearanceSection />
        </section>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <MainPanel />;
}
