import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportsRoot = path.join(root, 'reports', 'e2e');
const outFile = path.join(reportsRoot, 'index.html');

async function walk(dir, base = dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'bundles') continue;
      out.push(...await walk(p, base));
    } else if (e.isFile()) {
      if (e.name === '.gitkeep' || e.name === 'index.html') continue;
      const rel = path.relative(base, p).replaceAll('\\', '/');
      out.push(rel);
    }
  }
  return out;
}

await fs.mkdir(reportsRoot, { recursive: true });
const files = (await walk(reportsRoot)).sort((a, b) => b.localeCompare(a));

let projectCatalog = [];
try {
  const projectMetaPath = path.join(root, 'spec', 'projects.json');
  const projectMeta = JSON.parse(await fs.readFile(projectMetaPath, 'utf8'));
  projectCatalog = Array.isArray(projectMeta.projects) ? projectMeta.projects : [];
} catch {
  projectCatalog = [];
}

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>E2E Report Explorer</title>
  <style>
    body{margin:0;font-family:Inter,system-ui,Arial,sans-serif;background:#0b1020;color:#e8efff}
    .wrap{display:grid;grid-template-columns:360px 1fr;height:100vh}
    .left{border-right:1px solid #24345f;overflow:auto;background:#0f1733}
    .right{display:grid;grid-template-rows:auto 1fr;background:#0b1020}
    .head{padding:14px 16px;border-bottom:1px solid #24345f;position:sticky;top:0;background:#0f1733;z-index:2}
    .title{font-size:14px;letter-spacing:.08em;color:#8fb1ff;font-weight:700}
    .sub{font-size:12px;color:#9fb0d0;margin-top:4px}
    .filters{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}
    .filters input,.filters select{width:100%;background:#0b1330;border:1px solid #2d4272;color:#e8efff;border-radius:8px;padding:7px 8px;font-size:12px}
    .list{padding:8px}
    .group-title{font-size:11px;color:#8fb1ff;letter-spacing:.08em;padding:10px 8px 6px;font-weight:700;text-transform:uppercase}
    .group-box{border:1px solid #24345f;border-radius:10px;margin:8px 4px;padding:4px;background:rgba(122,168,255,.03)}
    .item{display:block;padding:8px 10px;border-radius:8px;color:#dbe6ff;text-decoration:none;font-size:13px;word-break:break-all}
    .item:hover{background:#1a2750}
    .item.active{background:#244089}
    .bar{padding:10px 14px;border-bottom:1px solid #24345f;display:flex;justify-content:space-between;gap:8px;align-items:center}
    .bar a{color:#9ec0ff;text-decoration:none;font-size:12px}
    iframe{width:100%;height:100%;border:0;background:white}
    .empty{padding:16px;color:#9fb0d0}
    @media (max-width:900px){.wrap{grid-template-columns:1fr}.left{height:42vh}.right{height:58vh}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="left">
      <div class="head">
        <div class="title">E2E REPORT EXPLORER</div>
        <div class="sub">Open report files side-by-side</div>
        <div class="filters">
          <input id="q" placeholder="Filter path / run id..." />
          <select id="ext">
            <option value="all">All types</option>
            <option value="md">.md</option>
            <option value="json">.json</option>
            <option value="png">.png</option>
            <option value="webm">.webm</option>
            <option value="zip">.zip</option>
          </select>
          <select id="project">
            <option value="all">All projects</option>
          </select>
        </div>
      </div>
      <div class="list" id="list"></div>
    </div>
    <div class="right">
      <div class="bar">
        <div id="current" style="font-size:12px;color:#c7d8ff">Select a report file</div>
        <div style="display:flex;gap:12px;align-items:center">
          <a href="/dashboard">Back to dashboard</a>
          <a id="openNew" href="#" target="_blank" rel="noopener">Open in new tab</a>
        </div>
      </div>
      <iframe id="viewer" title="Report Viewer"></iframe>
    </div>
  </div>
  <script>
    const files = ${JSON.stringify(files)};
    const projectCatalog = ${JSON.stringify(projectCatalog)};
    const projectNameMap = Object.fromEntries(projectCatalog.map(p => [p.key, p.name]));
    const list = document.getElementById('list');
    const viewer = document.getElementById('viewer');
    const current = document.getElementById('current');
    const openNew = document.getElementById('openNew');
    const q = document.getElementById('q');
    const ext = document.getElementById('ext');
    const project = document.getElementById('project');

    function extractProject(filePath){
      const runId = filePath.split('/')[0] || '';
      if (/^\d{8}T\d{6}Z-/.test(runId)) return 'core';
      const token = runId.split('-')[0] || 'core';
      return token;
    }

    function openFile(rel, el){
      const safe = encodeURI(rel);
      viewer.src = safe;
      current.textContent = rel;
      openNew.href = safe;
      document.querySelectorAll('.item.active').forEach(i=>i.classList.remove('active'));
      if(el) el.classList.add('active');
      location.hash = '#' + safe;
    }

    const projectKeys = [...new Set(files.map(extractProject))].sort();
    projectKeys.forEach((k) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = projectNameMap[k] ? (projectNameMap[k] + ' (' + k + ')') : k;
      project.appendChild(o);
    });

    function filteredFiles(){
      const term = (q.value || '').toLowerCase().trim();
      const t = ext.value;
      const p = project.value;
      return files.filter((f) => {
        if (term && !f.toLowerCase().includes(term)) return false;
        if (t !== 'all' && !f.toLowerCase().endsWith('.' + t)) return false;
        if (p !== 'all' && extractProject(f) !== p) return false;
        return true;
      });
    }

    function render(selectPath){
      const visible = filteredFiles();
      list.innerHTML = '';
      if(!visible.length){
        list.innerHTML = '<div class="empty">No files match current filter.</div>';
        return;
      }

      const grouped = new Map();
      for (const f of visible) {
        const key = extractProject(f);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(f);
      }

      const keys = [...grouped.keys()].sort();
      for (const key of keys) {
        const title = document.createElement('div');
        title.className = 'group-title';
        const pretty = projectNameMap[key] ? (projectNameMap[key] + ' (' + key + ')') : key;
        title.textContent = 'Project: ' + pretty;
        list.appendChild(title);

        const box = document.createElement('div');
        box.className = 'group-box';
        for (const f of grouped.get(key)) {
          const a = document.createElement('a');
          a.href = '#';
          a.className = 'item';
          a.textContent = f;
          a.onclick = (e)=>{e.preventDefault();openFile(f,a)};
          box.appendChild(a);
        }
        list.appendChild(box);
      }

      const target = (selectPath && visible.includes(selectPath)) ? selectPath : visible[0];
      const el = [...document.querySelectorAll('.item')].find(i => i.textContent === target);
      openFile(target, el);
    }

    q.addEventListener('input', () => render(current.textContent));
    ext.addEventListener('change', () => render(current.textContent));
    project.addEventListener('change', () => render(current.textContent));

    if(!files.length){
      list.innerHTML = '<div class="empty">No report files found yet.</div>';
    } else {
      const hash = decodeURIComponent((location.hash || '').replace(/^#/,''));
      render(hash || files[0]);
    }
  </script>
</body>
</html>`;

await fs.writeFile(outFile, html);
console.log(`report_explorer=${outFile}`);
console.log(`files_indexed=${files.length}`);
