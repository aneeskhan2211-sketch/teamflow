import { createActor } from "@/backend";
import type { AuthUser } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { AuthUser };

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export function useCurrentUser() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AuthUser | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMe();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetWorkspaceMembers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AuthUser[]>({
    queryKey: ["workspaceMembers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkspaceMembers();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useAssignMemberRole() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      targetPrincipal,
      role,
    }: {
      targetPrincipal: Principal;
      role: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignMemberRole(targetPrincipal, role);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaceMembers"] }),
  });
}

export function useRemoveMemberByPrincipal() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetPrincipal: Principal) => {
      if (!actor) throw new Error("No actor");
      return actor.removeMemberByPrincipal(targetPrincipal);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaceMembers"] }),
  });
}

export function useGenerateInviteCode() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.generateInviteCode();
    },
  });
}

export function useUpdateMyProfile() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      name: string;
      title: string;
      department: string;
      avatarColor: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateMyProfile(
        vars.name,
        vars.title,
        vars.department,
        vars.avatarColor,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUser"] }),
  });
}

// ---------------------------------------------------------------------------
// Role helpers
// ---------------------------------------------------------------------------

export type AppRole = "owner" | "admin" | "member" | "guest" | "viewer";

export function useAuth() {
  const { data: currentUser, isLoading } = useCurrentUser();

  function hasRole(role: AppRole): boolean {
    if (!currentUser) return false;
    const r = currentUser.role as string;
    if (role === "owner") return r === "owner";
    if (role === "admin") return r === "owner" || r === "admin";
    if (role === "member")
      return r === "owner" || r === "admin" || r === "member";
    return true; // viewer/guest — everyone
  }

  function canEdit(): boolean {
    if (!currentUser) return false;
    const r = currentUser.role as string;
    return r === "owner" || r === "admin" || r === "member";
  }

  function isViewer(): boolean {
    if (!currentUser) return true; // safe default while loading
    const r = currentUser.role as string;
    return r === "guest" || r === "viewer";
  }

  return {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    hasRole,
    canEdit: canEdit(),
    isViewer: isViewer(),
  };
}
