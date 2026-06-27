import {
  createBrowserRouter,
  createMemoryRouter,
  type RouteObject
} from "react-router";

import { AppShell } from "@/components/layout/AppShell";
import { ChallengeDetailPage } from "@/routes/ChallengeDetailPage";
import { ChallengesPage } from "@/routes/ChallengesPage";
import { CreateChallengePage } from "@/routes/CreateChallengePage";
import { HomePage } from "@/routes/HomePage";
import { LeaderboardPage } from "@/routes/LeaderboardPage";
import { LoginPage } from "@/routes/LoginPage";
import { NotFoundPage } from "@/routes/NotFoundPage";
import { RegisterPage } from "@/routes/RegisterPage";

export const routePaths = {
  home: "/",
  challenges: "/challenges",
  leaderboard: "/leaderboard",
  login: "/login",
  register: "/register",
  create: "/create"
} as const;

export function challengeDetailPath(id: string) {
  return `/challenges/${id}`;
}

export const appRoutes: RouteObject[] = [
  {
    path: routePaths.home,
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "challenges", element: <ChallengesPage /> },
      {
        path: "challenges/:challengeId",
        element: <ChallengeDetailPage />
      },
      { path: "leaderboard", element: <LeaderboardPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "create", element: <CreateChallengePage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
];

export function createAppRouter() {
  return createBrowserRouter(appRoutes);
}

export function createTestRouter(initialEntries: string[] = [routePaths.home]) {
  return createMemoryRouter(appRoutes, { initialEntries });
}
