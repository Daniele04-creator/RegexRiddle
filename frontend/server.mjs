import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_WEB_PORT = 4173;
const distRoot = resolve(fileURLToPath(new URL("./dist", import.meta.url)));

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

function isInsideDistRoot(filePath) {
  return filePath === distRoot || filePath.startsWith(`${distRoot}${sep}`);
}

function resolveStaticFile(requestUrl, host) {
  const url = new URL(requestUrl ?? "/", `http://${host ?? "localhost"}`);
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

const server = createServer((request, response) => {
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
