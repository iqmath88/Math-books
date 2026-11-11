/* Motion validation for shadow.html (التمرين 2 ص 97): samples window.STATE every 0.1 s.
   usage: node tools/reels/shadow.check.cjs
   Checks: H, h constant; pole fixed at x=0; y = h/(H−h)·x = x/3 every frame; lamp, head and tip collinear;
   while walking dx/dt = 0.5 m/s on screen = 30 m/min (real time), dy/dt = 10 m/min, tip speed = 40 m/min. */
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
(async()=>{
 const b=await chromium.launch(), pg=await b.newPage({viewport:{width:1080,height:1920}}), root=path.join(__dirname,'..','..');
 const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2'};
 await pg.route('http://reel.local/**',r=>{ const f=path.join(root,decodeURIComponent(new URL(r.request().url()).pathname)); if(!fs.existsSync(f)) return r.fulfill({status:404,body:''}); r.fulfill({status:200,contentType:T[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)}); });
 await pg.goto('http://reel.local/tools/reels/shadow.html');
 const S=await pg.evaluate(()=>{ const o=[]; for(let t=0;t<window.DURATION;t+=0.1){ render(t); o.push({...window.STATE}); } return o; });
 const max=f=>Math.max(...S.map(f));
 const rates=[]; for(let i=1;i<S.length;i++){ const a=S[i-1], c=S[i], dt=c.t-a.t, dx=(c.x-a.x)/dt; if(dx>1e-6&&dx<1) rates.push({dx:dx*60,dy:(c.y-a.y)/dt*60,ds:(c.tip-a.tip)/dt*60}); }
 /* intervals that straddle the start/end of a walking segment are partial: keep only full ones (dx at its max), and check ratios on all */
 const ratios={dy_over_dx:[...new Set(rates.map(r=>+(r.dy/r.dx).toFixed(9)))], tip_over_dx:[...new Set(rates.map(r=>+(r.ds/r.dx).toFixed(9)))]};
 const partial=rates.filter(r=>Math.abs(r.dx-30)>1e-6).length; rates.splice(0,rates.length,...rates.filter(r=>Math.abs(r.dx-30)<=1e-6));
 const rng=k=>[+Math.min(...rates.map(r=>r[k])).toFixed(4),+Math.max(...rates.map(r=>r[k])).toFixed(4)];
 const jumps=S.filter((s,i)=>i&&Math.abs(s.x-S[i-1].x)>0.2).map(s=>+s.t.toFixed(1));
 const R={samples:S.length, H_const:max(s=>Math.abs(s.H-7.2))<1e-12, h_const:max(s=>Math.abs(s.h-1.8))<1e-12, pole_fixed:max(s=>Math.abs(s.poleX))===0,
  max_err_y_eq_x_over_3:+max(s=>Math.abs(s.y-s.x/3)).toExponential(2), max_collinearity_err:+max(s=>Math.abs(s.collinear)).toExponential(2),
  walking_samples_full:rates.length, partial_boundary_samples:partial, ratios, dxdt_m_per_min:rng('dx'), dydt_m_per_min:rng('dy'), tip_m_per_min:rng('ds'),
  x_range_m:[+Math.min(...S.map(s=>s.x)).toFixed(2),+max(s=>s.x).toFixed(2)], position_resets_at_s:jumps};
 R.pass=ratios.dy_over_dx.length===1&&Math.abs(ratios.dy_over_dx[0]-1/3)<1e-6&&Math.abs(ratios.tip_over_dx[0]-4/3)<1e-6&&R.H_const&&R.h_const&&R.pole_fixed&&R.max_err_y_eq_x_over_3<1e-9&&R.max_collinearity_err<1e-9&&Math.abs(R.dxdt_m_per_min[0]-30)<1e-6&&Math.abs(R.dxdt_m_per_min[1]-30)<1e-6&&Math.abs(R.dydt_m_per_min[0]-10)<1e-6&&Math.abs(R.dydt_m_per_min[1]-10)<1e-6&&Math.abs(R.tip_m_per_min[0]-40)<1e-6&&Math.abs(R.tip_m_per_min[1]-40)<1e-6;
 console.log(JSON.stringify(R,null,1)); await b.close();
})();
