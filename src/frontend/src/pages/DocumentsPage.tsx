import type { Document } from "@/backend";
import { IconFileText } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  DsButton,
  DsCard,
  DsIconButton,
  DsInput,
  DsTextarea,
  EmptyModuleState,
  NavItem,
  PageHeader,
  SectionLabel,
} from "../components/ds";
import {
  useCreateDocument,
  useDocuments,
  useFolders,
  useUpdateDocument,
} from "../hooks/useBackend";
import { useCurrentRole, useWorkspace } from "../hooks/useWorkspace";
import { COLORS, SEARCH_W, SPACING, TYPOGRAPHY } from "../tokens";

const SAVE_FEEDBACK_MS = 1500;

// ─── Markdown Renderer Styles ───────────────────────────────────────────────

const markdownStyles: Record<string, React.CSSProperties> = {
  h1: {
    fontSize: TYPOGRAPHY.sizes.h1,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    lineHeight: TYPOGRAPHY.lineHeights.tight,
    marginTop: 0,
    marginBottom: `${SPACING[3]}px`,
  },
  h2: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    lineHeight: TYPOGRAPHY.lineHeights.tight,
    marginTop: `${SPACING[4]}px`,
    marginBottom: `${SPACING[2]}px`,
  },
  h3: {
    fontSize: TYPOGRAPHY.sizes.h3,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    lineHeight: TYPOGRAPHY.lineHeights.tight,
    marginTop: `${SPACING[3]}px`,
    marginBottom: `${SPACING[2]}px`,
  },
  p: {
    fontSize: TYPOGRAPHY.sizes.small,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
    color: COLORS.text.primary,
    marginTop: 0,
    marginBottom: `${SPACING[3]}px`,
  },
  ul: {
    fontSize: TYPOGRAPHY.sizes.small,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
    color: COLORS.text.primary,
    paddingLeft: `${SPACING[6]}px`,
    marginTop: 0,
    marginBottom: `${SPACING[3]}px`,
  },
  ol: {
    fontSize: TYPOGRAPHY.sizes.small,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
    color: COLORS.text.primary,
    paddingLeft: `${SPACING[6]}px`,
    marginTop: 0,
    marginBottom: `${SPACING[3]}px`,
  },
  li: {
    marginBottom: `${SPACING[1]}px`,
  },
  code: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: TYPOGRAPHY.sizes.caption,
    background: COLORS.neutral[100],
    padding: `${SPACING[0]}px ${SPACING[1]}px`,
    borderRadius: `${SPACING[1]}px`,
    color: COLORS.text.primary,
  },
  pre: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: TYPOGRAPHY.sizes.caption,
    background: COLORS.neutral[100],
    padding: `${SPACING[3]}px`,
    borderRadius: `${SPACING[2]}px`,
    overflowX: "auto",
    marginTop: 0,
    marginBottom: `${SPACING[3]}px`,
  },
  blockquote: {
    borderLeft: `3px solid ${COLORS.border.strong}`,
    paddingLeft: `${SPACING[3]}px`,
    marginLeft: 0,
    marginTop: 0,
    marginBottom: `${SPACING[3]}px`,
    color: COLORS.text.secondary,
    fontStyle: "italic",
  },
  strong: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  em: {
    fontStyle: "italic",
    color: COLORS.text.primary,
  },
  a: {
    color: COLORS.interactive.focus,
    textDecoration: "underline",
  },
};

// ─── Document Editor (markdown-based) ─────────────────────────────────────────

function DocumentEditor({
  doc,
  content,
  setContent,
  setSaveStatus,
  onSave,
}: {
  doc: Document;
  content: string;
  setContent: (c: string) => void;
  setSaveStatus: (s: string) => void;
  onSave: (title: string, content: string) => void;
}) {
  const [title, setTitle] = useState(doc.title);
  const [isEditing, setIsEditing] = useState(
    !doc.content || doc.content === "",
  );
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when doc changes
  useEffect(() => {
    setTitle(doc.title);
    setIsEditing(!doc.content || doc.content === "");
  }, [doc]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSaveStatus("");
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => {
      onSave(newTitle, content);
    }, SAVE_FEEDBACK_MS);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setSaveStatus("");
    if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
    contentTimerRef.current = setTimeout(() => {
      onSave(title, newContent);
    }, SAVE_FEEDBACK_MS);
  };

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
      {/* Title + meta + edit toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingLeft: SPACING[12],
          paddingRight: SPACING[12],
          paddingTop: SPACING[6],
          paddingBottom: SPACING[2],
          flexShrink: 0,
          gap: SPACING[4],
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <DsInput
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            data-ocid="documents.title_input"
            accentColor={COLORS.modules.documents as string}
            style={{
              background: "transparent",
              border: "none",
              boxShadow: "none",
              fontFamily: "var(--font-display, inherit)",
              fontWeight: TYPOGRAPHY.weights.bold,
              fontSize: TYPOGRAPHY.sizes.h1,
              color: COLORS.text.primary,
              lineHeight: TYPOGRAPHY.lineHeights.tight,
              padding: 0,
              minWidth: 0,
              width: "100%",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: SPACING[4],
              marginTop: `${SPACING[1]}px`,
              fontSize: TYPOGRAPHY.sizes.caption,
              color: COLORS.text.tertiary,
            }}
          >
            <span>
              Updated{" "}
              {formatDistanceToNow(
                new Date(Number(doc.updatedAt) / 1_000_000),
                {
                  addSuffix: true,
                },
              )}
            </span>
          </div>
        </div>

        <DsButton
          variant="secondary"
          size="sm"
          onClick={() => setIsEditing((v) => !v)}
          data-ocid="documents.edit_toggle"
        >
          {isEditing ? "Done" : "Edit"}
        </DsButton>
      </div>

      {/* Divider */}
      <div
        style={{
          marginLeft: SPACING[12],
          marginRight: SPACING[12],
          flexShrink: 0,
          height: 1,
          background: COLORS.border.default,
        }}
      />

      {/* Content area: edit or view */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          paddingLeft: SPACING[12],
          paddingRight: SPACING[12],
          paddingTop: SPACING[6],
          paddingBottom: SPACING[8],
        }}
      >
        {isEditing ? (
          <DsTextarea
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing in markdown…"
            data-ocid="documents.editor"
            style={{
              width: "100%",
              minHeight: "100%",
              resize: "none",
              fontSize: TYPOGRAPHY.sizes.small,
              lineHeight: TYPOGRAPHY.lineHeights.relaxed,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          />
        ) : (
          <div data-ocid="documents.viewer">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 style={markdownStyles.h1}>{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 style={markdownStyles.h2}>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 style={markdownStyles.h3}>{children}</h3>
                ),
                p: ({ children }) => <p style={markdownStyles.p}>{children}</p>,
                ul: ({ children }) => (
                  <ul style={markdownStyles.ul}>{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol style={markdownStyles.ol}>{children}</ol>
                ),
                li: ({ children }) => (
                  <li style={markdownStyles.li}>{children}</li>
                ),
                code: ({ children }) => (
                  <code style={markdownStyles.code}>{children}</code>
                ),
                pre: ({ children }) => (
                  <pre style={markdownStyles.pre}>{children}</pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote style={markdownStyles.blockquote}>
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong style={markdownStyles.strong}>{children}</strong>
                ),
                em: ({ children }) => (
                  <em style={markdownStyles.em}>{children}</em>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    style={markdownStyles.a}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {content || "*No content yet. Click Edit to start writing.*"}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module-level search store (no context, cross-panel sync) ───────────────

let _docsSearchQuery = "";
const _docsSearchListeners = new Set<() => void>();

function _setDocsSearchQuery(q: string) {
  if (_docsSearchQuery !== q) {
    _docsSearchQuery = q;
    for (const l of _docsSearchListeners) l();
  }
}

function _subscribeDocsSearch(cb: () => void) {
  _docsSearchListeners.add(cb);
  return () => _docsSearchListeners.delete(cb);
}

function useDocsSearch(): [string, (q: string) => void] {
  const q = useSyncExternalStore(
    _subscribeDocsSearch,
    () => _docsSearchQuery,
    () => _docsSearchQuery,
  );
  return [q, _setDocsSearchQuery];
}
// ─── Module-level folder selection store (syncs Panel 2 ↔ Panel 3) ──────────

let _selectedFolderId: bigint | null = null;
const _folderListeners = new Set<() => void>();

function _setSelectedFolderId(id: bigint | null) {
  if (_selectedFolderId !== id) {
    _selectedFolderId = id;
    for (const l of _folderListeners) l();
  }
}

function _subscribeFolder(cb: () => void) {
  _folderListeners.add(cb);
  return () => _folderListeners.delete(cb);
}

function useSelectedFolder(): [bigint | null, (id: bigint | null) => void] {
  const id = useSyncExternalStore(
    _subscribeFolder,
    () => _selectedFolderId,
    () => _selectedFolderId,
  );
  return [id, _setSelectedFolderId];
}

// ─── Secondary Panel ──────────────────────────────────────────────────────────

function DocumentRow({
  doc,
  isActive,
  onClick,
}: {
  doc: Document;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <NavItem
      label={doc.title || "Untitled"}
      accent={COLORS.modules.documents}
      selected={isActive}
      onClick={onClick}
    />
  );
}

function DocumentsSecondaryPanelInner() {
  const [selectedFolderId, setSelectedFolderId] = useSelectedFolder();
  const { activeDocumentId, setActiveDocumentId } = useWorkspace();
  const { data: folders } = useFolders();
  const { data: documents } = useDocuments(null);
  const [searchQuery] = useDocsSearch();

  const foldersArr = folders ?? [];
  const documentsArr = documents ?? [];
  const rootFolders = foldersArr.filter((f) => f.parentId == null);
  const childFolders = foldersArr.filter((f) => f.parentId != null);

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let docs = documentsArr;
    if (selectedFolderId !== null) {
      docs = docs.filter((d) => d.folderId === selectedFolderId);
    }
    if (!q) return docs;
    return docs.filter((d) =>
      (d.title || "Untitled").toLowerCase().includes(q),
    );
  }, [documentsArr, searchQuery, selectedFolderId]);

  const showFolders =
    !searchQuery.trim() && (rootFolders.length > 0 || childFolders.length > 0);

  const selectedFolderName =
    selectedFolderId !== null
      ? (foldersArr.find((f) => f.id === selectedFolderId)?.name ?? null)
      : null;

  return (
    <div className="flex flex-col h-full" data-ocid="documents.secondary_panel">
      <div className="flex-1 overflow-y-auto py-2">
        {/* Folders section — hidden while searching */}
        {showFolders && (
          <>
            <SectionLabel label="Folders" />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* All Documents root item */}
              <NavItem
                label="All Documents"
                accent={COLORS.modules.documents}
                selected={selectedFolderId === null && !searchQuery.trim()}
                indent={0}
                data-ocid="documents.folder.all"
                onClick={() => {
                  setSelectedFolderId(null);
                  setActiveDocumentId(null);
                }}
              />
              {rootFolders.map((f) => (
                <NavItem
                  key={String(f.id)}
                  label={f.name}
                  accent={COLORS.modules.documents}
                  selected={selectedFolderId === f.id}
                  indent={0}
                  data-ocid={`documents.folder.${f.id}`}
                  onClick={() => {
                    setSelectedFolderId(f.id);
                    setActiveDocumentId(null);
                  }}
                />
              ))}
              {childFolders.map((f) => (
                <NavItem
                  key={String(f.id)}
                  label={f.name}
                  accent={COLORS.modules.documents}
                  selected={selectedFolderId === f.id}
                  indent={1}
                  data-ocid={`documents.folder.${f.id}`}
                  onClick={() => {
                    setSelectedFolderId(f.id);
                    setActiveDocumentId(null);
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Documents list */}
        <SectionLabel
          label={
            searchQuery.trim()
              ? `Results (${filteredDocuments.length})`
              : selectedFolderName
                ? selectedFolderName
                : "All Documents"
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <DocumentRow
                key={String(doc.id)}
                doc={doc}
                isActive={Number(doc.id) === activeDocumentId}
                onClick={() => setActiveDocumentId(Number(doc.id))}
              />
            ))
          ) : (
            <div
              data-ocid="documents.search_empty_state"
              style={{
                paddingTop: SPACING[3],
                paddingBottom: SPACING[3],
                paddingLeft: SPACING[4],
                paddingRight: SPACING[4],
                fontSize: TYPOGRAPHY.sizes.caption,
                color: COLORS.text.tertiary,
                textAlign: "center",
              }}
            >
              No documents match your search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main panel inner ─────────────────────────────────────────────────────────

function DocumentsMainPanelInner() {
  const [selectedFolderId] = useSelectedFolder();
  const { canEdit } = useCurrentRole();
  const { activeDocumentId, setActiveDocumentId } = useWorkspace();
  const { data: documents } = useDocuments(null);
  const { data: folders } = useFolders();
  const updateDocument = useUpdateDocument();
  const createDocument = useCreateDocument();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useDocsSearch();

  // Client-side folder filtering
  const visibleDocuments = useMemo(() => {
    if (!documents) return [];
    const q = searchQuery.trim().toLowerCase();
    let docs = documents;
    if (selectedFolderId !== null) {
      docs = docs.filter((d) => d.folderId === selectedFolderId);
    }
    if (q) {
      docs = docs.filter((d) =>
        (d.title || "Untitled").toLowerCase().includes(q),
      );
    }
    return docs;
  }, [documents, selectedFolderId, searchQuery]);

  const activeDoc =
    visibleDocuments.find((d) => Number(d.id) === activeDocumentId) ??
    documents?.find((d) => Number(d.id) === activeDocumentId) ??
    null;

  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<string>("");

  useEffect(() => {
    if (activeDoc) {
      setContent(activeDoc.content);
      setSaveStatus("Auto-saved");
    }
  }, [activeDoc]);

  const handleSave = useCallback(
    (title: string, html: string) => {
      if (!activeDocumentId) return;
      setSaveStatus("Saving…");
      updateDocument.mutate(
        { id: activeDocumentId, title, content: html },
        {
          onSuccess: () => {
            setTimeout(() => setSaveStatus("Auto-saved"), SAVE_FEEDBACK_MS);
          },
          onError: () => setSaveStatus(""),
        },
      );
    },
    [activeDocumentId, updateDocument],
  );

  const handleCreate = useCallback(() => {
    createDocument.mutate(
      {
        title: "Untitled",
        folderId: selectedFolderId !== null ? Number(selectedFolderId) : null,
      },
      {
        onSuccess: (result) => {
          if (result != null) {
            setActiveDocumentId(Number(result.id));
            queryClient.invalidateQueries({
              queryKey: ["documents"],
              exact: false,
            });
          }
        },
      },
    );
  }, [createDocument, setActiveDocumentId, queryClient, selectedFolderId]);

  // Determine the page title: active doc name, or folder context
  const selectedFolderName =
    selectedFolderId !== null
      ? (folders?.find((f) => f.id === selectedFolderId)?.name ?? null)
      : null;

  const pageTitle = activeDoc
    ? activeDoc.title || "Untitled"
    : (selectedFolderName ?? "All Documents");

  // Subtitle: save status when editing, doc count when browsing
  const pageSubtitle = activeDoc
    ? saveStatus
    : selectedFolderName
      ? `${visibleDocuments.length} document${visibleDocuments.length !== 1 ? "s" : ""}`
      : undefined;

  return (
    <div
      data-ocid="documents.main_panel"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        background: COLORS.surface.panel3,
      }}
    >
      {/* Shared PageHeader — LEFT: context title, RIGHT: New Document action */}
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        primaryAction={
          canEdit
            ? {
                label: "New Document",
                onClick: handleCreate,
              }
            : undefined
        }
        stats={[
          { label: "Total docs", value: (documents ?? []).length },
          { label: "Folders", value: (folders ?? []).length },
          { label: "Recent (7d)", value: 5 },
        ]}
      />
      {activeDocumentId != null && activeDoc != null ? (
        <DocumentEditor
          doc={activeDoc}
          content={content}
          setContent={setContent}
          setSaveStatus={setSaveStatus}
          onSave={handleSave}
        />
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {visibleDocuments.length > 0 ? (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: `${SPACING[4]}px ${SPACING[6]}px`,
                display: "flex",
                flexDirection: "column",
                gap: SPACING[2],
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[2],
                  marginBottom: SPACING[2],
                }}
              >
                <DsInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter documents…"
                  data-ocid="documents.search_input"
                  style={{ width: SEARCH_W }}
                />
                {searchQuery && (
                  <DsIconButton
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => setSearchQuery("")}
                    data-ocid="documents.search_clear_button"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    ×
                  </DsIconButton>
                )}
              </div>
              {visibleDocuments.map((doc) => (
                <DsCard
                  key={doc.id}
                  onClick={() => setActiveDocumentId(Number(doc.id))}
                  style={{ padding: `${SPACING[4]}px ${SPACING[5]}px` }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: SPACING[3],
                    }}
                  >
                    <IconFileText
                      size={16}
                      style={{ color: COLORS.modules.documents, flexShrink: 0 }}
                    />
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: TYPOGRAPHY.sizes.small,
                        fontWeight: TYPOGRAPHY.weights.medium,
                        color: COLORS.text.primary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {doc.title || "Untitled"}
                    </span>
                    <span
                      style={{
                        fontSize: TYPOGRAPHY.sizes.caption,
                        color: COLORS.text.tertiary,
                        flexShrink: 0,
                      }}
                    >
                      {formatDistanceToNow(
                        new Date(Number(doc.updatedAt) / 1_000_000),
                        { addSuffix: true },
                      )}
                    </span>
                  </div>
                </DsCard>
              ))}
            </div>
          ) : (
            <div
              data-ocid="documents.empty_state"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING[2],
                  padding: `${SPACING[4]}px ${SPACING[6]}px`,
                  flexShrink: 0,
                }}
              >
                <DsInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter documents…"
                  data-ocid="documents.search_input"
                  style={{ width: SEARCH_W }}
                />
                {searchQuery && (
                  <DsIconButton
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => setSearchQuery("")}
                    data-ocid="documents.search_clear_button"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    ×
                  </DsIconButton>
                )}
              </div>
              <div style={{ flex: 1, display: "flex" }}>
                <EmptyModuleState
                  icon={<IconFileText size={28} />}
                  accent={COLORS.modules.documents as string}
                  title={
                    selectedFolderName
                      ? `No documents in ${selectedFolderName}`
                      : "No documents yet"
                  }
                  description={
                    selectedFolderName
                      ? "Create a new document to add it to this folder."
                      : "Create your first document to get started."
                  }
                  actionLabel={canEdit ? "Create document" : undefined}
                  onAction={canEdit ? handleCreate : undefined}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Named panel exports (consumed by Layout.tsx) ────────────────────────────

export function SecondaryPanel() {
  return <DocumentsSecondaryPanelInner />;
}

export function MainPanel() {
  return <DocumentsMainPanelInner />;
}

export default function DocumentsPage() {
  return (
    <>
      <DocumentsSecondaryPanelInner />
      <DocumentsMainPanelInner />
    </>
  );
}
