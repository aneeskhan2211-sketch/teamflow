import SheetTypes "../types/sheets";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public type Sheet = SheetTypes.Sheet;
  public type SheetCell = SheetTypes.SheetCell;

  // Composite key for cell: sheetId * 10000 * 10000 + row * 10000 + col
  public type CellKey = Nat;

  public func cellKey(sheetId : Nat, row : Nat, col : Nat) : CellKey {
    sheetId * 100_000_000 + row * 10_000 + col;
  };

  public type State = {
    sheets : Map.Map<Nat, Sheet>;
    cells : Map.Map<CellKey, SheetCell>;
    counters : { var nextSheetId : Nat };
  };

  public func seedSheets(s : State) {
    let now = Time.now();

    s.sheets.add(1, { id = 1; name = "Budget 2024"; createdAt = now; updatedAt = now });
    s.sheets.add(2, { id = 2; name = "Team Roster"; createdAt = now; updatedAt = now });
    s.counters.nextSheetId := 3;

    // Seed a few cells for sheet 1
    let k00 = cellKey(1, 0, 0);
    let k01 = cellKey(1, 0, 1);
    let k02 = cellKey(1, 0, 2);
    let k10 = cellKey(1, 1, 0);
    let k11 = cellKey(1, 1, 1);
    let k12 = cellKey(1, 1, 2);
    s.cells.add(k00, { sheetId = 1; row = 0; col = 0; value = "Category" });
    s.cells.add(k01, { sheetId = 1; row = 0; col = 1; value = "Budget" });
    s.cells.add(k02, { sheetId = 1; row = 0; col = 2; value = "Actual" });
    s.cells.add(k10, { sheetId = 1; row = 1; col = 0; value = "Engineering" });
    s.cells.add(k11, { sheetId = 1; row = 1; col = 1; value = "50000" });
    s.cells.add(k12, { sheetId = 1; row = 1; col = 2; value = "47200" });
  };

  public func getSheets(s : State) : [Sheet] {
    var result : [Sheet] = [];
    for ((_, sh) in s.sheets.entries()) {
      result := result.concat([sh]);
    };
    result;
  };

  public func getSheet(s : State, id : Nat) : ?Sheet {
    s.sheets.get(id);
  };

  public func getCells(s : State, sheetId : Nat) : [SheetCell] {
    var result : [SheetCell] = [];
    for ((_, c) in s.cells.entries()) {
      if (c.sheetId == sheetId) {
        result := result.concat([c]);
      };
    };
    result;
  };

  public func createSheet(s : State, name : Text) : Sheet {
    let id = s.counters.nextSheetId;
    s.counters.nextSheetId += 1;
    let now = Time.now();
    let sh : Sheet = { id; name; createdAt = now; updatedAt = now };
    s.sheets.add(id, sh);
    sh;
  };

  public func renameSheet(s : State, id : Nat, name : Text) : ?Sheet {
    switch (s.sheets.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with name; updatedAt = Time.now() };
        s.sheets.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteSheet(s : State, id : Nat) : Bool {
    switch (s.sheets.get(id)) {
      case null false;
      case (?_) {
        s.sheets.remove(id);
        // Remove all cells for this sheet
        var toRemove : [CellKey] = [];
        for ((ck, c) in s.cells.entries()) {
          if (c.sheetId == id) { toRemove := toRemove.concat([ck]) };
        };
        for (ck in toRemove.vals()) { s.cells.remove(ck) };
        true;
      };
    };
  };

  public func setCell(s : State, sheetId : Nat, row : Nat, col : Nat, value : Text) : SheetCell {
    let key = cellKey(sheetId, row, col);
    let cell : SheetCell = { sheetId; row; col; value };
    s.cells.add(key, cell);
    switch (s.sheets.get(sheetId)) {
      case null {};
      case (?sh) { s.sheets.add(sheetId, { sh with updatedAt = Time.now() }) };
    };
    cell;
  };

  public func clearCell(s : State, sheetId : Nat, row : Nat, col : Nat) : Bool {
    let key = cellKey(sheetId, row, col);
    switch (s.cells.get(key)) {
      case null false;
      case (?_) {
        s.cells.remove(key);
        true;
      };
    };
  };
};
