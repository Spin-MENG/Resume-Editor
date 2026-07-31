---
name: resume-editor
description: Tailor, review, validate, and package resumes or CVs for the Resume Editor HTML tool. Use when a user provides a job description, asks for professional or ATS-aware resume improvement, needs a one-page prioritization pass or factual-claim audit, or wants importable Resume Editor JSON.
---

# Resume Editor Workflow

## Load the right knowledge

Read only the references required for the request:

- Always read [evidence-integrity.md](references/evidence-integrity.md) before changing claims and [writing-playbook.md](references/writing-playbook.md) before rewriting prose.
- For a supplied JD, read [jd-matching.md](references/jd-matching.md).
- For ATS or one-page requests, read [ats-one-page.md](references/ats-one-page.md).
- Load at most the most relevant role guide: [data-analytics.md](references/data-analytics.md), [data-science-ml.md](references/data-science-ml.md), [retail-ecommerce.md](references/retail-ecommerce.md), or [product-operations.md](references/product-operations.md). Treat the JD as authoritative when it differs from a guide.

## Execute the workflow

1. Obtain the source resume, target JD when tailoring, target role, output language, and page constraint. Prefer JSON exported with **导出草稿**. If only text is available, map it to editor fields without filling factual gaps.
2. Call `get_resume_draft_schema`, then `validate_resume_draft` when a draft exists.
3. Build an evidence ledger from the source resume. Separate direct evidence, transferable evidence, and missing evidence before rewriting.
4. For a JD, call `extract_jd_signals` only as a candidate extractor. Verify every selected signal against the original JD wording and classify it with `jd-matching.md`.
5. Plan what to keep, strengthen, condense, move, or remove. Rewrite only the requested scope unless the user asks for a full rewrite.
6. Preserve facts while improving relevance, specificity, structure, and natural keyword coverage. Use minimal inline HTML: `<strong>` and `<br>` only when useful.
7. Audit the final claims. Call `find_claims_to_verify` when available and pass both the proposed and source drafts. Otherwise, in a local filesystem task, run:

   ```bash
   node scripts/find-claims-to-verify.mjs --draft final.json --source original.json
   ```

   Omit `--source` only when no source draft is available. Resolve findings from user evidence or leave explicit `[待确认：…]` markers; never silently guess.
8. Call `build_resume_import_payload`, then validate the returned draft. Treat character-count page risk as a heuristic; use the editor's A4 print preview for the final page check.

## Enforce boundaries

- Do not invent or upgrade employers, roles, dates, degrees, tools, scope, metrics, causality, ownership, awards, certifications, or publications.
- Do not produce a simulated ATS percentage or claim to predict hiring outcomes.
- Do not replace a specific fact with a stronger adjacent claim unless the source supports it.
- Do not request API keys, tokens, passwords, government IDs, or unrelated personal data.
- Prefer a clear evidence gap over impressive but unsupported wording.

## Return the result

Provide:

1. A concise JD-fit and edit summary.
2. The importable JSON payload or a saved `.json` path.
3. A short list of facts that still require confirmation.
4. Residual evidence gaps and one-page/formatting risks.
