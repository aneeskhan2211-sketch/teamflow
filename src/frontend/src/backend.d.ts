import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ActivityEntry {
    id: bigint;
    action: string;
    moduleName: string;
    userId: string;
    description: string;
    timestamp: bigint;
}
export type Timestamp = bigint;
export interface AuthUser {
    id: bigint;
    title: string;
    principal?: Principal;
    name: string;
    createdAt?: bigint;
    role: Variant_member_admin_owner_guest;
    email: string;
    avatarColor: string;
    department: string;
    lastLogin?: bigint;
}
export interface Document {
    id: bigint;
    title: string;
    content: string;
    authorId: UserId;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    workspaceId: bigint;
    folderId?: bigint;
}
export interface Task {
    id: bigint;
    status: TaskStatus;
    title: string;
    createdAt: Timestamp;
    tags: Array<string>;
    dueDate?: Timestamp;
    description: string;
    assigneeIds: Array<UserId>;
    projectId?: bigint;
    priority: TaskPriority;
    listId: bigint;
}
export interface NoteFolder {
    id: bigint;
    name: string;
    createdAt: bigint;
}
export interface Calendar {
    id: bigint;
    name: string;
    color: string;
    visible: boolean;
}
export interface Folder {
    id: bigint;
    name: string;
    workspaceId: bigint;
    parentId?: bigint;
}
export interface Note {
    id: bigint;
    title: string;
    content: string;
    createdAt: bigint;
    updatedAt: bigint;
    folderId?: bigint;
}
export interface DirectMessage {
    id: bigint;
    content: string;
    createdAt: Timestamp;
    toUserId: UserId;
    fromUserId: UserId;
}
export interface Slide {
    id: bigint;
    visualType: string;
    title: string;
    content: string;
    presentationId: bigint;
    position: bigint;
}
export interface Sheet {
    id: bigint;
    name: string;
    createdAt: bigint;
    updatedAt: bigint;
}
export interface Workspace {
    id: bigint;
    ownerId: UserId;
    name: string;
    createdAt: Timestamp;
    memberIds: Array<UserId>;
}
export interface User {
    id: UserId;
    title: string;
    name: string;
    role: Variant_member_admin_owner_guest;
    email: string;
    avatarColor: string;
    department: string;
}
export interface Channel {
    id: bigint;
    topic: string;
    name: string;
    createdAt: Timestamp;
    workspaceId: bigint;
}
export interface Presentation {
    id: bigint;
    title: string;
    createdAt: bigint;
    updatedAt: bigint;
}
export type UserId = bigint;
export interface CalendarEvent {
    id: bigint;
    startTime: bigint;
    title: string;
    endTime: bigint;
    allDay: boolean;
    color: string;
    description: string;
    calendarId: bigint;
}
export interface Notification {
    id: bigint;
    title: string;
    notifType: Variant_update_mention_activity;
    body: string;
    userId: UserId;
    createdAt: Timestamp;
    sourceId?: bigint;
    isRead: boolean;
    sourceType?: string;
}
export interface Message {
    id: bigint;
    content: string;
    channelId: bigint;
    authorId: UserId;
    createdAt: Timestamp;
}
export interface SheetCell {
    col: bigint;
    row: bigint;
    value: string;
    sheetId: bigint;
}
export interface WorkspaceSettings {
    name: string;
    description: string;
}
export interface UserSettings {
    theme: string;
    notificationsEnabled: boolean;
    displayName: string;
    email: string;
}
export interface ProjectMilestone {
    id: bigint;
    title: string;
    completed: boolean;
    dueDate?: bigint;
    projectId: bigint;
}
export interface Project {
    id: bigint;
    status: string;
    ownerId: string;
    name: string;
    createdAt: bigint;
    color: string;
    description: string;
    updatedAt: bigint;
}
export interface TaskList {
    id: bigint;
    name: string;
    projectId?: bigint;
    workspaceId: bigint;
    isPersonal: boolean;
}
export interface Person {
    id: bigint;
    status: string;
    avatarInitials: string;
    name: string;
    createdAt: bigint;
    role: string;
    email: string;
    department: string;
}
export enum TaskPriority {
    low = "low",
    normal = "normal",
    high = "high",
    urgent = "urgent"
}
export enum TaskStatus {
    done = "done",
    blocked = "blocked",
    todo = "todo",
    inProgress = "inProgress"
}
export enum Variant_member_admin_owner_guest {
    member = "member",
    admin = "admin",
    owner = "owner",
    guest = "guest"
}
export enum Variant_update_mention_activity {
    update = "update",
    mention = "mention",
    activity = "activity"
}
export interface backendInterface {
    addActivity(module: string, action: string, description: string, userId: string): Promise<ActivityEntry>;
    addPerson(name: string, role: string, email: string, department: string, avatarInitials: string): Promise<Person>;
    assignMemberRole(targetPrincipal: Principal, role: string): Promise<boolean>;
    clearSheetCell(sheetId: bigint, row: bigint, col: bigint): Promise<boolean>;
    completeOnboarding(name: string, workspaceName: string, title: string, department: string, avatarColor: string): Promise<AuthUser>;
    createCalendar(name: string, color: string): Promise<Calendar>;
    createCalendarEvent(title: string, description: string, startTime: bigint, endTime: bigint, allDay: boolean, color: string, calendarId: bigint): Promise<CalendarEvent>;
    createChannel(name: string, topic: string): Promise<Channel>;
    createDocument(title: string, folderId: bigint | null): Promise<Document>;
    createNote(title: string, folderId: bigint | null): Promise<Note>;
    createNoteFolder(name: string): Promise<NoteFolder>;
    createPresentation(title: string): Promise<Presentation>;
    createProject(name: string, description: string, status: string, color: string, ownerId: string): Promise<Project>;
    createProjectMilestone(projectId: bigint, title: string, dueDate: bigint | null): Promise<ProjectMilestone>;
    createSheet(name: string): Promise<Sheet>;
    createSlide(presentationId: bigint, position: bigint, title: string, content: string, visualType: string): Promise<Slide>;
    createTask(title: string, description: string, assigneeIds: Array<bigint>, dueDate: bigint | null, priority: TaskPriority, status: TaskStatus, listId: bigint, tags: Array<string>, projectId: bigint | null): Promise<Task>;
    deleteCalendarEvent(id: bigint): Promise<boolean>;
    deleteNote(id: bigint): Promise<boolean>;
    deleteNoteFolder(id: bigint): Promise<boolean>;
    deletePresentation(id: bigint): Promise<boolean>;
    deleteProject(id: bigint): Promise<boolean>;
    deleteProjectMilestone(id: bigint): Promise<boolean>;
    deleteSheet(id: bigint): Promise<boolean>;
    deleteSlide(id: bigint): Promise<boolean>;
    generateInviteCode(): Promise<string>;
    getActivityFeed(limit: bigint | null): Promise<Array<ActivityEntry>>;
    getAllTasks(): Promise<Array<Task>>;
    getCalendarEvents(calendarId: bigint | null): Promise<Array<CalendarEvent>>;
    getCalendars(): Promise<Array<Calendar>>;
    getChannels(): Promise<Array<Channel>>;
    getDirectMessages(userId: bigint, withUserId: bigint): Promise<Array<DirectMessage>>;
    getDocument(id: bigint): Promise<Document | null>;
    getDocuments(folderId: bigint | null): Promise<Array<Document>>;
    getFolders(): Promise<Array<Folder>>;
    getMe(): Promise<AuthUser | null>;
    getMessages(channelId: bigint): Promise<Array<Message>>;
    getNote(id: bigint): Promise<Note | null>;
    getNoteFolders(): Promise<Array<NoteFolder>>;
    getNotes(folderId: bigint | null): Promise<Array<Note>>;
    getNotifications(userId: bigint): Promise<Array<Notification>>;
    getPeople(): Promise<Array<Person>>;
    getPerson(id: bigint): Promise<Person | null>;
    getPresentation(id: bigint): Promise<Presentation | null>;
    getPresentationSlides(presentationId: bigint): Promise<Array<Slide>>;
    getPresentations(): Promise<Array<Presentation>>;
    getProject(id: bigint): Promise<Project | null>;
    getProjectMilestones(projectId: bigint): Promise<Array<ProjectMilestone>>;
    getProjects(): Promise<Array<Project>>;
    getSheet(id: bigint): Promise<Sheet | null>;
    getSheetCells(sheetId: bigint): Promise<Array<SheetCell>>;
    getSheets(): Promise<Array<Sheet>>;
    getTaskLists(): Promise<Array<TaskList>>;
    getTasks(listId: bigint): Promise<Array<Task>>;
    getUser(id: bigint): Promise<User | null>;
    getUserSettings(): Promise<UserSettings>;
    getUsers(): Promise<Array<User>>;
    getWorkspace(): Promise<Workspace | null>;
    getWorkspaceMembers(): Promise<Array<AuthUser>>;
    getWorkspaceSettings(): Promise<WorkspaceSettings>;
    isOnboarded(): Promise<boolean>;
    joinWithInviteCode(code: string, name: string, avatarColor: string): Promise<AuthUser | null>;
    markAllNotificationsRead(userId: bigint): Promise<boolean>;
    markNotificationRead(id: bigint): Promise<boolean>;
    registerUser(name: string, email: string, avatarColor: string): Promise<AuthUser>;
    removeMember(id: bigint): Promise<boolean>;
    removeMemberByPrincipal(targetPrincipal: Principal): Promise<boolean>;
    renamePresentation(id: bigint, title: string): Promise<Presentation | null>;
    renameSheet(id: bigint, name: string): Promise<Sheet | null>;
    reorderSlides(presentationId: bigint, orderedIds: Array<bigint>): Promise<Array<Slide>>;
    sendDirectMessage(fromUserId: bigint, toUserId: bigint, content: string): Promise<DirectMessage>;
    sendMessage(channelId: bigint, content: string, authorId: bigint): Promise<Message>;
    setSheetCell(sheetId: bigint, row: bigint, col: bigint, value: string): Promise<SheetCell>;
    toggleCalendarVisibility(id: bigint): Promise<Calendar | null>;
    toggleProjectMilestone(id: bigint): Promise<ProjectMilestone | null>;
    updateCalendarEvent(id: bigint, title: string, description: string, startTime: bigint, endTime: bigint, allDay: boolean, color: string): Promise<CalendarEvent | null>;
    updateDocument(id: bigint, title: string, content: string): Promise<Document | null>;
    updateMember(id: bigint, name: string, role: string, email: string, department: string): Promise<Person | null>;
    updateMyProfile(name: string, title: string, department: string, avatarColor: string): Promise<boolean>;
    updateNote(id: bigint, title: string, content: string): Promise<Note | null>;
    updatePersonStatus(id: bigint, status: string): Promise<Person | null>;
    updateProject(id: bigint, name: string, description: string, status: string): Promise<Project | null>;
    updateProjectMilestone(id: bigint, title: string, dueDate: bigint | null): Promise<ProjectMilestone | null>;
    updateSlide(id: bigint, title: string, content: string, visualType: string): Promise<Slide | null>;
    updateTask(id: bigint, title: string, description: string, assigneeIds: Array<bigint>, dueDate: bigint | null, priority: TaskPriority, status: TaskStatus, tags: Array<string>): Promise<Task | null>;
    updateTaskStatus(id: bigint, status: TaskStatus): Promise<Task | null>;
    updateUserSettings(displayName: string, email: string, notificationsEnabled: boolean, theme: string): Promise<UserSettings>;
    updateWorkspaceSettings(name: string, description: string): Promise<WorkspaceSettings>;
    whoAmI(): Promise<Principal>;
}
