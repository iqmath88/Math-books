/* Math check for the reel (مثال 1 ص 92). usage: python3 -m http.server 8771 (repo root) & node cinema/idea1-reel/check.cjs
   Samples window.STATE every 1/60 s (no GL draw): V = 4h always; in every draining window dV/dτ = −0.4 and dh/dτ = −0.1
   exactly; the level never moves outside those windows; total hours shown = 4 + 1 + 3 = 8 ⇒ final h = 2 − 0.8 = 1.2 m;
   the payoff's three rings sit exactly 0.1 m apart (one per hour). */
const {chromium}=require('playwright'), BASE=process.env.BASE||'http://127.0.0.1:8771/';
(async()=>{ const b=await chromium.launch(), pg=await b.newPage({viewport:{width:1080,height:1920}}), errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(BASE+'cinema/idea1-reel/index.html?render',{waitUntil:'domcontentloaded'}); await pg.waitForFunction(()=>window.render&&window.STATE);
 const S=await pg.evaluate(()=>{ window.NO_GL=1; const o=[]; for(let f=0;f<window.DURATION*60;f++){ render(f/60); o.push({...window.STATE}); } return o; });
 const fl=[], still=[]; for(let i=1;i<S.length;i++){ const a=S[i-1], c=S[i], dt=c.tau-a.tau; if(dt>1e-12) fl.push({dV:(c.V-a.V)/dt, dh:(c.h-a.h)/dt}); else still.push(Math.abs(c.h-a.h)); }
 const last=S[S.length-1], R={frames:S.length, V_eq_4h:Math.max(...S.map(s=>Math.abs(s.V-4*s.h))), dV_dtau:[Math.min(...fl.map(p=>p.dV)),Math.max(...fl.map(p=>p.dV))],
  dh_dtau:[Math.min(...fl.map(p=>p.dh)),Math.max(...fl.map(p=>p.dh))], moves_when_frozen:Math.max(0,...still), hours:last.tau, final_h:last.h, pageErrors:errs};
 R.pass=R.V_eq_4h<1e-12&&R.dV_dtau.every(v=>Math.abs(v+.4)<1e-9)&&R.dh_dtau.every(v=>Math.abs(v+.1)<1e-9)&&R.moves_when_frozen===0&&Math.abs(R.hours-8)<1e-9&&Math.abs(R.final_h-1.2)<1e-9&&!errs.length;
 console.log(JSON.stringify(R,null,1)); await b.close(); })();
