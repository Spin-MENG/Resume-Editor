import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(html, /globalThis\.pdfjsWorker\s*=\s*\{\s*WorkerMessageHandler:\s*workerHandler\s*\}/, "PDF import must use the main-thread worker fallback");
assert.match(html, /const cvImportTimeoutMs\s*=\s*70000/, "CV import must have a global timeout");
assert.match(html, /"pdf-open-timeout"/, "PDF open timeout must have a user-facing error");
const start = html.indexOf("      function escapeResumeText");
const end = html.indexOf("      function syncEmptyResumeSections");

assert.ok(start >= 0 && end > start, "CV parser implementation was not found in index.html");

const parserImplementation = html.slice(start, end);
const pdfLineStart = html.indexOf("      function pdfItemsToLines");
const pdfLineEnd = html.indexOf("      async function extractTextFromPdf");
assert.ok(pdfLineStart >= 0 && pdfLineEnd > pdfLineStart, "PDF line reconstruction function was not found");
const pdfLineImplementation = html.slice(pdfLineStart, pdfLineEnd);
const ids = [
  "name", "headline", "contact", "section-profile", "profile-copy",
  "section-experience", "exp-current-company", "exp-current-meta",
  "exp-current-1", "exp-current-2", "exp-current-3", "exp-current-4",
  "exp-previous-company", "exp-previous-meta", "exp-previous-1",
  "section-education", "education-school", "education-degrees", "education-coursework",
  "section-research", "project-one-heading", "project-one-meta", "project-one-1",
  "project-two-heading", "project-two-meta", "project-two-1",
  "section-skills", "skill-1", "skill-2", "skill-3", "skill-4", "skill-5"
];
const editables = ids.map((editId) => ({ dataset: { editId } }));
const slots = {
  name: "name",
  headline: "headline",
  contact: "contact",
  profile: { title: "section-profile", body: "profile-copy" },
  experience: {
    title: "section-experience",
    items: [
      { heading: "exp-current-company", meta: "exp-current-meta", bullets: ["exp-current-1", "exp-current-2", "exp-current-3", "exp-current-4"], extra: [] },
      { heading: "exp-previous-company", meta: "exp-previous-meta", bullets: ["exp-previous-1"], extra: [] }
    ]
  },
  education: {
    title: "section-education",
    items: [{ heading: "education-school", meta: "education-degrees", bullets: [], extra: ["education-coursework"] }]
  },
  projects: {
    title: "section-research",
    items: [
      { heading: "project-one-heading", meta: "project-one-meta", bullets: ["project-one-1"], extra: [] },
      { heading: "project-two-heading", meta: "project-two-meta", bullets: ["project-two-1"], extra: [] }
    ]
  },
  skills: { title: "section-skills", lines: ["skill-1", "skill-2", "skill-3", "skill-4", "skill-5"] }
};

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(`
  const editables = ${JSON.stringify(editables)};
  ${parserImplementation}
  getSemanticResumeSlots = () => (${JSON.stringify(slots)});
  globalThis.parseCv = (text) => buildSnapshotFromCvText(text);
  ${pdfLineImplementation}
  globalThis.pdfLines = (items) => pdfItemsToLines(items);
  globalThis.collectPdfText = (page) => createPdfTextContentTask(page).promise;
`, sandbox);

const sample = `
# JANE DOE
Product Manager | SaaS
Hong Kong | jane@example.com | +852 1234 5678

## PROFESSIONAL PROFILE
Product manager with 6 years of experience delivering B2B software.

## PROFESSIONAL EXPERIENCE
Acme Software
Senior Product Manager | 2022 - Present
- Led roadmap planning across three product squads.
- Improved activation by 18% through onboarding experiments.

Earlier Company
Product Manager | 2019 - 2022
- Shipped analytics workflows for enterprise customers.

## EDUCATION
Example University
BSc, Information Systems | 2015 - 2019
Relevant Coursework: Analytics, Product Design

## PROJECTS / RESEARCH
Customer Insights Platform
Project Lead | 2023
- Built a feedback taxonomy used by sales and product teams.

## SKILLS & AWARDS
- Technical Skills: SQL, Figma, Jira, data_analysis
- Languages: English, Chinese
- Awards: Product Excellence Award
`;

const result = sandbox.parseCv(sample);
assert.equal(result.snapshot.name, "JANE DOE");
assert.match(result.snapshot.contact, /jane@example\.com/);
assert.equal(result.snapshot["exp-current-company"], "Acme Software");
assert.match(result.snapshot["exp-current-1"], /roadmap planning/);
assert.equal(result.snapshot["education-school"], "Example University");
assert.equal(result.snapshot["project-one-heading"], "Customer Insights Platform");
assert.match(result.snapshot["skill-1"], /<strong>Technical Skills:<\/strong>/);
assert.match(result.snapshot["skill-1"], /data_analysis/);
assert.ok(result.recognizedSections.length >= 5);
assert.ok(result.nonEmptyFields >= 15);

const unstructured = sandbox.parseCv("JANE DOE\njane@example.com\nProduct leader\nBuilt and launched a new product for enterprise customers.");
assert.ok(unstructured.warnings.some((warning) => warning.includes("未识别到标准栏目标题")));

const chinese = sandbox.parseCv("张三\n产品经理\nzhangsan@example.com\n\n职业概述\n五年产品经验\n\n工作经历\n示例公司\n产品经理 | 2021 - 至今\n- 负责核心产品规划\n\n教育背景\n示例大学\n管理学学士\n\n专业技能\n- 数据分析");
assert.equal(chinese.snapshot.name, "张三");
assert.ok(chinese.recognizedSections.includes("经历"));
assert.ok(chinese.recognizedSections.includes("教育"));

const multiLineEducation = sandbox.parseCv("JANE DOE\njane@example.com\n\nEDUCATION\nExample University\nBSc Information Systems\nGPA: 3.8 / 4.0\n2015 - 2019\n\nVOLUNTEERING\nCommunity mentor");
assert.match(multiLineEducation.snapshot["education-degrees"], /2015 - 2019/);
assert.equal(multiLineEducation.snapshot["education-coursework"], "");
assert.match(Object.values(multiLineEducation.snapshot).join(" "), /Community mentor/);

const cjkItems = Array.from("工作经历").map((character, index) => ({
  str: character,
  transform: [1, 0, 0, 10, index * 10, 100],
  width: 10,
  height: 10
}));
assert.equal(sandbox.pdfLines(cjkItems)[0], "工作经历");
assert.equal(sandbox.pdfLines([
  { str: "Work", transform: [1, 0, 0, 10, 0, 100], width: 24, height: 10 },
  { str: "Experience", transform: [1, 0, 0, 10, 28, 100], width: 50, height: 10 }
])[0], "Work Experience");

const streamChunks = [
  { lang: "en", styles: { f1: { fontFamily: "sans-serif" } }, items: [{ str: "Hello" }] },
  { lang: null, styles: {}, items: [{ str: "world" }] }
];
let streamChunkIndex = 0;
const textWithoutAsyncIterator = await sandbox.collectPdfText({
  streamTextContent() {
    return {
      getReader() {
        return {
          async read() {
            if (streamChunkIndex >= streamChunks.length) return { done: true, value: undefined };
            return { done: false, value: streamChunks[streamChunkIndex++] };
          },
          releaseLock() {},
          async cancel() {}
        };
      }
    };
  }
});
assert.deepEqual(Array.from(textWithoutAsyncIterator.items, (item) => item.str), ["Hello", "world"]);
assert.equal(textWithoutAsyncIterator.lang, "en");

console.log("CV import parser smoke test passed");
