/* Workbench — Perimeter & Area Lab — explore a shape, then measure one
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Gg.02, 4Gg.03, 4Gg.04 */

import {h, rand, pickOptions, SVGNS, pending} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions, foldlessHud} from "../../../engine/ui.js";
import {sfxGold, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./perimeter.strings.js";
addStrings(STRINGS);

/* ============================================================
   PERIMETER & AREA LAB — Cambridge Primary Stage 4

   4Gg.02 estimate and measure perimeter and area of 2D shapes,
           understanding that two areas can be added to find a compound shape's area
   4Gg.03 draw rectangles/squares on a grid, measure their perimeter and area,
           derive and use formulae to calculate area/perimeter of rectangles and squares
   4Gg.04 estimate the area of irregular shapes on a square grid (whole and part squares)
   ============================================================ */

/* a single square-grid cell renderer shared by the bench (a plain rectangle)
   and the quiz (an arbitrary set of occupied cells) — sized to fit within a
   fixed box so neither a 2x2 nor a 10x10 grid ever overflows its box */
function paCellPx(cols,rows,maxW,maxH,cap){
  return Math.max(14,Math.min(cap||46,Math.floor(Math.min(maxW/cols,maxH/rows))));
}
function paGridBox(cols,rows,cellPx){
  const box=h("div","pa-gridbox");
  box.style.width=(cellPx*cols)+"px";
  box.style.height=(cellPx*rows)+"px";
  return box;
}
function svgEl(tag,attrs){
  const el=document.createElementNS(SVGNS,tag);
  if(attrs) for(const k in attrs) el.setAttribute(k,attrs[k]);
  return el;
}
function paArea(cells){ return cells.size; }
function paPerimeter(cells){
  let p=0;
  cells.forEach(key=>{
    const [r,c]=key.split(",").map(Number);
    [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([nr,nc])=>{ if(!cells.has(nr+","+nc)) p++; });
  });
  return p;
}

/* ---------- tab 1 — Measurement Bench (4Gg.02, 4Gg.03) ---------- */
/* Four named shape templates, each a small set of axis-aligned rectangle
   "pieces" with their own colour — the Area button just paints each piece
   in its colour, making the "compound area = sum of parts" idea (4Gg.02)
   directly visible rather than only stated. The Perimeter button needs the
   TRUE outer boundary as an ordered ring of corners, not just its total
   length: every unit edge between an occupied cell and a non-occupied
   neighbour is a boundary edge; an edge shared by two occupied cells gets
   added from both sides in opposite directions and cancels out, leaving
   only the exterior ring — one algorithm that's correct for the rectangle,
   the L, the T and the C alike, with no shape-specific tracing logic. */
function paRandInt(lo,hi){ return lo+Math.floor(Math.random()*(hi-lo+1)); }
function paMakeRect(){
  const w=paRandInt(3,6), rows=paRandInt(3,5);
  return {kind:"rect", pieces:[{x:0,y:0,w,h:rows,color:"c4"}], cols:w, rows};
}
function paMakeL(){
  const w1=paRandInt(2,3), rows=paRandInt(3,4);
  const w2=paRandInt(1,2), h2=paRandInt(1,Math.min(2,rows-1));
  return {kind:"l", pieces:[
    {x:0,y:0,w:w1,h:rows,color:"c4"},
    {x:w1,y:0,w:w2,h:h2,color:"c3"}
  ], cols:w1+w2, rows};
}
function paMakeT(){
  const w1=paRandInt(2,3), rows=paRandInt(3,4);
  const w2=paRandInt(1,2), h2=Math.min(rows-1,paRandInt(1,2));
  const yOff=Math.floor((rows-h2)/2);
  return {kind:"t", pieces:[
    {x:0,y:0,w:w1,h:rows,color:"c4"},
    {x:w1,y:yOff,w:w2,h:h2,color:"c3"}
  ], cols:w1+w2, rows};
}
function paMakeC(){
  const cols=paRandInt(4,6), rows=paRandInt(4,5);
  const w1=paRandInt(2,Math.max(2,cols-2));
  return {kind:"c", pieces:[
    {x:0,y:0,w:cols,h:1,color:"c3"},
    {x:0,y:1,w:w1,h:rows-2,color:"c4"},
    {x:0,y:rows-1,w:cols,h:1,color:"c5"}
  ], cols, rows};
}
const PA_SHAPE_KINDS=["rect","l","t","c"];
const PA_SHAPE_MAKERS={rect:paMakeRect, l:paMakeL, t:paMakeT, c:paMakeC};
function paRandomShape(avoidKind){
  let kind; do{ kind=rand(PA_SHAPE_KINDS); }while(kind===avoidKind);
  return PA_SHAPE_MAKERS[kind]();
}
function paCellsFromPieces(pieces){
  const cells=new Set();
  pieces.forEach(p=>{ for(let r=0;r<p.h;r++) for(let c=0;c<p.w;c++) cells.add((p.y+r)+","+(p.x+c)); });
  return cells;
}
function paColorMap(pieces){
  const map=new Map();
  pieces.forEach(p=>{ for(let r=0;r<p.h;r++) for(let c=0;c<p.w;c++) map.set((p.y+r)+","+(p.x+c),p.color); });
  return map;
}
function paPieceIndexMap(pieces){
  const map=new Map();
  pieces.forEach((p,i)=>{ for(let r=0;r<p.h;r++) for(let c=0;c<p.w;c++) map.set((p.y+r)+","+(p.x+c),i); });
  return map;
}
function paStartVertex(cells){
  let minR=Infinity;
  cells.forEach(k=>{ const r=+k.split(",")[0]; if(r<minR) minR=r; });
  let minC=Infinity;
  cells.forEach(k=>{ const [r,c]=k.split(",").map(Number); if(r===minR&&c<minC) minC=c; });
  return [minC,minR];
}
function paBoundaryPath(cells){
  const edges=new Map();
  const key=(x1,y1,x2,y2)=>x1+","+y1+"|"+x2+","+y2;
  function addEdge(x1,y1,x2,y2){
    const revKey=key(x2,y2,x1,y1);
    if(edges.has(revKey)){ edges.delete(revKey); return; }
    edges.set(key(x1,y1,x2,y2),[x1,y1,x2,y2]);
  }
  cells.forEach(cellKey=>{
    const [r,c]=cellKey.split(",").map(Number);
    addEdge(c,r,c+1,r); addEdge(c+1,r,c+1,r+1); addEdge(c+1,r+1,c,r+1); addEdge(c,r+1,c,r);
  });
  const byStart=new Map();
  edges.forEach(([x1,y1,x2,y2])=>{ byStart.set(x1+","+y1,[x2,y2]); });
  const start=paStartVertex(cells);
  const path=[start];
  let cur=start;
  for(let guard=0; guard<edges.size+1; guard++){
    const next=byStart.get(cur[0]+","+cur[1]);
    if(!next || (next[0]===start[0] && next[1]===start[1])) break;
    path.push(next);
    cur=next;
  }
  return path;
}
function pathToD(path){
  if(!path.length) return "";
  return "M "+path.map(([x,y])=>x+" "+y).join(" L ")+" Z";
}
/* c1 (amber) is the shape's own plain fill colour, so it's excluded here —
   a segment drawn in it would vanish against the cells underneath it */
const PA_TRACE_COLORS=["c0","c2","c3","c4","c5"];
/* the boundary walk above is unit-edge by unit-edge; merge consecutive
   steps that keep the same direction into one real side of the shape, so
   "add up the length of each edge" means the actual sides (4 for a plain
   rectangle, more for an L/T/C), not a count of unit squares */
function paSegments(path){
  const full=path.concat([path[0]]);
  const segs=[];
  let start=full[0], dir=null;
  for(let i=1;i<full.length;i++){
    const cur=full[i], prev=full[i-1];
    const ndir=[cur[0]-prev[0],cur[1]-prev[1]];
    if(dir && (ndir[0]!==dir[0]||ndir[1]!==dir[1])){
      segs.push({x1:start[0],y1:start[1],x2:prev[0],y2:prev[1]});
      start=prev;
    }
    dir=ndir;
  }
  segs.push({x1:start[0],y1:start[1],x2:full[full.length-1][0],y2:full[full.length-1][1]});
  segs.forEach((s,i)=>{
    s.len=Math.abs(s.x2-s.x1)+Math.abs(s.y2-s.y1);
    s.color=PA_TRACE_COLORS[i%PA_TRACE_COLORS.length];
  });
  /* the last segment closes the loop back onto the first, so when the segment
     count is 1 more than a multiple of the palette size (every L-shape: always
     6 segments, 6%5===1) the wrap-around colour cycle hands them the same
     colour — the two sides then fuse into what reads as one edge right at
     the corner where they actually meet. Bump the last one off both of its
     real neighbours (the first segment, and the one before it) instead. */
  if(segs.length>1 && segs[segs.length-1].color===segs[0].color){
    const avoid=new Set([segs[0].color, segs[segs.length-2].color]);
    segs[segs.length-1].color=PA_TRACE_COLORS.find(c=>!avoid.has(c))||segs[segs.length-1].color;
  }
  return segs;
}

/* Shared between the Measurement Bench and the Shape Quiz's celebration
   proof, so "what the answer looked like" always matches "how you'd build
   it yourself" — one visual language for the whole module, not a plain
   quiz recap next to a colourful bench. */
function paSceneNode(shape,maxW,maxH,cap){
  const cells=paCellsFromPieces(shape.pieces);
  const boundary=paBoundaryPath(cells);
  const colorMap=paColorMap(shape.pieces);
  const pieceIndexMap=paPieceIndexMap(shape.pieces);
  const cellPx=paCellPx(shape.cols,shape.rows,maxW,maxH,cap);
  // no inter-cell gap: the SVG boundary/trace is drawn in the same unit-grid
  // coordinates as the cells (viewBox "0 0 cols rows" over a pxW x pxH box),
  // and that mapping is only exact when pxW/cols and pxH/rows are both
  // exactly cellPx — a gap here would make the two axes scale by slightly
  // different amounts, and the trace would drift off the real cell edges
  // (worst on a narrow shape, where one axis has far fewer gaps than the
  // other). The old cell-separator look now comes from a border per cell
  // instead of a gap between them.
  const pxW=cellPx*shape.cols;
  const pxH=cellPx*shape.rows;

  const rel=h("div","pa-rel");
  rel.style.width=pxW+"px"; rel.style.height=pxH+"px";
  const grid=h("div","pa-grid");
  grid.style.gridTemplateColumns="repeat("+shape.cols+","+cellPx+"px)";
  grid.style.gridTemplateRows="repeat("+shape.rows+","+cellPx+"px)";
  // every cell starts plain (amber) — Area lights its pieces up in turn,
  // Perimeter's trace draws over this same neutral grid
  const pieceCells=shape.pieces.map(()=>[]);
  for(let r=0;r<shape.rows;r++) for(let c=0;c<shape.cols;c++){
    const color=colorMap.get(r+","+c);
    const cell=h("div","pa-cell"+(color?"":" empty"));
    if(color){
      cell.style.background="var(--c1)";
      pieceCells[pieceIndexMap.get(r+","+c)].push(cell);
    }
    grid.appendChild(cell);
  }
  rel.appendChild(grid);

  const svg=svgEl("svg",{viewBox:"0 0 "+shape.cols+" "+shape.rows,class:"pa-svg"});
  svg.appendChild(svgEl("path",{d:pathToD(boundary),class:"pa-boundary"}));
  const dot=svgEl("circle",{cx:boundary[0][0],cy:boundary[0][1],r:"0.16",class:"pa-dot"});
  svg.appendChild(dot);
  rel.appendChild(svg);

  return {rel,svg,dot,boundary,pieceCells};
}
/* fills "LABEL   term + term + ... = total unit" into an existing .pa-eq
   node, each term coloured to match its piece (area) or traced segment
   (perimeter) — label, operators and total stay neutral so only the parts
   being summed pop out */
function paFillEq(eq,label,parts,total,unit){
  eq.innerHTML="";
  eq.append(label.toUpperCase()+"   ");
  parts.forEach((p,i)=>{
    if(i>0) eq.append(" + ");
    const span=h("span",null,p.text);
    span.style.color="var(--"+p.color+")";
    eq.appendChild(span);
  });
  eq.append(" = "+total+unit);
}
const paReduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
/* draws one side at a time — a straight run of length 5 takes 5x as long
   as one of length 1, so speed reads as "distance travelled", not "sides
   remaining". isValid() is checked every frame so a stale animation (the
   bench built a new shape, or the quiz moved to the next question) quietly
   stops instead of animating a detached or reused scene. `instant` skips
   the animation outright (the quiz's celebration draws the whole trace at
   once — waiting through a redraw on every question was more friction than
   payoff there, unlike the bench where tracing IS the point). */
function paAnimateTrace(segs,dot,svg,isValid,onDone,instant){
  if(paReduceMotion||instant){
    segs.forEach(s=>{
      const p=svgEl("path",{d:"M "+s.x1+" "+s.y1+" L "+s.x2+" "+s.y2,class:"pa-trace"});
      p.style.stroke="var(--"+s.color+")";
      svg.appendChild(p);
    });
    dot.setAttribute("cx",segs[0].x1); dot.setAttribute("cy",segs[0].y1);
    onDone();
    return;
  }
  const msPerUnit=70;
  let idx=0, segStart=null, curPath=null;
  function beginSegment(){
    const s=segs[idx];
    curPath=svgEl("path",{d:"M "+s.x1+" "+s.y1,class:"pa-trace"});
    curPath.style.stroke="var(--"+s.color+")";
    svg.appendChild(curPath);
    segStart=null;
  }
  beginSegment();
  function frame(now){
    if(!isValid()) return;
    if(segStart===null) segStart=now;
    const s=segs[idx];
    const dur=Math.max(60,s.len*msPerUnit);
    const frac=Math.min(1,(now-segStart)/dur);
    const x=s.x1+(s.x2-s.x1)*frac, y=s.y1+(s.y2-s.y1)*frac;
    dot.setAttribute("cx",x); dot.setAttribute("cy",y);
    curPath.setAttribute("d","M "+s.x1+" "+s.y1+" L "+x+" "+y);
    if(frac>=1){
      idx++;
      if(idx>=segs.length){ onDone(); return; }
      beginSegment();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
/* reveals one piece at a time, each blinking on-off-on-off-on before it
   settles lit — the same idea as the trace revealing one side at a time,
   but for "compound area = sum of its pieces" instead of "perimeter = sum
   of its sides" */
function paAnimateArea(pieceCells,pieces,isValid,onDone){
  if(paReduceMotion){
    pieceCells.forEach((cellsArr,i)=>cellsArr.forEach(cell=>{ cell.style.background="var(--"+pieces[i].color+")"; }));
    onDone();
    return;
  }
  const flashMs=80, flashesPerPiece=3;
  let pieceIdx=0, onCount=0, on=false, last=null;
  function paint(i,lit){
    pieceCells[i].forEach(cell=>{ cell.style.background="var(--"+(lit?pieces[i].color:"c1")+")"; });
  }
  function frame(now){
    if(!isValid()) return;
    if(last===null) last=now;
    if(now-last>=flashMs){
      last=now;
      on=!on;
      if(on){
        onCount++;
        paint(pieceIdx,true);
        if(onCount>=flashesPerPiece){
          pieceIdx++; onCount=0; on=false;
          if(pieceIdx>=pieceCells.length){ onDone(); return; }
        }
      }else{
        paint(pieceIdx,false);
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderBench(side,stage){
  const wrap=h("div","pa-wrap bench"), stack=h("div","pa-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  stack.appendChild(h("div","pv-note",t("paBenchHelp")));
  const stageBox=h("div","pa-gridwrap");
  const eq=h("div","pa-eq");
  const btnRow=h("div","pa-btnrow");
  stack.append(stageBox,eq,btnRow);

  const randBtn=h("button","pa-btn",t("paRandomize"));
  const perimBtn=h("button","pa-btn",t("paPerimLbl"));
  const areaBtn=h("button","pa-btn",t("paAreaLbl"));
  btnRow.append(randBtn,perimBtn,areaBtn);

  let shape=paRandomShape(), animId=0;
  pending.push(()=>{ animId++; });

  function setActive(btn){ [perimBtn,areaBtn].forEach(b=>b.classList.toggle("active",b===btn)); }

  function buildScene(){
    const myId=++animId;
    stageBox.innerHTML="";
    const {rel,svg,dot,boundary,pieceCells}=paSceneNode(shape,520,400,64);
    stageBox.appendChild(rel);
    return {boundary,dot,svg,pieceCells,myId};
  }

  function showPlain(){
    buildScene();
    eq.textContent="";
    setActive(null);
  }
  function showArea(){
    const {pieceCells,myId}=buildScene();
    setActive(areaBtn);
    eq.textContent="";
    paAnimateArea(pieceCells,shape.pieces,()=>myId===animId,()=>{
      const total=shape.pieces.reduce((s,p)=>s+p.w*p.h,0);
      paFillEq(eq,t("paAreaLbl"),shape.pieces.map(p=>({text:p.w+"×"+p.h,color:p.color})),total," cm²");
    });
  }
  function showPerimeter(){
    const {boundary,dot,svg,myId}=buildScene();
    setActive(perimBtn);
    eq.textContent="";
    const segs=paSegments(boundary);
    paAnimateTrace(segs,dot,svg,()=>myId===animId,()=>{
      const total=segs.reduce((s,x)=>s+x.len,0);
      paFillEq(eq,t("paPerimLbl"),segs.map(s=>({text:String(s.len),color:s.color})),total," cm");
    });
  }

  randBtn.onclick=()=>{ shape=paRandomShape(shape.kind); showPlain(); };
  perimBtn.onclick=showPerimeter;
  areaBtn.onclick=showArea;

  showPlain();
}

/* ---------- tab 2 — Shape Quiz (4Gg.02, 4Gg.04) ---------- */
/* A shape is a set of "r,c" occupied grid cells — a single rectangle, or two
   rectangles fused into an L/compound shape, so area is always "count the
   cells" (4Gg.04) and a compound shape's area is genuinely the sum of its
   two parts (4Gg.02). Perimeter reuses the same neighbour-counting method
   as the bench's boundary tracer would sum to — deliberately independent
   code, so a bug in one is unlikely to also be a bug in the other. */
function paGenShape(){
  const w1=1+Math.floor(Math.random()*4), h1=1+Math.floor(Math.random()*4);
  const cells=new Set();
  const pieces=[{x:0,y:0,w:w1,h:h1,color:"c4"}];
  for(let r=0;r<h1;r++) for(let c=0;c<w1;c++) cells.add(r+","+c);
  if(Math.random()<0.6){
    let w2=1+Math.floor(Math.random()*3), h2=1+Math.floor(Math.random()*3);
    if(rand(["right","bottom"])==="right"){
      // a second piece exactly as tall as the base piece leaves no gap —
      // it just completes a solid rectangle, not a genuine L/T notch, and
      // still got painted as if it were two separate pieces added together
      if(h2===h1) h2=h2>1?h2-1:h2+1;
      const rowSpan=Math.max(0,h1-h2);
      const off=Math.floor(Math.random()*(rowSpan+1));
      for(let r=0;r<h2;r++) for(let c=0;c<w2;c++) cells.add((off+r)+","+(w1+c));
      pieces.push({x:w1,y:off,w:w2,h:h2,color:"c3"});
    }else{
      if(w2===w1) w2=w2>1?w2-1:w2+1;
      const colSpan=Math.max(0,w1-w2);
      const off=Math.floor(Math.random()*(colSpan+1));
      for(let r=0;r<h2;r++) for(let c=0;c<w2;c++) cells.add((h1+r)+","+(off+c));
      pieces.push({x:off,y:h1,w:w2,h:h2,color:"c3"});
    }
  }
  return {cells,pieces};
}
function paBounds(cells){
  let maxR=0,maxC=0;
  cells.forEach(key=>{ const [r,c]=key.split(",").map(Number); maxR=Math.max(maxR,r); maxC=Math.max(maxC,c); });
  return {rows:maxR+1,cols:maxC+1};
}
function paShapeNode(cells){
  const {rows,cols}=paBounds(cells);
  const cellPx=paCellPx(cols,rows,340,260);
  const outline=h("div","pa-outline pa-shape");
  const grid=paGridBox(cols,rows,cellPx);
  grid.classList.add("pa-grid");
  grid.style.gridTemplateColumns="repeat("+cols+","+cellPx+"px)";
  grid.style.gridTemplateRows="repeat("+rows+","+cellPx+"px)";
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    grid.appendChild(h("div","pa-cell"+(cells.has(r+","+c)?"":" empty")));
  }
  outline.appendChild(grid);
  return outline;
}
function paOptions(ans,other){
  const set=new Set([ans]);
  if(other>0 && other!==ans) set.add(other);
  pickOptions(ans,Math.max(1,ans-8),ans+8,4,4).forEach(v=>{ if(set.size<4 && v>0) set.add(v); });
  let pad=1;
  while(set.size<4){ const v=ans+pad; if(v>0) set.add(v); pad++; }
  const arr=[...set];
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
function renderQuiz(side,stage){
  foldlessHud(stage);
  const q=hudQuestion(stage,"");
  const score=hudScore(stage);
  const act=hudActions(stage);
  const wrap=h("div","pa-wrap"), stack=h("div","pa-stack");
  wrap.appendChild(stack); stage.appendChild(wrap);
  const shapeSlot=h("div","pa-gridwrap"); stack.appendChild(shapeSlot);
  let cells,pieces,askPerim,ans,answered=false,animId=0;
  let lastCellKey=null, lastAskPerim=null, typeStreak=0;
  pending.push(()=>{ animId++; });

  function deal(){
    animId++;   // a still-running celebration proof from the last question
                // (an in-flight trace or area flash) has no scene left to
                // paint once the overlay closes — stop it, don't let it
                // keep ticking against a detached node
    answered=false; act.hidden=false; act.innerHTML="";
    let cellKey;
    do{
      ({cells,pieces}=paGenShape());
      cellKey=[...cells].sort().join("|");
    }while(cellKey===lastCellKey);
    lastCellKey=cellKey;
    // never ask the same measurement more than 3 times running — after 3,
    // the next question is forced to switch instead of a free 50/50 draw
    askPerim = typeStreak>=3 ? !lastAskPerim : Math.random()<0.5;
    typeStreak = askPerim===lastAskPerim ? typeStreak+1 : 1;
    lastAskPerim=askPerim;
    const area=paArea(cells), perim=paPerimeter(cells);
    ans=askPerim?perim:area;
    const other=askPerim?area:perim;
    q.textContent=askPerim?t("paQPerim"):t("paQArea");
    shapeSlot.innerHTML=""; shapeSlot.appendChild(paShapeNode(cells));
    const unit=askPerim?" cm":" cm²";
    paOptions(ans,other).forEach(v=>{
      const btn=h("button","abtn",v+unit);
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
    shapeSlot.innerHTML="";   // the celebration overlay shows its own copy of the
                              // shape — leaving the original in place behind the
                              // dim scrim let the two overlap into what looked
                              // like one wrong, gappy shape

    // the proof visual and its calculation are the same trace/flash + colour
    // -coded equation as the Measurement Bench, not a plain recap grid —
    // "here's the shape" becomes "here's how you'd measure it yourself"
    const myId=++animId;
    const {rows,cols}=paBounds(cells);
    const {rel,svg,dot,boundary,pieceCells}=paSceneNode({pieces,cols,rows},340,260,46);
    const proof=h("div","pa-gridwrap"); proof.appendChild(rel);
    const eqNode=h("div","pa-eq dim-eq");
    if(askPerim){
      const segs=paSegments(boundary);
      paAnimateTrace(segs,dot,svg,()=>myId===animId,()=>{
        const total=segs.reduce((s,x)=>s+x.len,0);
        paFillEq(eqNode,t("paPerimLbl"),segs.map(s=>({text:String(s.len),color:s.color})),total," cm");
      },true);
    }else{
      paAnimateArea(pieceCells,pieces,()=>myId===animId,()=>{
        const total=pieces.reduce((s,p)=>s+p.w*p.h,0);
        paFillEq(eqNode,t("paAreaLbl"),pieces.map(p=>({text:p.w+"×"+p.h,color:p.color})),total," cm²");
      });
    }
    celebrate(stage,ok,eqNode,deal,t("nextQ"),proof);
  }
  deal();
}

export default {
  games:[
    {id:"bench", name:"gPaBench", blurb:"gPaBenchP", render:renderBench, full:true},
    {id:"quiz",  name:"gPaQuiz",  blurb:"gPaQuizP",  render:renderQuiz, full:true}
  ]
};
