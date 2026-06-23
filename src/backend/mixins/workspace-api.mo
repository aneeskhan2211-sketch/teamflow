import WorkspaceLib "../lib/workspace";
import WorkspaceTypes "../types/workspace";
import Map "mo:core/Map";

mixin () {
  let _wsUsers : Map.Map<Nat, WorkspaceTypes.User> = Map.empty<Nat, WorkspaceTypes.User>();
  let _wsState = { var workspace : ?WorkspaceTypes.Workspace = null };

  // Seed immediately at actor init time
  WorkspaceLib.seedUsers(_wsUsers);
  WorkspaceLib.seedWorkspace(_wsState);

  public query func getWorkspace() : async ?WorkspaceTypes.Workspace {
    WorkspaceLib.getWorkspace(_wsState);
  };

  public query func getUsers() : async [WorkspaceTypes.User] {
    WorkspaceLib.getUsers(_wsUsers);
  };

  public query func getUser(id : Nat) : async ?WorkspaceTypes.User {
    WorkspaceLib.getUser(_wsUsers, id);
  };
};
