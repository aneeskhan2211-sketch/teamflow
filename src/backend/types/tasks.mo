import Common "common";

module {
  public type TaskPriority = { #urgent; #high; #normal; #low };
  public type TaskStatus = { #todo; #inProgress; #blocked; #done };

  public type Task = {
    id : Nat;
    title : Text;
    description : Text;
    assigneeIds : [Common.UserId];
    dueDate : ?Common.Timestamp;
    priority : TaskPriority;
    status : TaskStatus;
    projectId : ?Nat;
    tags : [Text];
    listId : Nat;
    createdAt : Common.Timestamp;
  };

  public type TaskList = {
    id : Nat;
    name : Text;
    workspaceId : Nat;
    projectId : ?Nat;
    isPersonal : Bool;
  };
};
