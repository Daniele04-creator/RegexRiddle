import type {
  AttemptSubmissionResponseDTO,
  ChallengeDetailDTO
} from "@regexriddle/shared";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClientError } from "@/lib/api-client";
import { demoUser, mockAppFetch } from "@/test/mockFetch";
import { renderRoute } from "@/test/render";

const challengeApiMocks = vi.hoisted(() => ({
  getChallengeDetail: vi.fn(),
  getChallenges: vi.fn()
}));

const attemptApiMocks = vi.hoisted(() => ({
  submitChallengeAttempt: vi.fn()
}));

vi.mock("@/features/challenges/api", () => challengeApiMocks);
vi.mock("@/features/attempts/api", () => attemptApiMocks);

function makeChallengeDetail(
  overrides: Partial<ChallengeDetailDTO> = {}
): ChallengeDetailDTO {
  return {
    id: "aaaaaaaa-0006-4000-8000-000000000006",
    title: "Codice prodotto",
    description: "Accept two uppercase letters, a dash, and four digits.",
    difficulty: "EASY",
    author: {
      username: "demo_creator",
      displayName: "Demo Creator"
    },
    publicPositiveExample: "AB-1234",
    publicNegativeExample: "A1-1234",
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T09:00:00.000Z",
    stats: {
      attemptsTotal: 0,
      solutionsTotal: 0
    },
    ...overrides
  };
}

function makeAttemptResponse(
  overrides: Partial<AttemptSubmissionResponseDTO> = {}
): AttemptSubmissionResponseDTO {
  return {
    attempt: {
      id: "bbbbbbbb-1000-4000-8000-000000000001",
      challengeId: "aaaaaaaa-0006-4000-8000-000000000006",
      attemptNumber: 1,
      positiveMatched: 3,
      positiveTotal: 3,
      negativeMatched: 0,
      negativeTotal: 3,
      isCorrect: true,
      createdAt: "2026-06-27T12:00:00.000Z"
    },
    solved: true,
    ...overrides
  };
}

async function renderChallengeDetail() {
  renderRoute("/challenges/aaaaaaaa-0006-4000-8000-000000000006");

  await screen.findByRole("heading", { name: "Codice prodotto" });
}

describe("attempt panel route states", () => {
  beforeEach(() => {
    mockAppFetch();
    challengeApiMocks.getChallenges.mockReset();
    challengeApiMocks.getChallengeDetail.mockReset();
    attemptApiMocks.submitChallengeAttempt.mockReset();
    challengeApiMocks.getChallengeDetail.mockResolvedValue(makeChallengeDetail());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows login and register CTAs to guests", async () => {
    await renderChallengeDetail();

    expect(await screen.findByText("Accedi per salvare il tentativo")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Accedi" })[0]).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getAllByRole("link", { name: "Registrati" })[0]).toHaveAttribute(
      "href",
      "/register"
    );
  });

  it("shows the attempt form to authenticated non-authors", async () => {
    mockAppFetch({ initialUser: demoUser });

    await renderChallengeDetail();

    expect(await screen.findByLabelText("Regex candidata")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invia tentativo" })).toBeEnabled();
    expect(screen.getByLabelText("i")).toBeEnabled();
    expect(screen.getByLabelText("m")).toBeEnabled();
  });

  it("blocks authors in the frontend while keeping the backend authoritative", async () => {
    mockAppFetch({
      initialUser: {
        ...demoUser,
        username: "demo_creator",
        displayName: "Demo Creator"
      }
    });

    await renderChallengeDetail();

    expect(
      await screen.findByText("Sei l'autore di questa sfida")
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Regex candidata")).not.toBeInTheDocument();
  });

  it("submits a correct attempt and renders aggregate solved feedback", async () => {
    const user = userEvent.setup();
    mockAppFetch({ initialUser: demoUser });
    attemptApiMocks.submitChallengeAttempt.mockResolvedValue(
      makeAttemptResponse()
    );

    await renderChallengeDetail();
    await user.type(await screen.findByLabelText("Regex candidata"), "AA-0000");
    await user.click(screen.getByRole("button", { name: "Invia tentativo" }));

    await waitFor(() => {
      expect(attemptApiMocks.submitChallengeAttempt).toHaveBeenCalledWith(
        "aaaaaaaa-0006-4000-8000-000000000006",
        {
          pattern: "AA-0000",
          flags: ""
        }
      );
    });
    expect(await screen.findByText("Soluzione corretta")).toBeInTheDocument();
    expect(screen.getByText("Hai risolto la sfida. La classifica ti aspetta.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sfida risolta" })).toBeDisabled();
  });

  it("renders partial aggregate feedback for incorrect attempts", async () => {
    const user = userEvent.setup();
    mockAppFetch({ initialUser: demoUser });
    attemptApiMocks.submitChallengeAttempt.mockResolvedValue(
      makeAttemptResponse({
        attempt: {
          ...makeAttemptResponse().attempt,
          positiveMatched: 3,
          negativeMatched: 3,
          isCorrect: false
        },
        solved: false
      })
    );

    await renderChallengeDetail();
    await user.type(await screen.findByLabelText("Regex candidata"), ".*");
    await user.click(screen.getByRole("button", { name: "Invia tentativo" }));

    expect(await screen.findByText("Non ancora")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Hai superato 3 prove utili su 3; restano 3 falsi positivi da eliminare su 3."
      )
    ).toBeInTheDocument();
  });

  it("maps already-solved and invalid-regex errors to safe UI messages", async () => {
    const user = userEvent.setup();
    mockAppFetch({ initialUser: demoUser });
    attemptApiMocks.submitChallengeAttempt.mockRejectedValueOnce(
      new ApiClientError(409, {
        error: "Conflict",
        message: "Challenge already solved."
      })
    );

    await renderChallengeDetail();
    await user.type(await screen.findByLabelText("Regex candidata"), ".*");
    await user.click(screen.getByRole("button", { name: "Invia tentativo" }));

    expect(await screen.findByText("Hai gia risolto questa sfida.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sfida risolta" })).toBeDisabled();

    cleanup();
    mockAppFetch({ initialUser: demoUser });
    challengeApiMocks.getChallengeDetail.mockResolvedValue(makeChallengeDetail());
    attemptApiMocks.submitChallengeAttempt.mockRejectedValueOnce(
      new ApiClientError(422, {
        error: "Unprocessable Entity",
        message: "Submitted regex is invalid or unsupported."
      })
    );

    renderRoute("/challenges/aaaaaaaa-0006-4000-8000-000000000006");
    await user.type(await screen.findByLabelText("Regex candidata"), "(?=a)");
    await user.click(screen.getByRole("button", { name: "Invia tentativo" }));

    expect(
      await screen.findByText("Regex non valida per questo enigma.")
    ).toBeInTheDocument();
  });

  it("does not render malicious extra attempt response fields", async () => {
    const user = userEvent.setup();
    mockAppFetch({ initialUser: demoUser });
    attemptApiMocks.submitChallengeAttempt.mockResolvedValue({
      ...makeAttemptResponse(),
      attempt: {
        ...makeAttemptResponse().attempt,
        secretPattern: "SHOULD_NOT_RENDER_SECRET",
        controls: [{ value: "SHOULD_NOT_RENDER_CONTROL" }],
        proposedPattern: "SHOULD_NOT_RENDER_PATTERN",
        passwordHash: "SHOULD_NOT_RENDER_PASSWORD",
        sessionTokenHash: "SHOULD_NOT_RENDER_SESSION"
      }
    } as unknown as AttemptSubmissionResponseDTO);

    await renderChallengeDetail();
    await user.type(await screen.findByLabelText("Regex candidata"), "AA-0000");
    await user.click(screen.getByRole("button", { name: "Invia tentativo" }));

    expect(await screen.findByText("Soluzione corretta")).toBeInTheDocument();
    expect(screen.queryByText("SHOULD_NOT_RENDER_SECRET")).not.toBeInTheDocument();
    expect(screen.queryByText("SHOULD_NOT_RENDER_CONTROL")).not.toBeInTheDocument();
    expect(screen.queryByText("SHOULD_NOT_RENDER_PATTERN")).not.toBeInTheDocument();
    expect(screen.queryByText("SHOULD_NOT_RENDER_PASSWORD")).not.toBeInTheDocument();
    expect(screen.queryByText("SHOULD_NOT_RENDER_SESSION")).not.toBeInTheDocument();
  });
});
