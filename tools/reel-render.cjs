/* Render a hand-made reel page (tools/reels/*.html, exposes window.render(t) and window.DURATION) to MP4.
   usage: node tools/reel-render.cjs tools/reels/ladder.html out.mp4            (1080×1920, 30 fps)
          node tools/reel-render.cjs tools/reels/ladder.html out.mp4 --preview 3,8,17   (JPEG stills only)
   BASE (env) defaults to http://localhost:8770/math-books/ */
const {chromium}=require('playwright'), fs=require('fs'), {spawn}=require('child_process');
const [page,out]=process.argv.slice(2), A=process.argv, pi=A.indexOf('--preview'), PRE=pi>0?A[pi+1].split(',').map(Number):null;
const BASE=process.env.BASE||'http://localhost:8770/math-books/', FPS=30;
(async()=>{
 const b=await chromium.launch(), pg=await b.newPage({viewport:{width:1080,height:1920}});
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
