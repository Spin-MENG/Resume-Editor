#!/usr/bin/env node

import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { handleRequest } from "./server.mjs";

const MCP_PATH = process.env.MCP_PATH || "/mcp";
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 2 * 1024 * 1024);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type, mcp-protocol-version, mcp-session-id",
    "Access-Control-Expose-Headers": "mcp-session-id"
  };
}

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    ...corsHeaders(),
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text, extraHeaders = {}) {
  res.writeHead(status, {
    ...corsHeaders(),
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
    ...extraHeaders
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("request-body-too-large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleMcpPost(req, res) {
  let parsed;
  try {
    const body = await readBody(req);
    parsed = JSON.parse(body || "null");
  } catch (error) {
    const message = error instanceof Error && error.message === "request-body-too-large"
      ? "Request body is too large."
      : "Invalid JSON-RPC request body.";
    sendJson(res, error instanceof Error && error.message === "request-body-too-large" ? 413 : 400, {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message }
    });
    return;
  }

  const messages = Array.isArray(parsed) ? parsed : [parsed];
  const responses = [];
  for (const message of messages) {
    const response = await handleRequest(message);
    if (response) responses.push(response);
  }

  if (!responses.length) {
    res.writeHead(202, { ...corsHeaders(), "cache-control": "no-store" });
    res.end();
    return;
  }

  sendJson(res, 200, Array.isArray(parsed) ? responses : responses[0], {
    "mcp-session-id": "resume-editor-stateless"
  });
}

function handleMcpGet(req, res) {
  if (!String(req.headers.accept || "").includes("text/event-stream")) {
    sendText(res, 405, "Use POST for JSON-RPC requests to this stateless MCP endpoint.");
    return;
  }

  res.writeHead(200, {
    ...corsHeaders(),
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "mcp-session-id": "resume-editor-stateless"
  });
  res.write(": resume-editor MCP stream connected\n\n");
}

function createResumeEditorHttpServer() {
  return createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "OPTIONS") {
      res.writeHead(204, corsHeaders());
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === "/") {
      sendJson(res, 200, {
        name: "resume-editor",
        status: "ok",
        mcp: MCP_PATH,
        storage: "stateless",
        authentication: "none"
      });
      return;
    }

    if (url.pathname !== MCP_PATH) {
      sendJson(res, 404, { error: "not_found" });
      return;
    }

    try {
      if (req.method === "POST") {
        await handleMcpPost(req, res);
        return;
      }
      if (req.method === "GET") {
        handleMcpGet(req, res);
        return;
      }
      if (req.method === "DELETE") {
        res.writeHead(202, corsHeaders());
        res.end();
        return;
      }
      sendText(res, 405, "Method not allowed.");
    } catch (error) {
      sendJson(res, 500, {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : "Internal server error"
        }
      });
    }
  });
}

function startHttpServer() {
  const server = createResumeEditorHttpServer();
  server.listen(PORT, HOST, () => {
    console.error(`Resume Editor MCP listening on http://${HOST}:${PORT}${MCP_PATH}`);
  });
  return server;
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) startHttpServer();

export { createResumeEditorHttpServer, startHttpServer };
