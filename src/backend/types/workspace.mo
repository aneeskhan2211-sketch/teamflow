import Common "common";

module {
  public type User = {
    id : Common.UserId;
    name : Text;
    email : Text;
    role : { #owner; #admin; #member; #guest };
    avatarColor : Text;
    title : Text;
    department : Text;
  };

  public type Workspace = {
    id : Nat;
    name : Text;
    ownerId : Common.UserId;
    memberIds : [Common.UserId];
    createdAt : Common.Timestamp;
  };
};
