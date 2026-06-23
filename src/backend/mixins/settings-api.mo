import SettingsLib "../lib/settings";
import SettingsTypes "../types/settings";

mixin () {
  let _settingsState : SettingsLib.State = SettingsLib.defaultState();

  public query func getWorkspaceSettings() : async SettingsTypes.WorkspaceSettings {
    SettingsLib.getWorkspaceSettings(_settingsState);
  };

  public query func getUserSettings() : async SettingsTypes.UserSettings {
    SettingsLib.getUserSettings(_settingsState);
  };

  public func updateWorkspaceSettings(name : Text, description : Text) : async SettingsTypes.WorkspaceSettings {
    SettingsLib.updateWorkspaceSettings(_settingsState, name, description);
  };

  public func updateUserSettings(
    displayName : Text,
    email : Text,
    notificationsEnabled : Bool,
    theme : Text,
  ) : async SettingsTypes.UserSettings {
    SettingsLib.updateUserSettings(_settingsState, displayName, email, notificationsEnabled, theme);
  };
};
