/* QA for reel pages: layout (safe area, text collisions, caption vs figure) + optional physics checks.
   usage: node tools/reel-validate.cjs tools/reels/tank-rates-v3.html [--step 0.25]
   Layout rules (heuristics from the brief): essential text inside x 90..900, y 180..1540;
   no two visible text boxes overlapping; caption above y 1540 and not covering the figure.
   Physics (only if the page exposes window.STATE with hA/hB): same Q, r and 2r ⇒ rise rates 4:1. */
const {chromium}=require('playwright');
const page=process.argv[2], si=process.argv.indexOf('--step'), STEP=si>0?+process.argv[si+1]:0.25;
const BASE=process.env.BASE||'http://reel.local/';
/* serve the repo through request interception (no local web server needed) */
const LOCAL='http://reel.local/';
async function serveRepo(pg){ const fs=require('fs'), path=require('path'), root=path.join(__dirname,'..');
  const T={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
  await pg.route(LOCAL+'**',r=>{ const u=new URL(r.request().url()), f=path.join(root,decodeURIComponent(u.pathname)); if(!f.startsWith(root)||!fs.existsSync(f)) return r.fulfill({status:404,body:'not found'}); r.fulfill({status:200,contentType:T[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)}); }); }
(async()=>{
 const b=await chromium.launch(), pg=await b.newPage({viewport:{width:1080,height:1920}});
 if(!process.env.BASE) await serveRepo(pg);
 await pg.goto(BASE+page); await pg.evaluate(()=>document.fonts.ready); await pg.waitForTimeout(300);
 const D=await pg.evaluate(()=>window.DURATION);
 const SAFE={x0:90,x1:900,y0:180,y1:1540}, issues=[], seen=new Set(); let frames=0;
 const add=(t,kind,msg)=>{ const k=kind+'|'+msg; if(!seen.has(k)){ seen.add(k); issues.push({t:+t.toFixed(2),kind,msg}); } };
 const states=[];
 for(let t=0;t<=D-0.05;t+=STEP){ frames++;
  const r=await pg.evaluate(t=>{ render(t);
    const vis=e=>{ let o=1; for(let n=e;n&&n.nodeType===1;n=n.parentNode){ const cs=getComputedStyle(n); o*=+cs.opacity; const a=n.getAttribute&&n.getAttribute('opacity'); if(a!==null&&a!=='') o*=+a; if(cs.display==='none'||cs.visibility==='hidden') return 0; } return o; };
    const boxes=[];
    const push=(e,name)=>{ const o=vis(e); if(o<0.6) return; const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) return; boxes.push({name,x0:r.left,y0:r.top,x1:r.right,y1:r.bottom,o}); };
    document.querySelectorAll('#cap span').forEach(e=>push(e,'caption'));
    document.querySelectorAll('.eq').forEach(e=>{ if(vis(e)>=0.6) e.querySelectorAll(':scope > *').forEach((k,i)=>push(k,'eq#'+e.id+(i?'-'+i:''))); });
    document.querySelectorAll('.chip,#brand,.lbl').forEach(e=>push(e,(e.classList.contains('lbl')?'label#':'chip#')+e.id));
    document.querySelectorAll('#hook > div').forEach((e,i)=>push(e,'hook'+i));
    document.querySelectorAll('svg text').forEach(e=>{ if((e.textContent||'').trim()) push(e,'svgtext:'+e.textContent.trim()); });
    const figs=[]; document.querySelectorAll('svg > g').forEach((g,i)=>{ const o=vis(g); if(o<0.6) return; const r=g.getBoundingClientRect(); if(r.width>50) figs.push({i,x0:r.left,y0:r.top,x1:r.right,y1:r.bottom}); });
    (window.FIGS||[]).forEach((f,k)=>figs.push({i:'3d:'+f.name,x0:f.x0,y0:f.y0,x1:f.x1,y1:f.y1}));
    return {boxes,figs,state:window.STATE||null};
  },t);
  if(r.state) states.push(r.state);
  for(const bx of r.boxes){
    if(bx.x0<SAFE.x0-1||bx.x1>SAFE.x1+1||bx.y0<SAFE.y0-1||bx.y1>SAFE.y1+1) add(t,'safe-area',`${bx.name} [${bx.x0|0},${bx.y0|0} → ${bx.x1|0},${bx.y1|0}]`);
  }
  for(let i=0;i<r.boxes.length;i++) for(let j=i+1;j<r.boxes.length;j++){ const a=r.boxes[i], c=r.boxes[j];
    const ox=Math.min(a.x1,c.x1)-Math.max(a.x0,c.x0), oy=Math.min(a.y1,c.y1)-Math.max(a.y0,c.y0);
    if(ox>4&&oy>4&&!(a.name.startsWith('eq#')&&c.name.startsWith('eq#')&&a.name.split('-')[0]===c.name.split('-')[0])) add(t,'collision',`${a.name} × ${c.name}`); }
  const cap=r.boxes.find(x=>x.name==='caption');
  for(const e of r.boxes.filter(x=>x.name.startsWith('eq#'))) for(const f of r.figs){ const ox=Math.min(e.x1,f.x1)-Math.max(e.x0,f.x0), oy=Math.min(e.y1,f.y1)-Math.max(e.y0,f.y0); if(ox>8&&oy>8) add(t,'equation-over-figure',`${e.name} overlaps svg group ${f.i} by ${oy|0}px`); }
  if(cap) for(const f of r.figs) if(f.y1>cap.y0+6&&f.x1>cap.x0&&f.x0<cap.x1&&f.y0<cap.y1) add(t,'caption-over-figure',`svg group ${f.i} bottom ${f.y1|0} > caption top ${cap.y0|0}`);
 }
 /* physics */
 let phys=null;
 const cmp=states.filter(s=>s.lyA!==null&&s.minCmp>0.05&&s.minCmp<(states.at(-1).minCmp-0.05));
 if(cmp.length>3){
  const a=cmp[0], z=cmp.at(-1), m=cmp[(cmp.length/2)|0];
  const dA=z.hA-a.hA, dB=z.hB-a.hB, pxA=a.lyA-z.lyA, pxB=a.lyB-z.lyB, dt=z.minCmp-a.minCmp;
  const mono=cmp.every((s,i)=>!i||(s.hA>=cmp[i-1].hA-1e-9&&s.hB>=cmp[i-1].hB-1e-9));
  const theoryA=a.Q/(Math.PI*a.rA**2), theoryB=a.Q/(Math.PI*a.rB**2);
  phys={samples:cmp.length, minutes:[+a.minCmp.toFixed(3),+m.minCmp.toFixed(3),+z.minCmp.toFixed(3)],
    rateA_measured:+(dA/dt).toFixed(4), rateB_measured:+(dB/dt).toFixed(4), rateA_theory:theoryA, rateB_theory:theoryB,
    ratio_heights:+(dA/dB).toFixed(4), ratio_pixels:+(pxA/pxB).toFixed(4), same_px_per_m:a.pxPerM_A===a.pxPerM_B, monotonic:mono,
    nonnegative:cmp.every(s=>s.hA>=0&&s.hB>=0), max_level_m:+Math.max(...cmp.map(s=>s.hA)).toFixed(3)};
  const main=states.filter(s=>s.minMain>0), mm=main.map((s,i)=>i?(s.hMain-main[i-1].hMain)/(s.minMain-main[i-1].minMain||1):null).filter(v=>v!==null&&isFinite(v)&&Math.abs(v)>0);
  phys.main_rate_m_per_min={min:+Math.min(...mm).toFixed(4),max:+Math.max(...mm).toFixed(4),theory:a.Q/(Math.PI*a.rA**2)};
 }
 console.log(JSON.stringify({frames,step:STEP,issues,phys},null,1));
 await b.close();
})();
