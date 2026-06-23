import ProjectsLib "../lib/projects";
import ProjTypes "../types/projects";
import Map "mo:core/Map";

mixin () {
  let _projects : Map.Map<Nat, ProjTypes.Project> = Map.empty<Nat, ProjTypes.Project>();
  let _milestones : Map.Map<Nat, ProjTypes.ProjectMilestone> = Map.empty<Nat, ProjTypes.ProjectMilestone>();
  let _projCounters = { var nextProjectId : Nat = 1; var nextMilestoneId : Nat = 1 };

  let _projState : ProjectsLib.State = {
    projects = _projects;
    milestones = _milestones;
    counters = _projCounters;
  };

  ProjectsLib.seedProjects(_projState);

  public query func getProjects() : async [ProjTypes.Project] {
    ProjectsLib.getProjects(_projState);
  };

  public query func getProject(id : Nat) : async ?ProjTypes.Project {
    ProjectsLib.getProject(_projState, id);
  };

  public query func getProjectMilestones(projectId : Nat) : async [ProjTypes.ProjectMilestone] {
    ProjectsLib.getMilestones(_projState, projectId);
  };

  public func createProject(
    name : Text,
    description : Text,
    status : Text,
    color : Text,
    ownerId : Text,
  ) : async ProjTypes.Project {
    ProjectsLib.createProject(_projState, name, description, status, color, ownerId);
  };

  public func updateProject(
    id : Nat,
    name : Text,
    description : Text,
    status : Text,
  ) : async ?ProjTypes.Project {
    ProjectsLib.updateProject(_projState, id, name, description, status);
  };

  public func createProjectMilestone(
    projectId : Nat,
    title : Text,
    dueDate : ?Int,
  ) : async ProjTypes.ProjectMilestone {
    ProjectsLib.createMilestone(_projState, projectId, title, dueDate);
  };

  public func toggleProjectMilestone(id : Nat) : async ?ProjTypes.ProjectMilestone {
    ProjectsLib.toggleMilestone(_projState, id);
  };

  public func updateProjectMilestone(
    id : Nat,
    title : Text,
    dueDate : ?Int,
  ) : async ?ProjTypes.ProjectMilestone {
    ProjectsLib.updateMilestone(_projState, id, title, dueDate);
  };

  public func deleteProjectMilestone(id : Nat) : async Bool {
    ProjectsLib.deleteMilestone(_projState, id);
  };

  public func deleteProject(id : Nat) : async Bool {
    ProjectsLib.deleteProject(_projState, id);
  };
};
