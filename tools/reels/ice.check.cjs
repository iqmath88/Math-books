/* Motion validation for ice.html (مثال 3 ص 93): samples window.STATE every 0.1 s.
   usage: node tools/reels/ice.check.cjs
   Checks: inner cube edge = 8 always; outer edge = 8 + 2x (from the actual mesh scales); ice never vanishes or is pierced
   (x > 0, inner bottom = x above the plate, equal gaps on every side); V = L³ − 8³;
   in real-time (phys) shots dV/dτ = −6 exactly, x decreases (sign), dx/dτ = −1/L² by finite differences, and at x = 1: dx/dτ = −0.01. */
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
(async()=>{
 const b=await chromium.launch(), pg=await b.newPage({viewport:{width:1080,height:1920}}), root=path.join(__dirname,'..','..');
 const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2'};
 await pg.route('http://reel.local/**',r=>{ const f=path.join(root,decodeURIComponent(new URL(r.request().url()).pathname)); if(!fs.existsSync(f)) return r.fulfill({status:404,body:''}); r.fulfill({status:200,contentType:T[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)}); });
 await pg.goto('http://reel.local/tools/reels/ice.html');
 const S=await pg.evaluate(()=>{ const o=[]; for(let t=0;t<window.DURATION;t+=0.1){ render(t); o.push({...window.STATE}); } return o; });
 const max=f=>Math.max(...S.map(f)), min=f=>Math.min(...S.map(f));
 const ph=[]; for(let i=1;i<S.length;i++){ const a=S[i-1], c=S[i]; if(a.mode==='phys'&&c.mode==='phys'&&c.F===a.F&&c.tau>a.tau){ const dtau=c.tau-a.tau;
   ph.push({dVdtau:(c.V-a.V)/dtau, dxdtau:(c.x-a.x)/dtau, theory:-1/((8+(a.x+c.x))**2), xm:(a.x+c.x)/2, F:c.F, videoRate:(c.tau-a.tau)/(c.t-a.t)}); } }
 const near1=ph.reduce((b,p)=>Math.abs(p.xm-1)<Math.abs(b.xm-1)?p:b,ph[0]);
 const R={samples:S.length, phys_intervals:ph.length,
  inner_edge_const_8:max(s=>Math.abs(s.innerEdge-8))<1e-12, outer_eq_8_plus_2x:+max(s=>Math.abs(s.outerEdge-(8+2*s.x))).toExponential(2),
  ice_rests_on_plate:+max(s=>Math.abs(s.outerBottom)).toExponential(2), inner_bottom_eq_x:+max(s=>Math.abs(s.innerBottom-s.x)).toExponential(2),
  equal_gaps_top_side:+max(s=>Math.abs(s.gapTop-s.x)+Math.abs(s.gapSide-s.x)).toExponential(2), min_thickness_cm:+min(s=>s.x).toFixed(3),
  V_eq_L3_minus_512:+max(s=>Math.abs(s.V-(s.L**3-512))).toExponential(2),
  dV_dtau:[+Math.min(...ph.map(p=>p.dVdtau)).toFixed(6),+Math.max(...ph.map(p=>p.dVdtau)).toFixed(6)],
  x_decreasing_in_phys:ph.every(p=>p.dxdtau<0), max_rel_err_dxdtau_vs_minus_1_over_L2:+Math.max(...ph.map(p=>Math.abs(p.dxdtau/p.theory-1))).toExponential(2),
  timelapse_factors:[...new Set(ph.map(p=>+p.videoRate.toFixed(6)))], at_x_near_1:{x:+near1.xm.toFixed(4),dx_dtau:+near1.dxdtau.toFixed(5)}};
 R.pass=R.inner_edge_const_8&&R.outer_eq_8_plus_2x<1e-9&&R.ice_rests_on_plate<1e-9&&R.inner_bottom_eq_x<1e-9&&R.equal_gaps_top_side<1e-9&&R.min_thickness_cm>0&&R.V_eq_L3_minus_512<1e-6
  &&Math.abs(R.dV_dtau[0]+6)<1e-6&&Math.abs(R.dV_dtau[1]+6)<1e-6&&R.x_decreasing_in_phys&&R.max_rel_err_dxdtau_vs_minus_1_over_L2<1e-3&&Math.abs(R.at_x_near_1.dx_dtau+0.01)<2e-4;
 console.log(JSON.stringify(R,null,1)); await b.close();
})();
