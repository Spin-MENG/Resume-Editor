---
name: resume-editor
description: Use when creating, validating, or optimizing a resume draft for the Resume Editor HTML tool, especially when the user provides a JD and wants an importable JSON draft.
---

# Resume Editor Workflow

Use this skill when the user wants to work with the Resume Editor HTML tool from ChatGPT or Codex.

## Core workflow

1. Ask the user for the JD and their current resume draft if either is missing.
   - Prefer a JSON file exported from the editor with "导出草稿".
   - If the user only pasted resume text, map it into the editor fields before packaging.
2. Call `get_resume_draft_schema` to confirm the editable fields and JSON shape.
3. Call `validate_resume_draft` when a draft is provided.
4. Call `extract_jd_signals` for the JD.
5. Rewrite only the fields the user wants changed, unless they explicitly ask for a full rewrite.
6. Call `build_resume_import_payload` with the final field content.
7. Return the importable JSON and concise import instructions.

## Quality rules

- Do not invent employers, degrees, dates, metrics, certifications, awards, or publications.
- Preserve user-provided facts unless the user asks to remove or rewrite them.
- Prefer JD-matched wording, concrete action verbs, and measurable outcomes.
- Keep the one-page constraint in mind. If the draft is long, prioritize recent and target-relevant experience.
- Keep inline HTML minimal. The editor supports text plus simple inline tags such as `<strong>` and `<br>`.
- Do not request API keys, Codex tokens, passwords, government IDs, or other secrets.

## Output expectation

When producing a final draft, provide:

1. A brief summary of what changed.
2. The importable JSON payload, or a saved `.json` file when working in a local filesystem task.
3. Any residual risks, such as missing evidence for a JD requirement or likely one-page overflow.
