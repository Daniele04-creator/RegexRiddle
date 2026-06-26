# Test Plan

## GOAL 00 checks

- Unit test shared constants.
- Unit test web smoke copy.
- Unit test API app factory with Fastify injection.
- E2E smoke test for the web page.
- E2E smoke test for `GET /health`.

## Required commands

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm check
```

## Final delivery target

The final project must include at least 10 meaningful E2E tests. Later milestones should add tests for:

- Login and logout.
- Challenge listing.
- Challenge detail authorization.
- Valid attempt submission.
- Invalid attempt submission.
- Full-match behavior.
- Rejection of unsupported regex dialect features.
- Leaderboard visibility.
- IDOR prevention.
- Deterministic seed data.
