import Common "common";

module {
  public type Channel = {
    id : Nat;
    name : Text;
    topic : Text;
    workspaceId : Nat;
    createdAt : Common.Timestamp;
  };

  public type Message = {
    id : Nat;
    channelId : Nat;
    authorId : Common.UserId;
    content : Text;
    createdAt : Common.Timestamp;
  };

  public type DirectMessage = {
    id : Nat;
    fromUserId : Common.UserId;
    toUserId : Common.UserId;
    content : Text;
    createdAt : Common.Timestamp;
  };
};
