import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findClaimsToVerify } from "../plugins/resume-editor/skills/resume-editor/scripts/find-claims-to-verify.mjs";
import { handleRequest, listTools } from "../plugins/resume-editor/mcp/server.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(repositoryRoot, "plugins/resume-editor/skills/resume-editor");
const skill = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
const referenceNames = [
  "evidence-integrity.md",
  "jd-matching.md",
  "writing-playbook.md",
  "ats-one-page.md",
  "data-analytics.md",
  "data-science-ml.md",
  "retail-ecommerce.md",
  "product-operations.md"
];

for (const referenceName of referenceNames) {
  const referencePath = path.join(skillRoot, "references", referenceName);
  assert.ok(fs.existsSync(referencePath), `Missing ${referenceName}`);
  const reference = fs.readFileSync(referencePath, "utf8");
  assert.match(skill, new RegExp(`references/${referenceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.match(reference, /Source basis/i, `${referenceName} must identify its source basis`);
}

assert.ok(fs.existsSync(path.join(skillRoot, "agents/openai.yaml")), "Missing agents/openai.yaml");
assert.match(skill, /Do not invent or upgrade employers/);
assert.match(skill, /Do not produce a simulated ATS percentage/);

const source = {
  content: {
    "exp-current-1": "Analyzed demand across 12 markets and presented findings to retail stakeholders.",
    "exp-current-2": "Built a forecasting workflow in Python."
  }
};
const draft = {
  content: {
    "exp-current-1": "Analyzed demand across 12 markets and reduced forecast error by 20%.",
    "exp-current-2": "Spearheaded a forecasting workflow in Python.",
    "exp-current-3": "Generated [待确认：年度节省金额] in operating value."
  }
};
const report = findClaimsToVerify(draft, source);
assert.equal(report.sourceCompared, true);
assert.ok(report.findings.some((finding) => finding.type === "percentage" && finding.value.includes("20")));
assert.ok(report.findings.some((finding) => finding.type === "strong-ownership" && /spearheaded/i.test(finding.value)));
assert.ok(report.findings.some((finding) => finding.type === "placeholder"));
assert.ok(!report.findings.some((finding) => finding.value === "12 markets"));

const noSourceReport = findClaimsToVerify(draft);
assert.equal(noSourceReport.sourceCompared, false);
assert.ok(noSourceReport.findings.some((finding) => finding.value === "12 markets"));

assert.ok(listTools().tools.some((tool) => tool.name === "find_claims_to_verify"));
const mcpResponse = await handleRequest({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "find_claims_to_verify",
    arguments: { draft, sourceDraft: source }
  }
});
assert.equal(mcpResponse.result.structuredContent.sourceCompared, true);
assert.ok(mcpResponse.result.structuredContent.findings.some((finding) => finding.type === "percentage"));

const chineseJdResponse = await handleRequest({
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "extract_jd_signals",
    arguments: { jobDescription: "负责零售业务的数据分析、预测与利益相关者沟通。" }
  }
});
assert.ok(chineseJdResponse.result.structuredContent.skills.includes("数据分析"));
assert.ok(chineseJdResponse.result.structuredContent.skills.includes("零售"));

console.log("Resume knowledge smoke test passed");
