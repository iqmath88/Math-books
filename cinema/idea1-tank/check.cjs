/* Motion + player check for cinema/idea1-tank (مثال 1 ص 92).
   usage: node cinema/idea1-tank/check.cjs
   1) math: samples window.STATE every 0.05 s: V = 4h always; while water flows dV/dτ = −0.4 and dh/dτ = −0.1 exactly
      (finite differences); h stays inside the tank (0 < h ≤ H); water never moves when the scene says it is frozen.
   2) player: loads the page at iPad (1024×768, 1366×1024 landscape, 768×1024 portrait) and desktop sizes, checks the
      1920×1080 stage fits without scrolling, the controls are ≥ 44 px tall, and stage chips / givens toggle / h slider work. */
const {chromium}=require('playwright'), fs=require('fs'), path=require('path'), BASE=process.env.BASE||'http://127.0.0.1:8771/';  /* python3 -m http.server 8771 from the repo root */
const root=path.join(__dirname,'..','..'), T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.m4a':'audio/mp4'};
const serve=pg=>BASE.includes('127.0.0.1')?null:pg.route('http://cin.local/**',r=>{ const f=path.join(root,decodeURIComponent(new URL(r.request().url()).pathname)); if(!fs.existsSync(f)) return r.fulfill({status:404,body:''}); r.fulfill({status:200,contentType:T[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)}); });
(async()=>{
 const b=await chromium.launch(), out={};
 { const pg=await b.newPage({viewport:{width:1920,height:1080}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await serve(pg);
   await pg.goto(BASE+'cinema/idea1-tank/index.html?render'); await pg.waitForFunction(()=>window.render&&window.STATE);
   const S=await pg.evaluate(()=>{ window.NO_GL=1; const o=[]; for(let t=0;t<window.DURATION;t+=0.05){ render(t); o.push({...window.STATE}); } return o; });
   const fl=[], frozen=[]; for(let i=1;i<S.length;i++){ const a=S[i-1], c=S[i], dt=c.tau-a.tau; if(dt>1e-9) fl.push({dV:(c.V-a.V)/dt, dh:(c.h-a.h)/dt}); else frozen.push(Math.abs(c.h-a.h)); }
   out.math={samples:S.length, flowing_intervals:fl.length, V_eq_4h:Math.max(...S.map(s=>Math.abs(s.V-4*s.h))),
     dV_dtau:[Math.min(...fl.map(p=>p.dV)),Math.max(...fl.map(p=>p.dV))], dh_dtau:[Math.min(...fl.map(p=>p.dh)),Math.max(...fl.map(p=>p.dh))],
     h_range:[Math.min(...S.map(s=>s.h)),Math.max(...S.map(s=>s.h))], frozen_moves:Math.max(0,...frozen), pageErrors:errs};
   out.math.pass=out.math.V_eq_4h<1e-12&&out.math.dV_dtau.every(v=>Math.abs(v+0.4)<1e-9)&&out.math.dh_dtau.every(v=>Math.abs(v+0.1)<1e-9)&&out.math.h_range[0]>0.3&&out.math.h_range[1]<=2.4&&out.math.frozen_moves===0&&!errs.length;
   await pg.close(); }
 out.devices=[];
 for(const [name,w,h,touch] of [['iPad landscape',1024,768,1],['iPad Pro landscape',1366,1024,1],['iPad portrait',768,1024,1],['desktop',1440,900,0],['smart board 4K',3840,2160,0]]){
   const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:!!touch,isMobile:false}), pg=await ctx.newPage(), errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await serve(pg);
   await pg.goto(BASE+'cinema/idea1-tank/index.html',{waitUntil:'domcontentloaded'}); await pg.waitForFunction(()=>window.STATE);
   const r=await pg.evaluate(()=>{ const st=document.getElementById('stage').getBoundingClientRect(), k=st.width/1920;
     const btn=[...document.querySelectorAll('#bar button')].map(e=>e.getBoundingClientRect().height); return {k:+k.toFixed(3), fits:st.left>=-0.5&&st.top>=-0.5&&st.right<=innerWidth+.5&&st.bottom<=innerHeight+.5, scroll:document.documentElement.scrollHeight>innerHeight+1, minButtonPx:+Math.min(...btn).toFixed(1)}; });
   /* stage chip 3 → model scene, paused: the h slider shows and drives the water (V = 4h) */
   await pg.locator('#stg button').nth(2).click(); await pg.waitForTimeout(50);
   r.stage3_t=await pg.evaluate(()=>+STATE.t.toFixed(2)); r.sliderVisible=await pg.locator('#hx').isVisible();
   if(r.sliderVisible){ await pg.locator('#hIn').fill('0.8'); await pg.locator('#hIn').dispatchEvent('input'); r.afterSlider=await pg.evaluate(()=>({h:STATE.h,V:STATE.V})); }
   await pg.locator('#bGiv').click(); r.givensHidden=await pg.evaluate(()=>getComputedStyle(document.getElementById('giv')).display==='none');
   await pg.locator('#stg button').nth(3).click(); r.stage4_t=await pg.evaluate(()=>+STATE.t.toFixed(2));
   r.stages5_6_disabled=await pg.evaluate(()=>[...document.querySelectorAll('#stg button')].slice(4).every(b=>b.disabled));
   r.pageErrors=errs; r.pass=r.fits&&!r.scroll&&r.minButtonPx>=44&&r.sliderVisible&&Math.abs(r.afterSlider.V-3.2)<1e-9&&r.givensHidden&&r.stages5_6_disabled&&!errs.length;
   out.devices.push({name,w,h,...r}); await ctx.close(); }
 console.log(JSON.stringify(out,null,1)); await b.close();
})();
