import CalendarLib "../lib/calendar";
import CalTypes "../types/calendar";
import Map "mo:core/Map";

mixin () {
  let _calendars : Map.Map<Nat, CalTypes.Calendar> = Map.empty<Nat, CalTypes.Calendar>();
  let _calEvents : Map.Map<Nat, CalTypes.CalendarEvent> = Map.empty<Nat, CalTypes.CalendarEvent>();
  let _calCounters = { var nextCalId : Nat = 1; var nextEventId : Nat = 1 };

  let _calState : CalendarLib.State = {
    calendars = _calendars;
    events = _calEvents;
    counters = _calCounters;
  };

  CalendarLib.seedCalendar(_calState);

  public query func getCalendars() : async [CalTypes.Calendar] {
    CalendarLib.getCalendars(_calState);
  };

  public func createCalendar(name : Text, color : Text) : async CalTypes.Calendar {
    CalendarLib.createCalendar(_calState, name, color);
  };

  public func toggleCalendarVisibility(id : Nat) : async ?CalTypes.Calendar {
    CalendarLib.toggleCalendarVisibility(_calState, id);
  };

  public query func getCalendarEvents(calendarId : ?Nat) : async [CalTypes.CalendarEvent] {
    CalendarLib.getEvents(_calState, calendarId);
  };

  public func createCalendarEvent(
    title : Text,
    description : Text,
    startTime : Int,
    endTime : Int,
    allDay : Bool,
    color : Text,
    calendarId : Nat,
  ) : async CalTypes.CalendarEvent {
    CalendarLib.createEvent(_calState, title, description, startTime, endTime, allDay, color, calendarId);
  };

  public func updateCalendarEvent(
    id : Nat,
    title : Text,
    description : Text,
    startTime : Int,
    endTime : Int,
    allDay : Bool,
    color : Text,
  ) : async ?CalTypes.CalendarEvent {
    CalendarLib.updateEvent(_calState, id, title, description, startTime, endTime, allDay, color);
  };

  public func deleteCalendarEvent(id : Nat) : async Bool {
    CalendarLib.deleteEvent(_calState, id);
  };
};
