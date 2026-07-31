# Resume Editor Plugin

This is a local Codex/ChatGPT plugin prototype for the editable HTML Resume Editor.

It provides:

- A bundled skill that tells Codex how to optimize a resume draft against a JD.
- A stdio MCP server with tools for schema discovery, draft validation, JD signal extraction, and import-payload packaging.
- A stateless HTTP MCP server for development deployment at `/mcp`.
- A marketplace entry at the repository root for local testing.

The first version does not store user data, call external APIs, or require user secrets. Users paste or attach a Resume Editor draft and JD inside their active Codex/ChatGPT conversation.

## Local test shape

Install the local marketplace from the repository root, then install `resume-editor` from that marketplace. Start a new Codex session after installation so bundled skills and MCP tools are loaded.

For public distribution, deploy the HTTP MCP server at a stable HTTPS endpoint, add privacy and terms URLs, complete domain verification, and run the plugin submission review flow. See `DEPLOYMENT.md`.
