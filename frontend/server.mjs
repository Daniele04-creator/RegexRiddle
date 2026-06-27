import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

const DEFAULT_WEB_PORT = 4173;
const DEFAULT_API_ORIGIN = "http://127.0.0.1:4000";
const distRoot = resolve(fileURLToPath(new URL("./dist", import.meta.url)));
const apiOrigin = readApiOrigin(process.env.API_ORIGIN);
const hopByHopHeaders = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"]
]);

function readPort(value) {
  if (value === undefined || value.trim() === "") {
    return DEFAULT_WEB_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("WEB_PORT must be an integer between 1 and 65535.");
  }

  return port;
}

function readApiOrigin(value) {
  const candidate = value === undefined || value.trim() === "" ? DEFAULT_API_ORIGIN : value;
  const url = new URL(candidate);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("API_ORIGIN must use http or https.");
  }

  return url.origin;
}

function isInsideDistRoot(filePath) {
  return filePath === distRoot || filePath.startsWith(`${distRoot}${sep}`);
}

function isProxyPath(pathname) {
  return pathname === "/health" || pathname === "/api" || pathname.startsWith("/api/");
}

function createRequestUrl(requestUrl, host) {
  return new URL(requestUrl ?? "/", `http://${host ?? "localhost"}`);
}

function resolveStaticFile(requestUrl, host) {
  const url = createRequestUrl(requestUrl, host);
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = resolve(distRoot, `.${pathname}`);

  if (!isInsideDistRoot(requestedPath)) {
    return null;
  }

  if (existsSync(requestedPath) && statSync(requestedPath).isFile()) {
    return requestedPath;
  }

  return resolve(distRoot, "index.html");
}

function copyRequestHeaders(headers) {
  const copiedHeaders = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    const normalizedName = name.toLowerCase();

    if (value === undefined || hopByHopHeaders.has(normalizedName)) {
      continue;
    }

    copiedHeaders.set(name, Array.isArray(value) ? value.join(", ") : value);
  }

  return copiedHeaders;
}

function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];

    request.on("data", (chunk) => {
      chunks.push(chunk);
    });
    request.on("end", () => {
      resolveBody(Buffer.concat(chunks));
    });
    request.on("error", rejectBody);
  });
}

function copyResponseHeaders(upstreamResponse, response) {
  const setCookieHeaders =
    typeof upstreamResponse.headers.getSetCookie === "function"
      ? upstreamResponse.headers.getSetCookie()
      : [];

  upstreamResponse.headers.forEach((value, name) => {
    if (hopByHopHeaders.has(name.toLowerCase()) || name.toLowerCase() === "set-cookie") {
      return;
    }

    response.setHeader(name, value);
  });

  if (setCookieHeaders.length > 0) {
    response.setHeader("set-cookie", setCookieHeaders);
  }
}

async function proxyRequest(request, response) {
  const requestUrl = createRequestUrl(request.url, request.headers.host);
  const upstreamUrl = new URL(`${requestUrl.pathname}${requestUrl.search}`, apiOrigin);
  const method = request.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";
  const upstreamResponse = await fetch(upstreamUrl, {
    body: hasBody ? await readRequestBody(request) : undefined,
    headers: copyRequestHeaders(request.headers),
    method,
    redirect: "manual"
  });

  response.statusCode = upstreamResponse.status;
  copyResponseHeaders(upstreamResponse, response);

  if (upstreamResponse.body === null) {
    response.end();
    return;
  }

  Readable.fromWeb(upstreamResponse.body).pipe(response);
}

const server = createServer((request, response) => {
  let requestUrl;

  try {
    requestUrl = createRequestUrl(request.url, request.headers.host);
  } catch {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  if (isProxyPath(requestUrl.pathname)) {
    proxyRequest(request, response).catch(() => {
      if (response.headersSent) {
        response.end();
        return;
      }

      response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      response.end("Bad gateway");
    });
    return;
  }

  let filePath;

  try {
    filePath = resolveStaticFile(request.url, request.headers.host);
  } catch {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  if (filePath === null) {
    response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  const contentType =
    contentTypes.get(extname(filePath)) ?? "application/octet-stream";

  response.writeHead(200, { "content-type": contentType });
  createReadStream(filePath).pipe(response);
});

const host = process.env.WEB_HOST ?? "0.0.0.0";
const port = readPort(process.env.WEB_PORT);

server.listen(port, host, () => {
  console.log(`RegexRiddle web server listening on http://${host}:${port}`);
});
