'use strict';
/* =====================================================================================
   فيديو يوتيوب (1920×1080): تطبيقات عملية على القيم العظمى أو الصغرى — الحلقة الثانية
   الدرس [3−8] ص 142–147: تذكير بطريقة العمل ← مثال 3 (أكبر مثلث داخل دائرة) ← مثال 5 (دائرة ومربع) ← مثال 6 (أقرب نقطة) ← الخلاصة
   يعتمد tools/video/lib.js فوق v2/reels/chalk.js؛ الإطار عند الزمن t لا يعتمد إلا على t.
   ===================================================================================== */
window.EPISODE=(function(){
const SEG=[]; const add=(name,d,draw)=>SEG.push({name,d,draw});
const sq=s=>({s:[s,'2']}), cb=s=>({s:[s,'3']}), fr=(a,b)=>({f:[a,b]}), rt=e=>({r:e});

/* ---- 0: opening ---- */
add('المقدمة',22,(u,d)=>{
  const c=vis(u,-1,d,.3,.6);
  write('تطبيقات عملية',960,330,120,{p:prog(u,.2,1.6),a:c,glow:10});
  write('على القيم العظمى أو الصغرى',960,465,80,{p:prog(u,1,2.4),a:c,col:ORANGE,glow:10});
  write('الحلقة الثانية: ثلاثة أمثلة… وثلاث علاقات مساعدة',960,600,50,{p:prog(u,2.2,3.6),a:c,f:'b'});
  [['فيثاغورس',1460],['محيط معلوم',960],['معادلة منحنٍ',460]].forEach(([s,x],i)=>{ const at=6+i*1.6; frameBox(x-200,690,x+200,800,prog(u,at,at+.8),c,ORANGE,4); write(s,x,765,52,{p:prog(u,at+.3,at+1.1),a:c,col:ORANGE}); });
  write('الأستاذ فائز الحمداني',960,900,56,{p:prog(u,3.6,4.6),a:c,col:CREAM});
  write('السادس العلمي · الفصل الثالث · الدرس ⁦3−8⁩ · ص ⁦142–147⁩',960,975,38,{p:prog(u,4.2,5.2),a:c,col:DIM,f:'b',w:500});
});

/* ---- 1: reminder of the working method ---- */
const METHOD=[['نفرض','المتغيرات على الرسم'],['الدالة الرئيسية','الكمية المطلوب تعظيمها أو تصغيرها'],['العلاقة المساعدة','قبل الاشتقاق: متغير واحد ومجاله'],['نشتق ونساوي بالصفر','ثم نتحقق ونهمل غير المعقول'],['الجواب بوحدته','cm , cm² , cm³ …']];
const MT=[['نفرض'],['الدالة','الرئيسية'],['العلاقة','المساعدة'],['نشتق ونساوي','بالصفر'],['الجواب','بوحدته']];
add('تذكير: طريقة العمل',40,(u,d)=>{ const v=vis(u,0,d);
  title(u,d,'تذكير: طريقة العمل');
  const at=[1.5,3.5,5.5,7.5,9.5], W0=330, G0=42, y0=300, y1=640;
  METHOD.forEach(([h,s],i)=>{ const x1=1840-i*(W0+G0), x0=x1-W0, cx=(x0+x1)/2, a=v*clamp((u-at[i])/.4); if(a<=0) return;
    const hot=i===2&&u>12;
    L.save(); L.globalAlpha=(hot?.95:.75)*a; L.fillStyle=hot?'#2a3634':'#1d2827'; L.beginPath(); L.roundRect(x0,y0,W0,y1-y0,22); L.fill(); L.restore();
    frameBox(x0,y0,x1,y1,prog(u,at[i],at[i]+.8),a,hot?ORANGE:WHITE,hot?6:3); badge(i+1,cx,y0+62,30,a,prog(u,at[i],at[i]+.6));
    MT[i].forEach((ln,j)=>write(ln,cx,y0+150+j*56,48,{p:prog(u,at[i]+.3,at[i]+1),a,col:hot?ORANGE:WHITE}));
    const lines=/[؀-ۿ]/.test(s)?wrapAr(s,32,290):[s]; lines.forEach((ln,j)=>{ if(/[؀-ۿ]/.test(ln)) write(ln,cx,y0+272+j*44,32,{p:prog(u,at[i]+.7,at[i]+1.5),a:a*.9,col:SOFT,f:'b',w:500}); else math(ln,cx,y0+280,34,{p:prog(u,at[i]+.7,at[i]+1.5),a:a*.9,col:SOFT}); });
    if(i<4){ const ax=x0-6; arrow(ax,(y0+y1)/2,ax-G0+12,(y0+y1)/2,prog(u,at[i+1]-.4,at[i+1]),WHITE,4); } });
  write('في الحلقة الأولى كانت العلاقة المساعدة سهلة أو غير لازمة…',960,760,48,{p:prog(u,12.5,14),a:v*(1-ease((u-21)/.4)),f:'b'});
  write('اليوم هي مفتاح كل مثال',960,850,58,{p:prog(u,15,16.2),a:v*(1-ease((u-21)/.4)),col:ORANGE,glow:8});
  [['مثال 3','فيثاغورس'],['مثال 5','محيط معلوم'],['مثال 6','معادلة منحنٍ']].forEach(([n,s],i)=>{ const x=1500-i*540, at=22+i*3, a=v*clamp((u-at)/.4);
    write(n,x,780,46,{p:prog(u,at,at+.7),a,col:DIM,f:'b',w:500}); write(s,x,860,58,{p:prog(u,at+.3,at+1.2),a,col:ORANGE,glow:6}); });
  write('وفي كل مرة نستعملها قبل الاشتقاق',960,980,48,{p:prog(u,32,33.4),a:v,f:'b'});
});

/* ---- 2: example 3 p.142 — the largest isosceles triangle inside a circle of radius 12 ---- */
const CX=470, CY=580, CS=26, R=12;                        // circle centre, px per cm
const Pc=(X,Y)=>[CX+X*CS, CY-Y*CS];
const halfB=h=>Math.sqrt(Math.max(0,24*h-h*h)), triA=h=>h*halfB(h);
add('مثال 3: أكبر مثلث داخل دائرة',210,(u,d)=>{
  card(u,3,142,'أكبر مثلث داخل دائرة');
  statement(u,'جد بعدي أكبر مثلث متساوي الساقين يمكن أن يوضع داخل دائرة نصف قطرها ⁦12 cm⁩ ثم برهن أن نسبة مساحة المثلث إلى مساحة الدائرة كنسبة ⁦3√3 / 4π⁩',3.4,19,3);
  if(u<18.6) return; const v=vis(u,18.6,d);
  title(u-18.6,d-18.6,'مثال 3 · أكبر مثلث داخل دائرة');
  const h=u<22?14:u<38?(u<30?lerp(14,23,ease((u-22)/8)):lerp(23,5,ease((u-30)/6))):u<40?lerp(5,14,ease((u-38)/2)):u<124?14:u<128?lerp(14,18,ease((u-124)/3)):18;
  const xb=halfB(h), apex=Pc(0,R), bl=Pc(-xb,R-h), br=Pc(xb,R-h), M=Pc(0,R-h), O=Pc(0,0);
  stroke(ellipseP(CX,CY,R*CS,R*CS,0,2*PI,120),prog(u,19,20.5),WHITE,5,{a:v});
  dot(O[0],O[1],7,WHITE,v*clamp((u-20)/.4)); math('O',O[0]-30,O[1]+8,40,{a:v*clamp((u-20)/.4),col:DIM});
  const gl=u>128?vis(u,128,d,.5,.4)*14:0;
  { const a=v*clamp((u-20.6)/.6); L.save(); L.globalAlpha=.22*a; L.fillStyle=BLUE; L.beginPath(); L.moveTo(...apex); L.lineTo(...br); L.lineTo(...bl); L.closePath(); L.fill(); L.restore();
    stroke([apex,br,bl,apex],1,gl>7?'#dff3ff':BLUE,5,{a,glow:gl}); }
  if(u>22&&u<38) math(['A = '+triA(h).toFixed(1)],CX,CY+R*CS+70,50,{a:v,col:BLUE});
  /* labels: h (apex to base), x (half the base), and the right triangle O–M–base end with hypotenuse 12 */
  const la=v*clamp((u-41)/.5)*(1-clamp((u-127)/.5));
  if(la>0){ stroke([apex,M],1,ORANGE,3,{a:la,dash:[10,8]}); math('h',apex[0]-34,(apex[1]+M[1])/2+10,52,{a:la,col:ORANGE});
    stroke([M,br],1,ORANGE,4,{a:la}); math('x',(M[0]+br[0])/2,M[1]+52,52,{a:la,col:ORANGE}); }
  const pv=vis(u,52,90,.4,.5);
  if(pv>0){ const pul=.6+.4*Math.sin(u*5)**2; stroke([O,M,br,O],1,ORANGE,9,{a:v*pv*pul,glow:18});
    math('12',(O[0]+br[0])/2+30,(O[1]+br[1])/2-8,46,{a:v*pv,col:ORANGE}); math(['h − 12'],O[0]-86,(O[1]+M[1])/2+14,40,{a:v*pv,col:ORANGE}); }
  if(u>132){ const a=v*vis(u,132,150,.4,.5); for(const [p,q] of [[apex,bl],[apex,br],[bl,br]]){ const m=[(p[0]+q[0])/2,(p[1]+q[1])/2]; math(['12',rt('3')],m[0]+(m[0]-CX)*.28,m[1]+(m[1]-CY)*.28+14,38,{a,col:ORANGE}); } }
  if(u>176){ const a=v*clamp((u-176)/.5); L.save(); L.globalAlpha=.12*a; L.fillStyle=ORANGE; L.beginPath(); L.arc(CX,CY,R*CS,0,2*PI); L.fill(); L.restore(); }
  const r=derive(u,[
    {at:20.4,s:'نفرض الارتفاع ⁦h⁩ ونصف القاعدة ⁦x⁩ ، فالقاعدة ⁦b = 2x⁩'},
    {at:41,e:['A = ',fr('1','2'),'(b)(h) = ',fr('1','2'),'(2x)(h) = hx']},
    {at:52,e:[sq('x'),' + ',sq('(h − 12)'),' = 144']},
    {at:61,e:[sq('x'),' + ',sq('h'),' − 24h + 144 = 144']},
    {at:69,e:[sq('x'),' = 24h − ',sq('h'),'  ⇒  x = ',rt(['24h − ',sq('h')])]},
    {at:80,e:['A = f(h) = h',rt(['24h − ',sq('h')])],col:ORANGE},
    {at:90,e:['A = ',rt([sq('h'),'(24h − ',sq('h'),')']),' = ',rt(['24',cb('h'),' − ',{s:['h','4']}])]},
    {at:102,e:[fr('dA','dh'),' = ',fr(['72',sq('h'),' − 4',cb('h')],['2',rt(['24',cb('h'),' − ',{s:['h','4']}])]),' = 0']},
    {at:114,e:['4',sq('h'),'(18 − h) = 0   ⇒   h = 18 cm'],col:ORANGE},
    {at:124,e:['x = ',rt(['24(18) − ',sq('18')]),' = ',rt('108'),' = 6',rt('3')]},
    {at:132,e:['b = 2x = 12',rt('3'),' cm'],col:ORANGE},
    {at:150,e:[{sb:['A','1']},' = π',sq('(12)'),' = 144π']},
    {at:158,e:[{sb:['A','2']},' = ',fr('1','2'),'bh = 6',rt('3'),'(18) = 108',rt('3')]},
    {at:167,e:[fr({sb:['A','2']},{sb:['A','1']}),' = ',fr(['108',rt('3')],'144π'),' = ',fr(['3',rt('3')],'4π')],col:ORANGE},
    {at:180,e:[fr(['3',rt('3')],'4π'),' ≈ 0.41'],col:GREEN}],{cx:1400,top:290,gap:116,n:6,sz:56,w:840,a:v});
  if(r.k===13&&u<179) ring(1400,r.ys[13]-18,330,84,prog(u,169.5,170.6),ORANGE,v);
  note(u,[[22,40,'كلما تغيّر الارتفاع تغيّرت القاعدة… والمساحة'],[41,51.6,'الدالة الرئيسية: مساحة المثلث — في متغيرين'],[52,60.6,'العلاقة المساعدة: فيثاغورس في المثلث القائم'],[61,79.6,'نحذف ⁦x⁩ قبل الاشتقاق'],[80,89.6,'متغير واحد ✓ ومجاله ⁦0 < h < 24⁩'],[90,101.6,'لأن ⁦h⁩ موجبة نُدخلها تحت الجذر'],[102,113.6,'كسر = صفر ⇐ البسط = صفر'],[114,123.6,'إشارة ⁦f′⁩ من إشارة ⁦18 − h⁩: موجبة قبل ⁦18⁩ وسالبة بعدها ⇐ عظمى ✓'],[132,149.6,'كل الأضلاع ⁦12√3⁩: المثلث متساوي الأضلاع!'],[150,166.6,'والآن البرهان: مساحة الدائرة ومساحة المثلث'],[180,d,'المثلث الأكبر يشغل نحو ⁦41%⁩ من الدائرة ✓ (و.هـ.م)']],1400,995,40,v);
});

/* ---- 3: example 5 p.145 — a circle and a square with perimeters adding up to 60 cm ---- */
const xr=x=>(30-2*x)/PI, areaSum=x=>x*x+PI*xr(x)**2, XM=60/(PI+4);
add('مثال 5: دائرة ومربع',195,(u,d)=>{
  card(u,5,145,'دائرة ومربع');
  statement(u,'مجموع محيطي دائرة ومربع يساوي ⁦60 cm⁩ أثبت أنه عندما يكون مجموع مساحتي الشكلين أصغر ما يمكن فإن طول قطر الدائرة يساوي طول ضلع المربع.',3.4,17,5);
  if(u<16.6) return; const v=vis(u,16.6,d);
  title(u-16.6,d-16.6,'مثال 5 · دائرة ومربع');
  const x=u<20?6:u<38?(u<27?lerp(6,13.6,ease((u-20)/7)):lerp(13.6,1.5,ease((u-27)/9))):u<40?lerp(1.5,6,ease((u-38)/2)):u<130?6:u<134?lerp(6,XM,ease((u-130)/3)):XM;
  const r=xr(x), K=12, W0=120, Wy=300, cut=W0+4*x*K;
  /* the 60 cm wire: 4x goes to the square, the rest to the circle */
  { const a=v*clamp((u-17.4)/.5); stroke([[W0,Wy],[cut,Wy]],1,ORANGE,7,{a}); stroke([[cut,Wy],[W0+60*K,Wy]],1,BLUE,7,{a}); dot(cut,Wy,9,WHITE,a);
    math('4x',(W0+cut)/2,Wy-26,40,{a,col:ORANGE}); math('2πr',(cut+W0+60*K)/2,Wy-26,40,{a,col:BLUE}); math('60 cm',W0+30*K,Wy+56,38,{a:a*.8,col:DIM}); }
  const S2=13, sx=300, sy=600, ccx=680, a2=v*clamp((u-18)/.6), gl=u>140?vis(u,140,d,.5,.4)*14:0;
  L.save(); L.globalAlpha=.22*a2; L.fillStyle=ORANGE; L.fillRect(sx-x*S2/2,sy-x*S2/2,x*S2,x*S2); L.beginPath(); L.fillStyle=BLUE; L.arc(ccx,sy,r*S2,0,2*PI); L.fill(); L.restore();
  stroke([[sx-x*S2/2,sy-x*S2/2],[sx+x*S2/2,sy-x*S2/2],[sx+x*S2/2,sy+x*S2/2],[sx-x*S2/2,sy+x*S2/2],[sx-x*S2/2,sy-x*S2/2]],1,ORANGE,5,{a:a2,glow:gl});
  stroke(ellipseP(ccx,sy,r*S2,r*S2,0,2*PI,90),1,BLUE,5,{a:a2,glow:gl});
  if(u>40){ const a=v*clamp((u-40)/.5); math('x',sx,sy+x*S2/2+50,46,{a,col:ORANGE}); stroke([[ccx,sy],[ccx+r*S2,sy]],1,BLUE,3,{a}); math('r',ccx+r*S2/2,sy-14,44,{a,col:BLUE}); }
  if(u>140){ const a=v*vis(u,140,d,.5,.4); stroke([[ccx-r*S2,sy+r*S2+24],[ccx+r*S2,sy+r*S2+24]],1,GREEN,4,{a}); stroke([[sx-x*S2/2,sy+x*S2/2+24],[sx+x*S2/2,sy+x*S2/2+24]],1,GREEN,4,{a}); write('القطر = الضلع',490,sy+170,46,{a,col:GREEN,f:'b'}); }
  /* the total area as x changes (a parabola with its lowest point at x = 60/(π+4)) */
  const g=G(130,1000,30,.55), ga=v*clamp((u-20)/.6)*(u>140?.5:1);
  axes(g,0,15.6,0,300,1,ga,'x','A'); plot(g,areaSum,0,15,1,'#9fd8e0',ga,4,90); dot(g.X(x),g.Y(areaSum(x)),10,ORANGE,ga);
  if(u>20&&u<38) math(['A = '+areaSum(x).toFixed(1)],620,960,44,{a:v,col:BLUE});
  const rr=derive(u,[
    {at:18,s:'نفرض ضلع المربع ⁦x⁩ ونصف قطر الدائرة ⁦r⁩'},
    {at:41,e:['A = ',sq('x'),' + π',sq('r')]},
    {at:50,e:['4x + 2πr = 60']},
    {at:60,e:['r = ',fr('1','π'),'(30 − 2x)']},
    {at:70,e:['A = ',sq('x'),' + π',sq(['[',fr('1','π'),'(30 − 2x)]'])]},
    {at:80,e:['A = f(x) = ',sq('x'),' + ',fr('1','π'),'(900 − 120x + 4',sq('x'),')'],col:ORANGE},
    {at:92,e:['f′(x) = 2x + ',fr('1','π'),'(−120 + 8x) = 0']},
    {at:102,e:['πx + 4x − 60 = 0   ⇒   x(π + 4) = 60']},
    {at:111,e:['x = ',fr('60','π + 4')],col:ORANGE},
    {at:120,e:['r = ',fr('1','π'),'(30 − ',fr('120','π + 4'),')  =  ',fr('30','π + 4')]},
    {at:131,e:['x = 2r'],col:ORANGE,sz:72},
    {at:150,e:['f″(x) = 2 + ',fr('8','π'),' > 0'],col:GREEN},
    {at:166,e:['x ≈ 8.40 ,  r ≈ 4.20 ,  2r ≈ 8.40'],col:DIM}],{cx:1400,top:290,gap:114,n:6,sz:56,w:840,a:v});
  if(rr.k===10&&u<149) ring(1400,rr.ys[10]-22,170,74,prog(u,132.5,133.6),ORANGE,v);
  note(u,[[20,40,'كلما كبر المربع صغرت الدائرة… والمساحة الكلية تصغر ثم تكبر'],[41,49.6,'الدالة الرئيسية: مجموع المساحتين — في متغيرين'],[50,59.6,'العلاقة المساعدة: مجموع المحيطين ⁦60⁩'],[60,69.6,'نعبّر عن ⁦r⁩ بدلالة ⁦x⁩'],[70,91.6,'نعوّض قبل الاشتقاق ⇐ متغير واحد، ومجاله ⁦0 < x < 15⁩'],[92,110.6,'نشتق ونساوي بالصفر، ونضرب في ⁦π⁩'],[120,130.6,'نعوّض ⁦x⁩ في ⁦r⁩'],[131,149.6,'ضلع المربع = ضعف نصف القطر = القطر (و.هـ.م)'],[150,165.6,'موجبة ⇐ نهاية صغرى ✓'],[166,d,'فحص بالأرقام: والمحيط ⁦4(8.40) + 2π(4.20) ≈ 60⁩ ✓']],1400,995,40,v);
});

/* ---- 4: example 6 p.146 — the points of y² − x² = 3 nearest to (0, 4) ---- */
const HG=G(470,720,72,72), up=x=>Math.sqrt(3+x*x);
add('مثال 6: أقرب نقطة',185,(u,d)=>{
  card(u,6,146,'أقرب نقطة');
  statement(u,'جد نقطة أو نقاط تنتمي للقطع الزائد ⁦y² − x² = 3⁩ بحيث تكون أقرب ما يمكن للنقطة ⁦(0 , 4)⁩.',3.4,14,6);
  if(u<13.6) return; const v=vis(u,13.6,d);
  title(u-13.6,d-13.6,'مثال 6 · أقرب نقطة');
  const g=HG; axes(g,-4.2,4.2,-3.4,6,prog(u,14.4,15.4),v);
  for(const k of [-2,2]) tick(g,k,k,v*clamp((u-15)/.4));
  plot(g,up,-3.9,3.9,prog(u,15.6,17.4),BLUE,v); plot(g,x=>-up(x),-3.9,3.9,prog(u,15.6,17.4),BLUE,v*.55);
  math([sq('y'),' − ',sq('x'),' = 3'],g.X(2.5),g.Y(5.3),40,{a:v*clamp((u-17.4)/.5),col:BLUE});
  const Q=[g.X(0),g.Y(4)]; dot(...Q,11,ORANGE,v*clamp((u-17.8)/.4)); math('(0 , 4)',Q[0]+90,Q[1]-12,40,{a:v*clamp((u-17.8)/.4),col:ORANGE});
  /* the moving point p on the upper branch and its distance to (0, 4) */
  const px=u<21?2.6:u<38?(u<28?lerp(2.6,-3.2,ease((u-21)/7)):lerp(-3.2,1.6,ease((u-28)/10))):u<118?1.6:u<122?lerp(1.6,1,ease((u-118)/3)):1;
  const P=[g.X(px),g.Y(up(px))], dist=Math.hypot(px,up(px)-4);
  if(u>19){ const a=v*clamp((u-19)/.5); stroke([Q,P],1,ORANGE,4,{a,dash:[12,10]}); dot(...P,11,WHITE,a); math('p',P[0]+30,P[1]+44,44,{a});
    if(u<38) math(['s = '+dist.toFixed(2)],(P[0]+Q[0])/2+70,(P[1]+Q[1])/2,42,{a,col:ORANGE}); }
  if(u>128){ const a=v*clamp((u-128)/.5), P2=[g.X(-1),g.Y(2)]; stroke([Q,P2],1,ORANGE,4,{a,dash:[12,10]}); dot(...P2,11,WHITE,a);
    math('(1 , 2)',P[0]+90,P[1]+20,40,{a,col:GREEN}); math('(−1 , 2)',P2[0]-100,P2[1]+20,40,{a,col:GREEN}); }
  const r=derive(u,[
    {at:19,s:'نفرض ⁦p(x , y)⁩ نقطة على المنحني، فتحقق معادلته'},
    {at:40,e:[sq('x'),' = ',sq('y'),' − 3   …(1)']},
    {at:50,e:['s = ',rt([sq('(x − 0)'),' + ',sq('(y − 4)')])]},
    {at:60,e:['s = ',rt([sq('x'),' + ',sq('y'),' − 8y + 16']),'   …(2)']},
    {at:72,e:['s = f(y) = ',rt(['2',sq('y'),' − 8y + 13'])],col:ORANGE},
    {at:84,e:['f′(y) = ',fr('4y − 8',['2',rt(['2',sq('y'),' − 8y + 13'])]),' = 0']},
    {at:96,e:['4y − 8 = 0   ⇒   y = 2'],col:ORANGE},
    {at:106,e:[sq('x'),' = 4 − 3 = 1   ⇒   x = ±1']},
    {at:117,e:['(1 , 2) ,  (−1 , 2)'],col:ORANGE,sz:66},
    {at:140,e:['s = ',rt('8 − 16 + 13'),' = ',rt('5')],col:GREEN},
    {at:152,e:['4 − 1 = 3  ✓'],col:DIM}],{cx:1400,top:290,gap:116,n:6,sz:56,w:840,a:v});
  if(r.k===8&&u<139) ring(1400,r.ys[8]-20,300,76,prog(u,118.6,119.6),ORANGE,v);
  note(u,[[20,39.6,'كلما تحركت ⁦p⁩ تغيّر بعدها عن ⁦(0 , 4)⁩'],[40,49.6,'العلاقة المساعدة: معادلة المنحني'],[50,71.6,'الدالة الرئيسية: المسافة بين نقطتين'],[72,83.6,'نعوّض (1) في (2) قبل الاشتقاق ⇐ متغير واحد ⁦y⁩'],[84,95.6,'كسر = صفر ⇐ البسط = صفر'],[96,105.6,'إشارة ⁦f′⁩ من إشارة ⁦4y − 8⁩: سالبة قبل ⁦2⁩ وموجبة بعدها ⇐ صغرى ✓'],[106,116.6,'نعوّض في (1)'],[117,139.6,'نقطتان! لأن المنحني متناظر حول محور الصادات'],[140,151.6,'أقصر مسافة'],[152,d,'فحص: النقطتان على المنحني ✓']],1400,995,40,v);
});

/* ---- 5: summary and exercises ---- */
add('الخلاصة',60,(u,d)=>{ const v=vis(u,0,d,.45,.01);
  title(u,d,'الخلاصة');
  const rows=[['مثال 3','فيثاغورس','⁦h = 18 cm⁩ ، ⁦b = 12√3 cm⁩'],['مثال 5','محيط معلوم','القطر = الضلع'],['مثال 6','معادلة المنحني','⁦(1 , 2)⁩ و ⁦(−1 , 2)⁩']];
  write('العلاقة المساعدة',1100,280,40,{p:prog(u,1,1.8),a:v,col:DIM,f:'b',w:500}); write('النتيجة',520,280,40,{p:prog(u,1,1.8),a:v,col:DIM,f:'b',w:500});
  rows.forEach(([n,rel,res],i)=>{ const y=380+i*110, at=2+i*3, a=v*clamp((u-at)/.4); if(a<=0) return;
    write(n,1600,y,52,{p:prog(u,at,at+.7),a,col:ORANGE}); write(rel,1100,y,52,{p:prog(u,at+.4,at+1.2),a}); write(res,520,y,48,{p:prog(u,at+.8,at+1.8),a,col:GREEN,f:'b'}); stroke([[200,y+40],[1720,y+38]],1,WHITE,2,{a:a*.25}); });
  write('العلاقة المساعدة قبل الاشتقاق… هي مفتاح الحل',960,740,54,{p:prog(u,12,13.6),a:v,col:ORANGE,glow:8,f:'b'});
  if(u>20){ const a=v*clamp((u-20)/.5); panel(160,800,1760,1040,a);
    write('تمارين من الكتاب (ص 147): أكبر اسطوانة داخل كرة · أكبر مخروط داخل كرة · علبة بأقل معدن',960,872,40,{p:prog(u,20.4,22.4),a,f:'b'});
    write('اختر واحداً واكتب حلّك في التعليقات · الأستاذ فائز الحمداني',960,970,42,{p:prog(u,24,25.6),a,col:CREAM,f:'b'}); }
});

let acc=0; for(const s of SEG){ s.t0=acc; acc+=s.d; } const D=acc;
const header='الأستاذ فائز الحمداني · تطبيقات عملية على القيم العظمى أو الصغرى · الحلقة الثانية';
return {render:t=>frameAll(SEG,D,header,t),D,chapters:SEG.map(s=>({t:s.t0,l:s.name}))};
})();
