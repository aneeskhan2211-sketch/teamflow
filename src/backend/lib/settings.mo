import SettingsTypes "../types/settings";

module {
  public type WorkspaceSettings = SettingsTypes.WorkspaceSettings;
  public type UserSettings = SettingsTypes.UserSettings;

  public type State = {
    workspace : { var settings : WorkspaceSettings };
    user : { var settings : UserSettings };
  };

  public func defaultState() : State {
    {
      workspace = { var settings = { name = "TeamFlow"; description = "A unified collaborative workspace for your team" } };
      user = { var settings = { displayName = "Alex Rivera"; email = "alex@teamflow.app"; notificationsEnabled = true; theme = "light" } };
    };
  };

  public func getWorkspaceSettings(s : State) : WorkspaceSettings {
    s.workspace.settings;
  };

  public func getUserSettings(s : State) : UserSettings {
    s.user.settings;
  };

  public func updateWorkspaceSettings(s : State, name : Text, description : Text) : WorkspaceSettings {
    let updated : WorkspaceSettings = { name; description };
    s.workspace.settings := updated;
    updated;
  };

  public func updateUserSettings(
    s : State,
    displayName : Text,
    email : Text,
    notificationsEnabled : Bool,
    theme : Text,
  ) : UserSettings {
    let updated : UserSettings = { displayName; email; notificationsEnabled; theme };
    s.user.settings := updated;
    updated;
  };
};
