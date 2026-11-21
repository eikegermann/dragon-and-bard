// ---------- Module: Milestones (quill practice) ----------
// The bard is painting the milestones along the road, but he can't write dragon runes.
// The dragon writes each number with the quill. Good for testing how well the quill reads a child's writing.
(function(){
const WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
let SC=null, RUN=null;

const M={
  id:'scribe', name:'Milestones (quill practice)', screen:'scribe',
  defaults:{digits:'0123456789',rounds:6,show:'numeral',max:9},
  presets:{
    'Digits 1–5':{digits:'12345',rounds:5,max:9},
    'All digits 0–9':{digits:'0123456789',rounds:8,max:9},
    'Tricky ones (2 3 5 7 9)':{digits:'23579',rounds:6,max:9},
    'Number words (up to 9)':{digits:'0123456789',rounds:6,show:'word',max:9},
    'Two-digit numbers (10–20)':{rounds:5,min:10,max:20},
    'Number words (10–20)':{rounds:5,min:10,max:20,show:'word'}},
  html:`
<section id="scribe" class="screen">
  <div class="topbar enc"><button class="btn ghost retreatBtn tl">↩ Retreat</button>
    <b>Milestones: write the numbers for the bard</b><span class="tr"></span></div>
  <div id="scBody">
    <div id="scStone">🪨</div>
    <div id="scTask"></div>
    <div id="scDone"></div>
    <button class="btn fire" id="scWrite">🪶 Write it</button>
  </div>
</section>`,
  bind(){scWrite.onclick=()=>openQuill();},
  start(p,run){
    RUN=run;
    const pool=[];
    if(p.min!=null){for(let n=p.min;n<=p.max;n++)pool.push(String(n));}
    else pool.push(...String(p.digits||'0123456789').split(''));
    const items=[];while(items.length<(p.rounds||6)){const x=pick(pool);if(items[items.length-1]!==x||pool.length===1)items.push(x);}
    SC={p,items,i:0,right:0,tries:0,marks:[]};
    show('scribe'); render(); setTimeout(()=>say('scribeStart',6000),300);
    setTimeout(()=>openQuill(),900);
  },
  abort(){SC=null;Quill.close();}
};
function label(x){return SC.p.show==='word'?`<b>${WORDS[+x]}</b>`:`<b class="scnum">${x}</b>`;}
function render(){
  const x=SC.items[SC.i];
  scTask.innerHTML=x==null?'':`Milestone ${SC.i+1} of ${SC.items.length}: write ${label(x)}`;
  scDone.textContent=SC.items.slice(0,SC.i).map((v,k)=>SC.marks[k]).join(' ');
}
function openQuill(note){
  if(!SC||SC.i>=SC.items.length)return;
  const x=SC.items[SC.i];
  if(SC.tries===0)RUN.asked();
  Quill.open({count:Math.max(2,x.length),prompt:`Write ${label(x)} on the milestone`,note,
    checkPick:v=>v===x||(SC.p.show==='word'?`That's not ${WORDS[+x]}. Read it again!`:`That's not ${x}. Look again!`),
    onDone:r=>check(x,r),onCancel:()=>{}});
}
function check(x,r){
  if(!SC)return;
  const ok=r.text===x, how=['','trace','remember','free'][r.level];
  const tags=[how,r.chars.some(c=>c.asked)?'asked':'',r.chars.some(c=>c.retries)?'retried':'',r.chars.some(c=>c.peeks)?'peeked':'',
    r.chars.every(c=>c.start)?'':'start off',r.chars.every(c=>c.dir)?'':'direction off'].filter(Boolean).join(', ');
  RUN.answered(ok,`${x} → wrote ${r.text||'(nothing)'} (${tags})`);
  if(!ok){SC.tries++;say('scribeWrong',3500);
    if(SC.tries<2){setTimeout(()=>openQuill(`Hmm, I read ${r.text||'nothing'}. Let's try ${SC.p.show==='word'?WORDS[+x]:x} again!`),700);return;}}
  if(ok&&SC.tries===0)SC.right++;
  SC.marks[SC.i]=ok?(SC.tries?'🟡':'🟢'):'⚪';
  SC.tries=0; SC.i++; render();
  if(ok)say('scribeRight',2200);
  if(SC.i>=SC.items.length)return setTimeout(end,900);
  setTimeout(()=>openQuill(),1100);
}
function end(){
  const n=SC.items.length, good=SC.right>=Math.ceil(n/2);
  if(good)RUN.reward('quill');
  say('scribeWin',4500);
  overlay(`<div class="big">🪨🪶</div><h2>The milestones are painted!</h2>
    <div>${SC.marks.join(' ')}</div><div>${SC.right} of ${n} right first time.</div>${good?'<div>+1 quill point</div>':''}`,
    [['Onward!','fire',()=>RUN.finish('win')]]);
}
Modules.register(M);
})();
