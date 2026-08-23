/* Workbench — Telling Time — clocks, calendar facts, notation and duration
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Gt.01 to 4Gt.04

   4Gt.01 units of time & days-in-month     4Gt.03 12-hour vs 24-hour notation
   4Gt.02 read a clock to the nearest min   4Gt.04 elapsed time / duration
   ============================================================ */

import {h, SVGNS} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
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
function renderClockBench(side,stage){
  const wrap=h("div","clk-wrap bench"), stack=h("div","clk-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const svg=clockFace(); stack.appendChild(svg);
  const digital=h("div","clk-digital");
  const d12=h("div","clk-d12"), d24=h("div","clk-d24");
  digital.append(d12,d24); stack.appendChild(digital);

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
  const ampmBtn=h("button","abtn",t("am"));
  p3.appendChild(ampmBtn);
  side.append(p1,p2,p3);

  hLever.oninput=()=>{ hh12=+hLever.value; draw(); };
  mLever.oninput=()=>{ mm=+mLever.value; draw(); };
  ampmBtn.onclick=()=>{ pm=!pm; draw(); };

  function draw(){
    const hh24=pm ? (hh12%12)+12 : (hh12%12);
    drawClockFace(svg,hh24,mm,260);
    d12.textContent=fmt12(hh24,mm);
    d24.textContent=fmt24(hh24,mm);
    ampmBtn.textContent=pm?t("pm"):t("am");
  }
  draw();
}

/* ---------- tab 2 — Calendar & Units (4Gt.01) ---------- */
const DAYS_IN_MONTH=[31,28,31,30,31,30,31,31,30,31,30,31];
function renderCalendarBench(side,stage){
  const wrap=h("div","clk-wrap bench"), stack=h("div","clk-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);

  const calHead=h("div","clk-cal-head");
  const prevBtn=h("button","abtn","‹"), nextBtn=h("button","abtn","›");
  const monLabel=h("div","clk-cal-mon");
  calHead.append(prevBtn,monLabel,nextBtn);
  const grid=h("div","clk-cal-grid");
  const note=h("div","clk-cal-note");
  stack.append(calHead,grid,note);

  let month=0, leap=false;
  prevBtn.onclick=()=>{ month=(month+11)%12; draw(); };
  nextBtn.onclick=()=>{ month=(month+1)%12; draw(); };

  const p1=h("div","panel");
  p1.append(h("h4",null,t("leapYear").toUpperCase()));
  const leapBtn=h("button","abtn",t("leapOff"));
  p1.append(leapBtn,h("p","note",t("leapHelp")));
  leapBtn.onclick=()=>{ leap=!leap; draw(); };

  const p2=h("div","panel");
  p2.append(h("h4",null,t("clkWeeks").toUpperCase()));
  const wlw=h("div","lever-wrap"); wlw.appendChild(h("div","ticks"));
  const wLever=document.createElement("input");
  wLever.type="range"; wLever.min=1; wLever.max=8; wLever.value=2; wLever.className="lever";
  wlw.appendChild(wLever); p2.appendChild(wlw);
  const wOut=h("p","note"); p2.appendChild(wOut);

  const p3=h("div","panel");
  p3.append(h("h4",null,t("clkHours").toUpperCase()));
  const hlw=h("div","lever-wrap"); hlw.appendChild(h("div","ticks"));
  const hLever=document.createElement("input");
  hLever.type="range"; hLever.min=1; hLever.max=48; hLever.value=3; hLever.className="lever";
  hlw.appendChild(hLever); p3.appendChild(hlw);
  const hOut=h("p","note"); p3.appendChild(hOut);

  side.append(p1,p2,p3);

  wLever.oninput=()=>{ const w=+wLever.value; wOut.textContent=t("weeksEq")(w,w*7); };
  hLever.oninput=()=>{ const hv=+hLever.value; hOut.textContent=t("hoursEq")(hv,hv*60,hv*3600); };

  function draw(){
    monLabel.textContent=t("mon"+month);
    const days = month===1 ? (leap?29:28) : DAYS_IN_MONTH[month];
    grid.innerHTML="";
    for(let d=1; d<=days; d++) grid.appendChild(h("div","clk-cal-day",String(d)));
    note.textContent=t("daysCount")(t("mon"+month),days);
    leapBtn.textContent=leap?t("leapOn"):t("leapOff");
  }
  wLever.oninput(); hLever.oninput(); draw();
}

/* ---------- tab 3 — Read the Clock (4Gt.02) ---------- */
/* Distractors are the real ways a kid misreads a clock, not random numbers:
   reading the hour the hand is nearest to instead of which hour it's still
   *between* (past halfway rounds up early), and misreading the minute hand
   against a neighbouring tick mark. */
function readDistractors(trueH,mm){
  const label=(hh,m)=>hh+":"+pad2(((m%60)+60)%60);
  const nextH=(trueH%12)+1, prevH=((trueH+10)%12)+1;
  const wrongHour = mm>=30 ? nextH : prevH;
  return [label(wrongHour,mm), label(trueH,mm+5), label(trueH,mm-5),
          label(trueH,mm+10), label(trueH,mm-10)];
}
function renderReadClock(side,stage){
  foldlessHud(stage);
  hudQuestion(stage,t("qRead"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","clk-wrap"), stack=h("div","clk-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const svg=clockFace(); stack.appendChild(svg);

  let H=0,M=0,answered=false;
  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    H=Math.floor(Math.random()*12); M=Math.floor(Math.random()*60);
    drawClockFace(svg,H,M,280);
    const trueH=(H%12)||12;
    const truth=trueH+":"+pad2(M);
    opts4(readDistractors(trueH,M),truth).forEach(v=>{
      const btn=h("button","abtn",v);
      btn.onclick=()=>answer(v===truth,truth);
      act.appendChild(btn);
    });
  }
  function answer(ok,truth){
    if(answered) return; answered=true;
    act.hidden=true; score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    // the clock already on stage is the proof (unchanged, still the right time) —
    // dimming it in place, not redrawing a second one, avoids two overlapping faces
    celebrate(stage,ok,t("readWhy")(truth),deal,t("nextQ"));
  }
  deal();
}

/* ---------- tab 4 — 12-Hour or 24-Hour? (4Gt.03) ---------- */
/* Distractors: the classic off-by-12 slip in both directions, plus a plain
   off-by-one-hour misreading. */
function convertDistractors(H,M,dir){
  if(dir==="to24") return [fmt24(H%12,M), fmt24((H+12)%24,M), fmt24((H+1)%24,M), fmt24((H+23)%24,M)];
  return [fmt12((H+12)%24,M), fmt12((H+1)%24,M), fmt12((H+23)%24,M)];
}
function renderConvert(side,stage){
  foldlessHud(stage);
  const q=hudQuestion(stage,"");
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","clk-wrap"), stack=h("div","clk-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const big=h("div","clk-big"); stack.appendChild(big);

  let H=0,M=0,dir="to24",answered=false;
  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    H=Math.floor(Math.random()*24); M=Math.floor(Math.random()*60);
    dir=Math.random()<0.5?"to24":"to12";
    q.textContent = dir==="to24" ? t("qTo24") : t("qTo12");
    big.textContent = dir==="to24" ? fmt12(H,M) : fmt24(H,M);
    const truth = dir==="to24" ? fmt24(H,M) : fmt12(H,M);
    opts4(convertDistractors(H,M,dir),truth).forEach(v=>{
      const btn=h("button","abtn",v);
      btn.onclick=()=>answer(v===truth,truth);
      act.appendChild(btn);
    });
  }
  function answer(ok,truth){
    if(answered) return; answered=true;
    act.hidden=true; score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    celebrate(stage,ok,t("convertWhy")(fmt12(H,M),fmt24(H,M)),deal,t("nextQ"));
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
function renderElapsed(side,stage){
  foldlessHud(stage);
  const q=hudQuestion(stage,"");
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","clk-wrap"), stack=h("div","clk-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const row=h("div","clk-elapsed-row"); stack.appendChild(row);

  let sH=0,sM=0,eH=0,eM=0,dur=0,mode="dur",answered=false;
  function deal(){
    answered=false; act.hidden=false; act.innerHTML=""; row.innerHTML=""; row.hidden=false;
    sH=Math.floor(Math.random()*24); sM=Math.floor(Math.random()*60);
    dur=5*(1+Math.floor(Math.random()*35));       // 5 to 175 minutes
    [eH,eM]=addMinutes(sH,sM,dur);
    mode=Math.random()<0.5?"dur":"end";
    let truth;
    if(mode==="dur"){
      q.textContent=t("qDuration");
      row.append(h("div","clk-elapsed-t",fmt12(sH,sM)),h("div","clk-elapsed-arrow","→"),
                 h("div","clk-elapsed-t",fmt12(eH,eM)));
      truth=fmtDuration(dur);
      opts4(durationDistractors(dur),truth).forEach(v=>{
        const btn=h("button","abtn",v); btn.onclick=()=>answer(v===truth,truth); act.appendChild(btn);
      });
    }else{
      q.textContent=t("qEndTime")(fmtDuration(dur));
      row.append(h("div","clk-elapsed-t",fmt12(sH,sM)),h("div","clk-elapsed-arrow","+ "+fmtDuration(dur)));
      truth=fmt12(eH,eM);
      opts4(endDistractors(sH,sM,dur),truth).forEach(v=>{
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
    const proof=h("div","clk-tl");
    const track=h("div","clk-tl-track");
    track.append(h("div","clk-tl-fill"),h("div","clk-tl-durlabel",fmtDuration(dur)));
    proof.append(h("div","clk-tl-lab",fmt12(sH,sM)),track,h("div","clk-tl-lab",fmt12(eH,eM)));
    celebrate(stage,ok,t("elapsedWhy")(fmt12(sH,sM),fmt12(eH,eM),fmtDuration(dur)),deal,t("nextQ"),proof);
  }
  deal();
}

export default {
  games:[
    {id:"clock",    name:"gClock",    blurb:"gClockP",    render:renderClockBench},
    {id:"calendar", name:"gCal",      blurb:"gCalP",       render:renderCalendarBench},
    {id:"read",     name:"gRead",     blurb:"gReadP",      render:renderReadClock,  full:true},
    {id:"convert",  name:"gConvert",  blurb:"gConvertP",   render:renderConvert,    full:true},
    {id:"elapsed",  name:"gElapsed",  blurb:"gElapsedP",   render:renderElapsed,    full:true}
  ]
};
