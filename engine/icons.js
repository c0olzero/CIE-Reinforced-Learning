/* Workbench — strand icons for the hub's first screen.
   Plain inline SVG, currentColor throughout so a card's own text colour
   (and its hover state) drives the icon — no colour is load-bearing. */
import {SVGNS} from "./dom.js";

function svg(){
  const s=document.createElementNS(SVGNS,"svg");
  s.setAttribute("viewBox","0 0 40 40");
  s.setAttribute("class","strand-icon");
  s.setAttribute("aria-hidden","true");
  return s;
}
function el(tag,attrs){
  const e=document.createElementNS(SVGNS,tag);
  for(const k in attrs) e.setAttribute(k,attrs[k]);
  return e;
}
const STROKE={fill:"none",stroke:"currentColor","stroke-width":2.5,
  "stroke-linecap":"round","stroke-linejoin":"round"};

/* Number — an abacus: two rods, beads at different heights so it reads
   as "in use" rather than a static grid. */
function iconNumber(){
  const s=svg();
  s.append(
    el("line",Object.assign({x1:6,y1:8,x2:34,y2:8},STROKE)),
    el("line",Object.assign({x1:6,y1:32,x2:34,y2:32},STROKE)),
    el("line",Object.assign({x1:14,y1:8,x2:14,y2:32},STROKE)),
    el("line",Object.assign({x1:26,y1:8,x2:26,y2:32},STROKE)),
    el("circle",{cx:14,cy:16,r:3.4,fill:"currentColor"}),
    el("circle",Object.assign({cx:14,cy:26,r:3.4},STROKE)),
    el("circle",Object.assign({cx:26,cy:14,r:3.4},STROKE)),
    el("circle",{cx:26,cy:24,r:3.4,fill:"currentColor"})
  );
  return s;
}

/* Geometry & Measure — a protractor: baseline, half-circle arc and one
   angle ray, echoing the Angle Lab's own dial. */
function iconGeometry(){
  const s=svg();
  s.append(
    el("line",Object.assign({x1:6,y1:30,x2:34,y2:30},STROKE)),
    el("path",Object.assign({d:"M6,30 A14,14 0 0 1 34,30"},STROKE)),
    el("line",Object.assign({x1:20,y1:30,x2:29,y2:12},STROKE)),
    el("circle",{cx:20,cy:30,r:1.8,fill:"currentColor"})
  );
  return s;
}

/* Statistics & Probability — a bar chart on a baseline. */
function iconStats(){
  const s=svg();
  s.append(
    el("line",Object.assign({x1:6,y1:32,x2:34,y2:32},STROKE)),
    el("rect",{x:9,y:22,width:6,height:10,rx:1.5,fill:"currentColor"}),
    el("rect",{x:17,y:12,width:6,height:20,rx:1.5,fill:"currentColor"}),
    el("rect",{x:25,y:18,width:6,height:14,rx:1.5,fill:"currentColor"})
  );
  return s;
}

const ICONS={number:iconNumber, geometry:iconGeometry, stats:iconStats};
export function strandIcon(id){ return (ICONS[id]||iconNumber)(); }
