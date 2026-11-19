// ---------- Dragon & Bard: the game (world, party, wardrobe) ----------
const MAX_PROT=6, MAX_ARCH=3;
function updateHud(){
  bWiz.textContent=S.wiz; bSch.textContent=S.sch; bQuill.textContent=S.quill;
  bProt.textContent=S.run?S.run.prot:0; bArch.textContent=S.run?(S.run.arch||0):0;
  const rp=resting('prot'), ra=resting('arch'); rProt.textContent=rp; rArch.textContent=ra;
  restProtPill.style.display=rp?'':'none'; restArchPill.style.display=ra?'':'none'; restGrp.style.display=(rp||ra)?'':'none';
  trainBtn.style.display=(S.run&&S.run.prot>=3&&(S.run.arch||0)<MAX_ARCH)?'':'none';
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
  S.name=typed||'little dragon';
  if(sigDirty)S.sig=sig.toDataURL('image/png');
  save(); say('welcome',5000); newRun(); goMap();
};
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
    boss:{n:'the Frost Wyrm',c:'blue'}}};
const TYPES={start:{icon:'⛺',col:'#888'},duel:{icon:'🔥',col:'#9b6bff'},choice:{icon:'🎲',col:'#9b6bff'},
  search:{icon:'📜',col:'#2fc4b2'},rhyme:{icon:'🎵',col:'#2fc4b2'},boss:{icon:'🐉',col:'#ff7a2f'},
  sign:{icon:'🚧',col:'#b08a3c'},exit:{icon:'➡️',col:'#3a7bff'},back:{icon:'⬅️',col:'#3a7bff'}};
const PLAIN=['start','sign','exit','back'];
function iconFor(n){if(n.region==='frost'){if(n.t==='duel')return '❄️';if(n.t==='boss')return '🐲';}return TYPES[n.t].icon;}
const SIGNS={
  hollow:{title:'Path to Haunted Hollow',text:'A crooked sign: CLOSED FOR CONSTRUCTION.<br>From somewhere behind it comes a ghostly giggle.'},
  meadow:{title:'Path to Meadowfold',text:'A sign on the fence: CLOSED FOR CONSTRUCTION.<br>You can smell fresh bread on the breeze.'},
  hushwall:{title:'Road to Hushwall City',text:'A sign: CLOSED FOR CONSTRUCTION.<br>Underneath, in very tiny letters: <i>shhh!</i>'},
  tundra:{title:'Way to the Windswept Tundra',text:'A frosty sign: CLOSED FOR CONSTRUCTION.<br>Far away, caravan bells jingle in the wind.'},
  mine:{title:'The sealed mine doors',text:'A sign: CLOSED FOR CONSTRUCTION.<br>Behind it, someone has scratched graffiti into the stone:<br><b>"Speak Fr…"</b>'},
  beyond:{title:'Beyond the Frostpeaks',text:'The path vanishes into fog. CLOSED FOR CONSTRUCTION.<br>More of the world is coming soon!'}};
function genRegion(region,mid,signs,nodes){
  const layers=[[{t:'start'}]];
  for(let i=1;i<=mid;i++){
    const n=2+Math.floor(Math.random()*2);
    const duel=()=>(i>=Math.ceil(mid/2)&&Math.random()<.5)?'choice':'duel';
    const word=()=>Math.random()<.5?'search':'rhyme';
    const L=[{t:duel()},{t:word()}]; if(n===3)L.push({t:Math.random()<.5?duel():word()});
    L.sort(()=>Math.random()-.5); layers.push(L);}
  layers.push([{t:'boss'}]);
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
function makeDeco(region){const R=REGIONS[region],d=[];
  for(let i=0;i<95;i++)d.push({x:Math.random()*MAP_W,y:Math.random()*MAP_H,k:Math.random()<R.treeShare?'tree':'mtn',s:.7+Math.random()*.8});return d;}
function newRun(){
  const nodes=[];
  const F=genRegion('forest',7,[{key:'hollow',layer:2,top:true},{key:'meadow',layer:4,top:false},{key:'hushwall',layer:6,top:true}],nodes);
  const R=genRegion('frost',5,[{key:'tundra',layer:2,top:true},{key:'mine',layer:4,top:false}],nodes);
  F.exit.to=R.start.id;
  R.exit.t='sign';R.exit.sign='beyond';
  const back={id:nodes.length,region:'frost',t:'back',layer:0,x:110,y:640,next:[],to:F.exit.id};nodes.push(back);R.start.next.push(back.id);
  const keep=S.run&&S.run.world===2?null:{prot:(S.run&&S.run.prot)||0,arch:(S.run&&S.run.arch)||0};
  S.run={world:2,nodes,pos:F.start.id,visited:[F.start.id],seen:[],cleared:[],bossRest:{},rest:[],
    prot:keep?keep.prot:0,arch:keep?keep.arch:0,deco:{forest:makeDeco('forest'),frost:makeDeco('frost')}};
  save();
}
function migrateRun(){if(!S.run||S.run.world!==2)newRun();}
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
    const big=n.t==='boss';
    h+=`<g class="${cls.join(' ')}" data-id="${n.id}"><circle cx="${n.x}" cy="${n.y}" r="${big?50:38}" fill="${T.col}"/>
      <text x="${n.x}" y="${n.y+14}" text-anchor="middle" font-size="${big?46:36}">${ic}</text>
      ${cls.includes('fresh')?`<text x="${n.x+30}" y="${n.y-24}" font-size="26">✨</text>`:''}</g>`;});
  h+=`<g transform="translate(${cur.x-45},${cur.y-115})">${dragonSVG(S.colour,90).replace('<svg','<svg x="0" y="0"')}</g>`;
  h+=`<text x="${MAP_W-24}" y="${MAP_H-22}" text-anchor="end" font-size="34" font-weight="800" fill="#fff" opacity=".55">${RG.name}</text>`;
  svg.innerHTML=h;
  svg.querySelectorAll('.node.avail,.node.back,.node.signn').forEach(g=>g.onclick=()=>enterNode(+g.dataset.id));
}

function enterNode(id){
  const R=S.run,n=R.nodes[id],prev=R.pos;
  if(n.t==='sign'){const sg=SIGNS[n.sign];overlay(`<div class="big">🚧</div><h2>${sg.title}</h2><div>${sg.text}</div>`,[['Back to the map','',null]]);return;}
  if(n.t==='boss'&&(R.bossRest[id]||0)>0){say('bossResting');
    overlay(`<div class="big">💤</div><h2>${REGIONS[n.region].boss.n.replace(/^the /,'The ')} is resting</h2><div>Come back after ${R.bossRest[id]} more adventure${R.bossRest[id]>1?'s':''}.</div>`,[['OK','',null]]);return;}
  if(n.t==='exit'||n.t==='back'){
    if(!R.visited.includes(id))R.visited.push(id);
    R.pos=n.to; if(!R.visited.includes(n.to))R.visited.push(n.to); save(); goMap();
    if(n.t==='exit')setTimeout(()=>say('frostWelcome',5000),600); return;}
  const first=!R.visited.includes(id);
  R.pos=id; if(first)R.visited.push(id);
  if(n.t==='start'||n.cleared){save();drawMap();return;}
  R.from=prev; R.newVisit=first; save();
  startEncounter(n);
}
function startEncounter(n){
  const reg=n.region, mode=REGIONS[reg].mode, late=n.layer>=(reg==='forest'?4:3);
  if(n.t==='duel')Modules.run('duel',{mode,flame:late?(reg==='forest'?'twin6':'big8'):'one6'},GameHost);
  else if(n.t==='choice')Modules.run('duel',{mode,choice:n.layer>=6?['twin8','big12']:pick([['twin6','big8'],['one6','big10']])},GameHost);
  else if(n.t==='boss')Modules.run('duel',{mode,flame:'twin8',boss:true,rival:REGIONS[reg].boss},GameHost);
  else if(n.t==='search')Modules.run('wordsearch',searchCfg(reg,late),GameHost);
  else if(n.t==='rhyme')Modules.run('rhyme',{set:reg,pictures:!late},GameHost);
}
function searchCfg(reg,late){
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
    ghosts:()=>0, useGhosts(){return false;}},   // ghost companions arrive with the Haunted Hollow
  isFirstQuill:()=>!S.quillUsed,
  retreat(){overlay(`<div class="big">↩</div><h2>Retreat?</h2><div>You'll go back to where you were. This puzzle starts fresh if you come back.</div>`,
    [['Keep going','',null],['Retreat','fire',()=>{Modules.abort();retreat();}]]);},
  skip(){if(useProtector()){Modules.abort();finishEncounter();}},
  done(res){
    const r=res.rewards;S.wiz+=r.wiz||0;S.sch+=r.sch||0;S.quill+=r.quill||0;S.run.prot+=r.guards||0;
    if(res.flags.quillUsed)S.quillUsed=true;
    save();
    const n=S.run.nodes[S.run.pos];
    if(n.t==='boss'&&res.outcome!=='win')finishEncounter({bossLost:true}); else finishEncounter();}};
trainBtn.onclick=()=>{if(S.run.prot<3||(S.run.arch||0)>=MAX_ARCH)return;S.run.prot-=3;S.run.arch=(S.run.arch||0)+1;save();updateHud();say('archer',4000);};
function finishEncounter(opts={}){
  const R=S.run,n=R.nodes[R.pos];
  if(opts.bossLost){R.bossRest[n.id]=3; if(R.from!=null)R.pos=R.from;}
  else if(!PLAIN.includes(n.t)){n.cleared=true;n.fresh=false;R.cleared=R.cleared.filter(x=>x!==n.id);R.cleared.push(n.id);}
  tickRest();
  for(const k in R.bossRest){R.bossRest[k]--; if(R.bossRest[k]<=0)delete R.bossRest[k];}
  // encounters refresh through play: oldest cleared stop in this region comes back, keeping the 4 most recent cleared
  const pool=R.cleared.filter(id=>R.nodes[id].region===n.region&&R.nodes[id].t!=='boss');
  if(pool.length>4){const o=R.nodes[pool[0]];o.cleared=false;o.fresh=true;R.cleared=R.cleared.filter(x=>x!==o.id);}
  save(); goMap();
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
wardrobeBack.onclick=goMap;
function retreat(){
  const R=S.run,id=R.pos; if(R.newVisit)R.visited=R.visited.filter(x=>x!==id);
  R.pos=(R.from!=null&&R.visited.includes(R.from))?R.from:R.pos; save();
  goMap(); setTimeout(()=>say('retreat',3500),500);
}
resetBtn.onclick=()=>overlay(`<div class="big">⟲</div><h2>Start over?</h2><div>This wipes everything: name, badges, quill points, colours and hats.<br>It can't be undone.</div>`,
  [['Keep playing','',null],['Wipe and start fresh','fire',()=>{try{localStorage.removeItem(SAVE_KEY);}catch(e){} location.reload();}]]);

// ---------- Boot ----------
refreshBard();
introDragon.innerHTML=dragonSVG(S.colour,150);
if(S.name&&S.run){migrateRun();goMap();}
else{show('intro');requestAnimationFrame(setupSig);setTimeout(()=>say('intro',8000),500);}
window.addEventListener('resize',()=>{if(document.getElementById('intro').classList.contains('on'))setupSig();});
