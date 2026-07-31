#!/usr/bin/env node

import fs from "node:fs";
import { pathToFileURL } from "node:url";

const claimPatterns = [
  {
    type: "placeholder",
    severity: "high",
    pattern: /\[(?:待确认|待补充|请确认|补充|confirm|verify|add metric|add number)[^\]]*\]/gi
  },
  {
    type: "percentage",
    severity: "high",
    pattern: /[+-]?\d+(?:\.\d+)?\s*(?:%|％|percentage points?|百分点)/gi
  },
  {
    type: "currency",
    severity: "high",
    pattern: /(?:[$€£¥￥]\s?\d[\d,.]*(?:\s?[kmb])?|\b(?:USD|HKD|CNY|RMB|EUR|GBP)\s?\d[\d,.]*(?:\s?[kmb])?)/gi
  },
  {
    type: "quantified-scope",
    severity: "high",
    pattern: /(?:\b\d+(?:\.\d+)?\s*(?:x|times|k|m|b|thousand|million|billion|users?|customers?|markets?|projects?|teams?|members?|hours?|days?|weeks?|months?|years?|records?|rows?|products?|skus?|stores?|countries?|transactions?|campaigns?|dashboards?|models?|pipelines?|experiments?|stakeholders?)\b|\d+(?:\.\d+)?\s*(?:倍|万|亿|个|名|人|项|次|家|小时|天|周|月|年|条|行|款|店|国家|市场|用户|客户|产品|交易|活动|模型|管道|实验))/gi
  },
  {
    type: "ranking-or-superlative",
    severity: "high",
    pattern: /(?:\b(?:first-ever|industry-first|best-in-class|largest|highest|lowest|top\s*\d+|#\d+)\b|首次|行业首个|第一|最大|最高|最低|领先|顶级)/gi
  },
  {
    type: "strong-ownership",
    severity: "medium",
    pattern: /(?:\b(?:led|owned|drove|spearheaded|architected|single-handedly|solely)\b|主导|全权负责|独立负责|从零搭建|牵头)/gi
  },
  {
    type: "causal-impact",
    severity: "medium",
    pattern: /(?:\b(?:increased|reduced|improved|saved|generated|grew|cut|boosted|resulted in|caused)\b|提升|降低|减少|节省|创造|带来|促成|增长)/gi
  }
];

function decodeBasicEntities(value) {
  return String(value ?? "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function toPlainText(value) {
  return decodeBasicEntities(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForComparison(value) {
  return toPlainText(value).normalize("NFKC").toLowerCase();
}

function getContent(input) {
  if (!input || typeof input !== "object") return {};
  const source = input.content && typeof input.content === "object" ? input.content : input;
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => typeof value === "string")
  );
}

function getSnippet(text, start, length) {
  const radius = 54;
  const from = Math.max(0, start - radius);
  const to = Math.min(text.length, start + length + radius);
  return `${from > 0 ? "…" : ""}${text.slice(from, to).trim()}${to < text.length ? "…" : ""}`;
}

export function findClaimsToVerify(draftInput, sourceInput = null) {
  const draft = getContent(draftInput);
  const source = sourceInput ? getContent(sourceInput) : null;
  const sourceText = source
    ? normalizeForComparison(Object.values(source).join(" "))
    : "";
  const findings = [];
  const seen = new Set();

  for (const [fieldId, rawValue] of Object.entries(draft)) {
    const text = toPlainText(rawValue);
    const sourceFieldText = source ? normalizeForComparison(source[fieldId] || "") : "";
    for (const definition of claimPatterns) {
      definition.pattern.lastIndex = 0;
      for (const match of text.matchAll(definition.pattern)) {
        const value = String(match[0] || "").trim();
        const normalizedValue = normalizeForComparison(value);
        const key = `${fieldId}\u0000${definition.type}\u0000${normalizedValue}\u0000${match.index}`;
        if (!normalizedValue || seen.has(key)) continue;
        seen.add(key);
        const foundInSource = source
          ? sourceFieldText.includes(normalizedValue) || sourceText.includes(normalizedValue)
          : null;
        if (source && foundInSource && definition.type !== "placeholder") continue;
        findings.push({
          fieldId,
          type: definition.type,
          severity: definition.severity,
          value,
          status:
            definition.type === "placeholder" ? "unresolved-placeholder" :
            source ? "not-found-in-source" : "source-not-provided",
          snippet: getSnippet(text, match.index || 0, value.length)
        });
      }
    }
  }

  const byType = {};
  for (const finding of findings) byType[finding.type] = (byType[finding.type] || 0) + 1;
  return {
    sourceCompared: Boolean(source),
    summary: {
      total: findings.length,
      highSeverity: findings.filter((finding) => finding.severity === "high").length,
      byType
    },
    findings
  };
}

function parseArguments(argv) {
  const options = { draft: "", source: "", help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--draft") options.draft = argv[++index] || "";
    else if (argument === "--source") options.source = argv[++index] || "";
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read ${label} JSON at ${filePath}: ${error.message}`);
  }
}

function printHelp() {
  console.log("Usage: node find-claims-to-verify.mjs --draft final.json [--source original.json]");
}

const isCli = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isCli) {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      printHelp();
    } else {
      if (!options.draft) throw new Error("--draft is required");
      const draft = readJson(options.draft, "draft");
      const source = options.source ? readJson(options.source, "source") : null;
      console.log(JSON.stringify(findClaimsToVerify(draft, source), null, 2));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
