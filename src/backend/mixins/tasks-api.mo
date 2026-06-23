import TasksLib "../lib/tasks";
import TaskTypes "../types/tasks";
import Map "mo:core/Map";

mixin () {
  let _taskLists : Map.Map<Nat, TaskTypes.TaskList> = Map.empty<Nat, TaskTypes.TaskList>();
  let _tasks : Map.Map<Nat, TaskTypes.Task> = Map.empty<Nat, TaskTypes.Task>();
  let _taskCounters = { var nextListId : Nat = 1; var nextTaskId : Nat = 1 };

  let _taskState : TasksLib.State = {
    taskLists = _taskLists;
    tasks = _tasks;
    counters = _taskCounters;
  };

  // Seed immediately at actor init time
  TasksLib.seedTasks(_taskState);

  public query func getTaskLists() : async [TaskTypes.TaskList] {
    TasksLib.getTaskLists(_taskState);
  };

  public query func getTasks(listId : Nat) : async [TaskTypes.Task] {
    TasksLib.getTasks(_taskState, listId);
  };

  public query func getAllTasks() : async [TaskTypes.Task] {
    TasksLib.getAllTasks(_taskState);
  };

  public func createTask(
    title : Text,
    description : Text,
    assigneeIds : [Nat],
    dueDate : ?Int,
    priority : TaskTypes.TaskPriority,
    status : TaskTypes.TaskStatus,
    listId : Nat,
    tags : [Text],
    projectId : ?Nat,
  ) : async TaskTypes.Task {
    TasksLib.createTask(_taskState, title, description, assigneeIds, dueDate, priority, status, listId, tags, projectId);
  };

  public func updateTask(
    id : Nat,
    title : Text,
    description : Text,
    assigneeIds : [Nat],
    dueDate : ?Int,
    priority : TaskTypes.TaskPriority,
    status : TaskTypes.TaskStatus,
    tags : [Text],
  ) : async ?TaskTypes.Task {
    TasksLib.updateTask(_taskState, id, title, description, assigneeIds, dueDate, priority, status, tags);
  };

  public func updateTaskStatus(id : Nat, status : TaskTypes.TaskStatus) : async ?TaskTypes.Task {
    TasksLib.updateTaskStatus(_taskState, id, status);
  };
};
