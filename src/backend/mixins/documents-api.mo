import DocumentsLib "../lib/documents";
import DocTypes "../types/documents";
import Map "mo:core/Map";

mixin () {
  let _docFolders : Map.Map<Nat, DocTypes.Folder> = Map.empty<Nat, DocTypes.Folder>();
  let _docDocuments : Map.Map<Nat, DocTypes.Document> = Map.empty<Nat, DocTypes.Document>();
  let _docCounters = { var nextFolderId : Nat = 1; var nextDocId : Nat = 1 };

  let _docState : DocumentsLib.State = {
    folders = _docFolders;
    documents = _docDocuments;
    counters = _docCounters;
  };

  // Seed immediately at actor init time
  DocumentsLib.seedDocuments(_docState);

  public query func getFolders() : async [DocTypes.Folder] {
    DocumentsLib.getFolders(_docState);
  };

  public query func getDocuments(folderId : ?Nat) : async [DocTypes.Document] {
    DocumentsLib.getDocuments(_docState, folderId);
  };

  public query func getDocument(id : Nat) : async ?DocTypes.Document {
    DocumentsLib.getDocument(_docState, id);
  };

  public func createDocument(title : Text, folderId : ?Nat) : async DocTypes.Document {
    DocumentsLib.createDocument(_docState, title, folderId);
  };

  public func updateDocument(id : Nat, title : Text, content : Text) : async ?DocTypes.Document {
    DocumentsLib.updateDocument(_docState, id, title, content);
  };
};
