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
  "content-development.md",
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
assert.match(skill, /content-complete/i);
assert.match(skill, /no more than six specific questions/i);
assert.match(skill, /stop before generating the final import JSON/i);

const schemaResponse = await handleRequest({
  jsonrpc: "2.0",
  id: 0,
  method: "tools/call",
  params: { name: "get_resume_draft_schema", arguments: {} }
});
const schemaFieldIds = schemaResponse.result.structuredContent.fields.map((field) => field.id);
for (const fieldId of ["exp-current-5", "exp-previous-2", "exp-previous-3", "project-one-2", "project-two-2"]) {
  assert.ok(schemaFieldIds.includes(fieldId), `MCP schema is missing ${fieldId}`);
}
assert.deepEqual(schemaResponse.result.structuredContent.templateStyles, ["classic", "modern", "executive", "analyst"]);
assert.equal(schemaResponse.result.structuredContent.importShape.settings.templateStyle, "classic | modern | executive | analyst");

const denseContent = Object.fromEntries([
  "exp-current-1", "exp-current-2", "exp-current-3", "exp-current-4",
  "exp-previous-1", "exp-previous-2", "exp-previous-3",
  "project-one-1", "project-one-2", "project-two-1", "project-two-2",
  "skill-1", "skill-2", "skill-3", "skill-4", "skill-5"
].map((fieldId) => [fieldId, `Verified content for ${fieldId}`]));
const depthValidation = await handleRequest({
  jsonrpc: "2.0",
  id: 0.5,
  method: "tools/call",
  params: { name: "validate_resume_draft", arguments: { draft: { content: denseContent } } }
});
assert.equal(depthValidation.result.structuredContent.bulletCount, 16);
assert.equal(depthValidation.result.structuredContent.contentBulletCount, 11);
assert.equal(depthValidation.result.structuredContent.skillLineCount, 5);
assert.equal(depthValidation.result.structuredContent.singlePageRisk, "medium");

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

const payloadResponse = await handleRequest({
  jsonrpc: "2.0",
  id: 1.5,
  method: "tools/call",
  params: {
    name: "build_resume_import_payload",
    arguments: { content: { name: "Jane Doe" }, templateStyle: "modern", fontScale: 104, printMode: "single" }
  }
});
assert.equal(payloadResponse.result.structuredContent.draft.settings.templateStyle, "modern");
assert.equal(payloadResponse.result.structuredContent.draft.settings.fontScale, 104);

const initializeResponse = await handleRequest({
  jsonrpc: "2.0",
  id: 1.75,
  method: "initialize",
  params: {}
});
assert.equal(initializeResponse.result.serverInfo.version, "0.3.1");

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
