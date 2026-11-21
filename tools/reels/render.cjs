/* Export a chalkboard reel to MP4 (1080×1920, 30 fps, H.264), frame-exact, from the player itself.
   usage: node tools/reels/render.cjs <cone|ladder> <out.mp4> [music.wav]   (run node tools/flatten.cjs first)
   Each frame is drawn by the reel's own render(t) and read from the canvas at its full size (no screen scaling). */
const {chromium}=require('playwright'), {spawn}=require('child_process'), path=require('path'), fs=require('fs');
const [id,out,music]=process.argv.slice(2); if(!id||!out){ console.error('usage: render.cjs <id> <out.mp4> [music.wav]'); process.exit(2); }
const FPS=30, LIMIT=+(process.env.LIMIT||0), page='file://'+path.join(__dirname,'..','..','v2__reels__player.html')+'#'+id;
(async()=>{ const b=await chromium.launch(), pg=await (await b.newContext({viewport:{width:432,height:768}})).newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(page); await pg.waitForFunction(()=>window.__playerReady,null,{timeout:20000});
  const D=await pg.evaluate(()=>+document.getElementById('seek').max), N=LIMIT||Math.round(D*FPS);
  const tmp=out.replace(/\.mp4$/,'')+'.part.mp4';
  const args=['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-'];
  if(music) args.push('-i',music,'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k','-ar','48000','-shortest');
  args.push('-vf','format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','18','-r',String(FPS),'-movflags','+faststart',tmp);
  const ff=spawn('ffmpeg',args,{stdio:['pipe','inherit','inherit']});
  for(let i=0;i<N;i++){
    const data=await pg.evaluate(t=>{ window.__at(t); return document.getElementById('c').toDataURL('image/jpeg',.92).split(',')[1]; },i/FPS);
    const buf=Buffer.from(data,'base64'); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%300===0) console.log('frame',i,'/',N); }
  ff.stdin.end(); const code=await new Promise(r=>ff.on('close',r)); await b.close();
  if(errs.length) console.error('page errors:',errs.join(' | '));
  if(code===0){ fs.renameSync(tmp,out); console.log('wrote',out,N,'frames'); } process.exit(code); })();
