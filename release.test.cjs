/* Math-books release check: run with `node release.test.cjs` from the repository folder. */
const assert=require('node:assert/strict'); const fs=require('node:fs'); const path=require('node:path'); const vm=require('node:vm');
const root=__dirname, read=n=>fs.readFileSync(path.join(root,n),'utf8');
const sw=read('sw.js'), ctx={self:{}}; ctx.globalThis=ctx; vm.runInNewContext(read('app-version.js'),ctx); const ver=ctx.MATH_BOOKS_RELEASE?.version;
const core=[...sw.matchAll(/'\.\/([^']*)'/g)].map(m=>m[1]).filter(Boolean);
for(const f of core) assert.ok(fs.existsSync(path.join(root,f)),`sw.js precaches a missing file: ${f}`);
const chapters=core.filter(f=>/\.html$/.test(f)&&f!=='index.html'&&!f.startsWith('v2/'));
for(const f of chapters){ const s=read(f);
  assert.match(s,/<script src="app-version\.js"><\/script>/,f); assert.match(s,/href="classroom-v2\.css"/,f); assert.match(s,/src="classroom-v2\.js"/,f);
  assert.match(s,/id="bTeach"/,f); assert.match(s,/id="tBoard"/,f); assert.match(s,/const SP=/,f);
  for(const m of s.matchAll(/(?:src|href)="([^"#:]+\.(?:js|css))"/g)) assert.ok(fs.existsSync(path.join(root,m[1])),`${f} links a missing file: ${m[1]}`); }
const idx=read('index.html'); for(const m of idx.matchAll(/file:'([\w.-]+\.html)'/g)) assert.ok(core.includes(m[1]),`library chapter not precached: ${m[1]}`);
const v2=core.filter(f=>/^v2\/[\w-]+\.html$/.test(f));
for(const f of v2){ const s=read(f); const id=f.slice(3,-5);
  for(const need of ['lib/katex/katex.min.css','lib/katex/katex.min.js','engine.css','engine.js',id+'.js']){ assert.ok(s.includes(need),`${f} must link ${need}`); assert.ok(core.includes('v2/'+need),`v2 file not precached: v2/${need}`); } }
for(const f of fs.readdirSync(path.join(root,'v2/lib'),{recursive:true})){ const p='v2/lib/'+f; if(fs.statSync(path.join(root,p)).isFile()) assert.ok(core.includes(p),`v2 asset not precached: ${p}`); }
for(const m of idx.matchAll(/v2:'([\w-]+)'/g)) assert.ok(core.includes('v2/'+m[1]+'.html'),`v2 chapter not precached: ${m[1]}`);
console.log(`PASS v${ver||'?'}: ${chapters.length} chapters + ${v2.length} v2 chapters, ${core.length} offline files, classroom-v2 linked everywhere`);
