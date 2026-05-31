import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const paperDir = resolve(root, "paper");
const mdPath = resolve(root, "PUBLICATION_DRAFT.md");
const htmlPath = resolve(paperDir, "pains_gains_helpps_paper.html");
const pdfPath = resolve(paperDir, "pains_gains_helpps_paper.pdf");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

if (!existsSync(mdPath)) {
  throw new Error(`Missing manuscript source: ${mdPath}`);
}

if (!existsSync(chromePath)) {
  throw new Error(`Google Chrome was not found at: ${chromePath}`);
}

const markdown = readFileSync(mdPath, "utf8");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(text) {
  let out = escapeHtml(text);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(
    /(https?:\/\/[^\s<)]+)/g,
    '<a href="$1">$1</a>'
  );
  return out;
}

function parseTable(lines, start) {
  const rows = [];
  let i = start;
  while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
    rows.push(lines[i].trim());
    i += 1;
  }

  if (rows.length < 2) return null;
  const headers = rows[0].slice(1, -1).split("|").map((cell) => cell.trim());
  const body = rows.slice(2).map((row) =>
    row.slice(1, -1).split("|").map((cell) => cell.trim())
  );

  const html = [
    '<div class="table-wrap"><table>',
    "<thead><tr>",
    ...headers.map((cell) => `<th>${inline(cell)}</th>`),
    "</tr></thead><tbody>",
    ...body.map((row) =>
      `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`
    ),
    "</tbody></table></div>",
  ].join("");

  return { html, next: i };
}

function markdownToHtml(source) {
  const lines = source.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let list = null;
  let inBlockquote = false;

  function flushParagraph() {
    if (paragraph.length > 0) {
      html.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function closeList() {
    if (list) {
      html.push(`</${list}>`);
      list = null;
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      html.push("</blockquote>");
      inBlockquote = false;
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      closeList();
      closeBlockquote();
      continue;
    }

    const table = parseTable(lines, i);
    if (table) {
      flushParagraph();
      closeList();
      closeBlockquote();
      html.push(table.html);
      i = table.next - 1;
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      closeList();
      if (!inBlockquote) {
        html.push("<blockquote>");
        inBlockquote = true;
      }
      html.push(`<p>${inline(line.slice(2))}</p>`);
      continue;
    }

    if (/^# /.test(line)) {
      flushParagraph();
      closeList();
      closeBlockquote();
      html.push(`<h1>${inline(line.replace(/^# /, ""))}</h1>`);
      continue;
    }

    if (/^## /.test(line)) {
      flushParagraph();
      closeList();
      closeBlockquote();
      html.push(`<h2>${inline(line.replace(/^## /, ""))}</h2>`);
      continue;
    }

    if (/^### /.test(line)) {
      flushParagraph();
      closeList();
      closeBlockquote();
      html.push(`<h3>${inline(line.replace(/^### /, ""))}</h3>`);
      continue;
    }

    if (/^- /.test(line)) {
      flushParagraph();
      closeBlockquote();
      if (list !== "ul") {
        closeList();
        html.push("<ul>");
        list = "ul";
      }
      html.push(`<li>${inline(line.replace(/^- /, ""))}</li>`);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      flushParagraph();
      closeBlockquote();
      if (list !== "ol") {
        closeList();
        html.push("<ol>");
        list = "ol";
      }
      html.push(`<li>${inline(line.replace(/^\d+\. /, ""))}</li>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  closeBlockquote();
  return html.join("\n");
}

const body = markdownToHtml(markdown);
const generatedAt = new Date().toISOString().slice(0, 10);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pains & Gains / HelpPS Paper</title>
  <style>
    @page {
      size: Letter;
      margin: 0.75in 0.78in;
    }

    * {
      box-sizing: border-box;
    }

    body {
      color: #111827;
      font-family: "Times New Roman", Times, serif;
      font-size: 11.5pt;
      line-height: 1.38;
      margin: 0;
    }

    h1, h2, h3 {
      color: #0f172a;
      font-family: Georgia, "Times New Roman", serif;
      line-height: 1.15;
      page-break-after: avoid;
    }

    h1 {
      border-bottom: 1px solid #d1d5db;
      font-size: 21pt;
      margin: 0 0 18px;
      padding-bottom: 12px;
      text-align: center;
    }

    h2 {
      font-size: 15pt;
      margin: 22px 0 8px;
    }

    h3 {
      font-size: 12.5pt;
      margin: 16px 0 6px;
    }

    p {
      margin: 0 0 9px;
      text-align: justify;
    }

    blockquote {
      border-left: 3px solid #334155;
      color: #1f2937;
      margin: 12px 0 14px;
      padding: 4px 0 4px 14px;
    }

    ul, ol {
      margin: 4px 0 12px 24px;
      padding: 0;
    }

    li {
      margin: 3px 0;
    }

    a {
      color: #1d4ed8;
      overflow-wrap: anywhere;
      text-decoration: none;
    }

    code {
      font-family: Menlo, Consolas, monospace;
      font-size: 0.9em;
    }

    .table-wrap {
      margin: 12px 0 16px;
      page-break-inside: avoid;
    }

    table {
      border-collapse: collapse;
      font-size: 9.4pt;
      line-height: 1.24;
      width: 100%;
    }

    th, td {
      border: 1px solid #d1d5db;
      padding: 5px 6px;
      text-align: left;
      vertical-align: top;
      word-break: normal;
      overflow-wrap: anywhere;
    }

    th {
      background: #f3f4f6;
      color: #111827;
      font-weight: 700;
    }

    strong {
      color: #0f172a;
    }

    .meta {
      color: #4b5563;
      font-size: 9.5pt;
      margin-bottom: 14px;
      text-align: center;
    }

    @media print {
      h2, h3 {
        break-after: avoid;
      }

      table, blockquote {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="meta">Rendered ${generatedAt} from PUBLICATION_DRAFT.md</div>
  ${body}
</body>
</html>`;

writeFileSync(htmlPath, html, "utf8");

execFileSync(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--print-to-pdf=${pdfPath}`,
  `file://${htmlPath}`,
], {
  stdio: "inherit",
});

console.log(`Generated ${pdfPath}`);
