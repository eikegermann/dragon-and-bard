// ---------- Module: Addigators (comparing and place value, Croakmire Swamp) ----------
// Addigators eat numbers, and only fall asleep when they've eaten one BIGGER than their last meal.
// Each gator shows what it ate last. The bard writes the numbers; the dragon feeds them.
// Kinds: compare (two numbers), sums (two sums; watch out for "the same"), digits (biggest number from
// two digits), digits3 (from three digits). All asleep = you can tiptoe past.
(function(){
let AG=null,RUN=null;
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const M={
  id:'addigator', name:'Addigators', screen:'addigator',
  defaults:{kind:'compare',gators:3,max:20,mistakes:4,intro:true},
  presets:{
    'Bigger number (to 20)':{kind:'compare',max:20},
    'Bigger number (to 100)':{kind:'compare',max:100},
    'Bigger sum (to 10)':{kind:'sums',max:10},
    'Bigger sum (to 20)':{kind:'sums',max:20},
    'Biggest number from two digits':{kind:'digits'},
    'Biggest number from three digits':{kind:'digits3'},
    'Mixed swamp':{kind:'mixed',max:20}},
  html:`
<section id="addigator" class="screen">
  <div class="topbar enc"><button class="btn ghost retreatBtn tl">↩ Retreat</button>
    <b>The addigators: feed each one a bigger number</b><span class="tr" id="agInfo"></span></div>
  <div id="agBody">
    <div id="agGators"></div>
    <div id="agAsk"></div>
    <div id="agBuild"></div>
    <div id="agOpts"></div>
    <div id="agMsg"></div>
  </div>
</section>`,
  bind(){},
  start(p,run){
    RUN=run;
    AG={p,i:0,miss:0,g:[]};
    for(let k=0;k<(p.gators||3);k++)AG.g.push(makeGator(p.kind==='mixed'?['compare','sums','digits'][k%3]:p.kind,p.max||20));
    show('addigator'); render();
    if(p.intro)setTimeout(intro,250); else ask();
  },
  abort(){AG=null;}
};
function intro(){
  overlay(`<div class="big">🐊🐊🐊</div>
    <div class="agintro"><p>🎻 <b>Bard:</b> "Oh no, these are <b>addigators</b>. We need to get past them."</p>
    <p>🐉 <b>You:</b> "Do you have a cold? They're <i>alligators</i>. You sound like your nose is blocked."</p>
    <p>🎻 <b>Bard:</b> "No, no! These are real addigators. They eat numbers, and they only fall asleep when they eat a number <b>bigger</b> than their last one. I'll write the numbers, you feed them!"</p></div>`,
    [['Let\'s feed them!','fire',ask]]);
}
// A puzzle: the gator's last meal, and the choices that the bard offers.
function makeGator(kind,max){
  if(kind==='digits'||kind==='digits3'){
    const n=kind==='digits'?2:3; let ds;
    do{ds=Array.from({length:n},()=>R(1,9));}while(new Set(ds).size<n);
    const big=+[...ds].sort((a,b)=>b-a).join(''), perms=permute(ds).map(x=>+x.join('')).sort((a,b)=>b-a), second=perms[1];
    const last=R(second+1,big-1);   // only the biggest arrangement beats it
    return {kind,last,digits:ds,answer:big};
  }
  if(kind==='sums'){
    const last=R(4,max-2);
    const sum=t=>{const a=R(Math.max(0,t-9),Math.min(9,t));return [a,t-a];};
    const good=R(last+1,Math.min(max,last+4)), bad=Math.random()<.45?last:R(Math.max(1,last-4),last-1); // sometimes exactly the same: a trap
    const opts=[{s:sum(good),v:good},{s:sum(bad),v:bad}].sort(()=>Math.random()-.5);
    return {kind,last,opts,answer:good};
  }
  const last=R(3,max-3), good=R(last+1,Math.min(max,last+(max>20?15:5))), bad=Math.random()<.3?last:R(Math.max(0,last-(max>20?15:5)),last-1);
  return {kind:'compare',last,opts:[{v:good},{v:bad}].sort(()=>Math.random()-.5),answer:good};
}
function permute(a){if(a.length<2)return [a];return a.flatMap((x,i)=>permute([...a.slice(0,i),...a.slice(i+1)]).map(p=>[x,...p]));}
function render(){
  agInfo.textContent=`${AG.g.filter(x=>x.asleep).length} of ${AG.g.length} asleep`;
  agGators.innerHTML=AG.g.map((x,k)=>`<div class="aggator${x.asleep?' asleep':''}${k===AG.i&&!x.asleep?' cur':''}">
    <div class="agface">🐊${x.asleep?'<span class="agz">💤</span>':''}</div><div class="agtag">last ate <b>${x.last}</b></div></div>`).join('');
}
function ask(){
  if(!AG)return;
  const x=AG.g[AG.i]; render(); agMsg.textContent=''; agBuild.innerHTML='';
  if(x.kind==='digits'||x.kind==='digits3'){
    agAsk.innerHTML=`This addigator last ate <b>${x.last}</b>. Use the bard's digits to make the <b>biggest</b> number you can!`;
    x.built=[];
    const draw=()=>{
      agBuild.innerHTML=`<div class="agslots">${x.digits.map((_,k)=>`<span class="agslot">${x.built[k]!=null?x.digits[x.built[k]]:''}</span>`).join('')}</div>`+
        `<div class="small">${x.digits.length===2?'tens · ones':'hundreds · tens · ones'}</div>`;
      agOpts.innerHTML=x.digits.map((d,k)=>`<button class="btn agcard" data-k="${k}"${x.built.includes(k)?' disabled':''}>${d}</button>`).join('')+
        `<button class="btn ghost" id="agUndo">↺</button><button class="btn fire" id="agFeed"${x.built.length<x.digits.length?' disabled':''}>🍖 Feed it!</button>`;
      agOpts.querySelectorAll('.agcard').forEach(b=>b.onclick=()=>{x.built.push(+b.dataset.k);draw();});
      agUndo.onclick=()=>{x.built=[];draw();};
      agFeed.onclick=()=>feed(+x.built.map(k=>x.digits[k]).join(''),x.built.map(k=>x.digits[k]).join(''));
    };
    draw();
  }else{
    agAsk.innerHTML=`This addigator last ate <b>${x.last}</b>. 🎻 "I've written two numbers. Which one is <b>bigger than ${x.last}</b>?"`;
    agOpts.innerHTML=x.opts.map(o=>`<button class="btn agcard" data-v="${o.v}">${o.s?`${o.s[0]} + ${o.s[1]}`:o.v}</button>`).join('');
    agOpts.querySelectorAll('.agcard').forEach(b=>b.onclick=()=>feed(+b.dataset.v,b.textContent,b));
  }
  RUN.asked();
}
function feed(v,label,btn){
  if(!AG)return;
  const x=AG.g[AG.i], ok=x.kind.startsWith('digits')?v===x.answer:v>x.last;
  RUN.answered(ok,`last ate ${x.last}${x.digits?` · digits ${x.digits.join(' ')}`:''} → fed ${label}${x.opts&&x.opts[0].s?` (= ${v})`:''}`);
  if(!ok){
    AG.miss++;
    const g=agGators.children[AG.i]; g.classList.remove('snap');void g.offsetWidth;g.classList.add('snap');
    agMsg.innerHTML=v===x.last?`<b>${label}${x.opts&&x.opts[0].s?` is ${v}`:''}</b>: that's the <b>same</b> as last time, not bigger! The addigator grumbles.`:
      x.kind.startsWith('digits')?(v>x.last?`${v} is bigger, but the addigator wants the <b>biggest</b>. Try swapping the digits around!`:`${v} isn't bigger than ${x.last}. Try putting the biggest digit first!`):
      `Too small! The addigator snaps and stays wide awake.`;
    if(btn)btn.disabled=true;
    if(x.kind.startsWith('digits')){x.built=[];setTimeout(()=>AG&&ask(),1600);}
    say('gatorWrong',3000);
    if(AG.miss>=(AG.p.mistakes||4))setTimeout(lose,1200);
    return;
  }
  x.asleep=true; render(); agMsg.textContent=`Gulp! ${label}… yawn… zzz. 💤`; agOpts.innerHTML=''; agBuild.innerHTML='';
  AG.i++;
  if(AG.i>=AG.g.length)return setTimeout(win,1000);
  setTimeout(ask,1300);
}
function win(){
  RUN.reward('wiz'); say('gatorWin',4000);
  overlay(`<div class="big">🐊💤🐊💤🐊💤</div><h2>All the addigators are snoring!</h2><div>You tiptoe past. Shhh…</div><div>+1 Wizard badge</div>`,[['Onward!','fire',()=>RUN.finish('win')]]);
}
function lose(){
  if(!AG)return;
  overlay(`<div class="big">🐊🐊</div><h2>The addigators are wide awake</h2><div>Too risky to sneak past now. Let's come back when they're sleepy.</div>`,[['Back away slowly','',()=>RUN.finish('lose')]]);
  AG=null;
}
Modules.register(M);
})();
