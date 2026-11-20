// ---------- Module: Lily pad hops (skip counting, Croakmire Swamp) ----------
// Old Burble, a fish-folk lily farmer with two fingers and a thumb on each hand, tries to count his
// lily pads in steps and gets muddled. Help him by hopping only on the pads with the next number.
// Wrong pads wobble (the addigators look up hopefully; nobody gets eaten).
(function(){
let LP=null,RUN=null;
const M={
  id:'lilypad', name:'Lily pad hops', screen:'lilypad',
  defaults:{step:2,start:0,dir:'up',mode:'hop',hops:7},
  presets:{
    'Twos from 0':{step:2,start:0},
    'Fives from 0':{step:5,start:0},
    'Tens from 0':{step:10,start:0,hops:8},
    'Threes from 0 (Burble\'s favourite)':{step:3,start:0},
    'Fours from 0':{step:4,start:0},
    'Twos from 7':{step:2,start:7},
    'Tens from 13':{step:10,start:13},
    'Backwards in fives from 50':{step:5,start:50,dir:'down'},
    'Fill the gaps (2s, 5s, 10s)':{mode:'gaps',steps:[2,5,10]},
    'Fill the gaps (3s and 4s)':{mode:'gaps',steps:[3,4]}},
  html:`
<section id="lilypad" class="screen">
  <div class="topbar enc"><button class="btn ghost retreatBtn tl">↩ Retreat</button>
    <b>Lily pad hops: help Old Burble count</b><span class="tr" id="lpInfo"></span></div>
  <div id="lpBody">
    <div id="lpFarmer"><span class="lpface">🐟👒</span><div id="lpSays"></div></div>
    <div id="lpTrail"></div>
    <div id="lpAsk"></div>
    <div id="lpPads"></div>
    <div id="lpMsg"></div>
  </div>
</section>`,
  bind(){},
  start(p,run){
    RUN=run;
    LP={p,wob:0,done:0};
    show('lilypad');
    if(p.mode==='gaps')startGaps(); else startHop();
    setTimeout(()=>say('lilyStart',5000),300);
  },
  abort(){LP=null;}
};
const seqOf=(a,s,n,dir)=>Array.from({length:n},(_,k)=>a+(dir==='down'?-1:1)*s*k);
// Burble's confident, muddled attempt: starts right, then goes wrong
function burble(seq,s){
  const wrong=[seq[0],seq[1],seq[2]+(s===1?2:1),seq[2]+s+3];
  return `"${wrong.join(', ')}, twel- no. No, no. ${seq[0]}, ${seq[1]}, uh… I've only got three fingers on each hand! Can you help me count in ${s===2?'twos':s===3?'threes':s===4?'fours':s===5?'fives':s===10?'tens':s+'s'}?"`;
}

// ----- hop mode: choose the next pad -----
function startHop(){
  const p=LP.p, s=p.step, n=(p.hops||7)+1;
  LP.seq=seqOf(p.start||0,s,n,p.dir); LP.at=0;
  if(p.dir==='down'&&LP.seq[n-1]<0)LP.seq=seqOf(s*(n-1),s,n,'down');
  lpSays.textContent=burble(LP.seq,s)+(p.dir==='down'?' (And this time backwards! Oh dear.)':'');
  renderHop();
}
function renderHop(){
  const nx=LP.at+1, s=LP.p.step;
  lpInfo.textContent=`Hop ${LP.at} of ${LP.seq.length-1}`;
  lpTrail.innerHTML=LP.seq.slice(0,nx).map((v,k)=>`<span class="lppad done${k===LP.at?' here':''}">${k===LP.at?'<i>🐉</i>':''}${v}</span>`).join('<span class="lpgap">›</span>');
  if(nx>=LP.seq.length)return endLily();
  const right=LP.seq[nx], up=LP.p.dir!=='down'?1:-1;
  const opts=new Set([right]);
  [right+up*s,LP.seq[LP.at]+up,right+up,right-up].forEach(v=>{if(v>=0&&opts.size<3&&v!==LP.seq[LP.at])opts.add(v);});
  let k=2;while(opts.size<3)opts.add(right+up*k++);
  lpAsk.innerHTML=`Which pad comes next after <b>${LP.seq[LP.at]}</b>?`;
  lpPads.innerHTML=[...opts].sort(()=>Math.random()-.5).map(v=>`<button class="lppad big" data-v="${v}">${v}</button>`).join('');
  lpPads.querySelectorAll('button').forEach(b=>b.onclick=()=>hop(+b.dataset.v,b));
  RUN.asked();
}
function hop(v,b){
  if(!LP)return;
  const right=LP.seq[LP.at+1], ok=v===right;
  RUN.answered(ok,`${LP.seq.slice(Math.max(0,LP.at-1),LP.at+1).join(', ')}, ? → ${v}`);
  if(!ok){LP.wob++;b.classList.add('wobble');b.disabled=true;
    lpMsg.innerHTML=`Wobble wobble! 🐊👀 <i>The addigators look up hopefully.</i>`;say('lilyWrong',2500);return;}
  lpMsg.textContent=pick(['Hop!','Boing!','Splish!','Hop, hop!']);
  LP.at++; renderHop();
}

// ----- gaps mode: fill the missing numbers in a row -----
function startGaps(){
  LP.rounds=3; LP.r=0; nextGapRow();
}
function nextGapRow(){
  const steps=LP.p.steps||[2,5,10], s=steps[LP.r%steps.length], a=s*Math.floor(Math.random()*4);
  LP.seq=seqOf(a,s,8,'up'); LP.step=s;
  const idx=[2,4,5,7].sort(()=>Math.random()-.5).slice(0,3).sort((x,y)=>x-y);
  LP.blank=new Set(idx); LP.fill={};
  lpSays.textContent=LP.r===0?burble(LP.seq,s):`"Oh, I lost some pads again! Can you fill the gaps?"`;
  lpInfo.textContent=`Row ${LP.r+1} of ${LP.rounds}`;
  renderGaps();
}
function renderGaps(){
  const cur=[...LP.blank].find(k=>LP.fill[k]==null);
  lpTrail.innerHTML=LP.seq.map((v,k)=>LP.blank.has(k)?`<span class="lppad ${LP.fill[k]!=null?'done':'blank'}${k===cur?' here':''}">${LP.fill[k]??'?'}</span>`:`<span class="lppad done">${v}</span>`).join('<span class="lpgap">›</span>');
  if(cur==null){LP.r++; if(LP.r>=LP.rounds)return endLily(); lpMsg.textContent='The row is complete!'; return setTimeout(nextGapRow,1200);}
  const right=LP.seq[cur], s=LP.step, opts=new Set([right]);
  [right+1,right-1,right+s,right-s,right+2].forEach(v=>{if(v>=0&&opts.size<4)opts.add(v);});
  lpAsk.innerHTML='Which number goes in the glowing gap?';
  lpPads.innerHTML=[...opts].sort(()=>Math.random()-.5).map(v=>`<button class="lppad big" data-v="${v}">${v}</button>`).join('');
  lpPads.querySelectorAll('button').forEach(b=>b.onclick=()=>{
    const v=+b.dataset.v, ok=v===right;
    RUN.answered(ok,`${LP.seq.map((x,k)=>k===cur?'_':LP.blank.has(k)&&LP.fill[k]==null?'?':x).join(', ')} → ${v}`);
    if(!ok){LP.wob++;b.classList.add('wobble');b.disabled=true;lpMsg.innerHTML='Wobble wobble! 🐊👀';return;}
    LP.fill[cur]=v; lpMsg.textContent='Splish!'; renderGaps();});
  RUN.asked();
}
function endLily(){
  RUN.reward('wiz'); say('lilyWin',4500);
  lpPads.innerHTML=''; lpAsk.innerHTML='';
  overlay(`<div class="big">🐟👒🪷</div><h2>All counted!</h2><div>"Oh, thank you! I'll never forget that. Well… I might. Come back and remind me!"</div>
    <div>${LP.wob?`${LP.wob} wobbly pad${LP.wob>1?'s':''} on the way.`:'Not a single wobble!'}</div><div>+1 Wizard badge</div>`,[['Onward!','fire',()=>RUN.finish('win')]]);
}
Modules.register(M);
})();
