import {
  IconCheck,
  IconHash,
  IconMessage,
  IconPlus,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import {
  DsButton,
  DsIconButton,
  DsInput,
  EmptyModuleState,
  NavItem,
  PageHeader,
  SectionLabel,
} from "../components/ds";
import {
  useChannels,
  useMessages,
  useSendMessage,
  useUsers,
} from "../hooks/useBackend";
import { useCurrentRole, useWorkspace } from "../hooks/useWorkspace";
import { MODULE_ACCENTS } from "../moduleAccents";
import {
  AVATAR_SM,
  COLORS,
  RADII,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "../tokens";
import type { Channel } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(ts: bigint | undefined): string {
  if (!ts) return "";
  try {
    const d = new Date(Number(ts) / 1_000_000);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function dayLabel(ts: bigint | undefined): string {
  if (!ts) return "Today";
  try {
    const d = new Date(Number(ts) / 1_000_000);
    if (Number.isNaN(d.getTime())) return "Today";
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Today";
  }
}

function avatarBg(color: string): string {
  return color || COLORS.modules.chat;
}

// ─── DM Row ──────────────────────────────────────────────────────────────────

interface DmItem {
  id: number;
  name: string;
}

const DM_USERS: DmItem[] = [
  { id: 2, name: "Alice Chen" },
  { id: 3, name: "Bob Martinez" },
  { id: 4, name: "Carol Thompson" },
];

// ─── Secondary Panel ─────────────────────────────────────────────────────────

function ChatSecondaryPanel({
  showNewChannelForm,
  setShowNewChannelForm,
  extraChannels,
  onChannelCreated,
}: {
  showNewChannelForm: boolean;
  setShowNewChannelForm: (v: boolean) => void;
  extraChannels: Channel[];
  onChannelCreated: (ch: Channel) => void;
}) {
  const { activeChannelId, setActiveChannelId } = useWorkspace();
  const { data: backendChannels = [] } = useChannels();
  const CHAT_ACCENT = COLORS.modules.chat;

  // Merge backend channels with locally-created ones (de-dupe by id)
  const channels = [
    ...backendChannels,
    ...extraChannels.filter(
      (ec) => !backendChannels.some((bc) => Number(bc.id) === Number(ec.id)),
    ),
  ];

  const [newChannelName, setNewChannelName] = useState("");
  const newChannelInputRef = useRef<HTMLInputElement>(null);

  // Focus the input whenever the form opens
  useEffect(() => {
    if (showNewChannelForm) {
      setTimeout(() => newChannelInputRef.current?.focus(), 0);
    } else {
      setNewChannelName("");
    }
  }, [showNewChannelForm]);

  function handleConfirm() {
    const name = newChannelName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name) return;
    const newCh: Channel = {
      id: Date.now(),
      name,
      topic: "",
      workspaceId: 1,
      createdAt: BigInt(Date.now() * 1_000_000),
    };
    onChannelCreated(newCh);
    setActiveChannelId(newCh.id);
    setShowNewChannelForm(false);
    setNewChannelName("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      setShowNewChannelForm(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="flex-1 overflow-y-auto py-2">
        <SectionLabel label="Channels" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {channels.map((ch) => {
            const isActive = Number(ch.id) === activeChannelId;
            return (
              <NavItem
                key={String(ch.id)}
                label={`# ${ch.name}`}
                accent={CHAT_ACCENT}
                selected={isActive}
                onClick={() => setActiveChannelId(Number(ch.id))}
              />
            );
          })}

          {/* Inline new-channel form — appears directly below the channel list */}
          {showNewChannelForm && (
            <div
              data-ocid="chat.new_channel_form"
              style={{
                margin: `${SPACING[1]}px ${SPACING[2]}px`,
                display: "flex",
                alignItems: "center",
                gap: SPACING[1],
                background: COLORS.surface.panel3,
                border: `1px solid ${COLORS.border.default}`,
                borderRadius: RADII.md,
                padding: `0 ${SPACING[1]}px`,
              }}
            >
              <IconHash
                size={12}
                style={{ color: COLORS.text.tertiary, flexShrink: 0 }}
              />
              <DsInput
                ref={newChannelInputRef}
                value={newChannelName}
                onChange={(v) => setNewChannelName(v)}
                onKeyDown={handleKeyDown}
                placeholder="channel-name"
                data-ocid="chat.new_channel_input"
                style={{
                  flex: 1,
                  height: SPACING[8] - 4,
                  border: "none",
                  background: "transparent",
                  fontSize: TYPOGRAPHY.sizes.caption,
                  boxShadow: "none",
                  padding: 0,
                  minWidth: 0,
                }}
              />
              <DsIconButton
                size="sm"
                variant="ghost"
                type="button"
                onClick={handleConfirm}
                title="Confirm new channel"
                aria-label="Confirm new channel"
                data-ocid="chat.new_channel_confirm_button"
                style={{
                  background: newChannelName.trim()
                    ? COLORS.modules.chat
                    : "transparent",
                  color: newChannelName.trim()
                    ? COLORS.neutral[0]
                    : COLORS.text.tertiary,
                }}
              >
                <IconCheck size={12} />
              </DsIconButton>
              <DsIconButton
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => setShowNewChannelForm(false)}
                title="Cancel new channel"
                aria-label="Cancel new channel"
                data-ocid="chat.new_channel_cancel_button"
              >
                <IconX size={12} />
              </DsIconButton>
            </div>
          )}
        </div>

        <SectionLabel label="Direct Messages" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {DM_USERS.map((dm) => (
            <NavItem
              key={dm.id}
              label={dm.name}
              accent={CHAT_ACCENT}
              selected={false}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Date Separator ───────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: SPACING[3],
        margin: `${SPACING[4]}px 0 ${SPACING[2]}px`,
      }}
    >
      <div style={{ flex: 1, height: 1, background: COLORS.border.default }} />
      <span
        style={{
          fontSize: TYPOGRAPHY.sizes.caption,
          fontWeight: TYPOGRAPHY.weights.semibold,
          color: COLORS.text.tertiary,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: COLORS.border.default }} />
    </div>
  );
}

// ─── Message List ─────────────────────────────────────────────────────────────

interface MessageListProps {
  activeChannelId: number;
  channelName: string;
  onFocusComposer: () => void;
}

function MessageList({
  activeChannelId,
  channelName,
  onFocusComposer,
}: MessageListProps) {
  const { data: messages = [], isLoading } = useMessages(activeChannelId);
  const { data: users = [] } = useUsers();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll triggered by message count
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading && messages.length === 0) {
    return (
      <div
        data-ocid="chat.messages.loading_state"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.text.tertiary,
          fontSize: TYPOGRAPHY.sizes.body,
        }}
      >
        Loading messages…
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        data-ocid="chat.messages.empty_state"
        style={{ flex: 1, display: "flex" }}
      >
        <EmptyModuleState
          icon={<IconMessage size={28} />}
          accent={COLORS.modules.chat as string}
          title="No messages yet"
          description={`Be the first to say something in #${channelName}!`}
          actionLabel="Say hello"
          onAction={onFocusComposer}
        />
      </div>
    );
  }

  // Group messages by date
  const groups: { label: string; msgs: typeof messages }[] = [];
  for (const msg of messages) {
    const label = dayLabel(msg.createdAt);
    const last = groups[groups.length - 1];
    if (!last || last.label !== label) {
      groups.push({ label, msgs: [msg] });
    } else {
      last.msgs.push(msg);
    }
  }

  function getUser(authorId: bigint) {
    return users.find((u) => u.id === authorId);
  }

  return (
    <div
      data-ocid="chat.message_list"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: `0 ${SPACING[5]}px ${SPACING[2]}px`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {groups.map((group) => (
        <div key={group.label}>
          <DateSeparator label={group.label} />
          {group.msgs.map((msg, i) => {
            const user = getUser(msg.authorId);
            const name = user?.name ?? `User ${String(msg.authorId)}`;
            const color = user?.avatarColor ?? COLORS.modules.chat;
            return (
              <div
                key={String(msg.id)}
                data-ocid={`chat.message.${i + 1}`}
                style={{
                  display: "flex",
                  gap: SPACING[3],
                  padding: `${SPACING[1]}px 0`,
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: AVATAR_SM,
                    height: AVATAR_SM,
                    borderRadius: "50%",
                    background: avatarBg(color),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: TYPOGRAPHY.sizes.small,
                    fontWeight: TYPOGRAPHY.weights.bold,
                    color: COLORS.neutral[0],
                    flexShrink: 0,
                    marginTop: SPACING[1] / 4,
                  }}
                >
                  {name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: SPACING[2],
                      marginBottom: SPACING[1] / 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: TYPOGRAPHY.sizes.small,
                        fontWeight: TYPOGRAPHY.weights.semibold,
                        color: COLORS.text.primary,
                      }}
                    >
                      {name}
                    </span>
                    <span
                      style={{
                        fontSize: TYPOGRAPHY.sizes.caption,
                        color: COLORS.text.tertiary,
                      }}
                    >
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.sizes.body,
                      color: COLORS.text.primary,
                      margin: 0,
                      lineHeight: TYPOGRAPHY.lineHeights.normal,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

// ─── Message Composer ─────────────────────────────────────────────────────────

interface MessageComposerProps {
  channelId: number;
  channelName: string;
  authorId: number;
  composerRef: React.RefObject<HTMLInputElement | null>;
}

function MessageComposer({
  channelId,
  channelName,
  authorId,
  composerRef,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const sendMessage = useSendMessage();

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || channelId <= 0) return;
    sendMessage.mutate({ channelId, content: trimmed, authorId });
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        borderTop: `1px solid ${COLORS.border.default}`,
        padding: `${SPACING[3]}px ${SPACING[5]}px`,
        flexShrink: 0,
        background: COLORS.surface.panel3,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING[2],
          background: COLORS.surface.panel3,
          border: `1px solid ${COLORS.border.default}`,
          borderRadius: RADII.lg,
          padding: `0 ${SPACING[3]}px`,
          transition: `border-color ${TRANSITIONS.slow}`,
        }}
      >
        <DsInput
          ref={composerRef}
          value={text}
          onChange={(v) => setText(v)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}...`}
          data-ocid="chat.composer_input"
          style={{
            flex: 1,
            height: SPACING[8] + SPACING[3],
            border: "none",
            background: "transparent",
            fontSize: TYPOGRAPHY.sizes.body,
            boxShadow: "none",
            padding: 0,
          }}
        />
        <DsIconButton
          size="md"
          variant="ghost"
          type="button"
          onClick={handleSend}
          title="Send message"
          aria-label="Send message"
          data-ocid="chat.send_button"
          style={{
            background: text.trim() ? COLORS.modules.chat : "transparent",
            color: text.trim() ? COLORS.neutral[0] : COLORS.text.tertiary,
            flexShrink: 0,
          }}
        >
          <IconSend size={16} />
        </DsIconButton>
      </div>
      <div
        style={{
          marginTop: SPACING[1],
          fontSize: TYPOGRAPHY.sizes.caption,
          color: COLORS.text.tertiary,
          paddingLeft: SPACING[1] / 2,
        }}
      >
        Ctrl+Enter to send · @ to mention
      </div>
    </div>
  );
}

// ─── Named panel exports (consumed by Layout.tsx) ────────────────────────────

// ─── Shared state bridge (channel creation flows through here) ────────────────

interface ChatPageState {
  showNewChannelForm: boolean;
  setShowNewChannelForm: (v: boolean) => void;
  extraChannels: Channel[];
  onChannelCreated: (ch: Channel) => void;
}

// React Context so SecondaryPanel and MainPanel share state
// without a singleton that breaks when the default export is never mounted.
import { createContext, useContext } from "react";

const ChatStateContext = createContext<ChatPageState>({
  showNewChannelForm: false,
  setShowNewChannelForm: () => {},
  extraChannels: [],
  onChannelCreated: () => {},
});

function useChatPageState(): ChatPageState {
  return useContext(ChatStateContext);
}

/**
 * Provider that owns the shared chat state.
 * Layout.tsx wraps both SecondaryPanel and MainPanel with this so they share
 * state even though the default ChatPage export is never mounted by the shell.
 */
export function ChatStateProvider({ children }: { children: React.ReactNode }) {
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  const [extraChannels, setExtraChannels] = useState<Channel[]>([]);

  function onChannelCreated(ch: Channel) {
    setExtraChannels((prev) => [...prev, ch]);
  }

  return (
    <ChatStateContext.Provider
      value={{
        showNewChannelForm,
        setShowNewChannelForm,
        extraChannels,
        onChannelCreated,
      }}
    >
      {children}
    </ChatStateContext.Provider>
  );
}

export function SecondaryPanel() {
  const state = useChatPageState();
  return (
    <ChatSecondaryPanel
      showNewChannelForm={state.showNewChannelForm}
      setShowNewChannelForm={state.setShowNewChannelForm}
      extraChannels={state.extraChannels}
      onChannelCreated={state.onChannelCreated}
    />
  );
}

export function MainPanel() {
  const { canEdit } = useCurrentRole();
  const { activeChannelId, currentUserId } = useWorkspace();
  const { data: backendChannels = [] } = useChannels();
  const state = useChatPageState();
  const composerRef = useRef<HTMLInputElement>(null);

  // Merge backend + locally-created channels to resolve the active name
  const allChannels = [
    ...backendChannels,
    ...state.extraChannels.filter(
      (ec) => !backendChannels.some((bc) => Number(bc.id) === Number(ec.id)),
    ),
  ];

  const activeChannel = allChannels.find(
    (ch) => Number(ch.id) === activeChannelId,
  );
  const channelName = activeChannel?.name ?? "general";
  const channelTopic = activeChannel?.topic ?? "";

  function focusComposer() {
    composerRef.current?.focus();
  }

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
        title={`#${channelName}`}
        subtitle={channelTopic}
        primaryAction={
          canEdit
            ? {
                label: "New Channel",
                icon: <IconPlus size={14} />,
                onClick: () => state.setShowNewChannelForm(true),
              }
            : undefined
        }
        stats={[
          { label: "Channels", value: backendChannels.length },
          { label: "Members", value: 4 },
          { label: "Messages today", value: 24 },
        ]}
      />
      <MessageList
        activeChannelId={activeChannelId}
        channelName={channelName}
        onFocusComposer={focusComposer}
      />
      <div style={{ flexShrink: 0 }}>
        <MessageComposer
          channelId={activeChannelId}
          channelName={channelName}
          authorId={currentUserId}
          composerRef={composerRef as React.RefObject<HTMLInputElement | null>}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatStateProvider>
      <SecondaryPanel />
      <MainPanel />
    </ChatStateProvider>
  );
}
