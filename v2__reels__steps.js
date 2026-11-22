/* ريلز: فكرة الدرس [3−8] وخطوات الحل (ص 140) — مسجّل في REELS.steps */
window.REELS.steps=function(){
const SOFT='#cfd8d2', CREAM='#f3e6c8', GREEN='#a8e6a1';
const SC=[[0,5.5],[5.5,19],[19,30],[30,47],[47,62],[62,70],[70,84]];
const D=SC[SC.length-1][1];
const IN=(t,i)=>t>=SC[i][0]-.5&&t<SC[i][1]+.5;
function wrap(text,sz,max){ const font=`500 ${sz}px Body, ${LT}`, out=[]; let cur=''; for(const w of text.split(' ')){ const nx=cur?cur+' '+w:w; if(textW(nx,font)>max&&cur){ out.push(cur); cur=w; } else cur=nx; } if(cur) out.push(cur); return out; }
function para(t,lines,y0,gap,sz,t0,per,a,col){ lines.forEach((ln,i)=>{ const s=t0+i*per; write(ln,540,y0+i*gap,sz,{p:prog(t,s,s+per*1.05),a,col,f:'b',w:500}); }); }
function title(s,t,i,col=WHITE,sz=72){ const [a,b]=SC[i]; write(s,540,300,sz,{p:prog(t,a+.1,a+1.1),a:vis(t,a,b),col}); }
function badge(n,x,y,r,a,p=1,col=ORANGE){ stroke(ellipseP(x,y,r,r),p,col,4,{a}); math(String(n),x,y+r*.42,r*1.15,{a:a*clamp(p*2),col}); }
function box(x0,y0,x1,y1,p,a,col=WHITE,w=4){ stroke([[x0+10,y0+3],[x1-6,y0],[x1+2,y1-10],[x0+5,y1+2],[x0-2,y0+12],[x0+10,y0+3]],p,col,w,{a}); }
function panel(x0,y0,x1,y1,a){ L.save(); L.globalAlpha=.9*a; L.fillStyle='#1d2827'; L.beginPath(); L.roundRect(x0,y0,x1-x0,y1-y0,24); L.fill(); L.restore(); box(x0,y0,x1,y1,1,.75*a); }
function dot(x,y,r,col,a){ L.save(); L.globalAlpha=a; L.fillStyle=col; L.shadowColor=col; L.shadowBlur=16; L.beginPath(); L.arc(x,y,r,0,2*PI); L.fill(); L.restore(); }
function curve(f,x0,x1,X,Y,p,col,a,w=6){ const P=[]; for(let i=0;i<=140;i++){ const x=x0+(x1-x0)*i/140; P.push([X(x),Y(f(x))]); } stroke(P,p,col,w,{a,glow:10}); }

const BOOK140='ظهرت في القرن السابع عشر الكثير من الاسئلة دفعت الى تطور حساب التفاضل والتكامل ومن امثلة ذلك المسائل التي وردت في بحوث الفيزياء مثل اقصى ارتفاع تصله قذيفة اطلقت بزوايا مختلفة، او اقصى ارتفاع يصله جسم مقذوف شاقولياً الى اعلى اواقل زمن وأقل كلفة ومسائل من الصناعات مثل أقل مساحة وأكبر حجم وأقل محيط، ... الخ.';
const STEPS=['نرسم مخططاً للمسألة (إن امكن) ونعين عليه الأجزاء المهمة في المسألة.',
  'نكوّن الدالة المراد ايجاد قيمتها العظمى او الصغرى ونحدد مجالها على ان تكون في متغير واحد.',
  'اذا كان المجال فترة مغلقة نجد الاعداد الحرجة وقيم الدالة في اطراف الفترة وفي الاعداد الحرجة. فأيّها اكبر هي القيمة العظمى وأيّها أصغر هي القيمة الصغرى.'];
const METHOD=[['نفرض','المتغيرات على الرسم'],['الدالة الرئيسية','الكمية المطلوب تعظيمها أو تصغيرها'],['العلاقة المساعدة','قبل الاشتقاق ⇐ متغير واحد ومجاله'],['نشتق ونساوي بالصفر','ثم نتحقق ونهمل غير المعقول'],['الجواب بوحدته','cm , cm² , cm³']];
let LB=null, LS=null;

function frame(t){
  g.clearRect(0,0,W,H); g.drawImage(board,0,0); L.clearRect(0,0,W,H); TIPS=[];
  write('الأستاذ فائز الحمداني',540,128,48,{p:1,a:.95*vis(t,-1,D,.4,.6),col:CREAM});
  write('الدرس ⁦3−8⁩ · ص ⁦140⁩ · السادس العلمي',540,190,38,{p:1,a:.8*vis(t,-1,D,.4,.6),col:DIM,w:400});

  /* ---- 1: hook — three problems, one question (full from the first frame) ---- */
  if(IN(t,0)){ const v=vis(t,-1,SC[0][1],.3,.5);
    write('أكبر حجم… أكبر مساحة… أقصر مسافة',540,330,58,{a:v});
    write('ما الذي يجمعها؟',540,440,84,{a:v,col:ORANGE,glow:10+8*Math.sin(t*3)**2});
    /* a peak that rises and falls */
    const X=x=>140+x*80, Y=y=>1240-y*90, f=x=>-(x-5)*(x-5)/2.2+6;
    curve(f,1.4,8.6,X,Y,clamp(t/1.6+.25),BLUE,v);
    const xm=5+3.4*Math.sin(t*1.2); dot(X(xm),Y(f(xm)),14,ORANGE,v); stroke([[X(xm),Y(f(xm))],[X(xm),Y(0)]],1,ORANGE,3,{a:v*.6,dash:[10,10]});
    stroke([[X(0),Y(0)],[X(10),Y(0)]],1,WHITE,4,{a:v*.8});
    write('أفضل قيمة: عظمى أو صغرى',540,1450,64,{p:prog(t,2.6,3.8),a:v,col:ORANGE,f:'b',glow:8}); }

  /* ---- 2: where these problems come from — the book, p.140 (verbatim) ---- */
  if(IN(t,1)){ const [s,e]=SC[1], v=vis(t,s,e);
    title('من أين جاءت هذه المسائل؟',t,1,WHITE,64);
    if(!LB) LB=wrap(BOOK140,46,880); panel(60,400,1020,450+LB.length*74+60,v);
    write('من الكتاب · ص 140',540,470,40,{p:prog(t,s+.4,s+1.1),a:v,col:ORANGE,f:'b'});
    para(t,LB,560,74,46,s+.8,Math.min(1.1,8.6/LB.length),v);
    const kw=[['أقصى ارتفاع',ORANGE],['أقل زمن',BLUE],['أقل كلفة',BLUE],['أقل مساحة',BLUE],['أكبر حجم',ORANGE],['أقل محيط',BLUE]];
    kw.forEach(([w,col],i)=>{ const x=840-(i%3)*300, y=1430+Math.floor(i/3)*90, at=s+9.6+i*.5; write(w,x,y,52,{p:prog(t,at,at+.6),a:v,col,f:'b',glow:6}); });
    write('البرتقالي عظمى · الأزرق صغرى',540,1630,40,{p:prog(t,s+12.4,s+13.2),a:v*.9,col:SOFT,f:'b',w:500}); }

  /* ---- 3: the idea — at a peak or a valley the tangent is horizontal ---- */
  if(IN(t,2)){ const [s,e]=SC[2], v=vis(t,s,e);
    title('الفكرة',t,2,ORANGE,80);
    const X=x=>540+x*170, Y=y=>860-y*95, f=x=>x*x*x-3*x;
    stroke([[X(-2.7),Y(0)],[X(2.7),Y(0)]],prog(t,s+.4,s+1),WHITE,4,{a:v}); stroke([[X(0),Y(-3.4)],[X(0),Y(3.4)]],prog(t,s+.4,s+1),WHITE,4,{a:v});
    curve(f,-2.15,2.15,X,Y,prog(t,s+.8,s+2.6),BLUE,v);
    for(const [x0,lab,col,at] of [[-1,'نهاية عظمى',ORANGE,s+2.8],[1,'نهاية صغرى',GREEN,s+4]]){ const a=v*clamp((t-at)/.5), px=X(x0), py=Y(f(x0));
      dot(px,py,13,col,a); stroke([[px-140,py],[px+140,py]],prog(t,at,at+.7),col,5,{a,dash:[12,10]}); write(lab,px,py+(x0<0?-56:96),50,{p:prog(t,at+.3,at+1),a,col,f:'b'}); }
    write('المماس أفقي عند القمة والقاع',540,1300,56,{p:prog(t,s+5.4,s+6.4),a:v,f:'b'});
    math(["f′(x) = 0"],540,1450,110,{p:prog(t,s+6.6,s+7.8),a:v,col:ORANGE,glow:10});
    write('هذه هي النقاط التي نبحث عنها',540,1590,48,{p:prog(t,s+8.2,s+9.2),a:v,col:SOFT,f:'b',w:500}); }

  /* ---- 4: the book's three steps (p.140, verbatim) ---- */
  if(IN(t,3)){ const [s,e]=SC[3], v=vis(t,s,e);
    title('خطوات الحل · من الكتاب',t,3,WHITE,66);
    if(!LS) LS=STEPS.map(x=>wrap(x,44,860));
    let y=470; const at=[s+1,s+5.5,s+10.5];
    LS.forEach((lines,i)=>{ const a=v*clamp((t-at[i])/.4); if(a>0){ badge(i+1,540,y-10,38,a,prog(t,at[i],at[i]+.6)); para(t,lines,y+90,64,44,at[i]+.4,Math.min(1.3,(i<2?4:5.6)/lines.length),a); }
      y+=90+lines.length*64+70; }); }

  /* ---- 5: the working method in five steps; the auxiliary relation comes before differentiating ---- */
  if(IN(t,4)){ const [s,e]=SC[4], v=vis(t,s,e);
    title('طريقة العمل في كل مثال',t,4,WHITE,66);
    METHOD.forEach(([h,sub],i)=>{ const y=430+i*215, at=s+.8+i*2.2, a=v*clamp((t-at)/.4); if(a<=0) return; const hot=i===2&&t>s+11.6;
      L.save(); L.globalAlpha=(hot?.95:.75)*a; L.fillStyle=hot?'#2a3634':'#1d2827'; L.beginPath(); L.roundRect(90,y,900,170,22); L.fill(); L.restore();
      box(90,y,990,y+170,prog(t,at,at+.7),a,hot?ORANGE:WHITE,hot?6:3); badge(i+1,920,y+85,36,a,prog(t,at,at+.6));
      write(h,560,y+78,58,{p:prog(t,at+.2,at+1),a,col:hot?ORANGE:WHITE});
      if(/[؀-ۿ]/.test(sub)) write(sub,560,y+140,38,{p:prog(t,at+.6,at+1.4),a:a*.9,col:SOFT,f:'b',w:500}); else math(sub,560,y+144,40,{p:prog(t,at+.6,at+1.4),a:a*.9,col:SOFT});
      if(i<4) arrow(540,y+176,540,y+208,prog(t,at+1.4,at+1.9),WHITE,4); });
    write('أهم خطوة: العلاقة المساعدة قبل الاشتقاق',540,1560,50,{p:prog(t,s+12,s+13.2),a:v,col:ORANGE,glow:8,f:'b'});
    write('فيثاغورس · التشابه · محيط معلوم · معادلة منحنٍ',540,1640,40,{p:prog(t,s+12.8,s+14),a:v*.9,col:SOFT,f:'b',w:500}); }

  /* ---- 6: maximum or minimum? the second derivative ---- */
  if(IN(t,5)){ const [s,e]=SC[5], v=vis(t,s,e+.4);   /* crossfades into the last scene */
    title('عظمى أم صغرى؟',t,5,WHITE,76);
    { const X=x=>540+x*120, Y=y=>760-y*55; curve(x=>4-x*x,-2.1,2.1,X,Y,prog(t,s+.4,s+1.6),ORANGE,v); dot(X(0),Y(4),12,ORANGE,v*clamp((t-s-1.6)/.4));
      math(["f″ < 0"],540,860,76,{p:prog(t,s+1.8,s+2.6),a:v,col:ORANGE,glow:6}); write('نهاية عظمى',540,950,52,{p:prog(t,s+2.4,s+3.2),a:v,f:'b'}); }
    { const X=x=>540+x*120, Y=y=>1330-y*55; curve(x=>x*x-.5,-2.1,2.1,X,Y,prog(t,s+3.4,s+4.6),GREEN,v); dot(X(0),Y(-.5),12,GREEN,v*clamp((t-s-4.6)/.4));
      math(["f″ > 0"],540,1480,76,{p:prog(t,s+4.8,s+5.6),a:v,col:GREEN,glow:6}); write('نهاية صغرى',540,1570,52,{p:prog(t,s+5.4,s+6.2),a:v,f:'b'}); } }

  /* ---- 7: the five steps on the largest box (p.141), then the invitation ---- */
  if(IN(t,6)){ const [s,e]=SC[6], v=vis(t,s,e,.45,.01);
    title('مثال سريع: أكبر صندوق',t,6,ORANGE,66);
    const rows=[['١',['x : ضلع المربع المقطوع']],['٢',['V = x',{s:['(12 − 2x)','2']}]],['٣',['0 < x < 6']],['٤',['V′ = 0  ⇒  x = 2']],['٥',['V = 128 ',{s:['cm','3']}]]];
    rows.forEach(([n,e2],i)=>{ const y=480+i*150, at=s+.8+i*1.5, a=v*clamp((t-at)/.4)*(1-ease((t-(s+9.4))/.5)); if(a<=0) return;
      badge(i+1,930,y-20,34,a,prog(t,at,at+.5)); if(i===0) write('نفرض ⁦x⁩ ضلع المربع المقطوع',520,y,50,{p:prog(t,at+.2,at+1),a,f:'b'}); else math(e2,520,y,66,{p:prog(t,at+.2,at+1),a,col:i===4?ORANGE:WHITE,glow:i===4?8:0}); });
    if(t>s+7.6&&t<s+9.9) ring(520,1060,250,78,prog(t,s+7.6,s+8.4),ORANGE,v*(1-ease((t-(s+9.4))/.5)));
    const fa=v*clamp((t-(s+9.8))/.5);
    if(fa>0){ write('الحل الكامل للأمثلة الستة',540,620,62,{p:prog(t,s+9.8,s+10.8),a:fa,f:'b'});
      write('في حلقتين على يوتيوب',540,720,70,{p:prog(t,s+10.4,s+11.4),a:fa,col:ORANGE,glow:10});
      write('جرّب: جد العدد الذي إذا أضيف إلى مربعه',540,940,50,{p:prog(t,s+11.4,s+12.4),a:fa,f:'b'});
      write('يكون الناتج أصغر ما يمكن (مثال 1 ص 140)',540,1020,50,{p:prog(t,s+12,s+13),a:fa,f:'b'});
      write('اكتب جوابك في التعليقات',540,1150,52,{p:prog(t,s+12.6,s+13.4),a:fa,col:DIM,f:'b'}); } }

  write('NIBOR  /  MOTION',540,1760,40,{a:.85*vis(t,.8,D,.6,.01),col:'#9fd8e0'});
  const r=rng(Math.floor(t*30)+3);
  for(const [x,y,col] of TIPS){ L.save(); L.fillStyle=col; for(let i=0;i<9;i++){ L.globalAlpha=.25+r()*.5; L.beginPath(); L.arc(x+(r()-.5)*26,y+(r()-.5)*26,1+r()*2.6,0,2*PI); L.fill(); } L.globalAlpha=.9; L.shadowColor=col; L.shadowBlur=16; L.beginPath(); L.arc(x,y,4,0,2*PI); L.fill(); L.restore(); }
  L.save(); L.globalCompositeOperation='destination-in'; L.drawImage(grain,0,0); L.restore();
  g.save(); g.filter='blur(7px)'; g.globalAlpha=.35; g.drawImage(layer,0,0); g.restore();
  g.drawImage(layer,0,0);
  const fb=(t-(D-.5))/.5; if(fb>0){ g.fillStyle=`rgba(0,0,0,${clamp(fb)})`; g.fillRect(0,0,W,H); }
}
const NAMES=['السؤال','من الكتاب','الفكرة','خطوات الكتاب','طريقة العمل','عظمى أم صغرى','مثال سريع'];
return {render:frame,D,cues:SC.map((s,i)=>({t:s[0],l:NAMES[i]}))};
};
