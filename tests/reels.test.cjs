/* Chalkboard reels in the player: each reel loads, every scene cue draws without page errors, the board is not blank,
   scene navigation lands on the cues, and the reel lasts what its cues say.  usage: node tests/reels.test.cjs */
const {chromium}=require('playwright'), path=require('path');
const page='file://'+path.join(__dirname,'..','v2__reels__player.html');
let fail=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
(async()=>{ const b=await chromium.launch(), pg=await (await b.newContext({viewport:{width:1366,height:1024}})).newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  for(const id of ['cone','ladder']){
    await pg.goto(page+'#'+id); await pg.reload(); await pg.waitForFunction(()=>window.__playerReady,null,{timeout:20000});
    const info=await pg.evaluate(()=>({D:+document.getElementById('seek').max, cues:[...document.querySelectorAll('#scenes button')].map(b=>+b.dataset.t)}));
    ok(info.cues.length===7&&info.D>50&&info.D<90, `${id}: 7 scenes, ${info.D.toFixed(1)} s`);
    ok(info.cues.every((c,i)=>!i||c>info.cues[i-1]), `${id}: scene times increase`);
    /* draw across the whole reel; measure that the board has chalk on it (bright pixels) */
    const bright=await pg.evaluate(D=>{ const c=document.getElementById('c'), x=c.getContext('2d'), out=[];
      for(let t=0;t<=D;t+=D/24){ window.__at(t); const d=x.getImageData(0,0,1080,1920).data; let n=0; for(let i=0;i<d.length;i+=4*97) if(d[i]+d[i+1]+d[i+2]>480) n++; out.push(n); } return out; },info.D);
    ok(bright.slice(0,-1).every(n=>n>40), `${id}: chalk drawn at every sampled time (min ${Math.min(...bright.slice(0,-1))} bright samples)`);
    /* next-scene button walks through the cues */
    await pg.evaluate(()=>window.__at(0)); const walk=[];
    for(let i=0;i<6;i++){ await pg.click('#next'); await pg.waitForTimeout(60); walk.push(+(+await pg.$eval('#seek',e=>e.value)).toFixed(2)); }
    ok(walk.every((v,i)=>Math.abs(v-info.cues[i+1])<.05), `${id}: ⏭ lands on each scene (${walk.join(', ')})`);
  }
  ok(errs.length===0, 'no page errors'+(errs.length?': '+errs.join(' | '):''));
  await b.close(); process.exit(fail?1:0); })();
