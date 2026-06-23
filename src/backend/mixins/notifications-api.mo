import NotificationsLib "../lib/notifications";
import NotifTypes "../types/notifications";
import Map "mo:core/Map";

mixin () {
  let _notifs : Map.Map<Nat, NotifTypes.Notification> = Map.empty<Nat, NotifTypes.Notification>();
  let _notifCounters = { var nextNotifId : Nat = 1 };

  let _notifState : NotificationsLib.State = {
    notifications = _notifs;
    counters = _notifCounters;
  };

  // Seed immediately at actor init time
  NotificationsLib.seedNotifications(_notifState);

  public query func getNotifications(userId : Nat) : async [NotifTypes.Notification] {
    NotificationsLib.getNotifications(_notifState, userId);
  };

  public func markNotificationRead(id : Nat) : async Bool {
    NotificationsLib.markNotificationRead(_notifState, id);
  };

  public func markAllNotificationsRead(userId : Nat) : async Bool {
    NotificationsLib.markAllNotificationsRead(_notifState, userId);
  };
};
