module {
  public type WorkspaceSettings = {
    name : Text;
    description : Text;
  };

  public type UserSettings = {
    displayName : Text;
    email : Text;
    notificationsEnabled : Bool;
    theme : Text;
  };
};
