module {
  public type NoteFolder = {
    id : Nat;
    name : Text;
    createdAt : Int;
  };

  public type Note = {
    id : Nat;
    title : Text;
    content : Text;
    folderId : ?Nat;
    createdAt : Int;
    updatedAt : Int;
  };
};
