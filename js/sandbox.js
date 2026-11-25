// ---------- Module sandbox: play one encounter with chosen settings, see the results ----------
save=function(){};   // the sandbox never writes the real game's save
const $=id=>document.getElementById(id);
const SB={p:null,launch:null,last:null,history:[]};

function fillModules(){
  $('sbModule').innerHTML=Object.values(Modules.list).map(m=>`<option value="${m.id}">${m.name}</option>`).join('');
  fillPresets();
}
function fillPresets(){
  const m=Modules.list[$('sbModule').value];
  $('sbPreset').innerHTML=Object.keys(m.presets||{}).map(k=>`<option>${k}</option>`).join('')+'<option value="">(custom)</option>';
  usePreset();
}
function usePreset(){
  const m=Modules.list[$('sbModule').value], k=$('sbPreset').value;
  if(!k)return;
  $('sbParams').value=JSON.stringify(Object.assign({},m.defaults,m.presets[k]),null,2);
}
$('sbModule').onchange=fillPresets;
$('sbPreset').onchange=usePreset;
$('sbParams').oninput=()=>{$('sbPreset').value='';};
$('sbColour').innerHTML=Object.keys(COLOURS).map(c=>`<option ${c===S.colour?'selected':''}>${c}</option>`).join('');

const SandboxHost={
  party:{
    guards:()=>SB.p.guards, archers:()=>SB.p.archers,
    useGuards(n){if(SB.p.guards<n)return false;SB.p.guards-=n;SB.p.used.guards+=n;return true;},
    useArcher(){if(SB.p.archers<1)return false;SB.p.archers--;SB.p.used.archers++;return true;},
    ghosts:()=>SB.p.ghosts,
    useGhosts(n){if(SB.p.ghosts<n)return false;SB.p.ghosts-=n;SB.p.used.ghosts+=n;return true;},
    canRecruit(n=1){return SB.p.guards+SB.p.used.guards+n<=SB.p.max;}},
  isFirstQuill:()=>SB.firstQuill,
  retreat(run){overlay(`<div class="big">↩</div><h2>Retreat?</h2><div>Ends this test run.</div>`,
    [['Keep going','',null],['Retreat','fire',()=>{const r=run.report('retreat');Modules.abort();results(r);}]]);},
  skip(run){if(SB.p.guards<1)return;SB.p.guards--;SB.p.used.guards++;const r=run.report('skip');Modules.abort();results(r);},
  done(res){results(res);}
};

function launch(params){
  if(!params){
    try{params=JSON.parse($('sbParams').value||'{}');}
    catch(e){$('sbErr').textContent='The parameters are not valid JSON: '+e.message;return;}
  }
  $('sbErr').textContent='';
  S.name=$('sbName').value.trim()||'Tester'; S.colour=$('sbColour').value; S.sig=null;
  SB.p={guards:+$('sbGuards').value||0,archers:+$('sbArchers').value||0,ghosts:+$('sbGhosts').value||0,max:+$('sbMax').value||0,used:{guards:0,archers:0,ghosts:0}};
  SB.firstQuill=$('sbFirstQuill').checked;
  S.quillLevel=+$('sbQuill').value||1;
  S.quillStrict=$('sbStrict').checked;
  SB.launch={module:$('sbModule').value,preset:$('sbPreset').value||'(custom)',params,
    party:{guards:SB.p.guards,archers:SB.p.archers,ghosts:SB.p.ghosts,max:SB.p.max},quillLevel:S.quillLevel};
  Modules.run(SB.launch.module,params,SandboxHost);
}
$('sbPlay').onclick=()=>launch();
$('sbAgain').onclick=()=>launch(SB.launch&&SB.launch.params);
$('sbBack').onclick=()=>show('sbSetup');

const ICON={win:'🏆',lose:'💨',retreat:'↩',skip:'🛡️'};
const secs=ms=>ms==null?'–':(ms/1000).toFixed(1)+' s';
const mins=ms=>{const s=Math.round(ms/1000);return s<60?s+' s':Math.floor(s/60)+' min '+(s%60)+' s';};

function results(res){
  const st=res.stats, L=SB.launch;
  SB.last={...res,launch:L,used:{...SB.p.used},verdict:null,notes:''};
  SB.history.unshift(SB.last);
  $('sbNotes').value=''; $('sbReport').style.display='none';
  $('sbUp').classList.remove('chosen'); $('sbDown').classList.remove('chosen');
  const rw=Object.entries(res.rewards).map(([k,v])=>`<span class="chip">${{wiz:'🔮',sch:'📜',quill:'🪶',guards:'🛡️',ghosts:'👻'}[k]||k} ${k} +${v}</span>`).join('')||'<span class="small">none</span>';
  $('sbSummary').innerHTML=`
    <div class="big">${ICON[res.outcome]||'❔'}</div>
    <div><b>${Modules.list[res.module].name}</b> · ${L.preset}</div>
    <div>Outcome: <b>${res.outcome}</b></div>
    <div>Right first time: <b>${st.firstTry} of ${st.questions}</b>${st.firstTryRate!=null?` (${Math.round(st.firstTryRate*100)}%)`:''} · ${st.attempts} attempt${st.attempts===1?'':'s'} in all</div>
    <div>Typical answer time: <b>${secs(st.medianMs)}</b> · whole scene: ${mins(st.totalMs)}</div>
    <div class="chips">Rewards: ${rw}</div>
    <div class="small">Helpers used: 🛡️ ${SB.last.used.guards} · 🏹 ${SB.last.used.archers} · 👻 ${SB.last.used.ghosts}</div>`;
  $('sbLog').innerHTML='<tr><th>#</th><th>What</th><th></th><th>Time</th></tr>'+
    (st.log.length?st.log.map((a,i)=>`<tr><td>${i+1}</td><td>${a.item.replace(/</g,'&lt;')}</td><td class="${a.correct?'ok':'bad'}">${a.correct?'✔':'✘'}</td><td>${secs(a.ms)}</td></tr>`).join('')
      :'<tr><td colspan="4" class="small">No answers logged.</td></tr>');
  renderHistory();
  show('sbResults');
}
function verdict(v){
  if(!SB.last)return; SB.last.verdict=v;
  $('sbUp').classList.toggle('chosen',v==='up'); $('sbDown').classList.toggle('chosen',v==='down');
  renderHistory();
}
$('sbUp').onclick=()=>verdict('up');
$('sbDown').onclick=()=>verdict('down');
$('sbNotes').oninput=()=>{if(SB.last)SB.last.notes=$('sbNotes').value;};

function renderHistory(){
  $('sbHistory').innerHTML=SB.history.length?SB.history.map(h=>{const st=h.stats;
    return `<div>${ICON[h.outcome]||''} <b>${Modules.list[h.module].name}</b> · ${h.launch.preset} · ${st.firstTryRate!=null?Math.round(st.firstTryRate*100)+'% first try':'no answers'}${h.verdict?' · '+(h.verdict==='up'?'👍':'👎'):''}</div>`;}).join(''):'No runs yet.';
}
function reportText(){
  const h=SB.last, st=h.stats;
  return [
    `### Sandbox report: ${Modules.list[h.module].name} · ${h.launch.preset}`,
    `Verdict: ${h.verdict==='up'?'👍 keep it':h.verdict==='down'?'👎 needs work':'(none)'}`,
    `Outcome: ${h.outcome} · first try ${st.firstTry}/${st.questions}${st.firstTryRate!=null?' ('+Math.round(st.firstTryRate*100)+'%)':''} · ${st.attempts} attempts · typical answer ${secs(st.medianMs)} · total ${mins(st.totalMs)}`,
    `Rewards: ${Object.entries(h.rewards).map(([k,v])=>k+' +'+v).join(', ')||'none'} · helpers used: guards ${h.used.guards}, archers ${h.used.archers}, ghosts ${h.used.ghosts}`,
    `Quill level: ${['','trace','remember','free'][h.launch.quillLevel]}`,
    `Party at start: guards ${h.launch.party.guards}, archers ${h.launch.party.archers}, ghosts ${h.launch.party.ghosts}, limit ${h.launch.party.max}`,
    'Parameters:','```json',JSON.stringify(h.launch.params),'```',
    `Notes: ${h.notes||'(none)'}`].join('\n');
}
$('sbCopy').onclick=()=>{
  const t=reportText(), box=$('sbReport');
  box.value=t;
  const fallback=()=>{box.style.display='';box.focus();box.select();$('sbCopy').textContent='📋 Select and copy below';};
  try{navigator.clipboard.writeText(t).then(()=>{$('sbCopy').textContent='✔ Copied!';setTimeout(()=>$('sbCopy').textContent='📋 Copy report',1800);},fallback);}
  catch(e){fallback();}
};

// ---------- Boot ----------
refreshBard();
fillModules();
show('sbSetup');
