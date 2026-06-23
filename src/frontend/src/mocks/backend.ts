import type { backendInterface, ProjectMilestone } from "../backend";
import {
  TaskPriority,
  TaskStatus,
  Variant_member_admin_owner_guest,
  Variant_update_mention_activity,
} from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);

export const mockBackend: backendInterface = {
  getWorkspace: async () => ({
    id: BigInt(1),
    ownerId: BigInt(1),
    name: "TeamFlow",
    createdAt: now,
    memberIds: [BigInt(1), BigInt(2), BigInt(3), BigInt(4)],
  }),

  getUsers: async () => [
    {
      id: BigInt(1),
      name: "Alice Johnson",
      title: "Product Manager",
      role: Variant_member_admin_owner_guest.owner,
      email: "alice@teamflow.io",
      avatarColor: "#9B59B6",
      department: "Product",
    },
    {
      id: BigInt(2),
      name: "Bob Chen",
      title: "Senior Engineer",
      role: Variant_member_admin_owner_guest.member,
      email: "bob@teamflow.io",
      avatarColor: "#3498DB",
      department: "Engineering",
    },
    {
      id: BigInt(3),
      name: "Carol White",
      title: "Designer",
      role: Variant_member_admin_owner_guest.member,
      email: "carol@teamflow.io",
      avatarColor: "#E74C3C",
      department: "Design",
    },
    {
      id: BigInt(4),
      name: "David Park",
      title: "Marketing Lead",
      role: Variant_member_admin_owner_guest.admin,
      email: "david@teamflow.io",
      avatarColor: "#27AE60",
      department: "Marketing",
    },
  ],

  getUser: async (id) => {
    const users = [
      { id: BigInt(1), name: "Alice Johnson", title: "Product Manager", role: Variant_member_admin_owner_guest.owner, email: "alice@teamflow.io", avatarColor: "#9B59B6", department: "Product" },
      { id: BigInt(2), name: "Bob Chen", title: "Senior Engineer", role: Variant_member_admin_owner_guest.member, email: "bob@teamflow.io", avatarColor: "#3498DB", department: "Engineering" },
    ];
    return users.find(u => u.id === id) ?? null;
  },

  getChannels: async () => [
    { id: BigInt(1), name: "general", topic: "General discussion", createdAt: now, workspaceId: BigInt(1) },
    { id: BigInt(2), name: "announcements", topic: "Company announcements", createdAt: now, workspaceId: BigInt(1) },
    { id: BigInt(3), name: "random", topic: "Off-topic chat", createdAt: now, workspaceId: BigInt(1) },
  ],

  createChannel: async (name, topic) => ({
    id: BigInt(99),
    name,
    topic,
    createdAt: now,
    workspaceId: BigInt(1),
  }),

  getMessages: async (channelId) => {
    if (channelId === BigInt(1)) {
      return [
        { id: BigInt(1), content: "Hey everyone! Welcome to TeamFlow 👋", channelId: BigInt(1), authorId: BigInt(1), createdAt: now - BigInt(3600_000_000_000) },
        { id: BigInt(2), content: "Thanks Alice! This platform looks great.", channelId: BigInt(1), authorId: BigInt(2), createdAt: now - BigInt(1800_000_000_000) },
        { id: BigInt(3), content: "Excited to start using it for our Q3 launch project!", channelId: BigInt(1), authorId: BigInt(3), createdAt: now - BigInt(900_000_000_000) },
      ];
    }
    if (channelId === BigInt(2)) {
      return [
        { id: BigInt(4), content: "Welcome to TeamFlow — your all-in-one workspace. Let's build something great!", channelId: BigInt(2), authorId: BigInt(1), createdAt: now - BigInt(7200_000_000_000) },
      ];
    }
    return [];
  },

  sendMessage: async (channelId, content, authorId) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    content,
    channelId,
    authorId,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  getDirectMessages: async () => [
    { id: BigInt(1), content: "Hey, can you review the design doc?", createdAt: now - BigInt(1800_000_000_000), toUserId: BigInt(1), fromUserId: BigInt(2) },
    { id: BigInt(2), content: "Sure, I'll take a look now!", createdAt: now - BigInt(900_000_000_000), toUserId: BigInt(2), fromUserId: BigInt(1) },
  ],

  sendDirectMessage: async (fromUserId, toUserId, content) => ({
    id: BigInt(99),
    content,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    toUserId,
    fromUserId,
  }),

  getTaskLists: async () => [
    { id: BigInt(1), name: "My Tasks", workspaceId: BigInt(1), isPersonal: true },
    { id: BigInt(2), name: "Sprint 1", workspaceId: BigInt(1), isPersonal: false, projectId: BigInt(1) },
    { id: BigInt(3), name: "Backlog", workspaceId: BigInt(1), isPersonal: false, projectId: BigInt(1) },
    { id: BigInt(4), name: "Sprint 2", workspaceId: BigInt(1), isPersonal: false, projectId: BigInt(2) },
    { id: BigInt(5), name: "Design Sprint", workspaceId: BigInt(1), isPersonal: false, projectId: BigInt(3) },
    { id: BigInt(6), name: "Migration", workspaceId: BigInt(1), isPersonal: false, projectId: BigInt(4) },
    { id: BigInt(7), name: "Tooling", workspaceId: BigInt(1), isPersonal: false, projectId: BigInt(5) },
  ],

  getAllTasks: async () => [
    { id: BigInt(1), title: "Design new dashboard layout", description: "Create wireframes and high-fidelity designs for the dashboard", status: TaskStatus.inProgress, priority: TaskPriority.urgent, assigneeIds: [BigInt(3)], tags: ["design", "ui"], createdAt: now - BigInt(86400_000_000_000), dueDate: now + BigInt(86400_000_000_000), listId: BigInt(2), projectId: BigInt(1) },
    { id: BigInt(2), title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment", status: TaskStatus.todo, priority: TaskPriority.high, assigneeIds: [BigInt(2)], tags: ["devops"], createdAt: now - BigInt(172800_000_000_000), dueDate: now + BigInt(259200_000_000_000), listId: BigInt(2), projectId: BigInt(1) },
    { id: BigInt(3), title: "Write Q3 launch plan", description: "Document goals, milestones, and success metrics", status: TaskStatus.done, priority: TaskPriority.normal, assigneeIds: [BigInt(1), BigInt(4)], tags: ["planning", "q3"], createdAt: now - BigInt(604800_000_000_000), listId: BigInt(1), projectId: BigInt(1) },
    { id: BigInt(4), title: "Review accessibility audit", description: "Fix WCAG 2.1 AA issues identified in audit", status: TaskStatus.blocked, priority: TaskPriority.high, assigneeIds: [BigInt(3)], tags: ["accessibility", "ui"], createdAt: now - BigInt(259200_000_000_000), dueDate: now + BigInt(432000_000_000_000), listId: BigInt(4), projectId: BigInt(2) },
    { id: BigInt(5), title: "Update user onboarding docs", description: "Refresh getting started guide with new screenshots", status: TaskStatus.todo, priority: TaskPriority.low, assigneeIds: [BigInt(4)], tags: ["docs"], createdAt: now - BigInt(432000_000_000_000), listId: BigInt(4), projectId: BigInt(2) },
    { id: BigInt(6), title: "Create brand guidelines", description: "Document logo usage, color palette, and typography rules", status: TaskStatus.inProgress, priority: TaskPriority.high, assigneeIds: [BigInt(3)], tags: ["design", "brand"], createdAt: now - BigInt(345600_000_000_000), dueDate: now + BigInt(172800_000_000_000), listId: BigInt(5), projectId: BigInt(3) },
    { id: BigInt(7), title: "Migrate user database", description: "Move all user records to new PostgreSQL cluster", status: TaskStatus.done, priority: TaskPriority.urgent, assigneeIds: [BigInt(2)], tags: ["data", "backend"], createdAt: now - BigInt(518400_000_000_000), dueDate: now - BigInt(86400_000_000_000), listId: BigInt(6), projectId: BigInt(4) },
    { id: BigInt(8), title: "Set up monitoring", description: "Configure Datadog dashboards and alerting", status: TaskStatus.done, priority: TaskPriority.high, assigneeIds: [BigInt(2), BigInt(4)], tags: ["devops", "monitoring"], createdAt: now - BigInt(432000_000_000_000), dueDate: now - BigInt(172800_000_000_000), listId: BigInt(6), projectId: BigInt(4) },
    { id: BigInt(9), title: "Build CLI scaffolding tool", description: "Create yeoman-like generator for new components", status: TaskStatus.inProgress, priority: TaskPriority.normal, assigneeIds: [BigInt(1)], tags: ["tooling", "frontend"], createdAt: now - BigInt(259200_000_000_000), dueDate: now + BigInt(345600_000_000_000), listId: BigInt(7), projectId: BigInt(5) },
    { id: BigInt(10), title: "Write API documentation", description: "Document all public endpoints with OpenAPI spec", status: TaskStatus.todo, priority: TaskPriority.low, assigneeIds: [BigInt(4)], tags: ["docs", "api"], createdAt: now - BigInt(172800_000_000_000), dueDate: now + BigInt(604800_000_000_000), listId: BigInt(7), projectId: BigInt(5) },
  ],

  getTasks: async (listId) => {
    const all = [
      { id: BigInt(1), title: "Design new dashboard layout", description: "Create wireframes", status: TaskStatus.inProgress, priority: TaskPriority.urgent, assigneeIds: [BigInt(3)], tags: ["design"], createdAt: now, dueDate: now + BigInt(86400_000_000_000), listId: BigInt(2), projectId: BigInt(1) },
      { id: BigInt(2), title: "Set up CI/CD pipeline", description: "Configure GitHub Actions", status: TaskStatus.todo, priority: TaskPriority.high, assigneeIds: [BigInt(2)], tags: ["devops"], createdAt: now, listId: BigInt(2), projectId: BigInt(1) },
      { id: BigInt(3), title: "Write Q3 launch plan", description: "Document goals", status: TaskStatus.done, priority: TaskPriority.normal, assigneeIds: [BigInt(1)], tags: ["planning"], createdAt: now, listId: BigInt(1), projectId: BigInt(1) },
      { id: BigInt(4), title: "Review accessibility audit", description: "Fix WCAG issues", status: TaskStatus.blocked, priority: TaskPriority.high, assigneeIds: [BigInt(3)], tags: ["accessibility"], createdAt: now, listId: BigInt(4), projectId: BigInt(2) },
      { id: BigInt(5), title: "Update user onboarding docs", description: "Refresh guide", status: TaskStatus.todo, priority: TaskPriority.low, assigneeIds: [BigInt(4)], tags: ["docs"], createdAt: now, listId: BigInt(4), projectId: BigInt(2) },
      { id: BigInt(6), title: "Create brand guidelines", description: "Document brand rules", status: TaskStatus.inProgress, priority: TaskPriority.high, assigneeIds: [BigInt(3)], tags: ["design"], createdAt: now, listId: BigInt(5), projectId: BigInt(3) },
      { id: BigInt(7), title: "Migrate user database", description: "Move to PostgreSQL", status: TaskStatus.done, priority: TaskPriority.urgent, assigneeIds: [BigInt(2)], tags: ["data"], createdAt: now, listId: BigInt(6), projectId: BigInt(4) },
      { id: BigInt(8), title: "Set up monitoring", description: "Datadog dashboards", status: TaskStatus.done, priority: TaskPriority.high, assigneeIds: [BigInt(2)], tags: ["devops"], createdAt: now, listId: BigInt(6), projectId: BigInt(4) },
      { id: BigInt(9), title: "Build CLI scaffolding tool", description: "Component generator", status: TaskStatus.inProgress, priority: TaskPriority.normal, assigneeIds: [BigInt(1)], tags: ["tooling"], createdAt: now, listId: BigInt(7), projectId: BigInt(5) },
      { id: BigInt(10), title: "Write API documentation", description: "OpenAPI spec", status: TaskStatus.todo, priority: TaskPriority.low, assigneeIds: [BigInt(4)], tags: ["docs"], createdAt: now, listId: BigInt(7), projectId: BigInt(5) },
    ];
    return all.filter(t => t.listId === listId);
  },

  createTask: async (title, description, assigneeIds, dueDate, priority, status, listId, tags) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    title,
    description,
    assigneeIds,
    dueDate: dueDate ?? undefined,
    priority,
    status,
    listId,
    tags,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  updateTask: async (id, title, description, assigneeIds, dueDate, priority, status, tags) => ({
    id,
    title,
    description,
    assigneeIds,
    dueDate: dueDate ?? undefined,
    priority,
    status,
    tags,
    listId: BigInt(1),
    createdAt: now,
  }),

  updateTaskStatus: async (id, status) => ({
    id,
    title: "Task",
    description: "",
    assigneeIds: [],
    priority: TaskPriority.normal,
    status,
    tags: [],
    listId: BigInt(1),
    createdAt: now,
  }),

  getFolders: async () => [
    { id: BigInt(1), name: "Product", workspaceId: BigInt(1) },
    { id: BigInt(2), name: "Engineering", workspaceId: BigInt(1) },
    { id: BigInt(3), name: "Marketing", workspaceId: BigInt(1), parentId: BigInt(1) },
  ],

  getDocuments: async () => [
    { id: BigInt(1), title: "Q3 Launch Plan", content: "# Q3 Launch Plan\n\nThis document outlines our strategy for the Q3 product launch.\n\n## Goals\n\n- Increase user acquisition by 40%\n- Launch 3 new features\n- Achieve 95% uptime\n\n## Timeline\n\nThe launch is scheduled for September 15th.", authorId: BigInt(1), createdAt: now - BigInt(604800_000_000_000), updatedAt: now - BigInt(86400_000_000_000), workspaceId: BigInt(1), folderId: BigInt(1) },
    { id: BigInt(2), title: "Engineering Handbook", content: "# Engineering Handbook\n\nWelcome to the TeamFlow engineering handbook.\n\n## Code Standards\n\nWe follow TypeScript strict mode and use ESLint.", authorId: BigInt(2), createdAt: now - BigInt(1209600_000_000_000), updatedAt: now - BigInt(172800_000_000_000), workspaceId: BigInt(1), folderId: BigInt(2) },
    { id: BigInt(3), title: "Brand Guidelines", content: "# Brand Guidelines\n\nTeamFlow brand standards and usage guidelines.", authorId: BigInt(3), createdAt: now - BigInt(259200_000_000_000), updatedAt: now - BigInt(43200_000_000_000), workspaceId: BigInt(1) },
  ],

  getDocument: async (id) => ({
    id,
    title: "Q3 Launch Plan",
    content: "# Q3 Launch Plan\n\nThis document outlines our strategy for the Q3 product launch.\n\n## Goals\n\n- Increase user acquisition by 40%\n- Launch 3 new features\n- Achieve 95% uptime\n\n## Timeline\n\nThe launch is scheduled for September 15th.",
    authorId: BigInt(1),
    createdAt: now - BigInt(604800_000_000_000),
    updatedAt: now - BigInt(86400_000_000_000),
    workspaceId: BigInt(1),
  }),

  createDocument: async (title, folderId) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    title,
    content: "",
    authorId: BigInt(1),
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
    workspaceId: BigInt(1),
    folderId: folderId ?? undefined,
  }),

  updateDocument: async (id, title, content) => ({
    id,
    title,
    content,
    authorId: BigInt(1),
    createdAt: now,
    updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
    workspaceId: BigInt(1),
  }),

  getNotifications: async () => [
    { id: BigInt(1), title: "New task assigned", body: "Alice assigned you to 'Design new dashboard layout'", notifType: Variant_update_mention_activity.activity, userId: BigInt(2), createdAt: now - BigInt(3600_000_000_000), isRead: false, sourceType: "task", sourceId: BigInt(1) },
    { id: BigInt(2), title: "@mention in #general", body: "Bob mentioned you in #general: 'Great work!'", notifType: Variant_update_mention_activity.mention, userId: BigInt(1), createdAt: now - BigInt(7200_000_000_000), isRead: false, sourceType: "message", sourceId: BigInt(2) },
    { id: BigInt(3), title: "Document updated", body: "Carol updated 'Q3 Launch Plan'", notifType: Variant_update_mention_activity.update, userId: BigInt(1), createdAt: now - BigInt(10800_000_000_000), isRead: true, sourceType: "document", sourceId: BigInt(1) },
  ],

  markNotificationRead: async () => true,
  markAllNotificationsRead: async () => true,

  getPeople: async () => [
    { id: BigInt(1), name: "Alex Rivera", role: "Engineering Lead", email: "alex.rivera@teamflow.io", department: "Engineering", status: "online", avatarInitials: "AR", createdAt: now },
    { id: BigInt(2), name: "Priya Nair", role: "Product Designer", email: "priya.nair@teamflow.io", department: "Design", status: "online", avatarInitials: "PN", createdAt: now },
    { id: BigInt(3), name: "Marcus Chen", role: "Product Manager", email: "marcus.chen@teamflow.io", department: "Product", status: "away", avatarInitials: "MC", createdAt: now },
    { id: BigInt(4), name: "Sofia Andersen", role: "Senior Engineer", email: "sofia.andersen@teamflow.io", department: "Engineering", status: "online", avatarInitials: "SA", createdAt: now },
    { id: BigInt(5), name: "Jordan Ellis", role: "Marketing Lead", email: "jordan.ellis@teamflow.io", department: "Marketing", status: "offline", avatarInitials: "JE", createdAt: now },
    { id: BigInt(6), name: "Yuki Tanaka", role: "UX Researcher", email: "yuki.tanaka@teamflow.io", department: "Design", status: "away", avatarInitials: "YT", createdAt: now },
    { id: BigInt(7), name: "Daniel Park", role: "Frontend Engineer", email: "daniel.park@teamflow.io", department: "Engineering", status: "online", avatarInitials: "DP", createdAt: now },
    { id: BigInt(8), name: "Camille Dupont", role: "Sales Manager", email: "camille.dupont@teamflow.io", department: "Sales", status: "offline", avatarInitials: "CD", createdAt: now },
    { id: BigInt(9), name: "Leo Vasquez", role: "Data Engineer", email: "leo.vasquez@teamflow.io", department: "Engineering", status: "online", avatarInitials: "LV", createdAt: now },
    { id: BigInt(10), name: "Nadia Osei", role: "Product Analyst", email: "nadia.osei@teamflow.io", department: "Product", status: "online", avatarInitials: "NO", createdAt: now },
  ],

  getPerson: async (id) => {
    const people = [
      { id: BigInt(1), name: "Alex Rivera", role: "Engineering Lead", email: "alex.rivera@teamflow.io", department: "Engineering", status: "online", avatarInitials: "AR", createdAt: now },
      { id: BigInt(2), name: "Priya Nair", role: "Product Designer", email: "priya.nair@teamflow.io", department: "Design", status: "online", avatarInitials: "PN", createdAt: now },
      { id: BigInt(3), name: "Marcus Chen", role: "Product Manager", email: "marcus.chen@teamflow.io", department: "Product", status: "away", avatarInitials: "MC", createdAt: now },
      { id: BigInt(4), name: "Sofia Andersen", role: "Senior Engineer", email: "sofia.andersen@teamflow.io", department: "Engineering", status: "online", avatarInitials: "SA", createdAt: now },
      { id: BigInt(5), name: "Jordan Ellis", role: "Marketing Lead", email: "jordan.ellis@teamflow.io", department: "Marketing", status: "offline", avatarInitials: "JE", createdAt: now },
      { id: BigInt(6), name: "Yuki Tanaka", role: "UX Researcher", email: "yuki.tanaka@teamflow.io", department: "Design", status: "away", avatarInitials: "YT", createdAt: now },
      { id: BigInt(7), name: "Daniel Park", role: "Frontend Engineer", email: "daniel.park@teamflow.io", department: "Engineering", status: "online", avatarInitials: "DP", createdAt: now },
      { id: BigInt(8), name: "Camille Dupont", role: "Sales Manager", email: "camille.dupont@teamflow.io", department: "Sales", status: "offline", avatarInitials: "CD", createdAt: now },
      { id: BigInt(9), name: "Leo Vasquez", role: "Data Engineer", email: "leo.vasquez@teamflow.io", department: "Engineering", status: "online", avatarInitials: "LV", createdAt: now },
      { id: BigInt(10), name: "Nadia Osei", role: "Product Analyst", email: "nadia.osei@teamflow.io", department: "Product", status: "online", avatarInitials: "NO", createdAt: now },
    ];
    return people.find(p => p.id === id) ?? null;
  },

  addPerson: async (name, role, email, department, avatarInitials) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    name,
    role,
    email,
    department,
    status: "online",
    avatarInitials,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  updateMember: async (id, name, role, email, department) => ({
    id,
    name,
    role,
    email,
    department,
    status: "online",
    avatarInitials: "??",
    createdAt: now,
  }),

  updatePersonStatus: async (id, status) => ({
    id,
    name: "Member",
    role: "Member",
    email: "",
    department: "",
    status,
    avatarInitials: "??",
    createdAt: now,
  }),

  removeMember: async () => true,

  // ─── Presentations ──────────────────────────────────────────────────────────

  getPresentations: async () => [
    { id: BigInt(1), title: "Q2 Business Review", createdAt: now - BigInt(1209600_000_000_000), updatedAt: now - BigInt(86400_000_000_000) },
    { id: BigInt(2), title: "Product Roadmap 2024", createdAt: now - BigInt(1814400_000_000_000), updatedAt: now - BigInt(172800_000_000_000) },
    { id: BigInt(3), title: "New Employee Onboarding", createdAt: now - BigInt(259200_000_000_000), updatedAt: now - BigInt(43200_000_000_000) },
    { id: BigInt(4), title: "TeamFlow Platform Overview", createdAt: now - BigInt(604800_000_000_000), updatedAt: now - BigInt(86400_000_000_000) },
  ],

  getPresentation: async (id) => {
    const presentations = [
      { id: BigInt(1), title: "Q2 Business Review", createdAt: now - BigInt(1209600_000_000_000), updatedAt: now - BigInt(86400_000_000_000) },
      { id: BigInt(2), title: "Product Roadmap 2024", createdAt: now - BigInt(1814400_000_000_000), updatedAt: now - BigInt(172800_000_000_000) },
      { id: BigInt(3), title: "New Employee Onboarding", createdAt: now - BigInt(259200_000_000_000), updatedAt: now - BigInt(43200_000_000_000) },
      { id: BigInt(4), title: "TeamFlow Platform Overview", createdAt: now - BigInt(604800_000_000_000), updatedAt: now - BigInt(86400_000_000_000) },
    ];
    return presentations.find(p => p.id === id) ?? null;
  },

  createPresentation: async (title) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    title,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  renamePresentation: async (id, title) => ({
    id,
    title,
    createdAt: now,
    updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  deletePresentation: async () => true,

  getPresentationSlides: async (presentationId) => {
    if (presentationId === BigInt(1)) {
      return [
        { id: BigInt(101), presentationId: BigInt(1), position: BigInt(0), title: "Q2 Business Review", content: "Executive summary of Q2 performance across all business units.", visualType: "text" },
        { id: BigInt(102), presentationId: BigInt(1), position: BigInt(1), title: "Revenue", content: "$4.2M\n+18% YoY\n$1.1M net profit", visualType: "stat" },
        { id: BigInt(103), presentationId: BigInt(1), position: BigInt(2), title: "Growth Metrics", content: "12,400 users\n+34% MoM\n8.7% churn", visualType: "stat" },
        { id: BigInt(104), presentationId: BigInt(1), position: BigInt(3), title: "CEO Message", content: "This quarter proved that our strategy is working. — Sarah Chen, CEO", visualType: "quote" },
        { id: BigInt(105), presentationId: BigInt(1), position: BigInt(4), title: "Q3 Roadmap", content: "Launch enterprise tier\nExpand to EU market\nHire 15 engineers", visualType: "list" },
        { id: BigInt(106), presentationId: BigInt(1), position: BigInt(5), title: "Headcount", content: "We grew from 42 to 57 team members this quarter, with the biggest growth in Engineering and Customer Success.", visualType: "text" },
      ];
    }
    if (presentationId === BigInt(2)) {
      return [
        { id: BigInt(201), presentationId: BigInt(2), position: BigInt(0), title: "Product Roadmap 2024", content: "Our vision for the product over the next 12 months.", visualType: "text" },
        { id: BigInt(202), presentationId: BigInt(2), position: BigInt(1), title: "Q1 Features", content: "Dark mode\nMobile app v1\nAPI webhooks", visualType: "list" },
        { id: BigInt(203), presentationId: BigInt(2), position: BigInt(2), title: "Q2 Features", content: "Real-time collaboration\nCustom dashboards\nSSO integration", visualType: "list" },
        { id: BigInt(204), presentationId: BigInt(2), position: BigInt(3), title: "Q3 Features", content: "AI assistant\nAdvanced analytics\nWhite-label options", visualType: "list" },
        { id: BigInt(205), presentationId: BigInt(2), position: BigInt(4), title: "Q4 Features", content: "Enterprise SLA\nOn-premise deployment\nPartner marketplace", visualType: "list" },
        { id: BigInt(206), presentationId: BigInt(2), position: BigInt(5), title: "Product Vision", content: "Build the workspace that teams actually want to use. — Marcus Chen, Product Lead", visualType: "quote" },
        { id: BigInt(207), presentationId: BigInt(2), position: BigInt(6), title: "Release Timeline", content: "Q1 2024: Foundation release\nQ2 2024: Scale release\nQ3 2024: Intelligence release\nQ4 2024: Enterprise release", visualType: "list" },
      ];
    }
    if (presentationId === BigInt(3)) {
      return [
        { id: BigInt(301), presentationId: BigInt(3), position: BigInt(0), title: "Welcome to TeamFlow", content: "We're excited to have you join us. This deck will guide you through your first week.", visualType: "text" },
        { id: BigInt(302), presentationId: BigInt(3), position: BigInt(1), title: "Your First Week", content: "Day 1: Setup and introductions\nDay 2: Tool access and training\nDay 3: First project shadowing\nDay 4: Team lunch and feedback\nDay 5: First solo task", visualType: "list" },
        { id: BigInt(303), presentationId: BigInt(3), position: BigInt(2), title: "Our Values", content: "Customer obsession\nMove fast with intention\nRadical transparency\nBuild for the long term\nHelp others succeed", visualType: "list" },
        { id: BigInt(304), presentationId: BigInt(3), position: BigInt(3), title: "Org Structure", content: "You report to your team lead. Cross-functional pods own features end-to-end. Engineering, Design, Product, and Marketing collaborate in shared channels.", visualType: "text" },
        { id: BigInt(305), presentationId: BigInt(3), position: BigInt(4), title: "Benefits Overview", content: "25 days PTO\n$500 learning budget\nHealth + dental\nRemote-first\nStock options", visualType: "stat" },
        { id: BigInt(306), presentationId: BigInt(3), position: BigInt(5), title: "From the Team", content: "The onboarding here is the best I've experienced. You'll feel at home by day 3. — Priya Nair, Design", visualType: "quote" },
        { id: BigInt(307), presentationId: BigInt(3), position: BigInt(6), title: "Next Steps", content: "Complete your profile, join #new-hires, and book a 1:1 with your buddy. Welcome aboard!", visualType: "text" },
      ];
    }
    if (presentationId === BigInt(4)) {
      return [
        { id: BigInt(401), presentationId: BigInt(4), position: BigInt(0), title: "TeamFlow Platform Overview", content: "The unified workspace for modern teams.", visualType: "text" },
        { id: BigInt(402), presentationId: BigInt(4), position: BigInt(1), title: "What Is TeamFlow?", content: "Tasks and project tracking\nReal-time documents\nTeam chat and channels\nShared calendars\nSpreadsheets and databases\nNotes and knowledge base\nPresentations and decks", visualType: "list" },
        { id: BigInt(403), presentationId: BigInt(4), position: BigInt(2), title: "By The Numbers", content: "10,000+ teams\n99.9% uptime\n11 modules\n4.8/5 rating", visualType: "stat" },
        { id: BigInt(404), presentationId: BigInt(4), position: BigInt(3), title: "Key Differentiators", content: "Everything in one place\nNo context switching\nBuilt for speed\nPrivacy-first\nOpen API", visualType: "list" },
        { id: BigInt(405), presentationId: BigInt(4), position: BigInt(4), title: "Customer Story", content: "TeamFlow replaced 6 tools for us. Our team saves 8 hours per week. — Alex Rivera, Engineering Lead", visualType: "quote" },
        { id: BigInt(406), presentationId: BigInt(4), position: BigInt(5), title: "Get Started", content: "Set up your workspace in under 5 minutes. Import from Notion, Slack, or Google Workspace. Invite your team and start collaborating.", visualType: "text" },
      ];
    }
    return [];
  },

  createSlide: async (presentationId, position, title, content, visualType) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    presentationId,
    position,
    title,
    content,
    visualType,
  }),

  updateSlide: async (id, title, content, visualType) => ({
    id,
    title,
    content,
    visualType,
    presentationId: BigInt(1),
    position: BigInt(0),
  }),

  deleteSlide: async () => true,

  reorderSlides: async (_presentationId, orderedIds) =>
    orderedIds.map((id, idx) => ({
      id,
      presentationId: _presentationId,
      position: BigInt(idx),
      title: "Slide",
      content: "",
      visualType: "list",
    })),

  // ─── Projects ───────────────────────────────────────────────────────────────

  getProjects: async () => [
    { id: BigInt(1), name: "Q3 Product Launch", description: "Full product launch for Q3, covering marketing, engineering, and customer success handoffs.", status: "active", ownerId: "1", color: "#6366F1", memberIds: ["1", "2", "3"], createdAt: now - BigInt(604800_000_000_000), updatedAt: now - BigInt(86400_000_000_000) },
    { id: BigInt(2), name: "Client Onboarding Redesign", description: "Redesign the onboarding flow for enterprise clients to reduce time-to-value from 14 days to under 5.", status: "active", ownerId: "2", color: "#8B5CF6", memberIds: ["2", "3", "4"], createdAt: now - BigInt(1209600_000_000_000), updatedAt: now - BigInt(172800_000_000_000) },
    { id: BigInt(3), name: "Annual Brand Refresh", description: "Update brand identity including logo variants, color system, typography, and guidelines doc.", status: "on-hold", ownerId: "3", color: "#EC4899", memberIds: ["1", "3"], createdAt: now - BigInt(259200_000_000_000), updatedAt: now - BigInt(43200_000_000_000) },
    { id: BigInt(4), name: "Data Migration v2", description: "Completed migration of all customer records to the new data warehouse.", status: "complete", ownerId: "4", color: "#10B981", memberIds: ["2", "4"], createdAt: now - BigInt(432000_000_000_000), updatedAt: now - BigInt(86400_000_000_000) },
    { id: BigInt(5), name: "Internal Dev Tooling", description: "Build out internal CLI tooling, linting rules, and shared component scaffolding.", status: "active", ownerId: "5", color: "#F59E0B", memberIds: ["1", "2"], createdAt: now - BigInt(172800_000_000_000), updatedAt: now - BigInt(43200_000_000_000) },
  ],

  getProject: async (id) => {
    const projects = [
      { id: BigInt(1), name: "Q3 Product Launch", description: "Full product launch for Q3, covering marketing, engineering, and customer success handoffs.", status: "active", ownerId: "1", color: "#6366F1", memberIds: ["1", "2", "3"], createdAt: now - BigInt(604800_000_000_000), updatedAt: now - BigInt(86400_000_000_000) },
      { id: BigInt(2), name: "Client Onboarding Redesign", description: "Redesign the onboarding flow for enterprise clients to reduce time-to-value from 14 days to under 5.", status: "active", ownerId: "2", color: "#8B5CF6", memberIds: ["2", "3", "4"], createdAt: now - BigInt(1209600_000_000_000), updatedAt: now - BigInt(172800_000_000_000) },
      { id: BigInt(3), name: "Annual Brand Refresh", description: "Update brand identity including logo variants, color system, typography, and guidelines doc.", status: "on-hold", ownerId: "3", color: "#EC4899", memberIds: ["1", "3"], createdAt: now - BigInt(259200_000_000_000), updatedAt: now - BigInt(43200_000_000_000) },
      { id: BigInt(4), name: "Data Migration v2", description: "Completed migration of all customer records to the new data warehouse.", status: "complete", ownerId: "4", color: "#10B981", memberIds: ["2", "4"], createdAt: now - BigInt(432000_000_000_000), updatedAt: now - BigInt(86400_000_000_000) },
      { id: BigInt(5), name: "Internal Dev Tooling", description: "Build out internal CLI tooling, linting rules, and shared component scaffolding.", status: "active", ownerId: "5", color: "#F59E0B", memberIds: ["1", "2"], createdAt: now - BigInt(172800_000_000_000), updatedAt: now - BigInt(43200_000_000_000) },
    ];
    return projects.find(p => p.id === id) ?? null;
  },

  createProject: async (name, description, status, color, ownerId) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    name,
    description,
    status,
    color,
    ownerId,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  updateProject: async (id, name, description, status) => ({
    id,
    name,
    description,
    status,
    color: "#6366F1",
    ownerId: "1",
    createdAt: now,
    updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  deleteProject: async () => true,

  getProjectMilestones: async (projectId) => {
    const milestones: Record<string, ProjectMilestone[]> = {
      "1": [
        { id: BigInt(1), title: "Design sign-off", completed: true, projectId: BigInt(1) },
        { id: BigInt(2), title: "Engineering freeze", completed: true, projectId: BigInt(1) },
        { id: BigInt(3), title: "QA pass", completed: false, projectId: BigInt(1) },
        { id: BigInt(4), title: "Launch day", completed: false, projectId: BigInt(1) },
      ],
      "2": [
        { id: BigInt(5), title: "User interviews", completed: true, projectId: BigInt(2) },
        { id: BigInt(6), title: "Prototype review", completed: false, projectId: BigInt(2) },
        { id: BigInt(7), title: "Dev handoff", completed: false, projectId: BigInt(2) },
      ],
      "3": [
        { id: BigInt(8), title: "Agency brief sent", completed: true, projectId: BigInt(3) },
        { id: BigInt(9), title: "Logo concepts reviewed", completed: false, projectId: BigInt(3) },
        { id: BigInt(10), title: "Final guidelines doc", completed: false, projectId: BigInt(3) },
      ],
      "4": [
        { id: BigInt(11), title: "Schema mapping", completed: true, projectId: BigInt(4) },
        { id: BigInt(12), title: "Test migration", completed: true, projectId: BigInt(4) },
        { id: BigInt(13), title: "Production cutover", completed: true, projectId: BigInt(4) },
        { id: BigInt(14), title: "Validation & sign-off", completed: true, projectId: BigInt(4) },
      ],
      "5": [
        { id: BigInt(15), title: "CLI prototype", completed: true, projectId: BigInt(5) },
        { id: BigInt(16), title: "Lint rule set published", completed: false, projectId: BigInt(5) },
        { id: BigInt(17), title: "Scaffolding templates done", completed: false, projectId: BigInt(5) },
      ],
    };
    return milestones[String(projectId)] ?? [];
  },

  createProjectMilestone: async (projectId, title, dueDate) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    projectId,
    title,
    completed: false,
    dueDate: dueDate ?? undefined,
  }),

  toggleProjectMilestone: async (id) => ({
    id,
    title: "Milestone",
    completed: true,
    projectId: BigInt(1),
  }),

  deleteProjectMilestone: async () => true,

  // ─── Missing stubs ──────────────────────────────────────────────────────────

  addActivity: async (module, action, description, userId) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    moduleName: module,
    action,
    description,
    userId,
    timestamp: BigInt(Date.now()) * BigInt(1_000_000),
  }),
  clearSheetCell: async () => true,
  createCalendar: async (name, color) => ({ id: BigInt(1), name, color, visible: true }),
  createCalendarEvent: async (title, description, startTime, endTime, allDay, color, calendarId) => ({ id: BigInt(1), title, description, startTime, endTime, allDay, color, calendarId }),
  createNote: async (title, folderId) => ({ id: BigInt(1), title, content: "", createdAt: now, updatedAt: now, folderId: folderId ?? undefined }),
  createNoteFolder: async (name) => ({ id: BigInt(1), name, createdAt: now }),
  createSheet: async (name) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    name,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),
  deleteCalendarEvent: async () => true,
  deleteNote: async () => true,
  deleteNoteFolder: async () => true,
  deleteSheet: async () => true,
  getActivityFeed: async (limit) => {
    const entries = [
      { id: BigInt(1), moduleName: "tasks", action: "created", description: "Created task 'Design new dashboard layout'", userId: "1", timestamp: now - BigInt(3600_000_000_000) },
      { id: BigInt(2), moduleName: "documents", action: "updated", description: "Updated 'Q3 Launch Plan'", userId: "2", timestamp: now - BigInt(7200_000_000_000) },
      { id: BigInt(3), moduleName: "chat", action: "sent", description: "Sent message in #general", userId: "1", timestamp: now - BigInt(900_000_000_000) },
      { id: BigInt(4), moduleName: "projects", action: "created", description: "Created project 'Q3 Roadmap'", userId: "3", timestamp: now - BigInt(86400_000_000_000) },
      { id: BigInt(5), moduleName: "tasks", action: "completed", description: "Completed task 'Write Q3 launch plan'", userId: "1", timestamp: now - BigInt(172800_000_000_000) },
      { id: BigInt(6), moduleName: "calendar", action: "created", description: "Created event 'Team Standup'", userId: "2", timestamp: now - BigInt(1800_000_000_000) },
      { id: BigInt(7), moduleName: "notes", action: "created", description: "Created note 'Meeting Notes'", userId: "4", timestamp: now - BigInt(43200_000_000_000) },
      { id: BigInt(8), moduleName: "people", action: "joined", description: "Added person 'Priya Nair'", userId: "1", timestamp: now - BigInt(604800_000_000_000) },
    ];
    return limit ? entries.slice(0, Number(limit)) : entries;
  },
  getCalendarEvents: async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const msToNs = (ms: number) => BigInt(ms) * 1_000_000n;
    return [
      { id: BigInt(1), calendarId: BigInt(1), title: "Team Standup", startTime: msToNs(startOfMonth.getTime() + 9 * 3600_000), endTime: msToNs(startOfMonth.getTime() + 9.5 * 3600_000), description: "Daily sync", allDay: false, color: "#6366f1" },
      { id: BigInt(2), calendarId: BigInt(1), title: "Sprint Planning", startTime: msToNs(startOfMonth.getTime() + 3 * 86400_000 + 10 * 3600_000), endTime: msToNs(startOfMonth.getTime() + 3 * 86400_000 + 11.5 * 3600_000), description: "Q3 planning", allDay: false, color: "#6366f1" },
      { id: BigInt(3), calendarId: BigInt(2), title: "Lunch with Sarah", startTime: msToNs(startOfMonth.getTime() + 5 * 86400_000 + 12 * 3600_000), endTime: msToNs(startOfMonth.getTime() + 5 * 86400_000 + 13 * 3600_000), description: "", allDay: false, color: "#22c55e" },
      { id: BigInt(4), calendarId: BigInt(1), title: "Design Review", startTime: msToNs(startOfMonth.getTime() + 7 * 86400_000 + 14 * 3600_000), endTime: msToNs(startOfMonth.getTime() + 7 * 86400_000 + 15 * 3600_000), description: "UI/UX review", allDay: false, color: "#6366f1" },
    ];
  },
  getCalendars: async () => [
    { id: BigInt(1), name: "Team", color: "#6366f1", visible: true },
    { id: BigInt(2), name: "Personal", color: "#22c55e", visible: true },
  ],
  getNote: async () => null,
  getNoteFolders: async () => [
    { id: BigInt(1), name: "Personal", createdAt: BigInt(0) },
    { id: BigInt(2), name: "Work", createdAt: BigInt(0) },
  ],
  getNotes: async () => [
    { id: BigInt(1), title: "Welcome to TeamFlow", content: "This is your first note. Use notes to capture ideas, meeting minutes, and anything else.", folderId: BigInt(1), createdAt: BigInt(Date.now()) * 1_000_000n, updatedAt: BigInt(Date.now()) * 1_000_000n },
    { id: BigInt(2), title: "Q3 Goals", content: "1. Launch v2.0\n2. Grow team to 20\n3. Hit $1M ARR", folderId: BigInt(2), createdAt: BigInt(Date.now() - 86400_000) * 1_000_000n, updatedAt: BigInt(Date.now() - 86400_000) * 1_000_000n },
    { id: BigInt(3), title: "Book recommendations", content: "- The Making of a Manager\n- High Growth Handbook\n- An Elegant Puzzle", folderId: BigInt(1), createdAt: BigInt(Date.now() - 172800_000) * 1_000_000n, updatedAt: BigInt(Date.now() - 172800_000) * 1_000_000n },
  ],
  getSheet: async (id) => {
    const sheets = [
      { id: BigInt(1), name: "Sheet1", createdAt: now, updatedAt: now },
      { id: BigInt(2), name: "Sheet2", createdAt: now, updatedAt: now },
      { id: BigInt(3), name: "Budget", createdAt: now, updatedAt: now },
      { id: BigInt(4), name: "Q1 Report", createdAt: now, updatedAt: now },
    ];
    return sheets.find((s) => s.id === id) ?? null;
  },
  getSheetCells: async (sheetId) => {
    if (sheetId === BigInt(1)) {
      return [
        { sheetId: BigInt(1), row: BigInt(0), col: BigInt(0), value: "Product" },
        { sheetId: BigInt(1), row: BigInt(0), col: BigInt(1), value: "Category" },
        { sheetId: BigInt(1), row: BigInt(0), col: BigInt(2), value: "Unit Price" },
        { sheetId: BigInt(1), row: BigInt(0), col: BigInt(3), value: "Qty" },
        { sheetId: BigInt(1), row: BigInt(1), col: BigInt(0), value: "MacBook Pro 14" },
        { sheetId: BigInt(1), row: BigInt(1), col: BigInt(1), value: "Electronics" },
        { sheetId: BigInt(1), row: BigInt(1), col: BigInt(2), value: "$1,999" },
        { sheetId: BigInt(1), row: BigInt(1), col: BigInt(3), value: "24" },
        { sheetId: BigInt(1), row: BigInt(2), col: BigInt(0), value: "Wireless Keyboard" },
        { sheetId: BigInt(1), row: BigInt(2), col: BigInt(1), value: "Peripherals" },
        { sheetId: BigInt(1), row: BigInt(2), col: BigInt(2), value: "$129" },
        { sheetId: BigInt(1), row: BigInt(2), col: BigInt(3), value: "62" },
      ];
    }
    return [];
  },
  getSheets: async () => [
    { id: BigInt(1), name: "Sheet1", createdAt: now, updatedAt: now },
    { id: BigInt(2), name: "Sheet2", createdAt: now, updatedAt: now },
    { id: BigInt(3), name: "Budget", createdAt: now, updatedAt: now },
    { id: BigInt(4), name: "Q1 Report", createdAt: now, updatedAt: now },
  ],
  getUserSettings: async () => ({ displayName: "Admin", email: "admin@teamflow.com", notificationsEnabled: true, theme: "light" }),
  getWorkspaceSettings: async () => ({ name: "TeamFlow", description: "" }),
  renameSheet: async (id, name) => ({
    id,
    name,
    createdAt: now,
    updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),
  setSheetCell: async (sheetId, row, col, value) => ({ sheetId, row, col, value }),
  toggleCalendarVisibility: async (id) => ({ id, name: "", color: "", visible: true }),
  updateCalendarEvent: async (id, title, description, startTime, endTime, allDay, color) => ({ id, title, description, startTime, endTime, allDay, color, calendarId: BigInt(1) }),
  updateNote: async (id, title, content) => ({ id, title, content, createdAt: now, updatedAt: now }),
  updateProjectMilestone: async (id, title, dueDate) => ({ id, title, completed: false, projectId: BigInt(1), dueDate: dueDate ?? undefined }),
  updateUserSettings: async (displayName, email, notificationsEnabled, theme) => ({ displayName, email, notificationsEnabled, theme }),
  updateWorkspaceSettings: async (name, description) => ({ name, description }),

  // ─── Auth / Workspace membership ────────────────────────────────────────────

  assignMemberRole: async () => true,

  completeOnboarding: async (name, workspaceName, title, department, avatarColor) => ({
    id: BigInt(1),
    name,
    title,
    department,
    avatarColor,
    email: "",
    role: Variant_member_admin_owner_guest.owner,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  generateInviteCode: async () => "TEAMFLOW-INVITE-2024",

  getMe: async () => ({
    id: BigInt(1),
    name: "Alice Johnson",
    title: "Product Manager",
    role: Variant_member_admin_owner_guest.owner,
    email: "alice@teamflow.io",
    avatarColor: "#9B59B6",
    department: "Product",
    createdAt: now,
  }),

  getWorkspaceMembers: async () => [
    { id: BigInt(1), name: "Alice Johnson", title: "Product Manager", role: Variant_member_admin_owner_guest.owner, email: "alice@teamflow.io", avatarColor: "#9B59B6", department: "Product", createdAt: now },
    { id: BigInt(2), name: "Bob Chen", title: "Senior Engineer", role: Variant_member_admin_owner_guest.member, email: "bob@teamflow.io", avatarColor: "#3498DB", department: "Engineering", createdAt: now },
    { id: BigInt(3), name: "Carol White", title: "Designer", role: Variant_member_admin_owner_guest.member, email: "carol@teamflow.io", avatarColor: "#E74C3C", department: "Design", createdAt: now },
    { id: BigInt(4), name: "David Park", title: "Marketing Lead", role: Variant_member_admin_owner_guest.admin, email: "david@teamflow.io", avatarColor: "#27AE60", department: "Marketing", createdAt: now },
  ],

  joinWithInviteCode: async (code, name, avatarColor) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    name,
    title: "",
    department: "",
    avatarColor,
    email: "",
    role: Variant_member_admin_owner_guest.member,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  registerUser: async (name, email, avatarColor) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    name,
    title: "",
    department: "",
    avatarColor,
    email,
    role: Variant_member_admin_owner_guest.member,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  removeMemberByPrincipal: async () => true,

  updateMyProfile: async () => true,

  isOnboarded: async () => true,

  whoAmI: async () => {
    const { Principal } = await import("@icp-sdk/core/principal");
    return Principal.anonymous();
  },
};
