import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import List "mo:core/List";

mixin () {
  // Auth-specific user type — independent of workspace.mo User type
  // Includes auth fields (principal, timestamps) that workspace.mo does not need
  type AuthUser = {
    id : Nat;
    name : Text;
    email : Text;
    role : { #owner; #admin; #member; #guest };
    avatarColor : Text;
    title : Text;
    department : Text;
    principal : ?Principal;
    createdAt : ?Int;
    lastLogin : ?Int;
  };

  // Principal → AuthUser mapping — primary auth store
  let _authUsers : Map.Map<Principal, AuthUser> = Map.empty<Principal, AuthUser>();

  // Counter for stable user id generation
  let _authState = { var nextUserId : Nat = 0; var inviteCode : Text = "" };

  // ── Helpers ──────────────────────────────────────────────────────────────

  func requireCaller(caller : Principal) : Principal {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous caller not allowed");
    };
    caller;
  };

  func isAdminOrOwner(caller : Principal) : Bool {
    switch (_authUsers.get(caller)) {
      case (?(user)) {
        switch (user.role) {
          case (#owner) true;
          case (#admin) true;
          case (_) false;
        };
      };
      case null false;
    };
  };

  func nextId() : Nat {
    let id = _authState.nextUserId;
    _authState.nextUserId += 1;
    id;
  };

  // ── Queries ───────────────────────────────────────────────────────────────

  public query ({ caller }) func getMe() : async ?AuthUser {
    ignore requireCaller(caller);
    _authUsers.get(caller);
  };

  public query ({ caller }) func whoAmI() : async Principal {
    ignore requireCaller(caller);
    caller;
  };

  public query ({ caller }) func isOnboarded() : async Bool {
    ignore requireCaller(caller);
    switch (_authUsers.get(caller)) {
      case (?(user)) user.name != "";
      case null false;
    };
  };

  public query ({ caller }) func getWorkspaceMembers() : async [AuthUser] {
    ignore requireCaller(caller);
    let buf = List.empty<AuthUser>();
    for (u in _authUsers.values()) { buf.add(u) };
    buf.toArray();
  };

  // ── Updates ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func registerUser(
    name : Text,
    email : Text,
    avatarColor : Text,
  ) : async AuthUser {
    ignore requireCaller(caller);
    // If already registered, just refresh lastLogin and return
    switch (_authUsers.get(caller)) {
      case (?(existing)) {
        let updated = { existing with lastLogin = ?Time.now() };
        _authUsers.add(caller, updated);
        return updated;
      };
      case null {};
    };
    // Determine role: first user becomes owner
    let role : { #owner; #admin; #member; #guest } = if (_authState.nextUserId == 0) {
      #owner;
    } else {
      #member;
    };
    let now = Time.now();
    let user : AuthUser = {
      id = nextId();
      name;
      email;
      role;
      avatarColor;
      title = "";
      department = "";
      principal = ?caller;
      createdAt = ?now;
      lastLogin = ?now;
    };
    _authUsers.add(caller, user);
    user;
  };

  public shared ({ caller }) func updateMyProfile(
    name : Text,
    title : Text,
    department : Text,
    avatarColor : Text,
  ) : async Bool {
    ignore requireCaller(caller);
    switch (_authUsers.get(caller)) {
      case (?(existing)) {
        let updated = { existing with name; title; department; avatarColor };
        _authUsers.add(caller, updated);
        true;
      };
      case null false;
    };
  };

  public shared ({ caller }) func assignMemberRole(
    targetPrincipal : Principal,
    role : Text,
  ) : async Bool {
    ignore requireCaller(caller);
    if (not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Admin or Owner role required");
    };
    switch (_authUsers.get(targetPrincipal)) {
      case (?(target)) {
        let newRole : { #owner; #admin; #member; #guest } = switch (role) {
          case "owner" #owner;
          case "admin" #admin;
          case "guest" #guest;
          case _ #member;
        };
        let updated = { target with role = newRole };
        _authUsers.add(targetPrincipal, updated);
        true;
      };
      case null false;
    };
  };

  public shared ({ caller }) func removeMemberByPrincipal(targetPrincipal : Principal) : async Bool {
    ignore requireCaller(caller);
    if (not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Admin or Owner role required");
    };
    switch (_authUsers.get(targetPrincipal)) {
      case (?(target)) {
        switch (target.role) {
          case (#owner) Runtime.trap("Cannot remove the workspace owner");
          case (_) {};
        };
        _authUsers.remove(targetPrincipal);
        true;
      };
      case null false;
    };
  };

  public shared ({ caller }) func generateInviteCode() : async Text {
    ignore requireCaller(caller);
    if (not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Admin or Owner role required");
    };
    // Generate a simple token from timestamp + caller text
    let code = "INV-" # Time.now().toText() # "-" # caller.toText().size().toText();
    _authState.inviteCode := code;
    code;
  };

  public shared ({ caller }) func joinWithInviteCode(
    code : Text,
    name : Text,
    avatarColor : Text,
  ) : async ?AuthUser {
    ignore requireCaller(caller);
    if (_authState.inviteCode == "" or code != _authState.inviteCode) {
      return null;
    };
    // If already registered just return existing
    switch (_authUsers.get(caller)) {
      case (?(existing)) return ?existing;
      case null {};
    };
    let now = Time.now();
    let user : AuthUser = {
      id = nextId();
      name;
      email = "";
      role = #member;
      avatarColor;
      title = "";
      department = "";
      principal = ?caller;
      createdAt = ?now;
      lastLogin = ?now;
    };
    _authUsers.add(caller, user);
    ?user;
  };

  public shared ({ caller }) func completeOnboarding(
    name : Text,
    workspaceName : Text,
    title : Text,
    department : Text,
    avatarColor : Text,
  ) : async AuthUser {
    ignore requireCaller(caller);
    ignore workspaceName; // workspace rename is a workspace-domain concern; accepted but not applied here
    switch (_authUsers.get(caller)) {
      case (?(existing)) {
        let updated = { existing with name; title; department; avatarColor };
        _authUsers.add(caller, updated);
        updated;
      };
      case null {
        // Auto-register if not yet registered
        let role : { #owner; #admin; #member; #guest } = if (_authState.nextUserId == 0) {
          #owner;
        } else {
          #member;
        };
        let now = Time.now();
        let user : AuthUser = {
          id = nextId();
          name;
          email = "";
          role;
          avatarColor;
          title;
          department;
          principal = ?caller;
          createdAt = ?now;
          lastLogin = ?now;
        };
        _authUsers.add(caller, user);
        user;
      };
    };
  };
};
