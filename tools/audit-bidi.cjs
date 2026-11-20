/* Bidi audit: in every Arabic (RTL) line, formulas, Latin words (consecutive ones merged: one LTR run) and Arabic words must appear right-to-left in the order they are written.
   For each text block of each tier-A lesson (teacher mode, solutions open) the on-screen position of every inline formula (.katex)
   and every Arabic word is measured; a later item that lands to the RIGHT of an earlier one on the same visual line is a reversal.
   usage: node tools/audit-bidi.cjs [width=1366] [height=1024]   → list of reversed lines (exit 1 if any) */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'), tier=JSON.parse(fs.readFileSync(root+'/src/tier-a.json'));
const W=+(process.argv[2]||1366), Hh=+(process.argv[3]||1024);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
(async()=>{ const b=await chromium.launch(); let total=0; const out=[];
 for(const [book,ls] of Object.entries(tier)) for(const les of ls){
  const ctx=await b.newContext({viewport:{width:W,height:Hh}}), pg=await ctx.newPage();
  await pg.route('http://book.local/**',r=>{ const f=path.join(root,decodeURIComponent(new URL(r.request().url()).pathname)); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()) return r.fulfill({status:404,body:''}); r.fulfill({body:fs.readFileSync(f),contentType:T[path.extname(f)]||'application/octet-stream'}); });
  await pg.addInitScript(()=>{ try{localStorage.setItem('lb-role','teacher')}catch(e){} });
  await pg.goto(`http://book.local/v2/${book}.html#l=${les}`,{waitUntil:'networkidle'}); await pg.waitForTimeout(1000);
  await pg.$$eval('[data-show]',bs=>bs.forEach(x=>x.click())); await pg.waitForTimeout(500);
  const found=await pg.evaluate(()=>{ const AR=/[\u0600-\u06FF]+/g, res=[]; res.pairs=0; res.math=0;
   const blocks=[...document.querySelectorAll('#story p, #story li, #story td, #story th, #story .nbody, #story .pstem, #story h1, #story h2, #story h3, #story label, #story .opt, #story .lead, #story .why, #story .fb, #story .tl, #story .lv')]
     .filter(el=>!el.querySelector('p,li,td,.nbody')&&getComputedStyle(el).direction==='rtl'&&el.offsetParent);
   for(const el of blocks){ const atoms=[];
     const walk=n=>{ if(n.nodeType===3){ const t=n.textContent; let m; const TOK=/[\u0600-\u06FF]+|[A-Za-z][A-Za-z0-9′'/]*/g; while((m=TOK.exec(t))){ const r=document.createRange(); r.setStart(n,m.index); r.setEnd(n,m.index+m[0].length); const rc=[...r.getClientRects()].filter(q=>q.width>0); if(rc.length===1) atoms.push({k:/[A-Za-z]/.test(m[0])?'l':'w',s:m[0],r:rc[0]}); } return; }
       if(n.nodeType!==1) return; if(n.classList.contains('katex-display')) return; if(n.classList.contains('katex')||(n.classList.contains('tex')&&n.querySelector('.katex')&&!n.querySelector('.katex-display'))){ const rc=n.getBoundingClientRect(); if(rc.width>0) atoms.push({k:'m',s:n.querySelector('annotation')?.textContent||n.textContent,r:rc}); return; }
       for(const c of n.childNodes) walk(c); };
     walk(el); if(!atoms.some(a=>a.k==='m'||a.k==='l')) continue;
     for(let i=atoms.length-1;i>0;i--){ const a=atoms[i-1], c=atoms[i]; if(a.k==='l'&&c.k==='l'&&Math.abs(a.r.top-c.r.top)<4){ const r={left:Math.min(a.r.left,c.r.left),right:Math.max(a.r.right,c.r.right),top:Math.min(a.r.top,c.r.top),bottom:Math.max(a.r.bottom,c.r.bottom)}; r.height=r.bottom-r.top; atoms.splice(i-1,2,{k:'l',s:a.s+' '+c.s,r}); } } res.math+=atoms.filter(a=>a.k==='m').length;
     for(let i=1;i<atoms.length;i++){ const a=atoms[i-1], c=atoms[i]; const sameLine=Math.min(a.r.bottom,c.r.bottom)-Math.max(a.r.top,c.r.top)>Math.min(a.r.height,c.r.height)*.5; if(!sameLine) continue; res.pairs++;
       if(c.r.left>a.r.right-1&&c.r.right>a.r.right+2){ const y=el.getBoundingClientRect().top+scrollY;
         res.push({text:el.textContent.replace(/\s+/g,' ').trim().slice(0,140),a:(a.k==='m'?'$'+a.s+'$':a.s),c:(c.k==='m'?'$'+c.s+'$':c.s),y:Math.round(y)}); break; } } }
   return {list:res,pairs:res.pairs,math:res.math}; });
  const L=found.list; total+=L.length; out.push(`${book}/${les}: ${L.length}  (formulas ${found.math}, neighbour pairs ${found.pairs})`); L.forEach(f=>out.push(`   y=${f.y}  «${f.a}» then «${f.c}» appears to its right :: ${f.text}`));
  await ctx.close(); }
 console.log(out.join('\n')); console.log('TOTAL',total); await b.close(); process.exit(total?1:0); })();
