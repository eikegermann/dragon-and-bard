// ---------- Dragon & Bard: the game (world, party, wardrobe) ----------
const MAX_PROT=6, MAX_ARCH=3, MAX_GHOST=3;

// ---------- Players (2–4 on one device, taking turns) ----------
// Each player's own things live in S.players[i]. The active player's are swapped into S and S.run,
// so the rest of the game and every module keep using S.name, S.wiz, S.run.pos and so on.
// Shared by everyone: the map (S.run.nodes), what's been discovered, cleared and is resting.
const MAX_PLAYERS=4;
const PFIELDS=['name','sig','wiz','sch','quill','quillUsed','colour','hat','owned','hatsOwned','quillLevel','quillChaos','dice'];
const RFIELDS=['pos','from','newVisit','prot','arch','ghost','rest'];
const LOOKS=[['green','red'],['red','blue'],['blue','green'],['purple','gold']];
const DRAGON_NAMES=['Ember','Pebble','Sparks','Bramble','Cinder','Puddle','Thistle','Nugget','Comet','Maple','Pickle','Smudge','Fizz','Juniper','Waffle','Rumble'];
// the handwritten name as a little picture (the game can't read handwriting names yet)
const sigImg=(p,h=34)=>p&&p.sig?`<img class="sigimg" src="${p.sig}" style="height:${h}px" alt="">`:'';
const DICE=[['one6','🎲 one die, 1–6'],['twin6','🎲🎲 two dice, 1–6'],['big8','🎲 one die, 1–8'],['twin8','🎲🎲 two dice, 1–8']];
let COOP=null;   // a boss fight played together: {owner, node, members}
function multi(){return !!(S.players&&S.players.length>1);}
function stashPlayer(){
  if(!S.players)return; const p=S.players[S.turn]; if(!p)return;
  PFIELDS.forEach(k=>p[k]=S[k]); if(S.run){p.r=p.r||{};RFIELDS.forEach(k=>p.r[k]=S.run[k]);}
}
function beforeSave(){stashPlayer();}
function activate(i){
  stashPlayer(); S.turn=i; const p=S.players[i];
  PFIELDS.forEach(k=>{if(p[k]!==undefined)S[k]=p[k];}); if(S.run&&p.r)RFIELDS.forEach(k=>S.run[k]=p.r[k]);
  refreshBard();
}
function startNodeId(){return S.run.nodes.find(n=>n.region==='forest'&&n.t==='start').id;}
// Older saves have one player stored straight in S: they become player 1.
function ensurePlayers(){
  if(!S.players||!S.players.length){S.turn=0;S.players=[{}];if(!S.dice)S.dice='one6';stashPlayer();}
  if(S.run&&S.run.turnCount==null)S.run.turnCount=0;
}
function newProfile(name,sig){
  const used=S.players.map(p=>p.colour), look=LOOKS.find(l=>!used.includes(l[0]))||LOOKS[S.players.length%4];
  return {name,sig,wiz:0,sch:0,quill:0,quillUsed:false,colour:look[0],hat:look[1],
    owned:{green:1,red:1,[look[0]]:1},hatsOwned:{red:1,[look[1]]:1},quillLevel:1,dice:'one6',
    r:{pos:startNodeId(),from:null,newVisit:false,prot:0,arch:0,ghost:0,rest:[]}};
}
// After an encounter: hand the tablet to the next player.
function endTurn(){
  if(!multi())return goMap();
  activate((S.turn+1)%S.players.length); save();
  show('map'); updateHud(); drawMap();
  overlay(`<div class="big">${dragonSVG(S.colour,120)}</div><h2>Over to ${S.name}!</h2><div>${sigImg(S,56)}</div><div>Pass the tablet to ${S.name}.</div>`,
    [["I'm ready!",'fire',()=>say('yourTurn',4500)]]);
}
let ADDING=false;
function managePlayers(){
  stashPlayer();
  const rows=S.players.map((p,i)=>`<div class="prow${i===S.turn?' cur':''}"><span>${dragonSVG(p.colour,54)}</span><b>${p.name}</b> <button class="pd prn" data-i="${i}" title="Rename">✏️</button>${sigImg(p)}${i===S.turn?' <span class="small">(playing now)</span>':''}
    <button class="pd pstrict${p.quillChaos?' on':''}" data-i="${i}" title="Quill: scribbling over your number is allowed">🖍️ Chaos crush: ${p.quillChaos?'on':'off'}</button>
    <span class="pdice">${DICE.map(([k,l])=>`<button class="pd${(p.dice||'one6')===k?' on':''}" data-i="${i}" data-k="${k}" title="${l}">${l.split(' ')[0]} ${k.endsWith('6')?'1–6':'1–8'}</button>`).join('')}</span>
    ${S.players.length>1&&i!==S.turn?`<button class="btn ghost prm" data-i="${i}">Remove</button>`:''}</div>`).join('');
  overlay(`<h2>👥 Players</h2><div class="small">Up to ${MAX_PLAYERS} players take turns: one encounter each, then pass the tablet. Boss fights can be played together.<br>Dice: the dice each player is comfy with in a team boss fight. 🖍️ Chaos crush: scribbling and decorating over your number is allowed (normally the quill wants proper writing).</div><div class="plist">${rows}</div>`,
    [...(S.players.length<MAX_PLAYERS?[['➕ Add a player','fire',()=>{ADDING=true;show('intro');introTitle.textContent='A new dragon joins!';startBtn.textContent='Join the adventure!';
      introDragon.innerHTML=dragonSVG(newProfile('','').colour,150);requestAnimationFrame(setupSig);typedName.value='';say('intro',8000);}]]:[]),['Done','',null]]);
  document.querySelectorAll('#overlayBox .pdice .pd').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;S.players[i].dice=b.dataset.k;if(i===S.turn)S.dice=b.dataset.k;save();managePlayers();});
  document.querySelectorAll('#overlayBox .pstrict').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,v=!S.players[i].quillChaos;S.players[i].quillChaos=v;if(i===S.turn)S.quillChaos=v;save();managePlayers();});
  document.querySelectorAll('#overlayBox .prn').forEach(b=>b.onclick=()=>renamePlayer(+b.dataset.i,managePlayers));
  document.querySelectorAll('#overlayBox .prm').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,nm=S.players[i].name;
    overlay(`<h2>Remove ${nm}?</h2><div>${nm}'s badges and comrades will be gone. The map stays.</div>`,
      [['Keep','',managePlayers],['Remove','fire',()=>{stashPlayer();const cur=S.players[S.turn];S.players.splice(i,1);S.turn=S.players.indexOf(cur);save();updateHud();drawMap();managePlayers();}]]);});
}
function updateHud(){
  bWiz.textContent=S.wiz; bSch.textContent=S.sch; bQuill.textContent=S.quill;
  bProt.textContent=S.run?S.run.prot:0; bArch.textContent=S.run?(S.run.arch||0):0;
  const g=S.run?(S.run.ghost||0):0, rg=resting('ghost'); bGhost.textContent=g; ghostPill.style.display=(g||rg)?'':'none';
  const rp=resting('prot'), ra=resting('arch'); rProt.textContent=rp; rArch.textContent=ra; rGhost.textContent=rg;
  restProtPill.style.display=rp?'':'none'; restArchPill.style.display=ra?'':'none'; restGhostPill.style.display=rg?'':'none';
  restGrp.style.display=(rp||ra||rg)?'':'none';
  trainBtn.style.display=(S.run&&S.run.prot>=3&&(S.run.arch||0)<MAX_ARCH)?'':'none';
  playersStrip.innerHTML=multi()?S.players.map((p,i)=>`<span class="pmini${i===S.turn?' on':''}" title="${p.name}${i===S.turn?' (your turn)':''}">${dragonSVG(p.colour,34)}</span>`).join(''):'';
  drawSigSmall();
}

// ---------- Intro / signature ----------
const sig=document.getElementById('sig'); let sctx, drawing=false, sigDirty=false;
function setupSig(){
  const r=sig.getBoundingClientRect(), d=window.devicePixelRatio||1;
  sig.width=r.width*d; sig.height=r.height*d; sctx=sig.getContext('2d'); sctx.scale(d,d);
  sctx.lineCap='round'; sctx.lineJoin='round'; sctx.strokeStyle='#2a2340';
}
function pos(e){const r=sig.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
sig.addEventListener('pointerdown',e=>{drawing=true;sigDirty=true;sig.setPointerCapture(e.pointerId);const[x,y]=pos(e);sctx.beginPath();sctx.moveTo(x,y);});
sig.addEventListener('pointermove',e=>{if(!drawing)return;const[x,y]=pos(e);
  sctx.lineWidth=e.pointerType==='pen'?3+6*(e.pressure||.5):7; sctx.lineTo(x,y);sctx.stroke();sctx.beginPath();sctx.moveTo(x,y);});
sig.addEventListener('pointerup',()=>drawing=false);
sig.addEventListener('pointercancel',()=>drawing=false);
document.getElementById('sigClear').onclick=()=>{sctx.clearRect(0,0,sig.width,sig.height);sigDirty=false;};
document.getElementById('startBtn').onclick=()=>{
  const typed=document.getElementById('typedName').value.trim();
  if(!sigDirty&&!typed){say('intro');return;}
  // only a handwritten name: the bard can't read it, so let the player pick what he should call them
  if(!typed){pickName();return;}
  if(ADDING){ADDING=false;stashPlayer();
    S.players.push(newProfile(typed||'little dragon',sigDirty?sig.toDataURL('image/png'):null));
    introTitle.textContent='Dragon & Bard';startBtn.textContent='Start the adventure!';
    const np=S.players[S.players.length-1]; save(); goMap();
    overlay(`<div class="big">${dragonSVG(np.colour,110)}</div><h2>${np.name} joins the adventure!</h2><div>${sigImg(np,50)}</div><div>Players take turns: one encounter each, then pass the tablet. ${S.name} is still playing now.</div>`,[['Hooray!','fire',null]]);
    return;}
  S.name=typed||'little dragon';
  if(sigDirty)S.sig=sig.toDataURL('image/png');
  save(); say('welcome',5000); newRun(); ensurePlayers(); save(); goMap();
};
function pickName(){
  const taken=(S.players||[]).map(p=>p.name), pool=DRAGON_NAMES.filter(n=>!taken.includes(n)).sort(()=>Math.random()-.5).slice(0,4);
  overlay(`<div class="big"><img src="${sig.toDataURL('image/png')}" style="height:60px;background:#fffaf0;border-radius:10px" alt=""></div>
    <h2>Lovely name! But I can't read handwriting…</h2><div>What shall I call you? Pick a dragon name, or type your name.</div>`,
    [...pool.map(n=>[n,'gold',()=>{typedName.value=n;startBtn.click();}]),['⌨️ Type my name','',()=>typedName.focus()]]);
}
function renamePlayer(i,back){
  const p=S.players[i];
  overlay(`<h2>A new name for ${p.name}</h2><div>${sigImg(p,50)}</div><input id="renameBox" class="renamebox" maxlength="20" value="${p.name.replace(/"/g,'&quot;')}">
    <div class="row" style="gap:6px;flex-wrap:wrap;justify-content:center">${DRAGON_NAMES.slice(0,8).map(n=>`<button class="pd rn">${n}</button>`).join('')}</div>`,
    [['Cancel','',back],['Save','fire',()=>{const v=(document.getElementById('renameBox').value||'').trim();
      if(v){p.name=v;if(i===S.turn)S.name=v;save();updateHud();drawMap();}back&&back();}]]);
  document.querySelectorAll('#overlayBox .rn').forEach(b=>b.onclick=()=>{document.getElementById('renameBox').value=b.textContent;});
}
function drawSigSmall(){
  const c=document.getElementById('sigSmall'),x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
  if(S.sig){const img=new Image();img.onload=()=>x.drawImage(img,0,0,c.width,c.height);img.src=S.sig;}
  else{x.fillStyle='#2a2340';x.font='bold 24px sans-serif';x.fillText(S.name||'',8,34);}
}

// ---------- World map ----------
const MAP_W=1400, MAP_H=700;
const REGIONS={
  forest:{name:'Whispering Forest',mode:'heat',bg:'#1c2a24',fog:'#0b0a14',tree:'#2e4a3a',mtn:'#33414a',cap:'#d8dde6',treeShare:.78,
    boss:{n:'Elder Emberclaw',c:'purple'}},
  frost:{name:'Frostpeaks',mode:'cold',bg:'#26313f',fog:'#0c1220',tree:'#46646e',mtn:'#5b6c82',cap:'#f4f8ff',treeShare:.3,
    boss:{n:'the Frost Wyrm',c:'blue'},welcome:'frostWelcome'},
  hollow:{name:'Haunted Hollow',mode:'heat',bg:'#211c2a',fog:'#08070d',tree:'#3b3449',mtn:'#2c2736',cap:'#8d84a3',treeShare:.6,
    deco:['dead','grave'],welcome:'hollowWelcome'},
  swamp:{name:'Croakmire Swamp',mode:'heat',bg:'#1a2a22',fog:'#070d0a',tree:'#2f5a3a',mtn:'#24453a',cap:'#3f8f4f',treeShare:.55,
    deco:['reed','pond'],welcome:'swampWelcome'}};
const TYPES={start:{icon:'⛺',col:'#888'},duel:{icon:'🔥',col:'#9b6bff'},choice:{icon:'🎲',col:'#9b6bff'},
  search:{icon:'📜',col:'#2fc4b2'},rhyme:{icon:'🎵',col:'#2fc4b2'},boss:{icon:'🐉',col:'#ff7a2f'},
  sign:{icon:'🚧',col:'#b08a3c'},exit:{icon:'➡️',col:'#3a7bff'},back:{icon:'⬅️',col:'#3a7bff'},
  clock:{icon:'🕰️',col:'#9b6bff'},mystery:{icon:'👻',col:'#2fc4b2'},lily:{icon:'🪷',col:'#9b6bff'},
  gators:{icon:'🐊',col:'#9b6bff'},mozzie:{icon:'🦟',col:'#9b6bff'}};
const PLAIN=['start','sign','exit','back'];
function iconFor(n){if(n.region==='frost'){if(n.t==='duel')return '❄️';if(n.t==='boss')return '🐲';}return TYPES[n.t].icon;}
const SIGNS={
  hollow:{title:'Path to Haunted Hollow',text:'A crooked sign: CLOSED FOR CONSTRUCTION.<br>From somewhere behind it comes a ghostly giggle.'},
  hollowNorth:{title:'The north road to the Windswept Tundra',text:'A sign, very wobbly: CLOSED FOR CONSTRUCTION.<br>Someone has pinned a note to it: <i>"Looking for a ghost called Mabel. Please help! — Hattie"</i>'},
  swampMeadow:{title:'Boardwalk to Meadowfold',text:'A soggy sign: CLOSED FOR CONSTRUCTION.<br>Beyond the reeds you can hear cows. And a tractor. And a goose being rude.'},
  swampRiver:{title:'Down to the Silverrun River',text:'A sign on a post in the water: CLOSED FOR CONSTRUCTION.<br>A barge horn toots somewhere far away.'},
  meadow:{title:'Path to Meadowfold',text:'A sign on the fence: CLOSED FOR CONSTRUCTION.<br>You can smell fresh bread on the breeze.'},
  hushwall:{title:'Road to Hushwall City',text:'A sign: CLOSED FOR CONSTRUCTION.<br>Underneath, in very tiny letters: <i>shhh!</i>'},
  tundra:{title:'Way to the Windswept Tundra',text:'A frosty sign: CLOSED FOR CONSTRUCTION.<br>Far away, caravan bells jingle in the wind.'},
  mine:{title:'The sealed mine doors',text:'A sign: CLOSED FOR CONSTRUCTION.<br>Behind it, someone has scratched graffiti into the stone:<br><b>"Speak Fr…"</b>'},
  beyond:{title:'Beyond the Frostpeaks',text:'The path vanishes into fog. CLOSED FOR CONSTRUCTION.<br>More of the world is coming soon!'}};
// Which kinds of stop a region has: a maths one and a words one per layer (sometimes a third).
const STOPS={
  duel:(i,mid)=>(i>=Math.ceil(mid/2)&&Math.random()<.5)?'choice':'duel',
  word:()=>Math.random()<.5?'search':'rhyme',
  hollowMaths:()=>'clock',
  swampMaths:()=>Math.random()<.5?'lily':'mozzie'};
function genRegion(region,mid,signs,nodes,opt={}){
  const maths=opt.maths||STOPS.duel, word=opt.word||STOPS.word, fin=opt.final||{t:'boss'};
  const layers=[[{t:'start'}]];
  for(let i=1;i<=mid;i++){
    const n=2+Math.floor(Math.random()*2);
    const L=[{t:maths(i,mid)},{t:word(i,mid)}]; if(n===3)L.push({t:Math.random()<.5?maths(i,mid):word(i,mid)});
    L.sort(()=>Math.random()-.5); layers.push(L);}
  layers.push([{...fin}]);
  const LN=layers.length, step=(MAP_W-260)/LN, X=li=>110+li*step;
  layers.forEach((Ls,li)=>Ls.forEach((nd,j)=>{Object.assign(nd,{id:nodes.length,region,layer:li,x:X(li),
    y:Ls.length===1?350:170+j*(360/(Ls.length-1)),next:[]});nodes.push(nd);}));
  const link=(a,b)=>{if(!a.next.includes(b.id))a.next.push(b.id);};
  for(let li=0;li<LN-1;li++){const A=layers[li],B=layers[li+1];
    A.forEach((a,i)=>link(a,B[Math.round(A.length===1?0:i*(B.length-1)/(A.length-1))]));
    B.forEach((b,j)=>link(A[Math.round(B.length===1?0:j*(A.length-1)/(B.length-1))],b));
    if(A.length===1)B.forEach(b=>link(A[0],b)); if(B.length===1)A.forEach(a=>link(a,B[0]));
    A.forEach(a=>{if(Math.random()<.35)link(a,B[Math.floor(Math.random()*B.length)]);});}
  const boss=layers[LN-1][0];
  const exit={id:nodes.length,region,t:'exit',layer:LN,x:X(LN),y:350,next:[]};nodes.push(exit);boss.next.push(exit.id);
  signs.forEach(sg=>{const src=layers[sg.layer-1], a=sg.top?src[0]:src[src.length-1];
    const s={id:nodes.length,region,t:'sign',sign:sg.key,layer:sg.layer,x:X(sg.layer),y:sg.top?62:640,next:[]};nodes.push(s);a.next.push(s.id);});
  return {start:layers[0][0],boss,exit};
}
function makeDeco(region){const R=REGIONS[region],d=[],k=R.deco||['tree','mtn'];
  for(let i=0;i<95;i++)d.push({x:Math.random()*MAP_W,y:Math.random()*MAP_H,k:Math.random()<R.treeShare?k[0]:k[1],s:.7+Math.random()*.8});return d;}
function newRun(){
  const nodes=[];
  const F=genRegion('forest',7,[{key:'hollow',layer:2,top:true},{key:'meadow',layer:4,top:false},{key:'hushwall',layer:6,top:true}],nodes);
  const R=genRegion('frost',5,[{key:'tundra',layer:2,top:true},{key:'mine',layer:4,top:false}],nodes);
  F.exit.to=R.start.id;
  R.exit.t='sign';R.exit.sign='beyond';
  const back={id:nodes.length,region:'frost',t:'back',layer:0,x:110,y:640,next:[],to:F.exit.id};nodes.push(back);R.start.next.push(back.id);
  const keep=S.run&&S.run.world>=2?null:{prot:(S.run&&S.run.prot)||0,arch:(S.run&&S.run.arch)||0};
  S.run={world:3,nodes,pos:F.start.id,visited:[F.start.id],seen:[],cleared:[],bossRest:{},rest:[],
    prot:keep?keep.prot:0,arch:keep?keep.arch:0,ghost:0,deco:{forest:makeDeco('forest'),frost:makeDeco('frost')}};
  addHollowAndSwamp(S.run);
  save();
}
// World 3: the Haunted Hollow (through the crooked sign in the forest) and Croakmire Swamp beyond it.
// Also used to upgrade a world-2 save in place, so progress in the forest and the Frostpeaks is kept.
function addHollowAndSwamp(run){
  const nodes=run.nodes, gate=nodes.find(n=>n.region==='forest'&&n.t==='sign'&&n.sign==='hollow');
  const H=genRegion('hollow',5,[{key:'hollowNorth',layer:3,top:true}],nodes,
    {maths:STOPS.hollowMaths,final:{t:'mystery',gate:true}});
  const W=genRegion('swamp',5,[{key:'swampRiver',layer:3,top:false}],nodes,
    {maths:STOPS.swampMaths,final:{t:'gators',gate:true}});
  if(gate){gate.t='exit';gate.to=H.start.id;delete gate.sign;}
  H.exit.to=W.start.id;
  W.exit.t='sign';W.exit.sign='swampMeadow';
  const hb={id:nodes.length,region:'hollow',t:'back',layer:0,x:110,y:640,next:[],to:gate?gate.id:0};nodes.push(hb);H.start.next.push(hb.id);
  const wb={id:nodes.length,region:'swamp',t:'back',layer:0,x:110,y:640,next:[],to:H.exit.id};nodes.push(wb);W.start.next.push(wb.id);
  run.deco.hollow=makeDeco('hollow'); run.deco.swamp=makeDeco('swamp');
  if(run.ghost==null)run.ghost=0;
  run.world=3;
}
function migrateRun(){
  if(S.run&&S.run.world===2){addHollowAndSwamp(S.run);save();return;}
  if(!S.run||S.run.world!==3)newRun();
}
function goMap(){show('map');updateHud();drawMap();setTimeout(()=>say('map'),400);}
function drawMap(){
  const svg=document.getElementById('mapSvg'),R=S.run;let h='';
  const cur=R.nodes[R.pos], reg=cur.region, RG=REGIONS[reg], visited=new Set(R.visited);
  cur.next.forEach(i=>{if(!R.seen.includes(i))R.seen.push(i);}); save();
  const inReg=n=>n.region===reg;
  const vis=new Set([...R.visited,...R.seen].filter(i=>inReg(R.nodes[i])));
  h+=`<defs><filter id="fblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="38"/></filter>
    <mask id="fogm" maskUnits="userSpaceOnUse" x="-400" y="-400" width="${MAP_W+800}" height="${MAP_H+800}"><rect x="-400" y="-400" width="${MAP_W+800}" height="${MAP_H+800}" fill="white"/><g filter="url(#fblur)">
    ${[...vis].map(i=>{const n=R.nodes[i];return `<circle cx="${n.x}" cy="${n.y}" r="${visited.has(i)?120:(cur.next.includes(i)?100:80)}" fill="black"/>`;}).join('')}
    </g></mask></defs>`;
  h+=`<rect x="-400" y="-400" width="${MAP_W+800}" height="${MAP_H+800}" fill="${RG.bg}"/>`;
  R.deco[reg].forEach(d=>{
    if(d.k==='tree')h+=`<g transform="translate(${d.x},${d.y}) scale(${d.s})"><path d="M0 -40 L18 0 L-18 0Z M0 -26 L22 12 L-22 12Z" fill="${RG.tree}"/><rect x="-3" y="12" width="6" height="8" fill="#3b2a1a"/></g>`;
    else if(d.k==='dead')h+=`<g transform="translate(${d.x},${d.y}) scale(${d.s})" stroke="${RG.tree}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M0 20 L0 -30 M0 -8 L-16 -24 M0 -18 L14 -34 M-16 -24 L-22 -34 M14 -34 L20 -40"/></g>`;
    else if(d.k==='grave')h+=`<g transform="translate(${d.x},${d.y}) scale(${d.s})"><path d="M-12 14 L-12 -6 Q0 -22 12 -6 L12 14Z" fill="${RG.cap}" opacity=".55"/><path d="M-4 -2 L4 -2 M0 -6 L0 6" stroke="${RG.bg}" stroke-width="2.5"/></g>`;
    else if(d.k==='reed')h+=`<g transform="translate(${d.x},${d.y}) scale(${d.s})" stroke="${RG.tree}" stroke-width="4" stroke-linecap="round"><path d="M0 16 Q-4 -10 -8 -30 M6 16 Q8 -6 14 -24 M-6 16 Q-12 0 -18 -14"/><ellipse cx="-8" cy="-30" rx="3" ry="8" fill="#6b4a2a" stroke="none"/></g>`;
    else if(d.k==='pond')h+=`<g transform="translate(${d.x},${d.y}) scale(${d.s})"><ellipse rx="54" ry="22" fill="${RG.mtn}"/><ellipse cx="-14" cy="-3" rx="11" ry="6" fill="${RG.cap}"/><ellipse cx="18" cy="5" rx="9" ry="5" fill="${RG.cap}"/></g>`;
    else h+=`<path d="M${d.x-60*d.s} ${d.y} L${d.x} ${d.y-70*d.s} L${d.x+60*d.s} ${d.y}Z" fill="${RG.mtn}"/><path d="M${d.x-14*d.s} ${d.y-54*d.s} L${d.x} ${d.y-70*d.s} L${d.x+14*d.s} ${d.y-54*d.s}Z" fill="${RG.cap}"/>`;});
  h+=`<rect x="-400" y="-400" width="${MAP_W+800}" height="${MAP_H+800}" fill="${RG.fog}" opacity=".94" mask="url(#fogm)"/>`;
  R.nodes.forEach(a=>{if(!vis.has(a.id))return; a.next.forEach(bid=>{const b=R.nodes[bid];
    if(visited.has(a.id)&&visited.has(bid))
      h+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#ffd166" stroke-width="8" opacity=".8"/>`;
    else if(visited.has(a.id)&&vis.has(bid))
      h+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#cfc6ef" stroke-width="5" stroke-dasharray="10 10" opacity="${a.id===R.pos?.8:.45}"/>`;
    else if(!visited.has(a.id)){const ex=a.x+(b.x-a.x)*.32, ey=a.y+(b.y-a.y)*.32;
      h+=`<line x1="${a.x}" y1="${a.y}" x2="${ex}" y2="${ey}" stroke="#cfc6ef" stroke-width="4" stroke-dasharray="6 8" opacity=".45"/>`;}
  });});
  R.nodes.forEach(n=>{if(!vis.has(n.id))return; const T=TYPES[n.t];const cls=['node'];
    const isV=visited.has(n.id), resting=(R.bossRest[n.id]||0)>0;
    if(n.t==='sign')cls.push('signn');
    else if(!isV&&cur.next.includes(n.id))cls.push('avail');
    else if(isV&&n.id!==R.pos){cls.push('back'); if(n.cleared||PLAIN.includes(n.t))cls.push('done');}
    else if(!isV)cls.push('sighted');
    if(isV&&!n.cleared&&n.fresh)cls.push('fresh');
    let ic=iconFor(n); if(isV&&n.cleared&&!PLAIN.includes(n.t))ic='✔️'; if(resting)ic='💤';
    const big=n.t==='boss'||n.gate;
    h+=`<g class="${cls.join(' ')}" data-id="${n.id}"><circle cx="${n.x}" cy="${n.y}" r="${big?50:38}" fill="${T.col}"/>
      <text x="${n.x}" y="${n.y+14}" text-anchor="middle" font-size="${big?46:36}">${ic}</text>
      ${cls.includes('fresh')?`<text x="${n.x+30}" y="${n.y-24}" font-size="26">✨</text>`:''}</g>`;});
  if(multi())S.players.forEach((p,i)=>{if(i===S.turn||!p.r)return;const o=R.nodes[p.r.pos];if(!o||o.region!==reg)return;
    const dx=(i%2?1:-1)*34, dy=-20-(i>>1)*26;
    h+=`<g opacity=".85" transform="translate(${o.x+dx-28},${o.y+dy-60})">${dragonSVG(p.colour,56).replace('<svg','<svg x="0" y="0"')}</g>`;});
  h+=`<g transform="translate(${cur.x-45},${cur.y-115})">${dragonSVG(S.colour,90).replace('<svg','<svg x="0" y="0"')}</g>`;
  if(multi())h+=`<text x="24" y="52" font-size="36" font-weight="800" fill="${COLOURS[S.colour]||'#fff'}" stroke="#000" stroke-width="1.5" paint-order="stroke">${S.name}'s turn</text>`;
  h+=`<text x="${MAP_W-24}" y="${MAP_H-22}" text-anchor="end" font-size="34" font-weight="800" fill="#fff" opacity=".55">${RG.name}</text>`;
  svg.innerHTML=h;
  svg.querySelectorAll('.node.avail,.node.back,.node.signn').forEach(g=>g.onclick=()=>enterNode(+g.dataset.id));
}

function enterNode(id){
  const R=S.run,n=R.nodes[id],prev=R.pos;
  if(n.t==='sign'){const sg=SIGNS[n.sign];overlay(`<div class="big">🚧</div><h2>${sg.title}</h2><div>${sg.text}</div>`,[['Back to the map','',null]]);return;}
  if(n.gate&&(R.bossRest[id]||0)>0){
    overlay(`<div class="big">${TYPES[n.t].icon}</div><h2>Not yet…</h2><div>${n.t==='gators'?'The addigators are still wide awake and grumpy.':'Nobody is here right now.'} Come back after ${R.bossRest[id]} more adventure${R.bossRest[id]>1?'s':''}.</div>`,[['OK','',null]]);return;}
  if(n.t==='boss'&&(R.bossRest[id]||0)>0){say('bossResting');
    overlay(`<div class="big">💤</div><h2>${REGIONS[n.region].boss.n.replace(/^the /,'The ')} is resting</h2><div>Come back after ${R.bossRest[id]} more adventure${R.bossRest[id]>1?'s':''}.</div>`,[['OK','',null]]);return;}
  if(n.t==='exit'||n.t==='back'){
    if(!R.visited.includes(id))R.visited.push(id);
    R.pos=n.to; if(!R.visited.includes(n.to))R.visited.push(n.to); save(); goMap();
    const w=REGIONS[R.nodes[n.to].region].welcome; if(n.t==='exit'&&w)setTimeout(()=>say(w,5000),600); return;}
  const first=!R.visited.includes(id);
  R.pos=id; if(first)R.visited.push(id);
  if(n.t==='start'||n.cleared){save();drawMap();return;}
  R.from=prev; R.newVisit=first; save();
  if(n.t==='boss'&&multi())return inviteHelpers(n);
  startEncounter(n);
}
// A boss! Ask the others to help. Everyone can reach it, because the discovered map is shared.
function inviteHelpers(n){
  say('coopAsk',5000);
  const others=S.players.map((p,i)=>i).filter(i=>i!==S.turn), pickd=new Set(others);
  const draw=()=>{overlay(`<div class="big">🐉</div><h2>${REGIONS[n.region].boss.n.replace(/^the /,'The ')}!</h2>
    <div>${S.name} found the boss. Fight together, or alone?</div><div class="row helpers">${others.map(i=>
      `<button class="helper${pickd.has(i)?' on':''}" data-i="${i}">${dragonSVG(S.players[i].colour,56)}<span>${S.players[i].name}</span><b>${pickd.has(i)?'✔ helping':'not this time'}</b></button>`).join('')}</div>`,
    [['Alone','',()=>startEncounter(n)],[pickd.size?'Together!':'Alone','fire',()=>pickd.size?startCoopBoss(n,[S.turn,...others.filter(i=>pickd.has(i))]):startEncounter(n)]]);
    document.querySelectorAll('#overlayBox .helper').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;pickd.has(i)?pickd.delete(i):pickd.add(i);draw();});};
  draw();
}
function startCoopBoss(n,members){
  stashPlayer(); COOP={owner:S.turn,node:n.id,members};
  const reg=n.region, team=members.map(i=>{const p=S.players[i];return {pi:i,name:p.name,colour:p.colour,hat:p.hat,flame:p.dice||'one6'};});
  Modules.run('duel',{mode:REGIONS[reg].mode,flame:'twin8',boss:true,rival:REGIONS[reg].boss,team},GameHost);
}
function coopRestore(){if(COOP){const c=COOP;COOP=null;activate(c.owner);return c;}return null;}
function startEncounter(n){
  const reg=n.region, mode=REGIONS[reg].mode, late=n.layer>=(reg==='forest'?4:3);
  if(n.t==='duel')Modules.run('duel',{mode,flame:late?(reg==='forest'?'twin6':'big8'):'one6'},GameHost);
  else if(n.t==='choice')Modules.run('duel',{mode,choice:n.layer>=6?['twin8','big12']:pick([['twin6','big8'],['one6','big10']])},GameHost);
  else if(n.t==='boss')Modules.run('duel',{mode,flame:'twin8',boss:true,rival:REGIONS[reg].boss},GameHost);
  else if(n.t==='search')Modules.run('wordsearch',searchCfg(reg,late),GameHost);
  else if(n.t==='rhyme')Modules.run('rhyme',{set:reg,pictures:!late},GameHost);
  else if(n.t==='clock')Modules.run('clock',late?{level:'quarter',minuteRing:true}:pick([{level:'hour',minuteRing:false},{level:'half',minuteRing:false}]),GameHost);
  else if(n.t==='mystery')Modules.run('mystery',{story:'dog',level:'picture'},GameHost);
  else if(n.t==='lily')Modules.run('lilypad',late?pick([{step:5},{step:3},{mode:'gaps',steps:[2,5,10]}]):pick([{step:2},{step:10}]),GameHost);
  else if(n.t==='mozzie')Modules.run('mozzies',late?{kind:'catch',maxTens:5}:{kind:'count',maxTens:4},GameHost);
  else if(n.t==='gators')Modules.run('addigator',{kind:'mixed',max:20},GameHost);
}
function searchCfg(reg,late){
  if(reg==='hollow'||reg==='swamp')return late?{size:7,min:4,max:5,dirs:'hv',want:5,theme:reg}:{size:6,min:3,max:4,dirs:'hv',want:5,theme:reg};
  if(reg==='forest')return late?{size:7,min:4,max:5,dirs:'hv',want:5,theme:'forest'}:{size:6,min:3,max:4,dirs:'hv',want:5,theme:'forest'};
  return late?{size:7,min:4,max:6,dirs:'hvd',want:6,theme:'frost'}:{size:7,min:4,max:5,dirs:'hv',want:5,theme:'frost'};
}
// What modules see of the game: the party, the quill state, and where results go.
const GameHost={
  party:{
    guards:()=>S.run.prot, archers:()=>S.run.arch||0,
    useGuards(n,restFor=2){if(S.run.prot<n)return false;S.run.prot-=n;addRest('prot',n,restFor);return true;},
    useArcher(){if(!(S.run.arch>0))return false;S.run.arch--;addRest('arch',1);return true;},
    canRecruit(n=1){return S.run.prot+resting('prot')+n<=MAX_PROT;},
    // ghost companions (from freeing every clock in a haunted house): only help with clocks; rest after helping
    ghosts:()=>S.run.ghost||0,
    useGhosts(n){if((S.run.ghost||0)<n)return false;S.run.ghost-=n;addRest('ghost',n,2);return true;}},
  isFirstQuill:()=>!S.quillUsed,
  coopTurn(pi){if(COOP&&pi!=null&&pi!==S.turn)activate(pi);},
  retreat(){overlay(`<div class="big">↩</div><h2>Retreat?</h2><div>You'll go back to where you were. This puzzle starts fresh if you come back.</div>`,
    [['Keep going','',null],['Retreat','fire',()=>{Modules.abort();coopRestore();retreat();}]]);},
  skip(){if(useProtector()){Modules.abort();coopRestore();finishEncounter();}},
  done(res){
    if(COOP)return coopDone(res);
    const r=res.rewards;S.wiz+=r.wiz||0;S.sch+=r.sch||0;S.quill+=r.quill||0;S.run.prot+=r.guards||0;
    if(r.ghosts){const room=MAX_GHOST-(S.run.ghost||0)-resting('ghost');if(room>0){S.run.ghost=(S.run.ghost||0)+Math.min(room,r.ghosts);setTimeout(()=>say('ghostJoin',4500),900);}}
    if(res.flags.quillUsed)S.quillUsed=true;
    save();
    const n=S.run.nodes[S.run.pos];
    if((n.t==='boss'||n.gate)&&res.outcome!=='win')finishEncounter({bossLost:true}); else finishEncounter();}};
// A team boss fight is over: everyone who helped gets the shared rewards plus their own (quill points).
function coopDone(res){
  const c=COOP; COOP=null;
  c.members.forEach((pi,k)=>{activate(pi);const add=(r={})=>{S.wiz+=r.wiz||0;S.sch+=r.sch||0;S.quill+=r.quill||0;};
    add(res.rewards);add(res.rewardsBy[k]);});
  activate(c.owner); if(res.flags.quillUsed)S.quillUsed=true; save();
  if(res.outcome!=='win')return finishEncounter({bossLost:true});
  const n=S.run.nodes[c.node], ex=n.next.map(i=>S.run.nodes[i]).find(x=>x.t==='exit');
  finishEncounter({beforeTurn:next=>{
    if(!ex){next();return;}
    const where=REGIONS[S.run.nodes[ex.to].region].name;
    overlay(`<div class="big">🧭</div><h2>Travel on together?</h2><div>The way to ${where} is open. Go on as a team now, or stay and explore a little longer?</div>`,
      [['Stay a while','',next],[`Off to ${where}!`,'fire',()=>{
        stashPlayer(); c.members.forEach(pi=>{const p=S.players[pi];p.r.pos=ex.to;});
        [ex.id,ex.to].forEach(id=>{if(!S.run.visited.includes(id))S.run.visited.push(id);});
        S.run.pos=ex.to; save(); next();
        const w=REGIONS[S.run.nodes[ex.to].region].welcome; if(w)setTimeout(()=>say(w,5000),900);}]]);}});
}
trainBtn.onclick=()=>{if(S.run.prot<3||(S.run.arch||0)>=MAX_ARCH)return;S.run.prot-=3;S.run.arch=(S.run.arch||0)+1;save();updateHud();say('archer',4000);};
function finishEncounter(opts={}){
  const R=S.run,n=R.nodes[R.pos];
  if(opts.bossLost){R.bossRest[n.id]=n.gate?2:3; if(R.from!=null)R.pos=R.from;}
  else if(!PLAIN.includes(n.t)){n.cleared=true;n.fresh=false;R.cleared=R.cleared.filter(x=>x!==n.id);R.cleared.push(n.id);}
  tickRest();   // this player's own comrades
  // the shared world moves on once per round (everyone has had a turn), so more players don't speed it up
  R.turnCount=(R.turnCount||0)+1;
  if(R.turnCount>=(S.players?S.players.length:1)){R.turnCount=0;
    for(const k in R.bossRest){R.bossRest[k]--; if(R.bossRest[k]<=0)delete R.bossRest[k];}
    // encounters refresh through play: oldest cleared stop in this region comes back, keeping the 4 most recent cleared
    const pool=R.cleared.filter(id=>R.nodes[id].region===n.region&&R.nodes[id].t!=='boss'&&!R.nodes[id].gate);
    if(pool.length>4){const o=R.nodes[pool[0]];o.cleared=false;o.fresh=true;R.cleared=R.cleared.filter(x=>x!==o.id);}}
  save();
  const pass=()=>multi()?endTurn():goMap();
  if(opts.beforeTurn){show('map');updateHud();drawMap();return opts.beforeTurn(pass);}
  pass();
}
function resting(t){return ((S.run&&S.run.rest)||[]).filter(r=>r.t===t).reduce((a,r)=>a+r.n,0);}
function addRest(t,n,left=2){if(!S.run.rest)S.run.rest=[];S.run.rest.push({t,n,left});save();updateHud();}
function tickRest(){if(!S.run||!S.run.rest)return;let back=false;
  S.run.rest.forEach(r=>{r.left--;if(r.left<=0){S.run[r.t]=(S.run[r.t]||0)+r.n;back=true;}});
  S.run.rest=S.run.rest.filter(r=>r.left>0);save();if(back)setTimeout(()=>say('rested',4000),1200);}
function useProtector(){
  if(!S.run||S.run.prot<1)return false; S.run.prot--; addRest('prot',1,4); say('skip'); return true;
}

// ---------- Wardrobe ----------
function canAfford(cost){return !cost||Object.entries(cost).every(([k,v])=>S[k]>=v);}
function pay(cost){Object.entries(cost||{}).forEach(([k,v])=>S[k]-=v);}
function openWardrobe(){show('wardrobe');renderWardrobe();}
function renderWardrobe(){
  wDragon.innerHTML=dragonSVG(S.colour,180); wBard.innerHTML=`<div style="width:150px">${bardSVG(S.hat)}</div>`;
  dragonSwatches.innerHTML=''; DRAGON_SHOP.forEach(it=>dragonSwatches.appendChild(swatch(it,S.owned,S.colour,k=>{S.colour=k;})));
  hatSwatches.innerHTML='';
  if(!S.quillUsed){bardHatLabel.textContent='Bard hats: use the 🪶 quill once to unlock!';return;}
  bardHatLabel.textContent='Bard hats';
  HAT_SHOP.forEach(it=>hatSwatches.appendChild(swatch(it,S.hatsOwned,S.hat,k=>{S.hat=k;refreshBard();})));
}
function swatch(it,owned,current,choose){
  const d=document.createElement('button');const have=!it.cost||owned[it.k];
  d.className='swatch'+(current===it.k?' chosen':'')+(have?'':' locked');
  d.innerHTML=`<div class="c" style="background:${COLOURS[it.k]}"></div>${it.name}<span>${have?'':it.label}</span>`;
  d.onclick=()=>{
    if(!have){if(!canAfford(it.cost)){d.classList.add('shake');setTimeout(()=>d.classList.remove('shake'),400);return;}
      pay(it.cost);owned[it.k]=1;}
    choose(it.k);save();renderWardrobe();};
  return d;
}
wardrobeBtn.onclick=openWardrobe;
playersBtn.onclick=managePlayers;
playersStrip.onclick=managePlayers;
wardrobeBack.onclick=goMap;
function retreat(){
  const R=S.run,id=R.pos; if(R.newVisit)R.visited=R.visited.filter(x=>x!==id);
  R.pos=(R.from!=null&&R.visited.includes(R.from))?R.from:R.pos; save();
  goMap(); setTimeout(()=>say('retreat',3500),500);
}
resetBtn.onclick=()=>overlay(`<div class="big">⟲</div><h2>Start over?</h2><div>This wipes everything for every player: names, badges, quill points, colours, hats and the map.<br>It can't be undone.</div>`,
  [['Keep playing','',null],['Wipe and start fresh','fire',()=>{try{localStorage.removeItem(SAVE_KEY);}catch(e){} location.reload();}]]);

// ---------- Boot ----------
refreshBard();
introDragon.innerHTML=dragonSVG(S.colour,150);
if(S.name&&S.run){migrateRun();ensurePlayers();activate(S.turn||0);save();goMap();}
else{show('intro');requestAnimationFrame(setupSig);setTimeout(()=>say('intro',8000),500);}
window.addEventListener('resize',()=>{if(document.getElementById('intro').classList.contains('on'))setupSig();});
