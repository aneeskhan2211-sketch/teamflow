module {
  public type Sheet = {
    id : Nat;
    name : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type SheetCell = {
    sheetId : Nat;
    row : Nat;
    col : Nat;
    value : Text;
  };
};
