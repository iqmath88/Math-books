/* Math/motion checks for tools/reels/ladder-v2.html (both modes).
   usage: node tools/reels/ladder-v2.check.cjs            */
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
const root=path.join(__dirname,'..','..'), T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2'};
(async()=>{ const b=await chromium.launch(); const res={};
 for(const mode of (process.argv[2]?[process.argv[2]]:['full','short'])){
  const p=await b.newPage({viewport:{width:1080,height:1920}});
  await p.route('http://reel.local/**',r=>{ const f=path.join(root,decodeURIComponent(new URL(r.request().url()).pathname)); r.fulfill({status:fs.existsSync(f)?200:404,contentType:T[path.extname(f)]||'application/octet-stream',body:fs.existsSync(f)?fs.readFileSync(f):''}); });
  await p.goto('http://reel.local/tools/reels/ladder-v2.html'+(mode==='short'?'?short':''),{timeout:180000}); await p.waitForTimeout(800);
  res[mode]=await p.evaluate(()=>{ const dt=1/30, SLOW=0.5, o={frames:0,duration:DURATION,maxLenErr:0,maxPythErr:0,signErrors:0,movingFrames:0,maxRateErr:0,chipMismatch:0,chipChecked:0,arrowRatioErr:0,arrowChecked:0};
    const pf=s=>parseFloat(String(s).replace('−','-').replace(/[^0-9.\-]/g,''));
    let prev=null;
    for(let t=0;t<DURATION;t+=dt){ render(t); const S=STATE; o.frames++;
      o.maxLenErr=Math.max(o.maxLenErr,Math.abs(S.ladderLength-10)); o.maxPythErr=Math.max(o.maxPythErr,Math.abs(S.pyth-100)); if(!(S.dy<0)) o.signErrors++;
      /* the speed shown next to x must be the derivative AT that x */
      if(+getComputedStyle(document.getElementById('cy')).opacity>0.5){ o.chipChecked++; const xs=pf(document.getElementById('cx').textContent), vs=pf(document.getElementById('cy').textContent), exact=-xs/Math.sqrt(100-xs*xs)*2; const y=Math.sqrt(100-xs*xs), slope=2/y+2*xs*xs/(y*y*y); /* x is shown to 0.01 m: allow that rounding, propagated */ if(Math.abs(vs-exact)>0.005*slope+0.0051) o.chipMismatch++; }
      if(S.arrowTop<Math.max(0.5,S.y-0.4)-1e-9){ o.arrowChecked++; o.arrowRatioErr=Math.max(o.arrowRatioErr,Math.abs(S.arrowTop/S.arrowBottom-Math.abs(S.dy)/2)); }
      if(prev){ const vx=(S.x-prev.x)/dt/SLOW; if(Math.abs(vx-2)<1e-6){ o.movingFrames++; const xm=(S.x+prev.x)/2, vy=(S.y-prev.y)/dt/SLOW, ex=-xm/Math.sqrt(100-xm*xm)*2; o.maxRateErr=Math.max(o.maxRateErr,Math.abs(vy-ex)/Math.abs(ex)); } }
      prev=S; }
    o.ghosts=STATE.ghostSpeeds.map(([x,v])=>[x,+v.toFixed(4)]);
    const fx=[...document.querySelectorAll('[data-tex]')].map(e=>e.dataset.tex).filter(s=>/8\}\{3|16\}\{6|1\}\{3/.test(s));
    o.resultTex=fx; return o; });
  await p.close(); }
 console.log(JSON.stringify(res,null,1)); await b.close(); })();
