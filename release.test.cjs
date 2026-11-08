/* Math-books release check: run with `node release.test.cjs` from the repository folder. */
const assert=require('node:assert/strict'); const fs=require('node:fs'); const path=require('node:path'); const vm=require('node:vm');
const root=__dirname, read=n=>fs.readFileSync(path.join(root,n),'utf8');
const sw=read('sw.js'), ctx={self:{}}; ctx.globalThis=ctx; vm.runInNewContext(read('app-version.js'),ctx); const ver=ctx.MATH_BOOKS_RELEASE?.version;
const core=[...sw.matchAll(/'\.\/([^']*)'/g)].map(m=>m[1]).filter(Boolean);
for(const f of core) assert.ok(fs.existsSync(path.join(root,f)),`sw.js precaches a missing file: ${f}`);
const chapters=core.filter(f=>/\.html$/.test(f)&&f!=='index.html');
for(const f of chapters){ const s=read(f);
  assert.match(s,/<script src="app-version\.js"><\/script>/,f); assert.match(s,/href="classroom-v2\.css"/,f); assert.match(s,/src="classroom-v2\.js"/,f);
  assert.match(s,/id="bTeach"/,f); assert.match(s,/id="tBoard"/,f); assert.match(s,/const SP=/,f);
  for(const m of s.matchAll(/(?:src|href)="([^"#:]+\.(?:js|css))"/g)) assert.ok(fs.existsSync(path.join(root,m[1])),`${f} links a missing file: ${m[1]}`); }
const idx=read('index.html'); for(const m of idx.matchAll(/file:'([\w.-]+\.html)'/g)) assert.ok(core.includes(m[1]),`library chapter not precached: ${m[1]}`);
console.log(`PASS v${ver||'?'}: ${chapters.length} chapters, ${core.length} offline files, classroom-v2 linked everywhere`);
