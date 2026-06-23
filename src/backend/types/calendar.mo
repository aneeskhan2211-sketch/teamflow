module {
  public type Calendar = {
    id : Nat;
    name : Text;
    color : Text;
    visible : Bool;
  };

  public type CalendarEvent = {
    id : Nat;
    title : Text;
    description : Text;
    startTime : Int;
    endTime : Int;
    allDay : Bool;
    color : Text;
    calendarId : Nat;
  };
};
