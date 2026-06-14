import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createJdAnalyzerHarness } from "./create-harness.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sessionsDir = path.join(__dirname, "sessions");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function loadEnvFile() {
  return readFile(path.join(rootDir, ".env"), "utf8")
    .then((content) => {
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const separator = trimmed.indexOf("=");
        if (separator === -1) continue;
        const key = trimmed.slice(0, separator).trim();
        const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
        if (key && process.env[key] === undefined) process.env[key] = value;
      }
    })
    .catch(() => {});
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 200_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function safeSessionId(value) {
  return String(value || "anonymous").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "anonymous";
}

async function appendSessionEvent(sessionId, event) {
  await mkdir(sessionsDir, { recursive: true });
  const file = path.join(sessionsDir, `${safeSessionId(sessionId)}.jsonl`);
  await writeFile(file, `${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}\n`, { flag: "a" });
}

async function handleJdAnalyze(req, res, harness) {
  try {
    const rawBody = await readRequestBody(req);
    const body = JSON.parse(rawBody || "{}");
    const jdText = String(body.jdText || "").trim();
    const identity = String(body.identity || "校招生").trim();
    const direction = String(body.direction || "RAG").trim();
    const sessionId = safeSessionId(body.sessionId);

    if (jdText.length < 20) {
      sendJson(res, 400, { error: "请至少粘贴一段包含岗位要求或技术要求的 JD 文本。" });
      return;
    }

    await appendSessionEvent(sessionId, { type: "jd_request", identity, direction, jdTextLength: jdText.length });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const result = await harness.analyze({ jdText, identity, direction, signal: controller.signal });
      await appendSessionEvent(sessionId, { type: "jd_response", primaryTaskId: result.primaryTaskId });
      sendJson(res, 200, result);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 502, { error: message });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url || "/", "http://localhost");
  const pathname = decodeURIComponent(url.pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(rootDir, relativePath);

  if (!filePath.startsWith(rootDir) || filePath.includes(`${path.sep}server${path.sep}`) || path.basename(filePath) === ".env") {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const content = await readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

await loadEnvFile();
const harness = await createJdAnalyzerHarness({ rootDir, env: process.env });
const port = Number(process.env.PORT || 5173);

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/jd-analyze") {
    handleJdAnalyze(req, res, harness);
    return;
  }
  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405, { Allow: "GET, HEAD, POST" });
  res.end("Method not allowed");
});

server.listen(port, () => {
  console.log(`AI PM workbench running at http://localhost:${port}`);
});
