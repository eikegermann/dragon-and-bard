// ---------- Module: Rhyme rescue (finish the bard's song) ----------
(function(){
const RHYMES={
 forest:[
  {a:'A tiny brown frog',b:'sat on a',ans:'log',em:'🪵',opts:[['cup','☕'],['tree','🌳']]},
  {a:'The bard has a hat',b:'that was chewed by a',ans:'rat',em:'🐀',opts:[['dog','🐶'],['owl','🦉']]},
  {a:'I hear a big roar',b:'right outside the',ans:'door',em:'🚪',opts:[['tree','🌳'],['moon','🌙']]},
  {a:'The dragon can fly',b:'way up in the',ans:'sky',em:'☁️',opts:[['sea','🌊'],['box','📦']]},
  {a:'My fire is hot',b:'it bubbles the',ans:'pot',em:'🍲',opts:[['cup','☕'],['fish','🐟']]},
  {a:'Look at the fox',b:'asleep in a',ans:'box',em:'📦',opts:[['tree','🌳'],['bed','🛏️']]},
  {a:'The bandit was sad',b:'but now he is',ans:'glad',em:'😊',opts:[['cross','😠'],['sleepy','😴']]},
  {a:'A dragon called Fred',b:'went straight to his',ans:'bed',em:'🛏️',opts:[['cave','🕳️'],['boat','⛵']]},
  {a:'I found a big stone',b:'as old as a',ans:'bone',em:'🦴',opts:[['rock','🪨'],['log','🪵']]},
  {a:'The bard lost his lute',b:'it fell in his',ans:'boot',em:'👢',opts:[['bag','👜'],['hat','🎩']]},
  {a:'Look at that bug',b:'having tea from a',ans:'mug',em:'☕',opts:[['pot','🍲'],['box','📦']]},
  {a:'The goat in the boat',b:'is wearing a',ans:'coat',em:'🧥',opts:[['hat','🎩'],['sock','🧦']]},
  {a:'The big hungry bear',b:'sat down on a',ans:'chair',em:'🪑',opts:[['log','🪵'],['bed','🛏️']]},
  {a:'I see a red hen',b:'she is counting to',ans:'ten',em:'🔟',opts:[['six','6️⃣'],['two','2️⃣']]},
  {a:'A dragon named Kate',b:'ate soup from a',ans:'plate',em:'🍽️',opts:[['bowl','🥣'],['cup','☕']]},
  {a:'The owl in the tree',b:'is hooting at',ans:'me',em:'👋',opts:[['you','👉'],['us','👫']]}],
 frost:[
  {a:'The flakes of snow',b:'fall soft and',ans:'slow',em:'🐌',opts:[['fast','🐇'],['white','⬜']]},
  {a:'The ice is so cold',b:'it shines like',ans:'gold',em:'🪙',opts:[['glass','🪟'],['snow','❄️']]},
  {a:'A polar bear',b:'jumped high in the',ans:'air',em:'💨',opts:[['snow','❄️'],['sea','🌊']]},
  {a:'The wind will blow',b:'across the white',ans:'snow',em:'❄️',opts:[['ice','🧊'],['hill','⛰️']]},
  {a:'My nose is red',b:'so I ride my',ans:'sled',em:'🛷',opts:[['bike','🚲'],['boat','⛵']]},
  {a:'The mountain is tall',b:'let\'s make a snow',ans:'ball',em:'⚪',opts:[['man','⛄'],['flake','❄️']]},
  {a:'A fish in the lake',b:'is wide',ans:'awake',em:'👀',opts:[['asleep','😴'],['cold','🥶']]},
  {a:'The dogs pull the sled',b:'with noses so',ans:'red',em:'🔴',opts:[['cold','🥶'],['wet','💧']]},
  {a:'Brr, what a chill',b:'let\'s ski down the',ans:'hill',em:'⛰️',opts:[['lake','🏞️'],['road','🛣️']]},
  {a:'We built an igloo',b:'with room for us',ans:'two',em:'2️⃣',opts:[['three','3️⃣'],['four','4️⃣']]},
  {a:'The frost giant\'s toe',b:'is stuck in the',ans:'snow',em:'❄️',opts:[['ice','🧊'],['mud','🟤']]},
  {a:'The eagle can see',b:'a seal under the',ans:'sea',em:'🌊',opts:[['ice','🧊'],['rock','🪨']]},
  {a:'My mittens are wet',b:'I\'ll dry them, you',ans:'bet',em:'👍',opts:[['know','💭'],['see','👀']]},
  {a:'The yeti is shy',b:'he waves us good',ans:'bye',em:'👋',opts:[['night','🌙'],['day','☀️']]}]};

let RH=null, RUN=null;

const M={
  id:'rhyme', name:'Rhyme rescue', screen:'rhyme',
  defaults:{set:'forest',pictures:true,verses:4},
  presets:{
    'Forest · with pictures':{set:'forest',pictures:true},
    'Forest · words only':{set:'forest',pictures:false},
    'Frost · with pictures':{set:'frost',pictures:true},
    'Frost · words only':{set:'frost',pictures:false}},
  html:`
<section id="rhyme" class="screen">
  <div class="topbar enc"><button class="btn ghost retreatBtn tl">↩ Retreat</button>
    <b>Rhyme rescue! Help the bard finish his song</b>
    <button class="btn ghost tr" id="skipRhyme">🛡️ Skip</button></div>
  <div id="rhymeBody">
    <div class="scol rsong">
      <div class="small">The bard's song</div>
      <div id="songSoFar"></div>
    </div>
    <div id="rhymeMain">
      <div id="verse"></div>
      <button class="btn ghost" id="hearBtn">🔊 Hear it</button>
      <div id="rhymeOpts"></div>
    </div>
    <div class="scol" style="align-items:center">
      <div id="rhymeCrowd"></div>
      <div id="rhymeStars"></div>
      <div class="small" id="rhymeInfo" style="text-align:center;white-space:pre-line"></div>
    </div>
  </div>
</section>`,
  bind(){
    skipRhyme.onclick=()=>RUN&&RUN.skip();
    hearBtn.onclick=()=>{if(!RH)return;try{const v=RH.pool[RH.i];speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(`${v.a}. ${v.b}... hmm hmm?`);u.rate=.8;u.lang='en-GB';speechSynthesis.speak(u);}catch(e){}};
  },
  start(p,run){
    RUN=run;
    const set=RHYMES[p.set]||RHYMES.forest;
    RH={pool:[...set].sort(()=>Math.random()-.5).slice(0,Math.min(p.verses||4,set.length)),i:0,stars:0,pictures:p.pictures!==false};
    skipRhyme.style.visibility=RUN.party.guards()>0?'visible':'hidden';
    show('rhyme'); renderVerse(); setTimeout(()=>say('rhymeStart',6000),300);
  },
  abort(){RH=null;}
};

function renderVerse(){
  const v=RH.pool[RH.i]; RH.firstTry=true; RH.done=false;
  verse.innerHTML=`${v.a},<br>${v.b} <span class="blank" id="blank">?</span>`;
  const opts=[[v.ans,v.em],...v.opts].sort(()=>Math.random()-.5);
  rhymeOpts.innerHTML='';
  opts.forEach(([w,e])=>{const b=document.createElement('button');b.className='ropt';
    b.innerHTML=(RH.pictures?`<span class="em">${e}</span>`:'')+`<span>${w}</span>`;b.onclick=()=>pickRhyme(b,w);rhymeOpts.appendChild(b);});
  renderSide(); RUN.asked();
}
function renderSide(){
  const n=RH.pool.length, doneN=RH.i+(RH.done?1:0);
  songSoFar.innerHTML=RH.pool.slice(0,doneN).map(v=>`<div class="songverse">${v.a},<br>${v.b} <b>${v.ans}</b>.</div>`).join('')+
    (doneN<n?`<div class="songverse todo">${n-doneN} more verse${n-doneN>1?'s':''} to go…</div>`:'');
  rhymeCrowd.textContent='😐'.repeat(n-doneN)+'😄'.repeat(doneN);
  rhymeStars.textContent='⭐'.repeat(RH.stars)+'☆'.repeat(n-doneN);
  rhymeInfo.textContent=(doneN<n?`Verse ${RH.i+1} of ${n}`:'Song complete!')+(RH.pictures?'':'\nNo pictures this time!')+
    '\nA ⭐ for every rhyme right first time.\n3 ⭐ and a listener may join you!';
}
function pickRhyme(b,w){
  if(!RH||RH.done)return; const v=RH.pool[RH.i];
  RUN.answered(w===v.ans,`${v.ans} (picked ${w})`);
  if(w!==v.ans){b.classList.add('no');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');RH.firstTry=false;say('rhymeWrong',3500);return;}
  RH.done=true; if(RH.firstTry)RH.stars++;
  const bl=document.getElementById('blank'); bl.textContent=v.ans; bl.classList.add('got');
  renderSide(); say('rhymeRight',2500);
  setTimeout(()=>{if(!RH)return;RH.i++; if(RH.i>=RH.pool.length)endRhyme(); else renderVerse();},1500);
}
function endRhyme(){
  RUN.reward('sch'); let joined=false;
  if(RH.stars>=3&&RUN.party.canRecruit(1)){RUN.reward('guards',1);joined=true;}
  say('rhymeWin',4500);
  overlay(`<div class="big">🎵${'⭐'.repeat(RH.stars)}</div><h2>The song is finished!</h2>
    <div class="fullsong">${RH.pool.map(v=>`<p>${v.a},<br>${v.b} <b>${v.ans}</b>.</p>`).join('')}</div>
    <div>${joined?'A bandit in the crowd loved it so much, they joined your party as a shield guard!':'The bard takes a bow. The crowd claps.'}</div><div>+1 Scholar badge</div>`,
    [['Onward!','fire',()=>RUN.finish('win')]]);
}

Modules.register(M);
})();
