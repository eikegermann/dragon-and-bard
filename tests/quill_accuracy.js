// Recogniser check on wobbly synthetic digits (stretched, sheared, tilted, shaky, strokes reordered).
// Run: node tests/quill_accuracy.js   — real children's handwriting will differ; use the sandbox's Quill practice for that.
const G=require('../js/glyphs.js');
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const r=(a,b)=>a+(b-a)*rnd();
function wobble(strokes,amt){
  const sx=r(.7,1.3),sy=r(.8,1.15),sh=r(-.25,.25),rot=r(-12,12)*Math.PI/180,c=Math.cos(rot),s=Math.sin(rot),ph=r(0,6),fq=r(.05,.15);
  return strokes.map(st=>st.map(([x,y],i)=>{x-=50;y-=70;let X=x*sx+y*sh,Y=y*sy;[X,Y]=[X*c-Y*s,X*s+Y*c];
    X+=amt*Math.sin(i*fq*6+ph)+r(-amt/2,amt/2);Y+=amt*Math.cos(i*fq*5+ph)+r(-amt/2,amt/2);return [X+50,Y+70];}));
}
function reorder(st){let s=st.map(x=>rnd()<.3?[...x].reverse():x);if(rnd()<.3)s=[...s].reverse();return s;}
let fail=false;
for(const amt of [2,4,7]){
  const t={sure:0,sureWrong:0,asked:0,askedHit:0,unknown:0,n:0};
  for(let k=0;k<100;k++)for(const ch in G.DIGITS){
    const forms=[G.DIGITS[ch].strokes,...(G.VARIANTS[ch]||[])];
    const c=G.recognise(reorder(wobble(forms[Math.floor(rnd()*forms.length)],amt))),v=G.verdict(c);t.n++;
    if(v==='sure'){t.sure++;if(c[0].ch!==ch)t.sureWrong++;}
    else if(v==='unsure'){t.asked++;if(c[0].ch===ch||c[1].ch===ch)t.askedHit++;}
    else t.unknown++;
  }
  const pct=x=>(x/t.n*100).toFixed(1)+'%';
  console.log(`shakiness ${amt}: read straight away ${pct(t.sure-t.sureWrong)}, misread ${pct(t.sureWrong)}, asked "which one?" ${pct(t.asked)} (right one offered ${t.askedHit}/${t.asked}), not recognised ${pct(t.unknown)}`);
  if(t.sureWrong/t.n>.05)fail=true;
}
let sure=0;for(let k=0;k<200;k++){const st=[[]];for(let i=0;i<30;i++)st[0].push([r(10,90),r(10,130)]);if(G.verdict(G.recognise(st))==='sure')sure++;}
console.log(`random scribbles read as a digit: ${sure}/200`);
if(fail){console.log('FAILED: too many confident misreads');process.exit(1);}
