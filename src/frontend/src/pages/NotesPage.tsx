import type { Note, NoteFolder } from "@/backend";
import {
  DsButton,
  DsIconButton,
  DsInput,
  DsTextarea,
  EmptyModuleState,
  NavItem,
  PageHeader,
  SectionLabel,
} from "@/components/ds";
import {
  useCreateNote,
  useCreateNoteFolder,
  useDeleteNote,
  useDeleteNoteFolder,
  useNoteFolders,
  useNotes,
  useUpdateNote,
} from "@/hooks/useBackend";
import { useCurrentRole } from "@/hooks/useWorkspace";
import { MODULE_ACCENTS } from "@/moduleAccents";
import {
  COLORS,
  NOTE_LIST_WIDTH,
  RADII,
  SPACING,
  STATUS_DOT_LG,
  TYPOGRAPHY,
} from "@/tokens";
import {
  IconCheck,
  IconFolder,
  IconNote,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ACCENT = MODULE_ACCENTS.notes;

// NOTE_LIST_WIDTH (280) and ACCENT_TINT come from tokens
// Accent tint: 5% opacity overlay using rgba, no hex-opacity string interpolation
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},0.05)`;
}
const ACCENT_TINT = hexToRgb(ACCENT);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(ts: bigint): string {
  const now = Date.now();
  const then = Number(ts) / 1_000_000;
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString();
}

function preview(text: string, max = 60): string {
  const t = text.replace(/\n/g, " ").trim();
  if (t.length === 0) return "No content";
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function noteTitle(note: Note): string {
  return note.title.trim() || "Untitled";
}

// ─── Selection store ─────────────────────────────────────────────────────────

type Sel = {
  selectedFolderId: number | undefined;
  selectedNoteId: number | undefined;
};

let _sel: Sel = {
  selectedFolderId: undefined,
  selectedNoteId: undefined,
};

const _ls = new Set<() => void>();

function getSnap(): Sel {
  return _sel;
}

function sub(cb: () => void): () => void {
  _ls.add(cb);
  return () => _ls.delete(cb);
}

function setSel(p: Partial<Sel>) {
  _sel = { ..._sel, ...p };
  for (const cb of _ls) cb();
}

function useSel(): [Sel, (p: Partial<Sel>) => void] {
  const s = useSyncExternalStore(sub, getSnap);
  const set = useCallback((p: Partial<Sel>) => setSel(p), []);
  return [s, set];
}

// ─── Secondary Panel ─────────────────────────────────────────────────────────

export function SecondaryPanel() {
  const [{ selectedFolderId }, set] = useSel();
  const [newName, setNewName] = useState("");
  const [hoverId, setHoverId] = useState<number | null>(null);

  const { data: folders = [], isLoading } = useNoteFolders();

  const createF = useCreateNoteFolder();
  const deleteF = useDeleteNoteFolder();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createF.mutate(newName.trim());
    setNewName("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
      data-ocid="notes.panel2"
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: SPACING[1],
          paddingBottom: SPACING[4],
        }}
      >
        <NavItem
          label="All Notes"
          accent={ACCENT}
          selected={selectedFolderId === undefined}
          onClick={() =>
            set({ selectedFolderId: undefined, selectedNoteId: undefined })
          }
          data-ocid="notes.all_notes"
        />

        <SectionLabel label="Folders" />

        {isLoading ? (
          <div
            style={{
              padding: `${SPACING[3]}px ${SPACING[4]}px`,
              color: COLORS.text.tertiary,
              fontSize: TYPOGRAPHY.sizes.small,
            }}
          >
            Loading folders…
          </div>
        ) : folders.length === 0 ? (
          <div
            style={{
              padding: `${SPACING[3]}px ${SPACING[4]}px`,
              color: COLORS.text.tertiary,
              fontSize: TYPOGRAPHY.sizes.small,
            }}
          >
            No folders yet
          </div>
        ) : (
          folders.map((f: NoteFolder) => {
            const id = Number(f.id);
            return (
              <div
                key={id}
                onMouseEnter={() => setHoverId(id)}
                onMouseLeave={() => setHoverId(null)}
                style={{ position: "relative" }}
              >
                <NavItem
                  label={f.name}
                  accent={ACCENT}
                  selected={selectedFolderId === id}
                  icon={<IconFolder size={16} />}
                  onClick={() =>
                    set({ selectedFolderId: id, selectedNoteId: undefined })
                  }
                  data-ocid={`notes.folder.${id}`}
                />
                {hoverId === id && (
                  <div
                    style={{
                      position: "absolute",
                      right: SPACING[6],
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "auto",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <DsIconButton
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => deleteF.mutate(id)}
                      title="Delete folder"
                      aria-label="Delete folder"
                      data-ocid={`notes.delete_folder_button.${id}`}
                    >
                      <IconTrash size={14} />
                    </DsIconButton>
                  </div>
                )}
              </div>
            );
          })
        )}

        <form
          onSubmit={onSubmit}
          style={{
            padding: `${SPACING[2]}px ${SPACING[4]}px`,
            marginLeft: SPACING[2],
            marginRight: SPACING[2],
          }}
        >
          <DsInput
            value={newName}
            onChange={setNewName}
            placeholder="New folder…"
            data-ocid="notes.new_folder_input"
            style={{
              fontSize: TYPOGRAPHY.sizes.small,
              padding: `${SPACING[1]}px ${SPACING[2]}px`,
            }}
          />
        </form>
      </div>
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export function MainPanel() {
  const { canEdit } = useCurrentRole();
  const [{ selectedFolderId, selectedNoteId }, set] = useSel();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: notes = [],
    isLoading: loadingNotes,
    isError: notesErr,
  } = useNotes(selectedFolderId !== undefined ? selectedFolderId : null);

  const { data: folders = [] } = useNoteFolders();

  const createN = useCreateNote();
  const updateN = useUpdateNote();
  const deleteN = useDeleteNote();

  const selNote = notes.find((n) => Number(n.id) === selectedNoteId) || null;

  useEffect(() => {
    if (selNote) {
      setTitle(selNote.title);
      setContent(selNote.content);
      setIsEditing(false);
    } else {
      setTitle("");
      setContent("");
      setIsEditing(true);
    }
    setSaved(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [selNote]);

  const showSaved = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, []);

  const doSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!selNote) return;
    updateN.mutate(
      { id: Number(selNote.id), title, content },
      { onSuccess: showSaved },
    );
  }, [selNote, title, content, updateN, showSaved]);

  const debouncedSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSave(), 500);
  }, [doSave]);

  const onTitle = (v: string) => {
    setTitle(v);
    debouncedSave();
  };
  const onContent = (v: string) => {
    setContent(v);
    debouncedSave();
  };
  const onBlur = () => doSave();

  const onCreate = async () => {
    try {
      const note = await createN.mutateAsync({
        title: "Untitled note",
        folderId: selectedFolderId !== undefined ? selectedFolderId : null,
      });
      if (note) set({ selectedNoteId: Number(note.id) });
    } catch {
      /* React Query handles error state */
    }
  };

  const onDelete = () => {
    if (!selNote) return;
    deleteN.mutate(Number(selNote.id), {
      onSuccess: () => set({ selectedNoteId: undefined }),
    });
  };

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
      data-ocid="notes.main_panel"
    >
      <PageHeader
        title={selNote ? noteTitle(selNote) : "All Notes"}
        subtitle={
          selNote
            ? saved
              ? "Saved ✓"
              : ""
            : `${notes.length} note${notes.length !== 1 ? "s" : ""}`
        }
        primaryAction={
          canEdit
            ? {
                label: "New note",
                onClick: onCreate,
                icon: <IconPlus size={16} />,
              }
            : undefined
        }
        stats={[
          { label: "Notes", value: notes.length },
          { label: "Folders", value: folders.length },
          { label: "Last edited", value: notes.length > 0 ? "Today" : "—" },
        ]}
      />

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* Note list */}
        <div
          style={{
            width: NOTE_LIST_WIDTH,
            minWidth: NOTE_LIST_WIDTH,
            maxWidth: NOTE_LIST_WIDTH,
            borderRight: `1px solid ${COLORS.border.default}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: COLORS.surface.panel3,
          }}
          data-ocid="notes.note_list"
        >
          {loadingNotes ? (
            <div
              style={{
                padding: SPACING[4],
                color: COLORS.text.tertiary,
                fontSize: TYPOGRAPHY.sizes.small,
              }}
            >
              Loading notes…
            </div>
          ) : notesErr ? (
            <div
              style={{
                padding: SPACING[4],
                color: COLORS.semantic.danger,
                fontSize: TYPOGRAPHY.sizes.small,
              }}
            >
              Failed to load notes
            </div>
          ) : notes.length === 0 ? (
            <div
              style={{
                padding: SPACING[4],
                color: COLORS.text.tertiary,
                fontSize: TYPOGRAPHY.sizes.small,
                textAlign: "center",
              }}
            >
              No notes in this folder
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {notes.map((note, idx) => {
                const id = Number(note.id);
                const isSel = selectedNoteId === id;
                return (
                  <DsButton
                    key={id}
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => set({ selectedNoteId: id })}
                    data-ocid={`notes.note_item.${idx + 1}`}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      justifyContent: "flex-start",
                      padding: `${SPACING[3]}px ${SPACING[4]}px`,
                      borderRadius: 0,
                      borderBottom: `1px solid ${COLORS.border.subtle}`,
                      background: isSel ? ACCENT_TINT : "transparent",
                      display: "flex",
                      flexDirection: "column",
                      gap: SPACING[1],
                      height: "auto",
                    }}
                  >
                    <div
                      style={{
                        fontSize: TYPOGRAPHY.sizes.small,
                        fontWeight: TYPOGRAPHY.weights.medium,
                        color: isSel ? ACCENT : COLORS.text.primary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "100%",
                      }}
                    >
                      {noteTitle(note)}
                    </div>
                    <div
                      style={{
                        fontSize: TYPOGRAPHY.sizes.caption,
                        color: COLORS.text.secondary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "100%",
                      }}
                    >
                      {preview(note.content)}
                    </div>
                    <div
                      style={{
                        fontSize: TYPOGRAPHY.sizes.caption,
                        color: COLORS.text.tertiary,
                      }}
                    >
                      {relativeTime(note.updatedAt)}
                    </div>
                  </DsButton>
                );
              })}
            </div>
          )}
        </div>

        {/* Editor */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selNote ? (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                padding: `${SPACING[5]}px ${SPACING[6]}px`,
                gap: SPACING[3],
                boxSizing: "border-box",
              }}
              data-ocid="notes.editor"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: SPACING[3],
                }}
              >
                <div
                  style={{
                    fontSize: TYPOGRAPHY.sizes.caption,
                    color: COLORS.text.tertiary,
                    fontWeight: TYPOGRAPHY.weights.regular,
                  }}
                >
                  {relativeTime(selNote.updatedAt)}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: SPACING[3],
                  }}
                >
                  <DsButton
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        doSave();
                      }
                      setIsEditing((v) => !v);
                    }}
                    data-ocid="notes.edit_toggle_button"
                  >
                    {isEditing ? "Done" : "Edit"}
                  </DsButton>
                  <DsButton
                    variant="danger"
                    size="sm"
                    type="button"
                    onClick={onDelete}
                    data-ocid="notes.delete_note_button"
                  >
                    Delete
                  </DsButton>
                </div>
              </div>

              {/* Note title — DsInput styled as a display-size heading */}
              <DsInput
                type="text"
                value={title}
                onChange={onTitle}
                onBlur={onBlur}
                placeholder="Note title"
                data-ocid="notes.title_input"
                accentColor={ACCENT}
                style={{
                  fontSize: TYPOGRAPHY.sizes.h2,
                  fontWeight: TYPOGRAPHY.weights.semibold,
                  color: COLORS.text.primary,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: 0,
                  boxShadow: "none",
                  lineHeight: TYPOGRAPHY.lineHeights.tight,
                  width: "100%",
                }}
              />

              <div
                style={{
                  height: 1,
                  background: COLORS.border.subtle,
                  flexShrink: 0,
                }}
              />

              {isEditing ? (
                <DsTextarea
                  value={content}
                  onChange={onContent}
                  placeholder="Start writing…"
                  data-ocid="notes.body_textarea"
                  rows={20}
                  style={{
                    flex: 1,
                    resize: "none",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    boxShadow: "none",
                    fontSize: TYPOGRAPHY.sizes.body,
                    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
                    padding: 0,
                    minHeight: 0,
                  }}
                />
              ) : (
                <div
                  data-ocid="notes.markdown_view"
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    fontSize: TYPOGRAPHY.sizes.body,
                    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
                    color: COLORS.text.primary,
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || "*No content*"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <EmptyModuleState
              icon={<IconNote size={32} />}
              accent={ACCENT}
              title="Select a note"
              description="Select a note from the list or create a new one to get started."
              actionLabel="New note"
              onAction={onCreate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page Root ───────────────────────────────────────────────────────────────

export default function NotesPage() {
  useSyncExternalStore(sub, getSnap);
  return (
    <>
      <SecondaryPanel />
      <MainPanel />
    </>
  );
}
