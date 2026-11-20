// ---------- Module: Ghost mysteries (reading comprehension) ----------
// Someone tells you a clue; you show you understood by choosing where to search, and the dragon sniffs
// (ghosts can't smell, dragons can). Questions paraphrase the text, so matching words isn't enough.
// Answer formats get harder by level: tap a spot in the picture → choose a word → fill the gap.
// Each story ends with one "why" question (putting clues together) and a happy ending you choose.
(function(){
// Stories are data. Text kept short and mostly decodable; 'hear' reads it aloud.
const STORIES={
 dog:{title:'The lost ghost dog',who:'👦👻',
  scenes:[
   {place:'The garden',bg:'#1f2d27',speaker:'👦👻 Tom, a ghost boy',
    text:'I am Tom. I lost my dog, Pip. I saw him run to the old tree. And my best sock is lost too!',
    ask:{picture:'Where should we look first?',words:'Where did Pip run to?',gap:'Pip ran to the old ___.'},
    spots:[['tree','🌳','old tree',22,42],['shed','🛖','shed',70,30],['pond','🪷','pond',58,72],['gate','🚪','gate',12,78]],answer:'tree',
    found:'There is a hole by the tree! Tom says: "Pip dug holes here for his bones, back when he could still dig. He took the bones from the kitchen."'},
   {place:'The old house',bg:'#2a2232',speaker:'👦👻 Tom',
    text:'Pip took the bones from the kitchen. He was always hungry!',
    ask:{picture:'Which room should we search?',words:'Where did Pip get his bones?',gap:'Pip got his bones from the ___.'},
    spots:[['kitchen','🍳','kitchen',26,62],['attic','🕸️','attic',50,16],['bath','🛁','bathroom',76,60],['cellar','🪜','cellar',50,84]],answer:'kitchen',
    found:'The cook\'s ghost is in the kitchen, stirring an empty pot.'},
   {place:'The kitchen',bg:'#33261c',speaker:'👩‍🍳👻 The cook',
    text:'Pip was here! He sat and begged for a sausage. Then he ran up the stairs with something in his mouth.',
    ask:{picture:'Where did Pip go next?',words:'Which way did Pip run?',gap:'Pip ran up the ___.'},
    spots:[['stairs','🪜','stairs',78,40],['oven','🔥','oven',24,46],['door','🚪','back door',50,78],['pot','🍲','pot',44,34]],answer:'stairs',
    found:'Up the stairs, you hear a tiny snore. Zzz… zzz…'},
   {place:'Upstairs',bg:'#252038',speaker:'🐉 Your dragon sniffs',
    text:'Sniff, sniff. The snore comes from under the bed. Something soft is under there too.',
    ask:{picture:'Where is the snore coming from?',words:'Where is the snoring?',gap:'The snore is under the ___.'},
    spots:[['bed','🛏️','bed',30,58],['chest','🧰','chest',72,64],['curtain','🪟','window',56,22],['lamp','🕯️','candle',82,30]],answer:'bed',
    found:'It\'s Pip! He is fast asleep, curled up on Tom\'s best sock. 🐶👻🧦'}],
  why:{q:'Why did Pip hide under the bed?',opts:['He took Tom\'s sock','He was scared of the cook','He wanted a bath'],answer:0},
  endings:[['⚽ Make a ghost ball for Pip to fetch','Pip zooms after the ghost ball, round and round the room!'],
           ['🌅 Play with Tom and Pip until sunrise','You play hide and seek until the sky turns pink. Pip always wins.'],
           ['🐾 Give Pip a big belly rub','Pip rolls over and his ghostly tail wags so fast it blurs!']],
  outro:'Tom hugs Pip (and his sock). "Thank you! If you want to go on, the swamp is that way. Watch out for the addigators!"'},
 hunter:{title:'The ghost hunter',who:'🧑‍🔬',
  scenes:[
   {place:'The front hall',bg:'#232331',speaker:'🧑‍🔬 Hattie, a ghost hunter',
    text:'Hello! I am looking for a ghost called Mabel. She likes books, so I think she hides in the library.',
    ask:{picture:'Where should we look first?',words:'Where does Hattie think Mabel hides?',gap:'Hattie thinks Mabel hides in the ___.'},
    spots:[['library','📚','library',24,40],['hall','🕰️','clock',74,34],['kitchen','🍳','kitchen',60,74],['garden','🌳','garden',16,78]],answer:'library',
    found:'The library is dusty. On a desk there is a note in wobbly old letters.'},
   {place:'The library',bg:'#2b2418',speaker:'📜 The note says',
    text:'Gone to the music room. Do not follow me!',
    ask:{picture:'Where did Mabel go?',words:'Which room is Mabel in now?',gap:'Mabel went to the ___ room.'},
    spots:[['music','🎻','music room',70,30],['books','📚','book shelf',24,40],['attic','🕸️','attic',50,14],['cellar','🪜','cellar',50,86]],answer:'music',
    found:'In the music room, the piano plays three soft notes all by itself. Then a cold breeze blows past the big curtain.'},
   {place:'The music room',bg:'#1e2333',speaker:'🐉 Your dragon sniffs',
    text:'Sniff, sniff. Brrr! The big curtain is very cold, and it is shaking a little.',
    ask:{picture:'Where is Mabel hiding?',words:'Where is the cold, shaking spot?',gap:'Mabel hides behind the ___.'},
    spots:[['curtain','🪟','curtain',74,40],['piano','🎹','piano',28,60],['harp','🪕','harp',50,26],['chair','🪑','chair',56,78]],answer:'curtain',
    found:'Behind the curtain is Mabel, a little ghost girl, shaking like a leaf. "Please don\'t catch me!"'}],
  why:{q:'Why was Mabel hiding?',opts:['She was scared of the ghost hunter','She was playing hide and seek','She was cold'],answer:0},
  endings:[['💌 Tell Mabel that Hattie\'s gran was her friend','Mabel gasps. "Little Rosie? Rosie was my best friend!"'],
           ['📷 Let Hattie take a happy photo of Mabel','Mabel does her best spooky pose. Then she giggles.'],
           ['☕ Have a cup of tea and talk about the old days','Mabel tells stories about the house until the tea is cold.']],
  outro:'Hattie only wanted to talk, and now Mabel has a new friend. "The road north goes to the tundra," says Mabel. "Wrap up warm!"'}
};
const LEVELS={picture:1,words:2,gap:3};
let MY=null,RUN=null;

const M={
  id:'mystery', name:'Ghost mysteries', screen:'mystery',
  defaults:{story:'dog',level:'picture'},
  presets:{
    'Lost ghost dog · pictures':{story:'dog',level:'picture'},
    'Lost ghost dog · words':{story:'dog',level:'words'},
    'Lost ghost dog · fill the gap':{story:'dog',level:'gap'},
    'Ghost hunter · pictures':{story:'hunter',level:'picture'},
    'Ghost hunter · words':{story:'hunter',level:'words'},
    'Ghost hunter · fill the gap':{story:'hunter',level:'gap'}},
  html:`
<section id="mystery" class="screen">
  <div class="topbar enc"><button class="btn ghost retreatBtn tl">↩ Retreat</button>
    <b id="myTitle"></b><span class="tr" id="myStep"></span></div>
  <div id="myBody">
    <div id="myStory"><div id="mySpeaker"></div><div id="myText"></div>
      <button class="btn ghost" id="myHear">🔊 Hear it</button></div>
    <div id="myAsk"></div>
    <div id="myScene"></div>
    <div id="myMsg"></div>
  </div>
</section>`,
  bind(){myHear.onclick=()=>hear(myText.textContent);},
  start(p,run){
    RUN=run; const st=STORIES[p.story]||STORIES.dog;
    MY={p,st,i:0,tries:0,lvl:LEVELS[p.level]||1,busy:false};
    myTitle.textContent=st.title; show('mystery'); scene(); setTimeout(()=>say('mysteryStart',5000),300);
  },
  abort(){MY=null;try{speechSynthesis.cancel();}catch(e){}}
};
function scene(){
  const sc=MY.st.scenes[MY.i]; MY.tries=0; MY.busy=false;
  myStep.textContent=`Clue ${MY.i+1} of ${MY.st.scenes.length}`;
  myBody.style.setProperty('--scene',sc.bg);
  mySpeaker.textContent=sc.speaker; myText.textContent=sc.text; myMsg.textContent='';
  const q=MY.lvl===1?sc.ask.picture:MY.lvl===2?sc.ask.words:'Choose the missing word:';
  myAsk.innerHTML=`<b>${q}</b>${MY.lvl===3?`<div class="mygap">${sc.ask.gap.replace('___','<span class="myblank">?</span>')}</div>`:''}`;
  if(MY.lvl===1){
    myScene.className='pic';
    myScene.innerHTML=`<div class="myplace">${sc.place}</div>`+sc.spots.map(([id,ic,label,x,y])=>
      `<button class="myspot" data-id="${id}" style="left:${x}%;top:${y}%"><span>${ic}</span><small>${label}</small></button>`).join('');
  }else{
    myScene.className='words';
    const opts=[...sc.spots].sort(()=>Math.random()-.5);
    myScene.innerHTML=opts.map(([id,ic,label])=>`<button class="btn myword" data-id="${id}">${MY.lvl===3?gapWord(sc,id,label):label}</button>`).join('');
  }
  myScene.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>choose(b.dataset.id,b));
  RUN.asked();
}
// In fill-the-gap, offer the word that would fit the sentence (e.g. "tree" for "the old ___").
function gapWord(sc,id,label){return label.replace(/^(old|back|big|book|music) /,'').replace(' room','');}
function choose(id,el){
  if(!MY||MY.busy)return;
  const sc=MY.st.scenes[MY.i], ok=id===sc.answer, label=sc.spots.find(s=>s[0]===id)[2];
  RUN.answered(ok,`${MY.st.title} · clue ${MY.i+1}: ${sc.ask.words} → ${label}`);
  if(!ok){MY.tries++;el.classList.add('nope');el.disabled=true;
    myMsg.textContent=pick(['Sniff, sniff… nothing here but cobwebs.','Sniff… just dust! Read the clue again.','Nope, only a sleepy spider here.']);
    say('mysteryWrong',3000);return;}
  MY.busy=true; el.classList.add('yes');
  if(MY.lvl===3){const bl=myAsk.querySelector('.myblank');if(bl){bl.textContent=gapWord(sc,id,label);bl.classList.add('filled');}}
  myMsg.textContent='Sniff, sniff… 🐾 Paw prints!';
  setTimeout(()=>{if(!MY)return;
    overlay(`<div class="big">🐾</div><h2>A clue!</h2><div>${sc.found}</div>`,[['Onward','fire',()=>next()]]);},900);
}
function next(){
  if(!MY)return; MY.i++;
  if(MY.i<MY.st.scenes.length)return scene();
  why();
}
function why(){
  const w=MY.st.why, order=w.opts.map((o,k)=>k).sort(()=>Math.random()-.5);
  myStep.textContent='One last thing';
  mySpeaker.textContent='🎻 The bard wonders'; myText.textContent=w.q; myMsg.textContent='';
  myAsk.innerHTML='<b>Think about the whole story. What do you think?</b>'; myScene.className='words';
  myScene.innerHTML=order.map(k=>`<button class="btn myword long" data-k="${k}">${w.opts[k]}</button>`).join('');
  RUN.asked(); let tries=0;
  myScene.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{
    const ok=+b.dataset.k===w.answer; RUN.answered(ok,`${MY.st.title} · why: ${w.q} → ${w.opts[b.dataset.k]}`);
    if(!ok){tries++;b.classList.add('nope');b.disabled=true;myMsg.textContent='Hmm, could be… but think about what was missing at the start!';return;}
    b.classList.add('yes'); setTimeout(ending,800);});
}
function ending(){
  if(!MY)return;
  say('mysteryEnd',4000);
  overlay(`<div class="big">${MY.st.who}</div><h2>How will you make them happy?</h2>`,
    MY.st.endings.map(([label,res])=>[label,'',()=>{RUN.flag('ending:'+label);
      setTimeout(()=>{RUN.reward('sch');
        overlay(`<div class="big">💖</div><h2>${res}</h2><div>${MY.st.outro}</div><div>+1 Scholar badge</div>`,[['Onward!','fire',()=>RUN.finish('win')]]);},50);}]));
}
Modules.register(M);
})();
