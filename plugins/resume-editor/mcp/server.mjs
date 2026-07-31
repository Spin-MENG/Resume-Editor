#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { findClaimsToVerify } from "../skills/resume-editor/scripts/find-claims-to-verify.mjs";

const PROTOCOL_VERSION = "2025-06-18";

const fields = [
  ["name", "Name", "header", "single-line"],
  ["headline", "Target headline", "header", "single-line"],
  ["contact", "Contact line", "header", "single-line"],
  ["section-profile", "Profile section title", "profile", "single-line"],
  ["profile-copy", "Professional profile", "profile", "paragraph"],
  ["section-experience", "Experience section title", "experience", "single-line"],
  ["exp-current-company", "Current company", "experience", "single-line"],
  ["exp-current-meta", "Current role and dates", "experience", "single-line"],
  ["exp-current-1", "Current role bullet 1", "experience", "bullet"],
  ["exp-current-2", "Current role bullet 2", "experience", "bullet"],
  ["exp-current-3", "Current role bullet 3", "experience", "bullet"],
  ["exp-current-4", "Current role bullet 4", "experience", "bullet"],
  ["exp-current-5", "Current role bullet 5", "experience", "bullet"],
  ["exp-previous-company", "Previous company", "experience", "single-line"],
  ["exp-previous-meta", "Previous role and dates", "experience", "single-line"],
  ["exp-previous-1", "Previous role bullet 1", "experience", "bullet"],
  ["exp-previous-2", "Previous role bullet 2", "experience", "bullet"],
  ["exp-previous-3", "Previous role bullet 3", "experience", "bullet"],
  ["section-education", "Education section title", "education", "single-line"],
  ["education-school", "School", "education", "single-line"],
  ["education-degrees", "Degrees", "education", "paragraph"],
  ["education-coursework", "Relevant coursework", "education", "paragraph"],
  ["section-research", "Projects or research section title", "projects", "single-line"],
  ["project-one-heading", "Project 1 title", "projects", "single-line"],
  ["project-one-meta", "Project 1 meta", "projects", "single-line"],
  ["project-one-1", "Project 1 bullet 1", "projects", "bullet"],
  ["project-one-2", "Project 1 bullet 2", "projects", "bullet"],
  ["project-two-heading", "Project 2 title", "projects", "single-line"],
  ["project-two-meta", "Project 2 meta", "projects", "single-line"],
  ["project-two-1", "Project 2 bullet 1", "projects", "bullet"],
  ["project-two-2", "Project 2 bullet 2", "projects", "bullet"],
  ["section-skills", "Skills section title", "skills", "single-line"],
  ["skill-1", "Technical skills", "skills", "bullet"],
  ["skill-2", "Methods", "skills", "bullet"],
  ["skill-3", "Business strengths", "skills", "bullet"],
  ["skill-4", "Languages", "skills", "bullet"],
  ["skill-5", "Awards or certifications", "skills", "bullet"]
].map(([id, label, section, kind]) => ({ id, label, section, kind }));

const defaultContent = {
  name: "YOUR NAME",
  headline: "Target Role | Core Skill Area | Industry / Function",
  contact: "City, Country | email@example.com | +00 0000 0000 | LinkedIn / Portfolio",
  "section-profile": "PROFESSIONAL PROFILE",
  "profile-copy": "Concise professional summary tailored to the target role. Mention your years of experience, strongest domain knowledge, most relevant tools, and the business outcomes you can deliver.",
  "section-experience": "PROFESSIONAL EXPERIENCE",
  "exp-current-company": "Company / Organization Name",
  "exp-current-meta": "<strong>Role Title</strong> | Month YYYY - Present",
  "exp-current-1": "<strong>Impact Area:</strong> Describe a project or responsibility using action, method, and measurable result.",
  "exp-current-2": "<strong>Tools / Process:</strong> Name the systems, tools, analysis methods, or workflows you used.",
  "exp-current-3": "<strong>Collaboration:</strong> Explain how you worked with stakeholders, translated requirements, or communicated findings.",
  "exp-current-4": "<strong>Result:</strong> Add a concrete metric, scale, efficiency gain, quality improvement, revenue impact, cost reduction, or customer outcome.",
  "exp-current-5": "",
  "exp-previous-company": "Previous Company / Project Team",
  "exp-previous-meta": "<strong>Previous Role Title</strong> | Month YYYY - Month YYYY",
  "exp-previous-1": "Summarize the most relevant achievement from this role.",
  "exp-previous-2": "",
  "exp-previous-3": "",
  "section-education": "EDUCATION",
  "education-school": "University / Institution Name",
  "education-degrees": "<strong>Degree / Major</strong> | GPA / Honors if useful | Month YYYY - Month YYYY<br><strong>Additional Degree / Certificate</strong> | Month YYYY - Month YYYY",
  "education-coursework": "<strong>Relevant Coursework:</strong> Course or training names that support the target role; remove this line if it is not useful.",
  "section-research": "PROJECTS / RESEARCH",
  "project-one-heading": "Relevant Project Name",
  "project-one-meta": "<strong>Your Role / Context</strong> | Month YYYY - Month YYYY",
  "project-one-1": "Describe the problem, your contribution, the methods or tools used, and the final result.",
  "project-one-2": "",
  "project-two-heading": "Second Project / Publication / Case Study",
  "project-two-meta": "<strong>Your Role / Recognition</strong>",
  "project-two-1": "Use this space for one additional proof point.",
  "project-two-2": "",
  "section-skills": "SKILLS & AWARDS",
  "skill-1": "<strong>Technical Skills:</strong> Tools, software, programming languages, platforms, or professional systems relevant to the target role",
  "skill-2": "<strong>Methods:</strong> Analytical methods, operating processes, research skills, design skills, or domain-specific capabilities",
  "skill-3": "<strong>Business Strengths:</strong> Stakeholder communication, project management, commercial thinking, problem solving, or execution strengths",
  "skill-4": "<strong>Languages:</strong> Language 1 (level); Language 2 (level)",
  "skill-5": "<strong>Awards / Certifications:</strong> Award, certification, license, or notable recognition"
};

const tools = [
  {
    name: "get_resume_draft_schema",
    title: "Get resume draft schema",
    description: "Returns the Resume Editor draft JSON format and editable field ids.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {}
    },
    outputSchema: {
      type: "object",
      properties: {
        app: { type: "string" },
        schemaVersion: { type: "number" },
        fields: { type: "array" }
      },
      required: ["app", "schemaVersion", "fields"]
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  },
  {
    name: "create_blank_resume_draft",
    title: "Create blank resume draft",
    description: "Creates an importable default JSON draft for the Resume Editor.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        fontScale: { type: "number", minimum: 90, maximum: 115 },
        printMode: { type: "string", enum: ["single", "auto"] }
      }
    },
    outputSchema: {
      type: "object",
      properties: {
        draft: { type: "object" }
      },
      required: ["draft"]
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  },
  {
    name: "validate_resume_draft",
    title: "Validate resume draft",
    description: "Checks a Resume Editor draft for missing fields, unknown fields, and one-page length risk.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        draft: {
          description: "Either a full exported draft object or a content object keyed by Resume Editor field id.",
          type: "object"
        }
      },
      required: ["draft"]
    },
    outputSchema: {
      type: "object",
      properties: {
        missingFields: { type: "array", items: { type: "string" } },
        unknownFields: { type: "array", items: { type: "string" } },
        characterCount: { type: "number" },
        bulletCount: { type: "number" },
        contentBulletCount: { type: "number" },
        skillLineCount: { type: "number" },
        singlePageRisk: { type: "string" }
      },
      required: ["missingFields", "unknownFields", "characterCount", "bulletCount", "contentBulletCount", "skillLineCount", "singlePageRisk"]
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  },
  {
    name: "extract_jd_signals",
    title: "Extract candidate JD signals",
    description: "Returns heuristic candidate role, skill, responsibility, and qualification signals from a pasted JD. Verify every result against the original JD before use.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        jobDescription: { type: "string", minLength: 1 },
        targetRole: { type: "string" }
      },
      required: ["jobDescription"]
    },
    outputSchema: {
      type: "object",
      properties: {
        targetRole: { type: "string" },
        skills: { type: "array", items: { type: "string" } },
        responsibilities: { type: "array", items: { type: "string" } },
        qualifications: { type: "array", items: { type: "string" } },
        keywords: { type: "array", items: { type: "string" } }
      },
      required: ["skills", "responsibilities", "qualifications", "keywords"]
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  },
  {
    name: "find_claims_to_verify",
    title: "Find resume claims to verify",
    description: "Flags unresolved placeholders and numeric, ranking, ownership, or causal wording that is not found in an optional source draft. It does not determine whether a claim is true.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        draft: {
          type: "object",
          description: "The proposed Resume Editor draft or content object to review."
        },
        sourceDraft: {
          type: "object",
          description: "Optional original draft or content object used only for text comparison."
        }
      },
      required: ["draft"]
    },
    outputSchema: {
      type: "object",
      properties: {
        sourceCompared: { type: "boolean" },
        summary: { type: "object" },
        findings: { type: "array" }
      },
      required: ["sourceCompared", "summary", "findings"]
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  },
  {
    name: "build_resume_import_payload",
    title: "Build resume import payload",
    description: "Packages edited field content into a JSON object that can be imported by the Resume Editor.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        content: {
          type: "object",
          description: "Field content keyed by Resume Editor field id."
        },
        fontScale: { type: "number", minimum: 90, maximum: 115 },
        printMode: { type: "string", enum: ["single", "auto"] }
      },
      required: ["content"]
    },
    outputSchema: {
      type: "object",
      properties: {
        draft: { type: "object" },
        validation: { type: "object" }
      },
      required: ["draft", "validation"]
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }
];

const fieldIds = new Set(fields.map((field) => field.id));
const allowedTags = new Set(["br", "strong", "b", "em", "i"]);

function textFromHtml(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeHtml(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, rawTag) => {
      const tag = rawTag.toLowerCase();
      if (!allowedTags.has(tag)) return "";
      if (tag === "br") return "<br>";
      return match.startsWith("</") ? `</${tag}>` : `<${tag}>`;
    });
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(Math.round(number), min), max);
}

function normalizeContent(input) {
  const source = input?.content && typeof input.content === "object" ? input.content : input;
  const content = {};
  if (!source || typeof source !== "object") return content;
  for (const [key, value] of Object.entries(source)) {
    if (fieldIds.has(key) && typeof value === "string") content[key] = sanitizeHtml(value);
  }
  return content;
}

function validateContent(input) {
  const source = input?.content && typeof input.content === "object" ? input.content : input;
  const content = normalizeContent(input);
  const sourceKeys = source && typeof source === "object" ? Object.keys(source) : [];
  const missingFields = fields.filter((field) => !content[field.id]).map((field) => field.id);
  const unknownFields = sourceKeys.filter((key) => !fieldIds.has(key));
  const plainText = Object.values(content).map(textFromHtml).join(" ");
  const bulletCount = fields.filter((field) => field.kind === "bullet" && content[field.id]).length;
  const contentBulletCount = fields.filter((field) => field.kind === "bullet" && field.section !== "skills" && content[field.id]).length;
  const skillLineCount = fields.filter((field) => field.section === "skills" && content[field.id]).length;
  const characterCount = plainText.length;
  const singlePageRisk =
    characterCount > 4300 || contentBulletCount > 12 || bulletCount > 18 ? "high" :
    characterCount > 3400 || contentBulletCount > 10 || bulletCount > 15 ? "medium" :
    "low";
  return { missingFields, unknownFields, characterCount, bulletCount, contentBulletCount, skillLineCount, singlePageRisk };
}

function buildDraft(content, settings = {}) {
  const normalizedContent = { ...defaultContent, ...normalizeContent(content) };
  return {
    app: "public-resume-editor",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    content: normalizedContent,
    settings: {
      printMode: settings.printMode === "auto" ? "auto" : "single",
      fontScale: clamp(settings.fontScale ?? 100, 90, 115)
    }
  };
}

function unique(values, limit = 30) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const normalized = String(value || "").trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
    if (result.length >= limit) break;
  }
  return result;
}

function extractTerms(text, candidates) {
  const lower = text.toLowerCase();
  return candidates.filter((term) => lower.includes(term.toLowerCase()));
}

function extractJdSignals(jobDescription, targetRole = "") {
  const text = String(jobDescription || "");
  const skillCandidates = [
    "Python", "SQL", "Excel", "Power BI", "Tableau", "BigQuery", "Snowflake",
    "ETL", "data visualization", "dashboard", "forecasting", "A/B testing",
    "machine learning", "statistics", "customer segmentation", "pricing",
    "inventory", "stakeholder management", "project management", "e-commerce",
    "retail", "CRM", "GA4", "Looker", "communication", "presentation",
    "数据分析", "数据可视化", "机器学习", "统计", "预测", "客户分群", "定价",
    "库存", "项目管理", "利益相关者沟通", "电商", "零售", "沟通", "汇报"
  ];
  const responsibilityPatterns = [
    /(?:responsible for|you will|the role will|duties include|key responsibilities include)\s+([^.;\n]+)/gi,
    /(?:analy[sz]e|build|develop|manage|coordinate|optimi[sz]e|support|report|present)\s+[^.;\n]+/gi
  ];
  const qualificationPatterns = [
    /(?:required|preferred|must have|nice to have|qualification[s]? include)\s+([^.;\n]+)/gi,
    /(?:\d+\+?\s+years?[^.;\n]+)/gi
  ];
  const responsibilities = [];
  const qualifications = [];
  for (const pattern of responsibilityPatterns) {
    for (const match of text.matchAll(pattern)) responsibilities.push(match[1] || match[0]);
  }
  for (const pattern of qualificationPatterns) {
    for (const match of text.matchAll(pattern)) qualifications.push(match[1] || match[0]);
  }
  const acronyms = text.match(/\b[A-Z][A-Z0-9+.#-]{1,}\b/g) || [];
  const phraseMatches = text.match(/\b(?:data|business|customer|market|product|retail|financial|commercial|operations?)\s+[a-z-]+\b/gi) || [];
  const skills = unique(extractTerms(text, skillCandidates), 24);
  const keywords = unique([...skills, ...acronyms, ...phraseMatches], 36);
  return {
    targetRole: String(targetRole || "").trim(),
    skills,
    responsibilities: unique(responsibilities.map((item) => item.trim()), 12),
    qualifications: unique(qualifications.map((item) => item.trim()), 12),
    keywords
  };
}

function resultText(message, structuredContent = {}) {
  return {
    content: [{ type: "text", text: message }],
    structuredContent
  };
}

const handlers = {
  get_resume_draft_schema() {
    return resultText("Returned the Resume Editor draft schema.", {
      app: "public-resume-editor",
      schemaVersion: 1,
      importShape: {
        app: "public-resume-editor",
        schemaVersion: 1,
        exportedAt: "ISO timestamp",
        content: "object keyed by field id",
        settings: { printMode: "single | auto", fontScale: "90-115" }
      },
      allowedInlineHtml: [...allowedTags],
      fields
    });
  },
  create_blank_resume_draft(args = {}) {
    const draft = buildDraft(defaultContent, args);
    return resultText("Created an importable default resume draft.", { draft });
  },
  validate_resume_draft(args = {}) {
    const validation = validateContent(args.draft);
    return resultText(`Draft validation complete. Single-page risk: ${validation.singlePageRisk}.`, validation);
  },
  extract_jd_signals(args = {}) {
    const signals = extractJdSignals(args.jobDescription, args.targetRole);
    return resultText(`Extracted ${signals.keywords.length} heuristic JD candidate signal(s); verify them against the source JD.`, signals);
  },
  find_claims_to_verify(args = {}) {
    const report = findClaimsToVerify(args.draft, args.sourceDraft || null);
    return resultText(`Found ${report.summary.total} resume claim(s) requiring review.`, report);
  },
  build_resume_import_payload(args = {}) {
    const draft = buildDraft(args.content, args);
    const validation = validateContent(draft);
    return resultText(`Built importable draft. Single-page risk: ${validation.singlePageRisk}.`, {
      draft,
      validation
    });
  }
};

function listTools() {
  return { tools };
}

async function handleRequest(message) {
  if (!message || typeof message !== "object") return null;
  if (!("id" in message)) return null;

  try {
    if (message.method === "initialize") {
      return {
        jsonrpc: "2.0",
        id: message.id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: "resume-editor", version: "0.3.0" },
          instructions: "Use these tools to develop complete, evidence-based Resume Editor content before one-page prioritization, extract candidate JD signals, flag claims that require verification, and package importable JSON. Do not invent resume facts or present a simulated ATS score."
        }
      };
    }

    if (message.method === "tools/list") {
      return { jsonrpc: "2.0", id: message.id, result: listTools() };
    }

    if (message.method === "tools/call") {
      const name = message.params?.name;
      const args = message.params?.arguments || {};
      if (!handlers[name]) {
        return {
          jsonrpc: "2.0",
          id: message.id,
          error: { code: -32601, message: `Unknown tool: ${name}` }
        };
      }
      const result = await handlers[name](args);
      return { jsonrpc: "2.0", id: message.id, result };
    }

    if (message.method === "ping" || message.method === "resources/list" || message.method === "prompts/list") {
      return { jsonrpc: "2.0", id: message.id, result: message.method === "ping" ? {} : { [message.method.split("/")[0]]: [] } };
    }

    return {
      jsonrpc: "2.0",
      id: message.id,
      error: { code: -32601, message: `Method not found: ${message.method}` }
    };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id: message.id,
      error: { code: -32000, message: error instanceof Error ? error.message : "Server error" }
    };
  }
}

function startStdioServer() {
  let buffer = "";

  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      Promise.resolve()
        .then(() => handleRequest(JSON.parse(line)))
        .then((response) => {
          if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
        })
        .catch((error) => {
          process.stdout.write(JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: { code: -32700, message: error instanceof Error ? error.message : "Parse error" }
          }) + "\n");
        });
    }
  });

  process.stdin.on("end", () => process.exit(0));
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) startStdioServer();

export { handleRequest, listTools, startStdioServer, tools };
