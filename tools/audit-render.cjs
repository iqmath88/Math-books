/* Render audit of every tier-A lesson (teacher mode, solutions open): KaTeX error boxes, raw TeX/markup or stray «;» left as text, formulas wider than the phone, JS errors.
   usage: node tools/audit-render.cjs   (exit code 1 when anything is found) */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'), tier=JSON.parse(fs.readFileSync(root+'/src/tier-a.json'));
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
(async()=>{ const b=await chromium.launch(); let total=0;
 for(const [book,ls] of Object.entries(tier)) for(const les of ls){
  const ctx=await b.newContext({viewport:{width:390,height:860}}), pg=await ctx.newPage(); const errs=[];
  pg.on('pageerror',e=>errs.push('JS '+e.message));
  await pg.route('http://book.local/**',r=>{ const f=path.join(root,decodeURIComponent(new URL(r.request().url()).pathname)); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()) return r.fulfill({status:404,body:''}); r.fulfill({body:fs.readFileSync(f),contentType:T[path.extname(f)]||'application/octet-stream'}); });
  await pg.addInitScript(()=>{ try{localStorage.setItem('lb-role','teacher')}catch(e){} });
  await pg.goto(`http://book.local/v2/${book}.html#l=${les}`,{waitUntil:'networkidle'}); await pg.waitForTimeout(1200);
  await pg.$$eval('[data-show]',bs=>bs.forEach(x=>x.click())); await pg.waitForTimeout(600);
  const r=await pg.evaluate(()=>{ const out=[];
   document.querySelectorAll('.katex-error').forEach(e=>out.push('KATEX '+(e.getAttribute('title')||'').slice(0,90)+' :: '+e.textContent.slice(0,60)));
   const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
   while(n=w.nextNode()){ if(n.parentElement.closest('.katex,script,style,svg')) continue; const t=n.textContent;
     if(/\\[a-zA-Z\[]|\$|\*\*|\{\}|^\s*;|;\s*;/.test(t)) out.push('RAW '+t.trim().slice(0,90)); }
   const W=document.documentElement.clientWidth;
   document.querySelectorAll('.katex-display,.katex').forEach(e=>{ const rc=e.getBoundingClientRect(); if(rc.width>0&&(rc.right>W+2||rc.left<-2)){ const sc=e.closest('[style*="overflow"],.scroll,.mx'); out.push('WIDE '+Math.round(rc.width)+' '+e.textContent.slice(0,50)); }});
   if(document.documentElement.scrollWidth>W+2) out.push('HSCROLL '+document.documentElement.scrollWidth);
   return out; });
  const all=[...errs,...r]; total+=all.length; console.log(`${book}/${les}: ${all.length}`); all.slice(0,12).forEach(x=>console.log('   '+x));
  await ctx.close(); }
 console.log('TOTAL',total); await b.close(); process.exit(total?1:0); })();
