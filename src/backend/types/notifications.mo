import Common "common";

module {
  public type Notification = {
    id : Nat;
    userId : Common.UserId;
    title : Text;
    body : Text;
    notifType : { #mention; #activity; #update };
    isRead : Bool;
    createdAt : Common.Timestamp;
    sourceId : ?Nat;
    sourceType : ?Text;
  };
};
