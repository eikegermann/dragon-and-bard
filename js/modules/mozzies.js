// ---------- Module: Mozzie jars (tens and ones, Croakmire Swamp) ----------
// A swarm won't sit still long enough to count, so you catch mozzies in jars of ten.
// Kinds: count (how many? jars of ten plus loose ones), catch (make a target number with jars and singles),
// compare (which swarm is bigger?). Answers by number pad or the quill.
(function(){
let MZ=null,RUN=null;
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const M={
  id:'mozzies', name:'Mozzie jars', screen:'mozzies',
  defaults:{kind:'count',rounds:4,maxTens:4},
  presets:{
    'Count the jars (to 50)':{kind:'count',maxTens:4},
    'Count the jars (to 99)':{kind:'count',maxTens:9},
    'Catch a number (to 50)':{kind:'catch',maxTens:4},
    'Catch a number (to 99)':{kind:'catch',maxTens:9},
    'Which swarm is bigger?':{kind:'compare',maxTens:9},
    'Mixed':{kind:'mixed',maxTens:6}},
  html:`
<section id="mozzies" class="screen">
  <div class="topbar enc"><button class="btn ghost retreatBtn tl">↩ Retreat</button>
    <b>Mozzie jars: catch them in tens</b><span class="tr" id="mzInfo"></span></div>
  <div id="mzBody">
    <div id="mzAsk"></div>
    <div id="mzShow"></div>
    <div id="mzCtl"></div>
    <div id="mzMsg"></div>
  </div>
</section>`,
  bind(){},
  start(p,run){RUN=run;MZ={p,r:0,ok:0};show('mozzies');round();setTimeout(()=>say('mozzieStart',5000),300);},
  abort(){MZ=null;Quill.close();}
};
const jar=n=>`<span class="mzjar${n<10?' part':''}"><span class="mzbugs">${'🦟'.repeat(Math.min(n,10))}</span><b>${n===10?'10':''}</b></span>`;
const loose=n=>`<span class="mzloose">${Array.from({length:n},()=>`<span class="mzfly" style="animation-delay:-${(Math.random()*2).toFixed(2)}s">🦟</span>`).join('')}</span>`;
const swarm=(t,o)=>`<div class="mzswarm">${Array.from({length:t},()=>jar(10)).join('')}${loose(o)}</div>`;
function round(){
  if(!MZ)return;
  const p=MZ.p, kind=p.kind==='mixed'?['count','catch','compare'][MZ.r%3]:p.kind;
  mzInfo.textContent=`Swarm ${MZ.r+1} of ${p.rounds||4}`; mzMsg.textContent=''; MZ.kind=kind; MZ.tries=0;
  const t=R(1,p.maxTens||4), o=R(0,9); MZ.target=t*10+o;
  if(kind==='count'){
    mzAsk.innerHTML='We caught the swarm! How many mozzies are there?';
    mzShow.innerHTML=swarm(t,o); numberEntry(v=>check(v===MZ.target,`${t} jars + ${o} → ${v}`));
  }else if(kind==='catch'){
    MZ.t=0;MZ.o=0;
    mzAsk.innerHTML=`🎻 "The farmer needs exactly <b class="mzbig">${MZ.target}</b> mozzies for his frog feast. Catch them!"`;
    const draw=()=>{mzShow.innerHTML=swarm(MZ.t,MZ.o)+`<div class="mzcount">${MZ.t} jar${MZ.t===1?'':'s'} and ${MZ.o} loose</div>`;};
    mzCtl.innerHTML=`<div class="row"><button class="btn gold" id="mzT">+ 🫙 jar of ten</button><button class="btn gold" id="mzO">+ 🦟 one</button>
      <button class="btn ghost" id="mzTm">− jar</button><button class="btn ghost" id="mzOm">− one</button><button class="btn fire" id="mzDone">✔ Done</button></div>`;
    mzT.onclick=()=>{if(MZ.t<9){MZ.t++;draw();}}; mzO.onclick=()=>{MZ.o++;
      if(MZ.o>=10){MZ.o-=10;MZ.t++;mzMsg.textContent='Ten loose ones! Pop them in a jar.';}draw();};
    mzTm.onclick=()=>{if(MZ.t>0){MZ.t--;draw();}}; mzOm.onclick=()=>{if(MZ.o>0){MZ.o--;draw();}
      // no loose ones left: open a jar and let one fly (ten becomes nine loose ones)
      else if(MZ.t>0){MZ.t--;MZ.o=9;draw();mzMsg.textContent='You open a jar and let one fly away: 9 still buzzing loose.';}};
    mzDone.onclick=()=>{const v=MZ.t*10+MZ.o;check(v===MZ.target,`catch ${MZ.target} → ${MZ.t} jars + ${MZ.o} (${v})`,
      v<MZ.target?'Not enough yet, catch some more!':'Too many! Let some go.');};
    draw();
  }else{
    let t2,o2;do{t2=R(1,p.maxTens||9);o2=R(0,9);}while(t2*10+o2===MZ.target);
    // half the time, the swarm with more loose mozzies is the smaller one (tens matter more!)
    if(Math.random()<.5&&t2!==t&&o!==o2){const big=Math.max(t,t2),small=Math.min(t,t2);
      const [ob,os]=[Math.min(o,o2),Math.max(o,o2)];
      MZ.a={t:big,o:ob};MZ.b={t:small,o:os};if(Math.random()<.5)[MZ.a,MZ.b]=[MZ.b,MZ.a];}
    else{MZ.a={t,o};MZ.b={t:t2,o:o2};}
    const va=MZ.a.t*10+MZ.a.o, vb=MZ.b.t*10+MZ.b.o;
    mzAsk.innerHTML='Two swarms! Which one has <b>more</b> mozzies?';
    mzShow.innerHTML=`<div class="mzpair"><button class="mzpick" data-v="${va}">${swarm(MZ.a.t,MZ.a.o)}</button><button class="mzpick" data-v="${vb}">${swarm(MZ.b.t,MZ.b.o)}</button></div>`;
    mzCtl.innerHTML='';
    mzShow.querySelectorAll('.mzpick').forEach(b=>b.onclick=()=>{const v=+b.dataset.v;
      check(v===Math.max(va,vb),`${va} or ${vb} → ${v}`,'Look at the full jars first. Each jar is ten!',b);});
  }
  RUN.asked();
}
function numberEntry(cb){
  let v='';
  mzCtl.innerHTML=`<div class="mzentry"><span id="mzV">&nbsp;</span><button class="btn gold" id="mzQuill" title="Write it with the quill">🪶</button></div><div class="mzpad"></div>`;
  const pad=mzCtl.querySelector('.mzpad');
  ['1','2','3','4','5','6','7','8','9','0','⌫','✓'].forEach(k=>{const b=document.createElement('button');b.textContent=k;if(k==='✓')b.className='go';
    b.onclick=()=>{const out=mzCtl.querySelector('#mzV');if(k==='⌫')v=v.slice(0,-1);else if(k==='✓'){const x=v;v='';out.innerHTML='&nbsp;';if(x)cb(+x);return;}else if(v.length<2)v+=k;out.innerHTML=v||'&nbsp;';};pad.appendChild(b);});
  mzQuill.onclick=()=>Quill.open({count:2,prompt:'How many mozzies?',
    checkPick:v=>+v===MZ.target||(RUN.answered(false,`count → ${+v} (quill pick)`),'Not quite! Count the full jars first, then the loose ones.'),
    onDone:r=>{if(r.text)cb(+r.text);},onCancel:()=>{}});
}
function check(ok,item,hint,btn){
  if(!MZ)return;
  RUN.answered(ok,item);
  if(!ok){MZ.tries++;mzMsg.textContent=hint||'Count the jars first: each full jar is ten. Then the loose ones.';
    if(btn)btn.classList.add('nope');say('mozzieWrong',3000);return;}
  if(MZ.tries===0)MZ.ok++;
  mzMsg.textContent=pick(['Got them all!','Buzz-tastic!','Not a single one escaped!']);
  mzCtl.innerHTML=''; MZ.r++;
  if(MZ.r>=(MZ.p.rounds||4))return setTimeout(end,1000);
  setTimeout(round,1200);
}
function end(){
  RUN.reward('wiz'); say('mozzieWin',4000);
  overlay(`<div class="big">🫙🦟</div><h2>The swarm is sorted!</h2><div>${MZ.ok} of ${MZ.p.rounds||4} right first time. The farmer's frogs will have a feast.</div><div>+1 Wizard badge</div>`,[['Onward!','fire',()=>RUN.finish('win')]]);
}
Modules.register(M);
})();
