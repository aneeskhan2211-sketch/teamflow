import { createActor } from "@/backend";
import type {
  ActivityEntry,
  Message,
  Project,
  ProjectMilestone,
  TaskPriority,
  TaskStatus,
  UserSettings,
  WorkspaceSettings,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useChannels() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChannels();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
    staleTime: 5000,
    gcTime: 5 * 60 * 1000,
  });
}

// Seed messages so chat is never empty on first load
const SEED_MESSAGES: Message[] = [
  {
    id: 101n,
    channelId: 1n,
    authorId: 2n,
    content:
      "Hey team! Just joined the workspace. Excited to work with everyone.",
    createdAt: BigInt(Date.now() - 86400000 * 2) * 1_000_000n,
  },
  {
    id: 102n,
    channelId: 1n,
    authorId: 3n,
    content: "Welcome aboard! Let me know if you need anything.",
    createdAt: BigInt(Date.now() - 86400000 * 2 + 300000) * 1_000_000n,
  },
  {
    id: 103n,
    channelId: 1n,
    authorId: 1n,
    content:
      "Great to have you here. Check out the onboarding doc in #resources.",
    createdAt: BigInt(Date.now() - 86400000 * 2 + 600000) * 1_000_000n,
  },
  {
    id: 104n,
    channelId: 1n,
    authorId: 4n,
    content: "The Q3 roadmap is now live. Take a look and share your thoughts.",
    createdAt: BigInt(Date.now() - 86400000) * 1_000_000n,
  },
  {
    id: 105n,
    channelId: 1n,
    authorId: 2n,
    content:
      "Looks solid. I have some feedback on the timeline — will drop it in the doc.",
    createdAt: BigInt(Date.now() - 86400000 + 900000) * 1_000_000n,
  },
  {
    id: 106n,
    channelId: 1n,
    authorId: 3n,
    content:
      "Design system update is almost ready. Should be able to share tomorrow.",
    createdAt: BigInt(Date.now() - 3600000) * 1_000_000n,
  },
  {
    id: 107n,
    channelId: 1n,
    authorId: 1n,
    content: "Awesome, looking forward to it!",
    createdAt: BigInt(Date.now() - 1800000) * 1_000_000n,
  },
  {
    id: 201n,
    channelId: 2n,
    authorId: 3n,
    content: "New component library is up. 42 components ready for review.",
    createdAt: BigInt(Date.now() - 86400000) * 1_000_000n,
  },
  {
    id: 202n,
    channelId: 2n,
    authorId: 2n,
    content: "The button variants look great. Can we add a loading state?",
    createdAt: BigInt(Date.now() - 86400000 + 600000) * 1_000_000n,
  },
  {
    id: 203n,
    channelId: 2n,
    authorId: 3n,
    content: "Good call — adding that now.",
    createdAt: BigInt(Date.now() - 86400000 + 1200000) * 1_000_000n,
  },
  {
    id: 301n,
    channelId: 3n,
    authorId: 4n,
    content: "Deployment pipeline is green. All tests passing.",
    createdAt: BigInt(Date.now() - 7200000) * 1_000_000n,
  },
  {
    id: 302n,
    channelId: 3n,
    authorId: 1n,
    content: "Nice work! What's the next milestone?",
    createdAt: BigInt(Date.now() - 7000000) * 1_000_000n,
  },
  {
    id: 303n,
    channelId: 3n,
    authorId: 4n,
    content: "Backend API v2. Should be ready for integration by Friday.",
    createdAt: BigInt(Date.now() - 6800000) * 1_000_000n,
  },
];

export function useMessages(channelId: number) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      if (!actor)
        return SEED_MESSAGES.filter((m) => Number(m.channelId) === channelId);
      const backendMsgs = await actor.getMessages(BigInt(channelId));
      const seed = SEED_MESSAGES.filter(
        (m) => Number(m.channelId) === channelId,
      );
      const combined = [...seed, ...backendMsgs];
      // Deduplicate by id
      const seen = new Set<bigint>();
      const deduped = combined.filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      // Sort by createdAt ascending
      deduped.sort((a, b) => Number(a.createdAt - b.createdAt));
      return deduped;
    },
    enabled: !!actor && !isFetching && channelId > 0,
    refetchInterval: 5000,
    staleTime: 5000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUsers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUsers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useTaskLists() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["taskLists"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskLists();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAllTasks() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["allTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useFolders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFolders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useDocuments(_folderId?: number | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDocuments(null);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useNotifications(userId: number) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications(BigInt(userId));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({
      channelId,
      content,
      authorId,
    }: { channelId: number; content: string; authorId: number }) =>
      actor!.sendMessage(BigInt(channelId), content, BigInt(authorId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (t: {
      title: string;
      description: string;
      assigneeIds: number[];
      dueDate: bigint | null;
      priority: string;
      status: string;
      listId: number;
      tags: string[];
      projectId?: number | null;
    }) =>
      actor!.createTask(
        t.title,
        t.description,
        t.assigneeIds.map(BigInt),
        t.dueDate,
        t.priority as unknown as TaskPriority,
        t.status as unknown as TaskStatus,
        BigInt(t.listId),
        t.tags,
        t.projectId != null ? BigInt(t.projectId) : null,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allTasks"] }),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      actor!.updateTaskStatus(BigInt(id), status as unknown as TaskStatus),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allTasks"] }),
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({
      title,
      folderId,
    }: { title: string; folderId: number | null }) =>
      actor!.createDocument(title, folderId !== null ? BigInt(folderId) : null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({
      id,
      title,
      content,
    }: { id: number; title: string; content: string }) =>
      actor!.updateDocument(BigInt(id), title, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (userId: number) =>
      actor!.markAllNotificationsRead(BigInt(userId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useActivityFeed(limit?: number) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["activity", limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivityFeed(limit !== undefined ? BigInt(limit) : null);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
    staleTime: 5000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useWorkspaceSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["workspaceSettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWorkspaceSettings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUserSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserSettings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUpdateWorkspaceSettings() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({
      name,
      description,
    }: { name: string; description: string }) =>
      actor!.updateWorkspaceSettings(name, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaceSettings"] }),
  });
}

export function useUpdateUserSettings() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (settings: {
      displayName: string;
      email: string;
      notificationsEnabled: boolean;
      theme: string;
    }) =>
      actor!.updateUserSettings(
        settings.displayName,
        settings.email,
        settings.notificationsEnabled,
        settings.theme,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userSettings"] }),
  });
}

// ─── Presentations ────────────────────────────────────────────────────────────

export function usePresentations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["presentations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPresentations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });
}

export function usePresentationSlides(presentationId: number | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["slides", presentationId],
    queryFn: async () => {
      if (!actor || presentationId === null) return [];
      return actor.getPresentationSlides(BigInt(presentationId));
    },
    enabled: !!actor && !isFetching && presentationId !== null,
    refetchInterval: 30000,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreatePresentation() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (title: string) => actor!.createPresentation(title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presentations"] }),
  });
}

export function useRenamePresentation() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      actor!.renamePresentation(BigInt(id), title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presentations"] }),
  });
}

export function useDeletePresentation() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (id: number) => actor!.deletePresentation(BigInt(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presentations"] }),
  });
}

export function useCreateSlide() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (s: {
      presentationId: number;
      position: number;
      title: string;
      content: string;
      visualType: string;
    }) =>
      actor!.createSlide(
        BigInt(s.presentationId),
        BigInt(s.position),
        s.title,
        s.content,
        s.visualType,
      ),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["slides", vars.presentationId] }),
  });
}

export function useUpdateSlide() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({
      id,
      title,
      content,
      visualType,
      presentationId: _presentationId,
    }: {
      id: number;
      title: string;
      content: string;
      visualType: string;
      presentationId: number;
    }) => {
      void _presentationId;
      return actor!.updateSlide(BigInt(id), title, content, visualType);
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["slides", vars.presentationId] }),
  });
}

export function useDeleteSlide() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({
      id,
      presentationId: _presentationId,
    }: {
      id: number;
      presentationId: number;
    }) => {
      void _presentationId;
      return actor!.deleteSlide(BigInt(id));
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["slides", vars.presentationId] }),
  });
}

export function useReorderSlides() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({
      presentationId,
      slideIds,
    }: {
      presentationId: number;
      slideIds: bigint[];
    }) => actor!.reorderSlides(BigInt(presentationId), slideIds),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["slides", vars.presentationId] }),
  });
}

export function usePeople() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPeople();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAddPerson() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (p: {
      name: string;
      role: string;
      email: string;
      department: string;
      avatarInitials: string;
    }) =>
      actor!.addPerson(p.name, p.role, p.email, p.department, p.avatarInitials),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["people"] }),
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (p: {
      id: number;
      name: string;
      role: string;
      email: string;
      department: string;
      status: string;
    }) => {
      await actor!.updateMember(
        BigInt(p.id),
        p.name,
        p.role,
        p.email,
        p.department,
      );
      return actor!.updatePersonStatus(BigInt(p.id), p.status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["people"] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (id: number) => actor!.removeMember(BigInt(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["people"] }),
  });
}

// ─── Sheets ───────────────────────────────────────────────────────────────────

export function useSheets() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["sheets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSheets();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useSheetCells(sheetId: number | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["sheetCells", sheetId],
    queryFn: async () => {
      if (!actor || sheetId === null) return [];
      return actor.getSheetCells(BigInt(sheetId));
    },
    enabled: !!actor && !isFetching && sheetId !== null,
    refetchInterval: 15000,
    staleTime: 5000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateSheet() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (name: string) => actor!.createSheet(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sheets"] }),
  });
}

export function useRenameSheet() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      actor!.renameSheet(BigInt(id), name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sheets"] }),
  });
}

export function useDeleteSheet() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (id: number) => actor!.deleteSheet(BigInt(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sheets"] }),
  });
}

export function useSetSheetCell() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (cell: {
      sheetId: number;
      row: number;
      col: number;
      value: string;
    }) =>
      actor!.setSheetCell(
        BigInt(cell.sheetId),
        BigInt(cell.row),
        BigInt(cell.col),
        cell.value,
      ),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["sheetCells", vars.sheetId] }),
  });
}

export function useClearSheetCell() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (cell: {
      sheetId: number;
      row: number;
      col: number;
    }) =>
      actor!.clearSheetCell(
        BigInt(cell.sheetId),
        BigInt(cell.row),
        BigInt(cell.col),
      ),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["sheetCells", vars.sheetId] }),
  });
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export function useProjects() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjects();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useProject(id: number | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProject(BigInt(id));
    },
    enabled: !!actor && !isFetching && id !== null,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useProjectMilestones(projectId: number | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["projectMilestones", projectId],
    queryFn: async () => {
      if (!actor || projectId === null) return [];
      return actor.getProjectMilestones(BigInt(projectId));
    },
    enabled: !!actor && !isFetching && projectId !== null,
    refetchInterval: 15000,
    staleTime: 5000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (p: {
      name: string;
      description: string;
      status: string;
      color: string;
      ownerId: string;
    }) =>
      actor!.createProject(p.name, p.description, p.status, p.color, p.ownerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (p: {
      id: number;
      name: string;
      description: string;
      status: string;
    }) => actor!.updateProject(BigInt(p.id), p.name, p.description, p.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (id: number) => actor!.deleteProject(BigInt(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useCreateMilestone() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (m: {
      projectId: number;
      title: string;
      dueDate: bigint | null;
    }) =>
      actor!.createProjectMilestone(BigInt(m.projectId), m.title, m.dueDate),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["projectMilestones", vars.projectId] }),
  });
}

export function useToggleMilestone() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (id: number) => actor!.toggleProjectMilestone(BigInt(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projectMilestones"] }),
  });
}

export function useDeleteMilestone() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (id: number) => actor!.deleteProjectMilestone(BigInt(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projectMilestones"] }),
  });
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export function useCalendars() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["calendars"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCalendars();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCalendarEvents(calendarId: number | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["calendarEvents", calendarId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCalendarEvents(
        calendarId !== null ? BigInt(calendarId) : null,
      );
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
    staleTime: 5000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateCalendar() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      actor!.createCalendar(name, color),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendars"] }),
  });
}

export function useCreateCalendarEvent() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (e: {
      title: string;
      description: string;
      startTime: bigint;
      endTime: bigint;
      allDay: boolean;
      color: string;
      calendarId: number;
    }) =>
      actor!.createCalendarEvent(
        e.title,
        e.description,
        e.startTime,
        e.endTime,
        e.allDay,
        e.color,
        BigInt(e.calendarId),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendarEvents"] }),
  });
}

export function useUpdateCalendarEvent() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (e: {
      id: number;
      title: string;
      description: string;
      startTime: bigint;
      endTime: bigint;
      allDay: boolean;
      color: string;
    }) =>
      actor!.updateCalendarEvent(
        BigInt(e.id),
        e.title,
        e.description,
        e.startTime,
        e.endTime,
        e.allDay,
        e.color,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendarEvents"] }),
  });
}

export function useDeleteCalendarEvent() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (id: number) => actor!.deleteCalendarEvent(BigInt(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendarEvents"] }),
  });
}

export function useToggleCalendarVisibility() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (id: number) => actor!.toggleCalendarVisibility(BigInt(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendars"] }),
  });
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function useNoteFolders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["noteFolders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNoteFolders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useNotes(folderId: number | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["notes", folderId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotes(folderId !== null ? BigInt(folderId) : null);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({
      title,
      folderId,
    }: {
      title: string;
      folderId: number | null;
    }) => actor!.createNote(title, folderId !== null ? BigInt(folderId) : null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["noteFolders"] });
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: ({
      id,
      title,
      content,
    }: {
      id: number;
      title: string;
      content: string;
    }) => actor!.updateNote(BigInt(id), title, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (id: number) => actor!.deleteNote(BigInt(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useCreateNoteFolder() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (name: string) => actor!.createNoteFolder(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["noteFolders"] }),
  });
}

export function useDeleteNoteFolder() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: (id: number) => actor!.deleteNoteFolder(BigInt(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["noteFolders"] });
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
