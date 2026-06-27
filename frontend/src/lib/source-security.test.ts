import { readdirSync, readFileSync } from "node:fs";
import { extname, join, sep } from "node:path";

import { describe, expect, it } from "vitest";

const frontendRoot = process.cwd();
const srcRoot = join(frontendRoot, "src");

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "test") {
        return [];
      }

      return listSourceFiles(fullPath);
    }

    if (![".ts", ".tsx", ".css"].includes(extname(entry.name))) {
      return [];
    }

    if (entry.name.includes(".test.")) {
      return [];
    }

    return [fullPath];
  });
}

function readSources() {
  return listSourceFiles(srcRoot).map((filePath) => ({
    filePath,
    text: readFileSync(filePath, "utf8")
  }));
}

describe("frontend source security baseline", () => {
  it("does not use browser-readable auth token APIs or unsafe HTML rendering", () => {
    for (const source of readSources()) {
      const relativePath = source.filePath.replace(`${frontendRoot}${sep}`, "");

      expect(source.text, relativePath).not.toContain("dangerouslySetInnerHTML");
      expect(source.text, relativePath).not.toContain("document.cookie");
      expect(source.text, relativePath).not.toContain("localStorage.");
      expect(source.text, relativePath).not.toContain("sessionStorage.");
    }
  });

  it("does not construct JavaScript RegExp in frontend code", () => {
    for (const source of readSources()) {
      const relativePath = source.filePath.replace(`${frontendRoot}${sep}`, "");

      expect(source.text, relativePath).not.toContain("new RegExp");
      expect(source.text, relativePath).not.toContain("RegExp(");
    }
  });

  it("keeps raw fetch calls inside the API client boundary", () => {
    for (const source of readSources()) {
      const relativePath = source.filePath.replace(`${frontendRoot}${sep}`, "");

      if (relativePath === join("src", "lib", "api-client.ts")) {
        continue;
      }

      expect(source.text, relativePath).not.toMatch(/\bfetch\s*\(/);
    }
  });

  it("keeps a reduced-motion baseline in global CSS", () => {
    const css = readFileSync(join(srcRoot, "styles", "globals.css"), "utf8");

    expect(css).toContain("prefers-reduced-motion");
  });
});
