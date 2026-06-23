import DocTypes "../types/documents";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";

module {
  public type Document = DocTypes.Document;
  public type Folder = DocTypes.Folder;

  public type State = {
    folders : Map.Map<Nat, Folder>;
    documents : Map.Map<Nat, Document>;
    counters : { var nextFolderId : Nat; var nextDocId : Nat };
  };

  public func seedDocuments(s : State) {
    let now = Time.now();

    s.folders.add(1, { id = 1; name = "Team Docs"; parentId = null; workspaceId = 1 });
    s.counters.nextFolderId := 2;

    let welcomeContent = "# Welcome to TeamFlow\n\nWe're excited to have you here! TeamFlow is your team's unified collaborative workspace.\n\n## Getting Started\n\n- **Chat** — Join #general to say hello\n- **Tasks** — Check your assigned tasks in the Tasks module\n- **Documents** — You're reading one right now!\n\n## Key Features\n\n1. Channels for team communication\n2. Task management with priorities and statuses\n3. Rich text documents with collaboration\n4. Integrated calendar and notifications\n\n> \"Great teams communicate openly and work together.\" — TeamFlow\n\nFeel free to explore and reach out if you need anything!";

    let handbookContent = "# Team Handbook\n\n## Our Values\n\n- **Transparency** — We share information openly\n- **Collaboration** — We succeed together\n- **Accountability** — We own our work\n- **Growth** — We learn continuously\n\n## Communication Guidelines\n\n### Channels\n\n- **#general** — Day-to-day conversation\n- **#announcements** — Important company updates (admins only)\n- **#random** — Off-topic and fun\n\n### Response Times\n\n- Messages: within 4 hours during business hours\n- DMs: within 2 hours\n- Urgent issues: tag @here\n\n## Meetings\n\n- Default length: 30 minutes\n- Always have an agenda\n- Share notes in the relevant document after\n\n## Onboarding Checklist\n\n- [ ] Set up your profile\n- [ ] Join relevant channels\n- [ ] Introduce yourself in #general\n- [ ] Review your first week tasks";

    s.documents.add(1, { id = 1; title = "Welcome to TeamFlow"; content = welcomeContent; authorId = 1; workspaceId = 1; folderId = ?1; createdAt = now; updatedAt = now });
    s.documents.add(2, { id = 2; title = "Team Handbook"; content = handbookContent; authorId = 1; workspaceId = 1; folderId = ?1; createdAt = now; updatedAt = now });
    s.counters.nextDocId := 3;
  };

  public func getFolders(s : State) : [Folder] {
    var result : [Folder] = [];
    for ((_, f) in s.folders.entries()) {
      result := result.concat([f]);
    };
    result;
  };

  public func getDocuments(s : State, folderId : ?Nat) : [Document] {
    var result : [Document] = [];
    for ((_, doc) in s.documents.entries()) {
      let matches = switch (folderId) {
        case null true;
        case (?fid) { doc.folderId == ?fid };
      };
      if (matches) {
        result := result.concat([doc]);
      };
    };
    result;
  };

  public func getDocument(s : State, id : Nat) : ?Document {
    s.documents.get(id);
  };

  public func createDocument(s : State, title : Text, folderId : ?Nat) : Document {
    let id = s.counters.nextDocId;
    s.counters.nextDocId += 1;
    let now = Time.now();
    let doc : Document = { id; title; content = ""; authorId = 1; workspaceId = 1; folderId; createdAt = now; updatedAt = now };
    s.documents.add(id, doc);
    doc;
  };

  public func updateDocument(s : State, id : Nat, title : Text, content : Text) : ?Document {
    switch (s.documents.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with title; content; updatedAt = Time.now() };
        s.documents.add(id, updated);
        ?updated;
      };
    };
  };
};
