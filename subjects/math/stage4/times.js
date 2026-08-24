/* Workbench — Times Table Lab — recall, missing factors and a Venn sort
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Ni.04 */

import {h, rand, pickOptions} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions, foldlessHud} from "../../../engine/ui.js";
import {arcadeShell} from "../../../engine/arcade.js";
import {sfxGold, sfxBlue, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./times.strings.js";
addStrings(STRINGS);

/* ============================================================
   TIMES TABLE LAB — Cambridge Primary Stage 4

   4Ni.04 recall multiplication/division facts to 12x12
   ============================================================ */
const TM_MAX=12;

/* Cell/gap sizing shared by both grids below. The gap is picked from the
   available width BEFORE the cell size, then subtracted out of that same
   space — sizing the gap off the final cell instead (as a fraction of it)
   let a wide grid's total width silently exceed the box, since gap*(b-1)
   was never accounted for. Gaps are deliberately generous: each square must
   read as its own countable item, not blur into one solid block. */
function tmSize(a,b){
  const maxW=260,maxH=200;
  const gap=Math.max(3,Math.min(10,Math.round(maxW/(b*9))));
  const cell=Math.max(12,Math.min(38,
    Math.floor(Math.min((maxW-gap*(b-1))/b,(maxH-gap*(a-1))/a))));
  return {cell,gap};
}

/* a rows x b cols array of unit cells, fixed max box so it never overflows.
   Plain and static — used for the Missing Factor proof, which never needs
   interactivity. */
function tmArray(a,b){
  const {cell,gap}=tmSize(a,b);
  const wrap=h("div","tm-gridwrap");
  wrap.style.width=(cell*b+gap*(b-1))+"px"; wrap.style.height=(cell*a+gap*(a-1))+"px";
  const el=h("div","tm-grid");
  el.style.gridTemplateColumns="repeat("+b+","+cell+"px)";
  el.style.gridTemplateRows="repeat("+a+","+cell+"px)";
  el.style.gap=gap+"px";
  for(let i=0;i<a*b;i++) el.appendChild(h("div","tm-cell"));
  wrap.appendChild(el);
  return wrap;
}

/* The bench is its tab's only content, not a small proof snippet inside a
   width-limited celebration overlay like tmArray's callers — so it gets a
   bigger box than tmSize allows, via the same shape-preserving formula. */
function tmBenchSize(a,b){
  const maxW=380,maxH=300;
  const gap=Math.max(3,Math.min(10,Math.round(maxW/(b*9))));
  const cell=Math.max(12,Math.min(56,
    Math.floor(Math.min((maxW-gap*(b-1))/b,(maxH-gap*(a-1))/a))));
  return {cell,gap};
}
/* Same grid, but for the bench: never resizes on its own. A column overlay
   (one full-height hit target per column, not per cell) reports which
   column was hovered/focused/clicked so the caller can dim the rest without
   touching a or b. Returns the cells in row-major order for dimming. */
function tmBenchGrid(a,b,onColHover,onColLeave,onColClick){
  const {cell,gap}=tmBenchSize(a,b);
  const wrap=h("div","tm-gridwrap");
  wrap.style.width=(cell*b+gap*(b-1))+"px"; wrap.style.height=(cell*a+gap*(a-1))+"px";
  const el=h("div","tm-grid");
  el.style.gridTemplateColumns="repeat("+b+","+cell+"px)";
  el.style.gridTemplateRows="repeat("+a+","+cell+"px)";
  el.style.gap=gap+"px";
  const cells=[];
  for(let i=0;i<a*b;i++){ const c=h("div","tm-cell"); el.appendChild(c); cells.push(c); }
  wrap.appendChild(el);
  const hits=h("div","tm-colhits");
  hits.style.gridTemplateColumns="repeat("+b+","+cell+"px)";
  hits.style.gap=gap+"px";
  for(let col=0;col<b;col++){
    const btn=h("button","tm-colhit");
    btn.setAttribute("aria-label",t("showCol")(col+1));
    btn.addEventListener("pointerenter",()=>onColHover(col+1));
    btn.addEventListener("focus",()=>onColHover(col+1));
    btn.addEventListener("pointerleave",onColLeave);
    btn.addEventListener("blur",onColLeave);
    btn.onclick=()=>onColClick(col+1);
    hits.appendChild(btn);
  }
  wrap.appendChild(hits);
  return {wrap,cells};
}
const numNode=v=>h("div","tm-num",String(v));
const opNode=s=>h("div","tm-op",s);
const symNode=()=>h("div","tm-num tm-sym","?");

/* ---------- tab 1 — Times Bench (4Ni.04) ---------- */
/* Rows (a) and columns (b) only ever change via the levers. The chips and
   the grid's own columns are two views of the SAME single axis — a chip is
   "a x j" for column count j, exactly what hovering/clicking column j shows
   — so both drive one shared column-dim boundary rather than each other's
   independent state. Rows are never dimmed; only columns past the picked
   one are. Hovering (or focusing, for keyboard users) previews it live;
   clicking/pressing fixes it so it survives the pointer leaving. Clicking
   the very last column clears back to the full array, since dimming
   nothing past the last one is a no-op. */
function renderBench(side,stage){
  let a=3,b=4;
  let fixedCol=null;   // fixed boundary: show columns 1..N, dim the rest
  let hoverCol=null;   // transient preview, wins over the fixed boundary
  const wrap=h("div","tm-wrap bench"), stack=h("div","tm-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const gridBox=h("div","tm-gridbox");
  const eq=h("div","tm-eq");
  const chips=h("div","tm-chips");
  const facts=h("div","tm-facts");
  stack.append(gridBox,eq,chips,facts);
  let cells=[], chipEls=[];

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
  r2.panel.appendChild(h("p","note",t("tmBenchHelp")));
  side.append(r1.panel,r2.panel);

  r1.input.oninput=()=>{ a=+r1.input.value; draw(); };
  r2.input.oninput=()=>{ b=+r2.input.value; fixedCol=null; hoverCol=null; draw(); };

  const setPreview=col=>{ hoverCol=col; applyDim(); };
  const clearPreview=()=>{ hoverCol=null; applyDim(); };
  const fix=col=>{ fixedCol=col; hoverCol=null; applyDim(); };

  /* repaint the dim state and the equation without rebuilding the DOM */
  function applyDim(){
    const vc=hoverCol??fixedCol??b;
    cells.forEach((cell,idx)=>cell.classList.toggle("tm-off",idx%b>=vc));
    const c=a*vc;
    eq.textContent=a+" × "+vc+" = "+c;
    chipEls.forEach((chip,j)=>chip.classList.toggle("on",(j+1)===vc));
    facts.innerHTML="";
    facts.append(h("div",null,c+" ÷ "+a+" = "+vc), h("div",null,c+" ÷ "+vc+" = "+a));
  }

  function draw(){
    gridBox.innerHTML="";
    const grid=tmBenchGrid(a,b,setPreview,clearPreview,fix);
    cells=grid.cells;
    gridBox.appendChild(grid.wrap);
    chips.innerHTML=""; chipEls=[];
    for(let j=1;j<=b;j++){
      const chip=h("button","tm-chip",String(a*j));
      chip.addEventListener("pointerenter",()=>setPreview(j));
      chip.addEventListener("focus",()=>setPreview(j));
      chip.addEventListener("pointerleave",clearPreview);
      chip.addEventListener("blur",clearPreview);
      chip.onclick=()=>fix(j);
      chips.appendChild(chip);
      chipEls.push(chip);
    }
    applyDim();
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
  let a=3,b=4,c=12,ans=4,answered=false,lastKey=null;

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    let kind,key;
    do{
      a=1+Math.floor(Math.random()*TM_MAX);
      b=1+Math.floor(Math.random()*TM_MAX);
      kind=rand(["ab","ax","xb","da","db"]);
      key=kind+","+a+","+b;
    }while(key===lastKey);
    lastKey=key;
    c=a*b;
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

/* ---------- tab 3 — Venn Sort (4Ni.04) ---------- */
/* Two overlapping circles, "Divisible by X" / "Divisible by Y". Three tiles,
   exactly one of which truly belongs in the diagram — the other two are
   divisible by neither X nor Y, so no drop zone will ever accept them.
   Correctness is checked live from the dropped (value, zone) pair, not
   against a stored "intended tile" — the only thing generation guarantees
   is that exactly one value satisfies exactly one zone. */
const TV_MIN=2, TV_MAX_D=9, TV_CAP=99;

function tvLcm(a,b){
  const gcd=(x,y)=>y?gcd(y,x%y):x;
  return a*b/gcd(a,b);
}
/* "left"/"right" only exist when neither divisor is a multiple of the
   other — if Y is a multiple of X, every multiple of Y is automatically a
   multiple of X too, so "divisible by Y but not X" has no solution. */
function tvValidRegions(X,Y){
  const out=["both"];
  if(X%Y!==0) out.push("left");
  if(Y%X!==0) out.push("right");
  return out;
}
function tvGenFor(region,X,Y){
  if(region==="both"){
    const l=tvLcm(X,Y);
    const maxK=Math.max(1,Math.floor(TV_CAP/l));
    return l*(1+Math.floor(Math.random()*maxK));
  }
  const div=region==="left"?X:Y, other=region==="left"?Y:X;
  for(let tries=0;tries<50;tries++){
    const k=1+Math.floor(Math.random()*Math.floor(TV_CAP/div));
    const val=div*k;
    if(val%other!==0) return val;
  }
  return div;   // unreachable given tvValidRegions guards the caller
}
/* a plausible wrong tile: a near-miss of a real multiple of X or Y (off by
   one), never an arbitrary number — matches factProductOptions' style.
   Must fit neither circle, so it has no correct home anywhere. */
function tvNearMiss(X,Y,avoid){
  for(let tries=0;tries<80;tries++){
    const base=rand([X,Y]);
    const k=1+Math.floor(Math.random()*Math.floor(TV_CAP/base));
    const val=base*k+(Math.random()<0.5?-1:1);
    if(val>=2&&val<=TV_CAP&&val%X!==0&&val%Y!==0&&!avoid.includes(val)) return val;
  }
  for(let val=2;val<=TV_CAP;val++) if(val%X!==0&&val%Y!==0&&!avoid.includes(val)) return val;
  return TV_CAP;
}
function tvShuffle3(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

function renderVenn(side,stage){
  foldlessHud(stage);
  hudQuestion(stage,t("qVenn"));
  const score=hudScore(stage);
  const wrap=h("div","tv-wrap"); stage.appendChild(wrap);
  const diagram=h("div","tv-diagram");
  const tray=h("div","tv-tray");
  wrap.append(diagram,tray);

  const cLeft=h("div","tv-circle tv-c-left");
  const cRight=h("div","tv-circle tv-c-right");
  const tLeft=h("div","tv-title tv-t-left");
  const tRight=h("div","tv-title tv-t-right");
  const zLeft=document.createElement("button"); zLeft.className="tv-zone tv-z-left"; zLeft.dataset.zone="left";
  const zBoth=document.createElement("button"); zBoth.className="tv-zone tv-z-both"; zBoth.dataset.zone="both";
  const zRight=document.createElement("button"); zRight.className="tv-zone tv-z-right"; zRight.dataset.zone="right";
  diagram.append(cLeft,cRight,zLeft,zBoth,zRight,tLeft,tRight);

  let X,Y,correctRegion,correctVal,tiles=[],lastKey=null,answered=false;
  let tileEls=[],armedIdx=null,drag=null,suppressClick=false,hoverZoneEl=null;

  [zLeft,zBoth,zRight].forEach(z=>{
    z.addEventListener("click",()=>{ if(armedIdx!=null) tryPlace(armedIdx,z.dataset.zone); });
  });

  function paintArmed(){ tileEls.forEach((el,i)=>el.classList.toggle("armed",i===armedIdx)); }
  /* neutral highlight only — which zone lit up must never hint right/wrong,
     so it's the same style regardless of which of the three it is */
  function setHoverZone(zoneEl){
    if(zoneEl===hoverZoneEl) return;
    if(hoverZoneEl) hoverZoneEl.classList.remove("tv-zone-over");
    hoverZoneEl=zoneEl;
    if(hoverZoneEl) hoverZoneEl.classList.add("tv-zone-over");
  }

  function buildTiles(){
    tray.innerHTML=""; tileEls=[];
    tiles.forEach((v,i)=>{
      const tile=document.createElement("button");
      tile.className="tv-tile";
      tile.textContent=String(v);
      tile.style.touchAction="none";
      wireTile(tile,i);
      tray.appendChild(tile);
      tileEls.push(tile);
    });
  }

  function wireTile(tile,i){
    tile.addEventListener("pointerdown",e=>{
      if(answered) return;
      suppressClick=false;
      drag={idx:i,startX:e.clientX,startY:e.clientY,moved:false,ghost:null,pid:e.pointerId};
      tile.setPointerCapture(e.pointerId);
    });
    tile.addEventListener("pointermove",e=>{
      if(!drag||drag.idx!==i) return;
      const dx=e.clientX-drag.startX, dy=e.clientY-drag.startY;
      if(!drag.moved && Math.hypot(dx,dy)>8){
        drag.moved=true;
        drag.ghost=h("div","tv-ghost",tile.textContent);
        document.body.appendChild(drag.ghost);
        tile.classList.add("dragging");
      }
      if(drag.moved){
        drag.ghost.style.left=e.clientX+"px"; drag.ghost.style.top=e.clientY+"px";
        const under=document.elementFromPoint(e.clientX,e.clientY);
        setHoverZone(under&&under.closest(".tv-zone"));
      }
    });
    const finish=e=>{
      if(!drag||drag.idx!==i) return;
      tile.releasePointerCapture(drag.pid);
      tile.classList.remove("dragging");
      if(drag.moved){
        suppressClick=true;   // the browser still fires a click right after this — ignore it
        if(drag.ghost) drag.ghost.remove();
        const under=document.elementFromPoint(e.clientX,e.clientY);
        const zoneEl=under&&under.closest(".tv-zone");
        setHoverZone(null);
        if(zoneEl) tryPlace(i,zoneEl.dataset.zone);
      }
      drag=null;
    };
    tile.addEventListener("pointerup",finish);
    tile.addEventListener("pointercancel",()=>{
      if(drag&&drag.idx===i){ if(drag.ghost) drag.ghost.remove(); tile.classList.remove("dragging"); setHoverZone(null); drag=null; }
    });
    /* covers a plain tap, AND keyboard Enter/Space (which never fires the
       pointer events above at all) — one path for both input styles */
    tile.addEventListener("click",()=>{
      if(suppressClick){ suppressClick=false; return; }
      if(answered) return;
      armedIdx=armedIdx===i?null:i;
      paintArmed();
    });
  }

  function tvProof(){
    const stack=h("div","tv-proof");
    const remX=correctVal%X, remY=correctVal%Y;
    const lineX=h("div","tv-proofline",remX===0?t("vennDivOk")(correctVal,X,correctVal/X):t("vennDivNo")(correctVal,X,remX));
    lineX.style.color=remX===0?"var(--c2)":"var(--red)";
    const lineY=h("div","tv-proofline",remY===0?t("vennDivOk")(correctVal,Y,correctVal/Y):t("vennDivNo")(correctVal,Y,remY));
    lineY.style.color=remY===0?"var(--c2)":"var(--red)";
    stack.append(lineX,lineY);
    return stack;
  }

  function tryPlace(idx,zone){
    if(answered) return;
    answered=true;
    const val=tiles[idx];
    const ok=(zone==="left"&&val%X===0&&val%Y!==0)
            ||(zone==="right"&&val%Y===0&&val%X!==0)
            ||(zone==="both"&&val%X===0&&val%Y===0);
    score.hit(ok);
    tileEls[idx].style.color=ok?"var(--c2)":"var(--red)";
    tileEls.forEach(el=>el.disabled=true);
    if(ok) sfxGold(); else sfxWrong();
    armedIdx=null; paintArmed();
    celebrate(stage,ok,t("vennWhy")(correctRegion,correctVal,X,Y),deal,t("nextQ"),tvProof());
  }

  function deal(){
    answered=false;
    let key;
    do{
      X=TV_MIN+Math.floor(Math.random()*(TV_MAX_D-TV_MIN+1));
      do{ Y=TV_MIN+Math.floor(Math.random()*(TV_MAX_D-TV_MIN+1)); }while(Y===X);
      correctRegion=rand(tvValidRegions(X,Y));
      correctVal=tvGenFor(correctRegion,X,Y);
      key=X+","+Y+","+correctRegion+","+correctVal;
    }while(key===lastKey);
    lastKey=key;
    const d1=tvNearMiss(X,Y,[correctVal]);
    const d2=tvNearMiss(X,Y,[correctVal,d1]);
    tiles=tvShuffle3([correctVal,d1,d2]);
    tLeft.textContent=t("divTitle")(X);
    tRight.textContent=t("divTitle")(Y);
    zLeft.setAttribute("aria-label",t("divTitle")(X));
    zRight.setAttribute("aria-label",t("divTitle")(Y));
    zBoth.setAttribute("aria-label",t("vennBothLabel")(X,Y));
    buildTiles();
  }
  deal();
}

/* ---------- tab 4 — Arcade (4Ni.04) ---------- */
/* 2 x 4 grid: a "x" corner, column headers (top row) and row headers (left
   column) frame a 3x3 play area. Dragging a tray tile onto the cell whose
   row x column it matches fills that cell; filling a whole row or column
   clears it (and rerolls that one header) for points and bonus time — the
   same row+column at once, in a single placement, pays out once at a
   higher rate rather than stacking two separate clears. */
const TMA_HDR_LO=2, TMA_HDR_HI=10;      // normal-mode header range
const TMA_CLOCK=45000;                  // longer than the other arcades' 30s —
                                         // clearing a line takes several placements
const TMA_LINE=300, TMA_DUAL=1000, TMA_MISS=100;
const TMA_LINE_TIME=1000, TMA_DUAL_TIME=3000;
const TMA_DRAG_SLOP=8;                  // px of pointer movement before a tap becomes a drag
const TMA_MIN_CORRECT=4;                // floor on how many tray tiles are a valid move
const TMA_CLEAR_MS=380;                 // how long the clear flash plays before the line resets

const tmaRound1=v=>Math.round(v*10)/10;
const tmaClose=(a,b)=>Math.abs(a-b)<0.001;
const tmaFmt=v=>Number.isInteger(v)?String(v):v.toFixed(1);
function tmaShuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
const tmaPick=arr=>arr[Math.floor(Math.random()*arr.length)];

function tmaRowHeaderRaw(hard){
  if(hard){
    if(Math.random()<0.5) return tmaRound1((1+Math.floor(Math.random()*9))/10);  // 0.1-0.9
    return 1+Math.floor(Math.random()*9);                                        // hard's whole-number alt: 1-9
  }
  return TMA_HDR_LO+Math.floor(Math.random()*(TMA_HDR_HI-TMA_HDR_LO+1));          // normal: 2-10
}
const tmaColHeaderRaw=()=>TMA_HDR_LO+Math.floor(Math.random()*(TMA_HDR_HI-TMA_HDR_LO+1));
/* a fresh header for one axis position, never equal to any header the
   caller says to avoid — used both to build the initial 3 (avoiding the
   ones already picked) and to reroll one after a clear (avoiding the other
   two AND its own just-cleared value, so nothing on that axis repeats and
   a reroll never just puts back what was already there). */
function tmaNewRowHeader(hard,avoid){
  for(let a=0;a<50;a++){ const v=tmaRowHeaderRaw(hard); if(!avoid.some(x=>tmaClose(x,v))) return v; }
  return tmaRowHeaderRaw(hard);   // bounded fallback; the pool is wide enough this never really triggers
}
function tmaNewColHeader(avoid){
  for(let a=0;a<50;a++){ const v=tmaColHeaderRaw(); if(!avoid.some(x=>tmaClose(x,v))) return v; }
  return tmaColHeaderRaw();
}
function tmaNewRowHeaders(hard){ const out=[]; for(let i=0;i<3;i++) out.push(tmaNewRowHeader(hard,out)); return out; }
function tmaNewColHeaders(){ const out=[]; for(let i=0;i<3;i++) out.push(tmaNewColHeader(out)); return out; }

const tmaCellVal=(rowH,colH,r,c)=>tmaRound1(rowH[r]*colH[c]);
function tmaEmptyProducts(rowH,colH,filled){
  const set=new Set();
  for(let r=0;r<3;r++) for(let c=0;c<3;c++) if(!filled[r][c]) set.add(tmaCellVal(rowH,colH,r,c));
  return [...set];
}
/* a plausible wrong tile: one factor on a real board cell nudged by +-1
   (or +-0.1 for a decimal row header) — never an arbitrary number, matching
   the rest of this module's distractor style (see factProductOptions). */
function tmaGenDistractor(rowH,colH,filled,avoid){
  for(let attempt=0;attempt<30;attempt++){
    const r=Math.floor(Math.random()*3), c=Math.floor(Math.random()*3);
    let rv=rowH[r], cv=colH[c];
    if(Math.random()<0.5) rv=Math.max(rv<1?0.1:1, rv+(Math.random()<0.5?-1:1)*(rv<1?0.1:1));
    else cv=Math.max(1, cv+(Math.random()<0.5?-1:1));
    const val=tmaRound1(rv*cv);
    if(val>0 && !avoid.some(a=>tmaClose(a,val))) return val;
  }
  // fallback also respects avoid — a handful of avoided values can never
  // exhaust 49 sequential offsets from a real board product
  const base=tmaRound1(rowH[0]*colH[0]);
  for(let k=1;k<50;k++){
    const val=tmaRound1(base+k);
    if(val>0 && !avoid.some(a=>tmaClose(a,val))) return val;
  }
  return tmaRound1(base+50+Math.random());
}
/* keeps "at least TMA_MIN_CORRECT correct tiles" true after any
   reroll/clear, AND retires any duplicate correct value once a distinct
   alternative exists — a duplicate can be left over from an earlier round
   where too few distinct products existed to avoid one, and the count-only
   check below would otherwise never revisit it once the count is met. */
function tmaTopUp(pool,rowH,colH,filled){
  const correctVals=tmaEmptyProducts(rowH,colH,filled);
  if(!correctVals.length) return;
  let attempts=0;
  while(pool.filter(v=>correctVals.some(cv=>tmaClose(cv,v))).length<TMA_MIN_CORRECT && attempts<20){
    attempts++;
    const wrongIdx=pool.findIndex(v=>!correctVals.some(cv=>tmaClose(cv,v)));
    if(wrongIdx===-1) break;
    const unused=correctVals.filter(cv=>!pool.some(v=>tmaClose(v,cv)));
    pool[wrongIdx]=unused.length?tmaPick(unused):tmaPick(correctVals);
  }
  let dedupGuard=0;
  while(dedupGuard<10){
    dedupGuard++;
    const seen=new Set(); let dupIdx=-1;
    for(let i=0;i<pool.length;i++){
      const key=pool[i].toFixed(3);
      if(seen.has(key)){ dupIdx=i; break; }
      seen.add(key);
    }
    if(dupIdx===-1) break;
    const unused=correctVals.filter(cv=>!pool.some((v,i)=>i!==dupIdx&&tmaClose(v,cv)));
    if(!unused.length) break;
    pool[dupIdx]=tmaPick(unused);
  }
}
function tmaGenPool(rowH,colH,filled){
  const correct=tmaShuffle(tmaEmptyProducts(rowH,colH,filled).slice());
  const take=Math.min(correct.length,TMA_MIN_CORRECT+Math.floor(Math.random()*3));
  const pool=correct.slice(0,take);
  let guard=0;
  while(pool.length<6 && guard<200){
    guard++;
    const d=tmaGenDistractor(rowH,colH,filled,pool);
    if(!pool.some(v=>tmaClose(v,d))) pool.push(d);
  }
  tmaTopUp(pool,rowH,colH,filled);
  return tmaShuffle(pool);
}

function renderTimesArcade(side,stage){
  const wrap=h("div","tma-wrap"); stage.appendChild(wrap);
  const board=h("div","tma-board");
  const tray=h("div","tma-tray");
  wrap.append(board,tray);

  let rowH,colH,filled,pool,armedIdx=null,suppressClick=false;
  let cellEls=[],headREls=[],headCEls=[],tileEls=[],drag=null;

  function buildBoard(){
    board.innerHTML=""; cellEls=[]; headREls=[]; headCEls=[];
    board.appendChild(h("div","tma-corner","×"));
    for(let c=0;c<3;c++) headCEls.push(board.appendChild(h("div","tma-head")));
    for(let r=0;r<3;r++){
      headREls.push(board.appendChild(h("div","tma-head")));
      for(let c=0;c<3;c++){
        const cell=document.createElement("button");
        cell.className="tma-cell";
        cell.dataset.r=r; cell.dataset.c=c;
        cell.addEventListener("click",()=>{ if(armedIdx!=null) tryPlace(armedIdx,r,c); });
        board.appendChild(cell);
        cellEls.push(cell);
      }
    }
  }
  function paintHeaders(){
    headCEls.forEach((el,c)=>el.textContent=tmaFmt(colH[c]));
    headREls.forEach((el,r)=>el.textContent=tmaFmt(rowH[r]));
  }
  function paintCells(){
    cellEls.forEach(cell=>{
      const r=+cell.dataset.r, c=+cell.dataset.c, done=filled[r][c];
      cell.classList.toggle("filled",done);
      cell.textContent=done?tmaFmt(tmaCellVal(rowH,colH,r,c)):"";
      cell.disabled=done;
    });
  }
  function paintArmed(){
    tileEls.forEach((el,i)=>el.classList.toggle("armed",i===armedIdx));
  }
  function buildTray(){
    tray.innerHTML=""; tileEls=[];
    pool.forEach((v,i)=>{
      const tile=document.createElement("button");
      tile.className="tma-tile";
      tile.textContent=tmaFmt(v);
      tile.style.touchAction="none";
      wireTile(tile,i);
      tray.appendChild(tile);
      tileEls.push(tile);
    });
  }

  function wireTile(tile,i){
    tile.addEventListener("pointerdown",e=>{
      if(!api.running) return;
      suppressClick=false;
      drag={idx:i,startX:e.clientX,startY:e.clientY,moved:false,ghost:null,pid:e.pointerId};
      tile.setPointerCapture(e.pointerId);
    });
    tile.addEventListener("pointermove",e=>{
      if(!drag||drag.idx!==i) return;
      const dx=e.clientX-drag.startX, dy=e.clientY-drag.startY;
      if(!drag.moved && Math.hypot(dx,dy)>TMA_DRAG_SLOP){
        drag.moved=true;
        drag.ghost=h("div","tma-ghost",tile.textContent);
        document.body.appendChild(drag.ghost);
        tile.classList.add("dragging");
      }
      if(drag.moved){ drag.ghost.style.left=e.clientX+"px"; drag.ghost.style.top=e.clientY+"px"; }
    });
    const finish=e=>{
      if(!drag||drag.idx!==i) return;
      tile.releasePointerCapture(drag.pid);
      tile.classList.remove("dragging");
      if(drag.moved){
        suppressClick=true;   // the browser still fires a click right after this — ignore it
        if(drag.ghost) drag.ghost.remove();
        const under=document.elementFromPoint(e.clientX,e.clientY);
        const cellEl=under&&under.closest(".tma-cell");
        if(cellEl&&!cellEl.disabled) tryPlace(i,+cellEl.dataset.r,+cellEl.dataset.c);
      }
      drag=null;
    };
    tile.addEventListener("pointerup",finish);
    tile.addEventListener("pointercancel",()=>{
      if(drag&&drag.idx===i){ if(drag.ghost) drag.ghost.remove(); tile.classList.remove("dragging"); drag=null; }
    });
    /* covers a plain tap, AND keyboard Enter/Space (which never fires the
       pointer events above at all) — one path for both input styles */
    tile.addEventListener("click",()=>{
      if(suppressClick){ suppressClick=false; return; }
      if(!api.running) return;
      armedIdx=armedIdx===i?null:i;
      paintArmed();
    });
  }

  function tryPlace(idx,r,c){
    if(filled[r][c]) return;
    const val=pool[idx];
    const target=tmaCellVal(rowH,colH,r,c);
    const cellEl=cellEls[r*3+c];
    const rect=cellEl.getBoundingClientRect();
    const px=rect.left+rect.width/2, py=rect.top;
    if(tmaClose(val,target)){
      filled[r][c]=true;
      paintCells();   // show this cell as filled right away, independent of any clear below
      const rowFull=filled[r].every(Boolean);
      const colFull=[0,1,2].every(rr=>filled[rr][c]);
      if(rowFull||colFull){
        const dual=rowFull&&colFull;
        const flashEls=new Set();
        if(rowFull) for(let cc=0;cc<3;cc++) flashEls.add(cellEls[r*3+cc]);
        if(colFull) for(let rr=0;rr<3;rr++) flashEls.add(cellEls[rr*3+c]);
        flashEls.forEach(el=>el.classList.add("clearing"));
        setTimeout(()=>{
          flashEls.forEach(el=>el.classList.remove("clearing"));
          if(dual){
            for(let cc=0;cc<3;cc++) filled[r][cc]=false;
            for(let rr=0;rr<3;rr++) filled[rr][c]=false;
            rowH[r]=tmaNewRowHeader(api.hard,[rowH[(r+1)%3],rowH[(r+2)%3],rowH[r]]);
            colH[c]=tmaNewColHeader([colH[(c+1)%3],colH[(c+2)%3],colH[c]]);
          }else if(rowFull){
            for(let cc=0;cc<3;cc++) filled[r][cc]=false;
            rowH[r]=tmaNewRowHeader(api.hard,[rowH[(r+1)%3],rowH[(r+2)%3],rowH[r]]);
          }else{
            for(let rr=0;rr<3;rr++) filled[rr][c]=false;
            colH[c]=tmaNewColHeader([colH[(c+1)%3],colH[(c+2)%3],colH[c]]);
          }
          pool[idx]=tmaGenDistractor(rowH,colH,filled,pool);
          tmaTopUp(pool,rowH,colH,filled);
          paintHeaders(); paintCells(); buildTray();
        },TMA_CLEAR_MS);
        const got=api.award(dual?TMA_DUAL:TMA_LINE);
        api.addTime(dual?TMA_DUAL_TIME:TMA_LINE_TIME);
        api.pop(px,py,"+"+got,"var(--c1)");
        if(dual){ api.pop(px,py-30,t("tmaBonus3s"),"var(--c2)"); sfxBlue(); }
        else sfxGold();
      }else{
        pool[idx]=tmaGenDistractor(rowH,colH,filled,pool);
        tmaTopUp(pool,rowH,colH,filled);
        buildTray();
        sfxGold();
      }
    }else{
      api.penalise(TMA_MISS);
      api.pop(px,py,"-"+TMA_MISS,"var(--red)");
      sfxWrong();
      cellEl.classList.add("wrong");
      setTimeout(()=>cellEl.classList.remove("wrong"),350);
    }
    armedIdx=null; paintArmed();
  }

  const api=arcadeShell(stage,{
    how:"arcHowTma",
    key:"tma",
    diffNote:"tmaDiffNote",
    rules:[["var(--c1)","ruleTmaLine"],["var(--c2)","ruleTmaDual"],["var(--red)","ruleTmaMiss"]],
    clockMs:TMA_CLOCK,
    reset(){
      rowH=tmaNewRowHeaders(api.hard);
      colH=tmaNewColHeaders();
      filled=[[false,false,false],[false,false,false],[false,false,false]];
      pool=tmaGenPool(rowH,colH,filled);
      armedIdx=null;
      buildBoard(); paintHeaders(); paintCells(); buildTray();
    },
    cleanup(){ if(drag&&drag.ghost) drag.ghost.remove(); drag=null; },
    frame(){}
  });
}

export default {
  games:[
    {id:"bench", name:"gTmBench", blurb:"gTmBenchP", render:renderBench},
    {id:"fact",  name:"gFact",  blurb:"gFactP",  render:renderMissingFactor, full:true},
    {id:"venn",  name:"gVenn",  blurb:"gVennP",  render:renderVenn,          full:true},
    {id:"arc",   name:"gArc",  blurb:"gArcP",   render:renderTimesArcade,    full:true, rainbow:true}
  ]
};
