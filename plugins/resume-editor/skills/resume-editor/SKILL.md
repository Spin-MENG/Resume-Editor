---
name: resume-editor
description: Develop, tailor, review, validate, and package rich evidence-based resumes or CVs for the Resume Editor HTML tool. Use when a user provides a job description, asks to strengthen sparse content without invention, requests professional or ATS-aware improvement, needs a one-page prioritization pass or factual-claim audit, or wants importable Resume Editor JSON.
---

# Resume Editor Workflow

## Load the right knowledge

Read only the references required for the request:

- Always read [evidence-integrity.md](references/evidence-integrity.md) before changing claims and [writing-playbook.md](references/writing-playbook.md) before rewriting prose.
- For a full rewrite, a sparse draft, or a request for richer content, read [content-development.md](references/content-development.md) and use its evidence-expansion and density checks.
- For a supplied JD, read [jd-matching.md](references/jd-matching.md).
- For ATS or one-page requests, read [ats-one-page.md](references/ats-one-page.md).
- Load at most the most relevant role guide: [data-analytics.md](references/data-analytics.md), [data-science-ml.md](references/data-science-ml.md), [retail-ecommerce.md](references/retail-ecommerce.md), or [product-operations.md](references/product-operations.md). Treat the JD as authoritative when it differs from a guide.

## Execute the workflow

1. Obtain the source resume, target JD when tailoring, target role, output language, and page constraint. Prefer JSON exported with **导出草稿**. If only text is available, map it to editor fields without filling factual gaps.
2. Call `get_resume_draft_schema`, then `validate_resume_draft` when a draft exists.
3. Build an evidence ledger from the entire source resume. Recover useful detail that may be scattered across the profile, experience, projects, education, and skills; separate direct evidence, transferable evidence, and missing evidence before rewriting.
4. For a JD, call `extract_jd_signals` only as a candidate extractor. Verify every selected signal against the original JD wording and classify it with `jd-matching.md`.
5. Develop the evidence before compressing it. For each priority entry, map the supported context, objective, ownership boundary, method or tools, scope or cadence, stakeholders or deliverable, and verified outcome or decision use. Do not reduce a detailed source to duty-only fragments.
6. Enforce the clarification gate. When the priority role has fewer than three distinct supported contributions, or missing detail leaves at least two Required/Core JD items unresolved, ask one batch of no more than six specific questions and stop before generating the final import JSON. Continue only after the user answers. Bypass this gate only when the user explicitly says to ask no questions or requests an immediate best-effort draft; a generic request to “proceed” is not a bypass.
7. Draft in two passes: first build content-complete, distinct evidence; then rank and trim it for the requested page limit. Preserve useful verified context before shortening wording or deleting lower-value evidence. Rewrite only the requested scope unless the user asks for a full rewrite.
8. Preserve facts while improving relevance, specificity, structure, and natural keyword coverage. Fill optional bullet fields only with distinct supported evidence; leave them empty rather than duplicate or pad. Use minimal inline HTML: `<strong>` and `<br>` only when useful.
9. Audit the final claims. Call `find_claims_to_verify` when available and pass both the proposed and source drafts. Otherwise, in a local filesystem task, run:

   ```bash
   node scripts/find-claims-to-verify.mjs --draft final.json --source original.json
   ```

   Omit `--source` only when no source draft is available. Resolve findings from user evidence or leave explicit `[待确认：…]` markers; never silently guess.
10. Call `build_resume_import_payload`, then validate the returned draft. Treat character-count page risk as a heuristic; use the editor's A4 print preview for the final page check.

## Enforce boundaries

- Do not invent or upgrade employers, roles, dates, degrees, tools, scope, metrics, causality, ownership, awards, certifications, or publications.
- Do not produce a simulated ATS percentage or claim to predict hiring outcomes.
- Do not replace a specific fact with a stronger adjacent claim unless the source supports it.
- Do not confuse safety with vagueness: retain verified context, methods, cadence, stakeholders, deliverables, and decision use when they strengthen the evidence.
- Do not compress for one page until the content-complete pass has identified the strongest distinct evidence.
- Do not request API keys, tokens, passwords, government IDs, or unrelated personal data.
- Prefer a clear evidence gap over impressive but unsupported wording.

## Return the result

Provide:

1. A concise JD-fit and edit summary.
2. The importable JSON payload or a saved `.json` path.
3. A short list of facts that still require confirmation.
4. Residual evidence gaps and one-page/formatting risks.
