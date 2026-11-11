/* Render a hand-made reel page (tools/reels/*.html, exposes window.render(t) and window.DURATION) to MP4.
   usage: node tools/reel-render.cjs tools/reels/ladder.html out.mp4            (1080×1920, 30 fps)
          node tools/reel-render.cjs tools/reels/ladder.html out.mp4 --preview 3,8,17   (JPEG stills only)
   BASE (env) optional; by default the repo is served to the page by request interception. */
const {chromium}=require('playwright'), fs=require('fs'), {spawn}=require('child_process');
const [page,out]=process.argv.slice(2), A=process.argv, pi=A.indexOf('--preview'), PRE=pi>0?A[pi+1].split(',').map(Number):null;
const BASE=process.env.BASE||'http://reel.local/', FPS=30;
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
 if(PRE){ for(const t of PRE){ await pg.evaluate(t=>render(t),t); await pg.screenshot({path:out.replace(/\.mp4$/,'')+`.t${t}.jpg`,type:'jpeg',quality:85}); } await b.close(); return; }
 const part=out.replace(/\.mp4$/,'.part.mp4');
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-f','mp4',part]);
 const done=new Promise((ok,no)=>ff.on('exit',c=>c===0?ok():no(new Error('ffmpeg '+c))));
 const n=Math.round(D*FPS);
 for(let f=0;f<n;f++){ await pg.evaluate(t=>render(t),f/FPS); const buf=await pg.screenshot({type:'jpeg',quality:92}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); }
 ff.stdin.end(); await done; fs.renameSync(part,out); await b.close(); console.log('wrote',out,n,'frames');
})();
