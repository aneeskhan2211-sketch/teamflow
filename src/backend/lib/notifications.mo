import NotifTypes "../types/notifications";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";

module {
  public type Notification = NotifTypes.Notification;

  public type State = {
    notifications : Map.Map<Nat, Notification>;
    counters : { var nextNotifId : Nat };
  };

  public func seedNotifications(s : State) {
    let now = Time.now();
    s.notifications.add(1, { id = 1; userId = 1; title = "Bob mentioned you"; body = "@Alice can you review the design doc?"; notifType = #mention; isRead = false; createdAt = now - 1_800_000_000_000; sourceId = ?2; sourceType = ?"message" });
    s.notifications.add(2, { id = 2; userId = 1; title = "Task assigned to you"; body = "\"Update team handbook\" has been assigned to you"; notifType = #activity; isRead = false; createdAt = now - 3_600_000_000_000; sourceId = ?4; sourceType = ?"task" });
    s.notifications.add(3, { id = 3; userId = 1; title = "Workspace announcement"; body = "TeamFlow is now live! Welcome to your new workspace."; notifType = #update; isRead = true; createdAt = now - 7_200_000_000_000; sourceId = null; sourceType = ?"workspace" });
    s.counters.nextNotifId := 4;
  };

  public func getNotifications(s : State, userId : Nat) : [Notification] {
    var result : [Notification] = [];
    for ((_, n) in s.notifications.entries()) {
      if (n.userId == userId) {
        result := result.concat([n]);
      };
    };
    result;
  };

  public func markNotificationRead(s : State, id : Nat) : Bool {
    switch (s.notifications.get(id)) {
      case null false;
      case (?n) {
        s.notifications.add(id, { n with isRead = true });
        true;
      };
    };
  };

  public func markAllNotificationsRead(s : State, userId : Nat) : Bool {
    for ((id, n) in s.notifications.entries()) {
      if (n.userId == userId and not n.isRead) {
        s.notifications.add(id, { n with isRead = true });
      };
    };
    true;
  };
};
