/* Workbench — Times Table Lab — recall, missing factors, x10/x100
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Ni.04, 4Ni.07, 4Ni.08 */

import {h, rand, pickOptions} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions, foldlessHud} from "../../../engine/ui.js";
import {sfxGold, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./times.strings.js";
addStrings(STRINGS);

/* ============================================================
   TIMES TABLE LAB — Cambridge Primary Stage 4

   4Ni.04 recall multiplication/division facts to 12x12
   4Ni.07, 4Ni.08 multiply and divide by 10 and 100
   ============================================================ */
const TM_MAX=12;

/* a rows x b cols array of unit cells, fixed max box so it never overflows */
function tmArray(a,b){
  const maxW=260,maxH=200;
  const cell=Math.max(12,Math.min(38,Math.floor(Math.min(maxW/b,maxH/a))));
  const gap=Math.max(1,Math.min(4,Math.round(cell/10)));
  const el=h("div","tm-grid");
  el.style.gridTemplateColumns="repeat("+b+","+cell+"px)";
  el.style.gridTemplateRows="repeat("+a+","+cell+"px)";
  el.style.gap=gap+"px";
  for(let i=0;i<a*b;i++) el.appendChild(h("div","tm-cell"));
  return el;
}
const numNode=v=>h("div","tm-num",String(v));
const opNode=s=>h("div","tm-op",s);
const symNode=()=>h("div","tm-num tm-sym","?");

/* ---------- tab 1 — Times Bench (4Ni.04) ---------- */
function renderBench(side,stage){
  let a=3,b=4;
  const wrap=h("div","tm-wrap bench"), stack=h("div","tm-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const gridBox=h("div","tm-gridbox");
  const eq=h("div","tm-eq");
  const chips=h("div","tm-chips");
  const facts=h("div","tm-facts");
  stack.append(gridBox,eq,chips,facts);

  function lever(label,val){
    const p=h("div","panel");
    p.append(h("h4",null,label.toUpperCase()));
    const lw=h("div","lever-wrap");
    lw.appendChild(h("div","ticks"));
    const inp=document.createElement("input");
    inp.type="range"; inp.min=1; inp.max=TM_MAX; inp.value=val; inp.className="lever";
    inp.setAttribute("aria-label",label);
    lw.appendChild(inp);
    const ll=h("div","leverlab"); ll.append(h("span",null,"1"),h("span",null,String(TM_MAX)));
    lw.appendChild(ll); p.appendChild(lw);
    return {panel:p,input:inp};
  }
  const r1=lever(t("rows"),a), r2=lever(t("cols"),b);
  r2.panel.appendChild(h("p","note",t("benchHelp")));
  side.append(r1.panel,r2.panel);

  r1.input.oninput=()=>{ a=+r1.input.value; draw(); };
  r2.input.oninput=()=>{ b=+r2.input.value; draw(); };

  function draw(){
    gridBox.innerHTML=""; gridBox.appendChild(tmArray(a,b));
    const c=a*b;
    eq.textContent=a+" × "+b+" = "+c;
    chips.innerHTML="";
    for(let i=1;i<=a;i++) chips.appendChild(h("span","tm-chip"+(i===a?" on":""),String(i*b)));
    facts.innerHTML="";
    facts.append(h("div",null,c+" ÷ "+a+" = "+b), h("div",null,c+" ÷ "+b+" = "+a));
  }
  draw();
}

/* ---------- tab 2 — Missing Factor (4Ni.04) ---------- */
/* Plausible distractors for the a x b = ? case: off by one factor, or the
   adjacent product either side — never an unrelated random number. */
function factProductOptions(a,b,c){
  const cand=new Set([c-a,c+a,c-b,c+b,(a+1)*b,Math.max(1,a-1)*b,a*(b+1),a*Math.max(1,b-1)]);
  cand.delete(c);
  const arr=[...cand].filter(v=>v>0);
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));
    const tmp=arr[i]; arr[i]=arr[j]; arr[j]=tmp; }
  return [c,...arr.slice(0,3)].sort((x,y)=>x-y);
}
function renderMissingFactor(side,stage){
  foldlessHud(stage);
  hudQuestion(stage,t("qFact"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","tm-wrap"), stack=h("div","tm-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const line=h("div","tm-row"); stack.appendChild(line);
  let a=3,b=4,c=12,ans=4,answered=false;

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    a=1+Math.floor(Math.random()*TM_MAX);
    b=1+Math.floor(Math.random()*TM_MAX);
    c=a*b;
    const kind=rand(["ab","ax","xb","da","db"]);
    line.innerHTML="";
    let opts;
    if(kind==="ab"){
      ans=c;
      line.append(numNode(a),opNode("×"),numNode(b),opNode("="),symNode());
      opts=factProductOptions(a,b,c);
    }else if(kind==="ax"){
      ans=b;
      line.append(numNode(a),opNode("×"),symNode(),opNode("="),numNode(c));
      opts=pickOptions(ans,1,TM_MAX,4,2);
    }else if(kind==="xb"){
      ans=a;
      line.append(symNode(),opNode("×"),numNode(b),opNode("="),numNode(c));
      opts=pickOptions(ans,1,TM_MAX,4,2);
    }else if(kind==="da"){
      ans=b;
      line.append(numNode(c),opNode("÷"),numNode(a),opNode("="),symNode());
      opts=pickOptions(ans,1,TM_MAX,4,2);
    }else{
      ans=a;
      line.append(numNode(c),opNode("÷"),numNode(b),opNode("="),symNode());
      opts=pickOptions(ans,1,TM_MAX,4,2);
    }
    opts.forEach(v=>{
      const btn=h("button","abtn",String(v));
      btn.onclick=()=>answer(v);
      act.appendChild(btn);
    });
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=said===ans;
    act.hidden=true;
    const symEl=line.querySelector(".tm-sym");
    if(symEl){ symEl.textContent=String(ans); symEl.style.color=ok?"var(--c2)":"var(--red)"; }
    score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    const proof=h("div","tm-stack");
    proof.style.margin="0 auto";
    proof.append(tmArray(a,b), h("div","tm-eq",a+" × "+b+" = "+c));
    celebrate(stage,ok,t("factWhy")(a,b,c),deal,t("nextQ"),proof);
  }
  deal();
}

/* ---------- tab 3 — Shift by 10/100 (4Ni.07, 4Ni.08) ---------- */
/* Digit strip: multiplying appends zeros (marked new); dividing drops them
   (marked as leaving) — the same picture either direction. */
function tmDigits(numStr,dropCount){
  const el=h("div","tm-digits");
  [...numStr].forEach(ch=>el.appendChild(h("span","tm-digit",ch)));
  for(let i=0;i<dropCount;i++) el.appendChild(h("span","tm-digit tm-digit-drop","0"));
  return el;
}
function tmShiftProof(n,op,factor,ans){
  const wrap=h("div","tm-shift");
  const zeros=factor===10?1:2;
  const arrow=h("div","tm-arrow",(op==="mul"?"×":"÷")+factor);
  let fromNode,toNode;
  if(op==="mul"){
    fromNode=tmDigits(String(n),0);
    toNode=h("div","tm-digits");
    [...String(ans)].forEach((ch,i,arr)=>{
      const isNew=i>=arr.length-zeros;
      toNode.appendChild(h("span","tm-digit"+(isNew?" tm-digit-new":""),ch));
    });
  }else{
    const nStr=String(n);
    fromNode=tmDigits(nStr.slice(0,nStr.length-zeros),zeros);
    toNode=tmDigits(String(ans),0);
  }
  wrap.append(fromNode,arrow,toNode);
  return wrap;
}
function mulShiftOptions(n,factor,ans){
  const otherFactor=factor===10?100:10;
  const wrongPow=n*otherFactor;
  const pool=pickOptions(ans,Math.max(1,ans-factor*4),ans+factor*4,4,factor)
    .filter(v=>v!==wrongPow&&v!==ans);
  const set=new Set([ans,wrongPow]);
  for(const v of pool){ if(set.size>=4) break; set.add(v); }
  return [...set].sort((x,y)=>x-y);
}
function renderShift(side,stage){
  foldlessHud(stage);
  hudQuestion(stage,t("qShift"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","tm-wrap"), stack=h("div","tm-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const line=h("div","tm-row"); stack.appendChild(line);
  let n=3,factor=10,op="mul",ans=30,answered=false;

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    const kind=rand(["x10","x100","d10","d100"]);
    if(kind==="x10"){       op="mul"; factor=10;  n=2+Math.floor(Math.random()*98); ans=n*10; }
    else if(kind==="x100"){ op="mul"; factor=100; n=2+Math.floor(Math.random()*9);  ans=n*100; }
    else if(kind==="d10"){  op="div"; factor=10;  const k=2+Math.floor(Math.random()*98); n=k*10;  ans=k; }
    else{                   op="div"; factor=100; const k=2+Math.floor(Math.random()*9);  n=k*100; ans=k; }
    line.innerHTML="";
    line.append(numNode(n),opNode(op==="mul"?"×":"÷"),numNode(factor),opNode("="),symNode());
    const opts = op==="mul" ? mulShiftOptions(n,factor,ans)
                             : pickOptions(ans,1,Math.max(20,ans+3*factor),4,3);
    opts.forEach(v=>{
      const btn=h("button","abtn",String(v));
      btn.onclick=()=>answer(v);
      act.appendChild(btn);
    });
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=said===ans;
    act.hidden=true;
    const symEl=line.querySelector(".tm-sym");
    if(symEl){ symEl.textContent=String(ans); symEl.style.color=ok?"var(--c2)":"var(--red)"; }
    score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    const proof=tmShiftProof(n,op,factor,ans);
    const why=op==="mul" ? t("shiftWhyMul")(n,factor,ans) : t("shiftWhyDiv")(n,factor,ans);
    celebrate(stage,ok,why,deal,t("nextQ"),proof);
  }
  deal();
}

export default {
  games:[
    {id:"bench", name:"gBench", blurb:"gBenchP", render:renderBench},
    {id:"fact",  name:"gFact",  blurb:"gFactP",  render:renderMissingFactor, full:true},
    {id:"shift", name:"gShift", blurb:"gShiftP", render:renderShift,         full:true}
  ]
};
