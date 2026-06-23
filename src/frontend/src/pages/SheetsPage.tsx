import {
  DsButton,
  DsIconButton,
  NavItem,
  PageHeader,
  SectionLabel,
} from "@/components/ds";
import {
  useClearSheetCell,
  useCreateSheet,
  useRenameSheet,
  useSetSheetCell,
  useSheetCells,
  useSheets,
} from "@/hooks/useBackend";
import {
  COLORS,
  GAP_XS,
  RADII,
  SHEET_CELL_HEIGHT,
  SHEET_CELL_WIDTH,
  SHEET_ROW_NUM_WIDTH,
  SPACING,
  TAB_BAR_HEIGHT,
  TAB_HEIGHT,
  TAB_PAD_H,
  TRANSITIONS,
  TYPOGRAPHY,
} from "@/tokens";
import { IconPlus, IconTable } from "@tabler/icons-react";
import type React from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const accent = COLORS.modules.sheets as string;
// Tab sizes come from shared token constants
const TAB_H = TAB_HEIGHT;
const TAB_BAR_H = TAB_BAR_HEIGHT;

// ─── Shared active sheet state ───────────────────────────────────────────────

let _activeSheetId: number | null = null;
const _sheetListeners = new Set<() => void>();

function _setActiveSheetId(id: number | null) {
  if (_activeSheetId !== id) {
    _activeSheetId = id;
    for (const l of _sheetListeners) l();
  }
}

function _subscribeSheets(cb: () => void) {
  _sheetListeners.add(cb);
  return () => _sheetListeners.delete(cb);
}

function useActiveSheetId() {
  return useSyncExternalStore(
    _subscribeSheets,
    () => _activeSheetId,
    () => _activeSheetId,
  );
}

// ─── Types & Constants ─────────────────────────────────────────────────────────

type CellKey = `${number}-${number}`;

const NUM_ROWS = 50;
const NUM_COLS = 26;
const CELL_WIDTH = SHEET_CELL_WIDTH;
const CELL_HEIGHT = SHEET_CELL_HEIGHT;
const ROW_NUM_WIDTH = SHEET_ROW_NUM_WIDTH;

function colLetter(colIdx: number): string {
  let result = "";
  let n = colIdx;
  do {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return result;
}

// ─── Cell component ───────────────────────────────────────────────────────────

interface CellProps {
  row: number;
  col: number;
  value: string;
  isSelected: boolean;
  isEditing: boolean;
  initialChar?: string;
  onSelect: (row: number, col: number) => void;
  onEdit: (row: number, col: number) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onKeyNav: (e: React.KeyboardEvent, row: number, col: number) => void;
}

function Cell({
  row,
  col,
  value,
  isSelected,
  isEditing,
  initialChar,
  onSelect,
  onEdit,
  onCommit,
  onCancel,
  onKeyNav,
}: CellProps) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft from value whenever we enter edit mode
  // If initialChar is provided (typed key), seed with that char instead
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally only depends on isEditing to avoid re-seeding
  useEffect(() => {
    if (isEditing) {
      const seed = initialChar !== undefined ? initialChar : value;
      setDraft(seed);
      // Move cursor to end after seeding
      requestAnimationFrame(() => {
        if (inputRef.current) {
          const len = seed.length;
          inputRef.current.setSelectionRange(len, len);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        onCommit(draft);
        onKeyNav(e, row, col);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Tab") {
        e.preventDefault();
        onCommit(draft);
        onKeyNav(e, row, col);
      }
    },
    [draft, onCommit, onCancel, onKeyNav, row, col],
  );

  const isHeaderRow = row === 0;

  return (
    <div
      tabIndex={-1}
      style={{
        width: CELL_WIDTH,
        minWidth: CELL_WIDTH,
        height: CELL_HEIGHT,
        boxSizing: "border-box",
        borderRight: `1px solid ${COLORS.border.default}`,
        display: "flex",
        alignItems: "center",
        position: "relative",
        background: isSelected
          ? `${accent}14`
          : isHeaderRow
            ? COLORS.neutral[50]
            : COLORS.surface.panel3,
        boxShadow: isSelected ? `inset 0 0 0 2px ${accent}` : "none",
        overflow: "hidden",
        flexShrink: 0,
        cursor: "default",
      }}
      onClick={() => onSelect(row, col)}
      onDoubleClick={() => onEdit(row, col)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(row, col);
      }}
      data-ocid={row < 3 && col < 4 ? `sheets.cell.${row}-${col}` : undefined}
    >
      {isEditing ? (
        <input
          // biome-ignore lint/a11y/noAutofocus: spreadsheet cell enters edit mode on click, autofocus is correct UX
          autoFocus
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onCommit(draft)}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            inset: 0,
            border: "none",
            outline: `2px solid ${accent}`,
            outlineOffset: -2,
            padding: `0 ${SPACING[1]}px`,
            fontSize: TYPOGRAPHY.sizes.caption,
            fontFamily: "inherit",
            background: COLORS.surface.panel3,
            color: COLORS.text.primary,
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            zIndex: 2,
          }}
        />
      ) : (
        <span
          style={{
            fontSize: TYPOGRAPHY.sizes.caption,
            color: COLORS.text.secondary,
            fontWeight: isHeaderRow
              ? TYPOGRAPHY.weights.semibold
              : TYPOGRAPHY.weights.regular,
            padding: `0 ${SPACING[1]}px`,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
            userSelect: "none",
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

// ─── Spreadsheet grid ─────────────────────────────────────────────────────────

interface SpreadsheetGridProps {
  cells: Record<CellKey, string>;
  onCellChange: (row: number, col: number, value: string) => void;
}

function SpreadsheetGrid({ cells, onCellChange }: SpreadsheetGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
    initialChar?: string;
  } | null>(null);

  // Single click → immediately enter edit mode
  const handleSelect = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    setEditingCell({ row, col });
  }, []);

  // handleEdit is kept for API compatibility but delegates to handleSelect
  const handleEdit = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    setEditingCell({ row, col });
  }, []);

  const handleCommit = useCallback(
    (row: number, col: number, value: string) => {
      onCellChange(row, col, value);
      setEditingCell(null);
    },
    [onCellChange],
  );

  const handleCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleKeyNav = useCallback(
    (e: React.KeyboardEvent, row: number, col: number) => {
      let nextRow = row;
      let nextCol = col;
      if (e.key === "Enter") nextRow = Math.min(row + 1, NUM_ROWS - 1);
      else if (e.key === "Tab") {
        if (e.shiftKey) nextCol = Math.max(col - 1, 0);
        else nextCol = Math.min(col + 1, NUM_COLS - 1);
      }
      setSelectedCell({ row: nextRow, col: nextCol });
      setEditingCell(null);
      // Restore focus to grid so keyboard navigation continues
      requestAnimationFrame(() => {
        gridRef.current?.focus();
      });
    },
    [],
  );

  // handleGridKeyDown must be defined before handleGridKeyDownExtended
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // While a cell is being edited, let the input handle all keyboard events
      if (editingCell) return;
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      let handled = false;
      if (e.key === "ArrowDown") {
        setSelectedCell({ row: Math.min(row + 1, NUM_ROWS - 1), col });
        handled = true;
      } else if (e.key === "ArrowUp") {
        setSelectedCell({ row: Math.max(row - 1, 0), col });
        handled = true;
      } else if (e.key === "ArrowRight") {
        setSelectedCell({ row, col: Math.min(col + 1, NUM_COLS - 1) });
        handled = true;
      } else if (e.key === "ArrowLeft") {
        setSelectedCell({ row, col: Math.max(col - 1, 0) });
        handled = true;
      } else if (e.key === "F2" || e.key === "Enter") {
        setEditingCell({ row, col });
        handled = true;
      } else if (e.key === "Delete" || e.key === "Backspace") {
        onCellChange(row, col, "");
        handled = true;
      }
      if (handled) e.preventDefault();
    },
    [editingCell, selectedCell, onCellChange],
  );

  // Typing while a cell is selected → immediately enters edit mode with typed char
  const handleGridKeyDownExtended = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (editingCell) return;
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      // Printable character keys start edit mode immediately, seeding with the typed char
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setEditingCell({ row, col, initialChar: e.key });
        return;
      }
      handleGridKeyDown(e);
    },
    [editingCell, selectedCell, handleGridKeyDown],
  );

  useEffect(() => {
    if (!editingCell && gridRef.current) {
      gridRef.current.focus();
    }
  }, [editingCell]);

  return (
    <div
      ref={gridRef}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: spreadsheet requires keyboard focus management
      tabIndex={0}
      aria-label="Spreadsheet"
      aria-rowcount={NUM_ROWS}
      aria-colcount={NUM_COLS}
      onKeyDown={handleGridKeyDownExtended}
      style={{
        flex: 1,
        overflow: "auto",
        outline: "none",
        background: COLORS.surface.panel3,
      }}
      data-ocid="sheets.grid"
    >
      <div style={{ minWidth: ROW_NUM_WIDTH + NUM_COLS * CELL_WIDTH }}>
        {/* Column header row */}
        <div
          style={{
            display: "flex",
            position: "sticky",
            top: 0,
            zIndex: 10,
            borderBottom: `1px solid ${COLORS.border.strong}`,
          }}
        >
          <div
            style={{
              width: ROW_NUM_WIDTH,
              minWidth: ROW_NUM_WIDTH,
              height: CELL_HEIGHT,
              borderRight: `1px solid ${COLORS.border.default}`,
              background: COLORS.neutral[50],
              flexShrink: 0,
            }}
          />
          {Array.from({ length: NUM_COLS }, (_, c) => (
            <div
              key={colLetter(c)}
              style={{
                width: CELL_WIDTH,
                minWidth: CELL_WIDTH,
                height: CELL_HEIGHT,
                borderRight: `1px solid ${COLORS.border.default}`,
                background: COLORS.neutral[50],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: TYPOGRAPHY.sizes.caption,
                  fontWeight: TYPOGRAPHY.weights.semibold,
                  color:
                    selectedCell?.col === c ? accent : COLORS.text.tertiary,
                  userSelect: "none",
                }}
              >
                {colLetter(c)}
              </span>
            </div>
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: NUM_ROWS }, (_, r) => (
          <div
            key={`row-${r + 1}`}
            style={{
              display: "flex",
              borderBottom: `1px solid ${COLORS.border.subtle}`,
            }}
            data-ocid={r < 3 ? `sheets.row.${r + 1}` : undefined}
          >
            <div
              style={{
                width: ROW_NUM_WIDTH,
                minWidth: ROW_NUM_WIDTH,
                height: CELL_HEIGHT,
                borderRight: `1px solid ${COLORS.border.default}`,
                background:
                  selectedCell?.row === r ? `${accent}0D` : COLORS.neutral[50],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: TYPOGRAPHY.sizes.caption,
                  fontWeight: TYPOGRAPHY.weights.semibold,
                  color:
                    selectedCell?.row === r ? accent : COLORS.text.tertiary,
                  userSelect: "none",
                }}
              >
                {r + 1}
              </span>
            </div>

            {Array.from({ length: NUM_COLS }, (_, c) => {
              const key: CellKey = `${r}-${c}`;
              return (
                <Cell
                  key={key}
                  row={r}
                  col={c}
                  value={cells[key] ?? ""}
                  isSelected={
                    selectedCell?.row === r && selectedCell?.col === c
                  }
                  isEditing={editingCell?.row === r && editingCell?.col === c}
                  initialChar={
                    editingCell?.row === r && editingCell?.col === c
                      ? editingCell.initialChar
                      : undefined
                  }
                  onSelect={handleSelect}
                  onEdit={handleEdit}
                  onCommit={(val) => handleCommit(r, c, val)}
                  onCancel={handleCancel}
                  onKeyNav={handleKeyNav}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sheet tab bar ────────────────────────────────────────────────────────────

interface SheetTabBarProps {
  sheets: Array<{ id: number; name: string }>;
  activeSheetId: number | null;
  onSelectSheet: (id: number) => void;
  onAddSheet: () => void;
  onRenameSheet: (id: number, name: string) => void;
}

function SheetTabBar({
  sheets,
  activeSheetId,
  onSelectSheet,
  onAddSheet,
  onRenameSheet,
}: SheetTabBarProps) {
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleDoubleClick = (id: number, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
  };

  const handleRenameCommit = () => {
    if (renamingId !== null && renameValue.trim()) {
      onRenameSheet(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameCommit();
    } else if (e.key === "Escape") {
      setRenamingId(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${COLORS.border.default}`,
        background: COLORS.neutral[50],
        height: TAB_BAR_H,
        paddingLeft: SPACING[2],
        gap: SPACING[1],
        flexShrink: 0,
        overflowX: "auto",
      }}
      data-ocid="sheets.tab_bar"
    >
      {sheets.map((sheet) => {
        const isActive = activeSheetId === sheet.id;
        const isRenaming = renamingId === sheet.id;
        return (
          <button
            key={sheet.id}
            type="button"
            onClick={() => onSelectSheet(sheet.id)}
            onDoubleClick={() => handleDoubleClick(sheet.id, sheet.name)}
            style={{
              height: TAB_H,
              padding: `0 ${TAB_PAD_H}px`,
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: isActive
                ? TYPOGRAPHY.weights.medium
                : TYPOGRAPHY.weights.regular,
              color: isActive ? COLORS.text.primary : COLORS.text.secondary,
              background: isActive ? COLORS.surface.panel3 : "transparent",
              border: "none",
              borderBottom: isActive
                ? `2px solid ${COLORS.text.primary}`
                : "2px solid transparent",
              borderRadius: 0,
              cursor: "pointer",
              userSelect: "none",
              transition: `color ${TRANSITIONS.fast}, background ${TRANSITIONS.fast}, border-bottom-color ${TRANSITIONS.fast}`,
              whiteSpace: "nowrap",
              outline: "none",
              position: "relative",
            }}
            data-ocid={`sheets.tab.${sheet.id}`}
          >
            {isRenaming ? (
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameCommit}
                onKeyDown={handleRenameKeyDown}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 80,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: TYPOGRAPHY.sizes.caption,
                  fontFamily: "inherit",
                  color: COLORS.text.primary,
                  padding: 0,
                }}
              />
            ) : (
              sheet.name
            )}
          </button>
        );
      })}
      <DsIconButton
        size="sm"
        variant="ghost"
        onClick={onAddSheet}
        title="Add sheet"
        aria-label="Add sheet"
        data-ocid="sheets.add_sheet_button"
      >
        <IconPlus size={14} />
      </DsIconButton>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptySheetsState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: SPACING[4],
      }}
      data-ocid="sheets.empty_state"
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: RADII.lg,
          background: `${accent}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconTable size={32} color={accent} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: TYPOGRAPHY.sizes.body,
            fontWeight: TYPOGRAPHY.weights.semibold,
            color: COLORS.text.primary,
            margin: 0,
          }}
        >
          No sheets yet
        </p>
        <p
          style={{
            fontSize: TYPOGRAPHY.sizes.caption,
            color: COLORS.text.secondary,
            margin: `${SPACING[1]}px 0 0`,
          }}
        >
          Create a sheet to start tracking data
        </p>
      </div>
      <DsButton
        variant="primary"
        size="sm"
        onClick={onCreate}
        data-ocid="sheets.empty_create_button"
      >
        Create sheet
      </DsButton>
    </div>
  );
}

// ─── Secondary Panel ──────────────────────────────────────────────────────────

export function SecondaryPanel() {
  const { data: sheets = [], isLoading } = useSheets();
  const activeSheetId = useActiveSheetId();

  useEffect(() => {
    if (sheets.length > 0 && activeSheetId === null) {
      _setActiveSheetId(Number(sheets[0].id));
    }
  }, [sheets, activeSheetId]);

  return (
    <div
      data-ocid="sheets.secondary_panel"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: SPACING[2],
          paddingBottom: SPACING[2],
        }}
      >
        <SectionLabel label="Sheets" />
        <div style={{ display: "flex", flexDirection: "column", gap: GAP_XS }}>
          {isLoading ? (
            <div
              style={{
                padding: SPACING[3],
                color: COLORS.text.tertiary,
                fontSize: TYPOGRAPHY.sizes.caption,
              }}
            >
              Loading...
            </div>
          ) : (
            sheets.map((sheet) => (
              <NavItem
                key={String(sheet.id)}
                label={sheet.name}
                accent={accent}
                selected={activeSheetId === Number(sheet.id)}
                onClick={() => _setActiveSheetId(Number(sheet.id))}
                data-ocid={`sheets.nav.${sheet.id}`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

const SAVE_FEEDBACK_MS = 1500;

export function MainPanel() {
  const { data: sheets = [], isLoading: sheetsLoading } = useSheets();
  const activeSheetId = useActiveSheetId();
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (!saveStatus) return;
    const timer = setTimeout(() => setSaveStatus(""), SAVE_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [saveStatus]);
  const { data: sheetCells = [], isLoading: cellsLoading } =
    useSheetCells(activeSheetId);
  const createSheet = useCreateSheet();
  const renameSheet = useRenameSheet();
  const setSheetCell = useSetSheetCell();
  const clearSheetCell = useClearSheetCell();

  const [localCells, setLocalCells] = useState<Record<CellKey, string>>({});
  const debounceRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const hasSeededRef = useRef(false);

  useEffect(() => {
    if (sheets.length > 0 && activeSheetId === null) {
      _setActiveSheetId(Number(sheets[0].id));
    }
  }, [sheets, activeSheetId]);

  useEffect(() => {
    const map: Record<CellKey, string> = {};
    for (const cell of sheetCells) {
      const key: CellKey = `${Number(cell.row)}-${Number(cell.col)}`;
      map[key] = cell.value;
    }
    setLocalCells(map);
  }, [sheetCells]);

  // Seed sample budget data on first load when cells are empty
  useEffect(() => {
    if (
      activeSheetId !== null &&
      !cellsLoading &&
      !hasSeededRef.current &&
      sheetCells.length === 0
    ) {
      hasSeededRef.current = true;
      const seedData: Array<{ row: number; col: number; value: string }> = [
        // Row 0 — headers
        { row: 0, col: 0, value: "Category" },
        { row: 0, col: 1, value: "January" },
        { row: 0, col: 2, value: "February" },
        { row: 0, col: 3, value: "March" },
        { row: 0, col: 4, value: "Q1 Total" },
        { row: 0, col: 5, value: "Annual Budget" },
        // Row 1 — Salaries
        { row: 1, col: 0, value: "Salaries" },
        { row: 1, col: 1, value: "45000" },
        { row: 1, col: 2, value: "46000" },
        { row: 1, col: 3, value: "45500" },
        { row: 1, col: 4, value: "136500" },
        { row: 1, col: 5, value: "540000" },
        // Row 2 — Marketing
        { row: 2, col: 0, value: "Marketing" },
        { row: 2, col: 1, value: "8500" },
        { row: 2, col: 2, value: "9200" },
        { row: 2, col: 3, value: "7800" },
        { row: 2, col: 4, value: "25500" },
        { row: 2, col: 5, value: "96000" },
        // Row 3 — Equipment
        { row: 3, col: 0, value: "Equipment" },
        { row: 3, col: 1, value: "3200" },
        { row: 3, col: 2, value: "1500" },
        { row: 3, col: 3, value: "4800" },
        { row: 3, col: 4, value: "9500" },
        { row: 3, col: 5, value: "36000" },
        // Row 4 — Software
        { row: 4, col: 0, value: "Software" },
        { row: 4, col: 1, value: "2100" },
        { row: 4, col: 2, value: "2100" },
        { row: 4, col: 3, value: "2100" },
        { row: 4, col: 4, value: "6300" },
        { row: 4, col: 5, value: "25200" },
        // Row 5 — Travel
        { row: 5, col: 0, value: "Travel" },
        { row: 5, col: 1, value: "1800" },
        { row: 5, col: 2, value: "2400" },
        { row: 5, col: 3, value: "1200" },
        { row: 5, col: 4, value: "5400" },
        { row: 5, col: 5, value: "21600" },
        // Row 6 — Office
        { row: 6, col: 0, value: "Office" },
        { row: 6, col: 1, value: "950" },
        { row: 6, col: 2, value: "1100" },
        { row: 6, col: 3, value: "875" },
        { row: 6, col: 4, value: "2925" },
        { row: 6, col: 5, value: "11700" },
        // Row 7 — Training
        { row: 7, col: 0, value: "Training" },
        { row: 7, col: 1, value: "500" },
        { row: 7, col: 2, value: "0" },
        { row: 7, col: 3, value: "2500" },
        { row: 7, col: 4, value: "3000" },
        { row: 7, col: 5, value: "12000" },
        // Row 8 — Miscellaneous
        { row: 8, col: 0, value: "Miscellaneous" },
        { row: 8, col: 1, value: "620" },
        { row: 8, col: 2, value: "480" },
        { row: 8, col: 3, value: "730" },
        { row: 8, col: 4, value: "1830" },
        { row: 8, col: 5, value: "7320" },
      ];

      for (const cell of seedData) {
        setSheetCell.mutate({
          sheetId: activeSheetId,
          row: cell.row,
          col: cell.col,
          value: cell.value,
        });
      }
    }
  }, [activeSheetId, cellsLoading, sheetCells.length, setSheetCell]);

  useEffect(() => {
    return () => {
      for (const timeout of debounceRef.current.values()) {
        clearTimeout(timeout);
      }
      debounceRef.current.clear();
    };
  }, []);

  const activeSheet = sheets.find((s) => Number(s.id) === activeSheetId);

  const handleCellChange = useCallback(
    (row: number, col: number, value: string) => {
      const key: CellKey = `${row}-${col}`;
      setLocalCells((prev) => ({ ...prev, [key]: value }));
      setSaveStatus("Saved ✓");

      const existingTimeout = debounceRef.current.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        if (activeSheetId !== null) {
          if (value === "") {
            clearSheetCell.mutate({ sheetId: activeSheetId, row, col });
          } else {
            setSheetCell.mutate({
              sheetId: activeSheetId,
              row,
              col,
              value,
            });
          }
        }
        debounceRef.current.delete(key);
      }, 300);

      debounceRef.current.set(key, timeout);
    },
    [activeSheetId, setSheetCell, clearSheetCell],
  );

  const handleAddSheet = useCallback(() => {
    const name = `Sheet${sheets.length + 1}`;
    createSheet.mutate(name, {
      onSuccess: (newSheet) => {
        _setActiveSheetId(Number(newSheet.id));
      },
    });
  }, [sheets.length, createSheet]);

  const handleRenameSheet = useCallback(
    (id: number, name: string) => {
      renameSheet.mutate({ id, name });
    },
    [renameSheet],
  );

  // Compute header props — used in both loading and ready states
  const hasSheets = sheets.length > 0;
  const headerTitle = sheetsLoading
    ? "Sheets"
    : hasSheets
      ? (activeSheet?.name ?? "Sheet")
      : "Sheets";
  const headerSubtitle = sheetsLoading
    ? "Loading..."
    : hasSheets
      ? `${NUM_ROWS} rows · ${NUM_COLS} columns`
      : "No sheets yet";

  return (
    <div
      data-ocid="sheets.main_panel"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <PageHeader
        title={headerTitle}
        subtitle={saveStatus || headerSubtitle}
        primaryAction={{
          label: "New Sheet",
          onClick: handleAddSheet,
          icon: <IconPlus size={14} />,
        }}
        stats={[
          { label: "Sheets", value: (sheets ?? []).length },
          { label: "Total rows", value: (sheets ?? []).length * 50 },
          { label: "Last edited", value: "Today" },
        ]}
      />
      {sheetsLoading ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: COLORS.text.tertiary,
              fontSize: TYPOGRAPHY.sizes.caption,
            }}
          >
            Loading sheets...
          </div>
        </div>
      ) : !hasSheets ? (
        <EmptySheetsState onCreate={handleAddSheet} />
      ) : (
        <>
          <SheetTabBar
            sheets={sheets.map((s) => ({ id: Number(s.id), name: s.name }))}
            activeSheetId={activeSheetId}
            onSelectSheet={_setActiveSheetId}
            onAddSheet={handleAddSheet}
            onRenameSheet={handleRenameSheet}
          />
          {cellsLoading ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  color: COLORS.text.tertiary,
                  fontSize: TYPOGRAPHY.sizes.caption,
                }}
              >
                Loading cells...
              </div>
            </div>
          ) : (
            <SpreadsheetGrid
              cells={localCells}
              onCellChange={handleCellChange}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function SheetsPage() {
  return null;
}
