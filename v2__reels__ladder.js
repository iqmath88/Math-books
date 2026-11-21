/* ريلز: مثال 4 ص 94 — السلم — مسجّل في REELS.ladder */
window.REELS.ladder=function(){
const D=63.3;
/* ---------- the book figure: wall on the left, ground, ladder 10 m; x = foot to wall, y = top to ground, θ at the foot ---------- */
const WX=205, GY=1075, S=60, LEN=10;                  // 1 m = 60 px
const foot=x=>[WX+x*S,GY], topP=x=>[WX,GY-Math.sqrt(LEN*LEN-x*x)*S];
const yOf=x=>Math.sqrt(LEN*LEN-x*x);
function scene(a=1){
  stroke([[WX,GY+4],[WX,GY-10.5*S]],1,WHITE,6,{a});                       // wall
  stroke([[WX-40,GY],[WX+10.6*S,GY]],1,WHITE,6,{a});                      // ground
  for(let k=0;k<13;k++){ const yy=GY-30-k*48; stroke([[WX,yy],[WX-22,yy+22]],1,WHITE,2.5,{a:a*.55}); }
  for(let k=0;k<15;k++){ const xx=WX+12+k*44; stroke([[xx,GY],[xx-22,GY+22]],1,WHITE,2.5,{a:a*.55}); }
  write('حائط',WX-62,GY-9.6*S,40,{a:a*.8,col:DIM,f:'b'}); write('أرض',WX+10.2*S,GY+62,40,{a:a*.8,col:DIM,f:'b'}); }
function ladder(x,a=1,col=WHITE){ const [fx,fy]=foot(x), [tx,ty]=topP(x), L0=Math.hypot(fx-tx,fy-ty), ux=(fx-tx)/L0, uy=(fy-ty)/L0, nx=-uy*9, ny=ux*9;
  stroke([[tx+nx,ty+ny],[fx+nx,fy+ny]],1,col,5,{a}); stroke([[tx-nx,ty-ny],[fx-nx,fy-ny]],1,col,5,{a});
  for(let k=1;k<10;k++){ const px=tx+(fx-tx)*k/10, py=ty+(fy-ty)*k/10; stroke([[px+nx*1.6,py+ny*1.6],[px-nx*1.6,py-ny*1.6]],1,col,3.5,{a:a*.85}); }
  L.save(); L.globalAlpha=a; L.fillStyle=WHITE; for(const [px,py] of [[fx,fy],[tx,ty]]){ L.beginPath(); L.arc(px,py,7,0,2*PI); L.fill(); } L.restore(); }
function thetaArc(x,p,a=1,col=ORANGE){ const [fx,fy]=foot(x), ang=Math.atan2(yOf(x),x); const P=ellipseP(fx,fy,62,62,PI,PI+ang*1,30).map(([u,v])=>[u,v]);
  stroke(P,p,col,5,{a,glow:8}); if(p>.6) math('θ',fx-96,fy-18,50,{a,col}); }

/* ---------- scenes ---------- */
const SC=[[0,4.6],[4.6,11.2],[11.2,19.4],[19.4,33.6],[33.6,46.4],[46.4,63.3]];
const IN=(t,i)=>t>=SC[i][0]-.5&&t<SC[i][1]+.5;
function title(s,t,i,col=WHITE,sz=74){ const [a,b]=SC[i]; write(s,540,282,sz,{p:prog(t,a+.1,a+1.1),a:vis(t,a,b),col}); }
function warn(s,t,a,b,y){ const v=vis(t,a,b,.3,.4); if(v<=0) return; const w=textW(s,`500 52px Body`)+80;
  const P=[[540-w/2,y-56],[540+w/2,y-59],[540+w/2+4,y+22],[540-w/2-3,y+24],[540-w/2,y-56]]; stroke(P,prog(t,a,a+.6),ORANGE,4,{a:v,glow:10});
  write(s,540,y,52,{p:prog(t,a+.15,a+.9),a:v,col:ORANGE,f:'b'}); }
/* derivation steps: each step is written, then moves up (dimmed) when the next one comes */
function steps(t,list,y1,y2,sz,a=1){ let k=-1; list.forEach((st,i)=>{ if(t>=st.at) k=i; }); if(k<0) return;
  const pk=ease((t-list[k].at)/.45);
  for(let i=Math.max(0,k-2);i<=k;i++){ const age=k-i, st=list[i]; let y,al,p=1;
    if(age===0){ y=y2; al=1; p=prog(t,st.at+(k?.4:0),st.at+(k?.4:0)+(st.d||1)); }
    else if(age===1){ y=y2+(y1-y2)*pk; al=1-.45*pk; }
    else { y=y1-70*pk; al=.55*(1-pk); }
    if(al>0) math(st.e,540,y,sz*(age?1-.12*Math.min(1,age===1?pk:1):1),{p,a:a*al,col:st.col,glow:st.col?8:0}); }
  return {k}; }
function notes(t,list,y,a=1){ for(const [a0,a1,txt] of list){ const lv=vis(t,a0,a1,.25,.3); if(lv>0) write(txt,540,y,52,{a:a*lv,col:'#cfd8d2',f:'b'}); } }
const dd=v=>({f:['d'+v,'dt']});

/* paradox: the foot keeps moving at the real dx/dt = 2 m/s, shown slowed down */
const S6=46.4, X0=8, X1=9.8, PT0=S6+1.6, PT1=S6+8.6, SLOW=(PT1-PT0)/((X1-X0)/2);
const xParadox=t=>X0+2*clamp(t-PT0,0,PT1-PT0)/SLOW;

function frame(t,extra){
  g.clearRect(0,0,W,H); g.drawImage(board,0,0); L.clearRect(0,0,W,H); TIPS=[];
  write('الأستاذ فائز الحمداني',540,128,48,{p:1,a:.95*vis(t,-1,D,.4,.6),col:'#f3e6c8'});
  write('مثال 4 · ص 94 · السادس العلمي',540,190,38,{p:1,a:.8*vis(t,-1,D,.4,.6),col:DIM,w:400});

  /* ---- 1: the question (full from the first frame) ---- */
  if(IN(t,0)){ const v=vis(t,-1,4.6,.3,.5);
    write('يبتعد أسفل السلم بمعدل ثابت…',540,300,68,{a:v});
    write('بأي سرعة ينزل رأسه؟',540,402,80,{a:v,col:ORANGE,glow:10+8*Math.sin(t*3)**2}); }

  /* the figure stays all the time; x moves in the hook, stops at x = 8 (the book's moment), moves again in the paradox */
  scene(1);
  const xHook=5+3*ease(clamp((t-.2)/4)), SNAP0=SC[1][0]+.8, snap=t>=SNAP0&&t<PT0;
  const xNow=t<PT0? xHook : xParadox(t);
  ladder(xNow,1);
  { const [fx]=foot(xNow); arrow(fx+18,GY-26,fx+18+2*58,GY-26,t<SC[1][0]+2.4?clamp((t-.3)*3):1,ORANGE,5);
    if(t>=SC[1][0]+2.2) math([{f:['dx','dt']},' = 2'],fx+150,GY-70,46,{p:prog(t,SC[1][0]+2.2,SC[1][0]+2.9),col:ORANGE}); }
  { const sv=vis(t,SNAP0,PT0,.4,.4); if(sv>0){ const [fx]=foot(8); write('لحظة ⁦x = 8 m⁩',WX+20,GY+140,44,{a:.9*sv,col:BLUE,f:'b',align:'start'}); } }

  /* ---- 2: givens on the drawing ---- */
  if(IN(t,1)){ const [s,e]=SC[1], v=vis(t,s,e), [fx]=foot(8), [tx,ty]=topP(8);
    title('المعطيات',t,1);
    math('10 m',(fx+tx)/2+58,(ty+GY)/2-20,56,{p:prog(t,s+.8,s+1.4),a:v});
    stroke([[WX,GY+30],[fx,GY+30]],prog(t,s+1.2,s+1.9),BLUE,4,{a:v}); math('x',(WX+fx)/2,GY+30+56,56,{p:prog(t,s+1.8,s+2.2),a:v,col:BLUE});
    stroke([[WX+26,GY],[WX+26,ty]],prog(t,s+1.5,s+2.2),BLUE,4,{a:v,dash:[12,10]}); math('y',WX+60,(ty+GY)/2+20,56,{p:prog(t,s+2,s+2.4),a:v,col:BLUE});
    thetaArc(8,prog(t,s+2.3,s+3),v);
    math('x = 8 m',540,1350,76,{p:prog(t,s+3.2,s+3.8),a:v,col:ORANGE,glow:6});
    write('المطلوب: معدل نزول الرأس وتغيّر الزاوية',540,1460,52,{p:prog(t,s+3.6,s+4.4),a:v,f:'b'});
  }

  /* ---- 3: Pythagoras — the sides glow one by one ---- */
  if(IN(t,2)){ const [s,e]=SC[2], v=vis(t,s,e), [fx]=foot(8), [tx,ty]=topP(8);
    title('مبرهنة فيثاغورس',t,2);
    const pul=.6+.4*Math.sin(t*6)**2;
    const gx=vis(t,s+.6,e,.3,.4), gy=vis(t,s+.9,e,.3,.4), gl=vis(t,s+1.2,e,.3,.4);
    if(gx>0) stroke([[WX,GY-4],[fx,GY-4]],1,BLUE,12,{a:v*gx*pul,glow:22});
    if(gy>0) stroke([[WX+5,GY],[WX+5,ty]],1,BLUE,12,{a:v*gy*pul,glow:22});
    if(gl>0) stroke([[tx,ty],[fx,GY]],1,ORANGE,12,{a:v*gl*pul,glow:22});
    steps(t,[{e:[{s:['x','2']},' + ',{s:['y','2']},' = 100'],at:s+1.4},
             {e:[{s:['8','2']},' + ',{s:['y','2']},' = 100'],at:s+3},
             {e:[{s:['y','2']},' = 36  ⇒  ',{c:ORANGE,e:['y = 6 m']}],at:s+4.4,d:1.2}],1285,1465,90,v);
    warn('انتبه! طول السلم ثابت = 10',t,s+5.8,e,1600);
  }

  /* ---- 4: part 1 — rate of the top ---- */
  if(IN(t,3)){ const [s,e]=SC[3], v=vis(t,s,e), [tx,ty]=topP(8);
    title('أولاً: معدل انزلاق الطرف العلوي',t,3,WHITE,64);
    const r=steps(t,[{e:[{s:['x','2']},' + ',{s:['y','2']},' = 100'],at:s+.6},
             {e:['2x·',dd('x'),' + 2y·',dd('y'),' = 0'],at:s+2.2,d:1.3},
             {e:['(2)(',{c:ORANGE,e:['8']},')(',{c:ORANGE,e:['2']},') + (2)(',{c:ORANGE,e:['6']},')·',dd('y'),' = 0'],at:s+4.4,d:1.3},
             {e:['32 + 12·',dd('y'),' = 0'],at:s+6.3},
             {e:[dd('y'),' = ',{f:['−32','12']},' = ',{f:['−8','3']}],at:s+7.9,d:1.2},
             {e:[dd('y'),' ≈ −2.67 m/s'],at:s+9.6,col:ORANGE}],1285,1465,88,v);
    if(r&&r.k===5){ const w=mW([dd('y'),' ≈ −2.67 m/s'],90); ring(540,1440,Math.min(500,w/2+46),92,prog(t,s+10.4,s+11.3),ORANGE,v); }
    notes(t,[[s+2.2,s+4.1,'نشتق الطرفين بالنسبة إلى الزمن ⁦t⁩'],[s+4.4,s+6.2,'نعوّض: ⁦x = 8 , y = 6 , dx/dt = 2⁩']],1600,v);
    write('السالب: الطرف العلوي ينزل',540,1610,52,{p:prog(t,s+11.4,s+12.1),a:v*.95,col:DIM,f:'b'});
    if(t>=s+9.6){ const a=v*clamp((t-s-9.6)/.5); arrow(tx-34,ty-6,tx-34,ty+8/3*40,prog(t,s+9.6,s+10.3),BLUE,6); math([dd('y')],tx-104,ty+64,44,{a,col:BLUE}); }
  }

  /* ---- 5: part 2 — rate of the angle ---- */
  if(IN(t,4)){ const [s,e]=SC[4], v=vis(t,s,e), [fx]=foot(8), [tx,ty]=topP(8);
    title('ثانياً: سرعة تغيّر الزاوية',t,4,WHITE,68);
    thetaArc(8,prog(t,s+.3,s+1),v);
    const pul=.6+.4*Math.sin(t*6)**2, g1=vis(t,s+.6,s+3.8,.3,.4), g2=vis(t,s+4,s+6,.3,.4);
    if(g1>0){ stroke([[WX+5,GY],[WX+5,ty]],1,BLUE,12,{a:v*g1*pul,glow:22}); stroke([[tx,ty],[fx,GY]],1,ORANGE,12,{a:v*g1*pul,glow:22}); }
    if(g2>0){ stroke([[WX,GY-4],[fx,GY-4]],1,BLUE,12,{a:v*g2*pul,glow:22}); stroke([[tx,ty],[fx,GY]],1,ORANGE,12,{a:v*g2*pul,glow:22}); }
    const r=steps(t,[{e:['sin θ = ',{f:['y','10']}],at:s+.8},
             {e:['cos θ·',dd('θ'),' = ',{f:['1','10']},'·',dd('y')],at:s+2.4,d:1.3},
             {e:['cos θ = ',{f:['x','10']},' = ',{c:ORANGE,e:[{f:['8','10']}]}],at:s+4.2},
             {e:[{f:['8','10']},'·',dd('θ'),' = ',{f:['1','10']},'(',{c:ORANGE,e:[{f:['−8','3']}]},')'],at:s+6,d:1.3},
             {e:[dd('θ'),' = ',{f:['−1','3']},' rad/s'],at:s+7.8,col:ORANGE}],1285,1465,88,v);
    if(r&&r.k===4){ const w=mW([dd('θ'),' = ',{f:['−1','3']},' rad/s'],90); ring(540,1440,Math.min(500,w/2+46),100,prog(t,s+8.7,s+9.6),ORANGE,v); }
    notes(t,[[s+.8,s+2.3,'المقابل ÷ الوتر'],[s+2.4,s+4.1,'نشتق الطرفين بالنسبة إلى الزمن ⁦t⁩'],[s+4.2,s+5.9,'المجاور ÷ الوتر'],[s+6,s+7.7,'نعوّض ⁦dy/dt = −8/3⁩ من أولاً']],1600,v);
    write('السالب: الزاوية تصغر',540,1615,52,{p:prog(t,s+9.8,s+10.5),a:v*.95,col:DIM,f:'b'});
  }

  /* ---- 6: the paradox — the foot moves steadily, the top falls faster and faster ---- */
  if(IN(t,5)){ const [s,e]=SC[5], v=vis(t,s,e,.45,.01), x=xParadox(t), y=yOf(x), vy=-2*x/y;
    title('المفارقة',t,5,ORANGE);
    const vf=v*(1-ease((t-(s+9))/.5));
    math([dd('x'),' = 2'],460,1290,80,{p:prog(t,s+.4,s+1.2),a:vf});
    write('ثابت',690,1290,56,{p:prog(t,s+1,s+1.5),a:vf,col:DIM,f:'b'});
    math([dd('y'),' = −',{f:['x','y']},'·2'],540,1435,80,{p:prog(t,s+1.2,s+2.2),a:vf});
    if(t>=PT0-.4){ const a=v*clamp((t-PT0+.4)/.4)*(1-ease((t-(s+9))/.5));
      math(['x = '+x.toFixed(2)],215,1565,54,{a,col:BLUE}); math(['y = '+y.toFixed(2)],540,1565,54,{a,col:BLUE}); math([dd('y'),' = '+vy.toFixed(2)],860,1565,54,{a,col:ORANGE,glow:6});
      write('حركة مبطّأة ×'+Math.round(SLOW),540,1650,46,{a:a*.9,col:DIM,f:'b'});
      const [tx,ty]=topP(x); arrow(tx-34,ty-6,tx-34,ty-6+Math.min(260,-vy*22),1,BLUE,6); }
    if(t>=s+9.5){ const vc=v*(1-ease((t-(s+13.4))/.4));
      write('القاعدة تبتعد بسرعة ثابتة…',540,1330,62,{p:prog(t,s+9.5,s+10.4),a:vc,f:'b'});
      write('أما الرأس فينزل أسرع فأسرع كلما اقترب من الأرض',540,1425,50,{p:prog(t,s+10.1,s+11.3),a:vc,col:ORANGE,glow:8,f:'b'}); }
    if(t>=s+13.7){
      write('جرّب بنفسك',540,1300,70,{p:prog(t,s+13.7,s+14.3),a:v,col:ORANGE,glow:10});
      write('ما معدل نزول الرأس عندما ⁦x = 6 m⁩ ؟',540,1400,58,{p:prog(t,s+14.2,s+15.1),a:v,f:'b'});
      write('اكتب جوابك في التعليقات',540,1495,54,{p:prog(t,s+14.9,s+15.7),a:v,col:DIM,f:'b'}); }
  }

  if(extra) extra();
  write('NIBOR  /  MOTION',540,1760,40,{a:.85*vis(t,.8,D,.6,.01),col:'#9fd8e0'});
  const r=rng(Math.floor(t*30)+3);
  for(const [x,y,col] of TIPS){ L.save(); L.fillStyle=col; for(let i=0;i<9;i++){ L.globalAlpha=.25+r()*.5; L.beginPath(); L.arc(x+(r()-.5)*26,y+(r()-.5)*26,1+r()*2.6,0,2*PI); L.fill(); } L.globalAlpha=.9; L.shadowColor=col; L.shadowBlur=16; L.beginPath(); L.arc(x,y,4,0,2*PI); L.fill(); L.restore(); }
  L.save(); L.globalCompositeOperation='destination-in'; L.drawImage(grain,0,0); L.restore();
  g.save(); g.filter='blur(7px)'; g.globalAlpha=.35; g.drawImage(layer,0,0); g.restore();
  g.drawImage(layer,0,0);
  const fb=(t-(D-.5))/.5; if(fb>0){ g.fillStyle=`rgba(0,0,0,${clamp(fb)})`; g.fillRect(0,0,W,H); }
}

/* ---- the example as written in the book (p. 94), after the brainstorm question ---- */
const Q0=4.55, SH=12;
const BOOK=['سلم طوله ⁦10m⁩ يستند طرفه الأسفل على أرض أفقية وطرفه العلوي على حائط رأسي، فإذا انزلق الطرف الأسفل مبتعداً عن الحائط بمعدل ⁦2m/s⁩ عندما يكون الطرف الأسفل على بعد ⁦8m⁩ عن الحائط جد :',
            ['1','معدل انزلاق الطرف العلوي.'],['2','سرعة تغير الزاوية بين السلم والأرض.']];
let LINES=null;
function wrapBook(){ const sz=48, font=`500 ${sz}px Body, ${LT}`, max=880, out=[['مثال 4',ORANGE,60,'r']];
  for(const part of BOOK){ if(Array.isArray(part)){ out.push([part[1],WHITE,sz,'b',part[0]]); continue; }
    let cur=''; for(const w of part.split(' ')){ const nx=cur?cur+' '+w:w; if(textW(nx,font)>max&&cur){ out.push([cur,WHITE,sz,'b']); cur=w; } else cur=nx; } if(cur) out.push([cur,WHITE,sz,'b']); }
  return out; }
function statement(u){ const v=Math.min(ease(u/.5),1-ease((u-(SH-.6))/.6)); if(v<=0) return;
  const x0=60,x1=1020,y0=440,y1=1200;
  L.save(); L.globalAlpha=.93*v; L.fillStyle='#1d2827'; L.beginPath(); L.roundRect(x0,y0,x1-x0,y1-y0,26); L.fill(); L.restore();
  const P=[[x0+14,y0+4],[x1-8,y0],[x1+2,y1-12],[x0+6,y1+2],[x0-2,y0+16],[x0+14,y0+4]]; stroke(P,prog(u,.1,1.1),WHITE,4,{a:.8*v});
  if(!LINES) LINES=wrapBook(); const n=LINES.length-1, gap=Math.min(80,(y1-y0-150)/n), dt=Math.min(.7,5.5/n);
  let y=y0+92; LINES.forEach(([txt,col,sz,f,badge],i)=>{ const a=.5+i*dt, p=prog(u,a,a+.8);
    if(badge){ const w=textW(txt,`500 ${sz}px Body, ${LT}`), bx=540+w/2+12; write(txt,540-28,y,sz,{p,a:v,col,f,w:500});
      if(p>0){ stroke(ellipseP(bx,y-16,26,26),p,ORANGE,4,{a:v}); math(badge,bx,y,42,{a:v*clamp(p*2),col:ORANGE}); } }
    else write(txt,540,y,sz,{p,a:v,col,glow:i?0:8,f,w:i?500:700});
    y+=i?gap:(gap+18); });
  stroke([[430,y0+112],[650,y0+110]],prog(u,.9,1.4),ORANGE,3,{a:.6*v}); }
const CUT0=8.6, CUT=65/30;   /* givens: skip the idle 2.17 s once the numbers are on the drawing */
const render=t=>{ if(t<Q0) frame(t); else if(t<Q0+SH) frame(Q0,()=>statement(t-Q0)); else { let u=t-SH; if(u>=CUT0) u+=CUT; frame(u); } };
 

const real=u=>u<CUT0?u+SH:u+SH-CUT, NAMES=['فيثاغورس', 'أولاً', 'ثانياً', 'المفارقة'];
  const cues=[{t:0,l:'السؤال'},{t:Q0,l:'نص المثال'},{t:Q0+SH,l:'المعطيات'}].concat(SC.slice(2).map((s,i)=>({t:real(s[0]),l:NAMES[i]})));
  return {render,D:D+SH-CUT,cues};
};
