/* Film part of a v2 lesson as an MP4 (1920×1080, 30 fps, silent).
   usage: node tools/lesson-video.cjs <book> <fromKey> <toKey> <out.mp4> [--sub "مثال 1"] [--next "..."] [--end "الفكرة"] [--vertical] [--preview]
     --vertical: 1080×1920 for reels/stories (drawing on top, steps below, bottom kept clear for the app's captions)
     e.g. node tools/lesson-video.cjs g12c3 rates-3-0 rates-3-4 tank.mp4 --sub "مثال 1"
   BASE (env) defaults to http://localhost:8770/math-books/ — serve the repo's parent folder first.
   The drawing is the app's own live scene; time is driven by Playwright's fake clock, so every
   frame is exact. Step text appears piece by piece; one MP4 per step, joined with -c copy. */
const {chromium}=require('playwright'), fs=require('fs'), path=require('path'), {spawn,execFileSync}=require('child_process');
const A=process.argv.slice(2), opt=k=>{ const i=A.indexOf(k); return i>=0?A[i+1]:null; };
const [book,fromKey,toKey,out]=A; const SUB=opt('--sub')||'', NEXT=opt('--next')||'', END=opt('--end')||'', PREVIEW=A.includes('--preview'), VERT=A.includes('--vertical');
const BASE=process.env.BASE||'http://localhost:8770/math-books/', FPS=30, Wd=VERT?1080:1920, Ht=VERT?1920:1080;
if(!book||!fromKey||!toKey||!out){ console.error('usage: node tools/lesson-video.cjs <book> <fromKey> <toKey> <out.mp4> [--sub ..] [--next ..] [--preview]'); process.exit(1); }
const lesson=fromKey.split('-')[0];

(async()=>{
 const b=await chromium.launch(), pg=await b.newPage({viewport:{width:Wd,height:Ht}});
 await pg.addInitScript(()=>{ try{ localStorage.setItem('lb-theme','light'); localStorage.setItem('lb-role','student'); }catch(e){} });
 await pg.clock.install({time:new Date('2026-01-01T00:00:00')});
 await pg.goto(`${BASE}v2/${book}.html#l=${lesson}`);
 for(let i=0;i<30;i++){ await pg.clock.runFor(100); if(await pg.$('.step .katex')) break; await pg.waitForTimeout(100); }
 await pg.evaluate(()=>document.fonts.ready);
 const segs=await pg.evaluate(({fromKey,toKey,SUB,NEXT,VERT})=>{
  const B=window.BOOK, L=LB.LES.find(l=>location.hash.includes('l='+l.id)), all=[...document.querySelectorAll('.story .step')];
  const i0=all.findIndex(s=>s.dataset.key===fromKey), i1=all.findIndex(s=>s.dataset.key===toKey), steps=all.slice(i0,i1+1);
  const D=document, mk=(t,c,h='')=>{ const e=D.createElement(t); if(c) e.className=c; e.innerHTML=h; return e; };
  const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  D.documentElement.dataset.theme='light'; D.body.classList.add('film');
  const css=mk('style','',`
   body.film{background:#eef2f8!important;overflow:hidden}
   body.film header, body.film #stages, body.film .outline, body.film #tools, body.film #toast, body.film #inkCanvas, body.film #story, body.film .home{display:none!important}
   body.film *{transition:none!important;animation:none!important}
   body.film .fig{position:fixed!important;left:56px;top:128px;width:820px;height:868px;z-index:5;margin:0!important}
   body.film .fig .panel{height:100%!important;max-height:none!important;box-shadow:0 8px 30px rgba(18,58,107,.10)!important;border-radius:22px!important}
   #fTop{position:fixed;left:0;right:0;top:0;height:96px;background:#123a6b;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 56px;font-family:Plex,system-ui;direction:rtl}
   #fTop .t{font-size:34px;font-weight:700} #fTop .t small{font-size:24px;font-weight:500;opacity:.8;margin-inline-start:18px}
   #fTop .b{font-size:22px;opacity:.75}
   #fBot{position:fixed;left:56px;right:56px;bottom:22px;height:40px;display:flex;justify-content:space-between;align-items:center;font-family:Plex,system-ui;direction:rtl;color:#55627a;font-size:21px}
   #fBot .dots{display:flex;gap:10px} #fBot .dots span{padding:3px 16px;border-radius:99px;background:#dde5f2;color:#55627a;font-size:19px}
   #fBot .dots span.on{background:#123a6b;color:#fff} #fBot .dots span.done{background:#b9cbe6;color:#123a6b}
   #fR{position:fixed;right:56px;top:128px;width:930px;height:868px;direction:rtl;font-family:Plex,system-ui;color:#1d2433;display:flex;flex-direction:column;gap:18px}
   #fQ{background:#fff;border-radius:18px;padding:16px 24px;font-size:22px;line-height:1.7;color:#3b4a63;border-inline-start:8px solid #123a6b}
   #fQ b.h{display:block;color:#123a6b;font-size:24px}
   #fS{flex:1;min-height:0;background:#fff;border-radius:22px;padding:26px 34px;box-shadow:0 8px 30px rgba(18,58,107,.10);overflow:hidden}
   #fS .in{font-size:var(--fs,28px);line-height:1.75}
   #fS .hd{font-size:1.3em;font-weight:700;color:#123a6b;margin:0 0 .4em;display:flex;gap:.5em;align-items:center}
   #fS .hd .n{display:inline-grid;place-items:center;width:1.5em;height:1.5em;border-radius:50%;background:#123a6b;color:#fff;font-size:.8em}
   #fS .chips{display:flex;gap:10px;margin:0 0 .3em;flex-wrap:wrap} #fS .chips .kind{position:static!important;font-size:18px!important}
   #fS h1{font-size:1.45em;margin:.1em 0 .3em;color:#0f1729} #fS p{margin:.25em 0}
   #fS .xp,#fS .let,#fS .law,#fS .note,#fS .err{margin:.4em 0!important;font-size:.9em}
   #fS .mathline{font-size:1.05em;margin:.3em 0;text-align:center}
   #fS .katex{font-size:1.08em}
   #fS .u{will-change:opacity}
   #fCard{position:fixed;inset:0;z-index:50;background:linear-gradient(135deg,#0f2e57,#1d4f8f);color:#fff;font-family:Plex,system-ui;direction:rtl;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px}
   #fCard .k{font-size:28px;opacity:.75} #fCard .t{font-size:84px;font-weight:700;line-height:1.3} #fCard .s{font-size:44px;color:#ffd666;font-weight:700}
   #fCard .m{font-size:28px;opacity:.85;margin-top:26px} #fCard .a{font-size:30px;margin-top:8px}
  `+(VERT?`
   #fTop{height:150px;flex-direction:column;justify-content:center;align-items:flex-start;gap:4px;padding:0 40px}
   #fTop .t{font-size:40px} #fTop .t small{display:block;margin:0;font-size:28px} #fTop .b{display:none}
   body.film .fig{left:40px;top:172px;width:1000px;height:740px}
   #fR{right:40px;top:932px;width:1000px;height:700px}
   #fQ{display:none!important}
   #fBot{left:40px;right:40px;bottom:auto;top:1652px;flex-direction:column;gap:14px;height:auto;align-items:center}
   #fBot > span{order:2;font-size:24px} #fBot .dots{flex-wrap:wrap;justify-content:center} #fBot .dots span{font-size:20px}
   #fCard .t{font-size:72px;padding:0 40px} #fCard .s{font-size:40px;padding:0 40px} #fCard{padding-bottom:200px}
  `:'')); D.head.append(css);
  const sec=steps[0].closest('.sec'), q=steps[0];
  const qTitle=q.querySelector('h1,h2')?.innerHTML||'', qText=[...q.querySelectorAll(':scope > p')].map(p=>p.innerHTML).join(' ');
  const kick=q.querySelector('.kicker')?.textContent.replace(/\s+/g,' ').trim()||'';
  D.body.append(mk('div','',`<div id="fTop"><div class="t">${/^\d/.test(L.no)?'['+L.no+']':L.no} ${D.getElementById('crB').innerHTML}<small>${esc(SUB)}${qTitle?' · '+q.querySelector('h1,h2').textContent:''}</small></div><div class="b">الرياضيات الحيّة · ${esc(B.grade)}</div></div>
   <div id="fR"><div id="fQ" hidden><b class="h">${qTitle}</b>${qText}</div><div id="fS"><div class="in"></div></div></div>
   <div id="fBot"><span>إعداد وتصميم: الأستاذ فائز الحمداني</span><div class="dots"></div></div>
   <div id="fCard" hidden></div>`));
  const labels=steps.map((s,i)=>i===0?'السؤال':(s.querySelector(':scope > .lbl')?.textContent.trim()||'خطوة '+i));
  D.querySelector('#fBot .dots').innerHTML=labels.map(l=>`<span>${esc(l)}</span>`).join('');
  const read=e=>{ const n=(e.innerText||'').replace(/\s+/g,' ').length; return Math.min(6.5,Math.max(1.8,0.75+n*0.05)); };
  /* build each step's content once, keep it detached */
  const built=steps.map((st,i)=>{ const c=st.cloneNode(true);
    c.querySelectorAll('.tadd,.tform,.tx,.hints,.genbox,.fb,.selfrow,.mk,button,input,.exams[hidden],.tnote').forEach(e=>e.remove());
    const box=mk('div','in'); const sn=c.querySelector(':scope > .sn')?.textContent, lb=c.querySelector(':scope > .lbl')?.innerHTML;
    if(i===0){ const ch=mk('div','chips'); c.querySelectorAll('.kind').forEach(k=>ch.append(k)); box.append(ch); }
    else box.append(mk('div','hd',`${sn?`<span class="n">${sn}</span>`:''}<span>${lb||''}</span>`));
    c.querySelectorAll(':scope > .sn,:scope > .lbl,:scope > .kicker,:scope > .kind,:scope > .exams').forEach(e=>e.remove());
    const units=[];
    [...c.children].forEach(ch=>{ if(/^(حرّك|اسحب|شغّل)/.test(ch.textContent.trim())) return;
      box.append(ch); units.push(ch); });
    return {box,units,scene:st.dataset.scene}; });
  window.FILM={built,read,labels,
   card(html){ const c=D.getElementById('fCard'); c.hidden=!html; c.innerHTML=html||''; },
   setup(i){ const S=D.querySelector('#fS'), b=built[i]; S.innerHTML=''; S.append(b.box); D.getElementById('fQ').hidden=i===0;
     /* fit: shrink the font until the whole step fits */
     let fs=VERT?34:30; b.box.style.setProperty('--fs',fs+'px'); while(b.box.scrollHeight>S.clientHeight-52&&fs>17){ fs--; b.box.style.setProperty('--fs',fs+'px'); }
     D.querySelectorAll('#fBot .dots span').forEach((s,j)=>s.className=j<i?'done':j===i?'on':'');
     b.units.forEach(u=>{ u.classList.add('u'); u.style.opacity=0; });
     let t=0.5; b.times=b.units.map(u=>{ const s=t; t+=read(u); return s; }); b.len=t+2.2;
     if(b.scene) LB.go(b.scene); return b.len; },
   at(i,t){ const b=built[i]; D.querySelector('#fS').style.opacity=Math.min(1,t/0.35); b.units.forEach((u,j)=>{ const k=Math.max(0,Math.min(1,(t-b.times[j])/0.5)); u.style.opacity=k; u.style.transform=`translateY(${(1-k)*14}px)`; }); }
  };
  dispatchEvent(new Event('resize'));
  return {n:steps.length, title:D.getElementById('crB').textContent, no:L.no, grade:B.grade, chapter:B.chapter, kick, qTitle:q.querySelector('h1,h2')?.textContent||''};
 },{fromKey,toKey,SUB,NEXT,VERT});
 await pg.clock.runFor(500);

 const tmp=fs.mkdtempSync(path.join(require('os').tmpdir(),'lessonvid-')); const files=[];
 const enc=name=>{ const f=path.join(tmp,name+'.part.mp4'); const p=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-r',String(FPS),'-f','mp4',f]);
   const done=new Promise((ok,no)=>p.on('exit',c=>c===0?(fs.renameSync(f,f.replace('.part','')),ok(f.replace('.part',''))):no(new Error('ffmpeg '+c)))); return {w:buf=>new Promise(r=>p.stdin.write(buf)?r():p.stdin.once('drain',r)),end:()=>(p.stdin.end(),done)}; };
 const shot=()=>pg.screenshot({type:'jpeg',quality:92});
 const segment=async(name,len,each)=>{ const n=Math.round(len*FPS), e=PREVIEW?null:enc(name);
   for(let f=0;f<n;f++){ await each(f/FPS); await pg.clock.runFor(1000/FPS);
     if(e) await e.w(await shot()); else if(PREVIEW&&(f===Math.round(n*0.55)||f===n-1)) fs.writeFileSync(out.replace(/\.mp4$/,'')+`.${name}.${f}.jpg`,await shot()); }
   if(e) files.push(await e.end()); process.stdout.write(name+' '); };
 const ttl=`<div class="k">الرياضيات الحيّة · ${segs.grade} · ${segs.chapter}</div><div class="t">${/^\d/.test(segs.no)?'['+segs.no+']':segs.no} ${segs.title}</div><div class="s">${SUB}${segs.qTitle?' · '+segs.qTitle:''}</div><div class="m">${segs.kick}</div><div class="a">إعداد وتصميم: الأستاذ فائز الحمداني</div>`;
 await pg.evaluate(h=>FILM.card(h),ttl); await segment('s00',3.2,async t=>{ if(t>2.7) await pg.evaluate(o=>document.getElementById('fCard').style.opacity=o,1-(t-2.7)/0.5); });
 await pg.evaluate(()=>FILM.card(''));
 for(let i=0;i<segs.n;i++){ const len=await pg.evaluate(i=>FILM.setup(i),i); await segment('s'+String(i+1).padStart(2,'0'),len,t=>pg.evaluate(([i,t])=>FILM.at(i,t),[i,t])); }
 const end=`<div class="k">${segs.no?'['+segs.no+'] ':''}${segs.title} · ${SUB}</div>${END?`<div class="t" style="font-size:64px">${END}</div>`:''}${NEXT?`<div class="s" style="font-size:34px">التالي: ${NEXT}</div>`:''}<div class="m">iqmath88.github.io/Math-books</div><div class="a">إعداد وتصميم: الأستاذ فائز الحمداني</div>`;
 await pg.evaluate(h=>{ FILM.card(h); document.getElementById('fCard').style.opacity=0; },end);
 await segment('s99',3.5,async t=>pg.evaluate(o=>document.getElementById('fCard').style.opacity=o,Math.min(1,t/0.5)));
 await b.close();
 if(!PREVIEW){ fs.writeFileSync(path.join(tmp,'list.txt'),files.map(f=>`file '${f}'`).join('\n'));
   execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',path.join(tmp,'list.txt'),'-c','copy','-movflags','+faststart',out]);
   fs.rmSync(tmp,{recursive:true,force:true}); }
 console.log('\nwrote',out);
})();
