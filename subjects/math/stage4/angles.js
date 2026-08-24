/* Workbench — Angle Lab — estimating, comparing and classifying angles
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Gg.08, 4Gg.09 */

import {h, rand, SVGNS, pending, observeSize, scraps} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions} from "../../../engine/ui.js";
import {arcadeShell} from "../../../engine/arcade.js";
import {sfxGold, sfxBlue, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./angles.strings.js";
addStrings(STRINGS);

/* ---------- 3b. angles ---------- */
/* Cambridge Primary Stage 4 (4Gg.08) names acute, right and obtuse; a straight
   angle is met at Stage 3. Reflex is Stage 5 (5Gg.07), so it stays out. */
const ANG_TYPES=["acute","right","obtuse","straight"];
const ANG_COL={acute:2,right:1,obtuse:3,straight:5,reflex:4,zero:0};
function angType(d){
  if(Math.abs(d-90)<0.5) return "right";
  if(Math.abs(d-180)<0.5) return "straight";
  if(d<0.5||d>359.5) return "zero";
  if(d<90) return "acute";
  if(d<180) return "obtuse";
  return "reflex";
}
/* is this angle a fair example of the type the kid was asked for? */
function angMatches(d,want){
  if(want==="right")    return Math.abs(d-90)<=3;
  if(want==="straight") return Math.abs(d-180)<=3;
  if(want==="acute")    return d>=1&&d<=89;
  return d>=91&&d<=179;                                // obtuse
}
/* quiz angles: exact 90 and 180 sometimes, otherwise a clear
   distance from the boundaries so nothing is a coin flip */
function randAngle(){
  const r=Math.random();
  if(r<0.16) return 90;
  if(r<0.29) return 180;
  return r<0.65 ? 8+Math.floor(Math.random()*75)      // acute  8-82
                : 98+Math.floor(Math.random()*75);    // obtuse 98-172
}

class AngleView{
  constructor(stage){
    this.stage=stage;
    this.svg=document.createElementNS(SVGNS,"svg");
    this.svg.setAttribute("class","angsvg");
    stage.appendChild(this.svg);
    this.base=0; this.theta=45; this.snap=1; this.ticks=false;
    this.locked=false; this.showValue=true; this.neutral=false; this.onChange=null;
    this.max=180;                        // half-disc protractor, no reflex angles
    this._drag();
    observeSize(stage,()=>this.draw());
  }
  geom(){
    const W=this.stage.clientWidth,H=this.stage.clientHeight;
    return {W,H,cx:W/2,cy:H/2,R:Math.min(W,H)*0.32};
  }
  _drag(){
    let on=false;
    const upd=e=>{
      const g=this.geom(), r=this.stage.getBoundingClientRect();
      const dx=e.clientX-r.left-g.cx, dy=e.clientY-r.top-g.cy;
      if(Math.hypot(dx,dy)<10) return;             // too close to the vertex to mean anything
      const a=Math.atan2(-dy,dx)*180/Math.PI;
      let th=((a-this.base)%360+360)%360;
      if(this.snap) th=Math.round(th/this.snap)*this.snap;
      if(th>=360) th-=360;
      if(th>this.max) th = th>(this.max+360)/2 ? 0 : this.max;   // clamp past the half turn
      this.theta=th; this.draw();
      if(this.onChange) this.onChange(th);
    };
    this.stage.addEventListener("pointerdown",e=>{
      if(this.locked||e.target.closest("button")) return;
      e.preventDefault(); on=true; this.stage.setPointerCapture(e.pointerId); upd(e);
    });
    this.stage.addEventListener("pointermove",e=>{ if(on) upd(e); });
    const off=()=>{on=false;};
    this.stage.addEventListener("pointerup",off);
    this.stage.addEventListener("pointercancel",off);
    this.stage.addEventListener("dragstart",e=>e.preventDefault());
  }
  set(deg,base){ this.theta=Math.min(deg,this.max); if(base!=null) this.base=base; this.draw(); }
  lock(on){ this.locked=on; this.stage.classList.toggle("locked",on); this.draw(); }
  draw(){
    const {W,H,cx,cy,R}=this.geom();
    if(!W||!H) return;
    const svg=this.svg;
    if(!this.gT){                        // two layers: ticks are static, the arm is not
      while(svg.firstChild) svg.removeChild(svg.firstChild);
      this.gT=document.createElementNS(SVGNS,"g");
      this.gD=document.createElementNS(SVGNS,"g");
      svg.append(this.gT,this.gD);
    }
    const P=(a,r)=>[cx+r*Math.cos(a*Math.PI/180), cy-r*Math.sin(a*Math.PI/180)];
    const mk=(par,tag,at)=>{const e=document.createElementNS(SVGNS,tag);
      for(const k in at)e.setAttribute(k,at[k]);par.appendChild(e);return e;};
    const th=this.theta, b=this.base, type=angType(th);
    // while a question is live the wedge stays neutral — colouring it by type
    // would let a kid answer from the colour instead of the angle
    const col=this.neutral?"var(--amber)":"var(--c"+ANG_COL[type]+")";

    // 72 tick marks only get rebuilt when the dial itself changes, not on every
    // pointer move — redrawing them per frame was ~80 DOM nodes a time
    const key=W+","+H+","+b.toFixed(2)+","+(this.ticks?1:0);
    if(key!==this._tickKey){
      this._tickKey=key;
      svg.setAttribute("viewBox","0 0 "+W+" "+H);
      while(this.gT.firstChild) this.gT.removeChild(this.gT.firstChild);
      if(this.ticks) for(let d=0;d<360;d+=5){
        const maj=d%45===0;
        const p1=P(b+d,R*(maj?0.86:0.94)), p2=P(b+d,R);
        mk(this.gT,"line",{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],class:"ang-tick"+(maj?" maj":"")});
      }
    }

    const g=this.gD;
    while(g.firstChild) g.removeChild(g.firstChild);
    const rw=R*0.7, s0=P(b,rw), e2=P(b+th,rw), large=th>180?1:0;
    // sweep-flag 0 = anticlockwise on screen, because SVG's y axis points down
    const arc="A"+rw+","+rw+" 0 "+large+" 0 "+e2[0]+","+e2[1];
    if(th>0.2){
      mk(g,"path",{d:"M"+cx+","+cy+" L"+s0[0]+","+s0[1]+" "+arc+" Z",class:"ang-wedge",fill:col});
      mk(g,"path",{d:"M"+s0[0]+","+s0[1]+" "+arc,class:"ang-arc",stroke:col});
    }
    const L=R*1.32, r1=P(b,L), r2=P(b+th,L);
    mk(g,"line",{x1:cx,y1:cy,x2:r1[0],y2:r1[1],class:"ang-ray"});
    mk(g,"line",{x1:cx,y1:cy,x2:r2[0],y2:r2[1],class:"ang-ray"});
    if(type==="right"&&!this.neutral){                   // the usual square corner mark
      const q=R*0.19, a1=P(b,q), a2=P(b+90,q), a3=[a1[0]+a2[0]-cx, a1[1]+a2[1]-cy];
      mk(g,"path",{d:"M"+a1+" L"+a3+" L"+a2,class:"ang-sq",stroke:col});
    }
    mk(g,"circle",{cx:cx,cy:cy,r:6,class:"ang-dot"});
    if(!this.locked) mk(g,"circle",{cx:r2[0],cy:r2[1],r:11,class:"ang-handle"});
    if(this.showValue&&th>0.2){
      const mp=P(b+th/2, th<40?rw*1.18:rw*0.58);
      const tx=mk(g,"text",{x:mp[0],y:mp[1],class:"ang-val","text-anchor":"middle",
        "dominant-baseline":"central","font-size":Math.max(17,R*0.18)});
      tx.textContent=Math.round(th)+"\u00B0";
    }
  }
}

function angleStage(stage,draggable){
  stage.classList.add("ang");
  if(draggable) stage.append(h("div","hint",t("dragAng")));
  const view=new AngleView(stage);
  view.lock(!draggable);
  return view;
}
/* score read-out pinned to the top right of the stage */

/* ---------- 10. game 4 — Protractor ---------- */
function typeStrip(){
  const box=h("div"), rows={};
  ANG_TYPES.forEach(k=>{
    const r=h("div","typerow");
    const sw=h("i"); sw.style.background="var(--c"+ANG_COL[k]+")";
    r.append(sw,h("b",null,t("t"+k)),h("span",null,t("r"+k)));
    box.appendChild(r); rows[k]=r;
  });
  return {el:box,rows:rows,
    show:type=>{ for(const k in rows) rows[k].classList.toggle("on",k===type); }};
}
function renderAngleLab(side,stage){
  const v=angleStage(stage,true);
  v.showValue=true; v.ticks=true; v.snap=1;
  const badge=h("div","ang-name"); stage.appendChild(badge);

  const p1=h("div","panel");
  p1.append(h("h4",null,t("angle").toUpperCase()));
  const big=h("div","bigval"), nm=h("div","bigname"), rg=h("div","bigrange");
  p1.append(big,nm,rg);
  const tg=h("div","toggles");
  const bSnap=h("button","toggle",t("snap5")), bTick=h("button","toggle",t("ticksT"));
  bSnap.setAttribute("aria-pressed","false"); bTick.setAttribute("aria-pressed","true");
  bSnap.onclick=()=>{ v.snap = v.snap===5?1:5; bSnap.setAttribute("aria-pressed",v.snap===5); };
  bTick.onclick=()=>{ v.ticks=!v.ticks; bTick.setAttribute("aria-pressed",v.ticks); v.draw(); };
  tg.append(bSnap,bTick); p1.appendChild(tg);

  const p2=h("div","panel");
  p2.append(h("h4",null,t("jump").toUpperCase()));
  const jr=h("div","grid2");
  [30,45,90,135,180].forEach((d,i)=>{
    const b=h("button","btn alt"+(i===4?" wide":""),d+"°");
    b.onclick=()=>{ v.set(d); upd(d); };
    jr.appendChild(b);
  });
  p2.appendChild(jr);

  const p3=h("div","panel");
  p3.append(h("h4",null,t("kinds").toUpperCase()));
  const strip=typeStrip(); p3.appendChild(strip.el);

  side.append(p1,p2,p3);
  function upd(d){
    const type=angType(d);
    badge.innerHTML="";
    badge.append(document.createTextNode(t("t"+type)),h("small",null,t("r"+type)));
    badge.style.color="var(--c"+ANG_COL[type]+")";
    big.textContent=Math.round(d)+"\u00B0";
    big.style.color="var(--c"+ANG_COL[type]+")";
    nm.textContent=t("t"+type);
    rg.textContent=t("r"+type);
    strip.show(type);
  }
  v.onChange=upd;
  v.set(45,0); upd(45);
}

/* ---------- 11. game 5 — Name it ---------- */
function renderAngleName(side,stage){
  const v=angleStage(stage,false);
  v.showValue=false; v.ticks=true; v.neutral=true;
  hudQuestion(stage,t("qAngN"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  ANG_TYPES.forEach(k=>{
    const b=h("button","abtn",t("t"+k));
    b.onclick=()=>answer(k);
    act.appendChild(b);
  });
  let answered=false, deg=0;

  function deal(){
    answered=false; act.hidden=false;
    deg=randAngle();
    v.showValue=false; v.neutral=true;
    v.set(deg, Math.floor(Math.random()*360));   // random orientation, so no reading it off the horizon
  }
  function answer(said){
    if(answered) return; answered=true;
    const truth=angType(deg), ok=said===truth;
    act.hidden=true;
    v.showValue=true; v.neutral=false; v.draw();
    score.hit(ok);
    if(ok) scraps(stage);
    celebrate(stage,ok,t("why")[truth](deg),deal,t("nextA"));
  }
  deal();
}

/* ---------- 12. game 6 — Make it ---------- */
function renderAngleMake(side,stage){
  const v=angleStage(stage,true);
  v.showValue=false; v.snap=1; v.ticks=true; v.neutral=true;
  const q=hudQuestion(stage,t("qAngM"));
  const em=h("em"); q.appendChild(em);
  const score=hudScore(stage);
  const act=hudActions(stage);
  const bCheck=h("button","abtn",t("check"));
  act.appendChild(bCheck);
  let answered=false, want="acute";

  function deal(){
    answered=false; act.hidden=false;
    // start where the last answer left the arm instead of snapping to a fixed
    // opening — but never hand out a target the arm already satisfies
    const start=v.theta;
    const fresh=ANG_TYPES.filter(k=>!angMatches(Math.round(start),k));
    want=rand(fresh.length?fresh:ANG_TYPES);
    em.textContent=t("t"+want);
    em.style.color="var(--c"+ANG_COL[want]+")";
    em.appendChild(h("small",null,t("r"+want)));
    v.showValue=false; v.neutral=true; v.ticks=true;
    v.set(start,0);
    v.lock(false);
  }
  function check(){
    if(answered) return; answered=true;
    const d=Math.round(v.theta), ok=angMatches(d,want);
    act.hidden=true;
    v.showValue=true; v.neutral=false; v.lock(true);
    score.hit(ok);
    if(ok) scraps(stage);
    celebrate(stage,ok,t("youMade")(d,t("t"+angType(d))),deal,t("nextA"));
  }
  bCheck.onclick=check;
  deal();
}

/* ============================================================
   13. ARCADE — shared engine, one adapter per module

   Rules (as specified):
     30s clock. Shapes fade in for 2s each.
     70% gold / 30% blue, independent of whether the shape is a right answer.
     Correct: 200 pts under 0.5s, 150 to 1s, 100 to 1.5s, 50 after.
              Blue also adds 1 second to the clock.
     Wrong tap: -100.
     A hidden play-time counter drives the difficulty ramp: one more shape
     allowed on screen every 10s, up to 5. At the start a new shape only
     appears once the previous one begins fading. Shapes never overlap.
   ============================================================ */

/* ============================================================
   ARCADE 2 — Angle Lab: stop the sweeping arm on the target

   A line sweeps from the base at 0.5 rev/s (180°/s). Tap when the
   angle matches the target (always a multiple of 15). Dead on is
   1000, less 100 per degree off. Outside the 10° band costs 500.
   On a hit the base jumps to the arm and the sweep reverses.
   ============================================================ */
const ANG_SPEED=144;      // deg per second = 1 revolution every 2.5s
const ANG_SAFE=10;        // the shaded band, half-width in degrees
const ANG_STEP=5;         // one tick mark every 5 degrees, all the same length

function renderAngleArcade(side,stage){
  const svg=document.createElementNS(SVGNS,"svg");
  svg.setAttribute("class","ang-dial");
  stage.appendChild(svg);
  const gDial=document.createElementNS(SVGNS,"g");   // protractor + target band
  const gDyn =document.createElementNS(SVGNS,"g");   // arm and wedge, redrawn each frame
  svg.append(gDial,gDyn);

  const el={};
  const elTgt=h("div","arc-target");
  let base=0, dir=1, sweep=0, target=90, blue=false, geo=null;
  function showTarget(){
    elTgt.textContent=target+"\u00B0";
    elTgt.style.color=blue?"var(--c3)":"var(--c1)";
  }

  const P=(deg,r)=>[geo.cx+r*Math.cos(deg*Math.PI/180), geo.cy-r*Math.sin(deg*Math.PI/180)];
  const ptAt=(a,r)=>P(base+dir*a,r);                 // angle a measured from the base, along the sweep
  const arcTo=(r,a1,large)=>{ const B=ptAt(a1,r);
    return "A"+r+","+r+" 0 "+large+" "+(dir>0?0:1)+" "+B[0].toFixed(2)+","+B[1].toFixed(2); };
  const node=(par,tag,cls)=>{ const e=document.createElementNS(SVGNS,tag);
    if(cls) e.setAttribute("class",cls); par.appendChild(e); return e; };
  const setA=(e,o)=>{ for(const k in o) e.setAttribute(k,o[k]); };
  const clear=g=>{ while(g.firstChild) g.removeChild(g.firstChild); };

  function measure(){
    const W=stage.clientWidth, H=stage.clientHeight;
    geo={W,H,cx:W/2,cy:H/2+14,R:Math.max(70,Math.min(W,H)*0.31)};
    svg.setAttribute("viewBox","0 0 "+W+" "+H);
  }
  function layout(){
    measure();
    clear(gDial); clear(gDyn);
    const R=geo.R;
    for(let a=0;a<360;a+=ANG_STEP){    // one uniform marker every 5 degrees
      const p1=ptAt(a,R*0.93), p2=ptAt(a,R);
      setA(node(gDial,"line","dial-tick"),{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1]});
    }
    const col=blue?"var(--c3)":"var(--c1)", rb=R*0.90;
    const lo=Math.max(0,target-ANG_SAFE), hi=Math.min(360,target+ANG_SAFE);
    const s0=ptAt(lo,rb);
    setA(node(gDial,"path","dial-band"),{fill:col,
      d:"M"+geo.cx+","+geo.cy+" L"+s0[0].toFixed(2)+","+s0[1].toFixed(2)+" "+arcTo(rb,hi,0)+" Z"});
    const tp=ptAt(target,rb);
    setA(node(gDial,"path","dial-target"),{stroke:col,
      d:"M"+geo.cx+","+geo.cy+" L"+tp[0].toFixed(2)+","+tp[1].toFixed(2)});
    const b1=ptAt(0,R*1.14);
    setA(node(gDial,"line","dial-base"),{x1:geo.cx,y1:geo.cy,x2:b1[0],y2:b1[1]});

    el.wedge=node(gDyn,"path","dial-wedge");
    el.ray=node(gDyn,"line","dial-ray");
    el.tip=node(gDyn,"circle","dial-hub"); setA(el.tip,{r:6});
    el.hub=node(gDyn,"circle","dial-hub"); setA(el.hub,{r:7,cx:geo.cx,cy:geo.cy});
    draw();
  }
  function draw(){
    if(!geo||!el.ray) return;
    const R=geo.R, tipP=ptAt(sweep,R*1.14);
    setA(el.ray,{x1:geo.cx,y1:geo.cy,x2:tipP[0],y2:tipP[1]});
    setA(el.tip,{cx:tipP[0],cy:tipP[1]});
    if(sweep>0.6){
      const rw=R*0.55, s0=ptAt(0,rw);
      el.wedge.setAttribute("d","M"+geo.cx+","+geo.cy+" L"+s0[0].toFixed(2)+","+s0[1].toFixed(2)+" "
        +arcTo(rw,sweep,sweep>180?1:0)+" Z");
    } else el.wedge.setAttribute("d","");
  }
  // 45-180 every 15deg, 10 values — small enough that picking blind repeats
  // the same target fairly often, so it always excludes whatever it's about
  // to replace
  function newTarget(avoid){
    let v; do{ v=45+15*Math.floor(Math.random()*10); }while(v===avoid);
    return v;
  }

  /* on a hit the base takes the arm's place and the sweep turns around */
  function nextRound(){
    base=base+dir*sweep;               // the base takes the arm's place
    dir=-dir;                          // and the sweep turns around
    sweep=0;
    target=newTarget(target);
    blue=Math.random()<0.3;
    showTarget();
    layout();                          // the arm carries straight on, no pause
  }

  observeSize(stage,()=>{ if(geo) layout(); });
  layout();                            // draw the dial behind the title screen

  const api=arcadeShell(stage,{
    key:"ang", how:"arcHowA", topExtra:elTgt, comboPos:"bc",
    rules:[["var(--c1)","ruleAim"],["var(--c3)","ruleBlueA"],["var(--red)","ruleMiss"]],
    reset(){
      base=0; dir=1; sweep=0;
      target=newTarget(target); blue=Math.random()<0.3;
      showTarget(); layout();
    },
    cleanup(){},
    frame(dt,played,a){
      sweep+=(ANG_SPEED/a.tm)*dt/1000;   // slower arm on Normal
      if(sweep>=360) sweep-=360;
      draw();
    }
  });

  stage.addEventListener("pointerdown",e=>{
    if(!api.running||e.target.closest("button")) return;
    const dev=Math.abs(sweep-target);
    const x=geo.cx, y=geo.cy-geo.R*0.42;
    if(dev<=ANG_SAFE){
      const got=api.award(Math.max(0,Math.round(1000-100*dev)));
      api.pop(x,y,"+"+got,blue?"var(--c3)":"var(--c1)");
      if(blue){ api.addTime(1000); api.pop(x,y-38,t("bonusSec"),"var(--c2)"); sfxBlue(); }
      else sfxGold();
      nextRound();
    }else{
      api.penalise(500);
      api.pop(x,y,"-500","var(--red)");
      sfxWrong();
    }
  });
}

export default {
  games:[
    {id:"lab",  name:"gAngL", blurb:"gAngLP", render:renderAngleLab},
    {id:"name", name:"gAngN", blurb:"gAngNP", render:renderAngleName, full:true},
    {id:"make", name:"gAngM", blurb:"gAngMP", render:renderAngleMake, full:true},
    {id:"arc",  name:"gArc",  blurb:"gArcP",  render:renderAngleArcade, full:true, rainbow:true}
  ]
};
