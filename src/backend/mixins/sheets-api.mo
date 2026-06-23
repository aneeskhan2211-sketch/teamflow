import SheetsLib "../lib/sheets";
import SheetTypes "../types/sheets";
import Map "mo:core/Map";

mixin () {
  let _sheets : Map.Map<Nat, SheetTypes.Sheet> = Map.empty<Nat, SheetTypes.Sheet>();
  let _sheetCells : Map.Map<SheetsLib.CellKey, SheetTypes.SheetCell> = Map.empty<SheetsLib.CellKey, SheetTypes.SheetCell>();
  let _sheetCounters = { var nextSheetId : Nat = 1 };

  let _sheetState : SheetsLib.State = {
    sheets = _sheets;
    cells = _sheetCells;
    counters = _sheetCounters;
  };

  SheetsLib.seedSheets(_sheetState);

  public query func getSheets() : async [SheetTypes.Sheet] {
    SheetsLib.getSheets(_sheetState);
  };

  public query func getSheet(id : Nat) : async ?SheetTypes.Sheet {
    SheetsLib.getSheet(_sheetState, id);
  };

  public query func getSheetCells(sheetId : Nat) : async [SheetTypes.SheetCell] {
    SheetsLib.getCells(_sheetState, sheetId);
  };

  public func createSheet(name : Text) : async SheetTypes.Sheet {
    SheetsLib.createSheet(_sheetState, name);
  };

  public func setSheetCell(sheetId : Nat, row : Nat, col : Nat, value : Text) : async SheetTypes.SheetCell {
    SheetsLib.setCell(_sheetState, sheetId, row, col, value);
  };

  public func renameSheet(id : Nat, name : Text) : async ?SheetTypes.Sheet {
    SheetsLib.renameSheet(_sheetState, id, name);
  };

  public func deleteSheet(id : Nat) : async Bool {
    SheetsLib.deleteSheet(_sheetState, id);
  };

  public func clearSheetCell(sheetId : Nat, row : Nat, col : Nat) : async Bool {
    SheetsLib.clearCell(_sheetState, sheetId, row, col);
  };
};
