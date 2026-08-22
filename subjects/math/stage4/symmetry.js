/* Workbench — Symmetry Lab — spotting lines of symmetry on shapes and patterns
   Cambridge Primary Mathematics 0096, Stage 4. Objective: 4Gg.07 */

import {h, rand, SVGNS, observeSize, scraps} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions} from "../../../engine/ui.js";
import {arcadeShell} from "../../../engine/arcade.js";
import {sfxGold, sfxBlue, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./symmetry.strings.js";
addStrings(STRINGS);

/* ---------- symmetry maths ----------
   A shape is a set of filled cells on an N x N grid. Stage 4 (4Gg.07) asks
   for horizontal, vertical and diagonal lines only — never rotational
   symmetry, which doesn't arrive until Stage 6 (6Gg.08).

   A candidate line is a true line of symmetry exactly when every filled
   cell's reflection is also filled: reflection is a bijection of the grid,
   so that one-directional check is enough to prove the reflected set equals
   the original (same size, fully contained -> equal). */
const N=6;
const AXES=["h","v","d1","d2"];
const idx=(r,c)=>r*N+c;
const reflect={
  h:(r,c)=>[N-1-r,c],
  v:(r,c)=>[r,N-1-c],
  d1:(r,c)=>[c,r],
  d2:(r,c)=>[N-1-c,N-1-r]
};
/* filled cells with no mirror partner across an axis — empty exactly when
   that axis is a true line of symmetry, and otherwise doubles as the proof */
function orphans(cells,ax){
  const rf=reflect[ax], out=[];
  for(const k of cells){
    const r=Math.floor(k/N), c=k%N, [rr,cc]=rf(r,c);
    if(!cells.has(idx(rr,cc))) out.push(k);
  }
  return out;
}
/* the same idea, generalised from "filled or not" to "which of a few
   colours" — a pattern is symmetric about an axis exactly when every
   cell's reflection carries the same colour it does */
const PATTERN_COLORS=["var(--c1)","var(--c3)","var(--c5)"];
function patternOrphans(colors,ax){
  const rf=reflect[ax], out=[];
  for(let k=0;k<N*N;k++){
    const r=Math.floor(k/N), c=k%N, [rr,cc]=rf(r,c);
    if(colors[idx(rr,cc)]!==colors[k]) out.push(k);
  }
  return out;
}
/* build a colour for every cell. With a target axis, walk the grid and
   colour each still-blank cell together with its mirror partner, which
   guarantees that axis is a true line of symmetry by construction; with
   no target, every cell is independent, so the result is almost always
   asymmetric on all four. Either way the truth is only ever trusted once
   patternOrphans() has actually checked it. */
function randomPattern(axis){
  const colors=new Array(N*N).fill(null);
  const k3=()=>Math.floor(Math.random()*PATTERN_COLORS.length);
  if(axis){
    for(let r=0;r<N;r++) for(let c=0;c<N;c++){
      const k=idx(r,c); if(colors[k]!=null) continue;
      const col=k3(); colors[k]=col;
      const [rr,cc]=reflect[axis](r,c);
      colors[idx(rr,cc)]=col;
    }
  } else for(let k=0;k<N*N;k++) colors[k]=k3();
  return colors;
}
/* picks which candidate axis a round actually tests: the real thing 60%
   of the time (when one exists), otherwise a plausible near-miss — a
   true axis of a DIFFERENT orientation, which is exactly the classic
   mix-up this quiz is for */
function pickAxisFor(getOrphans){
  const trues=AXES.filter(a=>getOrphans(a).length===0);
  const falses=AXES.filter(a=>!trues.includes(a));
  const ax=(trues.length&&Math.random()<0.6) ? rand(trues) : rand(falses.length?falses:AXES);
  return {ax,n:getOrphans(ax).length};
}

function cellsFromRows(rows){
  const s=new Set();
  rows.forEach((row,r)=>{ [...row].forEach((ch,c)=>{ if(ch==="#") s.add(idx(r,c)); }); });
  return s;
}

/* Seven curated shapes spanning most symmetry counts a square grid allows —
   1 (on each axis in turn), 2 (horizontal+vertical) and 4 (all of them).
   Exactly three of four is impossible: any two reflections 45deg apart
   compose to a 90deg rotation, which forces the other two in as well.
   Verified with a throwaway script before wiring these in. */
const SHAPES=[
  {id:"ring",   name:"sRing",   rows:["......",".####.",".#..#.",".#..#.",".####.","......"]},
  {id:"cross",  name:"sCross",  rows:["..##..","..##..","######","######","..##..","..##.."]},
  {id:"rect",   name:"sRect",   rows:["......","......",".####.",".####.","......","......"]},
  {id:"triUp",  name:"sTriUp",  rows:["..##..",".####.","######","......","......","......"]},
  {id:"triSide",name:"sTriSide",rows:["..#...",".##...","###...","###...",".##...","..#..."]},
  {id:"stair1", name:"sStair1", rows:["#.....","##....",".##...","..##..","...##.","....##"]},
  {id:"stair2", name:"sStair2", rows:[".....#","....##","...##.","..##..",".##...","##...."]}
];
SHAPES.forEach(s=>{ s.cells=cellsFromRows(s.rows); });

/* three ways to draw the same underlying cell set — purely cosmetic, so
   the reflection maths above never has to know which one is on screen */
const STYLES=["block","line","dots"];

/* ---------- the board: sizes and clears the SVG, then hands off to
   whichever kind of round is live to paint its own picture into it ---------- */
class SymView{
  constructor(stage){
    this.stage=stage;
    this.svg=document.createElementNS(SVGNS,"svg");
    this.svg.setAttribute("class","symsvg");
    stage.appendChild(this.svg);
    this.paint=null;
    observeSize(stage,()=>this.draw());
  }
  geom(){
    const W=this.stage.clientWidth,H=this.stage.clientHeight;
    const S=Math.min(W,H)*0.68, cell=S/N;
    return {W,H,S,cell,x0:(W-S)/2,y0:(H-S)/2};
  }
  render(paintFn){ this.paint=paintFn; this.draw(); }
  draw(){
    const {W,H}=this.geom();
    if(!W||!H||!this.paint) return;
    const svg=this.svg;
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox","0 0 "+W+" "+H);
    this.paint();
  }
}

/* shared renderer: the live grid and the small static proof inside the
   celebration overlay both draw the exact same picture. `style` only
   changes how a filled cell is drawn — block (filled square), line
   (outline square) or dots (a dot at its centre) — never which cells
   count as filled, so the symmetry maths above is untouched by it. */
function drawBoard(svg,cells,lines,x0,y0,S,cell,style){
  const mk=(par,tag,at)=>{const e=document.createElementNS(SVGNS,tag);
    for(const k in at) e.setAttribute(k,at[k]); par.appendChild(e); return e;};
  const gGrid=document.createElementNS(SVGNS,"g");
  const gLines=document.createElementNS(SVGNS,"g");
  const gOrphan=document.createElementNS(SVGNS,"g");
  svg.append(gGrid,gLines,gOrphan);
  for(let r=0;r<N;r++) for(let c=0;c<N;c++){
    const on=cells.has(idx(r,c));
    const cls=style==="line" ? (on?" on-line":"") : (style==="dots" ? "" : (on?" on":""));
    mk(gGrid,"rect",{x:x0+c*cell+2,y:y0+r*cell+2,width:cell-4,height:cell-4,rx:4,
      class:"sym-cell"+cls});
    if(style==="dots"&&on)
      mk(gGrid,"circle",{cx:x0+c*cell+cell/2,cy:y0+r*cell+cell/2,r:cell*0.16,class:"sym-dot"});
  }
  const pad=cell*1.4;                  // a candidate line overhangs the grid, so it reads as a line, not an edge
  for(const ax of AXES){
    const state=lines[ax]; if(!state) continue;
    let x1,y1,x2,y2;
    if(ax==="h"){ x1=x0-pad; x2=x0+S+pad; y1=y2=y0+S/2; }
    else if(ax==="v"){ y1=y0-pad; y2=y0+S+pad; x1=x2=x0+S/2; }
    else if(ax==="d1"){ x1=x0-pad; y1=y0-pad; x2=x0+S+pad; y2=y0+S+pad; }
    else{ x1=x0+S+pad; y1=y0-pad; x2=x0-pad; y2=y0+S+pad; }
    const isTrue=orphans(cells,ax).length===0;
    const cls=state==="neutral" ? "sym-line-neutral" : (isTrue?"sym-line-yes":"sym-line-no");
    mk(gLines,"line",{x1,y1,x2,y2,class:"sym-line "+cls});
    if(state!=="neutral") for(const k of orphans(cells,ax)){
      const r=Math.floor(k/N), c=k%N;
      mk(gOrphan,"circle",{cx:x0+c*cell+cell/2,cy:y0+r*cell+cell/2,r:cell*0.22,class:"sym-orphan"});
    }
  }
}
function miniProof(cells,ax,style){
  const S=112, cell=S/N, pad=cell*1.4, box=S+pad*2;
  const svg=document.createElementNS(SVGNS,"svg");
  svg.setAttribute("width",box); svg.setAttribute("height",box);
  svg.setAttribute("viewBox","0 0 "+box+" "+box);
  svg.style.display="block"; svg.style.margin="0 auto";
  drawBoard(svg,cells,{[ax]:"on"},pad,pad,S,cell,style);
  return svg;
}

/* a fully-coloured grid: every cell always shows one of the palette
   colours, so it never needs the faint "empty cell" background */
function drawPattern(svg,colors,lines,x0,y0,S,cell){
  const mk=(par,tag,at)=>{const e=document.createElementNS(SVGNS,tag);
    for(const k in at) e.setAttribute(k,at[k]); par.appendChild(e); return e;};
  const gGrid=document.createElementNS(SVGNS,"g");
  const gLines=document.createElementNS(SVGNS,"g");
  const gOrphan=document.createElementNS(SVGNS,"g");
  svg.append(gGrid,gLines,gOrphan);
  for(let r=0;r<N;r++) for(let c=0;c<N;c++){
    const k=idx(r,c);
    mk(gGrid,"rect",{x:x0+c*cell+2,y:y0+r*cell+2,width:cell-4,height:cell-4,rx:4,
      class:"sym-cell",style:"fill:"+PATTERN_COLORS[colors[k]]+";stroke:rgba(223,233,227,.5)"});
  }
  const pad=cell*1.4;
  for(const ax of AXES){
    const state=lines[ax]; if(!state) continue;
    let x1,y1,x2,y2;
    if(ax==="h"){ x1=x0-pad; x2=x0+S+pad; y1=y2=y0+S/2; }
    else if(ax==="v"){ y1=y0-pad; y2=y0+S+pad; x1=x2=x0+S/2; }
    else if(ax==="d1"){ x1=x0-pad; y1=y0-pad; x2=x0+S+pad; y2=y0+S+pad; }
    else{ x1=x0+S+pad; y1=y0-pad; x2=x0-pad; y2=y0+S+pad; }
    const isTrue=patternOrphans(colors,ax).length===0;
    const cls=state==="neutral" ? "sym-line-neutral" : (isTrue?"sym-line-yes":"sym-line-no");
    mk(gLines,"line",{x1,y1,x2,y2,class:"sym-line "+cls});
    if(state!=="neutral") for(const k of patternOrphans(colors,ax)){
      const r=Math.floor(k/N), c=k%N;
      mk(gOrphan,"circle",{cx:x0+c*cell+cell/2,cy:y0+r*cell+cell/2,r:cell*0.22,class:"sym-orphan"});
    }
  }
}
function miniPatternProof(colors,ax){
  const S=112, cell=S/N, pad=cell*1.4, box=S+pad*2;
  const svg=document.createElementNS(SVGNS,"svg");
  svg.setAttribute("width",box); svg.setAttribute("height",box);
  svg.setAttribute("viewBox","0 0 "+box+" "+box);
  svg.style.display="block"; svg.style.margin="0 auto";
  drawPattern(svg,colors,{[ax]:"on"},pad,pad,S,cell);
  return svg;
}

/* ---------- game — Mirror It ----------
   An 11x11 point grid, so the two dashed green dividing lines run
   exactly through the middle row and column of points instead of
   between two of them. Those middle points sit ON the lines, which
   would make confusing shape vertices (which quadrant do they belong
   to? they don't move under one of the two reflections), so shapes
   are only ever built from each quadrant's own clean 5x5 corner —
   rows/cols 0-4 or 6-10, never row 5 or column 5.

   One quadrant holds a fixed, randomly generated irregular polygon
   (3-6 vertices from its own 5x5 corner, ordered by angle around
   their centroid so the outline never crosses itself — shapes here
   don't have to be regular at all). The player reconstructs its
   mirror image in each of the other three quadrants by tapping
   points in order: one quadrant reflects only the column (mirrored
   across the vertical line), one only the row (horizontal line), and
   the last reflects both (a half turn) — the same reflect-across-
   (N-1) maths as the rest of this module, which works unchanged for
   an odd-sized grid: reflecting index x around the middle point
   (N-1)/2 is still N-1-x. */
const MG_N=11;
const MG_QUADS=[
  {id:"tl", rh:0, ch:0}, {id:"tr", rh:0, ch:1},
  {id:"bl", rh:1, ch:0}, {id:"br", rh:1, ch:1}
];
const mgIdx=(r,c)=>r*MG_N+c;
const mgHalf=v=>v<5 ? 0 : (v>5 ? 1 : null);           // null = on a dividing line, not in any quadrant
function mgQuadOf(r,c){
  const rh=mgHalf(r), ch=mgHalf(c);
  if(rh===null||ch===null) return null;
  return MG_QUADS.find(q=>q.rh===rh&&q.ch===ch);
}
/* which mirror a quadrant is, relative to the one holding the seed shape */
function mgMode(quad,seedQuad){
  if(quad.rh===seedQuad.rh) return "v";
  if(quad.ch===seedQuad.ch) return "h";
  return "both";
}
function mgReflect(r,c,mode){
  if(mode==="v") return [r,MG_N-1-c];
  if(mode==="h") return [MG_N-1-r,c];
  return [MG_N-1-r,MG_N-1-c];
}
function mgShuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
function mgGenSeed(){
  const quad=rand(MG_QUADS);
  const k=3+Math.floor(Math.random()*4);           // 3-6 vertices
  const pool=[]; for(let r=0;r<5;r++) for(let c=0;c<5;c++) pool.push([r,c]);
  const chosen=mgShuffle(pool).slice(0,k);
  // sorting by angle around the centroid keeps the outline simple (no self-crossing)
  const ccx=chosen.reduce((s,p)=>s+p[1],0)/k, ccy=chosen.reduce((s,p)=>s+p[0],0)/k;
  chosen.sort((a,b)=>Math.atan2(a[0]-ccy,a[1]-ccx)-Math.atan2(b[0]-ccy,b[1]-ccx));
  const verts=chosen.map(([lr,lc])=>mgIdx(quad.rh*6+lr, quad.ch*6+lc));
  return {quad,verts};
}
function mgExpected(quad,seed){
  const mode=mgMode(quad,seed.quad);
  return new Set(seed.verts.map(k=>{ const r=Math.floor(k/MG_N), c=k%MG_N;
    const [rr,cc]=mgReflect(r,c,mode); return mgIdx(rr,cc); }));
}
function renderMirrorIt(side,stage){
  const svg=document.createElementNS(SVGNS,"svg");
  svg.setAttribute("class","symsvg");
  stage.appendChild(svg);
  const node=(tag,cls,at)=>{ const e=document.createElementNS(SVGNS,tag);
    if(cls) e.setAttribute("class",cls); for(const k in at) e.setAttribute(k,at[k]); svg.appendChild(e); return e; };

  hudQuestion(stage,t("mgHow"));
  const score=hudScore(stage);

  let geo=null, seed=null, quadState=null, celebrating=false, hover=null;
  function measure(){
    const W=stage.clientWidth,H=stage.clientHeight;
    const topReserve=132;                    // clears the instruction text, even wrapped to 3 lines
    const usableH=Math.max(160,H-topReserve);
    const S=Math.min(W*0.78,usableH*0.78);
    const spacing=S/(MG_N-1);
    geo={W,H,S,spacing,x0:(W-S)/2, y0:topReserve+(usableH-S)/2};
    svg.setAttribute("viewBox","0 0 "+W+" "+H);
  }
  function pt(r,c){ return [geo.x0+c*geo.spacing, geo.y0+r*geo.spacing]; }
  function polyPath(keys,closed){
    const pts=keys.map(k=>pt(Math.floor(k/MG_N),k%MG_N));
    return "M"+pts.map(p=>p[0].toFixed(2)+","+p[1].toFixed(2)).join(" L")+(closed?" Z":"");
  }
  function newRound(){
    celebrating=false; hover=null;
    seed=mgGenSeed();
    quadState={};
    MG_QUADS.forEach(q=>{ if(q.id!==seed.quad.id) quadState[q.id]={seq:[],done:false,correct:null}; });
    draw();
  }
  function draw(){
    if(!geo||!seed) return;
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const {x0,y0,S,spacing}=geo;
    const midC=x0+5*spacing, midR=y0+5*spacing, pad=spacing*0.8;
    node("line","mirror-axis",{x1:midC,y1:y0-pad,x2:midC,y2:y0+S+pad});
    node("line","mirror-axis",{x1:x0-pad,y1:midR,x2:x0+S+pad,y2:midR});
    for(let r=0;r<MG_N;r++) for(let c=0;c<MG_N;c++){
      const [x,y]=pt(r,c);
      node("circle","mirror-dot",{cx:x,cy:y,r:3.2});
    }
    if(hover){
      const quad=mgQuadOf(hover.r,hover.c);
      if(quad&&quad.id!==seed.quad.id){
        const [x,y]=pt(hover.r,hover.c);
        node("circle","mirror-hover",{cx:x,cy:y,r:8});
      }
    }
    node("path","mirror-seed",{d:polyPath(seed.verts,true)});
    seed.verts.forEach(k=>{ const [x,y]=pt(Math.floor(k/MG_N),k%MG_N);
      node("circle","mirror-seed-dot",{cx:x,cy:y,r:5}); });
    for(const qid in quadState){
      const st=quadState[qid];
      const cls=st.done ? (st.correct?"mirror-ok":"mirror-bad") : "mirror-live";
      if(st.seq.length>1) node("path",cls,{d:polyPath(st.seq,st.done)});
      st.seq.forEach(k=>{ const [x,y]=pt(Math.floor(k/MG_N),k%MG_N);
        node("circle",cls+"-dot",{cx:x,cy:y,r:5}); });
    }
  }
  observeSize(stage,()=>{ measure(); draw(); });
  measure(); newRound();

  function nearestPoint(clientX,clientY){
    const r0=stage.getBoundingClientRect();
    const x=clientX-r0.left, y=clientY-r0.top;
    const c=Math.round((x-geo.x0)/geo.spacing), r=Math.round((y-geo.y0)/geo.spacing);
    if(r<0||r>=MG_N||c<0||c>=MG_N) return null;
    const [px,py]=pt(r,c);
    if(Math.hypot(x-px,y-py)>geo.spacing*0.42) return null;
    return {r,c};
  }
  const allDone=()=>Object.values(quadState).every(s=>s.done&&s.correct);
  function registerClose(qid){
    const st=quadState[qid];
    const got=new Set(st.seq);
    const want=mgExpected(MG_QUADS.find(q=>q.id===qid),seed);
    const ok=got.size===want.size && [...got].every(k=>want.has(k));
    st.done=true; st.correct=ok;
    score.hit(ok);
    if(ok){
      sfxGold();
      if(allDone()){
        draw();
        celebrating=true;
        celebrate(stage,true,t("mgAllDone"),newRound,t("nextS"));
        return;
      }
    }else{
      sfxWrong();
      setTimeout(()=>{ st.seq=[]; st.done=false; st.correct=null; draw(); },700);
    }
    draw();
  }
  stage.addEventListener("pointermove",e=>{
    const p=nearestPoint(e.clientX,e.clientY);
    const nk=p?mgIdx(p.r,p.c):-1, hk=hover?mgIdx(hover.r,hover.c):-1;
    if(nk!==hk){ hover=p; draw(); }
  });
  stage.addEventListener("pointerleave",()=>{ if(hover){ hover=null; draw(); } });
  stage.addEventListener("pointerdown",e=>{
    if(celebrating||e.target.closest("button")) return;
    const p=nearestPoint(e.clientX,e.clientY); if(!p) return;
    const quad=mgQuadOf(p.r,p.c);
    if(!quad||quad.id===seed.quad.id) return;           // on a dividing line, or the fixed seed quadrant
    const st=quadState[quad.id];
    if(st.done) return;                                 // locked correct, or mid-flash on a miss
    const key=mgIdx(p.r,p.c);
    const pos=st.seq.indexOf(key);
    if(pos===-1){ st.seq.push(key); draw(); return; }
    if(pos===0&&st.seq.length>=2){ registerClose(quad.id); return; }  // closes the shape
    st.seq.splice(pos,1); draw();                        // toggle an already-picked point off
  });
}

/* ---------- game 1 — Line Lab ----------
   Regular polygons, drawn as line art on a dimmed 8x8 reference grid. A
   regular n-gon always has exactly n lines of symmetry, evenly spaced
   180/n degrees apart — true for every vertex-through-centre line (and,
   when n is even, every edge-midpoint-through-centre line too). Those
   n lines are highlighted automatically; nothing to toggle or test,
   because every one of them genuinely is a line of symmetry. Verified
   against hand-checked vertex/angle pairs before wiring in. */
/* each shape gets its own outline colour, paired with a symmetry-line
   colour picked for contrast against it — never the same hue */
const POLY_SHAPES=[
  {id:"square",  name:"sSquare",  n:4, theta0:45, outline:"var(--c3)", sym:"var(--c1)"},  // +45deg so it reads as an axis-aligned square...
  {id:"diamond", name:"sDiamond", n:4, theta0:0,  outline:"var(--c3)", sym:"var(--c1)"},  // ...not this, the same square point-up
  {id:"triangle",name:"sTriangle",n:3, theta0:0,  outline:"var(--c0)", sym:"var(--c2)"},
  {id:"pentagon",name:"sPentagon",n:5, theta0:0,  outline:"var(--c5)", sym:"var(--c4)"},
  {id:"hexagon", name:"sHexagon", n:6, theta0:0,  outline:"var(--c4)", sym:"var(--c1)"},
  {id:"heptagon",name:"sHeptagon",n:7, theta0:0,  outline:"var(--c2)", sym:"var(--c0)"},
  {id:"octagon", name:"sOctagon", n:8, theta0:0,  outline:"var(--c1)", sym:"var(--c3)"}
];
/* compass-style angle: 0deg points straight up, increasing clockwise —
   reads as "point-up" to a kid, unlike maths' counterclockwise-from-east */
function compassPoint(cx,cy,r,deg){
  const rad=deg*Math.PI/180;
  return [cx+r*Math.sin(rad), cy-r*Math.cos(rad)];
}
const polyVertexAngles=(n,theta0)=>Array.from({length:n},(_,k)=>theta0+k*360/n);
const polySymAngles   =(n,theta0)=>Array.from({length:n},(_,k)=>theta0+k*180/n);

/* the quiz tests a polygon against the same 4 fixed grid directions the
   Lab used to show as reference axes — true exactly when that direction
   is (mod 180deg) one of the shape's own n symmetry angles */
const CAND_DEG=[0,45,90,135];
function angleClose(a,b,eps){
  const d=(((a-b)%180)+180)%180;
  return d<(eps||0.5) || d>180-(eps||0.5);
}
function isPolySymAxis(shape,deg){
  return polySymAngles(shape.n,shape.theta0).some(a=>angleClose(a,deg));
}
/* dimmed reference grid + the shape's own outline — shared by the Lab
   (which then overlays every true line) and the quiz (which overlays
   just the one candidate line being tested) */
function drawPolyBase(svg,shape,W,H){
  const mk=(par,tag,at)=>{const e=document.createElementNS(SVGNS,tag);
    for(const k in at) e.setAttribute(k,at[k]); par.appendChild(e); return e;};
  const cx=W/2, cy=H/2, S=Math.min(W,H)*0.68, G=8, step=S/G;
  const x0=cx-S/2, y0=cy-S/2, pad=step*1.4;
  const gGrid=document.createElementNS(SVGNS,"g");
  svg.appendChild(gGrid);
  for(let i=0;i<=G;i++){
    mk(gGrid,"line",{x1:x0+i*step,y1:y0,x2:x0+i*step,y2:y0+S,class:"poly-grid"});
    mk(gGrid,"line",{x1:x0,y1:y0+i*step,x2:x0+S,y2:y0+i*step,class:"poly-grid"});
  }
  const {n,theta0,outline}=shape, R=S*0.42;
  const pts=polyVertexAngles(n,theta0).map(deg=>compassPoint(cx,cy,R,deg));
  mk(svg,"polygon",{points:pts.map(p=>p.join(",")).join(" "),class:"poly-shape",stroke:outline});
  return {mk,cx,cy,S,pad};
}
/* draws a polygon plus (at most) one candidate line — the quiz only ever
   tests one at a time, unlike the Lab which shows every true line at once */
function drawPoly(svg,shape,ax,state,W,H){
  const {mk,cx,cy,S,pad}=drawPolyBase(svg,shape,W,H);
  if(state){
    const isTrue=isPolySymAxis(shape,ax);
    const cls=state==="neutral" ? "sym-line-neutral" : (isTrue?"sym-line-yes":"sym-line-no");
    const symR=S/2+pad;
    const a=compassPoint(cx,cy,symR,ax), b=compassPoint(cx,cy,symR,ax+180);
    mk(svg,"line",{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:"sym-line "+cls});
  }
}
function miniPolyProof(shape,ax){
  const box=176;
  const svg=document.createElementNS(SVGNS,"svg");
  svg.setAttribute("width",box); svg.setAttribute("height",box);
  svg.setAttribute("viewBox","0 0 "+box+" "+box);
  svg.style.display="block"; svg.style.margin="0 auto";
  drawPoly(svg,shape,ax,"on",box,box);
  return svg;
}

class PolyView{
  constructor(stage){
    this.stage=stage;
    this.svg=document.createElementNS(SVGNS,"svg");
    this.svg.setAttribute("class","symsvg");
    stage.appendChild(this.svg);
    this.shape=POLY_SHAPES[0];
    observeSize(stage,()=>this.draw());
  }
  set(shape){ this.shape=shape; this.draw(); }
  draw(){
    const W=this.stage.clientWidth,H=this.stage.clientHeight;
    if(!W||!H) return;
    const svg=this.svg;
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox","0 0 "+W+" "+H);

    const {mk,cx,cy,S,pad}=drawPolyBase(svg,this.shape,W,H);
    const {n,theta0,sym}=this.shape, symR=S*0.42+pad;
    polySymAngles(n,theta0).forEach(deg=>{
      const a=compassPoint(cx,cy,symR,deg), b=compassPoint(cx,cy,symR,deg+180);
      mk(svg,"line",{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:"poly-sym",stroke:sym});
    });
  }
}

function renderSymLab(side,stage){
  const view=new PolyView(stage);

  const p1=h("div","panel");
  p1.append(h("h4",null,t("shapesHdr").toUpperCase()));
  const strip=h("div","shapes");

  const p2=h("div","panel");
  p2.append(h("h4",null,t("symHdr").toUpperCase()));
  const big=h("div","bigval"), nm=h("div","bigname",t("linesOfSym"));
  p2.append(big,nm);

  function pick(s){
    view.set(s);
    big.textContent=s.n;
    big.style.color=s.sym;
  }
  POLY_SHAPES.forEach((s,i)=>{
    const b=h("button","shape",t(s.name));
    b.setAttribute("aria-pressed",String(i===0));
    b.onclick=()=>{
      pick(s);
      [...strip.children].forEach(x=>x.setAttribute("aria-pressed","false"));
      b.setAttribute("aria-pressed","true");
    };
    strip.appendChild(b);
  });
  p1.appendChild(strip);

  side.append(p1,p2);
  pick(POLY_SHAPES[0]);
}

/* ---------- game 2 — Symmetrical or not? ----------
   Three unrelated ways to draw a candidate line and ask about it — a
   blocky cell shape, a line-art regular polygon, or a multi-colour
   pattern — picked at random each round so no two questions in a row
   look alike. Each kind keeps its own truth-check (orphans / patternOrphans
   / isPolySymAxis), so a bug in one can never leak a wrong answer into
   another; `drawLive`/`drawProof` are the only shared interface. */
const KINDS=["block","poly","pattern"];

function blockQuestion(){
  const shape=rand(SHAPES), style=rand(STYLES);
  const {ax,n}=pickAxisFor(a=>orphans(shape.cells,a));
  return {
    kind:"block", sig:"block:"+shape.id+":"+ax+":"+style, truth:n===0, n,
    drawLive(view,state){
      const g=view.geom();
      drawBoard(view.svg,shape.cells,{[ax]:state},g.x0,g.y0,g.S,g.cell,style);
    },
    drawProof(){ return miniProof(shape.cells,ax,style); }
  };
}
function polyQuestion(){
  const shape=rand(POLY_SHAPES);
  const trues=CAND_DEG.filter(d=>isPolySymAxis(shape,d));
  const falses=CAND_DEG.filter(d=>!trues.includes(d));
  const ax=(trues.length&&Math.random()<0.6) ? rand(trues) : rand(falses.length?falses:CAND_DEG);
  return {
    kind:"poly", sig:"poly:"+shape.id+":"+ax, truth:isPolySymAxis(shape,ax),
    drawLive(view,state){
      const g=view.geom();
      drawPoly(view.svg,shape,ax,state,g.W,g.H);
    },
    drawProof(){ return miniPolyProof(shape,ax); }
  };
}
function patternQuestion(){
  const colors=randomPattern(Math.random()<0.55 ? rand(AXES) : null);
  const {ax,n}=pickAxisFor(a=>patternOrphans(colors,a));
  return {
    kind:"pattern", sig:"pattern:"+ax, truth:n===0, n,
    drawLive(view,state){
      const g=view.geom();
      drawPattern(view.svg,colors,{[ax]:state},g.x0,g.y0,g.S,g.cell);
    },
    drawProof(){ return miniPatternProof(colors,ax); }
  };
}
const QUESTION_FOR={block:blockQuestion, poly:polyQuestion, pattern:patternQuestion};
let lastSig=null;
function pickQuestion(){
  let q;
  do{ q=QUESTION_FOR[rand(KINDS)](); } while(lastSig===q.sig);
  lastSig=q.sig;
  return q;
}
function renderSymQuiz(side,stage){
  const view=new SymView(stage);
  hudQuestion(stage,t("qLine"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  const bYes=h("button","abtn yes",t("yes")), bNo=h("button","abtn no",t("no"));
  act.append(bYes,bNo);
  let answered=false, cur=null;

  function deal(){
    answered=false; act.hidden=false;
    cur=pickQuestion();
    view.render(()=>cur.drawLive(view,"neutral"));
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=said===cur.truth;
    act.hidden=true;
    view.render(()=>cur.drawLive(view,"on"));
    score.hit(ok);
    if(ok){ scraps(stage); sfxGold(); } else sfxWrong();
    const why=cur.truth ? t("matchWhy") : (cur.kind==="poly" ? t("gapWhyPoly") : t("gapWhy")(cur.n));
    celebrate(stage,ok,why,deal,t("nextS"),cur.drawProof());
  }
  bYes.onclick=()=>answer(true);
  bNo.onclick=()=>answer(false);
  deal();
}

/* ============================================================
   ARCADE — Symmetry Arcade: line up a line of symmetry with the marker

   Two modes, chosen on the ready screen, share every rule below —
   they only disagree about WHAT is spinning:

   - Sweeper: a full line (not a ray — a line and its 180deg-rotated
     self look identical, so its angle only ever runs 0-180deg) spins
     around a polygon that sits still.
   - Revolver: the marker line is the one that sits still (always
     pointing straight up) and the polygon itself spins instead,
     freshly rotated on every spawn either way.

   Tap when the moving side lines up with ANY of the polygon's own
   lines of symmetry — there are n of them, at 180/n degrees apart,
   exactly as computed for the Lab and quiz. Margin of error 5deg.
   Within 1deg, full marks; the score then drops in a straight line
   down to a floor of 200 at the 5deg edge. A hit swaps in a new
   polygon and reverses whichever side is spinning; nothing pauses.

   Every tap flashes the nearest symmetry line plus its 5deg zone —
   green inside the 1deg "perfect" ring, purple for the rest of the safe
   zone, red beyond it — so a miss still shows what you were aiming
   near and by how much, not just a bare point penalty. (Not blue: a
   shape's own outline is already gold or blue, 70/30, the same "blue
   pays a bonus" convention as every other arcade here — reusing blue
   for the accuracy ring too would make the two meanings collide.) */
const SYM_SPEED=60;      // deg/s — a full 180deg turn every 3s (Hard); Normal divides by tm
const SYM_MARGIN=5;      // degrees, margin of error
const SYM_PERFECT=1;     // degrees, the flat-500 zone within the margin
const SYM_MISS=300;      // points lost on a miss
const SYM_BLINK_MS=550;  // how long the tap feedback stays on screen
const SYM_MARKER_DEG=0;  // Revolver's still marker — always straight up
const BLINK_COLOR={perfect:"var(--c5)", good:"var(--c4)", miss:"var(--red)"};

function symArcScore(dev){
  if(dev<=SYM_PERFECT) return 500;
  const k=(dev-SYM_PERFECT)/(SYM_MARGIN-SYM_PERFECT);
  return Math.round(500-(500-200)*k);
}
function symArcClass(dev){
  return dev<=SYM_PERFECT ? "perfect" : dev<=SYM_MARGIN ? "good" : "miss";
}
/* a filled pie slice from a1 to a2 (compass degrees, a2 a short way
   clockwise of a1) — used for the two safe-zone wedges */
function wedgeD(cx,cy,r,a1,a2){
  const s=compassPoint(cx,cy,r,a1), e=compassPoint(cx,cy,r,a2);
  return "M"+cx+","+cy+" L"+s[0]+","+s[1]+" A"+r+","+r+" 0 0 1 "+e[0]+","+e[1]+" Z";
}
function renderSymArcade(side,stage){
  const svg=document.createElementNS(SVGNS,"svg");
  svg.setAttribute("class","symsvg");
  stage.appendChild(svg);
  const node=(tag,cls,at)=>{ const e=document.createElementNS(SVGNS,tag);
    if(cls) e.setAttribute("class",cls); for(const k in at) e.setAttribute(k,at[k]); svg.appendChild(e); return e; };

  let geo=null, shape=null, sweep=0, dir=1, playedNow=0, blink=null, mode="sweeper";
  function measure(){
    const W=stage.clientWidth,H=stage.clientHeight;
    geo={cx:W/2,cy:H/2+14,R:Math.max(70,Math.min(W,H)*0.32)};
    svg.setAttribute("viewBox","0 0 "+W+" "+H);
  }
  function newShape(){
    const blue=Math.random()<0.3;              // 70% gold, 30% blue — blue also pays a time bonus
    shape={n:3+Math.floor(Math.random()*6), theta0:Math.random()*360, blue, outline:blue?"var(--c3)":"var(--c1)"};
  }
  /* Sweeper: the marker's own angle sweeps. Revolver: the marker is fixed
     at SYM_MARKER_DEG and the shape's rotation (theta0) sweeps instead. */
  const markerDeg=()=>mode==="sweeper" ? sweep : SYM_MARKER_DEG;
  function draw(){
    if(!geo) return;
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const {cx,cy,R}=geo;
    /* the tap feedback: quick full-brightness flash, then a linear fade */
    if(blink){
      const age=playedNow-blink.start;
      if(age<SYM_BLINK_MS){
        const op=age<150 ? 1 : Math.max(0,1-(age-150)/(SYM_BLINK_MS-150));
        const col=BLINK_COLOR[blink.cls], wedgeR=R*1.06;
        [blink.ax,blink.ax+180].forEach(mid=>{
          node("path",null,{d:wedgeD(cx,cy,wedgeR,mid-SYM_MARGIN,mid+SYM_MARGIN),
            style:"fill:"+col+";opacity:"+(op*0.4)});
        });
        const a=compassPoint(cx,cy,R*1.14,blink.ax), b=compassPoint(cx,cy,R*1.14,blink.ax+180);
        node("line",null,{x1:a[0],y1:a[1],x2:b[0],y2:b[1],
          style:"stroke:"+col+";stroke-width:4;stroke-linecap:round;opacity:"+op});
      } else blink=null;
    }
    for(let d=0;d<360;d+=10){                       // plain protractor ring, no target revealed
      const p1=compassPoint(cx,cy,R*0.98,d), p2=compassPoint(cx,cy,R*1.05,d);
      node("line","dial-tick",{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1]});
    }
    const pts=polyVertexAngles(shape.n,shape.theta0).map(deg=>compassPoint(cx,cy,R*0.6,deg));
    node("polygon","poly-shape",{points:pts.map(p=>p.join(",")).join(" "),stroke:shape.outline});
    const deg=markerDeg();
    const a=compassPoint(cx,cy,R*1.14,deg), b=compassPoint(cx,cy,R*1.14,deg+180);
    node("line","dial-ray",{x1:a[0],y1:a[1],x2:b[0],y2:b[1]});
    node("circle","dial-hub",{cx,cy,r:6});
  }
  observeSize(stage,()=>{ measure(); draw(); });
  measure(); newShape(); draw();

  const api=arcadeShell(stage,{
    how:"arcHowSym",
    get key(){ return "symarc_"+mode; },          // separate best score per mode, same difficulty split as ever
    modePicker(box,howEl,refreshBest){
      box.appendChild(h("div","difflabel",t("modePick")));
      const row=h("div","diffrow");
      [["sweeper","modeSweeper"],["revolver","modeRevolver"]].forEach(([m,k],i)=>{
        const b=h("button","diffbtn",t(k));
        b.setAttribute("aria-pressed",String(m===mode));
        b.onclick=()=>{
          mode=m;
          howEl.textContent=t(m==="sweeper"?"arcHowSym":"arcHowRevolver");
          [...row.children].forEach((x,j)=>x.setAttribute("aria-pressed",String(j===i)));
          refreshBest();
        };
        row.appendChild(b);
      });
      box.appendChild(row);
    },
    rules:[["var(--c5)","ruleSymPerfect"],["var(--c4)","ruleSymGood"],["var(--red)","ruleSymMiss"],["var(--c3)","ruleSymBlue"]],
    reset(){ sweep=0; dir=1; playedNow=0; blink=null; newShape(); draw(); },
    cleanup(){},
    frame(dt,played,a){
      playedNow=played;
      const delta=dir*(SYM_SPEED/a.tm)*dt/1000;
      if(mode==="sweeper") sweep=((sweep+delta)%180+180)%180;
      else shape.theta0+=delta;                    // the shape itself revolves; angle maths take any real value
      draw();
    }
  });

  stage.addEventListener("pointerdown",e=>{
    if(!api.running||e.target.closest("button")) return;
    const deg=markerDeg();
    const targets=polySymAngles(shape.n,shape.theta0).map(v=>((v%180)+180)%180);
    let dev=180, bestAx=0;
    for(const tt of targets){
      const d=Math.min(Math.abs(deg-tt),180-Math.abs(deg-tt));
      if(d<dev){ dev=d; bestAx=tt; }
    }
    const cls=symArcClass(dev);
    blink={ax:bestAx, cls, start:playedNow};
    const x=geo.cx, y=geo.cy;
    if(dev<=SYM_MARGIN){
      dir=-dir;                     // a correct tap reverses whichever side is spinning
      const got=api.award(symArcScore(dev));
      const label=t(cls==="perfect"?"symPerfect":"symGood");
      api.pop(x,y,"+"+got+" "+label,BLINK_COLOR[cls]);
      if(shape.blue){ api.addTime(1000); api.pop(x,y-40,t("bonusSec"),"var(--c2)"); sfxBlue(); }
      else sfxGold();
      newShape();
    }else{
      api.penalise(SYM_MISS);
      api.pop(x,y,"-"+SYM_MISS,"var(--red)");
      sfxWrong();
    }
  });
}

export default {
  games:[
    {id:"lab",  name:"gSymL", blurb:"gSymLP", render:renderSymLab},
    {id:"mirror", name:"gMirror", blurb:"gMirrorP", render:renderMirrorIt, full:true},
    {id:"quiz", name:"gSymQ", blurb:"gSymQP", render:renderSymQuiz, full:true},
    {id:"arc",  name:"gArc",  blurb:"gArcP",  render:renderSymArcade, full:true, rainbow:true}
  ]
};
