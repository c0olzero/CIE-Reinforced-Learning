/* Workbench — Statistics Lab — spin it, describe it
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Sp.01, 4Sp.02 */

import {h, rand, SVGNS, pending} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions, foldlessHud} from "../../../engine/ui.js";
import {sfxGold, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./chance.strings.js";
addStrings(STRINGS);

/* ============================================================
   STATISTICS LAB — Cambridge Primary Stage 4 (Probability)

   4Sp.01 use language associated with chance to describe familiar events
           (impossible, unlikely, even chance, likely, certain)
   4Sp.02 conduct chance experiments using small and large numbers of
           trials, and present and describe the results
   ============================================================ */

const PALETTE=["c0","c1","c2","c3","c4","c5"];

function svgEl(tag,attrs){
  const el=document.createElementNS(SVGNS,tag);
  if(attrs) for(const k in attrs) el.setAttribute(k,attrs[k]);
  return el;
}
function chRandInt(lo,hi){ return lo+Math.floor(Math.random()*(hi-lo+1)); }
function chShuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

/* An 8-wedge spinner (every wedge a fixed 45°, so the SVG arc maths never
   changes) split among 3-4 colours by picking distinct cut points in 1..7 —
   the gaps between consecutive cuts are always >=1, so every colour is
   guaranteed at least one wedge with no rejection sampling needed. */
function chMakeSpinner(){
  const n=chRandInt(3,4);
  const colors=chShuffle([...PALETTE]).slice(0,n);
  const cuts=chShuffle([1,2,3,4,5,6,7]).slice(0,n-1).sort((a,b)=>a-b);
  const bounds=[0,...cuts,8];
  const counts=bounds.slice(1).map((b,i)=>b-bounds[i]);
  const wedges=[];
  colors.forEach((c,i)=>{ for(let k=0;k<counts[i];k++) wedges.push(c); });
  return {colors,counts,wedges};
}
function chSpinnerSvg(wedges,size){
  const svg=svgEl("svg",{viewBox:"0 0 100 100",class:"ch-spinner-svg"});
  svg.style.width=size+"px"; svg.style.height=size+"px";
  const cx=50,cy=50,r=48;
  wedges.forEach((color,i)=>{
    const a0=(i*45-90)*Math.PI/180, a1=((i+1)*45-90)*Math.PI/180;
    const x0=(cx+r*Math.cos(a0)).toFixed(2), y0=(cy+r*Math.sin(a0)).toFixed(2);
    const x1=(cx+r*Math.cos(a1)).toFixed(2), y1=(cy+r*Math.sin(a1)).toFixed(2);
    svg.appendChild(svgEl("path",{
      d:"M "+cx+" "+cy+" L "+x0+" "+y0+" A "+r+" "+r+" 0 0 1 "+x1+" "+y1+" Z",
      fill:"var(--"+color+")", stroke:"var(--ink)", "stroke-width":"1"
    }));
  });
  return svg;
}

/* ---------- tab 1 — Spinner Bench (4Sp.02: small vs large trials) ---------- */
function renderSpin(side,stage){
  const wrap=h("div","ch-wrap bench"), stack=h("div","ch-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  stack.appendChild(h("div","pv-note",t("chSpinHelp")));

  const stageBox=h("div","ch-stagebox");
  const wheelWrap=h("div","ch-wheelwrap");
  const wheel=h("div","ch-wheel");
  const pointer=h("div","ch-pointer");
  wheelWrap.append(wheel,pointer);
  stageBox.appendChild(wheelWrap);

  const expectedRow=h("div","ch-expectedrow");
  const tallyBox=h("div","ch-tallybox");
  const btnRow=h("div","ch-btnrow");
  const newBtn=h("button","ch-btn",t("chNewSpinner"));
  const spinBtn=h("button","ch-btn",t("chSpinOnce"));
  const manyBtn=h("button","ch-btn",t("chSpinMany"));
  btnRow.append(newBtn,spinBtn,manyBtn);

  stack.append(stageBox,expectedRow,tallyBox,btnRow);

  let spinner,tally,totalSpins=0,currentRotation=0,spinning=false,animId=0;
  pending.push(()=>{ animId++; });
  const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;

  function renderExpected(){
    expectedRow.innerHTML="";
    spinner.colors.forEach((c,i)=>{
      const chip=h("div","ch-chip");
      const sw=h("span","ch-swatch"); sw.style.background="var(--"+c+")";
      chip.append(sw,spinner.counts[i]+"/8");
      expectedRow.appendChild(chip);
    });
  }
  function updateTally(){
    tallyBox.innerHTML="";
    tallyBox.appendChild(h("div","ch-tallytitle",t("chResultsLbl")+" — "+t("chSpinsCount")(totalSpins)));
    const bars=h("div","ch-tallybars");
    spinner.colors.forEach((c,i)=>{
      const col=h("div","ch-tallycol");
      const plot=h("div","ch-tallyplot");
      const expectedFrac=spinner.counts[i]/8;
      const actualCount=tally[c]||0;
      const actualFrac=totalSpins?actualCount/totalSpins:0;
      const bar=h("div","ch-tallybar");
      bar.style.height=(actualFrac*100)+"%";
      bar.style.background="var(--"+c+")";
      const tick=h("div","ch-expectedtick");
      tick.style.bottom=(expectedFrac*100)+"%";
      plot.append(bar,tick);
      col.append(plot,h("div","ch-tallylbl",String(actualCount)));
      bars.appendChild(col);
    });
    tallyBox.appendChild(bars);
  }
  function newSpinner(){
    animId++;
    spinner=chMakeSpinner();
    tally={}; totalSpins=0; currentRotation=0; spinning=false;
    wheel.style.transition="none";
    wheel.style.transform="rotate(0deg)";
    void wheel.offsetWidth;   // force reflow so the instant reset above
                              // doesn't get animated by the transition below
    wheel.style.transition="";
    wheel.innerHTML=""; wheel.appendChild(chSpinnerSvg(spinner.wedges,220));
    renderExpected(); updateTally();
  }
  function spinTo(landIdx,onDone){
    const myId=animId;
    const targetMod=(((-(landIdx*45+22.5))%360)+360)%360;
    const curMod=((currentRotation%360)+360)%360;
    let delta=targetMod-curMod; if(delta<0) delta+=360;
    currentRotation+=delta+3*360;
    if(reduceMotion){
      wheel.style.transition="none";
      wheel.style.transform="rotate("+currentRotation+"deg)";
      onDone();
      return;
    }
    wheel.style.transform="rotate("+currentRotation+"deg)";
    setTimeout(()=>{ if(myId===animId) onDone(); },1100);
  }
  function doSpin(n){
    if(spinning) return;
    spinning=true;
    const indices=[];
    for(let i=0;i<n;i++) indices.push(Math.floor(Math.random()*8));
    spinTo(indices[indices.length-1],()=>{
      indices.forEach(idx=>{ const c=spinner.wedges[idx]; tally[c]=(tally[c]||0)+1; });
      totalSpins+=n;
      updateTally();
      spinning=false;
    });
  }

  newBtn.onclick=newSpinner;
  spinBtn.onclick=()=>doSpin(1);
  manyBtn.onclick=()=>doSpin(20);

  newSpinner();
}

/* ---------- tab 2 — Chance Words (4Sp.01) ---------- */
const WORDS=["impossible","unlikely","even","likely","certain"];
function chWordLabel(w){
  return w==="impossible"?t("chImpossible")
    :w==="unlikely"?t("chUnlikely")
    :w==="even"?t("chEven")
    :w==="likely"?t("chLikely")
    :t("chCertain");
}
/* maps a wedge count (out of 8) to an unambiguous word — 3 and 5 sit right
   on the boundary between two words and would make the "correct" answer
   arguable, so those counts are never asked about at all */
function chWordFor(count){
  if(count===0) return "impossible";
  if(count<=2) return "unlikely";
  if(count===4) return "even";
  if(count>=6 && count<8) return "likely";
  if(count===8) return "certain";
  return null;
}
/* builds a spinner where `targetColor` has EXACTLY `targetCount` of the 8
   wedges — the rest split randomly among 1-3 other colours. Used to pick
   the word first and construct a spinner to match, rather than building a
   spinner and hoping it lands on every word with reasonable odds: with the
   general 3-4 colour split, a random colour averages only 8/3..8/4 wedges,
   so "Likely"/"Certain" would come up far less often than "Unlikely", and
   "Certain" (a colour owning all 8) can never happen at all once every
   spinner is required to have 3-4 colours. */
function chMakeSpinnerFor(targetColor,targetCount){
  const remaining=8-targetCount;
  const colors=[targetColor], counts=[targetCount];
  if(remaining>0){
    const others=chShuffle(PALETTE.filter(c=>c!==targetColor));
    const nOthers=Math.min(others.length,remaining,chRandInt(1,3));
    const chosen=others.slice(0,nOthers);
    if(nOthers===1){
      colors.push(chosen[0]); counts.push(remaining);
    }else{
      const cutPool=Array.from({length:remaining-1},(_,i)=>i+1);
      const cuts=chShuffle(cutPool).slice(0,nOthers-1).sort((a,b)=>a-b);
      const bounds=[0,...cuts,remaining];
      chosen.forEach((c,i)=>{ colors.push(c); counts.push(bounds[i+1]-bounds[i]); });
    }
  }
  const wedges=[];
  colors.forEach((c,i)=>{ for(let k=0;k<counts[i];k++) wedges.push(c); });
  return {colors,counts,wedges};
}
function chGenQuestion(){
  const word=rand(WORDS);
  if(word==="impossible"){
    const spinner=chMakeSpinner();
    const targetColor=rand(PALETTE.filter(c=>!spinner.colors.includes(c)));
    return {spinner,targetColor,count:0,word};
  }
  const countFor={unlikely:rand([1,2]), even:4, likely:rand([6,7]), certain:8};
  const targetCount=countFor[word];
  const targetColor=rand(PALETTE);
  const spinner=chMakeSpinnerFor(targetColor,targetCount);
  return {spinner,targetColor,count:targetCount,word};
}
function renderWords(side,stage){
  foldlessHud(stage);
  const q=hudQuestion(stage,"");
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","ch-wrap"), stack=h("div","ch-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const spinnerSlot=h("div","ch-stagebox"); stack.appendChild(spinnerSlot);
  let cur,answered=false;

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    cur=chGenQuestion();
    q.textContent=t("chQLikely")(t("cName")[cur.targetColor]);
    spinnerSlot.innerHTML=""; spinnerSlot.appendChild(chSpinnerSvg(cur.spinner.wedges,220));
    WORDS.forEach(w=>{
      const btn=h("button","abtn",chWordLabel(w));
      btn.onclick=()=>answer(w);
      act.appendChild(btn);
    });
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=said===cur.word;
    act.hidden=true;
    score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    const proof=chSpinnerSvg(cur.spinner.wedges,180);
    spinnerSlot.innerHTML="";
    celebrate(stage,ok,t("chWhy")(cur.count,chWordLabel(cur.word)),deal,t("nextQ"),proof);
  }
  deal();
}

export default {
  games:[
    {id:"spin", name:"gChSpin", blurb:"gChSpinP", render:renderSpin, full:true},
    {id:"words", name:"gChWords", blurb:"gChWordsP", render:renderWords, full:true}
  ]
};
