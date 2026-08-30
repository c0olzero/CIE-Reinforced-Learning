/* Workbench — Matter Lab — the three states, and the changes between them
   Cambridge Primary Science 0097, Stage 4.

   Covers the summary framework's section 2.1 (States of Matter & Phase Changes):
     three states       — classify solids, liquids and gases by shape, volume
                          and particle behaviour        — Particle Bench + Solid, Liquid or Gas?
     state transitions  — melting, freezing, evaporating, condensing
                                                        — Name the Change
     temperature points — water freezes at 0°C, boils at 100°C
                                                        — Particle Bench's thresholds

   Boiling is deliberately NOT one of the four named changes quizzed: it is a
   liquid turning into a gas just as evaporating is, so offering both as
   answers to one picture makes the "right" answer arguable. The bench teaches
   it as the 100°C threshold instead. */

import {h, rand, pending} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions, foldlessHud} from "../../../engine/ui.js";
import {arcadeShell} from "../../../engine/arcade.js";
import {sfxGold, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./matter.strings.js";
addStrings(STRINGS);

/* ---------- tuning ---------- */
const MT_PARTICLES=24;      // particles on the bench — enough to read as a lattice, few enough to follow
const MT_ARC_GOOD=300, MT_ARC_BAD=150, MT_ARC_MISS=100;
const MT_ARC_TIME=1000;     // ms added by a blue box only
const MT_ARC_BLUE=0.3;      // 30% of boxes are blue (points AND time); the rest gold
const MT_FALL_SECS=3.4;     // seconds for one item to fall the whole way on Hard
const MT_FALL_RAMP=0.965;   // each sorted item speeds the next one up slightly
const MT_FALL_FLOOR=0.45;   // ...but never below this fraction of the starting time

const STATES=["solid","liquid","gas"];
const stateLabel=s=>t(s==="solid"?"mtSolid":s==="liquid"?"mtLiquid":"mtGas");

/* Everyday things to sort. Kept scientifically clean on purpose: no clouds or
   smoke, which look like gases to a kid but are really suspended droplets and
   solid specks — putting them in the gas jar would teach the misconception
   the objective is meant to clear up. */
const MT_ITEMS=[
  {id:"ice",     state:"solid",  ico:"\u{1F9CA}"},
  {id:"rock",    state:"solid",  ico:"\u{1FAA8}"},
  {id:"book",    state:"solid",  ico:"\u{1F4D5}"},
  {id:"coin",    state:"solid",  ico:"\u{1FA99}"},
  {id:"wood",    state:"solid",  ico:"\u{1FAB5}"},
  {id:"key",     state:"solid",  ico:"\u{1F511}"},
  {id:"water",   state:"liquid", ico:"\u{1F4A7}"},
  {id:"milk",    state:"liquid", ico:"\u{1F95B}"},
  {id:"juice",   state:"liquid", ico:"\u{1F9C3}"},
  {id:"honey",   state:"liquid", ico:"\u{1F36F}"},
  {id:"tea",     state:"liquid", ico:"\u{2615}"},
  {id:"oil",     state:"liquid", ico:"\u{1F6E2}"},
  {id:"steam",   state:"gas",    ico:"\u{2668}"},
  {id:"air",     state:"gas",    ico:"\u{1F32C}"},
  {id:"helium",  state:"gas",    ico:"\u{1F388}"},
  {id:"fizz",    state:"gas",    ico:"\u{1FAE7}"}
];
const itemLabel=it=>t("mtItems")[it.id];

/* Each scenario is a real everyday moment, not an abstract "solid -> liquid":
   the pair of states is what's being taught, but a kid recognises the moment. */
const MT_SCENES=[
  {id:"iceCube",  from:"solid",  to:"liquid", change:"melting",      a:"\u{1F9CA}", b:"\u{1F4A7}"},
  {id:"snow",     from:"solid",  to:"liquid", change:"melting",      a:"\u{2744}",  b:"\u{1F4A7}"},
  {id:"choc",     from:"solid",  to:"liquid", change:"melting",      a:"\u{1F36B}", b:"\u{1F4A7}"},
  {id:"freezer",  from:"liquid", to:"solid",  change:"freezing",     a:"\u{1F4A7}", b:"\u{1F9CA}"},
  {id:"frost",    from:"liquid", to:"solid",  change:"freezing",     a:"\u{1F4A7}", b:"\u{2744}"},
  {id:"puddle",   from:"liquid", to:"gas",    change:"evaporating",  a:"\u{1F4A7}", b:"\u{2668}"},
  {id:"washing",  from:"liquid", to:"gas",    change:"evaporating",  a:"\u{1F4A7}", b:"\u{2668}"},
  {id:"kettle",   from:"liquid", to:"gas",    change:"evaporating",  a:"\u{1F4A7}", b:"\u{2668}"},
  {id:"mirror",   from:"gas",    to:"liquid", change:"condensing",   a:"\u{2668}",  b:"\u{1F4A7}"},
  {id:"coldGlass",from:"gas",    to:"liquid", change:"condensing",   a:"\u{2668}",  b:"\u{1F4A7}"}
];
const CHANGES=["melting","freezing","evaporating","condensing"];
const changeLabel=c=>t(c==="melting"?"mtMelting":c==="freezing"?"mtFreezing"
                      :c==="evaporating"?"mtEvaporating":"mtCondensing");

function mtShuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

/* ---------- tab 1 — Particle Bench ---------- */
/* The picture IS the lesson here: the same particles rearrange rather than
   three separate diagrams, so "it's the same stuff, just arranged differently"
   is something you watch happen instead of something you're told. */
/* The slider picks the state directly, ordered the way it's usually drawn:
   gas on the left, then liquid, then solid. The temperatures didn't get
   dropped along with the old temperature slider — each state still names the
   range it lives in, so 0°C and 100°C are still the thing being taught. */
const MT_SLIDER=["gas","liquid","solid"];
const rangeNote=s=>t(s==="solid"?"mtRangeSolid":s==="liquid"?"mtRangeLiquid":"mtRangeGas");
function renderBench(side,stage){
  const wrap=h("div","mt-wrap bench"), stack=h("div","mt-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  stack.appendChild(h("p","mt-help",t("mtBenchHelp")));

  const box=h("div","mt-box");
  const thresh=h("div","mt-thresh");
  box.appendChild(thresh);
  stack.appendChild(box);
  const readout=h("div","mt-readout");
  const stateName=h("div","mt-statename");
  const note=h("p","mt-note");
  readout.append(stateName,note);
  stack.appendChild(readout);

  const p1=h("div","panel");
  p1.append(h("h4",null,t("mtState").toUpperCase()));
  const lw=h("div","lever-wrap"); lw.appendChild(h("div","ticks"));
  const lever=document.createElement("input");
  lever.type="range"; lever.min=0; lever.max=2; lever.step=1; lever.value=1;
  lever.className="lever"; lever.setAttribute("aria-label",t("mtState"));
  lw.appendChild(lever); p1.appendChild(lw);
  const labs=h("div","clk-unit-labs");
  MT_SLIDER.forEach(s=>labs.appendChild(h("span",null,stateLabel(s))));
  p1.appendChild(labs);
  side.appendChild(p1);

  /* particles live in logical 0..100 space and are positioned in %, so the
     simulation is completely independent of the box's pixel size */
  const dots=[], parts=[];
  const cols=6, rows=Math.ceil(MT_PARTICLES/cols);
  for(let i=0;i<MT_PARTICLES;i++){
    const d=h("div","mt-dot"); box.appendChild(d); dots.push(d);
    const cx=(i%cols), cy=Math.floor(i/cols);
    parts.push({
      hx:14+cx*14.4, hy:44+cy*14,            // lattice "home" for the solid
      x:14+cx*14.4,  y:44+cy*14,
      vx:0, vy:0, ph:Math.random()*Math.PI*2
    });
  }
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

  let state="liquid", raf=0, alive=true;
  pending.push(()=>{ alive=false; cancelAnimationFrame(raf); });

  /* Reposition as well as re-velocity on every state change. Letting the
     particles drift out of the old arrangement looked like a clump for the
     first few seconds, which teaches the opposite of "a gas spreads out to
     fill the space" — the arrangement has to read correctly immediately. */
  function seedFor(state){
    parts.forEach(p=>{
      if(state==="solid"){
        p.x=p.hx; p.y=p.hy; p.vx=0; p.vy=0;
      }else{
        const top=state==="liquid"?46:8;
        p.x=8+Math.random()*84;
        p.y=top+Math.random()*(92-top);
        const sp=state==="liquid"?0.18:0.75;
        const a=Math.random()*Math.PI*2;
        p.vx=Math.cos(a)*sp; p.vy=Math.sin(a)*sp;
      }
    });
  }
  let shown=state;
  seedFor(shown);

  function step(){
    parts.forEach(p=>{
      if(state==="solid"){
        // pinned to the lattice, only vibrating on the spot
        p.ph+=0.08;
        const amp=reduce?0:1.5;
        p.x=p.hx+Math.cos(p.ph)*amp;
        p.y=p.hy+Math.sin(p.ph*1.3)*amp;
      }else{
        // liquid keeps a surface and pools at the bottom; gas fills everything
        const top=state==="liquid"?42:6;
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<6){ p.x=6; p.vx=Math.abs(p.vx); }
        if(p.x>94){ p.x=94; p.vx=-Math.abs(p.vx); }
        if(p.y<top){ p.y=top; p.vy=Math.abs(p.vy); }
        if(p.y>94){ p.y=94; p.vy=-Math.abs(p.vy); }
      }
    });
    dots.forEach((d,i)=>{
      d.style.left=parts[i].x+"%";
      d.style.top=parts[i].y+"%";
    });
    if(alive && !reduce) raf=requestAnimationFrame(step);
  }

  function draw(){
    if(state!==shown){ shown=state; seedFor(state); }
    box.classList.remove("solid","liquid","gas");
    box.classList.add(state);
    stateName.textContent=stateLabel(state);
    stateName.className="mt-statename "+state;
    note.textContent=t(state==="solid"?"mtSolidNote":state==="liquid"?"mtLiquidNote":"mtGasNote");
    [...labs.children].forEach((el,i)=>el.classList.toggle("active",MT_SLIDER[i]===state));
    // the temperature band this state lives in — still where 0°C and 100°C get taught
    thresh.textContent=rangeNote(state);
    thresh.classList.add("on");
    if(reduce) step();
  }
  lever.oninput=()=>{ state=MT_SLIDER[+lever.value]; draw(); };
  draw();
  if(!reduce) raf=requestAnimationFrame(step);
}

/* ---------- tab 2 — Solid, Liquid or Gas? ---------- */
function renderSort(side,stage){
  foldlessHud(stage);
  hudQuestion(stage,t("mtQSort"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","mt-wrap"), stack=h("div","mt-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const card=h("div","mt-card");
  const ico=h("div","mt-ico"), name=h("div","mt-itemname");
  card.append(ico,name); stack.appendChild(card);

  let cur=null,answered=false,lastId=null;
  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    let pick;
    do{ pick=rand(MT_ITEMS); }while(pick.id===lastId);
    lastId=pick.id; cur=pick;
    ico.textContent=cur.ico;
    name.textContent=itemLabel(cur);
    STATES.forEach(s=>{
      const btn=h("button","abtn",stateLabel(s));
      btn.onclick=()=>answer(s);
      act.appendChild(btn);
    });
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=said===cur.state;
    act.hidden=true; score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    const proof=h("div","mt-card proof");
    proof.append(h("div","mt-ico",cur.ico),h("div","mt-itemname",itemLabel(cur)),
                 h("div","mt-statename "+cur.state,stateLabel(cur.state)));
    celebrate(stage,ok,t("mtSortWhy")(itemLabel(cur),stateLabel(cur.state)),deal,t("nextQ"),proof);
  }
  deal();
}

/* ---------- tab 3 — Name the Change ---------- */
function renderChange(side,stage){
  foldlessHud(stage);
  hudQuestion(stage,t("mtQChange"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","mt-wrap"), stack=h("div","mt-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const scene=h("p","mt-scene"); stack.appendChild(scene);
  const row=h("div","mt-changerow"); stack.appendChild(row);

  let cur=null,answered=false,lastId=null;
  function buildRow(target){
    target.innerHTML="";
    const from=h("div","mt-half");
    from.append(h("div","mt-ico",cur.a),h("div","mt-statename "+cur.from,stateLabel(cur.from)));
    const to=h("div","mt-half");
    to.append(h("div","mt-ico",cur.b),h("div","mt-statename "+cur.to,stateLabel(cur.to)));
    target.append(from,h("div","mt-arrow","→"),to);
  }
  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    let pick;
    do{ pick=rand(MT_SCENES); }while(pick.id===lastId);
    lastId=pick.id; cur=pick;
    scene.textContent=t("mtScenes")[cur.id];
    buildRow(row);
    // all four changes every time: the set is small and fixed, so a kid is
    // choosing between the real alternatives rather than a lucky pair
    mtShuffle(CHANGES.slice()).forEach(c=>{
      const btn=h("button","abtn",changeLabel(c));
      btn.onclick=()=>answer(c);
      act.appendChild(btn);
    });
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=said===cur.change;
    act.hidden=true; score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    const proof=h("div","mt-changerow proof");
    buildRow(proof);
    celebrate(stage,ok,
      t("mtChangeWhy")(stateLabel(cur.from),stateLabel(cur.to),changeLabel(cur.change)),
      deal,t("nextQ"),proof);
  }
  deal();
}

/* ---------- tab 4 — Arcade ---------- */
/* One thing falls at a time and you send it to a jar. Deliberately not a drag:
   the three jars are real buttons, so a click, a tap and the 1/2/3 keys all
   run the identical path and the game is fully playable from the keyboard. */
function renderArcade(side,stage){
  const wrap=h("div","mt-arc"); stage.appendChild(wrap);
  const lane=h("div","mt-lane"); wrap.appendChild(lane);
  const faller=h("div","mt-faller");
  const fIco=h("div","mt-ico"), fName=h("div","mt-itemname");
  /* the +1s badge, not the blue itself, is what says "this one buys time" —
     blue and gold are already the bench's colours for solid and gas, so a
     colour-only cue here would read as a hint about the answer */
  const fBadge=h("div","mt-badge",t("bonusSec"));
  faller.append(fIco,fName,fBadge); lane.appendChild(faller);

  const jars=h("div","mt-jars"); wrap.appendChild(jars);
  const jarEls={};
  STATES.forEach((s,i)=>{
    const b=h("button","mt-jar "+s);
    b.append(h("span","mt-jarkey",String(i+1)),h("span","mt-jarlab",stateLabel(s)));
    jars.appendChild(b); jarEls[s]=b;
  });
  wrap.appendChild(h("p","mt-hint",t("mtBinHint")));

  let cur=null, y=0, fallMs=0, lastId=null, api=null, bonus=false;

  function spawn(){
    let pick;
    do{ pick=rand(MT_ITEMS); }while(MT_ITEMS.length>1 && pick.id===lastId);
    lastId=pick.id; cur=pick;
    bonus=Math.random()<MT_ARC_BLUE;
    fIco.textContent=cur.ico;
    fName.textContent=itemLabel(cur);
    faller.className="mt-faller "+(bonus?"blue":"gold");
    fBadge.hidden=!bonus;
    y=0; faller.style.top="0%"; faller.hidden=false;
  }
  function sort(state){
    if(!api||!api.running||!cur) return;
    const rect=faller.getBoundingClientRect();
    const ok=state===cur.state;
    if(ok){
      const pts=api.award(MT_ARC_GOOD);
      // only a blue box buys time; a gold one is points alone
      if(bonus) api.addTime(MT_ARC_TIME);
      api.pop(rect.left+rect.width/2,rect.top,
              bonus?"+"+pts+" "+t("bonusSec"):"+"+pts,
              bonus?"var(--c3)":"var(--c5)");
      sfxGold();
      fallMs=Math.max(MT_FALL_SECS*1000*MT_FALL_FLOOR,fallMs*MT_FALL_RAMP);
    }else{
      api.penalise(MT_ARC_BAD);
      api.pop(rect.left+rect.width/2,rect.top,"-"+MT_ARC_BAD,"var(--red)");
      sfxWrong();
    }
    const jar=jarEls[state];
    jar.classList.add(ok?"hit":"miss");
    setTimeout(()=>jar.classList.remove("hit","miss"),260);
    spawn();
  }
  STATES.forEach(s=>{ jarEls[s].onclick=()=>sort(s); });
  const onKey=e=>{
    const i="123".indexOf(e.key);
    if(i>=0){ e.preventDefault(); sort(STATES[i]); }
  };
  addEventListener("keydown",onKey);
  pending.push(()=>removeEventListener("keydown",onKey));

  api=arcadeShell(stage,{
    how:"arcHowMt",
    key:"mtarc",
    rules:[["var(--c1)","ruleMtGold"],["var(--c3)","ruleMtBlue"],
           ["var(--red)","ruleMtBad"],["var(--c5)","ruleMtMiss"]],
    reset(){
      fallMs=MT_FALL_SECS*1000;      // Normal stretches this via tm below
      spawn();
    },
    frame(dt,played,a){
      if(!cur) return;
      y+=100*(dt/(fallMs*a.tm));
      if(y>=100){
        const rect=faller.getBoundingClientRect();
        a.penalise(MT_ARC_MISS);
        a.pop(rect.left+rect.width/2,rect.top,"-"+MT_ARC_MISS,"var(--c1)");
        sfxWrong();
        spawn();
        return;
      }
      faller.style.top=y+"%";
    },
    cleanup(){ faller.hidden=true; cur=null; }
  });
}

export default {
  games:[
    /* no `full`: this bench drives itself from the temperature slider in the
       side panel, and .lab.full hides that panel outright */
    {id:"bench",  name:"gMtBench",  blurb:"gMtBenchP",  render:renderBench},
    {id:"sort",   name:"gMtSort",   blurb:"gMtSortP",   render:renderSort,   full:true},
    {id:"change", name:"gMtChange", blurb:"gMtChangeP", render:renderChange, full:true},
    {id:"arc",    name:"gMtArc",    blurb:"gMtArcP",    render:renderArcade, full:true, rainbow:true}
  ]
};
