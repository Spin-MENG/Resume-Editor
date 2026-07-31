# Resume Editor

一个单文件、可本地运行的简历编辑器。朋友 clone 后可以直接打开 `index.html` 编辑自己的简历、导入/导出草稿，并导出 A4 PDF。

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

1. 点击简历里的文字直接编辑。
2. 用右上角的字号控制调整整体字号。
3. 如果只想导出一页，右上角选择 `单页 A4`。
4. 点击 `导出 PDF`，在浏览器打印窗口里保存为 PDF。

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
   - `恢复原稿`：清空当前修改，恢复默认模板
   - `导入草稿`：导入之前保存的 JSON 草稿
   - `导出草稿`：把当前编辑结果保存成 JSON，方便下次继续编辑
   - `导出 PDF`：打开浏览器打印窗口并保存为 PDF

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

适合让 Codex 根据 JD 帮你优化简历，然后把结果生成可导入 `index.html` 的草稿 JSON。

前置条件：

- 已安装 Codex CLI
- 本地有 Node.js 18 或以上版本

在仓库根目录运行：

```bash
codex plugin marketplace add .
codex plugin add resume-editor@resume-tools
```

然后重新打开一个 Codex session。你可以让 Codex：

- 根据 JD 提取关键词和能力要求
- 检查简历草稿结构
- 生成可导入网页编辑器的 draft JSON

### 让 Codex 介入修改简历的流程

1. 先在 `index.html` 里写好或粘贴你的基础简历。
2. 点击右上角 `导出草稿`，保存当前简历 JSON。
3. 打开 Codex，把目标 JD 和导出的 JSON 草稿一起发给 Codex。
4. 让 Codex 根据 JD 优化内容，并输出可导入 Resume Editor 的 JSON。
5. 回到网页编辑器，点击 `导入草稿`，选择 Codex 输出的 JSON。
6. 检查页面排版，再点击 `导出 PDF`。

### 推荐复制给 Codex 的 prompt

把下面这段发给 Codex，然后在后面粘贴 JD 和你的草稿 JSON：

```text
你是我的简历优化助手。请使用当前仓库里的 resume-editor 工具来处理我的简历。

我会提供：
1. 目标岗位 JD
2. 从 index.html 右上角“导出草稿”得到的 Resume Editor JSON

请你完成：
1. 先提取 JD 中最重要的岗位职责、硬技能、软技能、关键词和筛选标准。
2. 对照我的简历草稿，指出最需要增强的 3-5 个匹配点。
3. 直接改写简历内容，让它更匹配这个 JD。
4. 每条经历 bullet 尽量使用“动作 + 方法/工具 + 结果”的结构。
5. 控制在一页 A4 内，优先保留与 JD 最相关的内容。
6. 不要编造经历、公司、学校、证书或无法证明的数据。如果需要量化但原文没有数据，请用 [补充具体数字] 标记。
7. 最后输出两部分：
   A. 修改摘要：说明你改了什么、为什么改。
   B. 可导入 Resume Editor 的 JSON：必须是完整、合法、可直接导入 index.html 的 JSON，不要夹杂解释文字。

下面是 JD：
[把 JD 粘贴在这里]

下面是我的 Resume Editor JSON：
[把导出的 JSON 粘贴在这里]
```

如果你已经安装了 Codex plugin，也可以在 prompt 里加一句：

```text
如果可用，请调用 resume-editor 的 schema、validation 和 import payload 工具，确保最终 JSON 可以直接导入网页编辑器。
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

- 网页编辑器默认使用浏览器本地存储，不会把简历上传到服务器。
- PDF 导出使用浏览器打印功能完成。
- 不要把 API Key、Codex token、身份证号等敏感信息写进草稿 JSON 或公开仓库。
