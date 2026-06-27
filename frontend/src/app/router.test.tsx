import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "@/test/render";

function mockHealthFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(
        JSON.stringify({
          status: "ok",
          service: "regexriddle-api",
          appName: "RegexRiddle",
          environment: "test"
        }),
        { headers: { "content-type": "application/json" }, status: 200 }
      )
    )
  );
}

describe("app routing foundation", () => {
  beforeEach(() => {
    mockHealthFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the landing headline", async () => {
    renderRoute("/");

    expect(
      await screen.findByRole("heading", { level: 1, name: "RegexRiddle" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Esplora sfide/ })).toHaveAttribute(
      "href",
      "/challenges"
    );
  });

  it("exposes public navigation links", () => {
    renderRoute("/");

    expect(screen.getAllByRole("link", { name: "Sfide" })[0]).toHaveAttribute(
      "href",
      "/challenges"
    );
    expect(screen.getAllByRole("link", { name: "Classifica" })[0]).toHaveAttribute(
      "href",
      "/leaderboard"
    );
    expect(screen.getAllByRole("link", { name: "Accedi" })[0]).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getAllByRole("link", { name: "Registrati" })[0]).toHaveAttribute(
      "href",
      "/register"
    );
  });

  it("renders a safe not found route", () => {
    renderRoute("/missing-page");

    expect(
      screen.getByRole("heading", { level: 1, name: "Page not found" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
