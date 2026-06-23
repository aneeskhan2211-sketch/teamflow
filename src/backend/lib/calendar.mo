import CalTypes "../types/calendar";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public type Calendar = CalTypes.Calendar;
  public type CalendarEvent = CalTypes.CalendarEvent;

  public type State = {
    calendars : Map.Map<Nat, Calendar>;
    events : Map.Map<Nat, CalendarEvent>;
    counters : { var nextCalId : Nat; var nextEventId : Nat };
  };

  public func seedCalendar(s : State) {
    let now = Time.now();
    let day : Int = 86_400_000_000_000;

    s.calendars.add(1, { id = 1; name = "Personal"; color = "#6366f1"; visible = true });
    s.calendars.add(2, { id = 2; name = "Work"; color = "#10b981"; visible = true });
    s.calendars.add(3, { id = 3; name = "Holidays"; color = "#f59e0b"; visible = true });
    s.counters.nextCalId := 4;

    s.events.add(1, { id = 1; title = "Team standup"; description = "Daily sync"; startTime = now; endTime = now + 1_800_000_000_000; allDay = false; color = "#10b981"; calendarId = 2 });
    s.events.add(2, { id = 2; title = "Product review"; description = "Review Q3 roadmap with stakeholders"; startTime = now + day; endTime = now + day + 3_600_000_000_000; allDay = false; color = "#10b981"; calendarId = 2 });
    s.events.add(3, { id = 3; title = "Lunch with Jamie"; description = ""; startTime = now + 2 * day; endTime = now + 2 * day + 3_600_000_000_000; allDay = false; color = "#6366f1"; calendarId = 1 });
    s.events.add(4, { id = 4; title = "Company all-hands"; description = "Quarterly all-hands meeting"; startTime = now + 3 * day; endTime = now + 3 * day + 5_400_000_000_000; allDay = false; color = "#10b981"; calendarId = 2 });
    s.counters.nextEventId := 5;
  };

  public func getCalendars(s : State) : [Calendar] {
    var result : [Calendar] = [];
    for ((_, c) in s.calendars.entries()) {
      result := result.concat([c]);
    };
    result;
  };

  public func createCalendar(s : State, name : Text, color : Text) : Calendar {
    let id = s.counters.nextCalId;
    s.counters.nextCalId += 1;
    let c : Calendar = { id; name; color; visible = true };
    s.calendars.add(id, c);
    c;
  };

  public func toggleCalendarVisibility(s : State, id : Nat) : ?Calendar {
    switch (s.calendars.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with visible = not existing.visible };
        s.calendars.add(id, updated);
        ?updated;
      };
    };
  };

  public func getEvents(s : State, calendarId : ?Nat) : [CalendarEvent] {
    var result : [CalendarEvent] = [];
    for ((_, e) in s.events.entries()) {
      let matches = switch (calendarId) {
        case null true;
        case (?cid) { e.calendarId == cid };
      };
      if (matches) {
        result := result.concat([e]);
      };
    };
    result;
  };

  public func createEvent(
    s : State,
    title : Text,
    description : Text,
    startTime : Int,
    endTime : Int,
    allDay : Bool,
    color : Text,
    calendarId : Nat,
  ) : CalendarEvent {
    let id = s.counters.nextEventId;
    s.counters.nextEventId += 1;
    let e : CalendarEvent = { id; title; description; startTime; endTime; allDay; color; calendarId };
    s.events.add(id, e);
    e;
  };

  public func updateEvent(
    s : State,
    id : Nat,
    title : Text,
    description : Text,
    startTime : Int,
    endTime : Int,
    allDay : Bool,
    color : Text,
  ) : ?CalendarEvent {
    switch (s.events.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with title; description; startTime; endTime; allDay; color };
        s.events.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteEvent(s : State, id : Nat) : Bool {
    switch (s.events.get(id)) {
      case null false;
      case (?_) {
        s.events.remove(id);
        true;
      };
    };
  };
};
