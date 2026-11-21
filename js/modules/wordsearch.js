// ---------- Module: bandit word search ----------
(function(){
const WORDS={
  hollow:['BOO','BAT','OWL','CAT','WEB','DOG','BED','KEY','SOCK','MOON','BONE','DOOR','MIST','HUSH','DUST','TOWER','GHOST','CLOCK','CREAK','STAIR','ATTIC','BROOM','CANDLE','SPIDER','SHADOW','LANTERN'],
  swamp:['BOG','MUD','BUG','EEL','LOG','FROG','TOAD','REED','LILY','POND','MOSS','NEWT','DUCK','FISH','RAFT','SNAIL','SLIME','MARSH','CROAK','HERON','GATOR','SPLASH','MOZZIE','PADDLE'],
  easy:['CAT','DOG','SUN','HAT','FOX','OWL','BAT','PIG','EGG','CUP','MAP','WEB',
    'FIRE','TREE','SONG','GOLD','LUTE','CAVE','MOON','STAR','WING','TAIL','ROCK','SNOW','FROG','DUCK','CAKE','BOAT','BARD','HORN','LAMP','NEST'],
  hard:['DRAGON','CASTLE','FOREST','SWORD','CROWN','MAGIC','SPELL','SHIELD','ARROW','TOWER','RIVER','CLOUD','STORM',
    'FLAME','EMBER','SMOKE','TROLL','GHOST','HORSE','EAGLE','TIGER','SNAKE','APPLE','BREAD','ROBOT','PLANET','ROCKET','POTION',
    'WIZARD','BANDIT','GOBLIN','TREASURE','LANTERN','PUZZLE','CANDLE','MARKET','BRIDGE','WAGON','GIANT','HONEY'],
  forest:['FOX','OWL','BAT','LOG','ELK','BEE','ANT','TREE','LEAF','MOSS','FERN','BARK','NEST','DEER','BEAR','WOLF','FROG','LUTE','BARD',
    'CAMP','TENT','SONG','FIRE','PATH','TWIG','ACORN','BERRY','STUMP','ROBIN','SNAIL','BADGER','FOREST'],
  frost:['SNOW','ICE','COLD','SLED','FROST','FLAKE','PEAK','YETI','SKATE','WOLF','BEAR','SEAL','FISH','POLAR','IGLOO','CHILL','WIND',
    'HAIL','STORM','CLIFF','CAVE','FROZEN','PINE','HILL','BOOT','SCARF','GLOVE','HUSKY','MELT','MITTEN','WINTER','ICICLE','SKI','FUR']};
const DIRS={hv:[[0,1],[1,0]],hvd:[[0,1],[1,0],[1,1]],all:[[0,1],[1,0],[1,1],[-1,1]]};

let W=null, RUN=null, selStart=null;

const M={
  id:'wordsearch', name:'Bandit word search', screen:'search',
  defaults:{size:7,min:4,max:5,dirs:'hv',want:5,theme:'forest',minFound:3},
  presets:{
    'Forest · easy 6×6':{size:6,min:3,max:4,dirs:'hv',want:5,theme:'forest'},
    'Forest · 7×7':{size:7,min:4,max:5,dirs:'hv',want:5,theme:'forest'},
    'Frost · 7×7':{size:7,min:4,max:5,dirs:'hv',want:5,theme:'frost'},
    'Frost · with diagonals':{size:7,min:4,max:6,dirs:'hvd',want:6,theme:'frost'},
    'Haunted Hollow · 7×7':{size:7,min:4,max:5,dirs:'hv',want:5,theme:'hollow'},
    'Croakmire Swamp · 7×7':{size:7,min:4,max:5,dirs:'hv',want:5,theme:'swamp'},
    'Hard · 8×8 every direction':{size:8,min:5,max:8,dirs:'all',want:6,theme:'hard'}},
  html:`
<section id="search" class="screen">
  <div class="topbar enc"><button class="btn ghost retreatBtn tl">↩ Retreat</button>
    <b>Bandit ambush! Find words to cheer them up</b>
    <button class="btn ghost tr" id="skipSearch">🛡️ Skip</button></div>
  <div id="searchBody">
    <div class="scol">
      <div class="small">Find these words</div>
      <div id="wordList"></div>
      <button class="btn gold" id="hintBtn" style="font-size:18px">🛡️ Ask your shield guards</button>
    </div>
    <div id="grid"></div>
    <div class="scol" style="align-items:center">
      <div id="bandits"></div><div class="small" id="banditsPending"></div>
      <div class="small" id="searchInfo" style="text-align:center;white-space:pre-line"></div>
      <button class="btn fire" id="searchDone" disabled>Sing the song!</button>
      <div class="small">Found</div>
      <div id="foundList"></div>
    </div>
  </div>
</section>`,
  bind(){
    const g=document.getElementById('grid');
    g.addEventListener('pointerdown',e=>{if(!W)return;const c=cellAt(e);if(!c)return;selStart=c;paintSel([c]);g.setPointerCapture(e.pointerId);});
    g.addEventListener('pointermove',e=>{if(!selStart)return;const c=cellAt(e);if(c)paintSel(lineCells(selStart,c));});
    g.addEventListener('pointerup',endSwipe);
    hintBtn.onclick=askScouts;
    searchDone.onclick=finishSong;
    skipSearch.onclick=()=>RUN&&RUN.skip();
  },
  start(p,run){RUN=run;build(p);},
  abort(){W=null;selStart=null;}
};

function wordPool(p){
  const theme=WORDS[p.theme]||WORDS.forest;
  const ok=w=>w.length>=p.min&&w.length<=p.max&&w.length<=p.size;
  const th=theme.filter(ok).sort(()=>Math.random()-.5);
  const gen=[...new Set([...WORDS.easy,...WORDS.hard])].filter(w=>ok(w)&&!theme.includes(w)).sort(()=>Math.random()-.5);
  const out=[];while(th.length||gen.length){if(th.length)out.push(th.shift());if(th.length)out.push(th.shift());if(gen.length)out.push(gen.shift());}
  return out;
}
function build(p){
  const size=p.size, dirs=DIRS[p.dirs]||DIRS.hv;
  const grid=Array.from({length:size},()=>Array(size).fill(null)); const placed=[], posOf={};
  for(const w of wordPool(p)){if(placed.length>=p.want)break;
    for(let tries=0;tries<80;tries++){const d=pick(dirs);
      const r0=d[0]>=0?0:w.length-1, r1=d[0]>0?size-w.length:size-1, c1=d[1]>0?size-w.length:size-1;
      if(r1<r0||c1<0)continue;
      const r=r0+Math.floor(Math.random()*(r1-r0+1)), c=Math.floor(Math.random()*(c1+1));
      let ok=true;for(let i=0;i<w.length;i++){const g=grid[r+d[0]*i][c+d[1]*i];if(g&&g!==w[i]){ok=false;break;}}
      if(!ok)continue; for(let i=0;i<w.length;i++)grid[r+d[0]*i][c+d[1]*i]=w[i]; placed.push(w);
      posOf[w]=Array.from({length:w.length},(_,i)=>[r+d[0]*i,c+d[1]*i]); break;}}
  const ABC='ABCDEFGHIKLMNOPRSTUWY';
  for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(!grid[r][c])grid[r][c]=pick(ABC);
  W={size,grid,words:placed,found:[],min:Math.min(p.minFound||3,placed.length),sel:[],diag:p.dirs!=='hv',posOf,hint:{},scouting:0,pending:0};
  const cs=Math.floor(Math.min(62,(innerHeight-200)/size-6,(innerWidth-500)/size-6));
  const g=document.getElementById('grid'); g.style.setProperty('--cs',cs+'px'); g.style.gridTemplateColumns=`repeat(${size},${cs}px)`; g.innerHTML='';
  grid.forEach((row,r)=>row.forEach((ch,c)=>{const d=document.createElement('div');d.className='cell';d.textContent=ch;d.dataset.r=r;d.dataset.c=c;g.appendChild(d);}));
  render(); show('search'); RUN.asked(); setTimeout(()=>say('searchStart',6000),300);
}
function render(){
  const g=document.getElementById('grid'), todo=W.words.filter(w=>!W.found.includes(w));
  skipSearch.style.visibility=RUN.party.guards()>0?'visible':'hidden';
  wordList.innerHTML=todo.map(w=>{const h=W.hint[w]||0;
    return `<div class="word ${W.scouting?'scout':''}" data-w="${w}">${h?`<span class="hintmark">${w.slice(0,h)}</span>${w.slice(h)}`:w}</div>`;}).join('');
  foundList.innerHTML=W.found.map(w=>`<div class="word">${w}</div>`).join('');
  wordList.querySelectorAll('.word').forEach(d=>d.onclick=()=>scoutWord(d.dataset.w));
  hintBtn.style.display=(RUN.party.guards()>0&&todo.length&&!W.scouting)?'':'none';
  g.querySelectorAll('.cell.hint').forEach(c=>c.classList.remove('hint'));
  todo.forEach(w=>{for(let i=0;i<(W.hint[w]||0);i++){const[r,c]=W.posOf[w][i];
    g.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`).classList.add('hint');}});
  const n=W.found.length;
  starMeter(bandits,{got:n,need:W.min,extra:W.words.length-W.min,style:'waves'});
  banditsPending.textContent=W.pending?`🛡️ ${W.pending} bandit${W.pending>1?'s':''} want${W.pending>1?'':'s'} to join you!`:'';
  searchDone.disabled=n<W.min;
  if(W.scouting){searchInfo.textContent=`Tap a word for your ${W.scouting} shield guard${W.scouting>1?'s':''} to scout!`;return;}
  searchInfo.textContent=(n<W.min?`Find ${W.min-n} more to win them over`:(n<W.words.length?'Every extra word wins over a bandit who wants to join you!':'All found!'))+(W.diag?'\nWords can go sideways ↘ ↗ too!':'');
}
function cellAt(e){const el=document.elementFromPoint(e.clientX,e.clientY);return el&&el.classList.contains('cell')?el:null;}
function lineCells(a,b){
  const g=document.getElementById('grid');
  const r0=+a.dataset.r,c0=+a.dataset.c,r1=+b.dataset.r,c1=+b.dataset.c,dr=Math.sign(r1-r0),dc=Math.sign(c1-c0);
  if(!(r0===r1||c0===c1||Math.abs(r1-r0)===Math.abs(c1-c0)))return [a];
  const n=Math.max(Math.abs(r1-r0),Math.abs(c1-c0));const out=[];
  for(let i=0;i<=n;i++)out.push(g.querySelector(`.cell[data-r="${r0+dr*i}"][data-c="${c0+dc*i}"]`));return out;
}
function paintSel(cells){document.querySelectorAll('#grid .cell.sel').forEach(c=>c.classList.remove('sel'));cells.forEach(c=>c.classList.add('sel'));if(W)W.sel=cells;}
function endSwipe(){
  if(!selStart||!W)return; selStart=null;
  const s=W.sel.map(c=>c.textContent).join(''), rev=[...s].reverse().join('');
  const hit=W.words.find(w=>!W.found.includes(w)&&(w===s||w===rev));
  if(hit){
    RUN.answered(true,hit);
    W.found.push(hit);W.sel.forEach(c=>c.classList.add('found'));
    if(W.found.length>W.min){if(RUN.party.canRecruit(W.pending+1)){W.pending++;say('protector',3500);}else say('full',4000);}
    else say('right',2000);
    render();}
  else if(s.length>=3) RUN.answered(false,s);
  paintSel([]);
}
function askScouts(){
  const max=Math.min(RUN.party.guards(),5);const box=document.getElementById('overlayBox');
  box.innerHTML=`<div class="big">🛡️</div><h2>How many shield guards should scout?</h2><div class="small">Each guard shows one more letter of a word. Scouts rest for one challenge afterwards.</div><div class="row" id="scoutRow"></div>`;
  for(let k=1;k<=max;k++){const b=document.createElement('button');b.className='btn gold';
    b.innerHTML=`${'🛡️'.repeat(k)}<br><small>${k===1?'first letter':'first '+k+' letters'}</small>`;
    b.onclick=()=>{document.getElementById('overlay').classList.remove('on');W.scouting=k;say('hint',4000);render();};
    box.querySelector('#scoutRow').appendChild(b);}
  const c=document.createElement('button');c.className='btn ghost';c.textContent='Never mind';
  c.onclick=()=>document.getElementById('overlay').classList.remove('on');box.querySelector('#scoutRow').appendChild(c);
  document.getElementById('overlay').classList.add('on');
}
function scoutWord(w){
  if(!W||!W.scouting)return;
  const have=W.hint[w]||0, add=Math.min(W.scouting,w.length-1-have);
  if(add<=0){say('wrong',2500);return;}
  if(!RUN.party.useGuards(add,2))return;
  W.hint[w]=have+add; W.scouting=0; render();
}
function finishSong(){
  if(!W)return;
  const n=W.pending; RUN.reward('sch'); RUN.reward('guards',n); say('searchWin',4500);
  const verb=pick(['bedazzled','mesmerised','enchanted']);
  overlay(`<div class="big">🎶📜${'🛡️'.repeat(n)}</div><h2>Your song ${verb} the bandits!</h2>
    <div>${n?`${n===1?'One of them has':NUMWORDS[n]+' of them have'} decided to join your party as shield guard${n>1?'s':''}!`:'They wave you through with a cheer.'}</div><div>+1 Scholar badge</div>`,
    [['Onward!','fire',()=>RUN.finish('win')]]);
}

Modules.register(M);
})();
