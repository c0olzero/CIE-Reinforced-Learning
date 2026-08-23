/* Workbench — Place Value Lab — build, round, compare, and explore below zero
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Np.01, 4Np.02, 4Np.03, 4Np.05 */

import {h, rand} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions, foldlessHud} from "../../../engine/ui.js";
import {sfxGold, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./place.strings.js";
addStrings(STRINGS);

/* ============================================================
   PLACE VALUE LAB — Cambridge Primary Stage 4

   4Np.01 read, write, compose and order numbers to 10,000
   4Np.02 partition into standard and expanded form
   4Np.03 round 3- and 4-digit numbers to the nearest 10 or 100
   4Np.05 order integers below zero (temperature contexts)
   ============================================================ */
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,",");
const digits4=n=>String(n).padStart(4,"0").split("").map(Number);   // [th,h,t,o]

/* ---------- tab 1 — Place Bench (4Np.01, .02) ---------- */
/* Base-ten blocks: a unit, a rod of ten, a flat of a hundred, a solid
   thousand — each column draws that many of its own shape, so nine
   hundreds genuinely looks bulkier than nine tens. */
const PV_COLS=["th","h","t","o"];
function pvBlocks(sz,count){
  const el=h("div","pv-blockrow");
  for(let i=0;i<count;i++) el.appendChild(h("div","pv-b pv-b-"+sz));
  return el;
}
function renderBench(side,stage){
  let d=[3,2,8,5];   // th,h,t,o
  const wrap=h("div","pv-wrap bench"), stack=h("div","pv-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const big=h("div","pv-big");
  const blockBox=h("div","pv-blocks");
  const expand=h("div","pv-eq");
  const alt=h("div","pv-eq alt");
  stack.append(big,blockBox,expand,alt);

  const panel=h("div","panel");
  panel.append(h("h4",null,t("gPvBench").toUpperCase()));
  const row=h("div","pv-ctrls");
  const labels=[t("thLabel"),t("hLabel"),t("tLabel"),t("oLabel")];
  const digitEls=[];
  labels.forEach((lab,i)=>{
    const c=h("div","pv-ctrl");
    const inc=h("button","btn alt pv-step","+");
    const val=h("div","pv-digit",String(d[i]));
    const dec=h("button","btn alt pv-step","−");
    const l=h("div","pv-clab",lab);
    inc.onclick=()=>{ d[i]=Math.min(9,d[i]+1); draw(); };
    dec.onclick=()=>{ d[i]=Math.max(0,d[i]-1); draw(); };
    c.append(inc,val,dec,l);
    row.appendChild(c);
    digitEls.push(val);
  });
  panel.appendChild(row);
  panel.appendChild(h("p","note",t("pvBenchHelp")));
  side.appendChild(panel);

  function draw(){
    digitEls.forEach((el,i)=>el.textContent=String(d[i]));
    const n=d[0]*1000+d[1]*100+d[2]*10+d[3];
    big.textContent=fmt(n);
    blockBox.innerHTML="";
    PV_COLS.forEach((sz,i)=>{ if(d[i]>0) blockBox.appendChild(pvBlocks(sz,d[i])); });
    const terms=[];
    if(d[0]) terms.push(d[0]*1000);
    if(d[1]) terms.push(d[1]*100);
    if(d[2]) terms.push(d[2]*10);
    if(d[3]) terms.push(d[3]);
    expand.textContent=t("expandLbl").toUpperCase()+"   "+(terms.length?terms.join(" + "):"0");
    const hundreds=Math.floor(n/100), ones=n%100;
    alt.textContent=t("altLbl").toUpperCase()+"   "+hundreds+" "+t("hundredsWord")+" + "+ones+" "+t("onesWord");
  }
  draw();
}

/* ---------- tab 2 — Round It (4Np.03) ---------- */
function pvLine(n,unit){
  const lo=Math.floor(n/unit)*unit, hi=lo+unit;
  const frac=hi===lo?0:(n-lo)/(hi-lo);
  const el=h("div","pv-line");
  const track=h("div","pv-line-track");
  const dot=h("div","pv-line-dot"); dot.style.left=(frac*100)+"%";
  const nlab=h("div","pv-line-n",fmt(n)); nlab.style.left=(frac*100)+"%";
  track.append(dot,nlab);
  const loLab=h("div","pv-line-lo",fmt(lo));
  const hiLab=h("div","pv-line-hi",fmt(hi));
  el.append(loLab,track,hiLab);
  return {el,lo,hi};
}
function renderRound(side,stage){
  foldlessHud(stage);
  const q=hudQuestion(stage,"");
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","pv-wrap"), stack=h("div","pv-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const big=h("div","pv-big"); stack.appendChild(big);
  let n=0,unit=10,ans=0,answered=false;

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    unit=rand([10,100]);
    n = unit===10 ? 100+Math.floor(Math.random()*899)
                  : 100+Math.floor(Math.random()*9800);
    if(n%unit===0) n+=(Math.random()<0.5?-1:1)*(1+Math.floor(Math.random()*(unit/2-1||1)));
    ans=Math.round(n/unit)*unit;
    q.textContent=t("qRound")(fmt(n),unit);
    big.textContent=fmt(n);
    const otherUnit=unit===10?100:10;
    const wrongUnit=Math.round(n/otherUnit)*otherUnit;
    const lo=Math.floor(n/unit)*unit, hi=lo+unit;
    const wrongDir = ans===lo ? hi : lo;
    const pool=new Set([wrongUnit,wrongDir,ans+unit,Math.max(0,ans-unit)]);
    pool.delete(ans);
    const arr=[...pool].filter(v=>v>=0);
    for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const tmp=arr[i]; arr[i]=arr[j]; arr[j]=tmp; }
    const opts=[ans,...arr.slice(0,3)].sort((a,b)=>a-b);
    opts.forEach(v=>{
      const btn=h("button","abtn",fmt(v));
      btn.onclick=()=>answer(v);
      act.appendChild(btn);
    });
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=said===ans;
    act.hidden=true;
    score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    const {el,lo,hi}=pvLine(n,unit);
    el.querySelector(ans===lo?".pv-line-lo":".pv-line-hi").classList.add("on");
    celebrate(stage,ok,t("roundWhy")(fmt(n),fmt(lo),fmt(hi),fmt(ans)),deal,t("nextQ"),el);
  }
  deal();
}

/* ---------- tab 3 — Below Zero (4Np.05) ---------- */
/* Two independent thermometers with a live comparison symbol between them —
   free play, no scoring. The tube is a plain fill bar so it stays pixel-exact
   regardless of which browser draws the native slider beside it. */
const PV_TMIN=-20, PV_TMAX=40, PV_TUBE_H=170;
function pvTube(val){
  const frac=Math.max(0,Math.min(1,(val-PV_TMIN)/(PV_TMAX-PV_TMIN)));
  const zeroFrac=(0-PV_TMIN)/(PV_TMAX-PV_TMIN);
  const tube=h("div","pv-tube");
  tube.style.height=PV_TUBE_H+"px";
  const fill=h("div","pv-fill");
  fill.style.height=(frac*PV_TUBE_H)+"px";
  fill.style.background=val<0?"var(--c3)":val>0?"var(--c1)":"var(--chalk-dim)";
  const zero=h("div","pv-zero"); zero.style.bottom=(zeroFrac*PV_TUBE_H)+"px";
  tube.append(fill,zero);
  return tube;
}
function renderZero(side,stage){
  const wrap=h("div","pv-wrap bench"), stack=h("div","pv-stack"), row=h("div","pv-zrow");
  stack.appendChild(row); wrap.appendChild(stack); stage.appendChild(wrap);

  function unit(val){
    const col=h("div","pv-zcol");
    const readout=h("div","pv-big small");
    const tubeWrap=h("div");
    const lw=h("div","lever-wrap");
    lw.appendChild(h("div","ticks"));
    const lev=document.createElement("input");
    lev.type="range"; lev.min=PV_TMIN; lev.max=PV_TMAX; lev.value=val; lev.className="lever";
    lw.appendChild(lev);
    const ll=h("div","leverlab"); ll.append(h("span",null,PV_TMIN+"°"),h("span",null,PV_TMAX+"°"));
    lw.appendChild(ll);
    col.append(readout,tubeWrap,lw);
    return {col,readout,tubeWrap,lev};
  }
  const a=unit(4), b=unit(-6);
  const sym=h("div","pv-sym","?");
  row.append(a.col,sym,b.col);
  stack.appendChild(h("div","pv-note",t("freezing")));

  const panel=h("div","panel");
  panel.append(h("h4",null,t("gZero").toUpperCase()),h("p","note",t("zeroHelp")));
  side.appendChild(panel);

  function draw(){
    const A=+a.lev.value, B=+b.lev.value;
    a.readout.textContent=A+"°C"; b.readout.textContent=B+"°C";
    a.tubeWrap.innerHTML=""; a.tubeWrap.appendChild(pvTube(A));
    b.tubeWrap.innerHTML=""; b.tubeWrap.appendChild(pvTube(B));
    sym.textContent=A<B?"<":A>B?">":"=";
  }
  a.lev.oninput=draw; b.lev.oninput=draw;
  draw();
}

/* ---------- tab 4 — Compare & Order (4Np.01) ---------- */
const PLACE_NAMES=["placeTh","placeH","placeT","placeO"];
function pvTiles(n,hiIdx){
  const el=h("div","pv-tiles");
  digits4(n).forEach((d,i)=>el.appendChild(h("div","pv-tile"+(i===hiIdx?" hi":""),String(d))));
  return el;
}
function firstDiff(a,b){
  const da=digits4(a), db=digits4(b);
  for(let i=0;i<4;i++) if(da[i]!==db[i]) return i;
  return -1;
}
/* weighted so "=" and close-together pairs (which force a real digit-by-digit
   check) show up as often as two wildly different numbers would */
function pvPickPair(){
  const r=Math.random();
  let A,B;
  if(r<0.15){ A=Math.floor(Math.random()*10000); B=A; }
  else if(r<0.55){
    A=Math.floor(Math.random()*10000); B=Math.floor(Math.random()*10000);
    if(A===B) B=(B+37)%10000;
  }else{
    A=Math.floor(Math.random()*10000);
    const d=1+Math.floor(Math.random()*9);
    B=Math.random()<0.5?Math.min(9999,A+d):Math.max(0,A-d);
    if(A===B) B=A<9999?A+1:A-1;
  }
  return [A,B];
}
function renderOrder(side,stage){
  foldlessHud(stage);
  const q=hudQuestion(stage,"");
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","pv-wrap"), stack=h("div","pv-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const area=h("div","pv-order-area"); stack.appendChild(area);
  let A=0,B=0,three=[],ans=null,answered=false;

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    area.innerHTML="";
    const kind=Math.random()<0.55?"sym":"pick";
    if(kind==="sym"){
      [A,B]=pvPickPair();
      q.textContent=t("qWhich");
      const rowEl=h("div","pv-row");
      rowEl.append(h("div","pv-big mid",fmt(A)),h("div","pv-sym","?"),h("div","pv-big mid",fmt(B)));
      area.appendChild(rowEl);
      ["<","=",">"].forEach(k=>{
        const btn=h("button","abtn",k); btn.style.fontSize="22px";
        btn.onclick=()=>answerSym(k);
        act.appendChild(btn);
      });
    }else{
      const nums=new Set();
      while(nums.size<3) nums.add(Math.floor(Math.random()*10000));
      three=[...nums];
      const wantBig=Math.random()<0.5;
      q.textContent=wantBig?t("qBiggest"):t("qSmallest");
      ans=wantBig?Math.max(...three):Math.min(...three);
      // this kind has no "sym" row to fill the stage with — show the three
      // numbers here too, or the stage is just empty above the buttons
      const rowEl=h("div","pv-row");
      three.forEach(v=>rowEl.appendChild(h("div","pv-big mid",fmt(v))));
      area.appendChild(rowEl);
      three.forEach(v=>{
        const btn=h("button","abtn",fmt(v));
        btn.onclick=()=>answerPick(v);
        act.appendChild(btn);
      });
    }
  }
  function answerSym(said){
    if(answered) return; answered=true;
    const truth=A===B?"=":A<B?"<":">";
    const ok=said===truth;
    act.hidden=true;
    score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    const diffIdx=firstDiff(A,B);
    const proof=h("div","pv-stack");
    proof.style.margin="0 auto";
    proof.append(pvTiles(A,diffIdx),pvTiles(B,diffIdx));
    const place=diffIdx<0?null:t(PLACE_NAMES[diffIdx]);
    celebrate(stage,ok,t("cmpWhy")(fmt(A),fmt(B),truth,place),deal,t("nextQ"),proof);
  }
  function answerPick(said){
    if(answered) return; answered=true;
    const ok=said===ans;
    act.hidden=true;
    score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    const sorted=[...three].sort((x,y)=>x-y).map(fmt);
    celebrate(stage,ok,t("orderWhy")(sorted),deal,t("nextQ"));
  }
  deal();
}

export default {
  games:[
    {id:"bench", name:"gPvBench", blurb:"gPvBenchP", render:renderBench},
    {id:"round", name:"gRound", blurb:"gRoundP", render:renderRound, full:true},
    {id:"zero",  name:"gZero",  blurb:"gZeroP",  render:renderZero},
    {id:"order", name:"gOrder", blurb:"gOrderP", render:renderOrder, full:true}
  ]
};
