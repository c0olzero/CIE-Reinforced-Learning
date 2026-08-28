/* Workbench — Data Lab — sort it, chart it, read it back
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Ss.01, 4Ss.02, 4Ss.03 */

import {h, rand, pickOptions, SVGNS, pending} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions, foldlessHud} from "../../../engine/ui.js";
import {sfxGold, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./data.strings.js";
addStrings(STRINGS);

/* ============================================================
   DATA LAB — Cambridge Primary Stage 4

   4Ss.01 plan and conduct an investigation to answer statistical questions,
           considering what data to collect (categorical and discrete data)
   4Ss.02 record, organise and represent categorical/discrete data, choosing
           the representation: Venn/Carroll diagrams, tally charts &
           frequency tables, pictograms & bar charts, dot plots
   4Ss.03 interpret data — similarities and variation within and between
           data sets — and discuss conclusions
   ============================================================ */

const SHAPES=["circle","square","triangle","star"];
/* a fixed shape->colour mapping so a category reads the same way everywhere
   in this module (Sort It's items, Chart Bench's bars, the quiz's charts) */
const SHAPE_COLOR={circle:"c3", square:"c4", triangle:"c5", star:"c0"};
const PALETTE=["c0","c1","c2","c3","c4","c5"];

function svgEl(tag,attrs){
  const el=document.createElementNS(SVGNS,tag);
  if(attrs) for(const k in attrs) el.setAttribute(k,attrs[k]);
  return el;
}
function starPoints(cx,cy,outerR,innerR,n){
  const pts=[];
  for(let i=0;i<n*2;i++){
    const r=i%2===0?outerR:innerR;
    const a=(Math.PI/n)*i-Math.PI/2;
    pts.push((cx+r*Math.cos(a)).toFixed(2)+","+(cy+r*Math.sin(a)).toFixed(2));
  }
  return pts.join(" ");
}
function shapeIcon(shape,color,size){
  const svg=svgEl("svg",{viewBox:"0 0 24 24",class:"dl-icon"});
  svg.style.width=size+"px"; svg.style.height=size+"px";
  const fill="var(--"+color+")";
  if(shape==="circle") svg.appendChild(svgEl("circle",{cx:12,cy:12,r:10,fill}));
  else if(shape==="square") svg.appendChild(svgEl("rect",{x:2,y:2,width:20,height:20,rx:3,fill}));
  else if(shape==="triangle") svg.appendChild(svgEl("polygon",{points:"12,2 22,21 2,21",fill}));
  else svg.appendChild(svgEl("polygon",{points:starPoints(12,12,10,4,5),fill}));
  return svg;
}
function dlRandInt(lo,hi){ return lo+Math.floor(Math.random()*(hi-lo+1)); }
function dlShuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

/* a plain coloured tile with the digit on it — Sort It's number domain */
function numberIcon(value,color,size){
  const el=h("div","dl-numicon",String(value));
  el.style.width=size+"px"; el.style.height=size+"px";
  el.style.background="var(--"+color+")";
  el.style.fontSize=Math.round(size*0.46)+"px";
  return el;
}
/* four side-view vehicle silhouettes, one per {2/4 wheels} x {engine/no
   engine} quadrant — car and wagon share a low wide body, so the cabin on
   the car's roof (wagon has none) is what actually tells them apart, not
   just the wheel count which the axis label already states */
function vehicleIcon(type,color,size){
  const svg=svgEl("svg",{viewBox:"0 0 32 24",class:"dl-icon"});
  svg.style.width=size+"px"; svg.style.height=size+"px";
  const fill="var(--"+color+")", ink="var(--ink)";
  function wheel(cx){ return svgEl("circle",{cx,cy:20,r:3,fill:ink}); }
  if(type==="car"){
    svg.append(
      svgEl("rect",{x:8,y:4,width:13,height:8,rx:2,fill}),
      svgEl("rect",{x:2,y:11,width:24,height:7,rx:2,fill}),
      wheel(9),wheel(23));
  }else if(type==="wagon"){
    svg.append(
      svgEl("path",{d:"M4 10 L28 10 L25 17 L7 17 Z",fill}),
      wheel(9),wheel(23),
      svgEl("line",{x1:4,y1:13,x2:0,y2:16,stroke:ink,"stroke-width":2,"stroke-linecap":"round"}));
  }else if(type==="motorbike"){
    // a bare frame reads as a bicycle no matter how it's bent, so the
    // motor itself has to be drawn — a solid engine block low between the
    // wheels, the one shape a bicycle icon never has
    svg.append(
      svgEl("circle",{cx:6,cy:19,r:4,fill:"none",stroke:fill,"stroke-width":2.2}),
      svgEl("circle",{cx:25,cy:19,r:4,fill:"none",stroke:fill,"stroke-width":2.2}),
      svgEl("polyline",{points:"6,19 13,8 20,8 25,19",fill:"none",stroke:fill,
        "stroke-width":2.2,"stroke-linecap":"round","stroke-linejoin":"round"}),
      svgEl("rect",{x:11,y:6,width:7,height:2.5,rx:1,fill}),
      svgEl("rect",{x:11,y:14,width:9,height:6,rx:1.5,fill:ink}));
  }else{ // bicycle
    svg.append(
      svgEl("circle",{cx:6,cy:19,r:4,fill:"none",stroke:fill,"stroke-width":1.8}),
      svgEl("circle",{cx:25,cy:19,r:4,fill:"none",stroke:fill,"stroke-width":1.8}),
      svgEl("polyline",{points:"6,19 15,10 25,19",fill:"none",stroke:fill,
        "stroke-width":1.8,"stroke-linecap":"round","stroke-linejoin":"round"}),
      svgEl("line",{x1:15,y1:10,x2:15,y2:6,stroke:fill,"stroke-width":1.8,"stroke-linecap":"round"}));
  }
  return svg;
}
function dlIcon(item,size){
  if(item.kind==="number") return numberIcon(item.value,item.color,size);
  if(item.kind==="vehicle") return vehicleIcon(item.type,item.color,size);
  return shapeIcon(item.shape,item.color,size);
}

/* ---------- tab 1 — Sort It (4Ss.02 Venn/Carroll; touches 4Ss.01's
   "categorical data") ---------- */
/* a 10-ish item pool with two INDEPENDENT boolean properties, stratified
   2-3 per quadrant, so every region of both a Venn and a Carroll diagram
   always has something in it — an empty region would be a broken example
   of either diagram, not just a boring one. `makeItem(aYes,bYes)` is
   supplied by each domain below. */
function dlStratifiedPool(makeItem){
  const items=[];
  function addN(n,a,b){ for(let i=0;i<n;i++) items.push(makeItem(a,b)); }
  addN(dlRandInt(2,3), true, true);
  addN(dlRandInt(2,3), true, false);
  addN(dlRandInt(2,3), false, true);
  addN(dlRandInt(2,3), false, false);
  return dlShuffle(items);
}
/* Three domains to sort — one geometric, one pure-number, one real-world —
   so "sort by two properties" reads as a general skill, not a shapes-only
   trick. Every domain returns the same shape: {pool, isA, isB, labelA,
   labelB}, so the rest of Sort It never needs to know which one is active. */
function dlShapesRound(){
  const shapeProp=rand(SHAPES), otherShapes=SHAPES.filter(s=>s!==shapeProp);
  const colorProp=rand(PALETTE), otherColors=PALETTE.filter(c=>c!==colorProp);
  const pool=dlStratifiedPool((aYes,bYes)=>({
    kind:"shape",
    shape: aYes?shapeProp:rand(otherShapes),
    color: bYes?colorProp:rand(otherColors)
  }));
  return {
    pool,
    isA:item=>item.shape===shapeProp,
    isB:item=>item.color===colorProp,
    labelA:t("dlPropShape")(t("shName")[shapeProp]),
    labelB:t("dlPropColor")(t("cName")[colorProp])
  };
}
const NUM_RANGE=30;
const NUM_PROPS=[
  {id:"odd", pred:n=>n%2===1, key:"numOdd"},
  {id:"mult3", pred:n=>n%3===0, key:"numMult3"},
  {id:"mult5", pred:n=>n%5===0, key:"numMult5"},
  {id:"gt10", pred:n=>n>10, key:"numGt10"}
];
function dlNumbersRound(){
  const [propA,propB]=dlShuffle([...NUM_PROPS]).slice(0,2);
  function pick(aYes,bYes){
    const candidates=[];
    for(let n=1;n<=NUM_RANGE;n++) if(propA.pred(n)===aYes && propB.pred(n)===bYes) candidates.push(n);
    return {kind:"number", value:rand(candidates), color:rand(PALETTE)};
  }
  const pool=dlStratifiedPool((aYes,bYes)=>pick(aYes,bYes));
  return {
    pool,
    isA:item=>propA.pred(item.value),
    isB:item=>propB.pred(item.value),
    labelA:t(propA.key),
    labelB:t(propB.key)
  };
}
const VEHICLES=[
  {id:"car", wheels:4, engine:true},
  {id:"motorbike", wheels:2, engine:true},
  {id:"bicycle", wheels:2, engine:false},
  {id:"wagon", wheels:4, engine:false}
];
function dlVehiclesRound(){
  function pick(aYes,bYes){
    const wheels=aYes?2:4;
    const candidates=VEHICLES.filter(v=>v.wheels===wheels && v.engine===bYes);
    return {kind:"vehicle", type:rand(candidates).id, color:rand(PALETTE)};
  }
  const pool=dlStratifiedPool((aYes,bYes)=>pick(aYes,bYes));
  return {
    pool,
    isA:item=>VEHICLES.find(v=>v.id===item.type).wheels===2,
    isB:item=>VEHICLES.find(v=>v.id===item.type).engine===true,
    labelA:t("dlPropWheels"),
    labelB:t("dlPropEngine")
  };
}
const DOMAIN_MAKERS={shapes:dlShapesRound, numbers:dlNumbersRound, vehicles:dlVehiclesRound};
const DOMAIN_IDS=Object.keys(DOMAIN_MAKERS);
function dlPickDomain(avoidId){
  let id; do{ id=rand(DOMAIN_IDS); }while(id===avoidId);
  return id;
}

function renderSort(side,stage){
  const wrap=h("div","dl-wrap bench"), stack=h("div","dl-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  stack.appendChild(h("div","pv-note",t("dlSortHelp")));

  const modeBar=h("div","dl-btnrow");
  const vennBtn=h("button","dl-btn",t("dlModeVenn"));
  const carrollBtn=h("button","dl-btn",t("dlModeCarroll"));
  modeBar.append(vennBtn,carrollBtn);

  const diagramBox=h("div","dl-diagrambox");
  const tray=h("div","dl-tray");
  const msg=h("div","dl-msg");
  const btnRow2=h("div","dl-btnrow");
  const newBtn=h("button","dl-btn",t("dlNewRound"));
  btnRow2.appendChild(newBtn);

  stack.append(modeBar,diagramBox,tray,msg,btnRow2);

  let mode="carroll", domainId=null, pool=[], isA=()=>false, isB=()=>false, labelA="", labelB="";
  let armedIdx=null, itemEls=[], placed=[], hoverZoneEl=null, currentGhost=null;
  pending.push(()=>{ if(currentGhost){ currentGhost.remove(); currentGhost=null; } });

  function setModeActive(){
    vennBtn.classList.toggle("active",mode==="venn");
    carrollBtn.classList.toggle("active",mode==="carroll");
  }
  function regionOk(item,zone){
    const a=isA(item), b=isB(item);
    if(zone==="both") return a&&b;
    if(zone==="left") return a&&!b;
    if(zone==="right") return !a&&b;
    return !a&&!b;
  }
  /* neutral highlight only — which zone lit up under a drag must never hint
     right/wrong, so it's the same style regardless of which zone it is */
  function setHoverZone(zoneEl){
    if(zoneEl===hoverZoneEl) return;
    if(hoverZoneEl) hoverZoneEl.classList.remove("drag-over");
    hoverZoneEl=zoneEl;
    if(hoverZoneEl) hoverZoneEl.classList.add("drag-over");
  }
  function zoneBtn(zone,cls,slotCls){
    const btn=document.createElement("button");
    btn.className="dl-zone "+cls;
    btn.dataset.zone=zone;
    btn.appendChild(h("div","dl-zoneslots"+(slotCls?" "+slotCls:"")));
    btn.addEventListener("click",()=>{ if(armedIdx!=null) tryPlace(armedIdx,zone); });
    return btn;
  }
  function buildVenn(){
    const box=h("div","dl-venn");
    const cLeft=h("div","dl-circle dl-c-left");
    const cRight=h("div","dl-circle dl-c-right");
    const tLeft=h("div","dl-vtitle dl-vt-left",labelA);
    const tRight=h("div","dl-vtitle dl-vt-right",labelB);
    const outLbl=h("div","dl-outlbl",t("dlOutside"));
    box.append(zoneBtn("outside","dl-z-outside","dl-zoneslots-outside"),cLeft,cRight,
      zoneBtn("left","dl-z-left"),zoneBtn("both","dl-z-both"),zoneBtn("right","dl-z-right"),
      tLeft,tRight,outLbl);
    diagramBox.appendChild(box);
  }
  /* row = property A, column = property B (must match regionOk's mapping):
     a plain caption line can't show two independent yes/no axes at once,
     so each property gets its own labelled axis, like a real Carroll grid */
  function buildCarroll(){
    const outer=h("div","dl-carrollouter");
    const rowLabel=h("div","dl-rowaxislabel",labelA);
    const inner=h("div","dl-carrollinner");
    const colLabel=h("div","dl-colaxislabel",labelB);
    const grid=h("div","dl-carroll");
    grid.append(
      h("div","dl-cnr"), h("div","dl-chead",t("dlYes")), h("div","dl-chead",t("dlNo")),
      h("div","dl-rhead",t("dlYes")), zoneBtn("both","dl-cz"), zoneBtn("left","dl-cz"),
      h("div","dl-rhead",t("dlNo")), zoneBtn("right","dl-cz"), zoneBtn("outside","dl-cz")
    );
    inner.append(colLabel,grid);
    outer.append(rowLabel,inner);
    diagramBox.appendChild(outer);
  }
  function buildDiagram(){
    diagramBox.innerHTML="";
    if(mode==="venn") buildVenn(); else buildCarroll();
  }
  function paintArmed(){ itemEls.forEach((el,i)=>el.classList.toggle("armed",i===armedIdx)); }
  function tryPlace(i,zone){
    if(placed[i]) return;
    if(!regionOk(pool[i],zone)){
      itemEls[i].classList.add("shake");
      sfxWrong();
      setTimeout(()=>itemEls[i]&&itemEls[i].classList.remove("shake"),400);
      armedIdx=null; paintArmed();
      return;
    }
    sfxGold();
    const slotsEl=diagramBox.querySelector('[data-zone="'+zone+'"] .dl-zoneslots');
    const slot=document.createElement("button");
    slot.className="dl-placed";
    slot.appendChild(dlIcon(pool[i],26));
    // captures `slot` directly rather than searching the DOM back for it —
    // simpler and can't drift out of sync with what was actually appended
    slot.addEventListener("click",()=>{ slot.remove(); unplace(i); });
    slotsEl.appendChild(slot);
    placed[i]=zone;
    itemEls[i].style.display="none";
    armedIdx=null; paintArmed();
    if(placed.every(p=>p!==null)) msg.textContent=t("dlAllSorted");
  }
  function unplace(i){
    placed[i]=null;
    itemEls[i].style.display="";
    msg.textContent="";
  }
  /* real drag (pointer events + a ghost icon that follows the pointer,
     dropped onto whatever zone is under the release point) alongside the
     original tap-to-arm-then-tap-target flow — a plain click still fires
     after a non-dragged tap, so both paths share tryPlace/armedIdx */
  function wireItem(btn,i){
    btn.style.touchAction="none";
    let drag=null, suppressClick=false;
    btn.addEventListener("pointerdown",e=>{
      if(placed[i]) return;
      drag={startX:e.clientX,startY:e.clientY,moved:false,pid:e.pointerId};
      btn.setPointerCapture(e.pointerId);
    });
    btn.addEventListener("pointermove",e=>{
      if(!drag) return;
      const dx=e.clientX-drag.startX, dy=e.clientY-drag.startY;
      if(!drag.moved && Math.hypot(dx,dy)>8){
        drag.moved=true;
        currentGhost=h("div","dl-ghost");
        currentGhost.appendChild(dlIcon(pool[i],32));
        document.body.appendChild(currentGhost);
        btn.classList.add("dragging");
      }
      if(drag.moved){
        currentGhost.style.left=e.clientX+"px";
        currentGhost.style.top=e.clientY+"px";
        const under=document.elementFromPoint(e.clientX,e.clientY);
        setHoverZone(under&&under.closest(".dl-zone,.dl-cz"));
      }
    });
    const finish=e=>{
      if(!drag) return;
      btn.releasePointerCapture(drag.pid);
      btn.classList.remove("dragging");
      if(drag.moved){
        suppressClick=true;   // the browser still fires a click right after this — ignore it
        if(currentGhost){ currentGhost.remove(); currentGhost=null; }
        const under=document.elementFromPoint(e.clientX,e.clientY);
        const zoneEl=under&&under.closest(".dl-zone,.dl-cz");
        setHoverZone(null);
        if(zoneEl) tryPlace(i,zoneEl.dataset.zone);
      }
      drag=null;
    };
    btn.addEventListener("pointerup",finish);
    btn.addEventListener("pointercancel",()=>{
      if(drag){
        if(currentGhost){ currentGhost.remove(); currentGhost=null; }
        btn.classList.remove("dragging"); setHoverZone(null); drag=null;
      }
    });
    /* covers a plain tap, AND keyboard Enter/Space (which never fires the
       pointer events above at all) — one path for both input styles */
    btn.addEventListener("click",()=>{
      if(suppressClick){ suppressClick=false; return; }
      if(placed[i]) return;
      armedIdx=armedIdx===i?null:i;
      paintArmed();
    });
  }
  function buildPool(){
    domainId=dlPickDomain(domainId);
    const gen=DOMAIN_MAKERS[domainId]();
    pool=gen.pool; isA=gen.isA; isB=gen.isB; labelA=gen.labelA; labelB=gen.labelB;
    placed=pool.map(()=>null);
    armedIdx=null;
    msg.textContent="";
    buildDiagram();
    tray.innerHTML=""; itemEls=[];
    pool.forEach((item,i)=>{
      const btn=document.createElement("button");
      btn.className="dl-item";
      btn.appendChild(dlIcon(item,32));
      wireItem(btn,i);
      tray.appendChild(btn);
      itemEls.push(btn);
    });
  }

  vennBtn.onclick=()=>{ mode="venn"; setModeActive(); buildPool(); };
  carrollBtn.onclick=()=>{ mode="carroll"; setModeActive(); buildPool(); };
  newBtn.onclick=buildPool;

  setModeActive();
  buildPool();
}

/* ---------- tab 2 — Chart Bench (4Ss.02: same data, different picture)
   ---------- */
/* 4 distinct counts drawn without replacement from a small range — ties
   would make "which is most" genuinely ambiguous, so this rules them out
   by construction instead of rejecting and re-rolling */
function dlMakeDataset(){
  const pool=dlShuffle([2,3,4,5,6,7,8,9]);
  return SHAPES.map((shape,i)=>({shape,count:pool[i]}));
}
function dlNiceStep(max){
  if(max<=5) return 1;
  if(max<=10) return 2;
  return Math.ceil(max/5);
}
function dlViewTally(dataset){
  const wrap=h("div","dl-tallywrap");
  dataset.forEach(d=>{
    const row=h("div","dl-tallyrow");
    const label=h("div","dl-rowlabel"); label.appendChild(shapeIcon(d.shape,SHAPE_COLOR[d.shape],26));
    const marks=h("div","dl-marks");
    let remaining=d.count;
    while(remaining>0){
      const groupSize=Math.min(5,remaining);
      const group=h("div","dl-tgroup"+(groupSize===5?" full":""));
      for(let i=0;i<groupSize;i++) group.appendChild(h("span","dl-tmark"));
      marks.appendChild(group);
      remaining-=groupSize;
    }
    row.append(label,marks,h("div","dl-tnum",String(d.count)));
    wrap.appendChild(row);
  });
  return wrap;
}
function dlViewPicto(dataset){
  const wrap=h("div","dl-pictowrap");
  dataset.forEach(d=>{
    const row=h("div","dl-pictorow");
    const label=h("div","dl-rowlabel"); label.appendChild(shapeIcon(d.shape,SHAPE_COLOR[d.shape],26));
    const icons=h("div","dl-pictoicons");
    for(let i=0;i<d.count;i++) icons.appendChild(shapeIcon(d.shape,SHAPE_COLOR[d.shape],18));
    row.append(label,icons);
    wrap.appendChild(row);
  });
  const key=h("div","dl-key");
  key.append(t("dlKeyLbl")+" ");
  key.appendChild(shapeIcon("circle","c1",14));
  key.append(" "+t("dlKeyEquals"));
  wrap.appendChild(key);
  return wrap;
}
function dlViewBar(dataset,maxCount,plotWidth){
  const chartH=190;
  const plot=h("div","dl-barplot");
  plot.style.height=chartH+"px";
  plot.style.width=(plotWidth||420)+"px";
  const step=dlNiceStep(maxCount);
  for(let v=step; v<=maxCount+0.001; v+=step){
    const line=h("div","dl-gridline");
    line.style.bottom=(v/maxCount*chartH)+"px";
    line.appendChild(h("span","dl-gridlbl",String(v)));
    plot.appendChild(line);
  }
  const bars=h("div","dl-bars");
  dataset.forEach(d=>{
    const col=h("div","dl-barcol");
    const bar=h("div","dl-bar");
    bar.style.height=Math.max(2,d.count/maxCount*chartH)+"px";
    bar.style.background="var(--"+SHAPE_COLOR[d.shape]+")";
    bar.appendChild(h("div","dl-barval",String(d.count)));
    const lbl=h("div","dl-barlbl"); lbl.appendChild(shapeIcon(d.shape,SHAPE_COLOR[d.shape],20));
    col.append(bar,lbl);
    bars.appendChild(col);
  });
  plot.appendChild(bars);
  const wrap=h("div","dl-barwrap"); wrap.appendChild(plot);
  return wrap;
}
function dlViewDot(dataset,maxCount){
  const wrap=h("div","dl-dotwrap");
  dataset.forEach(d=>{
    const col=h("div","dl-dotcol");
    const dots=h("div","dl-dots");
    for(let i=0;i<d.count;i++){
      const dot=h("div","dl-dot");
      dot.style.background="var(--"+SHAPE_COLOR[d.shape]+")";
      dots.appendChild(dot);
    }
    const lbl=h("div","dl-dotlbl"); lbl.appendChild(shapeIcon(d.shape,SHAPE_COLOR[d.shape],20));
    col.append(dots,lbl);
    wrap.appendChild(col);
  });
  return wrap;
}

function renderChart(side,stage){
  const wrap=h("div","dl-wrap bench"), stack=h("div","dl-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  stack.appendChild(h("div","pv-note",t("dlChartHelp")));
  const chartBox=h("div","dl-chartslot");
  const btnRow=h("div","dl-btnrow");
  stack.append(chartBox,btnRow);

  const newBtn=h("button","dl-btn",t("dlNewData"));
  const tallyBtn=h("button","dl-btn",t("dlViewTally"));
  const pictoBtn=h("button","dl-btn",t("dlViewPicto"));
  const barBtn=h("button","dl-btn",t("dlViewBar"));
  const dotBtn=h("button","dl-btn",t("dlViewDot"));
  btnRow.append(newBtn,tallyBtn,pictoBtn,barBtn,dotBtn);

  let dataset=dlMakeDataset(), mode="tally";
  function setActive(btn){ [tallyBtn,pictoBtn,barBtn,dotBtn].forEach(b=>b.classList.toggle("active",b===btn)); }
  function render(){
    chartBox.innerHTML="";
    const maxCount=Math.max(...dataset.map(d=>d.count));
    const node = mode==="tally"?dlViewTally(dataset)
               : mode==="picto"?dlViewPicto(dataset)
               : mode==="bar"?dlViewBar(dataset,maxCount)
               : dlViewDot(dataset,maxCount);
    chartBox.appendChild(node);
  }
  newBtn.onclick=()=>{ dataset=dlMakeDataset(); render(); };
  tallyBtn.onclick=()=>{ mode="tally"; setActive(tallyBtn); render(); };
  pictoBtn.onclick=()=>{ mode="picto"; setActive(pictoBtn); render(); };
  barBtn.onclick=()=>{ mode="bar"; setActive(barBtn); render(); };
  dotBtn.onclick=()=>{ mode="dot"; setActive(dotBtn); render(); };

  setActive(tallyBtn); render();
}

/* ---------- tab 3 — Read the Data (4Ss.03: interpret, compare) ---------- */
function dlDiffOptions(diff,sum){
  const seen=new Set(), opts=[];
  [diff,sum,diff+1,diff>0?diff-1:diff+2].forEach(v=>{
    if(v>=0 && !seen.has(v)){ seen.add(v); opts.push(v); }
  });
  let pad=2;
  while(opts.length<4){ const v=diff+pad; if(!seen.has(v)){ seen.add(v); opts.push(v); } pad++; }
  return opts.sort((a,b)=>a-b);
}
function dlGenQuestion(){
  const type=rand(["most","least","howmany","diff","total","compare"]);

  if(type==="compare"){
    const datasetA=dlMakeDataset();
    let datasetB=dlMakeDataset();
    if(datasetA.map(d=>d.count).join()===datasetB.map(d=>d.count).join()) datasetB=dlMakeDataset();
    let bestShape=SHAPES[0], bestDiff=-1;
    SHAPES.forEach(s=>{
      const dd=Math.abs(datasetA.find(d=>d.shape===s).count - datasetB.find(d=>d.shape===s).count);
      if(dd>bestDiff){ bestDiff=dd; bestShape=s; }
    });
    const ca=datasetA.find(d=>d.shape===bestShape).count, cb=datasetB.find(d=>d.shape===bestShape).count;
    const name=t("shName")[bestShape];
    const answer=ca>cb?t("dlGroupA"):t("dlGroupB");
    const maxCount=Math.max(...datasetA.map(d=>d.count),...datasetB.map(d=>d.count));
    return { compare:true, datasetA, datasetB, maxCount,
      question:t("dlQCompare")(name), options:[t("dlGroupA"),t("dlGroupB")], answer,
      why:t("dlWhyCompare")(answer,name,ca,cb) };
  }

  const dataset=dlMakeDataset();
  const viewMode=rand(["bar","picto"]);

  if(type==="most"||type==="least"){
    const sorted=[...dataset].sort((a,b)=>type==="most"?b.count-a.count:a.count-b.count);
    const correct=sorted[0], correctName=t("shName")[correct.shape];
    const opts=dlShuffle(dataset.map(d=>t("shName")[d.shape]));
    return { dataset, viewMode, question:type==="most"?t("dlQMost"):t("dlQLeast"),
      options:opts, answer:correctName,
      why:type==="most"?t("dlWhyMost")(correctName,correct.count):t("dlWhyLeast")(correctName,correct.count) };
  }
  if(type==="howmany"){
    const target=rand(dataset), targetName=t("shName")[target.shape], ans=target.count;
    const opts=pickOptions(ans,Math.max(0,ans-4),ans+4,4,3).map(String);
    return { dataset, viewMode, question:t("dlQHowMany")(targetName),
      options:opts, answer:String(ans), why:t("dlWhyHowMany")(targetName,ans) };
  }
  if(type==="diff"){
    const [x,y]=dlShuffle([...dataset]).slice(0,2);
    const [big,small]=x.count>=y.count?[x,y]:[y,x];
    const diff=big.count-small.count, bigName=t("shName")[big.shape], smallName=t("shName")[small.shape];
    const opts=dlDiffOptions(diff,big.count+small.count).map(String);
    return { dataset, viewMode, question:t("dlQDiff")(bigName,smallName),
      options:opts, answer:String(diff),
      why:t("dlWhyDiff")(bigName,big.count,smallName,small.count,diff) };
  }
  // total
  const total=dataset.reduce((s,d)=>s+d.count,0);
  const opts=pickOptions(total,Math.max(0,total-6),total+6,4,4).map(String);
  return { dataset, viewMode, question:t("dlQTotal"),
    options:opts, answer:String(total),
    why:t("dlWhyTotal")(dataset.map(d=>d.count).join(" + "),total) };
}
function dlChartNode(cur){
  if(cur.compare){
    const row=h("div","dl-comparerow");
    const colA=h("div","dl-comparecol");
    colA.append(h("div","dl-comparelbl",t("dlGroupA")), dlViewBar(cur.datasetA,cur.maxCount,300));
    const colB=h("div","dl-comparecol");
    colB.append(h("div","dl-comparelbl",t("dlGroupB")), dlViewBar(cur.datasetB,cur.maxCount,300));
    row.append(colA,colB);
    return row;
  }
  const maxCount=Math.max(...cur.dataset.map(d=>d.count));
  return cur.viewMode==="bar"?dlViewBar(cur.dataset,maxCount):dlViewPicto(cur.dataset);
}
function renderQuiz(side,stage){
  foldlessHud(stage);
  const q=hudQuestion(stage,"");
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","dl-wrap"), stack=h("div","dl-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const chartSlot=h("div","dl-chartslot"); stack.appendChild(chartSlot);
  let cur,answered=false;

  function deal(){
    answered=false; act.hidden=false; act.innerHTML="";
    cur=dlGenQuestion();
    q.textContent=cur.question;
    chartSlot.innerHTML=""; chartSlot.appendChild(dlChartNode(cur));
    cur.options.forEach(v=>{
      const btn=h("button","abtn",v);
      btn.onclick=()=>answer(v);
      act.appendChild(btn);
    });
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=said===cur.answer;
    act.hidden=true;
    score.hit(ok);
    if(ok) sfxGold(); else sfxWrong();
    const proof=dlChartNode(cur);
    chartSlot.innerHTML="";   // avoid the original chart lingering behind the
                              // dim scrim next to the celebration's own copy
    celebrate(stage,ok,cur.why,deal,t("nextQ"),proof);
  }
  deal();
}

export default {
  games:[
    {id:"sort", name:"gDlSort", blurb:"gDlSortP", render:renderSort, full:true},
    {id:"chart", name:"gDlChart", blurb:"gDlChartP", render:renderChart, full:true},
    {id:"quiz", name:"gDlQuiz", blurb:"gDlQuizP", render:renderQuiz, full:true}
  ]
};
