import type { Routes } from "@angular/router";

import { AuthPageComponent } from "./features/auth/auth-page.component";
import { ChallengeDetailPageComponent } from "./features/challenges/challenge-detail-page.component";
import { ChallengesPageComponent } from "./features/challenges/challenges-page.component";
import { CreateChallengePageComponent } from "./features/challenges/create-challenge-page.component";
import { HowItWorksPageComponent } from "./features/how-it-works/how-it-works-page.component";
import { LandingPageComponent } from "./features/landing/landing-page.component";
import { LeaderboardPageComponent } from "./features/leaderboard/leaderboard-page.component";
import { NotFoundPageComponent } from "./features/not-found/not-found-page.component";
import { ProfilePageComponent } from "./features/profile/profile-page.component";
import { authGuard } from "./core/auth.guard";

export const routes: Routes = [
  { path: "", component: LandingPageComponent },
  {
    path: "challenges",
    component: ChallengesPageComponent,
    canActivate: [authGuard]
  },
  {
    path: "challenges/:challengeId",
    component: ChallengeDetailPageComponent,
    canActivate: [authGuard]
  },
  {
    path: "create",
    component: CreateChallengePageComponent,
    canActivate: [authGuard]
  },
  {
    path: "leaderboard",
    component: LeaderboardPageComponent,
    canActivate: [authGuard]
  },
  { path: "how-it-works", component: HowItWorksPageComponent },
  {
    path: "account",
    component: ProfilePageComponent,
    canActivate: [authGuard]
  },
  { path: "login", component: AuthPageComponent, data: { mode: "login" } },
  {
    path: "register",
    component: AuthPageComponent,
    data: { mode: "register" }
  },
  { path: "**", component: NotFoundPageComponent }
];
