import ActivityLib "../lib/activity";
import ActivityTypes "../types/activity";
import Map "mo:core/Map";

mixin () {
  let _activityEntries : Map.Map<Nat, ActivityTypes.ActivityEntry> = Map.empty<Nat, ActivityTypes.ActivityEntry>();
  let _activityCounters = { var nextId : Nat = 1 };

  let _activityState : ActivityLib.State = {
    entries = _activityEntries;
    counters = _activityCounters;
  };

  ActivityLib.seedActivity(_activityState);

  public query func getActivityFeed(limit : ?Nat) : async [ActivityTypes.ActivityEntry] {
    ActivityLib.getEntries(_activityState, limit);
  };

  public func addActivity(
    module_ : Text,
    action : Text,
    description : Text,
    userId : Text,
  ) : async ActivityTypes.ActivityEntry {
    ActivityLib.addEntry(_activityState, module_, action, description, userId);
  };
};
