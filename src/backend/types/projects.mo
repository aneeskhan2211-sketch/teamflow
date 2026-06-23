module {
  public type Project = {
    id : Nat;
    name : Text;
    description : Text;
    status : Text;
    color : Text;
    ownerId : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type ProjectMilestone = {
    id : Nat;
    projectId : Nat;
    title : Text;
    dueDate : ?Int;
    completed : Bool;
  };
};
