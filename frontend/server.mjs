import { createReadStream, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

import { withSecurityHeaders } from "./security-headers.mjs";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);
const PROXY_STRIPPED_HEADERS = new Set([
  ...HOP_BY_HOP_HEADERS,
  "host",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto"
]);
const CONTENT_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"]
]);

const apiOrigin = new URL(process.env.API_ORIGIN ?? "http://backend:4000");
const distDir = resolve(fileURLToPath(new URL("./dist/", import.meta.url)));
const host = process.env.WEB_HOST ?? "0.0.0.0";
const indexHtml = await readFile(new URL("./dist/index.html", import.meta.url));
const port = Number(process.env.WEB_PORT ?? process.env.PORT ?? 4173);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("WEB_PORT must be an integer between 1 and 65535.");
}

function isProxyPath(pathname) {
  return (
    pathname === "/health" ||
    pathname === "/api" ||
    pathname.startsWith("/api/")
  );
}

function parseRequestUrl(request) {
  const rawUrl = request.url ?? "/";

  if (!rawUrl.startsWith("/") || rawUrl.startsWith("//")) {
    return null;
  }

  try {
    return new URL(rawUrl, "http://localhost");
  } catch {
    return null;
  }
}

function decodePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
}

function writeSafeError(response, statusCode, message) {
  response
    .writeHead(
      statusCode,
      withSecurityHeaders({
        "cache-control": "no-store",
        "content-type": "text/plain; charset=utf-8"
      })
    )
    .end(message);
}

function buildProxyHeaders(request) {
  const headers = new Headers();

  for (const [name, value] of Object.entries(request.headers)) {
    if (value === undefined || PROXY_STRIPPED_HEADERS.has(name.toLowerCase())) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else {
      headers.set(name, value);
    }
  }

  if (request.socket.remoteAddress !== undefined) {
    headers.set("x-forwarded-for", request.socket.remoteAddress);
  }

  return headers;
}

async function proxyRequest(request, response, requestUrl) {
  const target = new URL(requestUrl.pathname, apiOrigin);
  target.search = requestUrl.search;
  const method = request.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";

  const proxied = await fetch(target, {
    body: hasBody ? request : undefined,
    duplex: hasBody ? "half" : undefined,
    headers: buildProxyHeaders(request),
    method,
    redirect: "manual"
  });

  response.statusCode = proxied.status;

  const setCookies = proxied.headers.getSetCookie();

  proxied.headers.forEach((value, name) => {
    const normalizedName = name.toLowerCase();

    if (
      !HOP_BY_HOP_HEADERS.has(normalizedName) &&
      normalizedName !== "set-cookie"
    ) {
      response.setHeader(name, value);
    }
  });

  if (setCookies.length > 0) {
    response.setHeader("set-cookie", setCookies);
  }

  if (proxied.body === null) {
    response.end();
    return;
  }

  Readable.fromWeb(proxied.body).pipe(response);
}

function serveStaticFile(pathname, response) {
  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = resolve(distDir, `.${relativePath}`);

  if (filePath !== distDir && !filePath.startsWith(`${distDir}${sep}`)) {
    writeSafeError(response, 403, "Forbidden.");
    return;
  }

  if (!statSync(filePath, { throwIfNoEntry: false })?.isFile()) {
    if (pathname.startsWith("/assets/") || extname(pathname) !== "") {
      writeSafeError(response, 404, "Not found.");
      return;
    }

    response
      .writeHead(
        200,
        withSecurityHeaders({
          "cache-control": "no-store",
          "content-type": CONTENT_TYPES.get(".html")
        })
      )
      .end(indexHtml);
    return;
  }

  const extension = extname(filePath);

  response.writeHead(
    200,
    withSecurityHeaders({
      "cache-control": "no-store",
      "content-type": CONTENT_TYPES.get(extension) ?? "application/octet-stream"
    })
  );
  createReadStream(filePath).pipe(response);
}

const server = createServer((request, response) => {
  const requestUrl = parseRequestUrl(request);

  if (requestUrl === null) {
    writeSafeError(response, 400, "Richiesta non valida.");
    return;
  }

  if (isProxyPath(requestUrl.pathname)) {
    proxyRequest(request, response, requestUrl).catch(() => {
      writeSafeError(response, 502, "Backend non raggiungibile.");
    });
    return;
  }

  const decodedPathname = decodePathname(requestUrl.pathname);

  if (decodedPathname === null) {
    writeSafeError(response, 400, "Richiesta non valida.");
    return;
  }

  try {
    serveStaticFile(decodedPathname, response);
  } catch {
    writeSafeError(
      response,
      500,
      "Errore durante il caricamento della pagina."
    );
  }
});

server.listen(port, host, () => {
  console.info(
    `RegexRiddle frontend server listening on http://${host}:${port}`
  );
});
