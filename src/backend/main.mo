import WorkspaceApi "mixins/workspace-api";
import ChatApi "mixins/chat-api";
import TasksApi "mixins/tasks-api";
import DocumentsApi "mixins/documents-api";
import NotificationsApi "mixins/notifications-api";
import NotesApi "mixins/notes-api";
import PeopleApi "mixins/people-api";
import CalendarApi "mixins/calendar-api";
import ProjectsApi "mixins/projects-api";
import SheetsApi "mixins/sheets-api";
import PresentationsApi "mixins/presentations-api";
import ActivityApi "mixins/activity-api";
import SettingsApi "mixins/settings-api";
import AuthApi "mixins/auth-api";

actor {
  include WorkspaceApi();
  include ChatApi();
  include TasksApi();
  include DocumentsApi();
  include NotificationsApi();
  include NotesApi();
  include PeopleApi();
  include CalendarApi();
  include ProjectsApi();
  include SheetsApi();
  include PresentationsApi();
  include ActivityApi();
  include SettingsApi();
  include AuthApi();
};

