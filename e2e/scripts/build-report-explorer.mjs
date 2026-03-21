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
    .list{padding:8px}
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
      </div>
      <div class="list" id="list"></div>
    </div>
    <div class="right">
      <div class="bar">
        <div id="current" style="font-size:12px;color:#c7d8ff">Select a report file</div>
        <a id="openNew" href="#" target="_blank" rel="noopener">Open in new tab</a>
      </div>
      <iframe id="viewer" title="Report Viewer"></iframe>
    </div>
  </div>
  <script>
    const files = ${JSON.stringify(files)};
    const list = document.getElementById('list');
    const viewer = document.getElementById('viewer');
    const current = document.getElementById('current');
    const openNew = document.getElementById('openNew');

    function openFile(rel, el){
      const safe = encodeURI(rel);
      viewer.src = safe;
      current.textContent = rel;
      openNew.href = safe;
      document.querySelectorAll('.item.active').forEach(i=>i.classList.remove('active'));
      if(el) el.classList.add('active');
      location.hash = '#' + safe;
    }

    if(!files.length){
      list.innerHTML = '<div class="empty">No report files found yet.</div>';
    } else {
      files.forEach((f) => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'item';
        a.textContent = f;
        a.onclick = (e)=>{e.preventDefault();openFile(f,a)};
        list.appendChild(a);
      });

      const hash = decodeURIComponent((location.hash || '').replace(/^#/,''));
      const initial = files.includes(hash) ? hash : files[0];
      const el = [...document.querySelectorAll('.item')].find(i => i.textContent === initial);
      openFile(initial, el);
    }
  </script>
</body>
</html>`;

await fs.writeFile(outFile, html);
console.log(`report_explorer=${outFile}`);
console.log(`files_indexed=${files.length}`);
