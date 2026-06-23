import TaskTypes "../types/tasks";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";

module {
  public type TaskPriority = TaskTypes.TaskPriority;
  public type TaskStatus = TaskTypes.TaskStatus;
  public type Task = TaskTypes.Task;
  public type TaskList = TaskTypes.TaskList;

  public type State = {
    taskLists : Map.Map<Nat, TaskList>;
    tasks : Map.Map<Nat, Task>;
    counters : { var nextListId : Nat; var nextTaskId : Nat };
  };

  public func seedTasks(s : State) {
    let now = Time.now();
    let day : Int = 86_400_000_000_000; // 1 day in nanoseconds

    s.taskLists.add(1, { id = 1; name = "My Tasks"; workspaceId = 1; projectId = null; isPersonal = true });
    s.taskLists.add(2, { id = 2; name = "Team Tasks"; workspaceId = 1; projectId = null; isPersonal = false });
    s.counters.nextListId := 3;

    s.tasks.add(1, { id = 1; title = "Set up workspace channels"; description = "Create default channels for the team"; assigneeIds = [1]; dueDate = null; priority = #normal; status = #done; projectId = null; tags = []; listId = 1; createdAt = now });
    s.tasks.add(2, { id = 2; title = "Design new landing page"; description = "Create a fresh landing page design with the new brand guidelines"; assigneeIds = [2]; dueDate = ?(now + 3 * day); priority = #high; status = #inProgress; projectId = null; tags = ["design", "web"]; listId = 2; createdAt = now });
    s.tasks.add(3, { id = 3; title = "Review Q3 goals"; description = "Go through Q3 goals and update progress for all departments"; assigneeIds = [3]; dueDate = ?(now + day); priority = #urgent; status = #todo; projectId = null; tags = ["strategy"]; listId = 2; createdAt = now });
    s.tasks.add(4, { id = 4; title = "Update team handbook"; description = "Add new onboarding sections and update policies"; assigneeIds = [1]; dueDate = ?(now + 7 * day); priority = #normal; status = #todo; projectId = null; tags = ["docs"]; listId = 1; createdAt = now });
    s.tasks.add(5, { id = 5; title = "Fix login bug"; description = "Users reporting issues with SSO login on mobile devices"; assigneeIds = [2]; dueDate = null; priority = #high; status = #blocked; projectId = null; tags = ["bug", "auth"]; listId = 2; createdAt = now });
    s.tasks.add(6, { id = 6; title = "Schedule team retreat"; description = "Plan and coordinate the annual team retreat"; assigneeIds = [3]; dueDate = ?(now + 14 * day); priority = #low; status = #todo; projectId = null; tags = ["team", "event"]; listId = 2; createdAt = now });
    s.counters.nextTaskId := 7;
  };

  public func getTaskLists(s : State) : [TaskList] {
    var result : [TaskList] = [];
    for ((_, tl) in s.taskLists.entries()) {
      result := result.concat([tl]);
    };
    result;
  };

  public func getTasks(s : State, listId : Nat) : [Task] {
    var result : [Task] = [];
    for ((_, t) in s.tasks.entries()) {
      if (t.listId == listId) {
        result := result.concat([t]);
      };
    };
    result;
  };

  public func getAllTasks(s : State) : [Task] {
    var result : [Task] = [];
    for ((_, t) in s.tasks.entries()) {
      result := result.concat([t]);
    };
    result;
  };

  public func createTask(
    s : State,
    title : Text,
    description : Text,
    assigneeIds : [Nat],
    dueDate : ?Int,
    priority : TaskPriority,
    status : TaskStatus,
    listId : Nat,
    tags : [Text],
    projectId : ?Nat,
  ) : Task {
    let id = s.counters.nextTaskId;
    s.counters.nextTaskId += 1;
    let t : Task = { id; title; description; assigneeIds; dueDate; priority; status; projectId; tags; listId; createdAt = Time.now() };
    s.tasks.add(id, t);
    t;
  };

  public func updateTask(
    s : State,
    id : Nat,
    title : Text,
    description : Text,
    assigneeIds : [Nat],
    dueDate : ?Int,
    priority : TaskPriority,
    status : TaskStatus,
    tags : [Text],
  ) : ?Task {
    switch (s.tasks.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with title; description; assigneeIds; dueDate; priority; status; tags };
        s.tasks.add(id, updated);
        ?updated;
      };
    };
  };

  public func updateTaskStatus(s : State, id : Nat, status : TaskStatus) : ?Task {
    switch (s.tasks.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with status };
        s.tasks.add(id, updated);
        ?updated;
      };
    };
  };
};
