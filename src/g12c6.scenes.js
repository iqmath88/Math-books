/* السادس العلمي · الفصل السادس · الهندسة الفضائية — مشاهد الرسم (إسقاط مائل لأشكال ثلاثية الأبعاد) */
const sq=Math.sqrt, PI=Math.PI, abs=Math.abs, D2R=PI/180;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
const S={};

/* ---------- 3D helpers: x right, y up, z into the page (drawn up-right) ---------- */
const KX=.55, KY=.38;
const P=(A,p)=>[A.X(p[0]+KX*p[2]),A.Y(p[1]+KY*p[2])];
const L3=(A,a,b,col='muted',w=2,dash)=>{ const [x0,y0]=P(A,a),[x1,y1]=P(A,b); A.el('path',{d:`M${x0} ${y0}L${x1} ${y1}`,stroke:A.col[col]||col,'stroke-width':w,'stroke-dasharray':dash,fill:'none','stroke-linecap':'round'},A.G); };
const poly3=(A,pts,col='c',op=.12,stroke)=>{ A.el('path',{d:pts.map((p,i)=>{ const [x,y]=P(A,p); return (i?'L':'M')+x+' '+y; }).join('')+'Z',fill:A.col[col]||col,'fill-opacity':op,stroke:A.col[stroke||col]||col,'stroke-width':1.6},A.G); };
const pt3=(A,p,lab,col='ink2',dx=7,dy=-8,anchor='start')=>{ const [x,y]=P(A,p); A.el('circle',{cx:x,cy:y,r:4.5,fill:A.col[col]||col,stroke:A.col.surf,'stroke-width':1.5},A.G); if(lab) T(A,x+dx,y+dy,lab,col,{anchor,size:13}); };
const add=(a,b,k=1)=>[a[0]+k*b[0],a[1]+k*b[1],a[2]+k*b[2]];
const len=a=>Math.hypot(a[0],a[1],a[2]);
/* angle arc at vertex O between unit directions u and v */
function arc3(A,O,u,v,r,col='f'){ const ang=Math.acos(Math.max(-1,Math.min(1,u[0]*v[0]+u[1]*v[1]+u[2]*v[2]))); let d='';
  for(let i=0;i<=24;i++){ const t=i/24, s1=Math.sin((1-t)*ang)/Math.sin(ang||1e-9), s2=Math.sin(t*ang)/Math.sin(ang||1e-9);
    const q=[O[0]+r*(s1*u[0]+s2*v[0]),O[1]+r*(s1*u[1]+s2*v[1]),O[2]+r*(s1*u[2]+s2*v[2])]; const [x,y]=P(A,q); d+=(i?'L':'M')+x+' '+y; }
  A.el('path',{d,stroke:A.col[col]||col,'stroke-width':2.6,fill:'none'},A.G); }
const unit=a=>{ const l=len(a); return [a[0]/l,a[1]/l,a[2]/l]; };

/* ---------- 6−2 ---------- */
/* dihedral angle (X) − AB − (Y): the edge AB runs into the page; the plane angle CDE is drawn at D */
S.dihed={v:[-5.5,6.5,-1.2,6.2],noaxes:1,title:'الزاوية الزوجية والزاوية العائدة لها',hint:'∠CDE : ضلعاها عموديان على الحرف AB من نقطة D عليه',
 sl:{min:25,max:160,v:65,step:1,play:1,speed:.25,lab:'قياس الزاوية الزوجية',fmt:v=>Math.round(v)+'°'},
 draw(A){ const th=A.p*D2R, R=4.2, Lz=5, u=[1,0,0], v=[Math.cos(th),Math.sin(th),0];
  poly3(A,[[0,0,0],[R,0,0],[R,0,Lz],[0,0,Lz]],'c',.10);
  poly3(A,[[0,0,0],add([0,0,0],v,R),add([0,0,Lz],v,R),[0,0,Lz]],'tan',.14);
  L3(A,[0,0,-.6],[0,0,Lz+.6],'ink2',2.6); pt3(A,[0,0,0],'B','ink2',-8,14,'end'); pt3(A,[0,0,Lz],'A','ink2',-8,-8,'end');
  const D=[0,0,Lz/2]; L3(A,D,add(D,u,2.8),'f',2.6); L3(A,D,add(D,v,2.8),'f',2.6); arc3(A,D,u,v,.9,'f');
  pt3(A,D,'D','f',-8,16,'end'); pt3(A,add(D,u,2.8),'C','f'); pt3(A,add(D,v,2.8),'E','f');
  const [xx,xy]=P(A,[R,0,0]), [yx,yy]=P(A,add([0,0,0],v,R)); T(A,xx+8,xy+4,'(X)','c',{anchor:'start'}); T(A,yx+6,yy-6,'(Y)','tan',{anchor:'start'});
  A.chips.push(['f','∠CDE',Math.round(A.p)+'°'],['c','العلاقة',abs(A.p-90)<1?'(X) ⊥ (Y)':'غير متعامدين']); A.ok=abs(A.p-90)<1; }};
/* example 1: BD ⊥ (ABC), ∠A = 30°, AB = 10 ; BE ⊥ AC ⇒ DE ⊥ AC and ∠DEB is the plane angle of D − AC − B */
S.ex1={v:[-1.5,17,-1.5,11],noaxes:1,title:'مثال 1 : D − AC − B',hint:'BE = AB sin 30° = 5 ، و tan ∠DEB = BD / BE',
 sl:{min:1,max:10,v:5,step:.1,play:1,speed:.2,lab:'طول BD (cm)',fmt:v=>fr(v,1)},
 draw(A){ const s=.75, h=A.p, Aa=[0,0,0], B=[10*s,0,0], dir=[Math.cos(30*D2R),0,Math.sin(30*D2R)], E=add(Aa,dir,10*Math.cos(30*D2R)*s), C=add(Aa,dir,14*s), D=add(B,[0,1,0],h*s);
  poly3(A,[Aa,B,C],'c',.12);
  L3(A,B,D,'tan',2.6); L3(A,D,Aa,'muted',1.4); L3(A,D,C,'muted',1.4); L3(A,B,E,'f',2.2,'5 4'); L3(A,D,E,'f',2.6);
  arc3(A,E,unit([B[0]-E[0],B[1]-E[1],B[2]-E[2]]),unit([D[0]-E[0],D[1]-E[1],D[2]-E[2]]),.8,'f');
  pt3(A,Aa,'A','ink2',-8,6,'end'); pt3(A,B,'B','ink2',8,12); pt3(A,C,'C','ink2'); pt3(A,D,'D','tan'); pt3(A,E,'E','f',-8,14,'end');
  const ang=Math.atan(h/5)/D2R; A.chips.push(['f','BE','5 cm'],['tan','BD',fr(h,1)+' cm'],['f','∠DEB',fr(ang,1)+'°']); A.ok=abs(h-5)<.05; }};

/* ---------- 6−3 ---------- */
/* projection of an inclined segment: BC = AB cos θ */
S.proj={v:[-1,9.5,-1.3,6.5],noaxes:1,title:'طول المسقط = طول المائل × جيب تمام زاوية الميل',hint:'AC ⊥ (X) ، و BC مسقط AB على (X)',
 sl:{min:5,max:85,v:40,step:1,play:1,speed:.22,lab:'زاوية الميل θ',fmt:v=>Math.round(v)+'°'},
 draw(A){ const th=A.p*D2R, L=6, B=[1,0,1.5], dir=[Math.cos(th),Math.sin(th),0], Aa=add(B,dir,L), C=[Aa[0],0,Aa[2]];
  poly3(A,[[-.5,0,0],[8.5,0,0],[8.5,0,4],[-.5,0,4]],'c',.08);
  L3(A,B,Aa,'f',3); L3(A,Aa,C,'tan',2,'5 4'); L3(A,B,C,'c',3);
  arc3(A,B,[1,0,0],dir,1,'f');
  pt3(A,B,'B','ink2',-8,14,'end'); pt3(A,Aa,'A','f'); pt3(A,C,'C','c',8,14);
  A.chips.push(['f','AB',fr(L,2)],['muted','θ',Math.round(A.p)+'°'],['c','BC = AB cos θ',fr(L*Math.cos(th),2)]); }};
/* example 4: triangle ABC hinged on BC ⊂ (X); its projection BCD has area = area ABC × cos θ */
S.ex4={v:[-7,9,-1.5,12],noaxes:1,title:'مساحة المسقط = مساحة المنطقة المائلة × cos θ',hint:'θ قياس الزاوية الزوجية (ABC) − BC − (X)',
 sl:{min:0,max:90,v:60,step:1,play:1,speed:.22,lab:'θ',fmt:v=>Math.round(v)+'°'},
 draw(A){ const th=A.p*D2R, s=.5, B=[-5*s,0,0], C=[5*s,0,0], E=[0,0,0], Aa=[0,12*s*Math.sin(th),12*s*Math.cos(th)], D=[0,0,12*s*Math.cos(th)];
  poly3(A,[[-7,0,-1],[7,0,-1],[7,0,9],[-7,0,9]],'c',.06);
  poly3(A,[B,C,D],'c',.25); poly3(A,[B,C,Aa],'f',.15);
  L3(A,Aa,D,'tan',2,'5 4'); L3(A,E,Aa,'f',1.6); L3(A,E,D,'c',1.6);
  pt3(A,B,'B','ink2',-8,14,'end'); pt3(A,C,'C','ink2',8,14); pt3(A,Aa,'A','f'); pt3(A,D,'D','c',8,12); pt3(A,E,'E','ink2',-6,14,'end');
  A.chips.push(['f','مساحة ABC','60'],['muted','θ',Math.round(A.p)+'°'],['c','مساحة BCD',fr(60*Math.cos(th),2)]); A.ok=abs(A.p-60)<.5; }};
