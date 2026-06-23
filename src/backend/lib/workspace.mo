import WorkspaceTypes "../types/workspace";
import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";

module {
  public type User = WorkspaceTypes.User;
  public type Workspace = WorkspaceTypes.Workspace;

  // --- Seed data builders ---

  public func seedUsers(users : Map.Map<Nat, User>) {
    users.add(
      1,
      {
        id = 1;
        name = "Alice";
        email = "alice@teamflow.app";
        role = #owner;
        avatarColor = "purple";
        title = "CEO";
        department = "Leadership";
      },
    );
    users.add(
      2,
      {
        id = 2;
        name = "Bob";
        email = "bob@teamflow.app";
        role = #admin;
        avatarColor = "blue";
        title = "Engineering Lead";
        department = "Engineering";
      },
    );
    users.add(
      3,
      {
        id = 3;
        name = "Carol";
        email = "carol@teamflow.app";
        role = #member;
        avatarColor = "green";
        title = "Product Designer";
        department = "Design";
      },
    );
  };

  public func seedWorkspace(ws : { var workspace : ?Workspace }) {
    ws.workspace := ?{
      id = 1;
      name = "TeamFlow";
      ownerId = 1;
      memberIds = [1, 2, 3];
      createdAt = 0;
    };
  };

  // --- Query helpers ---

  public func getWorkspace(ws : { var workspace : ?Workspace }) : ?Workspace {
    ws.workspace;
  };

  public func getUsers(users : Map.Map<Nat, User>) : [User] {
    let buf = List.empty<User>();
    for ((_, u) in users.entries()) {
      buf.add(u);
    };
    buf.toArray();
  };

  public func getUser(users : Map.Map<Nat, User>, id : Nat) : ?User {
    users.get(id);
  };
};
