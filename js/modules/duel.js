// ---------- Module: heat / cold duel (adding up, or taking away to 0) ----------
(function(){
const FLAMES={
  one6:{sides:[6],name:'Little flame'},twin6:{sides:[6,6],name:'Twin sparks'},big8:{sides:[8],name:'Big ember'},
  big10:{sides:[10],name:'Roaring blaze'},twin8:{sides:[8,8],name:'Twin embers'},big12:{sides:[12],name:'Dragonfire'}};
const FROST_NAMES={one6:'Little chill',twin6:'Twin snowflakes',big8:'Big freeze',big10:'Deep frost',twin8:'Twin blizzards',big12:'Glacier breath'};
const RIVALS=[{n:'Cinder the Cautious',c:'red'},{n:'Blaze the Bold',c:'gold'},{n:'Smoulder',c:'black'},{n:'Puff the Reckless',c:'teal'}];
const RIVALS_COLD=[{n:'Sleet',c:'blue'},{n:'Icicle the Cautious',c:'teal'},{n:'Brr the Bold',c:'black'},{n:'Frostbite',c:'purple'}];
const diceDesc=s=>s.length===2?`two dice, 1 to ${s[0]} each`:`one die, 1 to ${s[0]}`;
const autoTarget=s=>Math.max(15,Math.round(s.reduce((a,x)=>a+(x+1)/2,0))*5);
const avgOf=s=>s.reduce((a,x)=>a+(x+1)/2,0);

let D=null, RUN=null;

const M={
  id:'duel', name:'Heat / cold duel', screen:'duel',
  defaults:{mode:'heat',flame:'one6',boss:false,archer:true},
  presets:{
    'Heat · one die to 20':{mode:'heat',flame:'one6'},
    'Heat · two dice':{mode:'heat',flame:'twin6'},
    'Heat · choose your flame':{mode:'heat',choice:['twin6','big8']},
    'Heat boss · Elder Emberclaw':{mode:'heat',flame:'twin8',boss:true,rival:{n:'Elder Emberclaw',c:'purple'}},
    'Cold · one die from 20':{mode:'cold',flame:'one6'},
    'Cold · big freeze (1–8)':{mode:'cold',flame:'big8'},
    'Cold · choose your frost':{mode:'cold',choice:['twin6','big8']},
    'Cold boss · Frost Wyrm':{mode:'cold',flame:'twin8',boss:true,rival:{n:'the Frost Wyrm',c:'blue'}},
    'Co-op heat boss · 2 players (1d6 and 2d6)':{mode:'heat',flame:'twin8',boss:true,rival:{n:'Elder Emberclaw',c:'purple'},
      team:[{name:'Red',colour:'red',hat:'blue',flame:'one6'},{name:'Blue',colour:'blue',hat:'green',flame:'twin6'}]},
    'Co-op cold boss · 3 players':{mode:'cold',flame:'twin8',boss:true,rival:{n:'the Frost Wyrm',c:'blue'},
      team:[{name:'Red',colour:'red',hat:'blue',flame:'one6'},{name:'Blue',colour:'blue',hat:'green',flame:'big8'},{name:'Green',colour:'green',hat:'red',flame:'twin8'}]}},
  html:`
<section id="duel" class="screen">
  <div class="topbar enc"><button class="btn ghost retreatBtn tl">↩ Retreat</button>
    <b id="duelTitle">Heat duel</b>
    <button class="btn ghost tr" id="skipDuel">🛡️ Skip</button></div>
  <div id="duelBody">
    <div class="side">
      <div class="label" id="pName">You</div>
      <div id="teamRow"></div>
      <div id="pDragon"></div>
      <div class="stone" id="pStone">0</div>
      <div class="meter"><div id="pMeter"></div></div>
    </div>
    <div id="center">
      <div id="target"></div>
      <div id="dice"></div>
      <div id="question"></div>
      <button class="btn fire" id="rollBtn">Roll!</button>
      <div id="archerRow">
        <button class="btn gold" id="aimBtn" style="font-size:18px">🏹 Steady aim<br><small>roll twice, keep one</small></button>
        <button class="btn gold" id="divertBtn" style="font-size:18px">🏹 Diversion<br><small>rival keeps the smaller roll</small></button>
      </div>
      <div id="answerArea" style="display:none">
        <div class="row">
          <div id="answerShow"></div>
          <button class="btn gold quillBtn" id="quillBtn" title="Write it with the quill">🪶</button>
        </div>
        <div id="pad"></div>
      </div>
      <div id="log"></div>
    </div>
    <div class="side">
      <div class="label" id="rName">Rival</div>
      <div id="rDragon"></div>
      <div class="stone" id="rStone">0</div>
      <div class="meter"><div id="rMeter"></div></div>
    </div>
  </div>
</section>`,
  bind(){
    const keys=['1','2','3','4','5','6','7','8','9','0','⌫','✓'];
    pad.style.gridTemplateColumns='repeat(6,64px)';
    keys.forEach(k=>{const b=document.createElement('button');b.textContent=k;
      if(k==='✓'){b.style.background='var(--fire)';b.style.color='#2a1300';}
      b.onclick=()=>{if(!D)return;
        if(k==='⌫')D.answer=D.answer.slice(0,-1);else if(k==='✓')return checkAnswer(D.answer,false);
        else if(D.answer.length<2)D.answer+=k; answerShow.textContent=D.answer;};
      pad.appendChild(b);});
    quillBtn.onclick=()=>openQuill();
    answerArea.addEventListener('animationend',()=>answerArea.classList.remove('shake'));
    rollBtn.onclick=roll;
    aimBtn.onclick=()=>useArcher('adv');
    divertBtn.onclick=()=>useArcher('divert');
    skipDuel.onclick=()=>RUN&&RUN.skip();
  },
  start(p,run){RUN=run; if(p.team&&p.team.length>1)coopSetup(p); else if(p.choice&&p.choice.length)chooseFlame(p); else begin(p);},
  abort(){if(D)D.dead=true;Quill.close();}
};

function chooseFlame(p){
  const cold=p.mode==='cold';
  say(cold?'choiceCold':'choice',6000);
  const box=document.getElementById('overlayBox');
  box.innerHTML=`<div class="big">🎲</div><h2>Choose your ${cold?'frost':'flame'}!</h2><div class="small">Your rival has to use the same one. Or let the rival pick, and bring an archer.</div><div class="row" id="flameRow"></div>`;
  const row=box.querySelector('#flameRow'), close=()=>document.getElementById('overlay').classList.remove('on');
  p.choice.forEach(k=>{const f=FLAMES[k];const b=document.createElement('button');b.className='btn';
    b.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 26px;min-width:220px';
    b.innerHTML=`<div style="display:flex;gap:8px">${f.sides.map(s=>`<div class="die" style="width:64px;height:64px;font-size:22px">1–${s}</div>`).join('')}</div>
      <div style="font-size:24px">${cold?FROST_NAMES[k]:f.name}</div><div class="small">${diceDesc(f.sides)}</div>`;
    b.onclick=()=>{close();begin({...p,choice:null,flame:k,archer:false});};
    row.appendChild(b);});
  if(p.archer!==false&&RUN.party.archers()>0){const b=document.createElement('button');b.className='btn gold';
    b.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 26px;min-width:220px';
    b.innerHTML=`<div style="font-size:44px">🏹</div><div style="font-size:24px">Rival picks</div><div style="font-size:15px">bring an archer instead</div>`;
    b.onclick=()=>{close();begin({...p,choice:null,flame:pick(p.choice),archer:true});};
    row.appendChild(b);}
  document.getElementById('overlay').classList.add('on');
}

// ---- Co-op boss: explain kindred power, then each player below the boss's dice may step up or stay ----
function coopSetup(p){
  const cold=p.mode==='cold', boss=FLAMES[p.flame]||FLAMES.twin8, kin=cold?'kindred frost':'kindred fire';
  const team=p.team.map(m=>({...m}));
  overlay(`<div class="big">${team.map(m=>dragonSVG(m.colour,70)).join('')}</div><h2>Together against ${(p.rival||{n:'the boss'}).n}!</h2>
    <div>You take turns. Everyone rolls their own dice and works out their own sum.</div>
    <div>Rolling smaller dice than the boss? The power of <b>${kin}</b> ${cold?'takes away':'adds'} extra heat for every right answer, so everyone counts just as much.</div>`,
    [['Let\'s go!','fire',()=>ask(0)]]);
  function ask(i){
    while(i<team.length&&avgOf((FLAMES[team[i].flame]||FLAMES.one6).sides)>=avgOf(boss.sides))i++;
    if(i>=team.length)return begin({...p,team});
    const m=team[i], own=FLAMES[m.flame]||FLAMES.one6;
    say('stepUp',7000);
    overlay(`<div class="big">${dragonSVG(m.colour,90)}</div><h2>${m.name}, how will you roll?</h2>
      <div class="small">"Will you add your ${cold?'frost':'flame'} to the winds and roll stronger, or stay in the kindred circle with the dice you know?"</div>`,
      [[`🔥 Roll stronger<br><small>${diceDesc(boss.sides)}</small>`,'gold',()=>{m.flame=p.flame;ask(i+1);}],
       [`💪 Stay in the circle<br><small>${diceDesc(own.sides)} + ${kin}</small>`,'gold',()=>ask(i+1)]]);
  }
}
function begin(p){
  const cold=p.mode==='cold', f=FLAMES[p.flame]||FLAMES.one6;
  const sides=p.sides||f.sides, target=p.target||autoTarget(sides);
  const flameName=cold?(FROST_NAMES[p.flame]||''):(f.name||'');
  const rv=p.rival||pick(cold?RIVALS_COLD:RIVALS);
  const start=cold?target:0;
  D={...p,cold,sides,rsides:sides,target,flameName,p:start,r:start,rival:rv,rolls:[],busy:false,answer:'',
     adv:false,divert:false,archerUsed:false,archer:p.archer!==false,dead:false,
     team:p.team&&p.team.length>1?p.team.map(m=>({...m,sides:(FLAMES[m.flame]||FLAMES.one6).sides,archerUsed:false})):null,ti:0};
  duelTitle.textContent=(p.boss?'Boss: ':'')+(cold?'Cold duel':'Heat duel');
  pName.textContent=S.name||'You'; rName.textContent=rv.n.replace(/^the /,'The ');
  pDragon.innerHTML=dragonSVG(S.colour,130); rDragon.innerHTML=dragonSVG(rv.c,130,true); teamRow.innerHTML='';
  if(D.team)setMember(0);
  target_.innerHTML=cold?`First to <b>0</b> ❄ wins`:`First to <b>${target}</b> 🔥 wins`;
  dice.innerHTML='';
  question.textContent=D.team?`${D.team[0].name}, you start! Roll your dice.`:(flameName?flameName+': ':'')+(sides.length===2?'roll two dice':'roll the die')+(cold?' and take it away!':' and add it on!');
  log.textContent=''; answerArea.style.display='none'; rollBtn.style.display='';
  skipDuel.style.visibility=(RUN.party.guards()>0&&!p.boss)?'visible':'hidden';
  updateArcherBtns();
  if(!D.archer&&RUN.party.archers()>0)log.textContent=`You chose the ${cold?'frost':'flame'}, so your archers stay at camp.`;
  renderStones(); show('duel');
  setTimeout(()=>say(p.boss?(cold?'frostBoss':'boss'):(cold?'coldStart':'duelStart'),5000),300);
}
// Co-op: whose turn it is on the team (the game swaps in that player's party, so archers are their own)
function me(){return D.team?D.team[D.ti]:D;}
function mySides(){return D.team?D.team[D.ti].sides:D.sides;}
function setMember(i){
  D.ti=i; const m=D.team[i];
  if(RUN.host.coopTurn)RUN.host.coopTurn(m.pi);
  pName.textContent=`${m.name}'s turn`; pDragon.innerHTML=dragonSVG(m.colour,130);
  if(m.hat)document.getElementById('bardSvg').innerHTML=bardSVG(m.hat);
  teamRow.innerHTML=D.team.map((t,k)=>`<span class="tmini${k===i?' on':''}" title="${t.name}">${dragonSVG(t.colour,40)}</span>`).join('');
  updateArcherBtns();
}
// "target" clashes with a common global name, so look it up explicitly
const target_={set innerHTML(h){document.getElementById('target').innerHTML=h;}};

function heatColour(v,t){const f=Math.min(1,v/t);return `hsl(20,${Math.round(f*90)}%,${30+f*25}%)`;}
function progress(v){return D.cold?Math.min(1,Math.max(0,(D.target-v)/D.target)):Math.min(1,v/D.target);}
function renderStones(){
  [['p',D.p],['r',D.r]].forEach(([k,v])=>{const s=document.getElementById(k+'Stone'),f=progress(v);s.textContent=v;
    if(D.cold){s.style.background=`hsl(${25+175*f},${40+45*f}%,${38+32*f}%)`;s.style.boxShadow=f>=.6?`0 0 ${f*40}px #9fd8ff`:'none';}
    else{s.style.background=heatColour(v,D.target);s.style.boxShadow=f>=.6?`0 0 ${f*40}px #ff7a2f`:'none';}
    const m=document.getElementById(k+'Meter');m.style.width=f*100+'%';
    m.style.background=D.cold?'linear-gradient(90deg,#b7e3ff,#3a9bff)':'';});
}
async function rollAnim(sides,sets=1){
  dice.classList.toggle('two',sets>1||sides.length*sets>2);
  dice.innerHTML=Array.from({length:sets},()=>`<div class="dgroup">${sides.map(s=>`<div class="die rolling"><span>?</span><small>1–${s}</small></div>`).join('')}</div>`).join('');
  const groups=[...dice.children].map(g=>[...g.children].map(d=>d.firstChild));let t=0;
  await new Promise(res=>{const iv=setInterval(()=>{groups.forEach(g=>g.forEach((e,i)=>e.textContent=1+Math.floor(Math.random()*sides[i])));
    if(++t>9){clearInterval(iv);res();}},70);});
  return groups.map(g=>{const vals=sides.map(s=>1+Math.floor(Math.random()*s));
    g.forEach((e,i)=>{e.parentNode.classList.remove('rolling');e.textContent=vals[i];});return vals;});
}
function pickGroup(){return new Promise(res=>{const gs=[...dice.children];
  gs.forEach((g,i)=>{g.classList.add('pick');g.onclick=()=>{gs.forEach((h,j)=>{h.classList.remove('pick');h.onclick=null;if(j!==i)h.classList.add('faded');});res(i);};});});}
function updateArcherBtns(){const ok=RUN.party.archers()>0&&D.archer&&!me().archerUsed;
  aimBtn.style.display=ok?'':'none'; divertBtn.style.display=ok?'':'none';
  archerRow.style.display=rollBtn.style.display;}
function useArcher(kind){
  if(!D||!D.archer||me().archerUsed||!RUN.party.useArcher())return;
  me().archerUsed=true;D[kind]=true;
  say(kind==='adv'?'aim':'divert');updateArcherBtns();
  log.textContent=D.team?`🏹 ${me().name}'s archer is helping`:'🏹 Your archer is helping this duel';}

async function roll(){
  if(!D||D.busy)return; D.busy=true; rollBtn.style.display='none'; archerRow.style.display='none';
  if(D.adv){const sets=await rollAnim(mySides(),2);question.textContent='Tap the roll you want to keep!';
    const i=await pickGroup();D.rolls=sets[i];D.adv=false;}
  else D.rolls=(await rollAnim(mySides()))[0];
  if(D.dead)return;
  const total=sum(D.rolls);
  if(D.cold&&total>=D.p){
    question.innerHTML=`${D.team?'The team':'Your'} stone's heat is <b>${D.p}</b>.<br>You rolled <b>${total}</b>, that's enough to cool it all away!<br>❄ Frozen solid! ❄`;
    D.p=0; renderStones(); say('frozen',3000); D.busy=false; return setTimeout(()=>endDuel(true),1600);}
  question.innerHTML=`${D.team?`${me().name}: the team`:'Your'} stone's heat is <b>${D.p}</b>.<br>You rolled <b>${D.rolls.join('</b> and <b>')}</b>.<br>`+
    (D.cold?'Cool it down: how much heat is left?':'Heat it up: how much heat now?');
  D.answer=''; answerShow.textContent=''; answerArea.classList.remove('shake'); answerArea.style.display='flex';
  answerShow.classList.remove('ready'); void answerShow.offsetWidth; answerShow.classList.add('ready');
  RUN.asked();
  D.busy=false;
}
function openQuill(note){
  if(!D)return;
  Quill.open({count:2,prompt:question.innerHTML,note,
    // Trace/Remember: the picked number is checked first (a wrong pick counts as a wrong answer)
    checkPick:v=>{const ok=+v===correctNow();if(!ok){RUN.answered(false,`${itemNow()} = ${+v} (quill pick)`);say('wrong');}
      return ok||'Not quite! Check your sum and pick again.';},
    onDone:r=>checkAnswer(r.text.replace(/^0+(?=\d)/,''),r),onCancel:()=>{}});
}
// quill: false for the number pad, or the quill's result (what was written and how)
function correctNow(){const t=sum(D.rolls);return D.cold?D.p-t:D.p+t;}
function itemNow(){return `${D.p}${D.cold?' − ':' + '}${D.rolls.join(D.cold?' − ':' + ')}`;}
function checkAnswer(ans,quill){
  if(!ans||!D)return;
  const correct=correctNow(), item=itemNow();
  RUN.answered(+ans===correct,`${item} = ${ans}`+(quill?` (quill ${['','trace','remember','free'][quill.level]}${quill.chars.some(c=>c.asked)?', asked':''}${quill.formationOk?'':', formation tip'})`:''));
  if(+ans!==correct){answerArea.classList.remove('shake');void answerArea.offsetWidth;answerArea.classList.add('shake');
    say('wrong'); D.answer=''; answerShow.textContent=''; if(quill)setTimeout(()=>openQuill('Not quite! Check your sum, then write it again.'),900); return;}
  if(quill){RUN.reward('quill',1,D.team?D.ti:undefined); log.textContent=D.team?`🪶 +1 quill point for ${me().name}!`:'🪶 +1 quill point!';
    if(RUN.host.isFirstQuill()&&!RUN.flags.quillUsed){RUN.flag('quillUsed');setTimeout(()=>say('quillFirst',5500),900);}}
  else log.textContent='';
  if(Math.random()<.45)say(D.cold?'rightCold':'right',2500);
  D.p=correct; answerArea.style.display='none'; renderStones();
  if(D.cold?D.p<=0:D.p>=D.target)return setTimeout(()=>endDuel(true),800);
  // kindred power: smaller dice than the boss get a boost after a right answer (the game adds it, not the child)
  const bonus=D.team?Math.round(sum(D.rolls)*(avgOf(D.rsides)/avgOf(mySides())-1)):0;
  if(bonus>0)return setTimeout(()=>{if(!D||D.dead)return;
    D.p=D.cold?Math.max(0,D.p-bonus):D.p+bonus; renderStones();
    question.innerHTML=`✨ The power of kindred ${D.cold?'frost takes away':'fire adds'} another <b>${bonus}</b> heat! ✨<br>The stone is at <b>${D.p}</b>.`;
    say(D.cold?'kindredFrost':'kindredFire',3000);
    if(D.cold?D.p<=0:D.p>=D.target)return setTimeout(()=>endDuel(true),1400);
    setTimeout(rivalTurn,1800);},700);
  setTimeout(rivalTurn,900);
}
async function rivalTurn(){
  if(!D||D.dead)return;
  const name=rName.textContent;
  question.textContent=`${name} rolls...`;
  let v;
  if(D.divert){const sets=await rollAnim(D.rsides,2);const i=sum(sets[0])<=sum(sets[1])?0:1;
    dice.children[1-i].classList.add('faded');v=sets[i];D.divert=false;
    question.textContent=`Diverted! ${name} must keep the smaller roll...`;await new Promise(r=>setTimeout(r,1300));}
  else v=(await rollAnim(D.rsides))[0];
  if(D.dead)return;
  const t=sum(v), before=D.r;
  D.r=D.cold?Math.max(0,before-t):before+t;
  const line=D.cold?`${name}: ${before} − ${v.join(' − ')} = <b>${D.r}</b>`:`${name}: ${before} + ${v.join(' + ')} = <b>${D.r}</b>`;
  question.innerHTML=line; renderStones();
  if(D.cold?D.r<=0:D.r>=D.target)return setTimeout(()=>endDuel(false),900);
  setTimeout(()=>{if(D.dead)return;rollBtn.style.display='';
    if(D.team){setMember((D.ti+1)%D.team.length);say('teamTurn',3000);}
    question.innerHTML=`${line}<br><span style="color:var(--gold)">${D.team?`${me().name}, it's your turn!`:"It's your turn!"}</span>`;updateArcherBtns();},700);
}
function endDuel(win){
  if(!D||D.dead)return;
  const name=rName.textContent, done=()=>RUN.finish(win?'win':'lose');
  if(D.boss){
    if(win){RUN.reward('wiz',2);say('bossWin',5000);
      const msg=D.cold?`The Frost Wyrm shivers... and melts into a puddle of respect.<br>The Frostpeaks are yours! More of the world is coming soon.`
        :`Elder Emberclaw bows her great head.<br>"The way to the Frostpeaks is open, little one."`;
      overlay(`<div class="big">🏆</div><h2>${D.team?'Together you beat':'You beat'} ${name}!</h2><div>${msg}</div><div>+2 Wizard badges${D.team?' each':''}</div>`,[['Onward!','fire',done]]);}
    else{say('bossLost',5000);
      overlay(`<div class="big">💨</div><h2>${name} is too strong today</h2><div>The boss needs a rest now. Explore a little, gather friends, and come back for a rematch!</div>`,
        [['Back to the map','fire',done]]);}
    return;}
  if(win){RUN.reward('wiz');say('duelWin',4500);
    overlay(`<div class="big">${D.cold?'❄️':'🔥'}🔮</div><h2>You win!</h2><div>+1 Wizard badge</div>`,[['Onward!','fire',done]]);}
  else{say('duelLose',4500);
    overlay(`<div class="big">💨</div><h2>${name} got there first</h2><div>No badge this time, but the bard is writing a revenge song.</div>`,[['Onward!','fire',done]]);}
}

Modules.register(M);
})();
