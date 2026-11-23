/* Mathematical correctness of the interactive scenes (no browser).
   1) sweep: every scene with its own drawing code, at 13 slider positions × every mode → no exception, no NaN/undefined in chips, labels or SVG.
   2) maths: key scenes are swept along their slider and the values they display are compared with an independent calculation
      written from the book's equations, and with the book's answer at the book's point.
   usage: node tests/scenes-math.test.cjs */
const H=require('./scenes-harness.cjs'), fs=require('fs'), path=require('path');
const B={}; const book=id=>B[id]||(B[id]=H.loadBook(id));
let pass=0, fail=0; const bad=[];
const ok=(c,msg)=>{ if(c) pass++; else { fail++; bad.push(msg); } };
/* chip value → number ('−0.1' , '50/3 km/h' , '5 − 1 = 4' → last number) */
const N=s=>{ s=String(s).replace(/−/g,'-'); if(/=/.test(s)) s=s.split('=').pop(); const f=s.match(/(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/); if(f) return +f[1]/+f[2]; const m=s.match(/-?\d+(?:\.\d+)?/); return m?+m[0]:NaN; };
const P2=s=>{ const m=String(s).replace(/−/g,'-').match(/-?\d+(?:\.\d+)?/g); return m?m.map(Number):[]; };
/* complex 'a + bi' / '−2 − 17i' / '3 + 1i' / '−9' */
const CX=s=>{ s=String(s).replace(/−/g,'-').replace(/\s+/g,''); if(!s.endsWith('i')) return [+s,0]; const body=s.slice(0,-1);
  let j=-1; for(let i=body.length-1;i>0;i--) if(body[i]==='+'||body[i]==='-'){ j=i; break; }
  const re=j>0?+body.slice(0,j):0, t=j>0?body.slice(j):body, im=t===''||t==='+'?1:t==='-'?-1:+t; return [re,im]; };
const near=(a,b,tol)=>Math.abs(a-b)<=(tol??Math.max(.006,Math.abs(b)*.006));
const range=(sc,n=11)=>Array.from({length:n},(_,i)=>sc.sl.min+(sc.sl.max-sc.sl.min)*i/(n-1));
const RUN=(id,name,o)=>H.run(book(id).S[name],Object.assign({B:book(id)},o||{}));
/* sweep a scene; fn(chips,p) returns [[label, got, want, tol?], …] */
function sweep(id,name,fn,o={}){ const sc=book(id).S[name]; if(!sc){ ok(false,`${id}/${name}: scene missing`); return; }
  for(const p of (o.ps||range(sc))){ const r=RUN(id,name,{p,m:o.m,q:o.q}); let rows; try{ rows=fn(r.chips,p,r); }catch(e){ ok(false,`${id}/${name} p=${p}: ${e.message}`); continue; }
    for(const [l,got,want,tol] of rows) ok(near(got,want,tol),`${id}/${name} p=${+p.toFixed(3)}${o.m!=null?' m='+o.m:''}: ${l} = ${got} , expected ${+want.toFixed(4)}`); } }
/* the book's answer at the book's point */
function at(id,name,p,label,want,tol){ const r=RUN(id,name,{p}); ok(near(N(r.chips[label]),want,tol),`${id}/${name} (book point p=${p}): ${label} = ${r.chips[label]} , book answer ${+want.toFixed(4)}`); }

/* ===================== 1) sweep all scenes ===================== */
const ids=fs.readdirSync(path.join(__dirname,'..','v2')).filter(f=>/^(g12c\d|g9c\d|ch\d)\.js$/.test(f)).map(f=>f.slice(0,-3));
let runs=0;
for(const id of ids) for(const [name,sc] of Object.entries(book(id).S)){ if(!sc||typeof sc.draw!=='function') continue;
  const ps=sc.sl?Array.from({length:13},(_,i)=>sc.sl.min+(sc.sl.max-sc.sl.min)*i/12):[undefined], ms=sc.modes?sc.modes.opts.map((_,i)=>i):[undefined];
  const qs=sc.drag2?(()=>{ const out=[undefined]; for(const m of ms){ const b=typeof sc.drag2.box==='function'?sc.drag2.box(m||0):sc.drag2.box; if(b) out.push({x:b[0],y:b[2]},{x:b[1],y:b[3]},{x:0,y:0}); } return out; })():[undefined];
  for(const m of ms) for(const q of qs) for(const p of ps){ runs++; const where=`${id}/${name} p=${p==null?'-':+p.toFixed(3)}${m!=null?' m='+m:''}${q?' q='+q.x+','+q.y:''}`;
    try{ const r=H.run(sc,{p,m,q,B:book(id)});
      for(const [l,v] of Object.entries(r.chips)) ok(!/NaN|undefined|Infinity|null|\[object/.test(String(v)),`${where}: chip ${l} = ${v}`);
      for(const L of r.A.labs) ok(!/NaN|undefined/.test(L.s),`${where}: label ${L.s}`);
      for(const e of r.A.els){ const a=e.attrs||{}; ok(!/NaN/.test(String(a.d||''))&&!['cx','cy','r','x','y'].some(k=>Number.isNaN(a[k])),`${where}: NaN in <${e.tag}>`); }
    }catch(e){ ok(false,`${where}: throws ${e.message}`); } } }

/* ===================== 2) maths ===================== */
/* --- 3: related rates --- */
sweep('g12c3','rIntro',(c)=>{ const x=N(c.x), y=N(c.y), vx=N(c['dx/dt']), vy=N(c['dy/dt']);
  return [['(x+3)² + (y−2)²',(x+3)**2+(y-2)**2,13,.12],['(x+3)·dx/dt + (y−2)·dy/dt (implicit derivative)',(x+3)*vx+(y-2)*vy,0,.1]]; });
for(const n of ['rTank','rTank1','rTank2','rTank3','rTank4']) sweep('g12c3',n,c=>[['V = 4h',N(c['V = 4h']),4*N(c.h)],['dh/dt = (dV/dt)/4',N(c['dh/dt']),N(c['dV/dt'])/4]]);
at('g12c3','rTank',2.2,'dh/dt',-.1);
for(const n of ['rPlate','rPlate1']) sweep('g12c3',n,(c,x)=>[['dy/dt = −(96/x²)·dx/dt',N(c['dy/dt']),-(96/x**2)*2]]);
at('g12c3','rPlate',12,'dy/dt',-4/3);
sweep('g12c3','rIce',(c,x)=>[['V = (8+2x)³ − 8³',N(c.V),(8+2*x)**3-512,.6],['dx/dt = (dV/dt)/(6(8+2x)²)',N(c['dx/dt']),-6/(6*(8+2*x)**2)]]);
at('g12c3','rIce',1,'dx/dt',-.01,.0006);
sweep('g12c3','rLadder',(c,x)=>{ const y=Math.sqrt(100-x*x); return [['y = √(100 − x²)',N(c.y),y],['dy/dt = −(x/y)·2',N(c['dy/dt']),-2*x/y],['dθ/dt = −2/y',N(c['dθ/dt']),-2/y]]; });
at('g12c3','rLadder',8,'dy/dt',-8/3); at('g12c3','rLad60',5,'dy/dt',-2/Math.sqrt(3));
/* v1.78: the three reference scenes — every view, the goal of each figure task, and the live rows of the equation card */
for(const m of [0,1,2]){ sweep('g12c3','rIce',(c,x)=>[['V',N(c.V),(8+2*x)**3-512,.6],['dx/dt',N(c['dx/dt']),-1/(8+2*x)**2]],{m});
  for(const nm of ['oCyl','oCylOk']) sweep('g12c3',nm,(c,r)=>[['h = 8(1 − r/6)',N(c['h = 8(1 − r/6)']),8*(1-r/6)],['V = πr²h',N(c['V = πr²h']),Math.PI*r*r*8*(1-r/6),.06]],{m}); }
{ const S=book('g12c3').S, G=(n,g)=>S[n]&&S[n].goals&&S[n].goals[g];
  ok(!!G('rLadder','fast')&&!!G('rLadder2','fast')&&!!G('rIce','thin')&&!!G('rIce3','thin')&&!!G('oCyl','eq'),'g12c3: every step variant of the three scenes carries its figure-task goal');
  /* ladder: dy/dt = −4  ⇔  x/y = 2  ⇔  x = 4√5 */
  ok(G('rLadder','fast').ok(4*Math.sqrt(5))&&!G('rLadder','fast').ok(8)&&!G('rLadder','fast').ok(9.3),'rLadder.fast: true only near x = 4√5');
  /* ice: |dx/dt| = 1/(8+2x)² is largest at x = 0 */
  ok(G('rIce','thin').ok(0)&&!G('rIce','thin').ok(.5)&&!G('rIce','thin').ok(3),'rIce.thin: true only at x ≈ 0');
  /* cylinder: h = r ⇔ r = 24/7 */
  ok(G('oCyl','eq').ok(24/7)&&!G('oCyl','eq').ok(3)&&!G('oCyl','eq').ok(4),'oCyl.eq: true only at r = 24/7');
  /* the maximum the ok-scene marks is the true maximum of V(r) = 8π(r² − r³/6) on (0,6) */
  let best=0,bv=-1; for(let r=.001;r<6;r+=.001){ const v=8*Math.PI*(r*r-r**3/6); if(v>bv){ bv=v; best=r; } } ok(Math.abs(best-4)<.002&&Math.abs(bv-128*Math.PI/3)<.01,'oCylOk: max of V at r = 4, V = 128π/3');
  ok(RUN('g12c3','oCylOk',{p:4}).ok===true&&RUN('g12c3','oCylOk',{p:3.5}).ok===false&&RUN('g12c3','oCyl',{p:4}).ok===false,'oCylOk ✓ only at r = 4 ; the exercise scene never shows the answer');
  ok(RUN('g12c3','rLad60',{p:5}).ok===true&&RUN('g12c3','rLad60',{p:8}).ok===false,'rLad60: target θ = π/3 (x = 5), not example 4\'s x = 8');
  /* live rows print the right numbers */
  const txt=(n,p)=>RUN('g12c3',n,{p}).A.labs.map(l=>l.s).join(' | ');
  const has=(n,p,re,msg)=>{ const t=txt(n,p); ok(re.test(t),`${n} p=${p}: live row ${msg} — got «${t.slice(0,240)}»`); };
  has('rLadder2',8,/dy\/dt = −\(x\/y\)·2 = −\(8 ÷ 6\)·2 = −2\.667/,'dy/dt at x = 8');
  has('rLadder3',8,/dθ\/dt = .* = −0\.333/,'dθ/dt at x = 8');
  has('rLadder1',8,/y = √\(100 − 8²\) = 6/,'y at x = 8');
  has('rIce2',1,/dx\/dt = −6 ÷ \(6·10²\) = −0\.01 cm\/s/,'dx/dt at x = 1');
  has('oCylOk',4,/h = 8\(1 − 4\/6\) = 2\.667/,'h at r = 4'); has('oCylOk',4,/V′ = 8π\(2r − r²\/2\) = 0/,'V′ = 0 at r = 4');
  /* a live row appears only on its own step: step 2 must not repeat step 1's substituted y */
  ok(!/y = √\(100/.test(txt('rLadder2',8)),'rLadder2: step-1 live row not repeated on step 2'); }
/* v1.79: figure tasks for Rolle, MVT, extrema, inflection, second-derivative test */
{ const S=book('g12c3').S;
  const T5=[['tRolle','neg',-Math.sqrt(3),[Math.sqrt(3),0,-2]],['tMvt','par',2/3,[1,1.5,.3]],['tExt','min',4,[2,3,5]],['tInf','inf',.5,[0,1,-1]],['tSec','max',-1,[3,0,1]]];
  for(const [n,g,good,bad] of T5){ const sc=S[n];
    ok(!!sc&&sc.cP===1&&!!sc.sl&&sc.goals&&sc.goals[g],`${n}: slider-bound point and goal «${g}»`);
    /* the derivative the goal and the chips use is the true derivative of f */
    let md=0; for(let x=sc.sl.min;x<=sc.sl.max;x+=.05){ const h=1e-5, nd=(sc.f(x+h)-sc.f(x-h))/(2*h); md=Math.max(md,Math.abs(nd-sc.d(x))); } ok(md<1e-4,`${n}: d(x) is f′(x) (max err ${md.toExponential(1)})`);
    ok(sc.goals[g].ok(good),`${n}.${g}: accepts the right answer ${good.toFixed(4)}`);
    for(const b of bad) ok(!sc.goals[g].ok(b),`${n}.${g}: rejects ${b}`);
    ok(good>=sc.sl.min&&good<=sc.sl.max,`${n}: the answer is reachable on the slider`);
    /* (engine-drawn plot scenes: their chips are checked in the browser, tests/e2e.cjs T38) */ }
  /* the answers themselves, from the definitions */
  const tM=S.tMvt; ok(Math.abs(tM.d(2/3)-(tM.f(2)-tM.f(0))/2)<1e-12,'tMvt: f′(2/3) = chord slope −4');
  ok(Math.abs(S.tRolle.d(-Math.sqrt(3)))<1e-12&&Math.abs(S.tRolle.f(-3)-S.tRolle.f(3))<1e-12,'tRolle: f(−3) = f(3), f′(−√3) = 0');
  ok(S.tExt.d(4)===0&&S.tExt.d(3.9)<0&&S.tExt.d(4.1)>0&&S.tExt.f(4)===16,'tExt: x = 4 is a local minimum, f(4) = 16');
  ok(Math.abs(12*.5-6)<1e-12&&S.tInf.f(.5)===-5.5,'tInf: f″(1/2) = 0 , point (1/2 , −11/2)');
  ok(S.tSec.d(-1)===0&&6*(-1)-6<0&&S.tSec.f(-1)===5,'tSec: f′(−1) = 0 , f″(−1) = −12 < 0 , f(−1) = 5');
  }

sweep('g12c3','rCone',(c,h)=>[['r = h/3',N(c['r = h/3']),h/3],['V = πh³/27',N(c.V),Math.PI*h**3/27,.06],['dh/dt = 4/(πh²/9)',N(c['dh/dt']),36/(Math.PI*h*h),.0002]]);
at('g12c3','rCone',12,'dh/dt',1/(4*Math.PI),.0001);
sweep('g12c3','rPar',(c,x)=>{ const S=Math.sqrt((x-7)**2+4*x), k=(x-5)/S; return [['S (distance to (7,0))',N(c.S),S,.002],['dS/dx',N(c['dS/dx']),k,.002]]; },{ps:[.5,1,2,3,4,6,8]});
sweep('g12c3','rShadow',(c,x)=>[['s = x/3',N(c['s = x/3']),x/3],['ds/dt = (dx/dt)/3',N(c['ds/dt']),30/3]]);
sweep('g12c3','rBox',(c,x)=>{ const h=Math.max(.3,3+(4-x)*(5/3)); return [['dV/dt = 2xh·(0.3) + x²·(−0.5)',N(c['dV/dt']),2*x*h*.3-.5*x*x,.01]]; });
at('g12c3','rBox',4,'dV/dt',-.8);
sweep('g12c3','rCirc',(c)=>{ const [x,y]=P2(c['(x , y)']); return [['x² + y² + 4x − 8y',x*x+y*y+4*x-8*y,108,1.5],Math.abs(y-4)<.05?['vertical tangent at y = 4 : dy/dx = ∞',c['dy/dx']==='∞'?1:0,1]:['dy/dx = −(x+2)/(y−4)',N(c['dy/dx']),-(x+2)/(y-4),.02]]; },{ps:[0,1,2,3,5.5]});
sweep('g12c3','rPx',(c,x)=>{ const y=x*x, S=Math.hypot(x,y-1.5); return [['S',N(c.S),S,.002],['dS/dt ÷ dy/dt = (y−1)/S',N(c['dS/dt ÷ dy/dt']),(y-1)/S,.002]]; });
for(const n of ['rDisc','rTry']) sweep('g12c3',n,(c)=>{ const x=N(c.x), y=N(c.y); return [['x² + y² = 100',x*x+y*y,100,.2],['dy/dt = −2x/y',N(c['dy/dt']),-2*x/y,.006]]; });
at('g12c3','rCylQok',8,'dh/dt',-5/8); at('g12c3','rCylHok',8,'dr/dt',-.4);
at('g12c3','rCars3ok',.1,'dZ/dt',50); at('g12c3','rCars4ok',.25,'dZ/dt',100);
at('g12c3','rLightOk',18,'dy/dt',50/3); at('g12c3','rWallOk',8,'dy/dt',-5/9);
at('g12c3','rFunnelOk',6,'dh/dt',-5/(9*Math.PI),.0002); at('g12c3','rFilterOk',6,'dh/dt',1/Math.PI,.0002); at('g12c3','rSandOk',5,'dr/dt',1/(2*Math.PI),.0002);

/* --- 2: conics --- */
sweep('g12c2','parab',c=>[['MF = MQ (definition)',N(c.MF),N(c.MQ),.011]]);
sweep('g12c2','ell',c=>[['PF₁ + PF₂ = 2a = 10',N(c['PF₁'])+N(c['PF₂']),10,.011]]);
sweep('g12c2','hyp',c=>[['|PF₁ − PF₂| = 2a = 16',Math.abs(N(c['PF₁'])-N(c['PF₂'])),16,.011]]);
sweep('g12c2','eorient',c=>[['c = √(a² − b²)',N(c['c = √(a² − b²)']),Math.sqrt(N(c.a)**2-N(c.b)**2),.01],['e = c/a',N(c['e = c/a']),N(c['c = √(a² − b²)'])/N(c.a),.01]]);
sweep('g12c2','horient',c=>[['c = √(a² + b²)',N(c['c = √(a² + b²)']),Math.sqrt(N(c.a)**2+N(c.b)**2),.02],['e = c/a',N(c['e = c/a']),N(c['c = √(a² + b²)'])/N(c.a),.01]]);
{ /* translations: every mode, centre at the corners of its box, origin and the book's point */
  const T=(name,check)=>{ const sc=book('g12c2').S[name]; sc.modes.opts.forEach((_,m)=>{ const b=sc.drag2.box(m); [[b[0],b[2]],[b[1],b[3]],[0,0],[b[0],b[3]],[sc.drag2.x,sc.drag2.y]].forEach(([x,y])=>{ x=Math.max(b[0],Math.min(b[1],x)); y=Math.max(b[2],Math.min(b[3],y));
    sweep('g12c2',name,(c)=>check(c,m,x,y),{ps:[1],m,q:{x,y}}); }); }); };
  T('ptrans',(c,m,h,k)=>{ const [vh,vk]=P2(c.الرأس), [fh,fk]=P2(c.البؤرة), d=N(c.الدليل), s=m%2?-1:1, vert=m<2;
    return [['vertex h',vh,h],['vertex k',vk,k],['focus',vert?fk:fh,(vert?k:h)+s*.25],['focus other coord',vert?fh:fk,vert?h:k],['directrix',d,(vert?k:h)-s*.25]]; });
  T('etrans',(c,m,h,k)=>{ const [a1,b1]=P2(c['F₁']), [a2,b2]=P2(c['F₂']); return [['centre = midpoint of foci (x)',(a1+a2)/2,h,.06],['centre = midpoint of foci (y)',(b1+b2)/2,k,.06],['F₁F₂ = 2c = 8',Math.hypot(a1-a2,b1-b2),8,.12],['major axis horizontal ⇔ mode 0',m===0?Math.abs(b1-b2):Math.abs(a1-a2),0,.01]]; });
  T('htrans',(c,m,h,k)=>{ const [a1,b1]=P2(c['F₁']), [a2,b2]=P2(c['F₂']); return [['centre = midpoint of foci (x)',(a1+a2)/2,h,.01],['centre = midpoint of foci (y)',(b1+b2)/2,k,.01],['F₁F₂ = 2√13',Math.hypot(a1-a2,b1-b2),2*Math.sqrt(13),.02],['transverse axis horizontal ⇔ mode 0',m===0?Math.abs(b1-b2):Math.abs(a1-a2),0,.01]]; });
  /* the drawing agrees with the chips: a dot is drawn exactly at every point the chips name */
  const dotAt=(r,x,y)=>r.A.els.some(e=>e.tag==='circle'&&Math.hypot(e.attrs.cx-r.A.X(x),e.attrs.cy-r.A.Y(y))<1.5);
  for(const [name,keys] of [['ptrans',['الرأس','البؤرة']],['etrans',['المركز','F₁','F₂']],['htrans',['المركز','F₁','F₂']]]){ const sc=book('g12c2').S[name];
    sc.modes.opts.forEach((_,m)=>{ const b=sc.drag2.box(m); [[b[0],b[2]],[b[1],b[3]],[0,0],[sc.drag2.x,sc.drag2.y]].forEach(([x,y])=>{ x=Math.max(b[0],Math.min(b[1],x)); y=Math.max(b[2],Math.min(b[3],y));
      const r=RUN('g12c2',name,{p:1,m,q:{x,y}}); for(const k of keys){ const [px,py]=P2(r.chips[k]); ok(dotAt(r,px,py),`g12c2/${name} m=${m} centre (${x},${y}): no dot drawn at ${k} = ${r.chips[k]}`); } }); }); }
  /* the equation chip at the book's examples */
  ok(RUN('g12c2','ptrans',{p:1}).chips.المعادلة==='(x + 2)² = y + 4','g12c2/ptrans: equation of example 10');
  ok(RUN('g12c2','etrans',{p:1}).chips.المعادلة==='(x − 2)²/9 + (y − 1)²/25 = 1','g12c2/etrans: equation of example 18');
  ok(RUN('g12c2','htrans',{p:1}).chips.المعادلة==='(x + 2)²/9 − (y − 1)²/4 = 1','g12c2/htrans: equation of example 22'); }

/* --- 1: complex numbers --- */
const cmul=([a,b],[c,d])=>[a*c-b*d,a*d+b*c];
sweep('g12c1','cadd',c=>{ const z1=CX(c['c₁']), z2=CX(c['c₂']), s=CX(c['c₁ + c₂']); return [['Re(c₁ + c₂)',s[0],z1[0]+z2[0],.011],['Im(c₁ + c₂)',s[1],z1[1]+z2[1],.011]]; });
sweep('g12c1','conj',c=>{ const z=CX(c.c), w=CX(c['c̄']); return [['c̄ = a − bi',w[1],-z[1]],['c·c̄ = a² + b²',N(c['c × c̄ = a² + b²']),z[0]**2+z[1]**2,.03]]; });
sweep('g12c1','csqrt',c=>{ const z=CX(c.c), r=CX(c['الجذران ±']), q=cmul(r,r); return [['Re(root²) = Re(c)',q[0],z[0],.02],['Im(root²) = Im(c)',q[1],z[1],.02],['|c|',N(c['|c|']),Math.hypot(z[0],z[1]),.01]]; },{ps:[0,1,2,3,4]});
sweep('g12c1','quad',c=>{ const x1=CX(c['x₁']), x2=CX(c['x₂']), pr=cmul(x1,x2); return [['x₁ + x₂',N(c['x₁ + x₂']),x1[0]+x2[0],.011],['x₁ · x₂',N(c['x₁ · x₂']),pr[0],.03],['Im(x₁·x₂) = 0',pr[1],0,.02]]; },{ps:[0,1,2,3,4,5,6,7,8]});
sweep('g12c1','ipow',(c,n)=>{ n=Math.round(n); const want=[1,'i',-1,'-i'][((n%4)+4)%4]; return [['i^n by n mod 4',String(c['i^n']).replace(/−/g,'-')===String(want)?1:0,1]]; },{ps:Array.from({length:41},(_,i)=>i-13)});
sweep('g12c1','moivre',(c,n)=>[['(√2)ⁿ',N(c['المقياس (√2)ⁿ']),Math.SQRT2**Math.round(n),.01*Math.SQRT2**Math.round(n)]],{ps:[1,2,3,4,5,6,7,8,9,10,11]});

/* --- 6: space geometry --- */
sweep('g12c6','ex1',(c,h)=>[['∠DEB = atan(BD/BE)',N(c['∠DEB']),Math.atan(h/5)*180/Math.PI,.06]]);
at('g12c6','ex1',5,'∠DEB',45);
sweep('g12c6','proj',(c,t)=>[['BC = 6 cos θ',N(c['BC = AB cos θ']),6*Math.cos(Math.round(t)*Math.PI/180),.006]]);
sweep('g12c6','ex4',(c,t)=>[['area BCD = 60 cos θ',N(c['مساحة BCD']),60*Math.cos(Math.round(t)*Math.PI/180),.006]]);
at('g12c6','ex4',60,'مساحة BCD',30);

/* --- 5: «is it a solution?» scenes: left side = right side, except the book's non-solutions (badmsg) --- */
{ const src=fs.readFileSync(path.join(__dirname,'..','src','g12c5.scenes.js'),'utf8');
  for(const [name,sc] of Object.entries(book('g12c5').S)){ const m=src.match(new RegExp('S\\.'+name+'=checkScene\\(([^\\n]*)')); if(!m) continue; const notSol=/badmsg/.test(m[1]);
    for(const p of range(sc,7)){ const r=RUN('g12c5',name,{p}), L=N(r.chips['الطرف الأيسر']), R=N(r.chips['الطرف الأيمن']);
      ok(notSol?!near(L,R,.01):near(L,R,.01),`g12c5/${name} x=${+p.toFixed(2)}: left ${L} , right ${R}${notSol?' (book: not a solution)':''}`); } } }

console.log(`scenes: ${runs} sweep runs · ${pass} checks passed · ${fail} failed`);
bad.slice(0,40).forEach(b=>console.log('  FAIL',b));
process.exit(fail?1:0);
