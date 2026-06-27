import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render";
import { mockAppFetch } from "@/test/mockFetch";

describe("app routing foundation", () => {
  beforeEach(() => {
    mockAppFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the landing headline", async () => {
    renderRoute("/");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Risolvi enigmi nascosti con una sola regex"
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Inizia una sfida/ })).toHaveAttribute(
      "href",
      "/challenges"
    );
  });

  it("exposes public navigation and logged-out auth links", async () => {
    renderRoute("/");

    expect(screen.getAllByRole("link", { name: "Sfide" })[0]).toHaveAttribute(
      "href",
      "/challenges"
    );
    expect(screen.getAllByRole("link", { name: "Come funziona" })[0]).toHaveAttribute(
      "href",
      "/how-it-works"
    );
    expect(screen.getAllByRole("link", { name: "Classifica" })[0]).toHaveAttribute(
      "href",
      "/leaderboard"
    );
    expect(screen.getAllByRole("link", { name: "Crea" })[0]).toHaveAttribute(
      "href",
      "/create"
    );
    expect(await screen.findByRole("link", { name: "Registrati" })).toHaveAttribute(
      "href",
      "/register"
    );
    expect(screen.getAllByRole("link", { name: "Accedi" })[0]).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("renders a safe not found route", () => {
    renderRoute("/missing-page");

    expect(
      screen.getByRole("heading", { level: 1, name: "Pagina non trovata" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Torna alla home" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
