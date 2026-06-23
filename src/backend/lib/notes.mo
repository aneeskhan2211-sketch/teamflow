import NoteTypes "../types/notes";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public type Note = NoteTypes.Note;
  public type NoteFolder = NoteTypes.NoteFolder;

  public type State = {
    folders : Map.Map<Nat, NoteFolder>;
    notes : Map.Map<Nat, Note>;
    counters : { var nextFolderId : Nat; var nextNoteId : Nat };
  };

  public func seedNotes(s : State) {
    let now = Time.now();

    s.folders.add(1, { id = 1; name = "Personal"; createdAt = now });
    s.folders.add(2, { id = 2; name = "Work"; createdAt = now });
    s.counters.nextFolderId := 3;

    s.notes.add(1, { id = 1; title = "Meeting Notes"; content = "## Q3 Planning\n\n- Review OKRs\n- Discuss roadmap priorities\n- Assign owners"; folderId = ?2; createdAt = now; updatedAt = now });
    s.notes.add(2, { id = 2; title = "Ideas"; content = "## Product Ideas\n\n- Inline comments on documents\n- Timeline view for projects\n- Keyboard shortcuts panel"; folderId = ?2; createdAt = now; updatedAt = now });
    s.notes.add(3, { id = 3; title = "Reading List"; content = "- Shape Up by Basecamp\n- The Mom Test\n- Working in Public"; folderId = ?1; createdAt = now; updatedAt = now });
    s.counters.nextNoteId := 4;
  };

  public func getFolders(s : State) : [NoteFolder] {
    var result : [NoteFolder] = [];
    for ((_, f) in s.folders.entries()) {
      result := result.concat([f]);
    };
    result;
  };

  public func getNotes(s : State, folderId : ?Nat) : [Note] {
    var result : [Note] = [];
    for ((_, n) in s.notes.entries()) {
      let matches = switch (folderId) {
        case null true;
        case (?fid) { n.folderId == ?fid };
      };
      if (matches) {
        result := result.concat([n]);
      };
    };
    result;
  };

  public func getNote(s : State, id : Nat) : ?Note {
    s.notes.get(id);
  };

  public func createFolder(s : State, name : Text) : NoteFolder {
    let id = s.counters.nextFolderId;
    s.counters.nextFolderId += 1;
    let f : NoteFolder = { id; name; createdAt = Time.now() };
    s.folders.add(id, f);
    f;
  };

  public func createNote(s : State, title : Text, folderId : ?Nat) : Note {
    let id = s.counters.nextNoteId;
    s.counters.nextNoteId += 1;
    let now = Time.now();
    let n : Note = { id; title; content = ""; folderId; createdAt = now; updatedAt = now };
    s.notes.add(id, n);
    n;
  };

  public func updateNote(s : State, id : Nat, title : Text, content : Text) : ?Note {
    switch (s.notes.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with title; content; updatedAt = Time.now() };
        s.notes.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteNote(s : State, id : Nat) : Bool {
    switch (s.notes.get(id)) {
      case null false;
      case (?_) {
        s.notes.remove(id);
        true;
      };
    };
  };

  public func deleteFolder(s : State, id : Nat) : Bool {
    switch (s.folders.get(id)) {
      case null false;
      case (?_) {
        s.folders.remove(id);
        // Remove all notes in this folder
        var toRemove : [Nat] = [];
        for ((nid, n) in s.notes.entries()) {
          if (n.folderId == ?id) { toRemove := toRemove.concat([nid]) };
        };
        for (nid in toRemove.vals()) { s.notes.remove(nid) };
        true;
      };
    };
  };
};
