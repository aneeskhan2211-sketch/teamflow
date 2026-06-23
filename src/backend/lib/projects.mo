import ProjTypes "../types/projects";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public type Project = ProjTypes.Project;
  public type ProjectMilestone = ProjTypes.ProjectMilestone;

  public type State = {
    projects : Map.Map<Nat, Project>;
    milestones : Map.Map<Nat, ProjectMilestone>;
    counters : { var nextProjectId : Nat; var nextMilestoneId : Nat };
  };

  public func seedProjects(s : State) {
    let now = Time.now();
    let day : Int = 86_400_000_000_000;

    s.projects.add(1, { id = 1; name = "Website Redesign"; description = "Revamp the company website with new brand identity"; status = "active"; color = "#6366f1"; ownerId = "alex"; createdAt = now; updatedAt = now });
    s.projects.add(2, { id = 2; name = "Mobile App v2"; description = "Next generation mobile application"; status = "active"; color = "#10b981"; ownerId = "jamie"; createdAt = now; updatedAt = now });
    s.projects.add(3, { id = 3; name = "Q3 Marketing Campaign"; description = "End-of-quarter marketing push"; status = "planning"; color = "#f59e0b"; ownerId = "taylor"; createdAt = now; updatedAt = now });
    s.counters.nextProjectId := 4;

    s.milestones.add(1, { id = 1; projectId = 1; title = "Design mockups approved"; dueDate = ?(now + 7 * day); completed = true });
    s.milestones.add(2, { id = 2; projectId = 1; title = "Frontend implementation"; dueDate = ?(now + 14 * day); completed = false });
    s.milestones.add(3, { id = 3; projectId = 2; title = "Beta release"; dueDate = ?(now + 21 * day); completed = false });
    s.milestones.add(4, { id = 4; projectId = 3; title = "Campaign launch"; dueDate = ?(now + 10 * day); completed = false });
    s.counters.nextMilestoneId := 5;
  };

  public func getProjects(s : State) : [Project] {
    var result : [Project] = [];
    for ((_, p) in s.projects.entries()) {
      result := result.concat([p]);
    };
    result;
  };

  public func getProject(s : State, id : Nat) : ?Project {
    s.projects.get(id);
  };

  public func getMilestones(s : State, projectId : Nat) : [ProjectMilestone] {
    var result : [ProjectMilestone] = [];
    for ((_, m) in s.milestones.entries()) {
      if (m.projectId == projectId) {
        result := result.concat([m]);
      };
    };
    result;
  };

  public func createProject(
    s : State,
    name : Text,
    description : Text,
    status : Text,
    color : Text,
    ownerId : Text,
  ) : Project {
    let id = s.counters.nextProjectId;
    s.counters.nextProjectId += 1;
    let now = Time.now();
    let p : Project = { id; name; description; status; color; ownerId; createdAt = now; updatedAt = now };
    s.projects.add(id, p);
    p;
  };

  public func updateProject(
    s : State,
    id : Nat,
    name : Text,
    description : Text,
    status : Text,
  ) : ?Project {
    switch (s.projects.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with name; description; status; updatedAt = Time.now() };
        s.projects.add(id, updated);
        ?updated;
      };
    };
  };

  public func createMilestone(
    s : State,
    projectId : Nat,
    title : Text,
    dueDate : ?Int,
  ) : ProjectMilestone {
    let id = s.counters.nextMilestoneId;
    s.counters.nextMilestoneId += 1;
    let m : ProjectMilestone = { id; projectId; title; dueDate; completed = false };
    s.milestones.add(id, m);
    m;
  };

  public func toggleMilestone(s : State, id : Nat) : ?ProjectMilestone {
    switch (s.milestones.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with completed = not existing.completed };
        s.milestones.add(id, updated);
        ?updated;
      };
    };
  };

  public func updateMilestone(
    s : State,
    id : Nat,
    title : Text,
    dueDate : ?Int,
  ) : ?ProjectMilestone {
    switch (s.milestones.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with title; dueDate };
        s.milestones.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteMilestone(s : State, id : Nat) : Bool {
    switch (s.milestones.get(id)) {
      case null false;
      case (?_) {
        s.milestones.remove(id);
        true;
      };
    };
  };

  public func deleteProject(s : State, id : Nat) : Bool {
    switch (s.projects.get(id)) {
      case null false;
      case (?_) {
        s.projects.remove(id);
        // Remove all milestones for this project
        var toRemove : [Nat] = [];
        for ((mid, m) in s.milestones.entries()) {
          if (m.projectId == id) { toRemove := toRemove.concat([mid]) };
        };
        for (mid in toRemove.vals()) { s.milestones.remove(mid) };
        true;
      };
    };
  };
};
