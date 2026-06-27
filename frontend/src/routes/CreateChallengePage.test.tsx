import type { ChallengeDetailDTO } from "@regexriddle/shared";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClientError } from "@/lib/api-client";
import { demoUser, mockAppFetch } from "@/test/mockFetch";
import { renderRoute } from "@/test/render";

const authoringApiMocks = vi.hoisted(() => ({
  createChallenge: vi.fn()
}));

vi.mock("@/features/challenge-authoring/api", () => authoringApiMocks);

function makeCreatedChallenge(): ChallengeDetailDTO {
  return {
    author: {
      displayName: "Demo Player",
      username: "demo_player"
    },
    createdAt: "2026-06-27T12:00:00.000Z",
    description: "Create a regex that matches five-digit Italian postal codes.",
    difficulty: "EASY",
    id: "aaaaaaaa-1000-4000-8000-000000000001",
    publicNegativeExample: "8012A",
    publicPositiveExample: "80125",
    stats: {
      attemptsTotal: 0,
      solutionsTotal: 0
    },
    title: "CAP italiano",
    updatedAt: "2026-06-27T12:00:00.000Z"
  };
}

async function fillValidChallengeForm() {
  const user = userEvent.setup();

  await user.type(await screen.findByLabelText("Titolo"), "CAP italiano");
  await user.type(
    screen.getByLabelText("Descrizione"),
    "Create a regex that matches five-digit Italian postal codes."
  );
  fireEvent.change(screen.getByLabelText("Regex segreta"), {
    target: { value: String.raw`[0-9]{5}` }
  });
  await user.click(screen.getByLabelText("Ignora maiuscole"));
  await user.click(screen.getByLabelText("Piu righe"));
  await user.type(screen.getByLabelText("Esempio pubblico positivo"), "80125");
  await user.type(screen.getByLabelText("Esempio pubblico negativo"), "8012A");
  await user.type(screen.getByLabelText("Prova da accettare 1"), "00100");
  await user.type(screen.getByLabelText("Prova da accettare 2"), "20121");
  await user.type(screen.getByLabelText("Prova da accettare 3"), "99999");
  await user.type(screen.getByLabelText("Prova da rifiutare 1"), "1234");
  await user.type(screen.getByLabelText("Prova da rifiutare 2"), "ABCDE");
  await user.type(screen.getByLabelText("Prova da rifiutare 3"), "123456");

  return user;
}

describe("create challenge route", () => {
  beforeEach(() => {
    mockAppFetch();
    authoringApiMocks.createChallenge.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows login-required state to guests", async () => {
    renderRoute("/create");

    expect(await screen.findByText("Accedi per creare una sfida")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Accedi" })[0]).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.queryByLabelText("Regex segreta")).not.toBeInTheDocument();
  });

  it("renders the protected creation form for authenticated users", async () => {
    mockAppFetch({ initialUser: demoUser });

    renderRoute("/create");

    expect(await screen.findByRole("heading", { name: "Crea una sfida" })).toBeVisible();
    expect(await screen.findByLabelText("Titolo")).toBeVisible();
    expect(screen.getByLabelText("Regex segreta")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pubblica sfida" })).toBeEnabled();
    expect(screen.getByText("Autore: Demo Player (@demo_player)")).toBeVisible();
  });

  it("submits a sanitized creation payload and renders a public success card", async () => {
    mockAppFetch({ initialUser: demoUser });
    authoringApiMocks.createChallenge.mockResolvedValue(makeCreatedChallenge());

    renderRoute("/create");
    const user = await fillValidChallengeForm();

    await user.click(screen.getByRole("button", { name: "Pubblica sfida" }));

    await waitFor(() => {
      expect(authoringApiMocks.createChallenge).toHaveBeenCalledWith({
        controls: [
          { kind: "POSITIVE", value: "00100" },
          { kind: "POSITIVE", value: "20121" },
          { kind: "POSITIVE", value: "99999" },
          { kind: "NEGATIVE", value: "1234" },
          { kind: "NEGATIVE", value: "ABCDE" },
          { kind: "NEGATIVE", value: "123456" }
        ],
        description:
          "Create a regex that matches five-digit Italian postal codes.",
        difficulty: "EASY",
        flags: "im",
        publicNegativeExample: "8012A",
        publicPositiveExample: "80125",
        secretPattern: String.raw`[0-9]{5}`,
        title: "CAP italiano"
      });
    });
    expect(await screen.findByText("Sfida creata")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apri sfida" })).toHaveAttribute(
      "href",
      "/challenges/aaaaaaaa-1000-4000-8000-000000000001"
    );
    expect(screen.getByLabelText("Regex segreta")).toHaveValue("");
    expect(screen.queryByText(String.raw`[0-9]{5}`)).not.toBeInTheDocument();
  });

  it("maps backend validation errors to a safe message", async () => {
    mockAppFetch({ initialUser: demoUser });
    authoringApiMocks.createChallenge.mockRejectedValue(
      new ApiClientError(422, {
        error: "Unprocessable Entity",
        message: "Challenge examples or controls do not match the secret regex."
      })
    );

    renderRoute("/create");
    const user = await fillValidChallengeForm();

    await user.click(screen.getByRole("button", { name: "Pubblica sfida" }));

    expect(
      await screen.findByText(
        "La soluzione, gli indizi o le prove nascoste non sono coerenti."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Challenge examples or controls do not match the secret regex.")
    ).not.toBeInTheDocument();
  });
});
