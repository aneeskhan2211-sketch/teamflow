import Common "common";

module {
  public type Document = {
    id : Nat;
    title : Text;
    content : Text;
    authorId : Common.UserId;
    workspaceId : Nat;
    folderId : ?Nat;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type Folder = {
    id : Nat;
    name : Text;
    parentId : ?Nat;
    workspaceId : Nat;
  };
};
