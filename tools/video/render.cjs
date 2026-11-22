/* Export a long chalkboard video (1920×1080, 30 fps, H.264) frame by frame from its page.
   usage: node tools/video/render.cjs <page.html> <out.mp4> [music.wav]
   Splits the timeline into JOBS parallel parts (default 4), then joins them and adds the music. */
const {chromium}=require('playwright'), {spawn,execFileSync}=require('child_process'), path=require('path'), fs=require('fs');
const [page,out,music]=process.argv.slice(2); if(!page||!out){ console.error('usage: render.cjs <page.html> <out.mp4> [music.wav]'); process.exit(2); }
const FPS=30, JOBS=+(process.env.JOBS||4), url='file://'+path.resolve(page);
async function part(b,i0,i1,file){ const pg=await (await b.newContext({viewport:{width:960,height:540}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(url); await pg.waitForFunction(()=>window.__ready,null,{timeout:30000});
  const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-vf','format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','18','-r',String(FPS),file],{stdio:['pipe','inherit','inherit']});
  for(let i=i0;i<i1;i++){ const data=await pg.evaluate(t=>{ window.__at(t); return document.getElementById('c').toDataURL('image/jpeg',.92).split(',')[1]; },i/FPS);
    if(!ff.stdin.write(Buffer.from(data,'base64'))) await new Promise(r=>ff.stdin.once('drain',r)); if((i-i0)%900===0) console.log(path.basename(file),i-i0,'/',i1-i0); }
  ff.stdin.end(); const code=await new Promise(r=>ff.on('close',r)); if(errs.length) console.error('page errors:',errs.slice(0,3).join(' | ')); if(code) throw new Error('ffmpeg '+code); }
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto(url); await pg.waitForFunction(()=>window.__ready,null,{timeout:30000});
  const D=await pg.evaluate(()=>window.__D), N=Math.round(D*FPS), step=Math.ceil(N/JOBS), dir=out+'.parts'; fs.mkdirSync(dir,{recursive:true});
  const files=[...Array(JOBS)].map((_,k)=>path.join(dir,`p${k}.mp4`));
  await Promise.all(files.map((f,k)=>part(b,k*step,Math.min(N,(k+1)*step),f))); await b.close();
  fs.writeFileSync(path.join(dir,'list.txt'),files.map(f=>`file '${path.resolve(f)}'`).join('\n'));
  const tmp=out.replace(/\.mp4$/,'')+'.part.mp4', args=['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',path.join(dir,'list.txt')];
  if(music) args.push('-i',music,'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k','-shortest'); args.push('-c:v','copy','-movflags','+faststart',tmp);
  execFileSync('ffmpeg',args,{stdio:'inherit'}); fs.renameSync(tmp,out); fs.rmSync(dir,{recursive:true}); console.log('wrote',out,N,'frames'); })().catch(e=>{ console.error(e); process.exit(1); });
