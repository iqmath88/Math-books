/* الثالث المتوسط · الفصل الخامس · الهندسة والقياس */
const S={};
['A1','A2','B1','B2','C1','C2','D1','D2','E1','E2','F1','F2','T'].forEach(k=>{ S['xs-'+k]={title:'تمارين',hint:'حلّ في دفترك ثم أظهر الحل',draw(A){ A.lab(A.W/2,A.H/2,'✎',{fill:A.col.muted,size:Math.min(A.W,A.H)*.3}); }}; });
function valScene(o){ return {}; }
//@G9
/* theory steps reuse the final figure of a book example */
const last=q=>{ let i=0; while(S[q+'-'+(i+1)]) i++; return S[q+'-'+i]; };
Object.assign(S,{poly:last('x11'),cone:last('x14'),pyr:last('x15'),triS:last('x21a'),simT:last('x24a'),propT:last('x31'),dilT:last('x35'),arcT:last('x41'),tanT:last('x46'),ccT:last('x51'),powT:last('x54'),inscT:last('x61'),inexT:last('x64a')});
