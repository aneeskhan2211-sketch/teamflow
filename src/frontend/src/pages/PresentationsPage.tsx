import type { Slide } from "@/backend";
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
} from "@/components/ds";
import {
  useCreatePresentation,
  useCreateSlide,
  useDeletePresentation,
  useDeleteSlide,
  usePresentationSlides,
  usePresentations,
  useRenamePresentation,
  useReorderSlides,
  useUpdateSlide,
} from "@/hooks/useBackend";
import { useCurrentRole } from "@/hooks/useWorkspace";
import {
  COLORS,
  RADII,
  SHADOWS,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "@/tokens";
import {
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconPencil,
  IconPlus,
  IconPresentation,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const accent = COLORS.modules.presentations;

// ─── Module-level shared store (cross-panel, no context needed) ──────────────────
// Both SecondaryPanel and MainPanel are rendered as siblings in Layout.tsx
// and can't share React context. This simple store syncs isCreating and
// selectedPresId between them.

type PresStoreListener = () => void;
const presStoreListeners = new Set<PresStoreListener>();
let presStoreIsCreating = false;
let presStoreSelectedId: number | null = null;

function notifyPresListeners() {
  for (const fn of presStoreListeners) fn();
}

function setPresIsCreating(value: boolean) {
  presStoreIsCreating = value;
  notifyPresListeners();
}

function setPresSelectedId(value: number | null) {
  presStoreSelectedId = value;
  notifyPresListeners();
}

function usePresStore(): [
  boolean,
  (v: boolean) => void,
  number | null,
  (v: number | null) => void,
] {
  const [isCreating, setIsCreatingLocal] = useState(presStoreIsCreating);
  const [selectedId, setSelectedIdLocal] = useState(presStoreSelectedId);
  useEffect(() => {
    // Sync in case store changed between render and effect
    setIsCreatingLocal(presStoreIsCreating);
    setSelectedIdLocal(presStoreSelectedId);
    const listener = () => {
      setIsCreatingLocal(presStoreIsCreating);
      setSelectedIdLocal(presStoreSelectedId);
    };
    presStoreListeners.add(listener);
    return () => {
      presStoreListeners.delete(listener);
    };
  }, []);
  return [isCreating, setPresIsCreating, selectedId, setPresSelectedId];
}

// Convenience hooks for backward compat
function usePresIsCreating(): [boolean, (v: boolean) => void] {
  const [isCreating, setIsCreating] = usePresStore();
  return [isCreating, setIsCreating];
}

// ─── Types ────────────────────────────────────────────────────────────────────

type VisualType = "stat" | "list" | "quote" | "text";

function parseVisualType(v: string): VisualType {
  if (v === "stat" || v === "list" || v === "quote") return v;
  return "text";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSlideContent(content: string, visualType: VisualType): string[] {
  if (visualType === "text") return [content];
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// ─── Slide Thumbnail ──────────────────────────────────────────────────────────

function SlideThumbnail({
  slide,
  index,
  selected,
  onClick,
}: {
  slide: Slide;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const vType = parseVisualType(slide.visualType);
  return (
    <button
      type="button"
      data-ocid={`presentations.slide_thumb.${index + 1}`}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: SPACING[2],
        paddingTop: SPACING[2],
        paddingBottom: SPACING[2],
        paddingLeft: SPACING[3],
        paddingRight: SPACING[3],
        marginLeft: SPACING[2],
        marginRight: SPACING[2],
        borderRadius: RADII.md,
        background: selected ? `${accent}1A` : "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        width: `calc(100% - ${SPACING[4]}px)`,
        transition: `background ${TRANSITIONS.fast}`,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!selected)
          e.currentTarget.style.background = COLORS.interactive.hover;
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Mini slide preview box with number badge */}
      <div
        style={{
          flexShrink: 0,
          width: SPACING[12],
          height: SPACING[8],
          borderRadius: RADII.sm,
          border: selected
            ? `1.5px solid ${accent}`
            : `1px solid ${COLORS.border.default}`,
          background: selected ? `${accent}14` : COLORS.neutral[50],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: TYPOGRAPHY.sizes.micro,
          fontWeight: TYPOGRAPHY.weights.semibold,
          color: selected ? accent : COLORS.text.tertiary,
          boxShadow: selected ? `0 0 0 1px ${accent}40` : SHADOWS.subtle,
          position: "relative",
        }}
      >
        {index + 1}
      </div>
      {/* Title + visual type */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: TYPOGRAPHY.sizes.small,
            fontWeight: selected
              ? TYPOGRAPHY.weights.semibold
              : TYPOGRAPHY.weights.medium,
            color: selected ? accent : COLORS.text.primary,
            lineHeight: TYPOGRAPHY.lineHeights.tight,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {slide.title || "Untitled Slide"}
        </div>
        <div
          style={{
            marginTop: SPACING[1],
            fontSize: TYPOGRAPHY.sizes.micro,
            color: COLORS.text.tertiary,
            fontWeight: TYPOGRAPHY.weights.regular,
            textTransform: "capitalize",
          }}
        >
          {vType}
        </div>
      </div>
    </button>
  );
}

// ─── Slide Visual Renderer ────────────────────────────────────────────────────

function SlideVisual({
  content,
  visualType,
}: {
  content: string;
  visualType: VisualType;
}) {
  const items = formatSlideContent(content, visualType);

  if (visualType === "stat") {
    return (
      <div
        style={{
          display: "flex",
          gap: SPACING[4],
          flexWrap: "wrap",
          marginTop: SPACING[5],
        }}
      >
        {items.map((stat, _i) => (
          <div
            key={stat}
            style={{
              flex: "1 1 140px",
              background: `${accent}0F`,
              border: `1px solid ${accent}30`,
              borderRadius: RADII.lg,
              padding: `${SPACING[4]}px`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: TYPOGRAPHY.sizes.h3,
                fontWeight: TYPOGRAPHY.weights.bold,
                color: accent,
                lineHeight: TYPOGRAPHY.lineHeights.tight,
              }}
            >
              {stat}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visualType === "list") {
    return (
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: `${SPACING[5]}px 0 0 0`,
          display: "flex",
          flexDirection: "column",
          gap: SPACING[2],
        }}
      >
        {items.map((item, i) => (
          <li
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: SPACING[3],
              fontSize: TYPOGRAPHY.sizes.body,
              color: COLORS.text.primary,
              fontWeight: TYPOGRAPHY.weights.medium,
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: RADII.pill,
                background: `${accent}1A`,
                color: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: TYPOGRAPHY.sizes.caption,
                fontWeight: TYPOGRAPHY.weights.bold,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (visualType === "quote") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: SPACING[3],
          marginTop: SPACING[5],
        }}
      >
        {items.map((q, _i) => (
          <blockquote
            key={q}
            style={{
              margin: 0,
              paddingTop: SPACING[3],
              paddingBottom: SPACING[3],
              paddingLeft: SPACING[4],
              paddingRight: SPACING[4],
              borderLeft: `3px solid ${accent}`,
              background: `${accent}08`,
              borderRadius: `0 ${RADII.md}px ${RADII.md}px 0`,
              fontSize: TYPOGRAPHY.sizes.body,
              color: COLORS.text.secondary,
              fontStyle: "italic",
              lineHeight: TYPOGRAPHY.lineHeights.relaxed,
            }}
          >
            {q}
          </blockquote>
        ))}
      </div>
    );
  }

  // text
  return (
    <p
      style={{
        margin: `${SPACING[4]}px 0 0 0`,
        fontSize: TYPOGRAPHY.sizes.body,
        color: COLORS.text.secondary,
        lineHeight: TYPOGRAPHY.lineHeights.relaxed,
        maxWidth: 640,
        whiteSpace: "pre-wrap",
      }}
    >
      {content}
    </p>
  );
}

// ─── Inline Editable Slide Card ───────────────────────────────────────────────

function SlideCard({
  slide,
  index,
  total,
  onChange,
}: {
  slide: Slide;
  index: number;
  total: number;
  onChange: (patch: { title?: string; content?: string }) => void;
}) {
  const vType = parseVisualType(slide.visualType);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);

  return (
    <DsCard
      padding={SPACING[8]}
      shadow="medium"
      style={{
        maxWidth: 800,
        width: "100%",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: SPACING[4],
        }}
      >
        <span
          style={{
            fontSize: TYPOGRAPHY.sizes.caption,
            fontWeight: TYPOGRAPHY.weights.semibold,
            color: COLORS.text.tertiary,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Slide {index + 1} of {total}
        </span>
        <span
          style={{
            fontSize: TYPOGRAPHY.sizes.caption,
            fontWeight: TYPOGRAPHY.weights.semibold,
            color: accent,
            background: `${accent}14`,
            padding: `${SPACING[0]}px ${SPACING[2]}px`,
            borderRadius: RADII.pill,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {vType}
        </span>
      </div>

      {editingTitle ? (
        <DsInput
          value={slide.title}
          onChange={(v) => onChange({ title: v })}
          onBlur={() => setEditingTitle(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setEditingTitle(false);
          }}
          data-ocid="presentations.editor.title_input"
          style={{
            fontSize: TYPOGRAPHY.sizes.h1,
            fontWeight: TYPOGRAPHY.weights.bold,
            marginBottom: SPACING[2],
          }}
        />
      ) : (
        <h2
          onClick={() => setEditingTitle(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setEditingTitle(true);
            }
          }}
          style={{
            margin: 0,
            marginBottom: SPACING[2],
            fontSize: TYPOGRAPHY.sizes.h1,
            fontWeight: TYPOGRAPHY.weights.bold,
            color: COLORS.text.primary,
            lineHeight: TYPOGRAPHY.lineHeights.tight,
            cursor: "text",
          }}
          data-ocid="presentations.slide_title"
        >
          {slide.title || "Untitled Slide"}
        </h2>
      )}

      {editingContent ? (
        <DsTextarea
          value={slide.content}
          onChange={(v) => onChange({ content: v })}
          rows={6}
          style={{ resize: "vertical", marginTop: SPACING[2] }}
          placeholder={
            vType === "list"
              ? "One item per line"
              : vType === "stat"
                ? "One stat per line"
                : vType === "quote"
                  ? "One quote per line"
                  : "Slide content"
          }
          data-ocid="presentations.editor.content_textarea"
        />
      ) : (
        <DsButton
          type="button"
          variant="ghost"
          onClick={() => setEditingContent(true)}
          style={{
            cursor: "text",
            padding: 0,
            width: "100%",
            display: "block",
            textAlign: "left",
            height: "auto",
            background: "transparent",
            borderRadius: 0,
          }}
        >
          <SlideVisual content={slide.content} visualType={vType} />
        </DsButton>
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          borderRadius: `${RADII.lg}px 0 0 ${RADII.lg}px`,
          background: accent,
          opacity: 0.6,
        }}
      />
    </DsCard>
  );
}

// ─── Inline Slide Editor (visual type + content) ────────────────────────────────

function SlideEditor({
  slide,
  onChange,
}: {
  slide: Slide;
  onChange: (patch: {
    title?: string;
    content?: string;
    visualType?: string;
  }) => void;
}) {
  const vType = parseVisualType(slide.visualType);

  const labelStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    marginBottom: SPACING[1],
  };

  return (
    <DsCard
      padding={SPACING[8]}
      shadow="medium"
      style={{
        maxWidth: 800,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: SPACING[4],
      }}
    >
      <div style={labelStyle}>Title</div>
      <DsInput
        value={slide.title}
        onChange={(v) => onChange({ title: v })}
        data-ocid="presentations.editor.title_input"
      />

      <div style={labelStyle}>Visual Type</div>
      <div style={{ display: "flex", gap: SPACING[2] }}>
        {(["stat", "list", "quote", "text"] as VisualType[]).map((t) => (
          <DsButton
            key={t}
            variant={vType === t ? "primary" : "ghost"}
            size="sm"
            onClick={() => onChange({ visualType: t })}
            title={`${t.charAt(0).toUpperCase() + t.slice(1)} layout`}
            data-ocid={`presentations.editor.visual_type_${t}`}
            style={{ textTransform: "capitalize" }}
          >
            {t}
          </DsButton>
        ))}
      </div>

      <div style={labelStyle}>Content</div>
      <DsTextarea
        value={slide.content}
        onChange={(v) => onChange({ content: v })}
        rows={6}
        style={{ resize: "vertical" }}
        placeholder={
          vType === "list"
            ? "One item per line"
            : vType === "stat"
              ? "One stat per line"
              : vType === "quote"
                ? "One quote per line"
                : "Slide content"
        }
        data-ocid="presentations.editor.content_textarea"
      />
    </DsCard>
  );
}

// ─── Add Slide Inline Form ─────────────────────────────────────────────────────

function AddSlideForm({
  onCreate,
  onCancel,
}: {
  onCreate: (type: VisualType) => void;
  onCancel: () => void;
}) {
  const [selectedType, setSelectedType] = useState<VisualType>("text");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: SPACING[3],
        paddingTop: SPACING[3],
        paddingBottom: SPACING[3],
        paddingLeft: SPACING[3],
        paddingRight: SPACING[3],
        borderTop: `1px solid ${COLORS.border.default}`,
        background: COLORS.neutral[50],
      }}
      data-ocid="presentations.add_slide_form"
    >
      <div
        style={{
          fontSize: TYPOGRAPHY.sizes.caption,
          fontWeight: TYPOGRAPHY.weights.semibold,
          color: COLORS.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Choose slide type
      </div>
      <div style={{ display: "flex", gap: SPACING[2] }}>
        {(["text", "list", "stat", "quote"] as VisualType[]).map((t) => (
          <DsButton
            key={t}
            variant={selectedType === t ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedType(t)}
            title={`${t.charAt(0).toUpperCase() + t.slice(1)} slide`}
            data-ocid={`presentations.add_slide_type_${t}`}
            style={{
              flex: 1,
              justifyContent: "center",
              textTransform: "capitalize",
            }}
          >
            {t}
          </DsButton>
        ))}
      </div>
      <div
        style={{ display: "flex", gap: SPACING[2], justifyContent: "flex-end" }}
      >
        <DsButton variant="ghost" size="sm" onClick={onCancel} title="Cancel">
          Cancel
        </DsButton>
        <DsButton
          variant="primary"
          size="sm"
          onClick={() => onCreate(selectedType)}
          title="Add slide"
          data-ocid="presentations.confirm_add_slide_button"
        >
          Add Slide
        </DsButton>
      </div>
    </div>
  );
}

// ─── Secondary Panel (Presentation List) ──────────────────────────────────────

export function SecondaryPanel() {
  const { data: presentations = [], isLoading } = usePresentations();
  const [, , selectedId, setSelectedId] = usePresStore();
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isCreating, setIsCreating] = usePresIsCreating();
  const [createValue, setCreateValue] = useState("");
  const createPresentation = useCreatePresentation();
  const renamePresentation = useRenamePresentation();
  const deletePresentation = useDeletePresentation();

  const commitCreate = () => {
    const title = createValue.trim();
    if (title) {
      createPresentation.mutate(title, {
        onSuccess: (pres) => {
          setPresSelectedId(Number(pres.id));
        },
      });
    }
    setIsCreating(false);
    setCreateValue("");
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setCreateValue("");
  };

  const startRename = (id: number, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(currentTitle);
  };

  const commitRename = (id: number) => {
    if (renameValue.trim()) {
      renamePresentation.mutate({ id, title: renameValue.trim() });
    }
    setRenamingId(null);
  };

  return (
    <div
      data-ocid="presentations.secondary_panel"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          paddingTop: SPACING[2],
          paddingBottom: SPACING[2],
          paddingLeft: SPACING[3],
          paddingRight: SPACING[3],
        }}
      >
        {isCreating ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: SPACING[2],
            }}
          >
            <DsInput
              value={createValue}
              onChange={setCreateValue}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitCreate();
                if (e.key === "Escape") cancelCreate();
              }}
              placeholder="Presentation title"
              accentColor={accent}
              style={{ width: "100%", fontSize: TYPOGRAPHY.sizes.small }}
              data-ocid="presentations.new_presentation_input"
            />
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
                onClick={cancelCreate}
                title="Cancel"
              >
                Cancel
              </DsButton>
              <DsButton
                variant="primary"
                size="sm"
                onClick={commitCreate}
                disabled={!createValue.trim()}
                title="Create presentation"
              >
                Create
              </DsButton>
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: `${SPACING[1]}px 0` }}>
        <SectionLabel label="Presentations" />
        {isLoading ? (
          <div
            style={{
              padding: SPACING[4],
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.tertiary,
              textAlign: "center",
            }}
          >
            Loading…
          </div>
        ) : presentations.length === 0 ? (
          <div
            style={{
              paddingTop: SPACING[4],
              paddingBottom: SPACING[4],
              paddingLeft: SPACING[3],
              paddingRight: SPACING[3],
              fontSize: TYPOGRAPHY.sizes.small,
              color: COLORS.text.tertiary,
              textAlign: "center",
            }}
          >
            No presentations yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {presentations.map((pres) => {
              const id = Number(pres.id);
              const isSelected = selectedId === id;
              const isRenaming = renamingId === id;

              if (isRenaming) {
                return (
                  <div
                    key={id}
                    style={{
                      paddingTop: SPACING[2],
                      paddingBottom: SPACING[2],
                      paddingLeft: SPACING[3],
                      paddingRight: SPACING[3],
                      marginLeft: SPACING[2],
                      marginRight: SPACING[2],
                    }}
                  >
                    <DsInput
                      value={renameValue}
                      onChange={setRenameValue}
                      onBlur={() => commitRename(id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      accentColor={accent}
                      style={{
                        width: "100%",
                        fontSize: TYPOGRAPHY.sizes.small,
                      }}
                      data-ocid={`presentations.rename_input.${id}`}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={id}
                  style={{
                    position: "relative",
                    marginLeft: SPACING[2],
                    marginRight: SPACING[2],
                  }}
                >
                  <NavItem
                    label={pres.title}
                    accent={accent}
                    selected={isSelected}
                    onClick={() => setSelectedId(id)}
                    data-ocid={`presentations.pres_item.${id}`}
                  />
                  {isSelected && (
                    <div
                      style={{
                        display: "flex",
                        gap: 2,
                        position: "absolute",
                        right: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <DsIconButton
                        size="sm"
                        variant="ghost"
                        title="Rename"
                        aria-label="Rename presentation"
                        data-ocid={`presentations.rename_button.${id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(id, pres.title);
                        }}
                      >
                        <IconPencil size={12} />
                      </DsIconButton>
                      <DsIconButton
                        size="sm"
                        variant="ghost"
                        title="Delete"
                        aria-label="Delete presentation"
                        data-ocid={`presentations.delete_pres_button.${id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${pres.title}"?`)) {
                            deletePresentation.mutate(id, {
                              onSuccess: () => {
                                if (selectedId === id) setPresSelectedId(null);
                              },
                            });
                          }
                        }}
                      >
                        <IconTrash size={12} />
                      </DsIconButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel (Slide Thumbnails + Editor) ───────────────────────────────────

const SAVE_FEEDBACK_MS = 1500;

function MainPanelInner() {
  const { canEdit } = useCurrentRole();
  const [isCreating, setIsCreating, selectedPresId] = usePresStore();
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (!saveStatus) return;
    const timer = setTimeout(() => setSaveStatus(""), SAVE_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [saveStatus]);
  const { data: presentations = [] } = usePresentations();
  const [selectedSlideId, setSelectedSlideId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Reset slide selection when presentation changes
  const prevPresIdRef = useRef(selectedPresId);
  if (prevPresIdRef.current !== selectedPresId) {
    prevPresIdRef.current = selectedPresId;
    setSelectedSlideId(null);
    setEditing(false);
    setShowAddForm(false);
  }

  const presentation = presentations.find(
    (p) => Number(p.id) === selectedPresId,
  );
  const { data: slides = [], isLoading: slidesLoading } =
    usePresentationSlides(selectedPresId);

  // suppress unused warning — isCreating is only used in SecondaryPanel
  void isCreating;

  const createSlide = useCreateSlide();
  const updateSlide = useUpdateSlide();
  const deleteSlide = useDeleteSlide();
  const reorderSlides = useReorderSlides();

  const selectedSlide = slides.find((s) => Number(s.id) === selectedSlideId);
  const selectedIndex = slides.findIndex(
    (s) => Number(s.id) === selectedSlideId,
  );

  const handleNewSlide = (type: VisualType) => {
    if (!selectedPresId) return;
    const position = slides.length;
    createSlide.mutate(
      {
        presentationId: selectedPresId,
        position,
        title: "New Slide",
        content: "",
        visualType: type,
      },
      {
        onSuccess: (slide) => {
          setSelectedSlideId(Number(slide.id));
          setEditing(true);
          setShowAddForm(false);
        },
      },
    );
  };

  const handleUpdateSlide = (patch: {
    title?: string;
    content?: string;
    visualType?: string;
  }) => {
    if (!selectedSlide) return;
    setSaveStatus("Saved ✓");
    updateSlide.mutate({
      id: Number(selectedSlide.id),
      title: patch.title ?? selectedSlide.title,
      content: patch.content ?? selectedSlide.content,
      visualType: patch.visualType ?? selectedSlide.visualType,
      presentationId: selectedPresId!,
    });
  };

  const handleDeleteSlide = () => {
    if (!selectedSlide || !selectedPresId) return;
    if (slides.length <= 1) return;
    deleteSlide.mutate(
      { id: Number(selectedSlide.id), presentationId: selectedPresId },
      {
        onSuccess: () => {
          const remaining = slides.filter(
            (s) => Number(s.id) !== selectedSlideId,
          );
          const nextIndex = Math.min(selectedIndex, remaining.length - 1);
          setSelectedSlideId(
            remaining[nextIndex] ? Number(remaining[nextIndex].id) : null,
          );
        },
      },
    );
  };

  const handleMoveSlide = (direction: "up" | "down") => {
    if (!selectedPresId || slides.length < 2 || selectedIndex < 0) return;
    const newIndex = direction === "up" ? selectedIndex - 1 : selectedIndex + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const reordered = [...slides];
    const [moved] = reordered.splice(selectedIndex, 1);
    reordered.splice(newIndex, 0, moved);

    reorderSlides.mutate({
      presentationId: selectedPresId,
      slideIds: reordered.map((s) => s.id),
    });
  };

  // ── Compute single PageHeader props based on state ─────────────────────────
  let headerTitle: string;
  let headerSubtitle: string;
  let headerAction:
    | { label: string; onClick: () => void; icon?: React.ReactNode }
    | undefined;
  let headerViewControls:
    | Array<{
        id: string;
        label: string;
        icon: React.ReactNode;
        active: boolean;
        onClick: () => void;
      }>
    | undefined;

  if (presentations.length === 0) {
    headerTitle = "All Presentations";
    headerSubtitle = "0 decks";
    headerAction = canEdit
      ? { label: "New Presentation", onClick: () => setIsCreating(true) }
      : undefined;
    headerViewControls = undefined;
  } else if (!selectedPresId || !presentation) {
    headerTitle = "All Presentations";
    headerSubtitle = `${presentations.length} deck${presentations.length !== 1 ? "s" : ""}`;
    headerAction = canEdit
      ? { label: "New Presentation", onClick: () => setIsCreating(true) }
      : undefined;
    headerViewControls = undefined;
  } else {
    headerTitle = presentation.title;
    headerSubtitle = `Slide ${selectedIndex >= 0 ? selectedIndex + 1 : 1} of ${slides.length}`;
    headerAction = canEdit
      ? {
          label: "New Slide",
          onClick: () => setShowAddForm(true),
          icon: <IconPlus size={16} />,
        }
      : undefined;
    headerViewControls = selectedSlide
      ? [
          {
            id: "move-up",
            label: "Move slide up",
            icon: <IconChevronUp size={16} />,
            active: false,
            onClick: () => handleMoveSlide("up"),
          },
          {
            id: "move-down",
            label: "Move slide down",
            icon: <IconChevronDown size={16} />,
            active: false,
            onClick: () => handleMoveSlide("down"),
          },
          {
            id: "edit-toggle",
            label: editing ? "Preview" : "Edit",
            icon: editing ? <IconEye size={16} /> : <IconPencil size={16} />,
            active: editing,
            onClick: () => setEditing((e) => !e),
          },
          {
            id: "delete-slide",
            label: "Delete slide",
            icon: <IconTrash size={16} />,
            active: false,
            onClick: handleDeleteSlide,
          },
        ]
      : undefined;
  }

  // ── Single render tree — one PageHeader, conditional body below ─────────────
  return (
    <div
      data-ocid="presentations.main_panel"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        minHeight: 0,
        background: COLORS.surface.panel3,
      }}
    >
      {/* THE single PageHeader — always rendered here, never in branches */}
      <PageHeader
        title={headerTitle}
        subtitle={saveStatus || headerSubtitle}
        primaryAction={headerAction}
        viewControls={headerViewControls}
        stats={[
          { label: "Decks", value: presentations.length },
          { label: "Slides", value: presentations.length * 5 },
        ]}
      />

      {/* ── Conditional body ───────────────────────────────────────────────── */}
      {presentations.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EmptyModuleState
            icon={<IconPresentation size={48} />}
            accent={accent}
            title="No presentations yet"
            description="Create your first presentation to get started."
            data-ocid="presentations.empty_state"
          />
        </div>
      ) : !selectedPresId || !presentation ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: SPACING[4],
          }}
        >
          <div
            style={{
              fontSize: TYPOGRAPHY.sizes.body,
              color: COLORS.text.tertiary,
            }}
          >
            Select a presentation from the sidebar to view and edit slides
          </div>
        </div>
      ) : (
        /* Split: thumbnails left, editor right */
        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* Left: slide thumbnails */}
          <div
            style={{
              width: 220,
              minWidth: 220,
              maxWidth: 220,
              flexShrink: 0,
              borderRight: `1px solid ${COLORS.border.default}`,
              background: COLORS.surface.panel2,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            data-ocid="presentations.slide_list"
          >
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: `${SPACING[2]}px 0`,
              }}
            >
              {slidesLoading ? (
                <div
                  style={{
                    padding: SPACING[4],
                    fontSize: TYPOGRAPHY.sizes.small,
                    color: COLORS.text.tertiary,
                    textAlign: "center",
                  }}
                >
                  Loading slides…
                </div>
              ) : slides.length === 0 ? (
                <div
                  style={{
                    paddingTop: SPACING[4],
                    paddingBottom: SPACING[4],
                    paddingLeft: SPACING[3],
                    paddingRight: SPACING[3],
                    fontSize: TYPOGRAPHY.sizes.small,
                    color: COLORS.text.tertiary,
                    textAlign: "center",
                  }}
                >
                  No slides yet
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {slides.map((slide, i) => (
                    <SlideThumbnail
                      key={String(slide.id)}
                      slide={slide}
                      index={i}
                      selected={Number(slide.id) === selectedSlideId}
                      onClick={() => {
                        setSelectedSlideId(Number(slide.id));
                        setEditing(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            {showAddForm && (
              <AddSlideForm
                onCreate={handleNewSlide}
                onCancel={() => setShowAddForm(false)}
              />
            )}
          </div>

          {/* Right: slide preview / editor */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: SPACING[6],
              paddingBottom: SPACING[6],
              paddingLeft: SPACING[6],
              paddingRight: SPACING[6],
              gap: SPACING[4],
            }}
          >
            {!selectedSlide ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.text.tertiary,
                  fontSize: TYPOGRAPHY.sizes.body,
                }}
              >
                Select a slide to view or edit
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 0,
                  width: "100%",
                  maxWidth: 800,
                }}
              >
                {editing ? (
                  <SlideEditor
                    slide={selectedSlide}
                    onChange={handleUpdateSlide}
                  />
                ) : (
                  <SlideCard
                    slide={selectedSlide}
                    index={selectedIndex}
                    total={slides.length}
                    onChange={handleUpdateSlide}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Wrapped exports consumed by Layout.tsx ──────────────────────────────────

export function MainPanel() {
  return <MainPanelInner />;
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function PresentationsPage() {
  return (
    <>
      <SecondaryPanel />
      <MainPanelInner />
    </>
  );
}
