import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render";
import { demoUser, mockAppFetch } from "@/test/mockFetch";

describe("auth pages and shell state", () => {
  beforeEach(() => {
    mockAppFetch();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("renders logged-out header actions", async () => {
    renderRoute("/");

    expect(await screen.findByRole("link", { name: "Registrati" })).toHaveAttribute(
      "href",
      "/register"
    );
    expect(screen.getAllByRole("link", { name: "Accedi" })[0]).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("shows logged-in identity and clears it after logout", async () => {
    mockAppFetch({ initialUser: demoUser });
    const user = userEvent.setup();

    renderRoute("/");

    expect(await screen.findByText("Demo Player")).toBeInTheDocument();
    expect(screen.getByText("@demo_player")).toBeInTheDocument();
    expect(screen.queryByText("demo_player@example.test")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(await screen.findAllByRole("link", { name: "Accedi" })).not.toHaveLength(0);
    await waitFor(() => {
      expect(screen.queryByText("Demo Player")).not.toBeInTheDocument();
    });
  });

  it("validates login fields and submits a safe payload", async () => {
    const { fetchMock } = mockAppFetch();
    const user = userEvent.setup();

    renderRoute("/login");

    await user.click(await screen.findByRole("button", { name: "Accedi" }));

    expect(await screen.findByText("Inserisci username o email.")).toBeInTheDocument();
    expect(screen.getByText("Inserisci la password.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Username o email"), " demo_player ");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Accedi" }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([path]) => path === "/api/auth/login")).toBe(
        true
      );
    });
    const loginCall = fetchMock.mock.calls.find(
      ([path]) => path === "/api/auth/login"
    );
    const loginBody = JSON.parse(String(loginCall?.[1]?.body)) as Record<
      string,
      unknown
    >;

    expect(loginCall?.[1]).toEqual(
      expect.objectContaining({
        credentials: "include",
        method: "POST"
      })
    );
    expect(loginBody).toEqual({
      usernameOrEmail: "demo_player",
      password: "Password123!"
    });

    expect(Object.keys(window.localStorage)).toHaveLength(0);
    expect(Object.keys(window.sessionStorage)).toHaveLength(0);
  });

  it("shows a generic invalid login error", async () => {
    const user = userEvent.setup();

    renderRoute("/login");

    await user.type(await screen.findByLabelText("Username o email"), "demo_player");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Accedi" }));

    expect(await screen.findByText("Credenziali non valide.")).toBeInTheDocument();
  });

  it("validates register fields and does not send confirmPassword", async () => {
    const { fetchMock } = mockAppFetch();
    const user = userEvent.setup();

    renderRoute("/register");

    await user.type(await screen.findByLabelText("Username"), " Student_Demo ");
    await user.type(screen.getByLabelText("Email"), " STUDENT_DEMO@EXAMPLE.TEST ");
    await user.type(screen.getByLabelText("Nome visibile"), " Student Demo ");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Conferma password"), "Different123!");
    await user.click(screen.getByRole("button", { name: "Registrati" }));

    expect(await screen.findByText("Le password non coincidono.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/auth/register",
      expect.anything()
    );

    await user.clear(screen.getByLabelText("Conferma password"));
    await user.type(screen.getByLabelText("Conferma password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Registrati" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([path]) => path === "/api/auth/register")
      ).toBe(true);
    });
    const registerCall = fetchMock.mock.calls.find(
      ([path]) => path === "/api/auth/register"
    );
    const registerBody = JSON.parse(String(registerCall?.[1]?.body)) as Record<
      string,
      unknown
    >;

    expect(registerCall?.[1]).toEqual(
      expect.objectContaining({
        credentials: "include",
        method: "POST"
      })
    );
    expect(registerBody).toEqual({
      username: "student_demo",
      email: "student_demo@example.test",
      displayName: "Student Demo",
      password: "Password123!"
    });
    expect(String(registerCall?.[1]?.body)).not.toContain("confirmPassword");
  });

  it("shows conflict feedback for duplicate registration", async () => {
    mockAppFetch({ duplicateRegister: true });
    const user = userEvent.setup();

    renderRoute("/register");

    await user.type(await screen.findByLabelText("Username"), "demo_player");
    await user.type(screen.getByLabelText("Email"), "demo_player@example.test");
    await user.type(screen.getByLabelText("Nome visibile"), "Demo Player");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Conferma password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Registrati" }));

    expect(await screen.findByText("Username o email gia in uso.")).toBeInTheDocument();
  });

  it("shows auth-aware create states for guests and authenticated users", async () => {
    const guest = renderRoute("/create");

    expect(await screen.findByText("Accedi per creare una sfida")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Accedi" })[0]).toHaveAttribute(
      "href",
      "/login"
    );
    guest.unmount();

    mockAppFetch({ initialUser: demoUser });
    renderRoute("/create");

    expect(
      await screen.findByText("Creazione sfida in arrivo nel GOAL 08.4.")
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Demo Player/)).not.toHaveLength(0);
  });
});
