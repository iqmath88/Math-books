/* الخامس العلمي · الفصل الثالث · القطوع المخروطية */
const sq=Math.sqrt, PI=Math.PI, abs=Math.abs;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
const S={};
/* side view of a double cone cut by a plane */
S.cone={title:'مستوٍ يقطع مخروطاً مزدوجاً',hint:'غيّر ميل المستوي وراقب نوع المقطع',sl:{min:0,max:90,v:0,lab:'ميل المستوي',fmt:v=>Math.round(v)+'°',step:1},
 draw(A){ const W=A.W, H=A.H, c=A.col, s=Math.min(W*.5,H)/7.2, ox=W>560?W*.36:W*.5, oy=H*.5, X=x=>ox+x*s, Y=y=>oy-y*s, g=PI/6, h=3.2, a=h*Math.tan(g);
  const ph=A.p*PI/180, gen=90-30; let type, col;
  if(A.p<.5){ type='دائرة'; col=c.f; } else if(A.p<gen-.5){ type='قطع ناقص'; col=c.int; } else if(A.p<=gen+.5){ type='قطع مكافئ'; col=c.chord; } else { type='قطع زائد'; col=c.tan; }
  A.el('path',{d:`M${X(-a)} ${Y(h)}L${X(a)} ${Y(-h)}M${X(a)} ${Y(h)}L${X(-a)} ${Y(-h)}`,stroke:c.ink2,'stroke-width':2});
  A.el('ellipse',{cx:X(0),cy:Y(h),rx:a*s,ry:a*s*.18,fill:'none',stroke:c.ink2,'stroke-width':1.6});
  A.el('ellipse',{cx:X(0),cy:Y(-h),rx:a*s,ry:a*s*.18,fill:'none',stroke:c.ink2,'stroke-width':1.6});
  A.el('path',{d:`M${X(0)} ${Y(h+.5)}V${Y(-h-.5)}`,stroke:c.muted,'stroke-width':1.2,'stroke-dasharray':'6 5'}); T(A,X(0)+8,Y(h+.45),'L','muted',{anchor:'start'});
  A.el('circle',{cx:X(0),cy:Y(0),r:4,fill:c.ink2}); T(A,X(0)-10,Y(0),'C','ink2',{anchor:'end'});
  /* plane through (0,1.6) with slope tan(ph) */
  const y0=1.6, m=Math.tan(ph), L=4.2; let d;
  if(A.p>89.5) d=`M${X(.9)} ${Y(h+.6)}V${Y(-h-.6)}`; else { const dx=L*Math.cos(ph), dy=L*Math.sin(ph); d=`M${X(-dx)} ${Y(y0-dy)}L${X(dx)} ${Y(y0+dy)}`; }
  A.el('path',{d,stroke:col,'stroke-width':5,'stroke-linecap':'round',opacity:.85});
  /* inset: the section */
  const bx=W>560?W*.72:W*.5, by=W>560?H*.5:H*.83, R=Math.min(W,H)*(W>560?.16:.11);
  A.el('rect',{x:bx-R*1.4,y:by-R*1.2,width:R*2.8,height:R*2.4,rx:12,fill:c.surf2,stroke:c.line});
  let pd='';
  if(type==='دائرة') A.el('circle',{cx:bx,cy:by,r:R*.8,fill:'none',stroke:col,'stroke-width':3});
  else if(type==='قطع ناقص'){ const e=1/Math.cos(ph); A.el('ellipse',{cx:bx,cy:by,rx:Math.min(R*1.25,R*.8*e),ry:R*.8,fill:'none',stroke:col,'stroke-width':3}); }
  else if(type==='قطع مكافئ'){ for(let i=-30;i<=30;i++){ const t=i/30; pd+=(i>-30?'L':'M')+(bx-R*1.1+R*1.8*t*t)+' '+(by+R*.95*t); } A.el('path',{d:pd,fill:'none',stroke:col,'stroke-width':3}); }
  else { [1,-1].forEach(sg=>{ let q=''; for(let i=-30;i<=30;i++){ const t=i/30*1.3; q+=(i>-30?'L':'M')+(bx+sg*R*.35*Math.cosh(t))+' '+(by+R*.55*Math.sinh(t)); } A.el('path',{d:q,fill:'none',stroke:col,'stroke-width':3}); }); }
  A.lab(bx,by-R*1.2-12,type,{fill:col,w:700,size:15});
  A.chips.push(['f','المقطع',type]); }};
/* a circle: centre, radius and a point P on it */
S.circ={v:[-3,7,-3,5.5],eq:1,title:'الدائرة: بعد ثابت عن المركز',hint:'كل نقطة P على الدائرة بعدها عن C يساوي r',sl:{min:.6,max:3.4,v:2.5,lab:'نصف القطر r',fmt:v=>fr(v,1)},
 draw(A){ const h=2, k=1, r=A.p, t=(A.t*.5)%(2*PI), x=h+r*Math.cos(t), y=k+r*Math.sin(t), G=A.G, c=A.col;
  A.el('circle',{cx:A.X(h),cy:A.Y(k),r:abs(A.X(h+r)-A.X(h)),fill:'none',stroke:c.f,'stroke-width':3},G);
  A.el('path',{d:`M${A.X(h)} ${A.Y(k)}L${A.X(x)} ${A.Y(y)}`,stroke:c.chord,'stroke-width':2.6},G);
  A.el('circle',{cx:A.X(h),cy:A.Y(k),r:6,fill:c.c},G); T(A,A.X(h)-10,A.Y(k)+14,'C(h , k)','c',{size:12});
  A.el('circle',{cx:A.X(x),cy:A.Y(y),r:6.5,fill:c.tan,stroke:c.surf,'stroke-width':2},G); T(A,A.X(x)+12,A.Y(y)-10,'P(x , y)','tan',{size:12,anchor:'start'});
  T(A,(A.X(h)+A.X(x))/2+8,(A.Y(k)+A.Y(y))/2-8,'r','chord');
  A.chips.push(['chord','r',fr(r,1)],['tan','pc',fr(sq((x-h)**2+(y-k)**2),2)]); },anim:1};
S.std={v:[-4,8,-4.5,4],eq:1,title:'(x − 5)² + (y + 3)² = 49 ؟',hint:'المركز (h , k) ونصف القطر r',spec:{C:[[2,0,3]],Pt:[[2,0,'C(h , k)','c-center']],S:[[2,0,5,0,'c-radius',0,'r']]}};
S.law4={v:[-1,7,-1,6],eq:1,title:'قوانين البعد والتنصيف',hint:'البعد بين نقطتين ، ونقطة التنصيف',spec:{S:[[1,1,5,4,'c-radius',0,'p₁p₂']],Pt:[[1,1,'p₁(x₁ , y₁)','c-point'],[5,4,'p₂(x₂ , y₂)','c-point'],[3,2.5,'منتصف','c-center']]}};
S.axes={v:[-6,6,-6,6],eq:1,title:'دوائر تمس المحورين',hint:'r = |h| = |k|',spec:{C:[[3,3,3,'c-std'],[-3,3,3,'c-gen'],[-3,-3,3,'c-point'],[3,-3,3,'c-cut']],Pt:[[3,3,'(r , r)','c-std'],[-3,3,'(−r , r)','c-gen'],[-3,-3,'(−r , −r)','c-point'],[3,-3,'(r , −r)','c-cut']]}};
S.axTouch={v:[-1.5,7,-1.5,5],eq:1,title:'تمسّ محور السينات',hint:'r = |k| ، نقطة التماس (h , 0)',spec:{C:[[3,2,2]],Pt:[[3,2,'(3 , 2)','c-center'],[3,0,'(h , 0)','c-point']],S:[[3,2,3,0,'c-radius',0,'r = |k|']]}};
S.genL={v:[-7,3,-2,6],eq:1,title:'x² + y² + Ax + By + C = 0',hint:'h = −A/2 ، k = −B/2 ، r = √(h² + k² − C)',spec:{C:[[-3,2,sq(10)]],Pt:[[-3,2,'(−A/2 , −B/2)','c-center']]}};
S.cond={v:[-1,7,-1,6],eq:1,title:'دائرة تحقق شروطاً',hint:'قد يكون للمسألة حلّان',spec:{C:[[5,5,5,'c-std'],[1,1,1,'c-gen']],Pt:[[2,1,'p(2 , 1)','c-point']]}};
S.tanL={v:[-4,5,-3.5,4],eq:1,title:'المماس عمود على نصف القطر',hint:'m₁ × m₂ = −1',sl:{min:-3,max:3,v:1.1,lab:'موضع نقطة التماس',fmt:v=>fr(v,2)},
 draw(A){ const r=sq(5), t=A.p, x=r*Math.cos(t), y=r*Math.sin(t), G=A.G, c=A.col, m1=y/x, m2=-x/y;
  A.el('circle',{cx:A.X(0),cy:A.Y(0),r:abs(A.X(r)-A.X(0)),fill:'none',stroke:c.f,'stroke-width':3},G);
  A.el('path',{d:`M${A.X(0)} ${A.Y(0)}L${A.X(x)} ${A.Y(y)}`,stroke:c.chord,'stroke-width':2.6},G);
  const L=8, dx=-Math.sin(t)*L, dy=Math.cos(t)*L; A.el('path',{d:`M${A.X(x-dx)} ${A.Y(y-dy)}L${A.X(x+dx)} ${A.Y(y+dy)}`,stroke:c.tan,'stroke-width':2.6},G);
  const u=.32, ux=Math.cos(t)*u, uy=Math.sin(t)*u, vx=-Math.sin(t)*u, vy=Math.cos(t)*u;
  A.el('path',{d:`M${A.X(x-ux)} ${A.Y(y-uy)}L${A.X(x-ux+vx)} ${A.Y(y-uy+vy)}L${A.X(x+vx)} ${A.Y(y+vy)}`,fill:'none',stroke:c.ink2,'stroke-width':1.5},G);
  A.el('circle',{cx:A.X(0),cy:A.Y(0),r:5,fill:c.c},G); A.el('circle',{cx:A.X(x),cy:A.Y(y),r:6.5,fill:c.c,stroke:c.surf,'stroke-width':2},G);
  A.chips.push(['chord','m₁',fr(m1)],['tan','m₂',fr(m2)],['c','m₁ × m₂',abs(x)<1e-3||abs(y)<1e-3?'—':fr(m1*m2)]); }};
/* exercises: blank grid until the solution is shown */
const blank=(v,t)=>({v,eq:1,title:t,hint:'حلّ في دفترك ثم أظهر الحل'});
S.x1=blank([-6,4,-2,8],'تمرين 1'); S.x1ok={v:[-8,4,-3,9],eq:1,title:'تمرين 1 · b',spec:{C:[[-2,3,5]],Pt:[[-2,3,'C(−2 , 3)','c-center']],S:[[-2,3,3,3,'c-radius',0,'r = 5']]}};
S.x2=blank([-7,9,-8,9],'تمرين 2'); S.x2ok={v:[-7,9,-8,9],eq:1,title:'تمرين 2',spec:{C:[[3,-2,5,'c-std'],[0,0,5,'c-gen'],[-1,5,sq(29),'c-point']],Pt:[[3,-2,'أ','c-std'],[0,0,'ب','c-gen'],[-1,5,'ج','c-point']]}};
S.x3=blank([-1,7,-5,3],'تمرين 3'); S.x3ok={v:[-1,7,-5,3],eq:1,title:'تمرين 3',spec:{C:[[3,-1,sq(5)]],S:[[2,-3,4,1,'c-radius',0,'']],Pt:[[2,-3,'p₁','c-point'],[4,1,'p₂','c-point'],[3,-1,'C(3 , −1)','c-center']]}};
S.x4=blank([-12,5,-3,11],'تمرين 4'); S.x4ok={v:[-12,6,-4,11],eq:1,title:'تمرين 4',spec:{C:[[-5,4,6,'c-std'],[2,0,3,'c-gen'],[-.75,-1,1.25,'c-point']],Pt:[[-5,4,'a','c-std'],[2,0,'b','c-gen'],[-.75,-1,'c','c-point']]}};
S.x5=blank([-10,6,-11,6],'تمرين 5'); S.x5ok={v:[-10,6,-11,6],eq:1,title:'تمرين 5',spec:{C:[[-2,-3,7]],L:[[0,1,-4,'c-cut']],Pt:[[-2,-3,'c(−2 , −3)','c-center'],[-2,4,'','c-point']]}};
S.x6=blank([-7,7,-1,7],'تمرين 6'); S.x6ok={v:[-7,7,-1,7],eq:1,title:'تمرين 6',spec:{C:[[3,3,3,'c-std'],[-3,3,3,'c-gen']],L:[[0,1,-6,'c-cut']]}};
S.x7=blank([-32,4,-4,32],'تمرين 7'); S.x7ok={v:[-32,4,-4,32],eq:1,title:'تمرين 7',spec:{C:[[-3,3,3,'c-std'],[-15,15,15,'c-gen']],Pt:[[-3,6,'(−3 , 6)','c-point']]}};
S.x8=blank([-12,12,-12,12],'تمرين 8'); S.x8ok={v:[-12,12,-12,12],eq:1,title:'تمرين 8',spec:{C:[[-5,5,5,'c-std'],[5,-5,5,'c-gen'],[5,5,5,'c-point']]}};
S.x9=blank([-4,8,-8,2],'تمرين 9'); S.x9ok={v:[-4,8,-8,2],eq:1,title:'تمرين 9',spec:{C:[[2,-3,4]],Pt:[[2,-3,'c(2 , −3)','c-center']]}};
S.x10=blank([1,7,-2.5,2.5],'تمرين 10'); S.x10ok={v:[1,7,-2.5,2.5],eq:1,title:'تمرين 10',spec:{C:[[4,0,sq(2)]],Pt:[[3,-1,'p₁','c-point'],[5,1,'p₂','c-point'],[4,0,'C(4 , 0)','c-center']]}};
S.x11=blank([-2,6,-2,6],'تمرين 11'); S.x11ok={v:[-2,6,-2,6],eq:1,title:'تمرين 11',spec:{C:[[2,2,sq(5)]],Pt:[[1,0,'p₁','c-point'],[0,1,'p₂','c-point'],[3,4,'p₃','c-point'],[2,2,'(2 , 2)','c-center']]}};
S.x12=blank([-1,7,-2,5],'تمرين 12'); S.x12ok={v:[-1,7,-2,5],eq:1,title:'تمرين 12',spec:{C:[[3,2,sq(5)]],L:[[2,1,-3,'c-cut']],S:[[3,2,1,1,'c-radius']],Pt:[[1,1,'p(1 , 1)','c-point'],[3,2,'(3 , 2)','c-center']]}};
//@WX
