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
// Tidiness: decorations and scribbles over a number must not pass (strict) / mostly not pass (normal),
// while clean wobbly numbers still do.
function decorate(strokes,kind){const d=[];
  if(kind==='scratch')for(let k=0;k<3;k++){const x=r(10,90),y=r(10,130);d.push([[x,y],[x+r(-25,25),y+r(-25,25)],[x+r(-25,25),y+r(-25,25)]]);}
  if(kind==='flag'){const p=strokes[0][0];d.push([[p[0],p[1]],[p[0],p[1]-25],[p[0]+25,p[1]-18],[p[0],p[1]-10]]);}
  if(kind==='teeth'){const y=r(60,110),t=[];for(let x=15;x<=85;x+=10)t.push([x,y+((x/10)%2?12:0)]);d.push(t);}
  if(kind==='droppings')for(let k=0;k<6;k++){const x=r(10,90),y=r(10,130);d.push([[x,y],[x+4,y+3],[x+1,y+6],[x-3,y+2],[x,y]]);}
  return strokes.concat(d.map(s=>{const o=[];for(let i=0;i<s.length-1;i++)for(let k=0;k<6;k++)o.push([s[i][0]+(s[i+1][0]-s[i][0])*k/6,s[i][1]+(s[i+1][1]-s[i][1])*k/6]);o.push(s[s.length-1]);return o;}));}
const pass=(make,strict)=>{let ok=0,n=0;for(let k=0;k<30;k++)for(const ch in G.DIGITS){n++;if(G.tidyEnough(make(ch),ch,false,strict).ok)ok++;}return ok/n;};
const clean=ch=>wobble(G.DIGITS[ch].strokes,3);
const decs=['flag','teeth','scratch','droppings'].map(kind=>[kind,ch=>decorate(wobble(G.DIGITS[ch].strokes,3),kind)]);
const cN=pass(clean,false),cS=pass(clean,true);
console.log(`tidiness: clean numbers accepted ${(cN*100).toFixed(0)}% (normal), ${(cS*100).toFixed(0)}% (chaos-proof)`);
for(const [kind,make] of decs){const n=pass(make,false),st=pass(make,true);
  console.log(`  with ${kind}: accepted ${(n*100).toFixed(0)}% (normal), ${(st*100).toFixed(0)}% (chaos-proof)`);
  if(st>.25)fail=true;}
if(cN<.9)fail=true;
if(fail){console.log('FAILED: misreads, or tidiness out of range');process.exit(1);}
