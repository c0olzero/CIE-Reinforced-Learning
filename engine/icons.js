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

/* Biology — a sprouting seedling: stem with two leaves above a soil line. */
function iconBio(){
  const s=svg();
  s.append(
    el("line",Object.assign({x1:8,y1:34,x2:32,y2:34},STROKE)),
    el("line",Object.assign({x1:20,y1:34,x2:20,y2:14},STROKE)),
    el("path",Object.assign({d:"M20,22 C14,22 10,18 10,13 C16,13 20,17 20,22 Z"},STROKE)),
    el("path",Object.assign({d:"M20,18 C26,18 30,14 30,9 C24,9 20,13 20,18 Z"},STROKE))
  );
  return s;
}

/* Chemistry — a flask with a liquid line and a bubble. */
function iconChem(){
  const s=svg();
  s.append(
    el("line",Object.assign({x1:16,y1:6,x2:24,y2:6},STROKE)),
    el("path",Object.assign({d:"M18,6 L18,16 L9,30 A3,3 0 0 0 12,34 L28,34 A3,3 0 0 0 31,30 L22,16 L22,6"},STROKE)),
    el("path",Object.assign({d:"M12.5,26 L27.5,26"},STROKE)),
    el("circle",{cx:17,cy:30,r:2,fill:"currentColor"})
  );
  return s;
}

/* Physics — a magnet's horseshoe with its two pole tips. */
function iconPhys(){
  const s=svg();
  s.append(
    el("path",Object.assign({d:"M11,30 L11,18 A9,9 0 0 1 29,18 L29,30"},STROKE)),
    el("line",Object.assign({x1:11,y1:30,x2:11,y2:34},STROKE)),
    el("line",Object.assign({x1:29,y1:30,x2:29,y2:34},STROKE)),
    el("circle",{cx:11,cy:34,r:2.2,fill:"currentColor"}),
    el("circle",{cx:29,cy:34,r:2.2,fill:"currentColor"})
  );
  return s;
}

/* Earth & Space — a planet with an orbit ring cutting across it. */
function iconEarth(){
  const s=svg();
  s.append(
    el("circle",Object.assign({cx:20,cy:20,r:11},STROKE)),
    el("ellipse",Object.assign({cx:20,cy:20,rx:18,ry:6.5,transform:"rotate(-20 20 20)"},STROKE)),
    el("circle",{cx:20,cy:20,r:3.2,fill:"currentColor"})
  );
  return s;
}

const ICONS={number:iconNumber, geometry:iconGeometry, stats:iconStats,
             bio:iconBio, chem:iconChem, phys:iconPhys, earth:iconEarth};
export function strandIcon(id){ return (ICONS[id]||iconNumber)(); }

/* Subject icons for the hub's new first screen. Maths reuses the abacus;
   Science gets the flask, so the two read as different at a glance. */
const SUBJECT_ICONS={math:iconNumber, science:iconChem};
export function subjectIcon(id){ return (SUBJECT_ICONS[id]||iconNumber)(); }
