import { createActor } from "@/backend";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { WorkspaceProvider } from "./hooks/useWorkspace";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import { COLORS } from "./tokens";

function AppInner() {
  const { isAuthenticated, loginStatus, login } = useInternetIdentity();
  const [timedOut, setTimedOut] = useState(false);

  // If Internet Identity stays in a non-terminal state for >5 s, treat the
  // user as unauthenticated so the app never hangs on a spinner.
  const isInitializing =
    !timedOut &&
    (loginStatus === "initializing" ||
      loginStatus === "idle" ||
      loginStatus === "logging-in");

  useEffect(() => {
    if (!isInitializing) return;
    const id = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(id);
  }, [isInitializing]);

  const { actor, isFetching } = useActor(createActor);

  const { data: onboarded, isLoading: onboardLoading } = useQuery<boolean>({
    queryKey: ["isOnboarded"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isOnboarded();
      } catch {
        return false;
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    staleTime: 60_000,
  });

  if (isInitializing) {
    return (
      <div
        className="spinner-host"
        style={{
          height: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.surface.panel3,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `2px solid ${COLORS.neutral[200]}`,
            borderTopColor: COLORS.neutral[900],
            animation: "tf-spin 0.6s linear infinite",
          }}
        />
        <style>
          {"@keyframes tf-spin { to { transform: rotate(360deg); } }"}
        </style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onLogin={login} />;
  }

  // While checking onboarding status, show a brief spinner.
  // Cap at 5 s — if the call hangs, treat the user as already onboarded.
  if (onboardLoading && onboarded === undefined) {
    return (
      <div
        style={{
          height: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.surface.panel3,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `2px solid ${COLORS.neutral[200]}`,
            borderTopColor: COLORS.neutral[900],
            animation: "tf-spin 0.6s linear infinite",
          }}
        />
        <style>
          {"@keyframes tf-spin { to { transform: rotate(360deg); } }"}
        </style>
      </div>
    );
  }

  if (!onboarded) {
    return <OnboardingPage />;
  }

  return (
    <WorkspaceProvider>
      <Layout />
    </WorkspaceProvider>
  );
}

export default function App() {
  return <AppInner />;
}
