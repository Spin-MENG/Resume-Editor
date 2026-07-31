# JD Matching / 职位描述匹配

Use this reference to convert a job description into traceable editing priorities. Match requirements to evidence; do not predict hiring outcomes.

## 1. Preserve the source

Keep the original JD unchanged. Split it into atomic requirements so that one row contains one capability, credential, responsibility, or constraint. For every row, record a short exact **source span** plus its location, such as `Qualifications, bullet 3`. A heading alone is not evidence of priority.

For bilingual work, preserve product names, tool names, credentials, and domain terms. Translate meaning rather than seniority or certainty, and retain the original-language source span.

## 2. Classify each JD item

Assign exactly one class based on the wording and role structure:

- **Required / 硬性要求** — an explicit must, minimum, required credential, eligibility condition, or non-negotiable constraint. Signals include `must`, `required`, `minimum`, `必须`, `硬性`, and `任职资格` when the item itself is mandatory.
- **Core / 核心能力** — central work outcomes, recurring responsibilities, or skills essential to performing the role, even if not written as a formal minimum. Signals include `key responsibility`, `you will`, `核心职责`, and `主要负责`; confirm centrality from repetition and role purpose.
- **Preferred / 优先项** — a stated advantage rather than a condition. Signals include `preferred`, `nice to have`, `a plus`, `优先`, and `加分项`.
- **Context / 背景信息** — company, team, product, mission, benefits, reporting context, or general narrative that does not ask for candidate evidence. Use it for tone and relevance, not coverage.

Do not classify solely from section headings. If one sentence mixes classes, split it into separate rows.

## 3. Build the evidence matrix

Create this matrix before rewriting:

| ID | Class | JD source span + location | Normalized requirement | Candidate evidence + source span | Evidence label | Editing action | Confirmation needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Required/Core/Preferred/Context | Short exact fragment | One capability or constraint | Exact resume field, bullet, or user message | Direct/Transferable/Missing | Keep, surface, reframe, ask, or omit | Question or `—` |

Apply the evidence labels from `evidence-integrity.md`:

- **Direct**: the supplied candidate material explicitly supports the requirement.
- **Transferable**: a supported adjacent competency exists, but not the exact target context, tool, duty, or level.
- **Missing**: no candidate evidence supports it.

Use `[待确认：...]` for an exact verification question. The JD and external occupational sources may clarify terminology but cannot fill the candidate-evidence column.

## 4. Rewrite by priority

1. Surface direct evidence for required items, then core items.
2. Use honest transferable evidence when it demonstrates the underlying competency; name the real context.
3. Include preferred evidence only when supported and space permits.
4. Use context to tune the summary and vocabulary, not to manufacture fit.
5. Reuse an exact JD term only when the candidate evidence has the same meaning. Avoid keyword lists and repeated synonyms.
6. Prefer supported action + object/context + method/tool + result. Omit any unsupported component rather than guessing it.
7. Move missing requirements to a gap list or confirmation questions; do not insert them into the resume.
8. For a one-page resume, remove low-relevance content only after protecting direct required/core evidence and essential chronology.

## 5. Report coverage without a fake ATS score

Never output an “ATS score,” match percentage, pass probability, ranking prediction, or claim that a particular ATS will accept the resume. Keyword behavior varies by employer and system, and the matrix is not an ATS simulation.

Instead, report auditable counts by class and label, for example: `Required: 3 direct, 1 transferable, 1 missing`. Link every count to matrix row IDs. Also report:

- strongest supported matches;
- transferable matches whose context differs;
- missing or unresolved requirements;
- wording changes made and facts still requiring confirmation;
- likely one-page or readability risk.

## 6. Final audit

Confirm that every matrix row has a source span, every resume claim has candidate evidence, no context row is counted as a requirement, no missing item appears as fact, and no wording overstates ownership, seniority, proficiency, causality, or impact.

## Source basis

- [MIT CAPD — Resumes](https://capd.mit.edu/resources/resumes/) — recommends using the position description to select relevant demonstrated skills and using job-relevant terminology. Accessed 2026-07-31.
- [MIT CAPD — Resumes: Writing about your skills](https://capd.mit.edu/resources/resumes-writing-about-your-skills/) — supports action-, task-, context-, and outcome-based evidence statements. Accessed 2026-07-31.
- [O*NET Resource Center — Content Model](https://www.onetcenter.org/content.html) — provides a structured distinction among worker requirements, occupational requirements, occupation-specific tasks, and work context. Accessed 2026-07-31.
