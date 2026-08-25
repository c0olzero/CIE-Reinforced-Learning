/* Workbench — Telling Time — clocks, unit conversion, notation and duration
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Gt.01 to 4Gt.04

   4Gt.01 units of time (days/hours/minutes/sec) — Conversion Bench + Convert It!
   4Gt.02 read a clock to the nearest minute     — Clock Bench + Read the Clock
   4Gt.03 12-hour vs 24-hour notation             — Clock Bench's digital readout, and
                                                     Read the Clock's digital-face rounds
   4Gt.04 elapsed time / duration                — Elapsed Time
   ============================================================ */

import {h, SVGNS, rand} from "../../../engine/dom.js";
import {t, addStrings, getLang} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions, foldlessHud} from "../../../engine/ui.js";
import {sfxGold, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./time.strings.js";
addStrings(STRINGS);

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
/* dedupe candidates, keep the true answer, fill the rest with shuffled
   distractors and shuffle the final order — same "offer fewer rather than
   hang" spirit as engine/dom.js's pickOptions, just for string answers. */
function opts4(cands,truth){
  const uniq=shuffle([...new Set(cands)].filter(v=>v!==truth));
  return shuffle([truth,...uniq.slice(0,3)]);
}

/* clock-face point: 0deg = 12 o'clock, clockwise — same convention as
   compassPoint() in symmetry.js, reads as "point-up" the way a kid expects. */
function clockPoint(cx,cy,r,deg){
  const rad=deg*Math.PI/180;
  return [cx+r*Math.sin(rad), cy-r*Math.cos(rad)];
}
const hourAngle=(hh,mm)=>(hh%12)*30+mm*0.5;
const minAngle=mm=>mm*6;
const pad2=n=>String(n).padStart(2,"0");
/* h is always 24-hour internally (0-23); these two just format it */
function fmt12(hh,mm){ const h12=((hh+11)%12)+1; return h12+":"+pad2(mm)+" "+(hh<12?t("am"):t("pm")); }
function fmt24(hh,mm){ return pad2(hh)+":"+pad2(mm); }

/* draws (or redraws) a full analogue face into an existing <svg> */
function drawClockFace(svg,hh,mm,size){
  size=size||260;
  svg.setAttribute("viewBox","0 0 "+size+" "+size);
  while(svg.firstChild) svg.removeChild(svg.firstChild);
  const node=(tag,cls,at,txt)=>{ const e=document.createElementNS(SVGNS,tag);
    if(cls) e.setAttribute("class",cls);
    for(const k in at) e.setAttribute(k,at[k]);
    if(txt!=null) e.textContent=txt;
    svg.appendChild(e); return e; };
  const cx=size/2, cy=size/2, R=size/2-10;
  node("circle","clk-rim",{cx,cy,r:R});
  for(let i=0;i<60;i++){
    const maj=i%5===0;
    const p1=clockPoint(cx,cy,R*(maj?0.84:0.92),i*6);
    const p2=clockPoint(cx,cy,R*0.98,i*6);
    node("line","clk-tick"+(maj?" maj":""),{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1]});
  }
  for(let n=1;n<=12;n++){
    const [x,y]=clockPoint(cx,cy,R*0.7,n*30);
    node("text","clk-num",{x,y},String(n));
  }
  const hd=clockPoint(cx,cy,R*0.5,hourAngle(hh,mm));
  const md=clockPoint(cx,cy,R*0.78,minAngle(mm));
  node("line","clk-hand clk-hand-h",{x1:cx,y1:cy,x2:hd[0],y2:hd[1]});
  node("line","clk-hand clk-hand-m",{x1:cx,y1:cy,x2:md[0],y2:md[1]});
  node("circle","clk-hub",{cx,cy,r:size*0.035});
}
function clockFace(){
  const svg=document.createElementNS(SVGNS,"svg");
  svg.setAttribute("class","clk-face");
  return svg;
}

/* ---------- tab 1 — Clock Bench (4Gt.02, .03) ---------- */
const BENCH_FACE=338;   // clk-face's viewBox size — kept in step with the CSS width
/* draggable handles at each hand's tip, on top of the static face —
   grabbing one and dragging drives the very same hour/minute state the
   sliders do, so both stay in sync and the sliders keep it keyboard-usable */
function addDragHandles(svg,hh,mm,size){
  const cx=size/2, cy=size/2, R=size/2-10;
  const node=(tag,cls,at)=>{ const e=document.createElementNS(SVGNS,tag);
    e.setAttribute("class",cls); for(const k in at) e.setAttribute(k,at[k]); svg.appendChild(e); return e; };
  const hd=clockPoint(cx,cy,R*0.5,hourAngle(hh,mm));
  const md=clockPoint(cx,cy,R*0.78,minAngle(mm));
  node("circle","clk-handle h",{cx:hd[0],cy:hd[1],r:size*0.05,"data-hand":"h"});
  node("circle","clk-handle m",{cx:md[0],cy:md[1],r:size*0.045,"data-hand":"m"});
}
function renderClockBench(side,stage){
  const wrap=h("div","clk-wrap bench"), stack=h("div","clk-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const svg=clockFace(); svg.style.pointerEvents="auto"; svg.style.touchAction="none";
  stack.appendChild(svg);
  const digital=h("div","clk-digital");
  const d12=h("div","clk-d12"), d24=h("div","clk-d24");
  digital.append(d12,h("span","clk-d-sep","|"),d24); stack.appendChild(digital);

  let hh12=3, mm=0, pm=false;

  const p1=h("div","panel");
  p1.append(h("h4",null,t("hour").toUpperCase()));
  const hlw=h("div","lever-wrap"); hlw.appendChild(h("div","ticks"));
  const hLever=document.createElement("input");
  hLever.type="range"; hLever.min=1; hLever.max=12; hLever.value=hh12; hLever.className="lever";
  hLever.setAttribute("aria-label",t("hour"));
  hlw.appendChild(hLever); p1.appendChild(hlw);

  const p2=h("div","panel");
  p2.append(h("h4",null,t("minute").toUpperCase()));
  const mlw=h("div","lever-wrap"); mlw.appendChild(h("div","ticks"));
  const mLever=document.createElement("input");
  mLever.type="range"; mLever.min=0; mLever.max=59; mLever.value=mm; mLever.className="lever";
  mLever.setAttribute("aria-label",t("minute"));
  mlw.appendChild(mLever); p2.appendChild(mlw);

  const p3=h("div","panel");
  p3.append(h("h4",null,t("ampm").toUpperCase()));
  const swWrap=h("label","clk-switch");
  const swInput=document.createElement("input");
  swInput.type="checkbox"; swInput.setAttribute("aria-label",t("ampm"));
  const swTrack=h("span","clk-switch-track"); swTrack.appendChild(h("span","clk-switch-thumb"));
  const labAm=h("span","clk-switch-lab am",t("am").toUpperCase());
  const labPm=h("span","clk-switch-lab pm",t("pm").toUpperCase());
  swWrap.append(labAm,swInput,swTrack,labPm);
  p3.appendChild(swWrap);
  side.append(p1,p2,p3);

  hLever.oninput=()=>{ hh12=+hLever.value; draw(); };
  mLever.oninput=()=>{ mm=+mLever.value; draw(); };
  swInput.onchange=()=>{ pm=swInput.checked; draw(); };

  let dragging=null, lastDeg=0, minuteAccum=0, wrapBase=0;
  const DEAD_R=BENCH_FACE*0.12;  // atan2's angle is only stable a healthy distance from the hub —
                                  // right near it, a one-pixel sideways wobble swings the angle wildly,
                                  // and any real drag strays this close at some point mid-motion
  function pointerPos(e){
    const rect=svg.getBoundingClientRect();
    const x=(e.clientX-rect.left)*(BENCH_FACE/rect.width);
    const y=(e.clientY-rect.top)*(BENCH_FACE/rect.height);
    return [x,y];
  }
  function angleOf(x,y){
    const cx=BENCH_FACE/2, cy=BENCH_FACE/2;
    let deg=Math.atan2(x-cx,-(y-cy))*180/Math.PI;
    if(deg<0) deg+=360;
    return deg;
  }
  svg.addEventListener("pointerdown",e=>{
    const target=e.target.closest(".clk-handle");
    if(!target) return;
    dragging=target.getAttribute("data-hand");
    if(dragging==="m"){ lastDeg=angleOf(...pointerPos(e)); minuteAccum=mm; wrapBase=0; }
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  svg.addEventListener("pointermove",e=>{
    if(!dragging) return;
    const [x,y]=pointerPos(e);
    const cx=BENCH_FACE/2, cy=BENCH_FACE/2;
    if(Math.hypot(x-cx,y-cy)<DEAD_R) return;   // ignore this sample rather than let a near-hub
                                                 // wobble feed a corrupt angle into the drag
    const deg=angleOf(x,y);
    if(dragging==="m"){
      // track the minute hand's own continuous turn rather than snapping
      // straight from the angle each tick, so a drag that carries it past
      // 12 rolls the hour along too — the same way the two hands are
      // mechanically linked for real. minuteAccum stays a running float
      // for the whole drag (never re-derived from the rounded mm), or a
      // string of small pointermove ticks would each round their own
      // fraction-of-a-minute away and the hand would feel stuck.
      let delta=deg-lastDeg;
      if(delta>180) delta-=360;
      if(delta<-180) delta+=360;
      lastDeg=deg;
      minuteAccum+=delta/6;
      // round ONCE to a whole minute, then derive the wrap count and the
      // displayed mm from that same integer. Rounding mm and flooring the
      // wrap count independently (as this used to) disagree for ~0.5min
      // near every hour boundary — mm rolls to 0 while the wrap count
      // hasn't ticked yet, or vice versa — and a real drag's natural
      // jitter straddles exactly that gap, flipping the hour forward and
      // back on consecutive ticks instead of landing once and staying put.
      const roundedTotal=Math.round(minuteAccum);
      const wrapped=Math.floor(roundedTotal/60);
      const hourDelta=wrapped-wrapBase;
      wrapBase=wrapped;
      mm=((roundedTotal%60)+60)%60;
      mLever.value=mm;
      if(hourDelta!==0){
        hh12=((hh12-1+hourDelta)%12+12)%12+1;
        hLever.value=hh12;
      }
    }else{
      const raw=Math.round(deg/30)%12;
      hh12=raw===0?12:raw;
      hLever.value=hh12;
    }
    draw();
  });
  const stopDrag=()=>{ dragging=null; };
  svg.addEventListener("pointerup",stopDrag);
  svg.addEventListener("pointercancel",stopDrag);

  function draw(){
    const hh24=pm ? (hh12%12)+12 : (hh12%12);
    drawClockFace(svg,hh24,mm,BENCH_FACE);
    addDragHandles(svg,hh24,mm,BENCH_FACE);
    d12.textContent=hh12+":"+pad2(mm)+(pm?t("pmShort"):t("amShort"));
    d24.textContent=fmt24(hh24,mm);
    labAm.classList.toggle("active",!pm);
    labPm.classList.toggle("active",pm);
  }
  draw();
}

/* ---------- tab 2 — Conversion Bench (4Gt.01) ---------- */
/* days -> hours -> minutes -> seconds, each step a x24/x60/x60 multiplier —
   the "from" and "to" sliders each pick a rung on that same ladder, so any
   pair (adjacent or not) reuses one shared conversion instead of four
   separate hard-coded pairs. */
const TIME_UNITS=["days","hours","minutes","seconds"];
const SEC_PER_UNIT=[86400,3600,60,1];
const UNIT_RANGE=[[1,14],[1,48],[1,120],[1,120]];
const UNIT_KEYS=[["dayOne","dayMany"],["clkHr1","clkHrs"],["clkMin1","clkMins"],["secOne","secMany"]];
function unitLabel(idx,n){ const [one,many]=UNIT_KEYS[idx]; return t(n===1?one:many); }
function fmtNum(v){
  const r=Math.round(v*100)/100;
  return r.toLocaleString(getLang()==="vi"?"vi-VN":"en-US",{maximumFractionDigits:2});
}
function renderUnitsBench(side,stage){
  const wrap=h("div","clk-wrap bench"), stack=h("div","clk-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const eq=h("div","clk-conv-eq");
  stack.appendChild(eq);

  let fromU=0, toU=1, val=3;

  function unitPicker(labelKey,initial){
    const p=h("div","panel");
    p.append(h("h4",null,t(labelKey).toUpperCase()));
    const lw=h("div","lever-wrap"); lw.appendChild(h("div","ticks"));
    const lever=document.createElement("input");
    lever.type="range"; lever.min=0; lever.max=3; lever.value=initial; lever.className="lever";
    lever.setAttribute("aria-label",t(labelKey));
    lw.appendChild(lever); p.appendChild(lw);
    const labs=h("div","clk-unit-labs");
    TIME_UNITS.forEach((u,i)=>labs.appendChild(h("span",null,unitLabel(i,2))));
    p.appendChild(labs);
    return {panel:p,lever,labs};
  }
  const from=unitPicker("fromUnit",fromU), to=unitPicker("toUnit",toU);

  const p3=h("div","panel");
  p3.append(h("h4",null,t("amount").toUpperCase()));
  const vlw=h("div","lever-wrap"); vlw.appendChild(h("div","ticks"));
  const vLever=document.createElement("input");
  vLever.type="range"; vLever.min=1; vLever.max=14; vLever.value=val; vLever.className="lever";
  vlw.appendChild(vLever); p3.appendChild(vlw);
  const vOut=h("p","note"); p3.appendChild(vOut);

  side.append(from.panel,to.panel,p3);

  from.lever.oninput=()=>{ fromU=+from.lever.value; syncRange(); draw(); };
  to.lever.oninput=()=>{ toU=+to.lever.value; syncRange(); draw(); };
  vLever.oninput=()=>{ val=+vLever.value; draw(); };

  /* converting a smaller unit up into a bigger one (e.g. hours -> days)
     needs a different amount range: values below one whole "to" unit are
     always 0-point-something of it, which isn't the point of this bench,
     so the minimum is bumped up to exactly 1 of the bigger unit and the
     step becomes half of it (hours -> days: min 24, step 12). Converting
     the other way (or between equal units) keeps the plain 1..N range. */
  function syncRange(){
    if(fromU>toU){
      const ratio=SEC_PER_UNIT[toU]/SEC_PER_UNIT[fromU];
      const step=ratio/2;
      vLever.min=ratio; vLever.step=step;
      vLever.max=Math.max(UNIT_RANGE[fromU][1],ratio+step*3);
      if(val<ratio) val=ratio;
      val=Math.round((val-ratio)/step)*step+ratio;
    }else{
      const [lo,hi]=UNIT_RANGE[fromU];
      vLever.min=lo; vLever.max=hi; vLever.step=1;
      if(val<lo) val=lo; if(val>hi) val=hi;
    }
    if(val>+vLever.max) val=+vLever.max;
    vLever.value=val;
  }
  function draw(){
    [...from.labs.children].forEach((el,i)=>el.classList.toggle("active",i===fromU));
    [...to.labs.children].forEach((el,i)=>el.classList.toggle("active",i===toU));
    const converted=val*SEC_PER_UNIT[fromU]/SEC_PER_UNIT[toU];
    vOut.textContent=fmtNum(val)+" "+unitLabel(fromU,val);
    eq.textContent=fmtNum(val)+" "+unitLabel(fromU,val)+" = "+fmtNum(converted)+" "+unitLabel(toU,converted);
  }
  syncRange(); draw();
}

/* ---------- tab 3 — Read the Clock (4Gt.02, .03) ---------- */
/* Three ways the time is shown, picked at random each round: the analogue
   face (as before — AM/PM is inherently ambiguous on a 12-hour face, so it
   never needs to be resolved), a 24-hour digital readout (reading this one
   back as a 12-hour answer is real 4Gt.03 notation practice), and a 12-hour
   AM/PM digital readout. */
const READ_STIM=["analog","d24","d12"];
/* Distractors are the real ways a kid misreads a clock, not random numbers:
   reading the hour the hand is nearest to instead of which hour it's still
   *between* (past halfway rounds up early), and misreading the minute hand
   against a neighbouring tick mark. Returned as raw [h,m] pairs so the
   caller can format them either as digits or as a past/to phrase. */
function readDistractorPairs(trueH,mm){
  const wrap=m=>((m%60)+60)%60;
  const nextH=(trueH%12)+1, prevH=((trueH+10)%12)+1;
  const wrongHour = mm>=30 ? nextH : prevH;
  return [[wrongHour,mm], [trueH,wrap(mm+5)], [trueH,wrap(mm-5)],
          [trueH,wrap(mm+10)], [trueH,wrap(mm-10)]];
}
const readDigits=(hh,mm)=>hh+":"+pad2(mm);
function renderReadClock(side,stage){
  foldlessHud(stage);
  hudQuestion(stage,t("qRead"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","clk-wrap"), stack=h("div","clk-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const slot=h("div","clk-read-slot"); stack.appendChild(slot);

  let H=0,M=0,verbal=false,answered=false,lastKey=null;
  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    let key;
    do{
      // 40% of rounds ask for the "past/to" phrase instead of digits — those
      // only ever land on a real 5-minute tick, or "twenty-three past four"
      // isn't a thing anyone says
      verbal=Math.random()<0.4;
      H=Math.floor(Math.random()*24);
      M=verbal ? 5*Math.floor(Math.random()*12) : Math.floor(Math.random()*60);
      key=H+":"+M+":"+verbal;
    }while(key===lastKey);
    lastKey=key;

    slot.innerHTML="";
    const stim=rand(READ_STIM);
    if(stim==="analog"){
      const svg=clockFace(); slot.appendChild(svg);
      drawClockFace(svg,H,M,280);
    }else if(stim==="d24"){
      const box=h("div","clk-digibig");
      box.appendChild(h("div","clk-digibig-time",fmt24(H,M)));
      slot.appendChild(box);
    }else{
      const pm=H>=12, h12=((H+11)%12)+1;
      const box=h("div","clk-digibig");
      box.appendChild(h("div","clk-digibig-time",h12+":"+pad2(M)));
      box.appendChild(h("div","clk-digibig-ap",pm?t("pmShort"):t("amShort")));
      slot.appendChild(box);
    }

    const trueH=(H%12)||12;
    const label=verbal ? t("pastToPhrase") : readDigits;
    const truth=label(trueH,M);
    const cands=readDistractorPairs(trueH,M).map(([hh,mm])=>label(hh,mm));
    opts4(cands,truth).forEach(v=>{
      const btn=h("button","abtn",v);
      btn.onclick=()=>answer(v===truth,truth);
      act.appendChild(btn);
    });
  }
  function answer(ok,truth){
    if(answered) return; answered=true;
    act.hidden=true; score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    // the stimulus already on stage is the proof (unchanged, still the
    // right time) — dimming it in place, not redrawing a second one
    celebrate(stage,ok,t("readWhy")(truth),deal,t("nextQ"));
  }
  deal();
}

/* ---------- tab 4 — Convert It! (4Gt.01) ---------- */
/* Same unit ladder as the Conversion Bench, quizzed instead of explored.
   Distractors are keyed by the exact (bigger-unit-per-smaller-unit) ratio
   involved, not generated generically — each one is a specific, nameable
   mix-up (used the wrong pair's factor, or only did one hop of a two-hop
   conversion) rather than an arbitrary wrong number. */
const RATIO_CONFUSE={
  24:    [12,60,100],     // days<->hours: half a day, hour/minute mix-up, decimal slip
  60:    [24,100,12],     // hours<->minutes or minutes<->seconds
  1440:  [24,60,100],     // days<->minutes (2 hops): only did the 1st hop, only the 2nd, decimal slip
  3600:  [60,24,1000],    // hours<->seconds (2 hops)
  86400: [1440,3600,24]   // days<->seconds (3 hops): partial-hop results
};
function pickUnitQuizRound(){
  let fromU,toU;
  // days (index 0) only ever pairs with hours (index 1), in either direction
  // — "how many minutes/seconds in N days" (or the reverse) gets unwieldy
  // fast, so days never hops past the first unit either way
  do{
    fromU=Math.floor(Math.random()*4); toU=Math.floor(Math.random()*4);
  }while(fromU===toU || ((fromU===0||toU===0) && fromU!==1 && toU!==1));
  let val;
  if(fromU<toU){
    const [lo,hi]=UNIT_RANGE[fromU];
    val=lo+Math.floor(Math.random()*(hi-lo+1));
  }else{
    // smaller unit converting up — keep the value a clean multiple of the
    // bigger unit so the answer is always a whole number, same reasoning
    // as the Conversion Bench's own step/minimum rule
    const mult=SEC_PER_UNIT[toU]/SEC_PER_UNIT[fromU];
    const maxK=Math.max(1,Math.floor(UNIT_RANGE[fromU][1]/mult));
    val=mult*(1+Math.floor(Math.random()*maxK));
  }
  return {fromU,toU,val};
}
function unitQuizDistractors(val,fromU,toU){
  const mult=fromU<toU;
  const ratio=mult ? SEC_PER_UNIT[fromU]/SEC_PER_UNIT[toU] : SEC_PER_UNIT[toU]/SEC_PER_UNIT[fromU];
  const confuse=RATIO_CONFUSE[ratio]||[12,24,60];
  return confuse.map(c=>mult?val*c:val/c).filter(v=>v>0&&isFinite(v));
}
function renderUnitQuiz(side,stage){
  foldlessHud(stage);
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","clk-wrap"), stack=h("div","clk-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  // the question IS the big central display — "2 days = ?? minutes" — rather
  // than a separate corner label repeating "2 days" again just below it
  const big=h("div","clk-big"); stack.appendChild(big);

  let fromU=0,toU=1,val=1,answered=false,lastPair="";
  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    let round;
    do{ round=pickUnitQuizRound(); } while(round.fromU+","+round.toU===lastPair);
    ({fromU,toU,val}=round);
    lastPair=fromU+","+toU;
    const truth=val*SEC_PER_UNIT[fromU]/SEC_PER_UNIT[toU];
    const fromText=fmtNum(val)+" "+unitLabel(fromU,val);
    big.textContent=t("qUnitConvert")(fromText,unitLabel(toU,2));
    const truthLabel=fmtNum(truth)+" "+unitLabel(toU,truth);
    opts4(unitQuizDistractors(val,fromU,toU).map(v=>fmtNum(v)+" "+unitLabel(toU,v)),truthLabel).forEach(v=>{
      const btn=h("button","abtn",v);
      btn.onclick=()=>answer(v===truthLabel,truth);
      act.appendChild(btn);
    });
  }
  function answer(ok,truth){
    if(answered) return; answered=true;
    act.hidden=true; score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    const mult=fromU<toU;
    const ratio=mult ? SEC_PER_UNIT[fromU]/SEC_PER_UNIT[toU] : SEC_PER_UNIT[toU]/SEC_PER_UNIT[fromU];
    const valText=fmtNum(val)+" "+unitLabel(fromU,val);
    const truthText=fmtNum(truth)+" "+unitLabel(toU,truth);
    const why=mult
      ? t("unitWhyMul")(unitLabel(fromU,1),ratio,unitLabel(toU,ratio),valText,truthText)
      : t("unitWhyDiv")(ratio,unitLabel(fromU,ratio),unitLabel(toU,1),valText,truthText);
    celebrate(stage,ok,why,deal,t("nextQ"));
  }
  deal();
}

/* ---------- tab 5 — Elapsed Time (4Gt.04) ---------- */
function fmtDuration(mins){
  const hh=Math.floor(mins/60), mm=mins%60;
  const hLab=hh+" "+(hh===1?t("clkHr1"):t("clkHrs"));
  const mLab=mm+" "+(mm===1?t("clkMin1"):t("clkMins"));
  if(hh===0) return mLab;
  if(mm===0) return hLab;
  return hLab+" "+mLab;
}
function addMinutes(hh,mm,delta){
  const total=(((hh*60+mm+delta)%1440)+1440)%1440;
  return [Math.floor(total/60), total%60];
}
function durationDistractors(dur){
  return [15,-15,30,-30,45,-45,60,-60].map(o=>dur+o).filter(v=>v>0).map(fmtDuration);
}
function endDistractors(sH,sM,dur){
  const hoursOnly=Math.floor(dur/60);
  const naiveMin=((sM+dur)%60+60)%60;
  const naiveH=((sH+hoursOnly)%24+24)%24;        // forgot the carry from minute overflow
  const overCarryH=((sH+hoursOnly+1)%24+24)%24;  // carried a second time by mistake
  const [aH,aM]=addMinutes(sH,sM,dur+30);
  const [bH,bM]=addMinutes(sH,sM,dur-30);
  return [fmt12(naiveH,naiveMin), fmt12(overCarryH,naiveMin), fmt12(aH,aM), fmt12(bH,bM)];
}
function beforeDistractors(sH,sM,dur){
  const hoursOnly=Math.floor(dur/60);
  const naiveMin=((sM-dur)%60+60)%60;
  const naiveH=((sH-hoursOnly)%24+24)%24;         // forgot to borrow across the hour
  const overBorrowH=((sH-hoursOnly-1)%24+24)%24;  // borrowed an extra hour by mistake
  const [aH,aM]=addMinutes(sH,sM,-(dur+30));
  const [bH,bM]=addMinutes(sH,sM,-(dur-30));
  return [fmt12(naiveH,naiveMin), fmt12(overBorrowH,naiveMin), fmt12(aH,aM), fmt12(bH,bM)];
}
/* line-graph proof: a hour-marked axis from the earlier time to the later
   one, with both actual moments marked and the elapsed span highlighted —
   replaces the plain two-dot bar with something that actually shows scale. */
function drawElapsedTimeline(leftH,leftM,rightH,rightM,dur,accent){
  const PAD=30, axisLo=-PAD, axisHi=dur+PAD;
  const W=480,H=110,padX=26,baseY=68;
  const svg=document.createElementNS(SVGNS,"svg");
  svg.setAttribute("class","clk-eltl");
  svg.setAttribute("viewBox","0 0 "+W+" "+H);
  const node=(tag,cls,at,txt)=>{ const e=document.createElementNS(SVGNS,tag);
    if(cls) e.setAttribute("class",cls);
    for(const k in at) e.setAttribute(k,at[k]);
    if(txt!=null) e.textContent=txt;
    svg.appendChild(e); return e; };
  const xOf=mins=>padX+(mins-axisLo)/(axisHi-axisLo)*(W-2*padX);

  node("line","clk-eltl-base",{x1:xOf(axisLo),y1:baseY,x2:xOf(axisHi),y2:baseY});
  node("line","clk-eltl-span "+accent,{x1:xOf(0),y1:baseY,x2:xOf(dur),y2:baseY});

  let tickOff=leftM===0?0:60-leftM;
  while(tickOff-60>=axisLo) tickOff-=60;
  for(let off=tickOff; off<=axisHi; off+=60){
    const x=xOf(off);
    node("line","clk-eltl-tick",{x1:x,y1:baseY-6,x2:x,y2:baseY+6});
    const [th,tm]=addMinutes(leftH,leftM,off);
    node("text","clk-eltl-hourlab",{x,y:baseY+22},fmt12(th,tm).replace(":00","").replace(" ",""));
  }

  node("circle","clk-eltl-dot "+accent,{cx:xOf(0),cy:baseY,r:6});
  node("circle","clk-eltl-dot "+accent,{cx:xOf(dur),cy:baseY,r:6});
  node("text","clk-eltl-lab",{x:xOf(0),y:baseY-14},fmt12(leftH,leftM));
  node("text","clk-eltl-lab",{x:xOf(dur),y:baseY-14},fmt12(rightH,rightM));
  node("text","clk-eltl-durlab "+accent,{x:xOf(dur/2),y:H-6},fmtDuration(dur));
  return svg;
}
function renderElapsed(side,stage){
  foldlessHud(stage);
  const q=hudQuestion(stage,"");
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","clk-wrap"), stack=h("div","clk-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const row=h("div","clk-elapsed-row"); stack.appendChild(row);

  let sH=0,sM=0,dur=0,mode="dur",answered=false,lastKey=null;
  let leftH=0,leftM=0,rightH=0,rightM=0;
  function deal(){
    answered=false; act.hidden=false; act.innerHTML=""; row.innerHTML=""; row.hidden=false;
    let key;
    do{
      sH=Math.floor(Math.random()*24); sM=Math.floor(Math.random()*60);
      dur=5*(1+Math.floor(Math.random()*35));       // 5 to 175 minutes
      mode=["dur","add","before"][Math.floor(Math.random()*3)];   // NB: not "sub" — that collides with
                                                                    // base.css's global .sub class (card subtitle)
      key=mode+","+sH+","+sM+","+dur;
    }while(key===lastKey);
    lastKey=key;
    let truth;
    if(mode==="dur"){
      [rightH,rightM]=addMinutes(sH,sM,dur); leftH=sH; leftM=sM;
      q.textContent=t("qDuration");
      row.append(h("div","clk-elapsed-t",fmt12(sH,sM)),
                 h("div","clk-elapsed-arrow dur","→ "+fmt12(rightH,rightM)));
      truth=fmtDuration(dur);
      opts4(durationDistractors(dur),truth).forEach(v=>{
        const btn=h("button","abtn",v); btn.onclick=()=>answer(v===truth,truth); act.appendChild(btn);
      });
    }else if(mode==="add"){
      [rightH,rightM]=addMinutes(sH,sM,dur); leftH=sH; leftM=sM;
      q.textContent=t("qEndTime")(fmtDuration(dur));
      row.append(h("div","clk-elapsed-t",fmt12(sH,sM)),
                 h("div","clk-elapsed-arrow add","+ "+fmtDuration(dur)+" = ??"));
      truth=fmt12(rightH,rightM);
      opts4(endDistractors(sH,sM,dur),truth).forEach(v=>{
        const btn=h("button","abtn",v); btn.onclick=()=>answer(v===truth,truth); act.appendChild(btn);
      });
    }else{
      [leftH,leftM]=addMinutes(sH,sM,-dur); rightH=sH; rightM=sM;
      q.textContent=t("qBeforeTime")(fmtDuration(dur));
      row.append(h("div","clk-elapsed-t",fmt12(sH,sM)),
                 h("div","clk-elapsed-arrow before","− "+fmtDuration(dur)+" = ??"));
      truth=fmt12(leftH,leftM);
      opts4(beforeDistractors(sH,sM,dur),truth).forEach(v=>{
        const btn=h("button","abtn",v); btn.onclick=()=>answer(v===truth,truth); act.appendChild(btn);
      });
    }
  }
  function answer(ok,truth){
    if(answered) return; answered=true;
    act.hidden=true; score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    row.hidden=true;   // the timeline below replaces it — otherwise the same
                        // time labels show through the dim right behind it
    const proof=drawElapsedTimeline(leftH,leftM,rightH,rightM,dur,mode);
    celebrate(stage,ok,t("elapsedWhy")(fmt12(leftH,leftM),fmt12(rightH,rightM),fmtDuration(dur)),deal,t("nextQ"),proof);
  }
  deal();
}

export default {
  games:[
    {id:"clock",    name:"gClock",    blurb:"gClockP",    render:renderClockBench},
    {id:"units",    name:"gUnits",    blurb:"gUnitsP",     render:renderUnitsBench},
    {id:"read",     name:"gRead",     blurb:"gReadP",      render:renderReadClock,  full:true},
    {id:"unitquiz", name:"gUnitQuiz", blurb:"gUnitQuizP",  render:renderUnitQuiz,   full:true},
    {id:"elapsed",  name:"gElapsed",  blurb:"gElapsedP",   render:renderElapsed,    full:true}
  ]
};
