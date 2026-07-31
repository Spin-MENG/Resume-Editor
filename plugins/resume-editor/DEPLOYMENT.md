# Resume Editor Online MCP Deployment

This document describes the next step for sharing Resume Editor with testers through ChatGPT or Codex.

## Current shape

- `mcp/server.mjs` is the local stdio MCP server used by the bundled local plugin.
- `mcp/http-server.mjs` is the deployable, stateless HTTP MCP server.
- The HTTP endpoint is `POST /mcp`.
- `GET /` returns a health response.
- The service does not store resumes, JDs, API keys, access tokens, or user accounts.

## Local development

From this plugin directory:

```bash
npm run mcp:http
```

Then test:

```bash
curl -s http://127.0.0.1:8787/
```

For MCP inspection, use Streamable HTTP and point the inspector at:

```text
http://127.0.0.1:8787/mcp
```

## Public development endpoint

Deploy the plugin directory to a Node-compatible host and run:

```bash
npm start
```

Set these environment variables when needed:

- `PORT`: server port, default `8787`.
- `HOST`: bind host, default `0.0.0.0`.
- `MCP_PATH`: endpoint path, default `/mcp`.
- `ALLOWED_ORIGIN`: CORS origin, default `*`.
- `MAX_BODY_BYTES`: request body limit, default `2097152`.

For public plugin testing, the endpoint must be stable HTTPS, for example:

```text
https://example.com/mcp
```

## Before wider sharing

1. Add a real privacy policy and terms page.
2. Confirm logs do not contain resume text or job descriptions.
3. Add rate limiting at the hosting layer.
4. Test with representative JDs, long resumes, invalid JSON, and out-of-scope prompts.
5. Register the HTTPS `/mcp` endpoint in ChatGPT Developer Mode.
6. Only add authentication if the service stores user-specific data or performs account-bound actions.
