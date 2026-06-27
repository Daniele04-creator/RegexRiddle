import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render";
import { demoUser, mockAppFetch } from "@/test/mockFetch";

describe("how-it-works and account pages", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("renders the public how-it-works explanation sections", async () => {
    mockAppFetch();

    renderRoute("/how-it-works");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "RegexRiddle spiegato per la demo"
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/full-string/)).toBeInTheDocument();
    expect(screen.getAllByText(/RE2-compatible/)).not.toHaveLength(0);
    expect(screen.getByText(/server-only/)).toBeInTheDocument();
    expect(screen.getAllByText(/feedback aggregato/i)).not.toHaveLength(0);
    expect(screen.getByText(/più sfide risolte/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Esplora sfide/ })).toHaveAttribute(
      "href",
      "/challenges"
    );
    expect(screen.getByRole("link", { name: /Guarda classifica/ })).toHaveAttribute(
      "href",
      "/leaderboard"
    );
    expect(screen.getByRole("link", { name: "Crea una sfida" })).toHaveAttribute(
      "href",
      "/create"
    );
  });

  it("guest account page shows login and register calls to action", async () => {
    mockAppFetch();

    renderRoute("/account");

    expect(
      await screen.findByRole("heading", { name: "Impostazioni account" })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Accedi per gestire l'account")
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Accedi" })[0]).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getAllByRole("link", { name: "Registrati" })[0]).toHaveAttribute(
      "href",
      "/register"
    );
  });

  it("authenticated account page updates allowed fields and hides malicious extras", async () => {
    const { fetchMock } = mockAppFetch({ initialUser: demoUser });
    const user = userEvent.setup();

    renderRoute("/account");

    expect((await screen.findAllByText("@demo_player"))[0]).toBeInTheDocument();
    expect(screen.getByLabelText("Nome visibile")).toHaveValue("Demo Player");
    expect(screen.queryByText("MALICIOUS_PASSWORD_HASH")).not.toBeInTheDocument();
    expect(screen.queryByText("MALICIOUS_SESSION_HASH")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Nome visibile"));
    await user.type(screen.getByLabelText("Nome visibile"), "Account Demo");
    await user.clear(screen.getByLabelText("Bio"));
    await user.type(screen.getByLabelText("Bio"), "Bio aggiornata.");
    await user.clear(screen.getByLabelText("Avatar URL"));
    await user.type(
      screen.getByLabelText("Avatar URL"),
      "https://example.com/avatar.png"
    );
    await user.click(screen.getByRole("button", { name: "Salva impostazioni" }));

    expect(await screen.findByText("Impostazioni account aggiornate.")).toBeInTheDocument();
    expect((await screen.findAllByText("Account Demo"))[0]).toBeInTheDocument();
    expect(screen.queryByText("MALICIOUS_PASSWORD_HASH")).not.toBeInTheDocument();
    expect(screen.queryByText("MALICIOUS_SESSION_HASH")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([path, init]) => path === "/api/auth/me" && init?.method === "PATCH"
        )
      ).toBe(true);
    });

    const patchCall = fetchMock.mock.calls.find(
      ([path, init]) => path === "/api/auth/me" && init?.method === "PATCH"
    );
    const body = JSON.parse(String(patchCall?.[1]?.body)) as Record<
      string,
      unknown
    >;
    expect(new Headers(patchCall?.[1]?.headers).get("X-RegexRiddle-CSRF")).toBe(
      "1"
    );
    expect(body).toEqual({
      avatarUrl: "https://example.com/avatar.png",
      bio: "Bio aggiornata.",
      displayName: "Account Demo"
    });
    expect(Object.keys(window.localStorage)).toHaveLength(0);
    expect(Object.keys(window.sessionStorage)).toHaveLength(0);
  });

  it("shows account navigation only for authenticated users", async () => {
    mockAppFetch();
    const guest = renderRoute("/");

    expect(await screen.findByRole("link", { name: "Accedi" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Account" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Come funziona" })[0]).toHaveAttribute(
      "href",
      "/how-it-works"
    );
    guest.unmount();

    mockAppFetch({ initialUser: demoUser });
    renderRoute("/");

    expect(await screen.findByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/account"
    );
  });
});
