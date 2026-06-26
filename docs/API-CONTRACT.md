# API Contract

## GET /health

Returns basic service health metadata.

Response `200 application/json`:

```json
{
  "status": "ok",
  "service": "regexriddle-api",
  "appName": "RegexRiddle",
  "environment": "development"
}
```

## GOAL 01 note

GOAL 01 adds the database layer only. It does not add public domain endpoints and does not expose `secretPattern` or `ChallengeControl.value`.

## Future endpoints

The following areas are intentionally TODO after GOAL 00:

- Authentication.
- Challenge catalog.
- Challenge detail.
- Attempt submission.
- Leaderboard.
- Admin or authoring workflows.

Future protected routes must include authorization checks and must not expose secret regexes or secret controls.
