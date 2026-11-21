// ---------- Module: Stopped clocks (Haunted Hollow) ----------
// A haunted house with a few rooms. Each room has a stopped clock and a ghost stuck in time.
// Set the hands to the time on the ghost's note and press Check. Free enough clocks to win;
// free them all and a ghost may travel with you for a while.
// Ghost companions can help: 1 ghost lights up the minutes, 2 ghosts also the hour, 3 ghosts set the clock.
(function(){
const STEP={hour:60,half:30,quarter:15,five:5,minute:1};
const NUM=['twelve','one','two','three','four','five','six','seven','eight','nine','ten','eleven'];
const ROOMS=['🛏️ Bedroom','🍽️ Dining room','📚 Library','🎻 Music room','🕯️ Attic','🧺 Cellar'];

let CK=null, RUN=null;

const M={
  id:'clock', name:'Stopped clocks', screen:'clock',
  defaults:{level:'quarter',format:'12h',clocks:3,need:2,tries:3,minuteRing:true,ring24:false},
  presets:{
    "O'clock":{level:'hour',format:'12h',minuteRing:false},
    'Half past':{level:'half',format:'12h',minuteRing:false},
    'Quarter past and to':{level:'quarter',format:'12h',minuteRing:true},
    'Quarters in words':{level:'quarter',format:'words',minuteRing:true},
    'Five minutes':{level:'five',format:'12h',minuteRing:true},
    'Five minutes · no helper ring':{level:'five',format:'12h',minuteRing:false},
    'Any minute':{level:'minute',format:'12h',minuteRing:false},
    '24-hour · quarters (with inner ring)':{level:'quarter',format:'24h',minuteRing:true,ring24:true},
    '24-hour · five minutes':{level:'five',format:'24h',minuteRing:false,ring24:false}},
  html:`
<section id="clock" class="screen">
  <div class="topbar enc"><button class="btn ghost retreatBtn tl">↩ Retreat</button>
    <b>The stopped clocks: set each clock to free its ghost</b>
    <button class="btn ghost tr" id="ckSkip">🛡️ Skip</button></div>
  <div id="ckBody">
    <div class="scol">
      <div class="small">The house</div>
      <div id="ckRooms"></div>
    </div>
    <div id="ckMain">
      <div id="ckNote"></div>
      <svg id="ckFace" viewBox="-125 -125 250 250"></svg>
      <div class="row" style="gap:14px"><button class="btn fire" id="ckCheck">✔ Check</button></div>
      <div id="ckMsg" class="small"></div>
    </div>
    <div class="scol" style="align-items:stretch">
      <div id="ckMeter"></div>
      <button class="btn gold" id="ckHelp">📖 How to read a clock</button>
      <div class="small" id="ckGhostInfo"></div>
      <button class="btn ghost" id="ckG1">👻 Show the minutes</button>
      <button class="btn ghost" id="ckG2">👻👻 Show minutes and hour</button>
      <button class="btn ghost" id="ckG3">👻👻👻 Set this clock for me</button>
      <div class="small" id="ckInfo" style="white-space:pre-line"></div>
    </div>
  </div>
</section>`,
  bind(){
    ckSkip.onclick=()=>RUN&&RUN.skip();
    ckCheck.onclick=check;
    ckHelp.onclick=help;
    ckG1.onclick=()=>ghostHelp(1); ckG2.onclick=()=>ghostHelp(2); ckG3.onclick=()=>ghostHelp(3);
    const svg=ckFace;
    svg.addEventListener('pointerdown',e=>{if(!CK||CK.busy)return;const h=pickHand(e);if(!h)return;CK.drag=h;svg.setPointerCapture(e.pointerId);moveHand(e);e.preventDefault();});
    svg.addEventListener('pointermove',e=>{if(CK&&CK.drag)moveHand(e);});
    const up=()=>{if(CK)CK.drag=null;};
    svg.addEventListener('pointerup',up); svg.addEventListener('pointercancel',up);
  },
  start(p,run){
    RUN=run;
    const n=Math.max(1,Math.min(p.clocks||3,ROOMS.length));
    CK={p,step:STEP[p.level]||15,targets:makeTargets(p,n),rooms:ROOMS.slice(0,n),state:Array(n).fill('todo'),
        i:0,tries:0,firstTry:true,h:12,m:0,hint:0,drag:null,busy:false,freed:0};
    ckSkip.style.visibility=RUN.party.guards()>0?'visible':'hidden';
    show('clock'); loadClock(); setTimeout(()=>say('clockStart',6500),300);
  },
  abort(){CK=null;},
  peek(){return CK&&{target:CK.targets[CK.i],h:CK.h,m:CK.m,busy:CK.busy};}   // for tests
};

// ----- times -----
function makeTargets(p,n){
  const out=[], seen=new Set();
  let guard=0;
  while(out.length<n&&guard++<200){
    const h=1+Math.floor(Math.random()*12);
    let m;
    if(p.level==='hour')m=0;
    else if(p.level==='half')m=Math.random()<.7?30:0;
    else if(p.level==='quarter')m=[15,30,45,0][Math.floor(Math.random()*(out.length?4:3))];
    else if(p.level==='five')m=5*Math.floor(Math.random()*12);
    else m=Math.floor(Math.random()*60);
    const k=h+':'+m; if(seen.has(k))continue; seen.add(k);
    const pm=Math.random()<.6;   // 24h: afternoon times are the interesting ones
    out.push({h,m,h24:p.format==='24h'?(pm?(h===12?12:h+12):(h===12?0:h)):null});
  }
  return out;
}
const pad=x=>String(x).padStart(2,'0');
// The note's text, split into parts so hints can colour the minutes and the hour.
function noteParts(t,fmt){
  if(fmt==='24h')return [{k:'h',s:pad(t.h24)},{s:':'},{k:'m',s:pad(t.m)}];
  if(fmt==='words'){
    const nx=NUM[t.h%12], next=NUM[(t.h%12+1)%12];
    if(t.m===0)return [{k:'h',s:cap(nx)},{s:' o\'clock'}];
    if(t.m===30)return [{k:'m',s:'Half past'},{s:' '},{k:'h',s:nx}];
    if(t.m===15)return [{k:'m',s:'Quarter past'},{s:' '},{k:'h',s:nx}];
    if(t.m===45)return [{k:'m',s:'Quarter to'},{s:' '},{k:'h',s:next}];
    if(t.m<30)return [{k:'m',s:`${t.m} minute${t.m>1?'s':''} past`},{s:' '},{k:'h',s:nx}];
    return [{k:'m',s:`${60-t.m} minute${60-t.m>1?'s':''} to`},{s:' '},{k:'h',s:next}];
  }
  return [{k:'h',s:String(t.h)},{s:':'},{k:'m',s:pad(t.m)}];
}
const cap=s=>s[0].toUpperCase()+s.slice(1);
function noteText(t,fmt){return noteParts(t,fmt).map(x=>x.s).join('');}
// Which number the hour hint lights: the hour the words name ("quarter to three" lights 3).
function hintHour(t,fmt){return fmt==='words'&&t.m>30?(t.h%12)+1:t.h;}

// ----- drawing -----
const R=88;
function pos(deg,r){const a=(deg-90)*Math.PI/180;return [r*Math.cos(a),r*Math.sin(a)];}
function faceSVG(o){
  // o: {h,m,minuteRing,ring24,glowM,glowH}
  let s=`<circle r="${R+6}" fill="#2a2340"/><circle r="${R}" fill="#fffaf0"/>`;
  for(let i=0;i<60;i++){const [x1,y1]=pos(i*6,R-(i%5?5:10)),[x2,y2]=pos(i*6,R-1);
    s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2a2340" stroke-width="${i%5?1.2:3}"/>`;}
  if(o.glowM!=null){const [x,y]=pos(o.glowM*6,o.minuteRing?R+18:R-4);
    s+=`<circle class="ckglow m" cx="${x}" cy="${y}" r="${o.minuteRing?13:9}"/>`;}
  if(o.glowH!=null){const [x,y]=pos((o.glowH%12)*30,68);s+=`<circle class="ckglow h" cx="${x}" cy="${y}" r="15"/>`;}
  for(let n=1;n<=12;n++){const [x,y]=pos(n*30,68);
    s+=`<text x="${x}" y="${y+7}" text-anchor="middle" font-size="21" font-weight="800" fill="#2a2340">${n}</text>`;
    if(o.ring24){const [a,b]=pos(n*30,48);s+=`<text x="${a}" y="${b+4}" text-anchor="middle" font-size="11" fill="#b23a48">${n===12?'00':n+12}</text>`;}}
  if(o.minuteRing)for(let k=0;k<12;k++){const [x,y]=pos(k*30,R+18);
    s+=`<text x="${x}" y="${y+4}" text-anchor="middle" font-size="11" font-weight="700" fill="#9fd3ff">${pad(k*5)}</text>`;}
  if(o.h!=null){
    const ha=((o.h%12)*30)+o.m*.5, ma=o.m*6;
    const [hx,hy]=pos(ha,46),[mx,my]=pos(ma,74);
    s+=`<line x1="0" y1="0" x2="${hx}" y2="${hy}" stroke="#e8743b" stroke-width="9" stroke-linecap="round"/>`+
       `<line x1="0" y1="0" x2="${mx}" y2="${my}" stroke="#2f6fb3" stroke-width="5" stroke-linecap="round"/>`+
       `<circle r="6" fill="#2a2340"/>`;
  }
  return s;
}
function draw(){
  const t=CK.targets[CK.i], fmt=CK.p.format;
  ckFace.innerHTML=faceSVG({h:CK.h,m:CK.m,minuteRing:CK.p.minuteRing,ring24:CK.p.ring24,
    glowM:CK.hint>=1?t.m:null,
    glowH:CK.hint>=2?hintHour(t,fmt):null});
}

// ----- dragging -----
function ptr(e){const r=ckFace.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*250-125,y=(e.clientY-r.top)/r.height*250-125;
  let deg=Math.atan2(y,x)*180/Math.PI+90; if(deg<0)deg+=360; return {deg,r:Math.hypot(x,y)};}
const adiff=(a,b)=>{const d=Math.abs(a-b)%360;return d>180?360-d:d;};
function pickHand(e){
  const p=ptr(e); if(p.r>R+30)return null;
  if(CK.p.level==='hour')return 'h';            // the minute hand stays on 12 at this level
  const ha=((CK.h%12)*30)+CK.m*.5, ma=CK.m*6, dh=adiff(p.deg,ha), dm=adiff(p.deg,ma);
  if(dh<25&&dm<25)return p.r<52?'h':'m';
  return dh<dm?'h':'m';
}
function moveHand(e){
  const p=ptr(e);
  if(CK.drag==='m'){
    const m=(Math.round(p.deg/6/CK.step)*CK.step)%60;
    // geared like a real clock: carrying the minute hand past 12 moves the hour on (or back)
    if(CK.m>=45&&m<15)CK.h=CK.h%12+1; else if(CK.m<15&&m>=45)CK.h=(CK.h+10)%12+1;
    CK.m=m;}
  else{let h=Math.round((p.deg-CK.m*.5)/30); h=((h%12)+12)%12; CK.h=h===0?12:h;}
  ckMsg.textContent=''; draw();
}

// ----- flow -----
function loadClock(){
  const t=CK.targets[CK.i];
  CK.tries=0; CK.firstTry=true; CK.hint=0; CK.busy=false;
  // the clock stopped at some other time
  do{CK.h=1+Math.floor(Math.random()*12);CK.m=CK.p.level==='hour'?0:(Math.floor(Math.random()*60/CK.step)*CK.step)%60;}
  while(CK.h===t.h&&CK.m===t.m);
  renderNote(); renderSide(); draw(); ckMsg.textContent=''; RUN.asked();
}
function renderNote(){
  const t=CK.targets[CK.i];
  ckNote.innerHTML=`<span class="small">👻 The ghost's note says:</span> <b class="cknote">${
    noteParts(t,CK.p.format).map(x=>x.k&&CK.hint>=(x.k==='m'?1:2)?`<span class="ckhl ${x.k}">${x.s}</span>`:x.s).join('')}</b>`;
}
function renderSide(){
  const n=CK.targets.length;
  ckRooms.innerHTML=CK.rooms.map((r,k)=>{const st=CK.state[k];
    return `<div class="ckroom ${st}${k===CK.i&&st==='todo'?' cur':''}">${r}<span>${st==='free'?'👻✨':st==='stuck'?'🔒':k===CK.i?'🕰️':'🚪'}</span></div>`;}).join('');
  starMeter(ckMeter,{got:CK.freed,need:CK.p.need,extra:n-CK.p.need,style:'rings'});
  const g=gh();
  ckGhostInfo.textContent=g>0?`Ghost friends with you: ${'👻'.repeat(g)}`:'No ghost friends yet. Bandits can\'t read clocks!';
  [ckG1,ckG2,ckG3].forEach((b,k)=>b.style.display=g>=k+1?'':'none');
  ckInfo.textContent=`Clock ${CK.i+1} of ${n}\nFree ${CK.p.need} ghost${CK.p.need>1?'s':''} to win.\nFree all ${n}, and a ghost might come along with you!\n${CK.p.tries} tries per clock.`;
}
const gh=()=>RUN.party.ghosts?RUN.party.ghosts():0;
function ghostHelp(n){
  if(!CK||CK.busy||gh()<n||!RUN.party.useGhosts(n))return;
  RUN.flag('ghostHelp'); CK.firstTry=false;
  if(n===3){const t=CK.targets[CK.i];CK.h=t.h;CK.m=t.m;draw();say('clockGhostSolve',3500);
    RUN.answered(true,`${noteText(t,CK.p.format)} (set by the ghosts)`);freeGhost();return;}
  CK.hint=Math.max(CK.hint,n); renderNote(); renderSide(); draw(); say(n===1?'clockGhost1':'clockGhost2',4000);
}
function check(){
  if(!CK||CK.busy)return;
  const t=CK.targets[CK.i], fmt=CK.p.format, okH=CK.h===t.h, okM=CK.m===t.m;
  RUN.answered(okH&&okM,`${noteText(t,fmt)} (set ${CK.h}:${pad(CK.m)})${CK.hint?` · ${CK.hint} ghost hint`:''}`);
  if(okH&&okM){say('clockRight',2500);freeGhost();return;}
  CK.firstTry=false; CK.tries++;
  ckFace.classList.remove('shake');void ckFace.getBoundingClientRect();ckFace.classList.add('shake');
  if(CK.tries>=CK.p.tries){
    CK.busy=true; CK.state[CK.i]='stuck'; renderSide();
    ckMsg.textContent=`The clock jams and the ghost sighs. This is what ${noteText(t,fmt)} looks like.`;
    CK.h=t.h;CK.m=t.m;draw(); say('clockStuck',3500);
    setTimeout(next,2600); return;
  }
  ckMsg.textContent=okM?'The long minute hand is right! Now check the short hour hand.':
    okH?'The short hour hand is right! Now check the long minute hand.':'Not quite. Check both hands.';
  say('clockWrong',3500);
}
function freeGhost(){
  CK.busy=true; CK.state[CK.i]='free'; CK.freed++; renderSide();
  ckMsg.textContent='Tick, tock! The clock runs again and the ghost floats free. 👻✨';
  setTimeout(next,1800);
}
function next(){
  if(!CK)return;
  const left=CK.targets.length-CK.i-1, n=CK.targets.length;
  // stop early if winning is no longer possible
  if(CK.freed+left<CK.p.need){endClocks(false);return;}
  if(left===0){endClocks(CK.freed>=CK.p.need);return;}
  CK.i++; loadClock();
}
function endClocks(win){
  const n=CK.targets.length, all=CK.freed===n;
  if(!win){say('clockLost',4000);
    overlay(`<div class="big">🕰️🔒</div><h2>The clocks are stuck</h2><div>${CK.freed} of ${n} ghosts are free. The others are still waiting.<br>Come back and try again, or read the clock guide first!</div>`,
      [['Onward','fire',()=>RUN.finish('lose')]]);return;}
  RUN.reward('wiz'); if(all)RUN.reward('ghosts',1);
  say(all?'clockAll':'clockWin',5000);
  overlay(`<div class="big">${'👻✨'.repeat(CK.freed)}</div><h2>${all?'Every clock is ticking!':'The ghosts are at peace!'}</h2>
    <div>${all?'One little ghost isn\'t quite ready to move on. "Can I come with you for a bit of adventure?" A ghost joins your party!':`You freed ${CK.freed} of ${n} ghosts.`}</div><div>+1 Wizard badge</div>`,
    [['Onward!','fire',()=>RUN.finish('win')]]);
}

// ----- the free guide -----
function help(){
  const ex=faceSVG({h:3,m:0,minuteRing:true,ring24:CK&&CK.p.format==='24h'});
  overlay(`<h2>📖 How to read a clock</h2>
   <div class="ckhelp">
    <svg viewBox="-125 -125 250 250" style="width:230px;height:230px;flex:none">${ex}</svg>
    <div>
     <p><b style="color:#e8743b">The short hand</b> shows the <b>hour</b>. It points at the hour's number. As the minutes go by, it slowly creeps towards the next number. At half past two it sits halfway between 2 and 3.</p>
     <p><b style="color:#4fb3ff">The long hand</b> shows the <b>minutes</b>. Count in fives as it goes round: the 1 means 5 minutes, the 2 means 10, the 3 means 15…</p>
     <p>Long hand on <b>12</b>: o'clock. On <b>3</b>: quarter past. On <b>6</b>: half past. On <b>9</b>: quarter to the next hour.</p>
     ${CK&&CK.p.format==='24h'?'<p><b>24-hour time:</b> after 12 noon the hours keep counting: 13, 14, 15… Take away 12 to find the number on the clock. 14:00 is 2 o\'clock in the afternoon.</p>':''}
     <p class="small">This clock says 3 o'clock.</p>
    </div></div>`,[['Got it!','fire',null]]);
}

Modules.register(M);
})();
