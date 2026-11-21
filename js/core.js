// ---------- Save ----------
const SAVE_KEY='dragonBardSave_v1';
let S={name:'',sig:null,wiz:0,sch:0,quill:0,quillUsed:false,colour:'green',hat:'red',
  owned:{green:1,red:1},hatsOwned:{red:1},run:null};
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s)S=Object.assign(S,s);}catch(e){}}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
load();

// ---------- Bard lines (ID = audio file name: audio/<id>.mp3) ----------
const LINES={
  intro:[{id:'intro_01',t:"Hello there! I'm Fennick, a bard. Well, a bard in training. What's your name, little dragon?"}],
  welcome:[{id:'welcome_01',t:"{name}! What a splendid name. That's going in a song!"}],
  map:[{id:'map_01',t:"Where to next? Pick a path, I'll follow. Mostly."},{id:'map_02',t:"Ooh, so many paths. You choose, I'll carry the lute."}],
  choice:[{id:'choice_01',t:"Choose your flame! Two little ones, or one big one? The other dragon has to use the same."}],
  boss:[{id:'boss_01',t:"That's the Elder. Her flames are BIG. Eight-sided big. I'll just... hide behind you."}],
  duelStart:[{id:'duel_01',t:"A heat duel! Roll the die and add that much heat to your stone. First to the target wins!"}],
  wrong:[
    {id:'wrong_01',t:"Are you sure? Please check again, I don't want to be toast..."},
    {id:'wrong_02',t:"Hmm. My lute says that number's a bit off-key."},
    {id:'wrong_03',t:"Ooh, close! Count it once more, for my nerves?"},
    {id:'wrong_04',t:"The stone looks… confused. Try again?"},
    {id:'wrong_05',t:"I'm no dragon, but even I think that's wrong. Maybe."},
    {id:'wrong_06',t:"Quick, quick, he's catching up! Have another look!"},
    {id:'wrong_07',t:"Psst. I won't tell anyone. Try again."}],
  right:[
    {id:'right_01',t:"Ha! Hot hot hot!"},
    {id:'right_02',t:"That's going in a song, that is."},
    {id:'right_03',t:"Look at him sweat! Well, smoulder."}],
  duelWin:[{id:'duelwin_01',t:"We won! I mean, YOU won. I cheered. Cheering counts."}],
  duelLose:[{id:'duellose_01',t:"Bah, lucky rolls. We'll roast him next time!"}],
  quillFirst:[{id:'quill_01',t:"You can WRITE dragon runes?! Amazing! Here, you can pick my hats now."}],
  searchStart:[{id:'search_01',t:"Bandits! Eek! I'll sing them a song... oh no, I've dropped all my letters! Find me some words!"}],
  searchWin:[{id:'searchwin_01',t:"They love it! Look, they're clapping. Well, mostly."}],
  protector:[{id:'protector_01',t:"Ooh, that one's humming along! I think he wants to join us. A bodyguard. For me. Finally."}],
  archer:[{id:'archer_01',t:"Three shield guards, one bow. Meet your new archer!"}],
  aim:[{id:'aim_01',t:"Our archer gives you a second shot! Pick the roll you like better."}],
  divert:[{id:'divert_01',t:"Look over there! Hehe, he's distracted. He has to keep the smaller roll."}],
  full:[{id:'full_01',t:"Our camp is full of shield guards! Maybe train some into archers?"}],
  hint:[{id:'hint_01',t:"Our shield guards used to be bandits. They know these woods. Which word should they sniff out?"}],
  coldStart:[{id:'cold_01',t:"A cold duel! Roll and take that much heat away from your stone. First to zero wins!"}],
  frozen:[{id:'frozen_01',t:"Frozen solid! Brrr, that's how it's done!"}],
  rightCold:[{id:'rightcold_01',t:"Brrr! Nicely done!"},{id:'rightcold_02',t:"Ice cold maths!"},{id:'rightcold_03',t:"Chilly AND correct!"}],
  frostBoss:[{id:'frostboss_01',t:"The Frost Wyrm! Its breath could freeze a waterfall. Eight-sided dice... brrr."}],
  frostWelcome:[{id:'frostwelcome_01',t:"Brrr! The Frostpeaks! I knew I should have packed a scarf."}],
  bossWin:[{id:'bosswin_01',t:"You did it! I'm writing a whole ballad about this. Three verses. Maybe four!"}],
  bossLost:[{id:'bosslost_01',t:"Phew, that was tough. Let's explore a bit, gather friends, and try again later!"}],
  bossResting:[{id:'bossrest_01',t:"Shh, the boss is resting. Let's come back after a little adventure."}],
  choiceCold:[{id:'choicecold_01',t:"Choose your frost! Two little ones, or one big one? The other dragon has to use the same."}],
  rhymeStart:[{id:'rhyme_01',t:"Help! My song needs a word at the end of each line. Which one rhymes?"}],
  rhymeWrong:[{id:'rhymewrong_01',t:"Hmm, say them both out loud. Do they sound alike?"},{id:'rhymewrong_02',t:"Close, but that doesn't rhyme. Try another!"}],
  rhymeRight:[{id:'rhymeright_01',t:"That rhymes! Lovely!"},{id:'rhymeright_02',t:"Ooh, that sounds perfect!"}],
  rhymeWin:[{id:'rhymewin_01',t:"What a song! I'll sing it at every inn from here to the sea."}],
  clockStart:[{id:'clock_01',t:"Ooh, spooky! These clocks all stopped, and the ghosts are stuck in time. I can't read clocks, but I found the instructions!"}],
  clockWrong:[{id:'clockwrong_01',t:"Hmm, the ghost is shaking its head. Let's look at the hands again."},{id:'clockwrong_02',t:"Not yet. Maybe peek at the clock guide?"}],
  clockRight:[{id:'clockright_01',t:"Tick, tock! The clock is running again!"},{id:'clockright_02',t:"Listen, it's ticking! The ghost looks so happy."}],
  clockStuck:[{id:'clockstuck_01',t:"Oh dear, this one is stuck for now. Let's try the next room."}],
  clockGhost1:[{id:'clockghost1_01',t:"Our ghost friend is pointing at the minutes. Spooky, but helpful!"}],
  clockGhost2:[{id:'clockghost2_01',t:"Two ghosts! One points at the minutes, one at the hour."}],
  clockGhostSolve:[{id:'clockghostsolve_01',t:"Whoosh! Our ghost friends set the clock all by themselves."}],
  clockWin:[{id:'clockwin_01',t:"The ghosts are at peace. That was brave of us! Mostly you."}],
  clockAll:[{id:'clockall_01',t:"Every clock is ticking! And look, one little ghost wants to come along!"}],
  clockLost:[{id:'clocklost_01',t:"These clocks are tricky. We can come back when we've practised a little."}],
  scribeStart:[{id:'scribe_01',t:"I'm painting the milestones, but I can't write dragon runes. Can you write the numbers for me?"}],
  scribeRight:[{id:'scriberight_01',t:"Perfect! Travellers will love that."},{id:'scriberight_02',t:"Ooh, very neat!"}],
  scribeWrong:[{id:'scribewrong_01',t:"Hmm, that one came out a bit different. Let's try again!"}],
  scribeWin:[{id:'scribewin_01',t:"Every milestone painted! Nobody will ever get lost on this road again."}],
  mysteryStart:[{id:'mystery_01',t:"A mystery! Read the clue carefully. Then tell our dragon where to sniff."}],
  mysteryWrong:[{id:'mysterywrong_01',t:"Not there. What did the clue say again?"},{id:'mysterywrong_02',t:"Hmm. Let's read it one more time."}],
  mysteryEnd:[{id:'mysteryend_01',t:"We solved it! Now, how shall we cheer them up?"}],
  hollowWelcome:[{id:'hollowwelcome_01',t:"The Haunted Hollow. Is it just me, or did that tree just wave at us?"}],
  swampWelcome:[{id:'swampwelcome_01',t:"Croakmire Swamp! Mind the mud. And the mozzies. And, well, everything."}],
  ghostJoin:[{id:'ghostjoin_01',t:"A ghost friend! They can't fight bandits, but they know all about clocks."}],
  lilyStart:[{id:'lily_01',t:"That's Old Burble, the lily farmer. Lovely fellow. Terrible at counting."}],
  lilyWrong:[{id:'lilywrong_01',t:"Whoa, wobbly! Count in steps, like Burble's trying to."},{id:'lilywrong_02',t:"Careful! The addigators are watching."}],
  lilyWin:[{id:'lilywin_01',t:"Across the pond and not even wet! Well, only a bit."}],
  gatorWrong:[{id:'gatorwrong_01',t:"Eek! It wants a bigger number than that!"},{id:'gatorwrong_02',t:"Grumpy gator! Bigger, we need bigger!"}],
  gatorWin:[{id:'gatorwin_01',t:"Shhh! Tiptoe… tiptoe… Don't step on that tail!"}],
  mozzieStart:[{id:'mozzie_01',t:"Mozzies! They won't sit still. Let's catch them in jars of ten."}],
  mozzieWrong:[{id:'mozziewrong_01',t:"Hmm, count the full jars first. Each jar has ten."}],
  mozzieWin:[{id:'mozziewin_01',t:"All sorted! And only three bites. On me. Lovely."}],
  rested:[{id:'rested_01',t:"Our friends are back from their nap. Well rested and only slightly grumpy!"}],
  retreat:[{id:'retreat_01',t:"A tactical retreat! Very wise. Very brave. Mostly wise."}],
  skip:[{id:'skip_01',t:"Our shield guard will handle this one. He'll need a long nap afterwards, though!"}],
  journeyEnd:[{id:'end_01',t:"What a journey! My feet hurt and my heart is full."}]
};
let bubbleTimer;
// Progress star: a number inside a star that turns gold once `need` is reached, with one ring
// (or pair of sound-wave brackets, style 'waves') per possible extra success, lighting up as they come.
function starMeter(el,{got=0,need=3,extra=0,style='rings'}){
  const W=200,H=150,cx=100,cy=75,gold='#ffcf4a',grey='#5d5675',done=got>=need;
  const pts=Array.from({length:10},(_,i)=>{const r=i%2?19:44,a=-Math.PI/2+i*Math.PI/5;return `${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`;}).join(' ');
  let rings='';
  for(let k=1;k<=extra;k++){const on=got>=need+k, c=on?gold:grey, w=on?5:3;
    if(style==='waves'){const r=50+k*14;
      rings+=`<path d="M${cx-r*.55} ${cy-r*.8} Q${cx-r*1.08} ${cy} ${cx-r*.55} ${cy+r*.8}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${on?' class="smOn"':''}/>`+
             `<path d="M${cx+r*.55} ${cy-r*.8} Q${cx+r*1.08} ${cy} ${cx+r*.55} ${cy+r*.8}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${on?' class="smOn"':''}/>`;}
    else rings+=`<circle cx="${cx}" cy="${cy}" r="${48+k*11}" fill="none" stroke="${c}" stroke-width="${w}"${on?' class="smOn"':''}/>`;}
  const was=el.dataset.got!=null?+el.dataset.got:got; el.dataset.got=got;
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" class="starMeter">${rings}
    <polygon points="${pts}" fill="${done?gold:'#3a3450'}" stroke="${done?'#fff3c4':grey}" stroke-width="3" stroke-linejoin="round"${done&&was<need?' class="smPop"':''}/>
    <text x="${cx}" y="${cy+9}" text-anchor="middle" font-size="26" font-weight="800" fill="${done?'#4a3200':'#cfc8e6'}">${done?got:`${got}/${need}`}</text></svg>`;
  if(got>was)el.querySelector('svg').classList.add('smBump');
}
// Read text aloud with the device's own voice (no network).
function hear(text,rate=.85){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=rate;u.lang='en-GB';speechSynthesis.speak(u);}catch(e){}}
function say(group,ms=4200){
  const arr=LINES[group]; if(!arr)return; const l=arr[Math.floor(Math.random()*arr.length)];
  const b=document.getElementById('bubble');
  b.textContent=l.t.replace('{name}',S.name||'friend'); b.classList.add('on');
  clearTimeout(bubbleTimer); bubbleTimer=setTimeout(()=>b.classList.remove('on'),ms);
  try{const a=new Audio('audio/'+l.id+'.mp3');a.play().catch(()=>{});}catch(e){}
}

// ---------- Art ----------
const COLOURS={green:'#4caf50',red:'#e84a3a',blue:'#3a7bff',purple:'#9b4dff',teal:'#1fb5a5',gold:'#f2c230',black:'#3b3b46'};
const DRAGON_SHOP=[
  {k:'green',name:'Green',cost:null},{k:'red',name:'Red',cost:null},
  {k:'blue',name:'Blue',cost:{sch:2},label:'2 📜'},
  {k:'purple',name:'Purple',cost:{wiz:2},label:'2 🔮'},
  {k:'teal',name:'Teal',cost:{sch:1,wiz:1},label:'1 📜 1 🔮'},
  {k:'gold',name:'Gold',cost:{quill:4},label:'4 🪶'},
  {k:'black',name:'Shadow',cost:{wiz:3,sch:3},label:'3 📜 3 🔮'}];
const HAT_SHOP=[{k:'red',name:'Red',cost:null},{k:'blue',name:'Blue',cost:null},{k:'green',name:'Green',cost:null},
  {k:'purple',name:'Purple',cost:{quill:2},label:'2 🪶'},{k:'gold',name:'Gold',cost:{quill:3},label:'3 🪶'}];

function dragonSVG(col,size=150,flip=false){
  const c=COLOURS[col]||col;
  return `<svg width="${size}" height="${size}" viewBox="0 0 200 200" style="${flip?'transform:scaleX(-1)':''}">
  <path d="M60 120 Q20 150 30 185 Q50 165 70 150Z" fill="${c}" stroke="#0007" stroke-width="4"/>
  <path d="M95 85 L60 20 L80 60 L50 45 L85 95Z" fill="${c}" opacity=".75" stroke="#0007" stroke-width="4"/>
  <ellipse cx="100" cy="130" rx="55" ry="42" fill="${c}" stroke="#0007" stroke-width="4"/>
  <ellipse cx="100" cy="142" rx="32" ry="24" fill="#fff6" />
  <path d="M110 92 L118 60 L128 92Z M125 92 L138 66 L142 96Z" fill="${c}" stroke="#0007" stroke-width="3"/>
  <circle cx="140" cy="88" r="32" fill="${c}" stroke="#0007" stroke-width="4"/>
  <ellipse cx="165" cy="98" rx="18" ry="13" fill="${c}" stroke="#0007" stroke-width="4"/>
  <circle cx="172" cy="94" r="2.5" fill="#0009"/>
  <circle cx="145" cy="80" r="9" fill="#fff"/><circle cx="148" cy="80" r="5" fill="#222"/>
  <path d="M128 60 L122 42 L136 56Z M146 57 L148 38 L156 58Z" fill="#ffe9b0" stroke="#0007" stroke-width="3"/>
  <rect x="70" y="160" width="18" height="24" rx="8" fill="${c}" stroke="#0007" stroke-width="4"/>
  <rect x="112" y="160" width="18" height="24" rx="8" fill="${c}" stroke="#0007" stroke-width="4"/>
  </svg>`;
}
function bardSVG(hat){
  const h=COLOURS[hat]||hat;
  return `<svg viewBox="0 0 110 130">
  <rect x="34" y="62" width="40" height="52" rx="12" fill="#7a4e2d" stroke="#0007" stroke-width="3"/>
  <circle cx="54" cy="44" r="20" fill="#f1c9a0" stroke="#0007" stroke-width="3"/>
  <circle cx="47" cy="42" r="3" fill="#222"/><circle cx="61" cy="42" r="3" fill="#222"/>
  <path d="M46 53 Q54 58 62 53" stroke="#222" stroke-width="3" fill="none"/>
  <path d="M28 32 Q54 6 82 30 Q56 22 28 32Z" fill="${h}" stroke="#0007" stroke-width="3"/>
  <path d="M74 22 Q98 4 92 30" stroke="#ffd166" stroke-width="4" fill="none"/>
  <ellipse cx="82" cy="92" rx="14" ry="18" fill="#c8893f" stroke="#0007" stroke-width="3"/>
  <rect x="78" y="56" width="6" height="34" fill="#8a5a2b"/>
  <rect x="38" y="112" width="12" height="16" rx="4" fill="#3b2a1a"/><rect x="58" y="112" width="12" height="16" rx="4" fill="#3b2a1a"/>
  </svg>`;
}
function refreshBard(){document.getElementById('bardSvg').innerHTML=bardSVG(S.hat);}

// ---------- Screens ----------
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));}
function overlay(html,buttons){
  const box=document.getElementById('overlayBox'); box.innerHTML=html;
  const row=document.createElement('div'); row.className='row';
  buttons.forEach(([label,cls,fn])=>{const b=document.createElement('button');b.className='btn '+cls;b.textContent=label;
    b.onclick=()=>{document.getElementById('overlay').classList.remove('on');fn&&fn();};row.appendChild(b);});
  box.appendChild(row); document.getElementById('overlay').classList.add('on');
}

// ---------- Helpers ----------
const sum=a=>a.reduce((x,y)=>x+y,0);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const NUMWORDS=['','One','Two','Three','Four','Five','Six'];

// ---------- Module runner ----------
// A module is {id, name, screen, html, defaults, presets, bind(), start(params, run), abort()}.
// The run object it receives:
//   run.params, run.party (guards(), archers(), useGuards(n,rest), useArcher(), canRecruit(n))
//   run.asked()                 a question is now on screen (starts the answer timer)
//   run.answered(correct,item)  log one attempt (time since the question or the previous attempt)
//   run.reward(kind,n)          wiz | sch | quill | guards
//   run.flag(name)              e.g. quillUsed
//   run.retreat(), run.skip()   buttons in the module's top bar
//   run.finish(outcome)         win | lose  (retreat/skip are reported by the host)
const Modules={list:{},current:null,
  register(m){this.list[m.id]=m;},
  mount(m){
    if(m.mounted)return;
    document.getElementById('stage').insertAdjacentHTML('beforeend',m.html);
    m.bind(); m.mounted=true;
    document.getElementById(m.screen).querySelectorAll('.retreatBtn').forEach(b=>b.onclick=()=>this.current&&this.current.run.retreat());
  },
  run(id,params,host){
    const m=this.list[id]; this.mount(m); this.abort();
    const run={id,params:Object.assign({},m.defaults||{},params||{}),host,party:host.party,
      attempts:[],rewards:{},flags:{},t0:performance.now(),qt:null,ended:false,
      asked(){this.qt=performance.now();},
      answered(correct,item){const now=performance.now();
        this.attempts.push({item:item==null?'':String(item),correct:!!correct,ms:this.qt!=null?Math.round(now-this.qt):null});this.qt=now;},
      reward(k,n=1){if(n)this.rewards[k]=(this.rewards[k]||0)+n;},
      flag(k){this.flags[k]=true;},
      retreat(){host.retreat(this);},
      skip(){host.skip(this);},
      report(outcome){return {module:id,params:this.params,outcome,rewards:this.rewards,flags:this.flags,stats:runStats(this)};},
      finish(outcome){if(this.ended)return;this.ended=true;Modules.current=null;host.done(this.report(outcome));}};
    this.current={m,run}; m.start(run.params,run); return run;
  },
  abort(){const c=this.current;if(!c)return;c.run.ended=true;c.m.abort&&c.m.abort();this.current=null;}};
function runStats(run){
  let q=0,first=0,wrong=0;const ms=[];
  run.attempts.forEach(a=>{if(a.ms!=null)ms.push(Math.min(a.ms,60000));
    if(a.correct){q++;if(!wrong)first++;wrong=0;}else wrong++;});
  ms.sort((a,b)=>a-b);
  return {questions:q,attempts:run.attempts.length,firstTry:first,firstTryRate:q?first/q:null,
    medianMs:ms.length?ms[Math.floor(ms.length/2)]:null,totalMs:Math.round(performance.now()-run.t0),log:run.attempts};
}
