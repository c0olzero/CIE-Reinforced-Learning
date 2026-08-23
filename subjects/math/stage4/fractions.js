/* Workbench — Fraction Lab — equivalence, comparison, operators, percentage
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Nf.01 to 4Nf.07 */

import {h, rand, SVGNS, pending, observeSize, scraps, pickOptions} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions, foldlessHud} from "../../../engine/ui.js";
import {arcadeShell} from "../../../engine/arcade.js";
import {sfxGold, sfxBlue, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./fractions.strings.js";
addStrings(STRINGS);

/* ============================================================
   14. FRACTION LAB  —  Cambridge Primary Stage 4

   4Nf.01 more parts -> smaller parts       4Nf.05 add/subtract, same denominator
   4Nf.02 fraction as division              4Nf.06 percentage as parts per hundred
   4Nf.03 unit fractions as operators       4Nf.07 compare and order with =, > and <
   4Nf.04 two proper fractions can be equal
   Proper fractions only — improper fractions and mixed numbers are Stage 5.
   ============================================================ */
const FR_DENOMS=[2,3,4,5,6,8,10,12];
const FR_MAXD=20;         // Compare it and Add & take away: denominator ceiling when showing numbers
const FR_MAXD_PIC=10;     // ...and when showing a pie or bar instead — past 10 slices/segments blur together
const randDenom=(lo,hi)=>lo+Math.floor(Math.random()*((hi||FR_MAXD)-lo+1));
const gcd=(a,b)=>b?gcd(b,a%b):a;
const frKey=(n,d)=>{const g=gcd(n,d);return (n/g)+"/"+(d/g);};
const frEq=(a,b,c,e)=>a*e===c*b;                 // a/b === c/e

/* stacked numerator over denominator */
function frNumeral(n,d,size){
  const el=h("div","fr-num "+(size||"mid"));
  el.append(h("b",null,String(n)),h("i"),h("b",null,String(d)));
  return el;
}
/* a strip cut into d equal parts with n shaded */
function frStrip(n,d,opts){
  opts=opts||{};
  const el=h("div","fr-strip"+(opts.small?" sm":"")+(opts.onCell?"":" locked"));
  for(let i=0;i<d;i++){
    const c=h("div","fr-cell"+(i<n?" on":"")+(opts.blue?" b":""));
    if(opts.onCell) c.onclick=()=>opts.onCell(i);
    el.appendChild(c);
  }
  return el;
}
/* the same strip standing up, filled from the bottom like a thermometer —
   cell 0 is the top, so the bottom n cells (d-1-i < n) are the ones lit */
function frStripV(n,d,opts){
  opts=opts||{};
  const el=h("div","fr-strip fr-strip-v locked"+(opts.small?" sm":""));   // never clickable, unlike frStrip
  if(opts.heightPx){                    // keep the same width:height ratio as the CSS default (78:220)
    el.style.height=opts.heightPx+"px";
    el.style.width=Math.round(opts.heightPx*0.354)+"px";
    el.style.maxWidth="none";
  }
  for(let i=0;i<d;i++)
    el.appendChild(h("div","fr-cell"+((d-1-i<n)?" on":"")+(opts.blue?" b":"")));
  return el;
}
/* the same fraction as a pie */
function frPie(n,d,size,blue){
  const svg=document.createElementNS(SVGNS,"svg");
  svg.setAttribute("width",size); svg.setAttribute("height",size);
  svg.setAttribute("viewBox","0 0 "+size+" "+size);
  svg.setAttribute("class","fr-pie");   // block, not inline — no baseline descender gap to throw off .fr-col's height
  const c=size/2, r=size/2-3;
  const P=a=>[c+r*Math.cos((a-90)*Math.PI/180), c+r*Math.sin((a-90)*Math.PI/180)];
  for(let i=0;i<d;i++){
    const a0=i*360/d, a1=(i+1)*360/d, A=P(a0), B=P(a1);
    const pa=document.createElementNS(SVGNS,"path");
    pa.setAttribute("d","M"+c+","+c+" L"+A[0].toFixed(2)+","+A[1].toFixed(2)+
      " A"+r+","+r+" 0 "+((a1-a0)>180?1:0)+" 1 "+B[0].toFixed(2)+","+B[1].toFixed(2)+" Z");
    pa.setAttribute("fill",i<n?(blue?"var(--c3)":"var(--c1)"):"rgba(247,242,231,.13)");
    pa.setAttribute("stroke","var(--mat)"); pa.setAttribute("stroke-width",2);
    svg.appendChild(pa);
  }
  return svg;
}
/* one fraction, drawn as whichever of the three pictures `viz` names —
   "num" (the stacked numeral), "barV" (a vertical strip) or "pie". Compare
   it and Add & take away both use this so a question shows numbers one
   round, bars the next, pies after that — same fraction, different picture. */
const FR_VIZ=["num","barV","pie"];
/* `blue` is Add & take away's own convention: the 2nd fraction turns blue
   when it's the part leaving (subtraction), same colour frWorkBar's proof
   already uses, and stays gold — every viz's default — when it's joining.

   `sizePx`, when given, overrides the fixed "big" preset with a size the
   caller measured from the actual stage — a bar fixed at one pixel height
   regardless of the screen left most of a tall tablet's stage empty above
   and below it; a size taken from stage.clientHeight fills that space on
   every viz instead of just the ones CSS clamp()s already scale by width. */
function frViz(n,d,viz,big,blue,sizePx){
  if(viz==="pie") return frPie(n,d,sizePx||(big?170:80),blue);
  if(viz==="barV") return frStripV(n,d,{small:!big,blue,heightPx:sizePx});
  const el=frNumeral(n,d,big?"big":"mid");
  if(blue) el.style.color="var(--c3)";
  if(sizePx) el.style.fontSize=Math.round(sizePx*0.34)+"px";
  return el;
}
/* 4Nf.06 — parts in each hundred */
function frGrid(n,d){
  const el=h("div","fr-grid"), lit=Math.round(n/d*100);
  for(let i=0;i<100;i++) el.appendChild(h("span",i<lit?"on":null));
  return el;
}
function frPct(n,d){
  const v=n/d*100, exact=Math.abs(v-Math.round(v))<1e-9;
  return (exact?"":"\u2248")+Math.round(v)+"%";
}
/* every proper fraction with a listed denominator equal to n/d */
function frEquivalents(n,d){
  const out=[];
  for(const e of FR_DENOMS){
    for(let m=1;m<e;m++) if(frEq(n,d,m,e)&&!(m===n&&e===d)) out.push(m+"/"+e);
  }
  return out;
}

/* ---------- tab 1 — Fraction Bench (4Nf.01, .04, .06) ---------- */
function renderBench(side,stage){
  let d=4, n=1;
  // the numeral is pinned at the top of the stage, outside the wrap it centres —
  // .fr-wrap.bench reserves the room for it with padding-top
  const numHead=h("div","fr-bench-num");
  stage.appendChild(numHead);
  const wrap=h("div","fr-wrap bench"), stack=h("div","fr-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const stripBox=h("div",null); stripBox.style.width="100%"; stripBox.style.maxWidth="680px";  // top row: the bar — capped the same as .fr-row.spread below, so both are centred by .fr-stack identically instead of the strip hugging the left edge
  const row2=h("div","fr-row spread"); row2.style.marginTop="26px";  // extra room below the bar
  // pie and grid columns are built the same way — pie + a same-height, invisible
  // spacer standing in for the grid's "25%" label — so .fr-row's own centring
  // lines the pie and the grid itself up, instead of the taller grid+label
  // column pulling the whole grid upward relative to the shorter pie
  const pieBox=h("div","fr-col"), pieInner=h("div"), pieSpacer=h("div","fr-pct","0%");
  pieSpacer.style.visibility="hidden";
  pieBox.append(pieInner,pieSpacer);
  const gridCol=h("div","fr-col"), gridBox=h("div"), pctBox=h("div","fr-pct");
  gridCol.append(gridBox,pctBox);
  row2.append(pieBox,gridCol);
  const eq=h("div","fr-eq");
  stack.append(stripBox,row2,eq);

  const p1=h("div","panel");
  p1.append(h("h4",null,t("numerator").toUpperCase()));
  const nlw=h("div","lever-wrap");
  nlw.appendChild(h("div","ticks"));
  const nLever=document.createElement("input");
  nLever.type="range"; nLever.min=0; nLever.max=d;
  nLever.value=n; nLever.className="lever";
  nLever.setAttribute("aria-label",t("numerator"));
  nlw.appendChild(nLever);
  const nll=h("div","leverlab"); nll.append(h("span",null,t("numNone")),h("span",null,t("numAll")));
  nlw.appendChild(nll); p1.appendChild(nlw);
  p1.appendChild(Object.assign(h("p","note",t("frBenchHelp")),{}));

  const p2=h("div","panel");
  p2.append(h("h4",null,t("denominator").toUpperCase()));
  const dlw=h("div","lever-wrap");
  dlw.appendChild(h("div","ticks"));
  const dLever=document.createElement("input");
  dLever.type="range"; dLever.min=2; dLever.max=20;
  dLever.value=d; dLever.className="lever";
  dLever.setAttribute("aria-label",t("denominator"));
  dlw.appendChild(dLever);
  const dll=h("div","leverlab"); dll.append(h("span",null,t("fewer")),h("span",null,t("more")));
  dlw.appendChild(dll); p2.appendChild(dlw);
  const cnt=h("p","note"); p2.appendChild(cnt);
  side.append(p1,p2);

  nLever.oninput=()=>{ n=+nLever.value; draw(); };
  dLever.oninput=()=>{
    d=+dLever.value;
    nLever.max=d;
    if(n>d){ n=d; nLever.value=n; }
    draw();
  };

  function draw(){
    stripBox.innerHTML=""; numHead.innerHTML=""; pieInner.innerHTML=""; gridBox.innerHTML="";
    stripBox.appendChild(frStrip(n,d,{onCell:i=>{ n=(i<n)?i:i+1; nLever.value=n; draw(); }}));
    numHead.appendChild(frNumeral(n,d,"big"));
    pieInner.appendChild(frPie(n,d,190));
    gridBox.appendChild(frGrid(n,d));
    pctBox.textContent=frPct(n,d);
    const e=frEquivalents(n,d);
    eq.textContent=e.length ? t("equiv").toUpperCase()+"  "+e.join("   ") : "";
    cnt.textContent=t("parts")+": "+d;
  }
  draw();
}

/* ---------- tab 2 — Compare it (4Nf.07, .01) ---------- */
function renderCompare(side,stage){
  foldlessHud(stage);
  const q=hudQuestion(stage,t("qCmp"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","fr-wrap"), stack=h("div","fr-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const top=h("div","fr-row"), sym=h("div","fr-sym","?");
  const aBox=h("div"), bBox=h("div");
  top.append(aBox,sym,bBox);
  stack.appendChild(top);
  let A=[1,2],B=[1,3],answered=false;
  ["<","=",">"].forEach(k=>{
    const b=h("button","abtn",k); b.style.fontSize="24px";
    b.onclick=()=>answer(k); act.appendChild(b);
  });

  /* allowTrap: only "numbers" rounds get the same-numerator, different-
     denominator trap — reading which of two pies/bars has fewer TOTAL
     slices is a different (and here, unwanted) skill from reading the
     shaded amount. Pie and bar still get both same-denominator pairs
     and equivalent-fractions-written-differently pairs, just not the trap. */
  function pick(maxD,allowTrap){
    for(let tries=0;tries<50;tries++){
      const r=Math.random();
      let X,Y;
      if(allowTrap&&r<0.45){            // the trap: same numerator, different denominator
        const n=1+Math.floor(Math.random()*2);
        const d1=randDenom(2,maxD), d2=randDenom(2,maxD);
        if(d1===d2) continue;
        X=[Math.min(n,d1-1)||1,d1]; Y=[Math.min(n,d2-1)||1,d2];
      }else if((allowTrap&&r<0.75)||(!allowTrap&&r<0.55)){   // same denominator, different numerators
        const d=randDenom(3,maxD);
        const a=1+Math.floor(Math.random()*(d-1));
        const b=1+Math.floor(Math.random()*(d-1));
        if(a===b) continue;             // 3/4 against 3/4 asks nothing
        X=[a,d]; Y=[b,d];
      }else{                            // equal in value, written differently -> the "=" answer
        const d1=rand([2,3,4,5,6]), k=rand([2,3,4]);
        if(d1*k>maxD) continue;
        const n1=1+Math.floor(Math.random()*(d1-1));
        X=[n1,d1]; Y=[n1*k,d1*k];
        if(Math.random()<0.5){ const t=X; X=Y; Y=t; }
      }
      if(X[0]===Y[0]&&X[1]===Y[1]) continue;      // never the very same fraction twice
      return [X,Y];
    }
    return [[1,2],[1,3]];
  }
  function deal(){
    answered=false; act.hidden=false; sym.textContent="?"; sym.style.color="";
    const viz=rand(FR_VIZ);                       // numbers, bars or pies — never mixed within a round
    [A,B]=pick(viz==="num" ? FR_MAXD : FR_MAXD_PIC, viz==="num");
    // sized off the real stage, not a fixed pixel guess — a tall tablet
    // gets a picture that actually fills the height instead of a small
    // one stranded in the middle of a lot of empty space. Bounded by width
    // too, for two side by side plus the symbol between them — otherwise a
    // narrow-but-tall screen sizes them to wrap, stranding the "?" above.
    // The row's own width (capped by .fr-stack's max-width), not the wider
    // stage behind it, is what actually constrains that side-by-side fit.
    const sizePx=Math.max(160,Math.min(440,stage.clientHeight*0.55,(stack.clientWidth-140)/2));
    aBox.innerHTML=""; bBox.innerHTML="";
    aBox.appendChild(frViz(A[0],A[1],viz,true,false,sizePx));
    bBox.appendChild(frViz(B[0],B[1],viz,true,false,sizePx));
  }
  function answer(said){
    if(answered) return; answered=true;
    const va=A[0]/A[1], vb=B[0]/B[1];
    const truth = Math.abs(va-vb)<1e-9 ? "=" : va<vb ? "<" : ">";
    const ok=said===truth;
    act.hidden=true; sym.textContent=truth; sym.style.color=ok?"var(--c2)":"var(--red)";
    score.hit(ok);
    if(ok) scraps(stage);
    // the strips ride inside the message, so nothing covers the proof
    const proof=h("div","fr-stack");
    proof.style.margin="0 auto";
    [[A,false],[B,true]].forEach(([F,blue])=>{
      const row=h("div","fr-row"); row.style.width="100%"; row.style.gap="12px";
      const lab=frNumeral(F[0],F[1],"mid"); lab.style.minWidth="1.9em";
      const st=frStrip(F[0],F[1],{small:true,blue:blue});
      st.style.flex="1"; st.style.width="auto"; st.style.maxWidth="none";
      row.append(lab,st); proof.appendChild(row);
    });
    const why=t("cmpWhy")(A[0]+"/"+A[1],B[0]+"/"+B[1],truth)+
      (A[0]===B[0]&&A[1]!==B[1] ? " "+t("smallerWhy") : "");
    celebrate(stage,ok,why,deal,t("nextQ"),proof);
  }
  deal();
}

/* ---------- tab 3 — Fraction of (4Nf.02, .03) ---------- */
const FR_ICONS=["\u{1F34E}","\u2B50","\u{1F36A}","\u{1F388}","\u{1F41F}","\u{1F338}",
                "\u{1F697}","\u{1F353}","\u{1F9C1}","\u26BD","\u{1F431}","\u{1F344}"];

/* Lay the whole set out as a grid whose rows (or columns) ARE the equal groups:
   12 as 3 groups of 4 becomes 4x3, 12 as 6 groups of 2 becomes 6x2, 18 as 6
   groups of 3 becomes 6x3. Whichever of d and per is larger goes across, so the
   picture stays wide rather than tall. Group index is always floor(i / per). */
function frSetView(whole,d,per,kind,box){
  const items=[];
  const availW=Math.max(220,box.w), availH=Math.max(180,box.h);

  if(kind==="pie"){
    const size=Math.max(160,Math.min(availW,availH,460));
    const svg=document.createElementNS(SVGNS,"svg");
    svg.setAttribute("width",size); svg.setAttribute("height",size);
    svg.setAttribute("viewBox","0 0 "+size+" "+size);
    svg.style.pointerEvents="auto";
    const c=size/2, r=size/2-4;
    const P=a=>[c+r*Math.cos((a-90)*Math.PI/180), c+r*Math.sin((a-90)*Math.PI/180)];
    for(let i=0;i<whole;i++){
      const a0=i*360/whole, a1=(i+1)*360/whole, A=P(a0), B=P(a1);
      const pa=document.createElementNS(SVGNS,"path");
      pa.setAttribute("class","fr-slice");
      pa.setAttribute("d","M"+c+","+c+" L"+A[0].toFixed(2)+","+A[1].toFixed(2)+
        " A"+r+","+r+" 0 "+((a1-a0)>180?1:0)+" 1 "+B[0].toFixed(2)+","+B[1].toFixed(2)+" Z");
      svg.appendChild(pa); items.push(pa);
    }
    return {box:svg,items:items};
  }

  const across = d>=per;                       // put the bigger count horizontally
  const cols = across ? d : per;
  const rows = across ? per : d;
  const gap  = kind==="bar" ? 0 : Math.max(4,Math.min(14,Math.round(availW/(cols*9))));
  const cell = Math.max(20, Math.min(96,
    Math.floor(Math.min((availW-gap*(cols-1))/cols, (availH-gap*(rows-1))/rows))));

  const el=h("div","fr-grid-set");
  el.style.gap=gap+"px";
  el.style.gridTemplateColumns="repeat("+cols+","+cell+"px)";
  el.style.gridTemplateRows="repeat("+rows+","+cell+"px)";
  if(across) el.style.gridAutoFlow="column";   // fill down each column: column = group
  if(kind==="bar"){ el.style.borderRadius="10px"; el.style.overflow="hidden"; }

  const icon=rand(FR_ICONS);
  for(let i=0;i<whole;i++){
    let it;
    if(kind==="icons"){
      it=h("div","fr-ico",icon);
      it.style.fontSize=Math.round(cell*0.78)+"px";
    }else if(kind==="bar"){
      it=h("div","fr-barcell");
    }else{
      it=h("div",(kind==="squares"?"fr-sq":"fr-dot")+" fr-item");
      it.style.width=cell+"px"; it.style.height=cell+"px";
      if(kind==="squares") it.style.borderRadius=Math.round(cell*0.22)+"px";
    }
    el.appendChild(it); items.push(it);
  }
  return {box:el,items:items};
}

function renderFractionOf(side,stage){
  foldlessHud(stage);
  const score=hudScore(stage);
  const act=hudActions(stage);
  const qEl=h("div","fr-q"); stage.appendChild(qEl);
  const viz=h("div");
  viz.style.cssText="position:absolute;left:0;right:0;top:120px;bottom:104px;"+
                    "display:grid;place-items:center;pointer-events:none";
  stage.appendChild(viz);

  let n=1,d=3,whole=12,per=4,ans=4,answered=false,items=[],kind="dots";

  const preview=v=>{ items.forEach((el,i)=>el.classList.toggle("pre",!answered&&i<v)); };
  const space=()=>({w:stage.clientWidth-70, h:viz.clientHeight-24});

  function paintSet(){
    const view=frSetView(whole,d,per,kind,space());
    viz.innerHTML=""; viz.appendChild(view.box);
    items=view.items;
    items.forEach((el,i)=>{
      el.addEventListener("pointerenter",()=>preview(i+1));
      el.addEventListener("pointerleave",()=>preview(0));
      el.addEventListener("click",()=>answer(i+1));   // tap the picture itself
    });
    if(answered) markAnswer();
  }
  function markAnswer(){
    items.forEach((el,i)=>{
      el.classList.remove("pre");
      el.classList.toggle("on",i<ans);
      if(Math.floor(i/per)%2===0) el.classList.add("grp");   // band the equal groups
    });
  }
  observeSize(stage,()=>{ if(items.length) paintSet(); });

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    d=rand([2,3,4,5,6]);
    per=2+Math.floor(Math.random()*3);                 // 2-4 in each group
    whole=d*per;
    n=Math.random()<0.65?1:1+Math.floor(Math.random()*(d-1));   // unit fractions mostly
    ans=per*n;
    const kinds=["dots","squares","icons","bar","icons"];       // icons twice: kids like them
    if(whole<=12) kinds.push("pie");
    kind=rand(kinds);

    qEl.innerHTML="";
    qEl.append(frNumeral(n,d,"big"),
               h("span",null,t("ofWord")),
               h("span",null,String(whole)),
               h("span",null,"= ?"));
    paintSet();

    pickOptions(ans,1,whole,4,4).forEach(v=>{
      const b=h("button","abtn",String(v));
      b.addEventListener("pointerenter",()=>preview(v));
      b.addEventListener("pointerleave",()=>preview(0));
      b.onclick=()=>answer(v);
      act.appendChild(b);
    });
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=said===ans;
    act.hidden=true;
    markAnswer();
    score.hit(ok);
    if(ok) scraps(stage);
    celebrate(stage,ok,t("ofWhy")(n,d,whole,ans),deal,t("nextQ"));
  }
  deal();
}

/* ---------- tab 4 — Add & take away (4Nf.05) ---------- */
/* One bar. The part that stays sits solid; the part being added (gold) or taken
   away (blue) pulses beside it. The whole shaded run is bracketed above with the
   larger fraction, and each part is bracketed below with its own. */
function frWorkBar(d,keep,move,blue,topN){
  const total=keep+move;
  const g=h("div","fr-work");
  g.style.gridTemplateColumns="repeat("+d+",1fr)";

  const top=h("div","fr-lab");
  top.style.gridRow="1"; top.style.gridColumn="1 / "+(total+1);
  top.append(frNumeral(topN,d,"mid"),h("div","fr-brace down"));
  g.appendChild(top);

  for(let i=0;i<d;i++){
    const solid=i<keep, pulse=i>=keep&&i<total;
    const c=h("div","fr-wcell"+(solid?" on":"")+(pulse?" blink"+(blue?" b":""):"")+(i===d-1?" end":""));
    c.style.gridRow="2"; c.style.gridColumn=(i+1)+" / "+(i+2);
    if(i===0)   c.style.borderRadius="9px 0 0 9px";
    if(i===d-1) c.style.borderRadius="0 9px 9px 0";
    g.appendChild(c);
  }
  const bot=(from,to,num,cls)=>{
    if(to<=from) return;
    const el=h("div","fr-lab");
    el.style.gridRow="3"; el.style.gridColumn=(from+1)+" / "+(to+1);
    el.append(h("div","fr-brace up "+cls),frNumeral(num,d,"mid"));
    g.appendChild(el);
  };
  bot(0,keep,keep,"gold");
  bot(keep,total,move,blue?"blue":"gold");
  return g;
}
function renderAddSub(side,stage){
  foldlessHud(stage);
  hudQuestion(stage,t("qAdd"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","fr-wrap"), stack=h("div","fr-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const line=h("div","fr-row"); stack.appendChild(line);
  let a=1,b=1,d=4,plus=true,ans=2,answered=false;

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    const viz=rand(FR_VIZ);             // numbers, bars or pies \u2014 same picture for a, b and every option
    const maxD=viz==="num" ? FR_MAXD : FR_MAXD_PIC;
    d=4+Math.floor(Math.random()*(maxD-3));   // 4..maxD
    plus=Math.random()<0.6;
    if(plus){ a=1+Math.floor(Math.random()*(d-2)); b=1+Math.floor(Math.random()*(d-a-1)); ans=a+b; }
    else { a=2+Math.floor(Math.random()*(d-2)); b=1+Math.floor(Math.random()*(a-1)); ans=a-b; }
    line.innerHTML="";
    // sized off the real stage \u2014 see the matching comment in Compare it.
    // Add's row has 3 more (narrower) elements between the two shapes, so
    // it reserves more width for them before splitting what's left in two.
    const sizePx=Math.max(140,Math.min(380,stage.clientHeight*0.42,(stack.clientWidth-260)/2));
    // 2nd shape (b) turns blue when it's the piece leaving (subtraction), stays
    // gold when it's joining (addition) \u2014 same convention as frWorkBar's proof
    line.append(frViz(a,d,viz,true,false,sizePx),h("div","fr-op",plus?"+":"\u2212"),
                frViz(b,d,viz,true,!plus,sizePx),h("div","fr-op","="),h("div","fr-sym","?"));
    pickOptions(ans,1,d-1,Math.min(4,d-1),3).forEach(v=>{
      const btn=h("button","abtn"); btn.appendChild(frViz(v,d,viz,false));
      btn.onclick=()=>answer(v); act.appendChild(btn);
    });
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=said===ans;
    act.hidden=true;
    line.lastChild.textContent="";
    line.lastChild.appendChild(frNumeral(ans,d,"mid"));
    line.lastChild.style.color=ok?"var(--c2)":"var(--red)";
    score.hit(ok);
    if(ok) scraps(stage);
    // adding: a stays, b joins it, a+b is the total bracketed on top
    // taking away: ans stays, b is the piece leaving, a is the total on top
    const keep = plus ? a : ans;
    const proof = frWorkBar(d, keep, b, !plus, plus ? ans : a);
    // every fraction here is the real stacked numeral, never "3/19" text \u2014
    // celebrate() accepts a built node in place of a plain sentence for this
    const why=h("div","fr-why");
    const row=h("div","fr-why-row");
    row.append(frNumeral(a,d,"mid"), h("span","fr-why-op",plus?"+":"\u2212"), frNumeral(b,d,"mid"),
               h("span","fr-why-op","="), frNumeral(ans,d,"mid"));
    why.append(row, h("p","fr-why-note",t("denomNote")));
    celebrate(stage,ok,why,deal,t("nextQ"),proof);
  }
  deal();
}

/* ============================================================
   15. FRACTION RUN — three-lane endless runner
   Gates carry three candidate answers; steer into the right lane.
   Right: +100 (times combo) and +1s. Wrong: -200, combo resets.
   Every gate crossed makes the runner 5% faster.
   ============================================================ */
/* Speed is expressed as a cadence, not pixels per second: one gate every
   RUN_GATE_SECS at the starting pace. Deriving px/s from the actual road height
   keeps that cadence identical on a phone and on a wide monitor — a fixed px/s
   ran slower on tall screens and faster on short ones. */
const RUN_GATE_SECS=5.0; // seconds per gate on Normal before any speed-ups
const RUN_POINTS=500;    // per correct gate, before the combo multiplier
const RUN_HARD=1.5;      // Hard runs 50% faster
const RUN_BOOST=1.7;     // while the up arrow is held
const RUN_STEP=1.035;    // per gate crossed — gentler, so the ramp stays readable
const RUN_CAP=1.9;       // never faster than ~1.6s a gate on Normal
const RUN_GATE_H=94;
const RUN_HIT=140;       // the runner's nose, measured up from the road's bottom edge
const RUN_TARGETS=[[1,2],[1,3],[1,4],[2,3],[3,4],[1,5],[2,5],[1,6],[3,10]];
const FR_POOL=(()=>{ const o=[];
  for(const d of FR_DENOMS) for(let n=1;n<d;n++) o.push({t:"frac",n:n,d:d}); return o; })();
const frVal=s=> s.t==="frac" ? s.n/s.d : s.t==="pct" ? s.v/100 : s.v;
const frShuffle=a=>{ for(let i=a.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; } return a; };
/* pick `count` fractions matching pred, all different in value from each other
   and from anything already used. Filter + shuffle, never a rejection loop. */
function sampleFr(pred,count,used){
  const cand=frShuffle(FR_POOL.filter(pred));
  const out=[];
  for(const f of cand){
    if(out.length>=count) break;
    const v=frVal(f);
    if(used.some(u=>Math.abs(frVal(u)-v)<1e-9)) continue;
    if(out.some(o=>Math.abs(frVal(o)-v)<1e-9)) continue;
    out.push(f);
  }
  return out;
}
function runAnsNode(sp){
  if(sp.t==="frac") return frNumeral(sp.n,sp.d,"mid");
  return h("div","run-val", sp.t==="pct" ? sp.v+"%" : String(sp.v));
}
function runCompareQ(kind){
  const tgt=rand(RUN_TARGETS), tn=tgt[0], td=tgt[1], tv=tn/td;
  let correct=null, wrongs=[];
  if(kind==="eq"){
    const forms=[];
    for(const k of [2,3,4]) if(td*k<=12) forms.push({t:"frac",n:tn*k,d:td*k});
    if((100*tn/td)%1===0) forms.push({t:"pct",v:Math.round(100*tn/td)});
    if(!forms.length) return null;
    correct=rand(forms);
    wrongs=sampleFr(f=>Math.abs(f.n/f.d-tv)>1e-9,2,[correct]);
  }else{
    const up=kind==="gt";
    const c=sampleFr(f=> up ? f.n/f.d>tv+1e-9 : f.n/f.d<tv-1e-9, 1, []);
    if(!c.length) return null;
    correct=c[0];
    wrongs=sampleFr(f=> up ? f.n/f.d<tv-1e-9 : f.n/f.d>tv+1e-9, 2, [correct]);
  }
  if(wrongs.length<2) return null;
  const opts=frShuffle([correct].concat(wrongs));
  const node=h("div","run-q");
  node.append(h("span",null,t(kind==="eq"?"qEq":kind==="gt"?"qGt":"qLt")),frNumeral(tn,td,"mid"));
  return {node:node,opts:opts,correct:opts.indexOf(correct)};
}
function runAddQ(plus){
  const d=rand([4,5,6,8,10]);
  let a,b;
  if(plus){ a=1+Math.floor(Math.random()*(d-2)); b=1+Math.floor(Math.random()*(d-a-1)); }
  else    { a=2+Math.floor(Math.random()*(d-2)); b=1+Math.floor(Math.random()*(a-1)); }
  const ans=plus?a+b:a-b;
  const opts=frShuffle(pickOptions(ans,1,d-1,Math.min(3,d-1),3).map(v=>({t:"frac",n:v,d:d})));
  const node=h("div","run-q");
  node.append(frNumeral(a,d,"mid"),h("span",null,plus?"+":"\u2212"),
              frNumeral(b,d,"mid"),h("span",null,"=?"));
  let ci=0; opts.forEach((o,i)=>{ if(o.n===ans) ci=i; });
  return {node:node,opts:opts,correct:ci};
}
function runOfQ(){
  const d=rand([2,3,4,5,6]), per=2+Math.floor(Math.random()*3), whole=d*per;
  const n=Math.random()<0.7?1:1+Math.floor(Math.random()*(d-1));
  const ans=per*n;
  const opts=frShuffle(pickOptions(ans,1,whole,3,4).map(v=>({t:"num",v:v})));
  const node=h("div","run-q");
  node.append(frNumeral(n,d,"mid"),h("span",null,t("ofWord")),
              h("span",null,String(whole)),h("span",null,"=?"));
  let ci=0; opts.forEach((o,i)=>{ if(o.v===ans) ci=i; });
  return {node:node,opts:opts,correct:ci};
}
function runQuestion(){
  for(let tries=0;tries<30;tries++){
    const k=rand(["eq","gt","lt","add","sub","of"]);
    const q = (k==="eq"||k==="gt"||k==="lt") ? runCompareQ(k)
            : (k==="add"||k==="sub") ? runAddQ(k==="add")
            : runOfQ();
    if(q) return q;
  }
  return runAddQ(true);                       // always succeeds
}

function renderRunArcade(side,stage){
  // plain wrapper: the framed box is the question node itself, and giving this
  // one the same class drew a second frame around it
  const elQ=h("div");
  const road=h("div","run-road");
  const l1=h("div","run-line"), l2=h("div","run-line");
  l1.style.left="33.3333%"; l2.style.left="66.6666%";
  const gates=h("div","run-gates");
  const runner=h("div","run-runner");
  const dart=document.createElementNS(SVGNS,"svg");
  dart.setAttribute("viewBox","0 0 60 60");
  dart.setAttribute("width","52"); dart.setAttribute("height","52");
  const dp=document.createElementNS(SVGNS,"path");
  dp.setAttribute("d","M30 5 L53 51 L30 39 L7 51 Z");
  dp.setAttribute("fill","var(--c1)"); dp.setAttribute("stroke","#fff");
  dp.setAttribute("stroke-width","3.5"); dp.setAttribute("stroke-linejoin","round");
  dart.appendChild(dp); runner.appendChild(dart);
  road.append(l1,l2,gates,runner);
  stage.appendChild(road);

  const ctrl=h("div","run-ctrl");
  const bl=h("button","run-arrow","\u25C0"),
        bu=h("button","run-arrow","\u25B2"),
        br=h("button","run-arrow","\u25B6");
  ctrl.append(bl,bu,br); road.appendChild(ctrl);   // overlaid on the road, not below it

  let lane=1, mult=1, scroll=0, live=[], apiRef=null, boost=false;
  /* Which lane holds the answer is weighted, not uniform. Every lane starts at
     1/3; the one just used drops 10 points and the other two gain 5 each, which
     conserves the total. A repeat is possible but progressively unlikely, so
     nothing is ever ruled out and no pattern is readable. The hard cap below
     stays as a backstop and fires on roughly 3% of gates. */
  const LANE_DROP=0.10, LANE_GAIN=0.05;
  let laneW=[1/3,1/3,1/3], lastLane=-1, laneRun=0;
  const pickLane=()=>{ const r=Math.random(); let a=0;
    for(let i=0;i<3;i++){ a+=laneW[i]; if(r<a) return i; } return 2; };
  const bumpLanes=i=>{
    for(let k=0;k<3;k++) laneW[k]+= (k===i? -LANE_DROP : LANE_GAIN);
    let sum=0;
    for(let k=0;k<3;k++){ if(laneW[k]<0) laneW[k]=0; sum+=laneW[k]; }   // long streaks
    for(let k=0;k<3;k++) laneW[k]/=sum;                                 // would go negative
  };
  const setLane=v=>{ lane=Math.max(0,Math.min(2,v)); runner.style.left=(lane*33.3333)+"%"; };
  const nudge=dir=>{ if(apiRef&&apiRef.running) setLane(lane+dir); };
  bl.onclick=()=>nudge(-1);
  br.onclick=()=>nudge(1);
  road.addEventListener("pointerdown",e=>{            // tapping a lane also works
    if(!apiRef||!apiRef.running) return;
    if(e.target.closest("button")) return;           // the pads handle their own taps
    const r=road.getBoundingClientRect();
    setLane(Math.floor((e.clientX-r.left)/(r.width/3)));
  });
  const setBoost=on=>{ boost=on; runner.classList.toggle("boost",on); };
  bu.addEventListener("pointerdown",e=>{ e.preventDefault(); setBoost(true); });
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>
    bu.addEventListener(ev,()=>setBoost(false)));
  const onKey=e=>{
    if(e.key==="ArrowLeft"){ e.preventDefault(); nudge(-1); }
    else if(e.key==="ArrowRight"){ e.preventDefault(); nudge(1); }
    else if(e.key==="ArrowUp"){ e.preventDefault(); setBoost(true); }
  };
  const offKey=e=>{ if(e.key==="ArrowUp") setBoost(false); };
  const blur=()=>setBoost(false);              // never leave the dash stuck on
  window.addEventListener("keydown",onKey);
  window.addEventListener("keyup",offKey);
  window.addEventListener("blur",blur);
  pending.push(()=>{
    window.removeEventListener("keydown",onKey);
    window.removeEventListener("keyup",offKey);
    window.removeEventListener("blur",blur);
  });

  function clearGates(){ live.forEach(g=>g.el.remove()); live=[]; }
  function spawn(){
    const q=runQuestion();
    // choose the lane by weight, then move the answer there
    let want=pickLane();
    if(want===lastLane && laneRun>=2) want=(want+1+Math.floor(Math.random()*2))%3;
    let ci=q.correct;
    if(want!==ci){ const t=q.opts[ci]; q.opts[ci]=q.opts[want]; q.opts[want]=t; ci=want; }
    if(ci===lastLane) laneRun++; else { lastLane=ci; laneRun=1; }
    bumpLanes(ci);
    const el=h("div","run-group");
    const cells=[];
    q.opts.forEach((sp,i)=>{
      const g=h("div","run-gate");
      g.style.left=(i*33.3333)+"%";
      const inner=h("div","run-gate-in");
      inner.appendChild(runAnsNode(sp));
      g.appendChild(inner); el.appendChild(g); cells.push(g);
    });
    gates.appendChild(el);
    live.push({el:el,y:-RUN_GATE_H,correct:ci,cells:cells,done:false});
    elQ.innerHTML=""; elQ.appendChild(q.node);   // fixed slot under the clock
  }
  function resolve(g,api){
    g.done=true;
    const ok=lane===g.correct;
    g.cells[g.correct].classList.add("good");
    if(!ok) g.cells[lane].classList.add("bad");
    const rr=road.getBoundingClientRect(), sr=stage.getBoundingClientRect();
    const px=rr.left-sr.left+rr.width*(lane*0.33333+0.1667);
    const py=rr.top-sr.top+rr.height-RUN_HIT-30;
    if(ok){
      const got=api.award(RUN_POINTS);
      api.addTime(1000);                       // flat second: the clock is fixed at 30
      api.pop(px,py,"+"+got,"var(--c2)");
      sfxGold();
    }else{
      api.penalise(200);
      api.pop(px,py,"-200","var(--red)");
      sfxWrong();
    }
    mult=Math.min(RUN_CAP,mult*RUN_STEP);     // every gate crossed, right or wrong
    spawn();
  }

  arcadeShell(stage,{
    key:"run", how:"arcHowR", topExtra:elQ, comboPos:"tl",
    rules:[["var(--c2)","ruleRunGood"],["var(--red)","ruleRunBad"],
           ["var(--c1)","ruleRunFast"],["var(--chalk)","ruleRunBoost"]],
    reset(api){ apiRef=api; mult=1; scroll=0;
                laneW=[1/3,1/3,1/3]; lastLane=-1; laneRun=0;
                setBoost(false); clearGates(); setLane(1); spawn(); },
    cleanup(){ clearGates(); },
    frame(dt,played,api){
      apiRef=api;
      const H=road.clientHeight||420;
      const hitY=H-RUN_HIT;                     // where the runner sits
      // distance a gate covers between spawning and reaching the runner
      const travel=hitY+RUN_GATE_H/2;
      const base=travel/RUN_GATE_SECS*(api.hard?RUN_HARD:1);
      const step=base*mult*(boost?RUN_BOOST:1)*dt/1000;
      scroll+=step;
      l1.style.backgroundPositionY=scroll+"px";
      l2.style.backgroundPositionY=scroll+"px";
      for(const g of live){
        g.y+=step;
        g.el.style.transform="translateY("+g.y.toFixed(1)+"px)";
        if(!g.done && g.y+RUN_GATE_H/2>=hitY) resolve(g,api);
      }
      const gone=live.filter(g=>g.y>H+20);
      if(gone.length){ gone.forEach(g=>g.el.remove()); live=live.filter(g=>g.y<=H+20); }
    }
  });
}

export default {
  games:[
    {id:"bench", name:"gFrBench", blurb:"gFrBenchP", render:renderBench},
    {id:"cmp",   name:"gCmp",   blurb:"gCmpP",   render:renderCompare,    full:true},
    {id:"of",    name:"gOf",    blurb:"gOfP",    render:renderFractionOf, full:true},
    {id:"add",   name:"gAdd",   blurb:"gAddP",   render:renderAddSub,     full:true},
    {id:"run",   name:"gRun",   blurb:"gRunP",   render:renderRunArcade,  full:true, rainbow:true}
  ]
};
