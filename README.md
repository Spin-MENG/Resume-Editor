# Resume Editor

一个单文件、可本地运行的简历编辑器。朋友 clone 后可以直接打开 `index.html` 编辑自己的简历、导入/导出草稿，并导出 A4 PDF。

这个仓库只包含公开版工具和 Codex/ChatGPT 可连接的本地 plugin，不包含个人简历、照片、PDF 或微信临时文件。

## 直接使用网页编辑器

1. Clone 仓库：

   ```bash
   git clone https://github.com/Spin-MENG/Resume-Editor.git
   cd Resume-Editor
   ```

2. 用浏览器打开 `index.html`。

3. 在页面里直接编辑内容。

4. 点击右上角 `导出 PDF`，在系统打印窗口里选择：

   - 纸张：A4
   - 缩放：100%
   - 背景图形/Print backgrounds：建议开启
   - PDF 长度：可在页面右上角选择 `单页 A4` 或 `自动分页`

5. 如果要继续修改同一份简历，可以使用页面右上角的 `导出草稿` / `导入草稿`。

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

