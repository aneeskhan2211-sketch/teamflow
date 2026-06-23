import NotesLib "../lib/notes";
import NoteTypes "../types/notes";
import Map "mo:core/Map";

mixin () {
  let _noteFolders : Map.Map<Nat, NoteTypes.NoteFolder> = Map.empty<Nat, NoteTypes.NoteFolder>();
  let _notes : Map.Map<Nat, NoteTypes.Note> = Map.empty<Nat, NoteTypes.Note>();
  let _noteCounters = { var nextFolderId : Nat = 1; var nextNoteId : Nat = 1 };

  let _noteState : NotesLib.State = {
    folders = _noteFolders;
    notes = _notes;
    counters = _noteCounters;
  };

  NotesLib.seedNotes(_noteState);

  public query func getNoteFolders() : async [NoteTypes.NoteFolder] {
    NotesLib.getFolders(_noteState);
  };

  public query func getNotes(folderId : ?Nat) : async [NoteTypes.Note] {
    NotesLib.getNotes(_noteState, folderId);
  };

  public query func getNote(id : Nat) : async ?NoteTypes.Note {
    NotesLib.getNote(_noteState, id);
  };

  public func createNoteFolder(name : Text) : async NoteTypes.NoteFolder {
    NotesLib.createFolder(_noteState, name);
  };

  public func createNote(title : Text, folderId : ?Nat) : async NoteTypes.Note {
    NotesLib.createNote(_noteState, title, folderId);
  };

  public func updateNote(id : Nat, title : Text, content : Text) : async ?NoteTypes.Note {
    NotesLib.updateNote(_noteState, id, title, content);
  };

  public func deleteNote(id : Nat) : async Bool {
    NotesLib.deleteNote(_noteState, id);
  };

  public func deleteNoteFolder(id : Nat) : async Bool {
    NotesLib.deleteFolder(_noteState, id);
  };
};
