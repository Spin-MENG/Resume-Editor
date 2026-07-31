# Resume Editor Plugin

This is a local Codex/ChatGPT plugin prototype for the editable HTML Resume Editor.

It provides:

- A bundled skill with evidence-integrity, JD-matching, resume-writing, ATS/one-page, and role-specific guidance.
- A no-dependency claim checker that flags unsupported metrics, ownership, causal impact, superlatives, and unresolved placeholders for human review.
- A stdio MCP server with tools for schema discovery, draft validation, heuristic JD-signal extraction, claim review, and import-payload packaging.
- A stateless HTTP MCP server for development deployment at `/mcp`.
- A marketplace entry at the repository root for local testing.

The role guides are starting points, not universal keyword lists: the actual JD and the user's evidence remain authoritative. The skill forbids invented facts, unsupported upgrades, and fake ATS percentages.

The plugin does not store user data, call external APIs, or require user secrets. Users paste or attach a Resume Editor draft and JD inside their active Codex/ChatGPT conversation.

## Local test shape

Install the local marketplace from the repository root, then install `resume-editor` from that marketplace. Start a new Codex session after installation so bundled skills and MCP tools are loaded.

From the repository root, run both smoke tests after changing the parser, skill, references, or MCP tools:

```bash
node tests/import-cv-parser-smoke.mjs
node tests/resume-knowledge-smoke.mjs
```

For public distribution, deploy the HTTP MCP server at a stable HTTPS endpoint, add privacy and terms URLs, complete domain verification, and run the plugin submission review flow. See `DEPLOYMENT.md`.
