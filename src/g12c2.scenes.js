/* السادس العلمي · الفصل الثاني · القطوع المخروطية — مشاهد الرسم */
const sq=Math.sqrt, PI=Math.PI, abs=Math.abs;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
const S={};

/* ---------- helpers ---------- */
const dot=(A,x,y,col='c',r=6)=>A.el('circle',{cx:A.X(x),cy:A.Y(y),r,fill:A.col[col]||col,stroke:A.col.surf,'stroke-width':2},A.G);
const seg=(A,x0,y0,x1,y1,col='muted',w=2,dash)=>A.el('path',{d:`M${A.X(x0)} ${A.Y(y0)}L${A.X(x1)} ${A.Y(y1)}`,stroke:A.col[col]||col,'stroke-width':w,'stroke-dasharray':dash,fill:'none'},A.G);
/* parametric curve; breaks the path where a point is missing (null) */
function pcurve(A,fn,t0,t1,col='f',w=2.8,n=240,dash){ let d='',pen=false;
  for(let i=0;i<=n;i++){ const p=fn(t0+(t1-t0)*i/n); if(!p||!isFinite(p[0])||!isFinite(p[1])){ pen=false; continue; }
    d+=(pen?'L':'M')+A.X(p[0]).toFixed(1)+' '+A.Y(p[1]).toFixed(1); pen=true; }
  A.el('path',{d,stroke:A.col[col]||col,'stroke-width':w,fill:'none','stroke-dasharray':dash,'stroke-linejoin':'round'},A.G); }
const vline=(A,x,col='tan',lab)=>{ seg(A,x,A.V.y0,x,A.V.y1,col,2,'7 5'); if(lab) T(A,A.X(x)+6,A.Y(A.V.y1)+16,lab,col,{anchor:'start',size:12}); };
const hline=(A,y,col='tan',lab)=>{ seg(A,A.V.x0,y,A.V.x1,y,col,2,'7 5'); if(lab) T(A,A.X(A.V.x1)-6,A.Y(y)-8,lab,col,{anchor:'end',size:12}); };
const ptl=(A,x,y,lab,col='c',dx=8,dy=-10,anchor='start')=>{ dot(A,x,y,col,5.5); T(A,A.X(x)+dx,A.Y(y)+dy,lab,col,{anchor,size:12.5}); };

/* ---------- 2−1 ---------- */
/* focus–directrix definition: points whose distance to F is e times their distance to D */
S.ecc={v:[-5,9,-5.5,5.5],eq:1,title:'القطع المخروطي: MF = e · MQ',hint:'e = 1 مكافئ ، e < 1 ناقص ، e > 1 زائد',
 sl:{min:.3,max:2,v:1,step:.01,play:1,speed:.12,lab:'الاختلاف المركزي e',fmt:v=>fr(v,2)},
 draw(A){ const e=A.p, d=2; vline(A,-d,'tan','الدليل D'); ptl(A,0,0,'F','c',8,18);
  pcurve(A,t=>{ const den=1-e*Math.cos(t); if(den<=.02) return null; const r=e*d/den; if(r>40) return null; return [r*Math.cos(t),r*Math.sin(t)]; },0.0001,2*PI-0.0001,'f',3,600);
  /* a sample point and its two distances */
  const t=2.2, r=e*d/(1-e*Math.cos(t)), mx=r*Math.cos(t), my=r*Math.sin(t);
  if(r<30){ seg(A,0,0,mx,my,'c',1.6,'4 4'); seg(A,mx,my,-d,my,'tan',1.6,'4 4'); dot(A,mx,my,'f',6); T(A,A.X(mx)-8,A.Y(my)-10,'M','f',{anchor:'end'});
    A.chips.push(['c','MF',fr(r,2)],['tan','MQ',fr(abs(mx+d),2)]); }
  A.chips.push(['f','النوع',abs(e-1)<.015?'مكافئ':e<1?'ناقص':'زائد']); }};

/* ---------- 2−2 ---------- */
/* parabola y² = 4px : every point is as far from the focus as from the directrix */
S.parab={v:[-4,7,-5.2,5.2],eq:1,title:'القطع المكافئ y² = 4px : MF = MQ',hint:'حرّك النقطة M على المنحني',
 sl:{min:-4.6,max:4.6,v:2.8,step:.01,play:1,speed:.25,lab:'موضع M',fmt:v=>''},
 draw(A){ const p=1.5, y=A.p, x=y*y/(4*p);
  vline(A,-p,'tan','x = −p'); pcurve(A,t=>[t*t/(4*p),t],-5.2,5.2,'f',3);
  ptl(A,p,0,'F(p , 0)','c',6,18); dot(A,0,0,'ink2',4);
  seg(A,x,y,p,0,'c',2,'5 4'); seg(A,x,y,-p,y,'tan',2,'5 4'); dot(A,-p,y,'tan',5); dot(A,x,y,'f',7);
  T(A,A.X(x)+8,A.Y(y)-10,'M','f',{anchor:'start'}); T(A,A.X(-p)-8,A.Y(y)-8,'Q','tan',{anchor:'end'});
  A.chips.push(['c','MF',fr(Math.hypot(x-p,y),2)],['tan','MQ',fr(x+p,2)],['f','M',`(${fr(x,2)} , ${fr(y,2)})`]); }};
/* the four standard parabolas with vertex at the origin (table p.57) */
const PO=[['x² = 4py','نحو الأعلى',0],['x² = −4py','نحو الأسفل',1],['y² = 4px','نحو اليمين',2],['y² = −4px','نحو اليسار',3]];
S.porient={v:[-5,5,-4.2,4.2],eq:1,title:'المعادلات القياسية الأربع (الرأس في نقطة الأصل)',hint:'المتغير المربّع يحدد المحور العمودي على المحور، وإشارة p تحدد الاتجاه',
 sl:{min:0,max:3,v:0,step:1,play:1,speed:.35,lab:'المعادلة',fmt:v=>PO[Math.round(v)][0]},
 draw(A){ const k=Math.round(A.p), p=1;
  const C=[t=>[t,t*t/(4*p)],t=>[t,-t*t/(4*p)],t=>[t*t/(4*p),t],t=>[-t*t/(4*p),t]][k];
  pcurve(A,C,-4.4,4.4,'f',3);
  const F=[[0,p],[0,-p],[p,0],[-p,0]][k]; ptl(A,F[0],F[1],'F','c',8,-8);
  if(k<2) hline(A,k?p:-p,'tan',k?'y = p':'y = −p'); else vline(A,k===2?-p:p,'tan',k===2?'x = −p':'x = p');
  A.chips.push(['f','المعادلة',PO[k][0]],['c','البؤرة',['(0 , p)','(0 , −p)','(p , 0)','(−p , 0)'][k]],['tan','الفتحة',PO[k][1]]); }};

/* ---------- 2−3 ---------- */
/* translating the axes: the parabola x² = y slides so that its vertex moves from (0,0) to (h,k) = (−2,−4) (example 10) */
S.ptrans={v:[-6,3,-5.5,4.5],eq:1,title:'انسحاب المحاور: الرأس ينتقل إلى (h , k)',hint:'كل مكوّن ينسحب بالمقدار نفسه: الرأس والبؤرة والدليل والمحور',
 sl:{min:0,max:1,v:1,step:.01,play:1,speed:.25,lab:'الانسحاب',fmt:v=>Math.round(v*100)+'%'},
 draw(A){ const t=A.p, h=-2*t, k=-4*t, p=.25;
  pcurve(A,u=>[h+u,k+u*u/(4*p)],-3.2,3.2,'muted',1.4,200,'4 5');
  pcurve(A,u=>[u,u*u/(4*p)],-2.2,2.2,'muted',1.2,120,'2 6');
  pcurve(A,u=>[h+u,k+u*u/(4*p)],-3.2,3.2,'f',3);
  hline(A,k-p,'tan','الدليل'); seg(A,h,A.V.y0,h,A.V.y1,'c',1.3,'3 5');
  ptl(A,h,k,'(h , k)','f',10,14); ptl(A,h,k+p,'F','c',10,-6);
  A.chips.push(['f','الرأس',`(${fr(h,2)} , ${fr(k,2)})`],['c','البؤرة',`(${fr(h,2)} , ${fr(k+p,2)})`],['tan','الدليل','y = '+fr(k-p,2)]); }};
