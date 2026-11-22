'use strict';
/* أدوات مشتركة لفيديوهات يوتيوب الطويلة (1920×1080) فوق محرك السبورة v2/reels/chalk.js:
   كتابة الفقرات، لوح الاشتقاق المتدرّج، الرسوم البيانية، بطاقات الأمثلة ونص الكتاب، والإطار الكامل للحلقة. */
const CREAM='#f3e6c8', SOFT='#cfd8d2', COPPER='rgba(232,150,92,', GREEN='#a8e6a1';
const lerp=(a,b,k)=>a+(b-a)*k;

/* ---------- text helpers ---------- */
function wrapAr(text,sz,max,w=500){ const font=`${w} ${sz}px Body, ${LT}`, out=[]; let cur='';
  for(const word of text.split(' ')){ const nx=cur?cur+' '+word:word; if(textW(nx,font)>max&&cur){ out.push(cur); cur=word; } else cur=nx; } if(cur) out.push(cur); return out; }
/* lines written one after another from u0, `per` seconds each */
function para(u,lines,cx,y0,gap,sz,u0,per,o={}){ lines.forEach((ln,i)=>{ const a=u0+i*per; write(ln,cx,y0+i*gap,sz,{p:prog(u,a,a+per*1.05),a:o.a??1,col:o.col,f:'b',w:o.w||500}); }); }
function title(u,d,s,col=WHITE,sz=64){ write(s,960,150,sz,{p:prog(u,.1,1.1),a:vis(u,0,d),col}); stroke([[960-textW(s,`700 ${sz}px Ruqaa`)/2,178],[960+textW(s,`700 ${sz}px Ruqaa`)/2,176]],prog(u,.9,1.5),ORANGE,3,{a:.55*vis(u,0,d)}); }
function note(u,list,cx,y,sz=44,a=1){ for(const [a0,a1,txt] of list){ const lv=vis(u,a0,a1,.25,.3); if(lv>0) write(txt,cx,y,sz,{a:a*lv,col:SOFT,f:'b'}); } }
function warnBox(u,s,a,b,cx,y,sz=46){ const v=vis(u,a,b,.3,.4); if(v<=0) return; const w=textW(s,`500 ${sz}px Body`)+70;
  stroke([[cx-w/2,y-sz-6],[cx+w/2,y-sz-9],[cx+w/2+4,y+20],[cx-w/2-3,y+22],[cx-w/2,y-sz-6]],prog(u,a,a+.6),ORANGE,4,{a:v,glow:10});
  write(s,cx,y,sz,{p:prog(u,a+.15,a+.9),a:v,col:ORANGE,f:'b'}); }
function badge(n,x,y,r,a,p=1){ stroke(ellipseP(x,y,r,r),p,ORANGE,4,{a}); math(String(n),x,y+r*.42,r*1.15,{a:a*clamp(p*2),col:ORANGE}); }
/* a rough chalk rectangle */
function frameBox(x0,y0,x1,y1,p,a,col=WHITE,w=4){ stroke([[x0+10,y0+3],[x1-6,y0],[x1+2,y1-10],[x0+5,y1+2],[x0-2,y0+12],[x0+10,y0+3]],p,col,w,{a}); }
function panel(x0,y0,x1,y1,a){ L.save(); L.globalAlpha=.9*a; L.fillStyle='#1d2827'; L.beginPath(); L.roundRect(x0,y0,x1-x0,y1-y0,24); L.fill(); L.restore(); frameBox(x0,y0,x1,y1,1,.75*a); }

/* derivation board: lines stack downward and scroll up once `n` are shown; the newest is bright, older ones dimmer */
function derive(u,items,o){ let k=-1; items.forEach((it,i)=>{ if(u>=it.at) k=i; }); if(k<0) return {k:-1};
  const f=Math.max(0,(k-1+ease((u-items[k].at)/.55))-(o.n-1)); const out={k,ys:[]};
  for(let i=0;i<=k;i++){ const pos=i-f, y=o.top+pos*o.gap; let a=(i===k?1:.66)*(o.a??1); if(pos<0) a*=clamp(1+pos*1.6); out.ys[i]=y; if(a<=0.01) continue;
    const it=items[i], p=i===k?prog(u,it.at+.15,it.at+.15+(it.d||1.1)):1, sz=it.sz||o.sz;
    if(it.e) math(it.e,o.cx,y,sz,{p,a,col:it.col,glow:it.col?8:0,max:o.w});
    else write(it.s,o.cx,y,sz*.78,{p,a,col:it.col||WHITE,f:'b',w:500}); }
  return out; }

/* ---------- graphs ---------- */
function G(ox,oy,sx,sy){ return {ox,oy,sx,sy,X:x=>ox+x*sx,Y:y=>oy-y*sy}; }
function axes(g,x0,x1,y0,y1,p,a,lx='x',ly='y'){ arrow(g.X(x0),g.oy,g.X(x1),g.oy,p,WHITE,4); arrow(g.ox,g.Y(y0),g.ox,g.Y(y1),p,WHITE,4);
  math(lx,g.X(x1)+26,g.oy+14,44,{a:a*p}); math(ly,g.ox,g.Y(y1)-26,44,{a:a*p}); }
function plot(g,f,x0,x1,p,col,a,w=6,n=160){ const P=[]; for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n; P.push([g.X(x),g.Y(f(x))]); } stroke(P,p,col,w,{a,glow:10}); }
function dot(x,y,r,col,a){ L.save(); L.globalAlpha=a; L.fillStyle=col; L.shadowColor=col; L.shadowBlur=16; L.beginPath(); L.arc(x,y,r,0,2*PI); L.fill(); L.restore(); }
function tick(g,x,lab,a,below=true){ stroke([[g.X(x),g.oy-9],[g.X(x),g.oy+9]],1,WHITE,3,{a}); if(lab!=null) math(String(lab),g.X(x),g.oy+(below?52:-22),36,{a,col:DIM}); }

/* ---- examples: a title card, then the book's statement (verbatim), then the solution ---- */
function card(u,num,page,name,d=3.2){ const c=vis(u,-1,d,.3,.5); if(c<=0) return;
  write('مثال '+num,960,440,120,{p:prog(u,.1,1),a:c,col:ORANGE,glow:12}); write(name,960,580,70,{p:prog(u,.6,1.6),a:c}); write('ص '+page,960,680,44,{p:prog(u,1,1.8),a:c,col:DIM,f:'b',w:500}); }
function statement(u,text,a0,a1,num){ const v=vis(u,a0,a1,.4,.5); if(v<=0) return; const lines=wrapAr(text,52,1420);
  panel(180,250,1740,330+lines.length*82+40,v); write('مثال '+num+' · نص الكتاب',960,320,46,{p:prog(u,a0,a0+.8),a:v,col:ORANGE,f:'b'});
  para(u,lines,960,410,82,52,a0+.6,Math.min(2.2,(a1-a0-3)/lines.length),{a:v}); }

/* the whole frame of an episode: board, header, the current segment, chalk tips, grain, glow, fades */
function frameAll(SEG,D,header,t){
  g.clearRect(0,0,W,H); g.drawImage(board,0,0); L.clearRect(0,0,W,H); TIPS=[];
  const s=SEG.find(z=>t>=z.t0&&t<z.t0+z.d)||SEG[SEG.length-1], u=t-s.t0;
  if(s!==SEG[0]||u>8.8) write(header,960,58,30,{a:.75,col:DIM,f:'b',w:500});
  s.draw(u,s.d);
  write('NIBOR  /  MOTION',1760,1050,30,{a:.75*vis(t,.8,D,.6,.01),col:'#9fd8e0'});
  const r=rng(Math.floor(t*30)+3);
  for(const [x0,y0,col] of TIPS){ L.save(); L.fillStyle=col; for(let i=0;i<9;i++){ L.globalAlpha=.25+r()*.5; L.beginPath(); L.arc(x0+(r()-.5)*26,y0+(r()-.5)*26,1+r()*2.6,0,2*PI); L.fill(); } L.globalAlpha=.9; L.shadowColor=col; L.shadowBlur=16; L.beginPath(); L.arc(x0,y0,4,0,2*PI); L.fill(); L.restore(); }
  L.save(); L.globalCompositeOperation='destination-in'; L.drawImage(grain,0,0); L.restore();
  g.save(); g.filter='blur(7px)'; g.globalAlpha=.35; g.drawImage(layer,0,0); g.restore();
  g.drawImage(layer,0,0);
  const fb=(t-(D-.8))/.8; if(fb>0){ g.fillStyle=`rgba(0,0,0,${clamp(fb)})`; g.fillRect(0,0,W,H); }
  const fi=1-t/.6; if(fi>0){ g.fillStyle=`rgba(0,0,0,${clamp(fi)})`; g.fillRect(0,0,W,H); }
}
