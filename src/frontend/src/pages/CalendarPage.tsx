import {
  DsButton,
  DsIconButton,
  DsInput,
  DsSelect,
  DsToggle,
  EmptyModuleState,
  NavItem,
  PageHeader,
  SectionLabel,
} from "@/components/ds";
import {
  useCalendarEvents,
  useCalendars,
  useCreateCalendar,
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useToggleCalendarVisibility,
  useUpdateCalendarEvent,
} from "@/hooks/useBackend";
import { useCurrentRole } from "@/hooks/useWorkspace";
import {
  COLORS,
  ICON_XS,
  INPUT_HEIGHT,
  RADII,
  SHADOWS,
  SPACING,
  TRANSITIONS,
  TYPOGRAPHY,
} from "@/tokens";
import {
  IconCalendar,
  IconCalendarEvent,
  IconEye,
  IconEyeOff,
  IconLayoutGrid,
  IconLayoutList,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { type Ref, useEffect, useRef, useState } from "react";

const accent = COLORS.modules.calendar;

// ─── Types ────────────────────────────────────────────────────────────────────

type CalView = "month" | "week" | "day";

// ─── Shared view state (syncs SecondaryPanel + MainPanel) ───────────────────

let _currentView: CalView = "month";
const _viewSubs = new Set<() => void>();

function setCurrentView(v: CalView) {
  _currentView = v;
  for (const cb of _viewSubs) cb();
}

function useCurrentView() {
  const [v, setV] = useState(_currentView);
  useEffect(() => {
    const cb = () => setV(_currentView);
    _viewSubs.add(cb);
    return () => {
      _viewSubs.delete(cb);
    };
  }, []);
  return [v, setCurrentView] as const;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(d: Date): boolean {
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function tsToDate(ts: bigint): Date {
  return new Date(Number(ts) / 1_000_000);
}

function dateToTs(d: Date): bigint {
  return BigInt(d.getTime()) * 1_000_000n;
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

// ─── Inline Event Form ────────────────────────────────────────────────────────

function InlineEventForm({
  date,
  calendars,
  onSave,
  onCancel,
}: {
  date: Date;
  calendars: { id: bigint; name: string; color: string }[];
  onSave: (e: {
    title: string;
    description: string;
    startTime: bigint;
    endTime: bigint;
    allDay: boolean;
    color: string;
    calendarId: number;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [calendarId, setCalendarId] = useState(Number(calendars[0]?.id ?? 0));

  const dateStr = toDateStr(date);

  function handleSave() {
    if (!title.trim()) return;
    const start = allDay
      ? new Date(`${dateStr}T00:00:00`)
      : new Date(`${dateStr}T${startTime}:00`);
    const end = allDay
      ? new Date(`${dateStr}T23:59:59`)
      : new Date(`${dateStr}T${endTime}:00`);
    const cal =
      calendars.find((c) => Number(c.id) === calendarId) ?? calendars[0];
    onSave({
      title: title.trim(),
      description: "",
      startTime: dateToTs(start),
      endTime: dateToTs(end),
      allDay,
      color: cal?.color ?? accent,
      calendarId: Number(cal?.id ?? 0),
    });
  }

  return (
    <div
      style={{
        background: COLORS.surface.panel3,
        border: `1px solid ${COLORS.border.default}`,
        borderRadius: RADII.lg,
        padding: SPACING[3],
        display: "flex",
        flexDirection: "column",
        gap: SPACING[2],
        maxWidth: 320,
        boxShadow: SHADOWS.medium,
      }}
      data-ocid="calendar.inline_form"
    >
      <DsInput
        placeholder="Event title"
        value={title}
        onChange={setTitle}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onCancel();
        }}
        style={{ fontSize: TYPOGRAPHY.sizes.small }}
        data-ocid="calendar.event_title_input"
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING[2],
          fontSize: TYPOGRAPHY.sizes.caption,
          color: COLORS.text.secondary,
        }}
      >
        <DsToggle
          checked={allDay}
          onChange={setAllDay}
          accentColor={accent}
          data-ocid="calendar.allday_toggle"
        />
        <span>All day</span>
      </div>
      {!allDay && (
        <div style={{ display: "flex", gap: SPACING[2] }}>
          <DsInput
            type="time"
            value={startTime}
            onChange={setStartTime}
            style={{ flex: 1 }}
            data-ocid="calendar.start_time_input"
          />
          <DsInput
            type="time"
            value={endTime}
            onChange={setEndTime}
            style={{ flex: 1 }}
            data-ocid="calendar.end_time_input"
          />
        </div>
      )}
      <DsSelect
        value={String(calendarId)}
        onChange={(v) => setCalendarId(Number(v))}
        options={calendars.map((c) => ({
          value: String(Number(c.id)),
          label: c.name,
        }))}
        style={{ fontSize: TYPOGRAPHY.sizes.small }}
        data-ocid="calendar.calendar_select"
      />
      <div style={{ display: "flex", gap: SPACING[1] }}>
        <DsButton
          variant="primary"
          size="sm"
          onClick={handleSave}
          style={{ flex: 1 }}
          data-ocid="calendar.save_event_button"
        >
          Add
        </DsButton>
        <DsIconButton
          size="md"
          variant="ghost"
          type="button"
          onClick={onCancel}
          title="Cancel"
          aria-label="Cancel event"
          data-ocid="calendar.cancel_event_button"
        >
          <IconX size={14} />
        </DsIconButton>
      </div>
    </div>
  );
}

// ─── Inline Event Edit Form ──────────────────────────────────────────────────

function InlineEventEditForm({
  event,
  onSave,
  onDelete,
  onCancel,
}: {
  event: {
    id: bigint;
    title: string;
    description: string;
    startTime: bigint;
    endTime: bigint;
    allDay: boolean;
    color: string;
    calendarId: bigint;
  };
  onSave: (updates: {
    id: number;
    title: string;
    description: string;
    startTime: bigint;
    endTime: bigint;
    allDay: boolean;
    color: string;
  }) => void;
  onDelete: (id: number) => void;
  onCancel: () => void;
}) {
  const start = tsToDate(event.startTime);
  const end = tsToDate(event.endTime);
  const dateStr = toDateStr(start);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [startTime, setStartTime] = useState(
    `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
  );
  const [endTime, setEndTime] = useState(
    `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
  );
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleSave() {
    if (!title.trim()) return;
    const s = new Date(`${dateStr}T${startTime}:00`);
    const e = new Date(`${dateStr}T${endTime}:00`);
    onSave({
      id: Number(event.id),
      title: title.trim(),
      description,
      startTime: dateToTs(s),
      endTime: dateToTs(e),
      allDay: event.allDay,
      color: event.color,
    });
  }

  return (
    <div
      style={{
        background: COLORS.surface.panel3,
        border: `1px solid ${COLORS.border.default}`,
        borderRadius: RADII.lg,
        padding: SPACING[3],
        display: "flex",
        flexDirection: "column",
        gap: SPACING[2],
        maxWidth: 360,
        boxShadow: SHADOWS.medium,
      }}
      data-ocid="calendar.edit_event_form"
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
        Edit event
      </div>
      <DsInput
        // biome-ignore lint/a11y/noAutofocus: edit form focuses title on open for immediate editing
        ref={titleRef as Ref<HTMLInputElement>}
        placeholder="Event title"
        value={title}
        onChange={setTitle}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onCancel();
        }}
        style={{ fontSize: TYPOGRAPHY.sizes.small }}
        data-ocid="calendar.edit_event_title_input"
      />
      <DsInput
        placeholder="Description (optional)"
        value={description}
        onChange={setDescription}
        style={{ fontSize: TYPOGRAPHY.sizes.small }}
        data-ocid="calendar.edit_event_description_input"
      />
      {!event.allDay && (
        <div style={{ display: "flex", gap: SPACING[2] }}>
          <DsInput
            type="time"
            value={startTime}
            onChange={setStartTime}
            style={{ flex: 1 }}
            data-ocid="calendar.edit_start_time_input"
          />
          <DsInput
            type="time"
            value={endTime}
            onChange={setEndTime}
            style={{ flex: 1 }}
            data-ocid="calendar.edit_end_time_input"
          />
        </div>
      )}
      <div style={{ display: "flex", gap: SPACING[1] }}>
        <DsButton
          variant="primary"
          size="sm"
          onClick={handleSave}
          style={{ flex: 1 }}
          data-ocid="calendar.save_edit_button"
        >
          Save
        </DsButton>
        <DsButton
          variant="ghost"
          size="sm"
          onClick={onCancel}
          data-ocid="calendar.cancel_edit_button"
        >
          Cancel
        </DsButton>
        <DsButton
          variant="danger"
          size="sm"
          onClick={() => onDelete(Number(event.id))}
          data-ocid="calendar.delete_event_button"
        >
          Delete
        </DsButton>
      </div>
    </div>
  );
}

// ─── Event Pill ───────────────────────────────────────────────────────────────

function EventPill({
  event,
  compact = false,
  onClick,
}: {
  event: { title: string; color: string; startTime: bigint };
  compact?: boolean;
  onClick?: () => void;
}) {
  const start = tsToDate(event.startTime);
  const timeStr = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={`${event.title} · ${timeStr}`}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      style={{
        background: `${event.color}22`,
        borderLeft: `3px solid ${event.color}`,
        borderRadius: `0 ${RADII.sm}px ${RADII.sm}px 0`,
        padding: compact
          ? `${SPACING[0]}px ${SPACING[1]}px`
          : `${SPACING[0]}px ${SPACING[2]}px`,
        fontSize: compact ? TYPOGRAPHY.sizes.micro : TYPOGRAPHY.sizes.caption,
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.medium,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        cursor: onClick ? "pointer" : "default",
        lineHeight: 1.4,
        marginBottom: SPACING[0],
      }}
    >
      {!compact && (
        <span style={{ color: COLORS.text.tertiary, marginRight: SPACING[1] }}>
          {timeStr}
        </span>
      )}
      {event.title}
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

type FullCalendarEvent = {
  id: bigint;
  title: string;
  description: string;
  startTime: bigint;
  endTime: bigint;
  allDay: boolean;
  color: string;
  calendarId: bigint;
};

function MonthView({
  currentMonth,
  events,
  onDayClick,
  addingForDay,
  editingEvent,
  calendars,
  onSaveEvent,
  onCancelAdd,
  onEventClick,
}: {
  currentMonth: Date;
  events: FullCalendarEvent[];
  onDayClick: (d: Date) => void;
  addingForDay: Date | null;
  editingEvent: FullCalendarEvent | null;
  calendars: { id: bigint; name: string; color: string }[];
  onSaveEvent: (e: {
    title: string;
    description: string;
    startTime: bigint;
    endTime: bigint;
    allDay: boolean;
    color: string;
    calendarId: number;
  }) => void;
  onCancelAdd: () => void;
  onEventClick: (ev: FullCalendarEvent) => void;
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({
      date: new Date(year, month - 1, prevMonthDays - firstDay + 1 + i),
      isCurrentMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  while (cells.length < 42) {
    cells.push({
      date: new Date(
        year,
        month + 1,
        cells.length - firstDay - daysInMonth + 1,
      ),
      isCurrentMonth: false,
    });
  }

  function eventsForDay(d: Date) {
    const ds = toDateStr(d);
    return events.filter((e) => toDateStr(tsToDate(e.startTime)) === ds);
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          borderBottom: `1px solid ${COLORS.border.default}`,
        }}
      >
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            style={{
              padding: "6px 8px",
              fontSize: TYPOGRAPHY.sizes.caption,
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: COLORS.text.tertiary,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateRows: "repeat(6, 1fr)",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7)).map(
          (row, ri) => (
            <div
              key={toDateStr(row[0].date)}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                borderBottom:
                  ri < 5 ? `1px solid ${COLORS.border.subtle}` : "none",
              }}
            >
              {row.map((cell, ci) => {
                const ds = toDateStr(cell.date);
                const cellEvents = eventsForDay(cell.date);
                const today = isToday(cell.date);
                return (
                  <button
                    key={ds}
                    type="button"
                    onClick={() => onDayClick(cell.date)}
                    style={{
                      minHeight: SPACING[8] + SPACING[6] + SPACING[4],
                      padding: SPACING[1],
                      paddingTop: SPACING[1],
                      borderRight:
                        ci < 6 ? `1px solid ${COLORS.border.subtle}` : "none",
                      background: today ? `${accent}08` : "transparent",
                      cursor: "pointer",
                      position: "relative",
                      transition: `background ${TRANSITIONS.fast}`,
                      overflow: "hidden",
                      border: "none",
                      textAlign: "left",
                      width: "100%",
                    }}
                    onMouseEnter={(e) => {
                      if (!today)
                        e.currentTarget.style.background =
                          COLORS.interactive.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = today
                        ? `${accent}08`
                        : "transparent";
                    }}
                    data-ocid={`calendar.day.${ds}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          width: ICON_XS,
                          height: ICON_XS,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          fontSize: TYPOGRAPHY.sizes.caption,
                          fontWeight: today
                            ? TYPOGRAPHY.weights.semibold
                            : TYPOGRAPHY.weights.regular,
                          background: today ? accent : "transparent",
                          color: today
                            ? COLORS.neutral[0]
                            : cell.isCurrentMonth
                              ? COLORS.text.primary
                              : COLORS.text.tertiary,
                          lineHeight: 1,
                        }}
                      >
                        {cell.date.getDate()}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      {cellEvents.slice(0, 3).map((ev) => (
                        <EventPill
                          key={`${String(ev.startTime)}-${ev.title}`}
                          event={ev}
                          compact
                          onClick={() => onEventClick(ev)}
                        />
                      ))}
                      {cellEvents.length > 3 && (
                        <div
                          style={{
                            fontSize: TYPOGRAPHY.sizes.micro,
                            color: COLORS.text.tertiary,
                            paddingLeft: 4,
                          }}
                        >
                          +{cellEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ),
        )}
      </div>
      {(addingForDay || editingEvent) && (
        <div
          style={{
            padding: SPACING[3],
            borderTop: `1px solid ${COLORS.border.default}`,
            background: COLORS.surface.panel3,
          }}
        >
          {addingForDay && !editingEvent && (
            <InlineEventForm
              date={addingForDay}
              calendars={calendars}
              onSave={(e) => {
                onSaveEvent(e);
                onCancelAdd();
              }}
              onCancel={onCancelAdd}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({
  currentMonth,
  events,
  onEventClick,
}: {
  currentMonth: Date;
  events: FullCalendarEvent[];
  onEventClick: (ev: FullCalendarEvent) => void;
}) {
  const weekStart = new Date(currentMonth);
  weekStart.setDate(currentMonth.getDate() - currentMonth.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: SPACING[4] }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: SPACING[2],
        }}
      >
        {days.map((d) => {
          const ds = toDateStr(d);
          const dayEvents = events.filter(
            (e) => toDateStr(tsToDate(e.startTime)) === ds,
          );
          return (
            <div
              key={ds}
              style={{
                border: `1px solid ${COLORS.border.default}`,
                borderRadius: RADII.lg,
                padding: SPACING[3],
                background: isToday(d) ? `${accent}08` : COLORS.surface.panel3,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: SPACING[2] }}>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.sizes.caption,
                    color: COLORS.text.tertiary,
                    textTransform: "uppercase",
                  }}
                >
                  {DAY_NAMES[d.getDay()]}
                </div>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.sizes.h2,
                    fontWeight: TYPOGRAPHY.weights.semibold,
                    color: isToday(d) ? accent : COLORS.text.primary,
                  }}
                >
                  {d.getDate()}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: SPACING[1],
                }}
              >
                {dayEvents.length === 0 && (
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.sizes.caption,
                      color: COLORS.text.tertiary,
                      textAlign: "center",
                    }}
                  >
                    No events
                  </div>
                )}
                {dayEvents.map((ev) => (
                  <EventPill
                    key={`${String(ev.startTime)}-${ev.title}`}
                    event={ev}
                    onClick={() => onEventClick(ev)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day View ─────────────────────────────────────────────────────────────────

function DayView({
  currentMonth,
  events,
  onEventClick,
}: {
  currentMonth: Date;
  events: FullCalendarEvent[];
  onEventClick: (ev: FullCalendarEvent) => void;
}) {
  const ds = toDateStr(currentMonth);
  const dayEvents = events
    .filter((e) => toDateStr(tsToDate(e.startTime)) === ds)
    .sort((a, b) => Number(a.startTime - b.startTime));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: SPACING[4] }}>
      <div
        style={{
          fontSize: TYPOGRAPHY.sizes.h2,
          fontWeight: TYPOGRAPHY.weights.semibold,
          color: COLORS.text.primary,
          marginBottom: SPACING[4],
        }}
      >
        {DAY_NAMES[currentMonth.getDay()]},{" "}
        {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getDate()}
      </div>
      {dayEvents.length === 0 ? (
        <EmptyModuleState
          icon={<IconCalendarEvent size={32} />}
          accent={accent}
          title="No events"
          description="This day is free. Click a day in the month view to add an event."
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: SPACING[2],
          }}
        >
          {dayEvents.map((ev) => (
            <button
              key={`${String(ev.startTime)}-${ev.title}`}
              type="button"
              onClick={() => onEventClick(ev)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: SPACING[3],
                padding: SPACING[3],
                border: `1px solid ${COLORS.border.default}`,
                borderRadius: RADII.lg,
                background: COLORS.surface.panel3,
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                transition: `background ${TRANSITIONS.fast}`,
              }}
            >
              <div
                style={{
                  fontSize: TYPOGRAPHY.sizes.caption,
                  color: COLORS.text.tertiary,
                  fontWeight: TYPOGRAPHY.weights.medium,
                  minWidth: 56,
                  textAlign: "right",
                }}
              >
                {formatHour(tsToDate(ev.startTime).getHours())}
              </div>
              <div
                style={{
                  width: 3,
                  height: 24,
                  background: ev.color,
                  borderRadius: RADII.pill,
                }}
              />
              <div
                style={{
                  fontSize: TYPOGRAPHY.sizes.body,
                  fontWeight: TYPOGRAPHY.weights.medium,
                  color: COLORS.text.primary,
                }}
              >
                {ev.title}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Secondary Panel ─────────────────────────────────────────────────────────

export function SecondaryPanel() {
  const [view] = useCurrentView();
  const { data: calendars = [] } = useCalendars();
  const toggleVis = useToggleCalendarVisibility();
  const createCal = useCreateCalendar();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");

  return (
    <div
      data-ocid="calendar.secondary_panel"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        <SectionLabel label="Views" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {(["month", "week", "day"] as CalView[]).map((v) => (
            <NavItem
              key={v}
              label={v.charAt(0).toUpperCase() + v.slice(1)}
              accent={accent}
              selected={view === v}
              onClick={() => setCurrentView(v)}
              data-ocid={`calendar.view.${v}`}
            />
          ))}
        </div>

        <SectionLabel label="My Calendars" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {calendars.map((cal) => (
            <NavItem
              key={Number(cal.id)}
              label={cal.name}
              accent={cal.color}
              selected={false}
              onClick={() => toggleVis.mutate(Number(cal.id))}
              icon={
                <span
                  style={{
                    width: SPACING[2] + 2,
                    height: SPACING[2] + 2,
                    borderRadius: "50%",
                    background: cal.visible ? cal.color : "transparent",
                    border: `2px solid ${cal.color}`,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
              }
              meta={
                cal.visible ? (
                  <IconEye size={14} color={COLORS.text.tertiary} />
                ) : (
                  <IconEyeOff size={14} color={COLORS.text.tertiary} />
                )
              }
              data-ocid={`calendar.toggle.${Number(cal.id)}`}
            />
          ))}
        </div>

        {/* Inline new-calendar form — appears below the calendar list, no freestanding action button */}
        {showForm && (
          <div
            style={{
              padding: `0 ${SPACING[4]}px`,
              marginTop: SPACING[2],
              display: "flex",
              gap: SPACING[1],
            }}
            data-ocid="calendar.new_calendar_form"
          >
            <DsInput
              value={newName}
              onChange={setNewName}
              placeholder="Calendar name"
              style={{ flex: 1, fontSize: TYPOGRAPHY.sizes.small }}
              data-ocid="calendar.new_calendar_input"
            />
            <DsIconButton
              size="sm"
              variant="ghost"
              onClick={() => {
                if (newName.trim()) {
                  createCal.mutate({ name: newName.trim(), color: accent });
                  setNewName("");
                  setShowForm(false);
                }
              }}
              title="Confirm new calendar"
              aria-label="Confirm new calendar"
              data-ocid="calendar.create_calendar_button"
              style={{
                background: newName.trim() ? accent : "transparent",
                color: newName.trim()
                  ? COLORS.neutral[0]
                  : COLORS.text.tertiary,
              }}
            >
              <IconPlus size={14} />
            </DsIconButton>
            <DsIconButton
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
              title="Cancel new calendar"
              aria-label="Cancel new calendar"
              data-ocid="calendar.cancel_new_calendar_button"
            >
              <IconX size={14} />
            </DsIconButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function MainPanel() {
  const { canEdit } = useCurrentRole();
  const [view, setView] = useCurrentView();
  const [currentMonth, _setCurrentMonth] = useState(new Date());
  const [addingForDay, setAddingForDay] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<FullCalendarEvent | null>(
    null,
  );

  const { data: calendars = [], isLoading: calsLoading } = useCalendars();
  const { data: allEvents = [], isLoading: evLoading } =
    useCalendarEvents(null);
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const visibleCalIds = new Set(
    calendars.filter((c) => c.visible).map((c) => Number(c.id)),
  );
  const events = allEvents.filter((e) =>
    visibleCalIds.has(Number(e.calendarId)),
  );

  function navLabel() {
    if (view === "month")
      return `${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    if (view === "week") {
      const ws = new Date(currentMonth);
      ws.setDate(currentMonth.getDate() - currentMonth.getDay());
      const we = new Date(ws);
      we.setDate(ws.getDate() + 6);
      if (ws.getMonth() === we.getMonth())
        return `${MONTH_NAMES[ws.getMonth()]} ${ws.getDate()}–${we.getDate()}, ${ws.getFullYear()}`;
      return `${MONTH_NAMES[ws.getMonth()]} ${ws.getDate()} – ${MONTH_NAMES[we.getMonth()]} ${we.getDate()}, ${ws.getFullYear()}`;
    }
    return `${DAY_NAMES[currentMonth.getDay()]}, ${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getDate()}, ${currentMonth.getFullYear()}`;
  }

  const viewControls = [
    {
      id: "month",
      label: "Month",
      icon: <IconLayoutGrid size={16} />,
      active: view === "month",
      onClick: () => setView("month"),
    },
    {
      id: "week",
      label: "Week",
      icon: <IconCalendarEvent size={16} />,
      active: view === "week",
      onClick: () => setView("week"),
    },
    {
      id: "day",
      label: "Day",
      icon: <IconLayoutList size={16} />,
      active: view === "day",
      onClick: () => setView("day"),
    },
  ];

  if (calsLoading || evLoading) {
    return (
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
        Loading calendar…
      </div>
    );
  }

  return (
    <div
      data-ocid="calendar.main_panel"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <PageHeader
        title={navLabel()}
        viewControls={viewControls}
        primaryAction={
          canEdit
            ? {
                label: "New event",
                icon: <IconCalendar size={14} />,
                onClick: () => setAddingForDay(new Date()),
              }
            : undefined
        }
        stats={[
          { label: "This month", value: events.length },
          { label: "Next 7 days", value: events.length },
          { label: "Total events", value: events.length },
        ]}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
          background: COLORS.surface.panel3,
        }}
      >
        {/* Inline edit form — appears at the top of the view when an event is being edited */}
        {editingEvent && (
          <div
            style={{
              padding: SPACING[3],
              borderBottom: `1px solid ${COLORS.border.default}`,
              background: COLORS.surface.panel3,
            }}
          >
            <InlineEventEditForm
              event={editingEvent}
              onSave={(updates) => {
                updateEvent.mutate(updates);
                setEditingEvent(null);
              }}
              onDelete={(id) => {
                deleteEvent.mutate(id);
                setEditingEvent(null);
              }}
              onCancel={() => setEditingEvent(null)}
            />
          </div>
        )}
        {view === "month" && (
          <MonthView
            currentMonth={currentMonth}
            events={events}
            onDayClick={(d) => {
              setEditingEvent(null);
              setAddingForDay(d);
            }}
            addingForDay={addingForDay}
            editingEvent={editingEvent}
            calendars={calendars}
            onSaveEvent={(e) => createEvent.mutate(e)}
            onCancelAdd={() => setAddingForDay(null)}
            onEventClick={(ev) => {
              setAddingForDay(null);
              setEditingEvent(ev);
            }}
          />
        )}
        {view === "week" && (
          <WeekView
            currentMonth={currentMonth}
            events={events}
            onEventClick={(ev) => setEditingEvent(ev)}
          />
        )}
        {view === "day" && (
          <DayView
            currentMonth={currentMonth}
            events={events}
            onEventClick={(ev) => setEditingEvent(ev)}
          />
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return null;
}
