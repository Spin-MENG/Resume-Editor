# Resume Editor

一个单文件、可本地运行的简历编辑器。朋友 clone 后可以直接打开 `index.html`，导入已有 CV 或编辑自己的简历，并导出 A4 PDF。

这个仓库只包含公开版工具和 Codex/ChatGPT 可连接的本地 plugin，不包含个人简历、照片、PDF 或微信临时文件。

## 最快使用方式

如果你只是想编辑自己的简历，不需要安装任何依赖：

```bash
git clone https://github.com/Spin-MENG/Resume-Editor.git
cd Resume-Editor
open index.html
```

Windows 用户可以进入仓库文件夹后，直接双击 `index.html`。

打开页面后：

1. 已有简历时，点击 `导入已有 CV`，选择 PDF、DOCX、TXT 或 Markdown 文件。
2. 检查提取文字和识别结果，确认后点击 `导入并覆盖正文`。
3. 点击简历里的文字继续修改，并用右上角的字号控制调整整体字号。
4. 如果只想导出一页，右上角选择 `单页 A4`。
5. 点击 `导出 PDF`，在浏览器打印窗口里保存为 PDF。

## 直接使用网页编辑器

1. Clone 仓库：

   ```bash
   git clone https://github.com/Spin-MENG/Resume-Editor.git
   cd Resume-Editor
   ```

2. 用浏览器打开 `index.html`。

   macOS 可以运行：

   ```bash
   open index.html
   ```

   Windows 可以双击 `index.html`。

3. 在页面里直接编辑内容。所有修改会自动保存在当前浏览器里。

4. 右上角常用按钮：

   - `PDF 长度`：选择 `单页 A4` 或 `自动分页`
   - `字号`：调整整份简历的字号大小
   - `恢复模板`：清空当前修改，恢复默认模板
   - `导入已有 CV`：导入 PDF、DOCX、TXT 或 Markdown，并自动识别简历栏目
   - `撤销导入`：导入 CV 后恢复到导入前的正文（有可恢复版本时才显示）
   - `导入草稿`：导入之前保存的 JSON 草稿
   - `导出草稿`：把当前编辑结果保存成 JSON，方便下次继续编辑
   - `导出 PDF`：打开浏览器打印窗口并保存为 PDF

## 导入已有 CV

点击右上角 `导入已有 CV`，可以选择：

- `.pdf`
- `.docx`
- `.txt`
- `.md` / `.markdown`

导入流程：

1. 页面在当前浏览器中读取文件。
2. 先显示提取到的全文和栏目识别结果，不会立即覆盖当前简历。
3. 如果 PDF 双栏顺序、换行或标题识别不准确，可以直接在预览框中修正。
4. 点击 `导入并覆盖正文` 后，内容会填入姓名、简介、经历、教育、项目和技能等栏目。
5. 空 bullet、空经历和空项目会自动收起；在屏幕上悬停简历正文可看到 `＋ 添加栏目`，空条目也可重新补充。
6. 内容超过模板容量时，会合并到最后一个可用条目；导入后请检查事实、栏目和一页 A4 排版。
7. 如果导入结果不合适，点击右上角 `撤销导入` 恢复导入前版本。

注意：

- PDF 和 DOCX 解析组件会在第一次使用时从 jsDelivr 或 unpkg 加载，因此需要联网；页面会用固定的 SHA-384 哈希校验组件后才执行。
- 第一次导入 PDF 需要下载约 3.3 MB 的解析组件。按钮会依次显示“加载 PDF 组件”“打开 PDF”和“解析 PDF 1/1”等阶段；任何异常等待都会自动超时，不会一直停在“正在读取”。
- 解析组件会在当前页面中读取所选文件的字节。本项目没有 CV 上传接口，页面代码不会主动发送简历正文；使用 PDF / DOCX 导入仍意味着信任固定版本的 PDF.js、Mammoth 及 CDN 可用性。高度敏感的简历可以改用 TXT / Markdown，或先审查源码。
- TXT 和 Markdown 使用浏览器原生读取，不依赖解析组件。
- 图片扫描版 PDF 没有文字层，当前版本不会做 OCR。请先 OCR，或转换成 DOCX / TXT。
- 旧版 `.doc` 暂不支持，请先另存为 `.docx`。
- 单个文件上限为 15 MB，PDF 上限为 30 页。
- 建议使用较新的 Safari、Chrome 或 Firefox；如果 PDF / DOCX 组件无法加载，可先转换为 TXT / Markdown。

## 导出 PDF 建议

点击右上角 `导出 PDF` 后，在系统打印窗口里建议选择：

   - 纸张：A4
   - 缩放：100%
   - 背景图形/Print backgrounds：建议开启
   - 页边距：默认或无
   - 页眉页脚：关闭

如果内容溢出到第二页：

1. 先把页面右上角 `PDF 长度` 切到 `单页 A4`。
2. 再略微调小字号。
3. 压缩项目经历里的空行或删除不重要 bullet。
4. 重新点击 `导出 PDF`。

## 在 Codex 里连接这个工具

完整闭环：

```text
已有 CV → 网页编辑器 → 导出 JSON 草稿 → Codex 按 JD 优化 → 导入优化后的 JSON → 导出 PDF
```

这里的网页不会直接登录或调用你的 Codex。网页编辑器和 Codex 之间通过 Resume Editor JSON 草稿交换内容。

### 第一次安装（只需做一次）

前置条件：

- 已安装 Codex CLI
- 本地有 Node.js 18 或以上版本

在仓库根目录运行：

```bash
codex plugin marketplace add .
codex plugin add resume-editor@resume-tools
```

安装后重新打开一个 Codex session，使新安装的 Skill 和 MCP 工具生效。你可以在 Codex CLI 中输入 `/plugins`，检查 `resume-editor` 是否已安装并启用。

安装完成后，Codex 可以：

- 按 `Required / Core / Preferred / Context` 分析 JD，并回到原文核对
- 建立 `Direct / Transferable / Missing` 证据矩阵，区分已有证据、可迁移证据和缺口
- 检查简历草稿结构及需要人工确认的数字、归因和强所有权表述
- 生成可导入网页编辑器的 draft JSON

### 每次申请岗位的完整流程

1. 用浏览器打开 `index.html`。
2. 点击 `导入已有 CV`，选择 PDF、DOCX、TXT 或 Markdown；也可以直接在模板中填写。
3. 检查提取预览、栏目和事实，确认后点击 `导入并覆盖正文`。
4. 在网页中完成基础修改，然后点击 `导出草稿`。
5. 把导出的 JSON 放进仓库根目录，并重命名为 `resume-original.resume.json`。`*.resume.json` 已被 `.gitignore` 排除；保留这份原稿，不要覆盖或强制提交到 Git。
6. 在仓库根目录运行 `codex`，把目标 JD 和下面的 Prompt 发给 Codex。
7. Codex 会分析 JD、核对证据，并把优化后的可导入草稿保存为 `resume-tailored.resume.json`。
8. 先检查 Codex 输出的待确认事实。回答确认问题后，可让 Codex 重新生成 `resume-tailored.resume.json`。
9. 回到网页，点击 `导入草稿`，选择 `resume-tailored.resume.json`。再次核对姓名、日期、数字、栏目和排版。
10. 右上角选择 `单页 A4`，调整字号后点击 `导出 PDF`。打印窗口选择 A4、100% 缩放、关闭页眉页脚，并建议开启背景图形。

两个导入按钮的用途不同：

- `导入已有 CV`：读取 PDF、DOCX、TXT 或 Markdown，并识别简历栏目。
- `导入草稿`：读取 Resume Editor JSON，用于恢复编辑状态或接收 Codex 的优化结果。

### 推荐复制给 Codex 的 prompt

先把 `resume-original.resume.json` 放到仓库根目录，再复制下面的 Prompt 并粘贴 JD：

```text
请使用 $resume-editor 和当前仓库里的 Resume Editor 工具，根据下面的 JD 优化我的简历。

原始草稿文件：./resume-original.resume.json

请你完成：
1. 把 JD 要求按 Required / Core / Preferred / Context 分类；每项保留可核对的 JD 原文依据，不要把启发式关键词当成结论。
2. 建立 Direct / Transferable / Missing 证据矩阵，对照我的原始草稿说明哪些要求有直接证据、哪些仅可迁移、哪些确实缺失。
3. 直接改写简历，让它更匹配 JD。每条经历优先使用“动作 + 对象/范围 + 方法/工具 + 结果”的结构，并保持原有事实、时间、职级和责任边界。
4. 控制在一页 A4 内：先按与 JD 的相关性删减和合并，再压缩措辞；不要用极小字号掩盖内容过多。
5. 不得编造或强化经历、指标、因果、所有权、公司、学校、证书和技能；不得输出没有依据的“ATS 匹配率”。需要我补充的信息统一写成 [待确认：具体问题]。
6. 生成 JSON 前调用可用的 schema、validation、claim review 和 import payload 工具；claim review 只用于提示人工核对，不能代替事实判断。
7. 不要覆盖 ./resume-original.resume.json。把最终完整、合法、可直接导入 index.html 的 JSON 保存为 ./resume-tailored.resume.json。
8. 最后在对话中输出：
   A. 修改摘要及最重要的 JD 匹配变化。
   B. 已保存的 JSON 文件路径。
   C. 待确认事实、仍然缺失的 JD 证据和一页排版风险；没有则明确写“无”。

下面是 JD：
[把 JD 粘贴在这里]
```

如果不方便把 JSON 放进仓库，也可以把导出的 JSON 文件直接附加到 Codex 对话，或将内容粘贴在 Prompt 后面，并让 Codex 输出完整 JSON。保存为 `.json` 文件后再使用网页的 `导入草稿`。

如果 Codex 没有自动调用工具，可以追加：

```text
如果可用，请调用 resume-editor 的 schema、validation、claim review 和 import payload 工具，确保最终 JSON 可导入网页编辑器，并把需要人工确认的表述单独列出。
```

## 本地启动 MCP HTTP 服务

如果你要做 ChatGPT Developer Mode 或远程 MCP 连接调试，可以先在本地启动：

```bash
cd plugins/resume-editor
npm run mcp:http
```

默认地址：

```text
http://127.0.0.1:8787/mcp
```

当前 HTTP MCP 服务是无登录、无存储、无依赖的测试版本。正式给更多人使用前，建议部署到 HTTPS，并补充访问控制、日志和错误监控。

## 隐私说明

- 网页编辑器默认使用浏览器本地存储；本项目没有简历上传接口，页面代码不会主动发送简历正文。
- PDF / DOCX 导入会联网下载固定版本的解析组件，并先做完整性校验；解析组件在当前浏览器中读取所选文件。
- PDF 导出使用浏览器打印功能完成。
- 不要把 API Key、Codex token、身份证号等敏感信息写进草稿 JSON 或公开仓库。

## 开发检查

修改 CV 导入解析逻辑、专业知识、Skill 或 MCP 工具后，可以运行：

```bash
node tests/import-cv-parser-smoke.mjs
node tests/resume-knowledge-smoke.mjs
```
