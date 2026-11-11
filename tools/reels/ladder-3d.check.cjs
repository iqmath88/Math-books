/* Math/motion checks for tools/reels/ladder-3d.html — usage: node tools/reels/ladder-3d.check.cjs */
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
(async()=>{ const b=await chromium.launch(), p=await b.newPage({viewport:{width:1080,height:1920}}), root=path.join(__dirname,'..','..');
 await p.route('http://reel.local/**',r=>{ const f=path.join(root,decodeURIComponent(new URL(r.request().url()).pathname)); const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2'}; r.fulfill({status:fs.existsSync(f)?200:404,contentType:T[path.extname(f)]||'application/octet-stream',body:fs.existsSync(f)?fs.readFileSync(f):''}); });
 await p.goto('http://reel.local/tools/reels/ladder-3d.html'); await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{ const dt=1/30, SLOW=0.5, out={frames:0,maxLenErr:0,maxPythErr:0,minX:1e9,minY:1e9,signErrors:0,maxRateErr:0,maxThetaRateErr:0,movingFrames:0};
   let prev=null;
   for(let t=0;t<DURATION;t+=dt){ render(t); const S=STATE; out.frames++;
     out.maxLenErr=Math.max(out.maxLenErr,Math.abs(S.ladderLength-10)); out.maxPythErr=Math.max(out.maxPythErr,Math.abs(S.pyth-100));
     out.minX=Math.min(out.minX,S.x); out.minY=Math.min(out.minY,S.y); if(!(S.dy<0)) out.signErrors++;
     if(prev){ const vx=(S.x-prev.x)/dt/SLOW;               /* story-time velocity */
       if(Math.abs(vx-2)<1e-6){ out.movingFrames++; const vy=(S.y-prev.y)/dt/SLOW, xm=(S.x+prev.x)/2, ym=Math.sqrt(100-xm*xm), exact=-xm/ym*2; out.maxRateErr=Math.max(out.maxRateErr,Math.abs(vy-exact)/Math.abs(exact));
         const vth=(S.th-prev.th)/dt/SLOW, exactTh=exact/(10*(xm/10)); out.maxThetaRateErr=Math.max(out.maxThetaRateErr,Math.abs(vth-exactTh)/Math.abs(exactTh)); } }
     prev=S; }
   render(40); const A=STATE; out.atAsked={x:A.x,y:A.y,dy:A.dy,dy_exact:-8/3,dtheta:A.dy/(10*Math.cos(A.th)),dtheta_exact:-1/3};
   return out; });
 console.log(JSON.stringify(r,null,1)); await b.close(); })();
