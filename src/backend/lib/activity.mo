import ActivityTypes "../types/activity";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Array "mo:core/Array";

module {
  public type ActivityEntry = ActivityTypes.ActivityEntry;

  public type State = {
    entries : Map.Map<Nat, ActivityEntry>;
    counters : { var nextId : Nat };
  };

  public func seedActivity(s : State) {
    let now = Time.now();
    let min : Int = 60_000_000_000;

    s.entries.add(1, { id = 1; moduleName = "tasks"; action = "created"; description = "Created task \"Set up workspace channels\""; userId = "alex"; timestamp = now - 60 * min });
    s.entries.add(2, { id = 2; moduleName = "documents"; action = "created"; description = "Created document \"Welcome to TeamFlow\""; userId = "alex"; timestamp = now - 55 * min });
    s.entries.add(3, { id = 3; moduleName = "chat"; action = "message"; description = "Sent a message in #general"; userId = "jamie"; timestamp = now - 40 * min });
    s.entries.add(4, { id = 4; moduleName = "tasks"; action = "updated"; description = "Updated status of \"Design new landing page\""; userId = "morgan"; timestamp = now - 20 * min });
    s.entries.add(5, { id = 5; moduleName = "projects"; action = "created"; description = "Created project \"Website Redesign\""; userId = "alex"; timestamp = now - 10 * min });
    s.counters.nextId := 6;
  };

  public func getEntries(s : State, limit : ?Nat) : [ActivityEntry] {
    var result : [ActivityEntry] = [];
    for ((_, e) in s.entries.entries()) {
      result := result.concat([e]);
    };
    // Sort descending by timestamp
    let sorted = result.sort(func(a, b) = Int.compare(b.timestamp, a.timestamp));
    switch (limit) {
      case null sorted;
      case (?n) {
        let len = sorted.size();
        if (n >= len) sorted
        else sorted.sliceToArray(0, n);
      };
    };
  };

  public func addEntry(
    s : State,
    module_ : Text,
    action : Text,
    description : Text,
    userId : Text,
  ) : ActivityEntry {
    let id = s.counters.nextId;
    s.counters.nextId += 1;
    let e : ActivityEntry = { id; moduleName = module_; action; description; userId; timestamp = Time.now() };
    s.entries.add(id, e);
    e;
  };
};
