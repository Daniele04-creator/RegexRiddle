import assert from "node:assert/strict";
import { test } from "node:test";

import { parseChallengeListQuery } from "../src/features/challenges/challenge-list.validation.js";

test("catalog defaults to the first page and accepts pages beyond 100 challenges", () => {
  assert.deepEqual(parseChallengeListQuery({}), {
    success: true,
    value: { difficulty: undefined, page: 1, pageSize: 24 }
  });
  assert.deepEqual(
    parseChallengeListQuery({ difficulty: "HARD", page: "6", pageSize: "24" }),
    {
      success: true,
      value: { difficulty: "HARD", page: 6, pageSize: 24 }
    }
  );
  assert.equal(parseChallengeListQuery({ pageSize: "100" }).success, true);
});

test("catalog rejects unbounded or ambiguous pagination parameters", () => {
  for (const query of [
    { page: "0" },
    { page: "-1" },
    { page: "1.5" },
    { page: "1e2" },
    { page: "9007199254740992" },
    { page: "2147483648", pageSize: "100" },
    { page: ["1", "2"] },
    { pageSize: "0" },
    { pageSize: "101" },
    { pageSize: "2.5" },
    { pageSize: ["24", "100"] },
    { difficulty: ["EASY", "HARD"] },
    { search: "anything" }
  ]) {
    assert.equal(parseChallengeListQuery(query).success, false);
  }
});
