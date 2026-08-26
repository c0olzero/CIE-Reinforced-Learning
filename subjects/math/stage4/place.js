/* Workbench — Place Value Lab — build, shift, round, compare, and explore below zero
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Np.01, 4Np.02, 4Np.03, 4Np.05, 4Ni.07, 4Ni.08 */

import {h, rand} from "../../../engine/dom.js";
import {t, getLang, addStrings} from "../../../engine/i18n.js";
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
   4Ni.07/.08 multiply and divide whole numbers by 10 and 100
   ============================================================ */
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,",");
const digits4=n=>String(n).padStart(4,"0").split("").map(Number);   // [th,h,t,o]

/* ---------- tab 1 — Number Bench (4Np.01, .02, 4Ni.07, .08) ---------- */
/* 4 core digit sliders sit over 4 consecutive place-value columns. ×10/÷10
   don't touch those digits — they relabel which columns the same 4 sit in,
   which IS actually multiplying/dividing the number by 10 (every digit's
   value scales by 10x): 2904 becomes 29040 read at the same 4 sliders, just
   shifted one column. Each ×10 also reveals one genuine extra digit at the
   ones end (any number x10 truly ends in a 0) as a normal, fully draggable
   slider of its own — not tied to the core 4, and reset to 0 the next time
   a fresh x10 reveals it. Capped at the hundred-thousands column going up
   and the hundredths column going down. */
const PVB_MIN_SHIFT=-2, PVB_MAX_SHIFT=2;
const PVB_LABEL_KEYS=["pvbHundredths","pvbTenths","pvbO","pvbT","pvbH","pvbTh","pvbTTh","pvbHTh"];   // index = exp+2
function pvbTermStr(digit,exp){
  if(digit===0) return null;
  if(exp>=0) return String(digit*Math.pow(10,exp));
  return "0."+"0".repeat(-exp-1)+digit;   // exp=-1 -> "0.d"; exp=-2 -> "0.0d"
}

/* Number-to-words. EN and VI aren't just vocabulary swaps of one template —
   Vietnamese has its own grammar (linh/mốt/lăm, explicit "không trăm" for a
   non-leading zero-hundreds group) that doesn't map onto the English
   algorithm, so each language gets its own self-contained function rather
   than one shared template with substituted words. */
const PVB_EN_ONES=["zero","one","two","three","four","five","six","seven","eight","nine","ten",
  "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const PVB_EN_TENS=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function pvbUnder100En(n){
  if(n<20) return PVB_EN_ONES[n];
  const t=Math.floor(n/10), o=n%10;
  return PVB_EN_TENS[t]+(o?"-"+PVB_EN_ONES[o]:"");
}
function pvbUnder1000En(n){
  const h=Math.floor(n/100), rest=n%100;
  if(h===0) return pvbUnder100En(rest);
  return PVB_EN_ONES[h]+" hundred"+(rest?" and "+pvbUnder100En(rest):"");
}
function pvbWordsEn(n){
  if(n===0) return "zero";
  const th=Math.floor(n/1000), rest=n%1000;
  if(th===0) return pvbUnder1000En(rest);
  const out=pvbUnder1000En(th)+" thousand";
  if(rest===0) return out;
  if(rest<100) return out+" and "+pvbUnder100En(rest);
  return out+" "+pvbUnder1000En(rest);
}

const PVB_VI_ONES=["không","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];
function pvbUnder100Vi(n){
  if(n<10) return PVB_VI_ONES[n];
  if(n===10) return "mười";
  const t=Math.floor(n/10), o=n%10;
  const tensWord=t===1?"mười":PVB_VI_ONES[t]+" mươi";
  if(o===0) return tensWord;
  const oneWord=(o===1&&t>=2)?"mốt":(o===5?"lăm":PVB_VI_ONES[o]);
  return tensWord+" "+oneWord;
}
/* `forceHundred` says a group is NOT the leading one — Vietnamese spells
   out "không trăm" for a zero-hundreds group once you're past the
   thousands boundary (1,040 -> "một nghìn không trăm bốn mươi"), unlike a
   standalone number under 1000, which never does. */
function pvbUnder1000Vi(n,forceHundred){
  const h=Math.floor(n/100), rest=n%100;
  if(h===0){
    if(!forceHundred) return pvbUnder100Vi(rest);
    return rest<10 ? "không trăm linh "+PVB_VI_ONES[rest] : "không trăm "+pvbUnder100Vi(rest);
  }
  const out=PVB_VI_ONES[h]+" trăm";
  if(rest===0) return out;
  return rest<10 ? out+" linh "+PVB_VI_ONES[rest] : out+" "+pvbUnder100Vi(rest);
}
function pvbWordsVi(n){
  if(n===0) return "không";
  const th=Math.floor(n/1000), rest=n%1000;
  if(th===0) return pvbUnder1000Vi(rest,false);
  const out=pvbUnder1000Vi(th,false)+" nghìn";
  return rest===0 ? out : out+" "+pvbUnder1000Vi(rest,true);
}
function pvbCap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function pvbWords(intPart,decDigits){
  const vi=getLang()==="vi";
  let s=vi?pvbWordsVi(intPart):pvbWordsEn(intPart);
  if(decDigits.length){
    const ones=vi?PVB_VI_ONES:PVB_EN_ONES;
    s+=" "+(vi?"phẩy":"point")+" "+decDigits.map(d=>ones[d]).join(" ");
  }
  return pvbCap(s);
}
function renderBench(side,stage){
  const start=rand([2904,3003]);
  const d=digits4(start);   // the 4 core digits, at whatever columns `shift` currently puts them in
  let shift=0;
  const extras=[];          // extras[i]: the (i+1)-th genuine digit x10 reveals, closest-to-ones first
  const wrap=h("div","pv-wrap bench"), stack=h("div","pv-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  stack.appendChild(h("div","pv-note",t("pvBenchHelp")));
  const cols=h("div","pvb-cols");
  const expand=h("div","pv-eq");
  const words=h("div","pvb-words");
  const btnRow=h("div","pvb-btnrow");
  stack.append(cols,expand,words,btnRow);

  const divBtn=h("button","pvb-shiftbtn",t("pvbDiv10"));
  const mulBtn=h("button","pvb-shiftbtn",t("pvbMul10"));
  divBtn.onclick=()=>{ if(shift>PVB_MIN_SHIFT){ shift--; draw(); } };
  mulBtn.onclick=()=>{ if(shift<PVB_MAX_SHIFT){ shift++; extras[shift-1]=0; draw(); } };
  btnRow.append(divBtn,mulBtn);

  function currentColumns(){
    const topExp=3+shift;
    const out=[0,1,2,3].map(i=>({exp:topExp-i,val:d[i]}));
    for(let i=0;i<shift;i++) out.push({exp:shift-1-i,val:extras[i]});
    return out.sort((a,b)=>b.exp-a.exp);
  }
  function expandText(){
    const terms=[];
    currentColumns().forEach(c=>{ const term=pvbTermStr(c.val,c.exp); if(term) terms.push(term); });
    return t("expandLbl").toUpperCase()+"   "+(terms.length?terms.join(" + "):"0");
  }
  function wordsText(){
    let intPart=0; const decDigits=[];
    currentColumns().forEach(c=>{
      if(c.exp>=0) intPart+=c.val*Math.pow(10,c.exp);
      else decDigits.push(c.val);
    });
    return t("wordsLbl").toUpperCase()+"   "+pvbWords(intPart,decDigits);
  }

  function makeCol(exp,val,onInput){
    const col=h("div","pvb-col");
    const digitEl=h("div","pv-big pvb-digit",String(val));
    const vwrap=h("div","pvb-vwrap");
    const inp=document.createElement("input");
    inp.type="range"; inp.min=0; inp.max=9; inp.step=1; inp.value=val;
    inp.className="pvb-vslider";
    inp.setAttribute("aria-label",t(PVB_LABEL_KEYS[exp+2]));
    inp.oninput=()=>{ onInput(+inp.value); digitEl.textContent=inp.value; expand.textContent=expandText(); words.textContent=wordsText(); };
    vwrap.appendChild(inp);
    col.append(vwrap,digitEl,h("div","pvb-bracket"),h("div","pv-clab pvb-lab",t(PVB_LABEL_KEYS[exp+2])));
    return col;
  }

  function draw(){
    cols.innerHTML="";
    const topExp=3+shift;
    const exps=[0,1,2,3].map(i=>topExp-i);

    exps.forEach((exp,ci)=>{
      cols.appendChild(makeCol(exp,d[ci],v=>{ d[ci]=v; }));
      // the "." lines up with the digit row by reusing the same vwrap/bracket/
      // label rhythm as a real column, just with those rows made invisible —
      // any other way of centring it drifts once font metrics change
      if(exp===0 && (ci<exps.length-1 || shift>0)){
        const dotCol=h("div","pvb-col pvb-dotcol");
        const dotBracket=h("div","pvb-bracket"); dotBracket.style.visibility="hidden";
        const dotLabel=h("div","pv-clab pvb-lab"," "); dotLabel.style.visibility="hidden";
        dotCol.append(h("div","pvb-vwrap"), h("div","pv-big pvb-digit pvb-dot","."), dotBracket, dotLabel);
        cols.appendChild(dotCol);
      }
    });
    for(let i=0;i<shift;i++){
      const exp=shift-1-i;
      cols.appendChild(makeCol(exp,extras[i],v=>{ extras[i]=v; }));
    }

    divBtn.disabled=shift<=PVB_MIN_SHIFT;
    mulBtn.disabled=shift>=PVB_MAX_SHIFT;
    expand.textContent=expandText();
    words.textContent=wordsText();
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
  let n=0,unit=10,ans=0,answered=false,lastKey=null;

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    let key;
    do{
      unit=rand([10,100]);
      n = unit===10 ? 100+Math.floor(Math.random()*899)
                    : 100+Math.floor(Math.random()*9800);
      if(n%unit===0) n+=(Math.random()<0.5?-1:1)*(1+Math.floor(Math.random()*(unit/2-1||1)));
      key=unit+","+n;
    }while(key===lastKey);
    lastKey=key;
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
  let A=0,B=0,three=[],ans=null,answered=false,lastKey=null;

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    area.innerHTML="";
    // pick the round's values first (no DOM yet) so a repeat can be
    // rerolled cleanly instead of leaving half-built UI behind
    let kind,wantBig,key;
    for(let tries=0;tries<20;tries++){
      kind=Math.random()<0.55?"sym":"pick";
      if(kind==="sym"){
        [A,B]=pvPickPair();
        key="sym,"+A+","+B;
      }else{
        const nums=new Set();
        while(nums.size<3) nums.add(Math.floor(Math.random()*10000));
        three=[...nums];
        wantBig=Math.random()<0.5;
        key="pick,"+wantBig+","+three.slice().sort((x,y)=>x-y).join(",");
      }
      if(key!==lastKey) break;
    }
    lastKey=key;
    if(kind==="sym"){
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
    {id:"bench", name:"gPvBench", blurb:"gPvBenchP", render:renderBench, full:true},
    {id:"round", name:"gRound", blurb:"gRoundP", render:renderRound, full:true},
    {id:"zero",  name:"gZero",  blurb:"gZeroP",  render:renderZero},
    {id:"order", name:"gOrder", blurb:"gOrderP", render:renderOrder, full:true}
  ]
};
