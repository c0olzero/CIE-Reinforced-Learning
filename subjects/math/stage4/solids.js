/* Workbench — Solid Lab — nets, folding and the faces of 3D shapes
   Cambridge Primary Mathematics 0096, Stage 4. Objectives: 4Gg.05, 4Gg.06 */

import {h, rand, SVGNS, pending, observeSize, scraps} from "../../../engine/dom.js";
import {t, addStrings} from "../../../engine/i18n.js";
import {celebrate, hudQuestion, hudScore, hudActions} from "../../../engine/ui.js";
import {arcadeShell, ARC_LIFE, ARC_FADE} from "../../../engine/arcade.js";
import {arcPoints, slotPlan, ARC_TOP, ARC_SIDE, ARC_GAP} from "../../../games/spawner.js";
import {sfxGold, sfxBlue, sfxWrong} from "../../../engine/audio.js";
import STRINGS from "./solids.strings.js";
addStrings(STRINGS);

/* the solids the Fold Lab can unfold */
const SHAPES=[
  {id:"cube",   name:"sCube"},
  {id:"tetra",  name:"sTetra"},
  {id:"pyramid",name:"sPyr"},
  {id:"prism",  name:"sPrism"},
  {id:"octa",   name:"sOcta"}
];

/* --- vectors --- */
const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul3=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const crs3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const len3=a=>Math.sqrt(dot3(a,a));
const nrm3=a=>mul3(a,1/len3(a));
const mean3=ps=>mul3(ps.reduce(add3,[0,0,0]),1/ps.length);

/* --- (a) grid: hexominoes and cube folding --- */
const DIRS = [[0,1,"right"],[0,-1,"left"],[1,0,"down"],[-1,0,"up"]];
const key = (r,c) => r+","+c;
const neg = v => [-v[0],-v[1],-v[2]];

function normalize(cells){
  const mr=Math.min(...cells.map(p=>p[0])), mc=Math.min(...cells.map(p=>p[1]));
  return cells.map(([r,c])=>[r-mr,c-mc]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
}
const sig = cells => normalize(cells).map(p=>p.join(",")).join(" ");
function freeSig(cells){
  const out=[]; let cur=cells;
  for(let i=0;i<4;i++){
    cur=cur.map(([r,c])=>[c,-r]);
    out.push(sig(cur)); out.push(sig(cur.map(([r,c])=>[r,-c])));
  }
  return out.sort()[0];
}
function generateHexominoes(){
  let shapes=new Map([[sig([[0,0]]),[[0,0]]]]);
  for(let k=1;k<6;k++){
    const next=new Map();
    for(const s of shapes.values()){
      const set=new Set(s.map(p=>key(p[0],p[1])));
      for(const [r,c] of s) for(const [dr,dc] of DIRS){
        const p=[r+dr,c+dc];
        if(set.has(key(p[0],p[1]))) continue;
        const cand=[...s,p];
        next.set(freeSig(cand), normalize(cand));
      }
    }
    shapes=next;
  }
  return [...shapes.values()];
}
/* fold a child square 90° up toward the viewer and carry its orientation with it */
function childFrame(f,dir){
  const {R,D,N}=f;
  if(dir==="right") return {R:N,      D:D,      N:neg(R)};
  if(dir==="left")  return {R:neg(N), D:D,      N:R};
  if(dir==="down")  return {R:R,      D:N,      N:neg(D)};
  return                   {R:R,      D:neg(N), N:D};
}
const faceId = v => v[0] ? (v[0]>0?0:1) : v[1] ? (v[1]>0?2:3) : (v[2]>0?4:5);

/* the square that stays put while everything folds up around it */
function pickRoot(cells){
  const set=new Set(cells.map(p=>key(p[0],p[1])));
  let best=0,bestScore=-Infinity;
  cells.forEach((p,i)=>{
    const deg=DIRS.filter(([dr,dc])=>set.has(key(p[0]+dr,p[1]+dc))).length;
    const dist=cells.reduce((a,q)=>a+Math.abs(q[0]-p[0])+Math.abs(q[1]-p[1]),0);
    const score=deg*100-dist;
    if(score>bestScore){bestScore=score;best=i;}
  });
  return best;
}
function analyze(cells,root){
  const r0 = root==null ? pickRoot(cells) : root;
  const map=new Map(cells.map((p,i)=>[key(p[0],p[1]),i]));
  const frames=Array(cells.length).fill(null), parent=Array(cells.length).fill(-1), hinge=Array(cells.length).fill(null);
  frames[r0]={R:[1,0,0],D:[0,1,0],N:[0,0,1]};
  const order=[r0], seen=new Set([r0]);
  for(let q=0;q<order.length;q++){
    const i=order[q], [r,c]=cells[i];
    for(const [dr,dc,d] of DIRS){
      const j=map.get(key(r+dr,c+dc));
      if(j===undefined||seen.has(j)) continue;
      seen.add(j); parent[j]=i; hinge[j]=d; frames[j]=childFrame(frames[i],d); order.push(j);
    }
  }
  const sides=frames.map(f=>faceId(f.N));
  const count={}; sides.forEach(s=>count[s]=(count[s]||0)+1);
  const stacked=Object.values(count).filter(n=>n>1).reduce((a,n)=>a+n,0);
  const holes=6-Object.keys(count).length;
  return {cells,root:r0,sides,parent,hinge,order,stacked,holes,valid:Object.keys(count).length===6};
}
const HEX=generateHexominoes();
const NETS_CUBE=HEX.filter(h=>analyze(h).valid);      // exactly 11
const NOTNETS=HEX.filter(h=>!analyze(h).valid);       // the other 24

/* turn a grid shape into the common flat-net format */
function netFromCells(cells){
  const a=analyze(cells);
  const polys=cells.map(([r,c])=>[[c,r],[c+1,r],[c+1,r+1],[c,r+1]]);
  const hinges=Array(cells.length).fill(null);
  for(const i of a.order){
    if(a.parent[i]<0) continue;
    const [r,c]=cells[i], d=a.hinge[i];
    const seg = d==="right" ? [[c,r],[c,r+1]]
              : d==="left"  ? [[c+1,r],[c+1,r+1]]
              : d==="down"  ? [[c,r],[c+1,r]]
              :               [[c,r+1],[c+1,r+1]];
    hinges[i]=hingeOf(seg[0],seg[1],polys[i],Math.PI/2);
  }
  return {polys,parent:a.parent,hinge:hinges,order:a.order,root:a.root,analysis:a};
}
/* which way does this flap have to swing so it rises toward the viewer? */
function hingeOf(A,B,poly,angle){
  const dx=B[0]-A[0], dy=B[1]-A[1], dl=Math.hypot(dx,dy);
  const d=[dx/dl,dy/dl];
  const cx=poly.reduce((s,p)=>s+p[0],0)/poly.length, cy=poly.reduce((s,p)=>s+p[1],0)/poly.length;
  const m=[cx-A[0],cy-A[1]];
  const sgn=Math.sign(d[0]*m[1]-d[1]*m[0]) || 1;
  return {a:A,d:d,theta:sgn*angle};
}

/* --- (b) any polyhedron, unfolded --- */
const SQ2=Math.SQRT1_2, TRI=Math.sqrt(3)/2;
const DEFS={
  cube:{v:[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],
        f:[[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]]},
  tetra:{v:[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(p=>mul3(p,1/(2*Math.SQRT2))),
         f:[[0,1,2],[0,1,3],[0,2,3],[1,2,3]]},
  pyramid:{v:[[-.5,-.5,0],[.5,-.5,0],[.5,.5,0],[-.5,.5,0],[0,0,SQ2]],
           f:[[0,1,2,3],[0,1,4],[1,2,4],[2,3,4],[3,0,4]]},
  prism:{v:[[0,0,0],[1,0,0],[.5,TRI,0],[0,0,1],[1,0,1],[.5,TRI,1]],
         f:[[0,1,2],[3,4,5],[0,1,4,3],[1,2,5,4],[2,0,3,5]]},
  octa:{v:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(p=>mul3(p,SQ2)),
        f:[[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]]}
};
function faceNormal(V,face){
  let n=[0,0,0];
  for(let k=0;k<face.length;k++) n=add3(n,crs3(V[face[k]],V[face[(k+1)%face.length]]));
  return nrm3(n);
}
function prepSolid(def){
  const V=def.v, F=def.f.map(f=>f.slice()), C=mean3(V);
  F.forEach(f=>{ if(dot3(faceNormal(V,f), sub3(mean3(f.map(i=>V[i])),C))<0) f.reverse(); });
  const N=F.map(f=>faceNormal(V,f));
  const em=new Map();
  F.forEach((f,fi)=>{ for(let k=0;k<f.length;k++){
    const a=f[k],b=f[(k+1)%f.length], kk=Math.min(a,b)+"_"+Math.max(a,b);
    if(!em.has(kk)) em.set(kk,[]);
    em.get(kk).push({fi,a,b});
  }});
  const adj=[];
  for(const list of em.values()){
    if(list.length!==2) continue;
    const [x,y]=list;
    adj.push({i:x.fi,j:y.fi,e:[Math.min(x.a,x.b),Math.max(x.a,x.b)],
              angle:Math.acos(Math.max(-1,Math.min(1,dot3(N[x.fi],N[y.fi]))))});
  }
  return {V,F,N,adj};
}
/* local frame with the INWARD normal as +z, so folding toward the viewer
   rebuilds the real solid rather than its mirror image */
function unfoldTree(s,tree,root){
  const n=s.F.length, nb=Array.from({length:n},()=>[]);
  tree.forEach(t=>{nb[t.i].push({to:t.j,t});nb[t.j].push({to:t.i,t});});
  const pos=Array(n).fill(null), parent=Array(n).fill(-1), hinge=Array(n).fill(null);
  const put=(fi,ia,ib,A2,B2)=>{
    const o=s.V[ia], e1=nrm3(sub3(s.V[ib],o)), e3=mul3(s.N[fi],-1), e2=crs3(e3,e1);
    const phi=Math.atan2(B2[1]-A2[1],B2[0]-A2[0]), cs=Math.cos(phi), sn=Math.sin(phi);
    const m=new Map();
    for(const vi of s.F[fi]){
      const d=sub3(s.V[vi],o), x=dot3(d,e1), y=dot3(d,e2);
      m.set(vi,[A2[0]+x*cs-y*sn, A2[1]+x*sn+y*cs]);
    }
    pos[fi]=m;
  };
  const f0=s.F[root];
  put(root,f0[0],f0[1],[0,0],[len3(sub3(s.V[f0[1]],s.V[f0[0]])),0]);
  const q=[root], seen=new Set([root]);
  for(let k=0;k<q.length;k++){
    const fi=q[k];
    for(const {to,t} of nb[fi]){
      if(seen.has(to)) continue;
      seen.add(to); parent[to]=fi;
      const [ia,ib]=t.e, A2=pos[fi].get(ia), B2=pos[fi].get(ib);
      put(to,ia,ib,A2,B2);
      hinge[to]=hingeOf(A2,B2,s.F[to].map(vi=>pos[to].get(vi)),t.angle);
      q.push(to);
    }
  }
  if(seen.size!==n) return null;
  return {polys:s.F.map((f,fi)=>f.map(vi=>pos[fi].get(vi))),parent,hinge,order:q,root};
}
function shrinkPoly(p,k){
  const c=[p.reduce((a,q)=>a+q[0],0)/p.length, p.reduce((a,q)=>a+q[1],0)/p.length];
  return p.map(q=>[c[0]+(q[0]-c[0])*k, c[1]+(q[1]-c[1])*k]);
}
function polysOverlap(A,B){
  for(const poly of [A,B]) for(let k=0;k<poly.length;k++){
    const p=poly[k],q=poly[(k+1)%poly.length];
    const ax=-(q[1]-p[1]), ay=q[0]-p[0];
    let a1=Infinity,a2=-Infinity,b1=Infinity,b2=-Infinity;
    for(const v of A){const d=v[0]*ax+v[1]*ay;a1=Math.min(a1,d);a2=Math.max(a2,d);}
    for(const v of B){const d=v[0]*ax+v[1]*ay;b1=Math.min(b1,d);b2=Math.max(b2,d);}
    if(a2<b1+1e-9||b2<a1+1e-9) return false;
  }
  return true;
}
function netSelfOverlaps(net){
  const P=net.polys.map(p=>shrinkPoly(p,.9));
  for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++) if(polysOverlap(P[i],P[j])) return true;
  return false;
}
function combos(arr,k){
  const out=[];
  (function rec(start,cur){
    if(cur.length===k){out.push(cur.slice());return;}
    for(let i=start;i<arr.length;i++){cur.push(arr[i]);rec(i+1,cur);cur.pop();}
  })(0,[]);
  return out;
}
function isSpanningTree(n,edges){
  const p=[...Array(n).keys()], find=x=>p[x]===x?x:(p[x]=find(p[x]));
  for(const e of edges){const a=find(e.i),b=find(e.j); if(a===b) return false; p[a]=b;}
  return true;
}
function treeCenter(n,tree){
  const nb=Array.from({length:n},()=>[]);
  tree.forEach(t=>{nb[t.i].push(t.j);nb[t.j].push(t.i);});
  let best=0,bs=Infinity;
  for(let s=0;s<n;s++){
    const d=Array(n).fill(-1); d[s]=0; const q=[s];
    for(let k=0;k<q.length;k++) for(const x of nb[q[k]]) if(d[x]<0){d[x]=d[q[k]]+1;q.push(x);}
    const ecc=Math.max(...d);
    if(ecc<bs){bs=ecc;best=s;}
  }
  return best;
}
function netSignature(net){
  const pts=[];
  for(const f of net.polys) for(const p of f)
    if(!pts.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<1e-6)) pts.push(p);
  const d=[];
  for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++)
    d.push(Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]).toFixed(4));
  return pts.length+"|"+d.sort().join(",");
}
const solidCache={};
function netsOfSolid(name){
  if(solidCache[name]) return solidCache[name];
  const s=prepSolid(DEFS[name]), n=s.F.length, seen=new Map();
  for(const tree of combos(s.adj,n-1)){
    if(!isSpanningTree(n,tree)) continue;
    const net=unfoldTree(s,tree,treeCenter(n,tree));
    if(!net||netSelfOverlaps(net)) continue;
    const sg=netSignature(net);
    if(!seen.has(sg)) seen.set(sg,net);
  }
  return solidCache[name]=[...seen.values()];
}

/* ---------- 3. the folding view ---------- */
function rotAbout(p,A,d,ang){            // rotate 3D point p about the line through A with direction d
  const v=[p[0]-A[0],p[1]-A[1],p[2]-A[2]];
  const c=Math.cos(ang), s=Math.sin(ang);
  const kv=crs3(d,v), kd=dot3(d,v);
  return [v[0]*c+kv[0]*s+d[0]*kd*(1-c)+A[0],
          v[1]*c+kv[1]*s+d[1]*kd*(1-c)+A[1],
          v[2]*c+kv[2]*s+d[2]*kd*(1-c)+A[2]];
}
class FoldView{
  constructor(stage){
    this.stage=stage;
    this.world=document.createElement("div"); this.world.className="world";
    this.wrap=document.createElement("div"); this.wrap.className="netwrap";
    this.world.appendChild(this.wrap); stage.appendChild(this.world);
    this.t=0; this.spin=-24; this.tilt=56; this.onFace=null; this.moved=0; this.hover=-1;
    this.stage.addEventListener("keydown",e=>{
      if(e.key!=="Enter"&&e.key!==" ") return;
      const s=e.target.closest&&e.target.closest("[data-i]");
      if(!s||!this.onFace) return;
      e.preventDefault(); this.onFace(+s.dataset.i);
    });
    this._drag();
    this._hover();
    observeSize(stage,()=>this.build());
  }
  /* exactly one face highlights: the innermost one the pointer is actually over */
  _hover(){
    const set=i=>{
      if(i===this.hover) return;
      const n=this.nodes||[];
      if(n[this.hover]) n[this.hover].classList.remove("hovered");
      this.hover=i;
      if(i>=0&&n[i]) n[i].classList.add("hovered");
    };
    this.setHover=set;
    this.stage.addEventListener("pointermove",e=>{
      if(e.pointerType!=="mouse"||!this.onFace) return;   // no sticky hover on touch
      const el=e.target.closest("[data-i]");
      set(el?+el.dataset.i:-1);
    });
    this.stage.addEventListener("pointerleave",()=>set(-1));
  }
  _drag(){
    let on=false,px=0,py=0,sx=0,sy=0,slop=9,hit=null;
    this.stage.addEventListener("pointerdown",e=>{
      if(e.target.closest("button")) return;
      e.preventDefault();                 // no native text selection or drag-image
      on=true;px=sx=e.clientX;py=sy=e.clientY;this.moved=0;
      slop=e.pointerType==="touch"?16:9;  // fingers wobble more than mice
      hit=e.target.closest("[data-i]");   // captured before pointer capture retargets
      this.stage.setPointerCapture(e.pointerId);
    });
    this.stage.addEventListener("dragstart",e=>e.preventDefault());
    this.stage.addEventListener("pointermove",e=>{
      if(!on) return;
      this.moved=Math.max(this.moved,Math.hypot(e.clientX-sx,e.clientY-sy));
      this.spin+=(e.clientX-px)*0.42;
      // 0° = straight-down plan view, 90° = edge on, past 90° = looking up at the underside
      this.tilt=Math.max(-20,Math.min(170,this.tilt-(e.clientY-py)*0.32));
      px=e.clientX;py=e.clientY;this.update();
    });
    this.stage.addEventListener("pointerup",()=>{
      if(on&&hit&&this.moved<=slop&&this.onFace) this.onFace(+hit.dataset.i);
      on=false;hit=null;
    });
    this.stage.addEventListener("pointercancel",()=>{on=false;hit=null;});
  }
  stopAnim(){ cancelAnimationFrame(this._raf); this._raf=0; }
  setNet(net,opts){
    this.stopAnim();
    this.net=net;
    this.opts=Object.assign({star:-1,marks:{},clash:false,clashSides:null},opts||{});
    this.build();
  }
  resetView(){ this.spin=-24; this.tilt=56; this.update(); }
  setFold(v){ this.t=Math.max(0,Math.min(1,v)); this.update(); }

  build(){
    const net=this.net; if(!net) return;
    const W=this.stage.clientWidth, H=this.stage.clientHeight;
    if(!W||!H) return;
    const xs=[].concat(...net.polys.map(p=>p.map(q=>q[0])));
    const ys=[].concat(...net.polys.map(p=>p.map(q=>q[1])));
    const x0=Math.min(...xs), y0=Math.min(...ys);
    const bw=Math.max(...xs)-x0, bh=Math.max(...ys)-y0;
    // the mat is tilted, so the net needs less vertical room than horizontal
    const sc=Math.min(170, W*0.84/bw, H*0.84/(bh*0.72));
    const PW=bw*sc, PH=bh*sc;
    const to=p=>[(p[0]-x0)*sc,(p[1]-y0)*sc];
    const polys=net.polys.map(p=>p.map(to));
    const hinges=net.hinge.map(hg=>hg?{a:to(hg.a),d:hg.d,theta:hg.theta}:null);
    this.px={polys,hinges,PW,PH};

    // where to sit the camera: net centre when flat, solid centre when folded
    this.cFlat=[PW/2,PH/2,0];
    this.cSolid=(()=>{
      const pts=[];
      for(let i=0;i<polys.length;i++){
        let v=polys[i].map(p=>[p[0],p[1],0]);
        let cur=i, chain=[];
        while(net.parent[cur]>=0){chain.push(cur);cur=net.parent[cur];}
        for(const c of chain){
          const hg=hinges[c], A=[hg.a[0],hg.a[1],0], d=[hg.d[0],hg.d[1],0];
          v=v.map(p=>rotAbout(p,A,d,hg.theta));
        }
        pts.push(...v);
      }
      return mean3(pts);
    })();

    this.wrap.innerHTML="";
    this.hover=-1;
    const fs=Math.max(11,Math.min(30,sc*0.3));
    const nodes=polys.map((poly,i)=>{
      const n=document.createElement("div"); n.className="face";
      if(this.opts.star===i) n.classList.add("star");
      const cx=poly.reduce((s,p)=>s+p[0],0)/poly.length, cy=poly.reduce((s,p)=>s+p[1],0)/poly.length;
      const svg=document.createElementNS(SVGNS,"svg");
      svg.setAttribute("width",PW); svg.setAttribute("height",PH);
      svg.setAttribute("viewBox","0 0 "+PW+" "+PH);
      const pg=document.createElementNS(SVGNS,"polygon");
      pg.setAttribute("class","pf");
      pg.setAttribute("points",poly.map(p=>p[0].toFixed(2)+","+p[1].toFixed(2)).join(" "));
      pg.setAttribute("fill","var(--c"+(i%6)+")");
      pg.dataset.i=i;
      svg.appendChild(pg);
      // the crease this flap folds on
      const hg=hinges[i];
      if(hg){
        const ln=document.createElementNS(SVGNS,"line");
        ln.setAttribute("class","crease");
        const L=this.creaseSpan(poly,hg);
        ln.setAttribute("x1",L[0][0]);ln.setAttribute("y1",L[0][1]);
        ln.setAttribute("x2",L[1][0]);ln.setAttribute("y2",L[1][1]);
        svg.appendChild(ln);
      }
      // inset outline: sized from the face's own inradius so it always clears the
      // shared edge, on a big desktop face or a small one on a phone
      const inr=Math.min(...poly.map((q,k)=>{
        const r=poly[(k+1)%poly.length], vx=r[0]-q[0], vy=r[1]-q[1], L=Math.hypot(vx,vy)||1;
        return Math.abs((cx-q[0])*vy-(cy-q[1])*vx)/L;
      }));
      const hw=Math.max(2.5,Math.min(5.5,inr*0.14));
      const inset=1-Math.min(0.18,(hw*0.75+1.5)/Math.max(inr,1));
      n.style.setProperty("--hw",hw.toFixed(2)+"px");
      const hl=document.createElementNS(SVGNS,"polygon");
      hl.setAttribute("class","hl");
      hl.setAttribute("points",poly.map(q=>
        (cx+(q[0]-cx)*inset).toFixed(2)+","+(cy+(q[1]-cy)*inset).toFixed(2)).join(" "));
      svg.appendChild(hl);
      n.appendChild(svg);
      const txt=this.opts.star===i ? "★" : String(i+1);
      for(const side of ["f","b"]){
        const sp=document.createElement("span");
        sp.className="lab-num "+side; sp.textContent=txt;
        sp.style.left=cx+"px"; sp.style.top=cy+"px"; sp.style.fontSize=fs+"px";
        sp.style.transform = side==="f" ? "translate(-50%,-50%) translateZ(.5px)"
                                        : "translate(-50%,-50%) rotateY(180deg) translateZ(.5px)";
        n.appendChild(sp);
      }
      if(this.onFace){ n.classList.add("tappable"); pg.setAttribute("tabindex","0"); }
      return n;
    });
    this.nodes=nodes;
    for(const i of net.order){
      if(net.parent[i]<0) continue;
      nodes[net.parent[i]].appendChild(nodes[i]);
    }
    this.wrap.appendChild(nodes[net.root]);
    this.applyMarks();
    this.update();
  }
  creaseSpan(poly,hg){                    // the polygon edge that lies on the hinge line
    let best=null,bd=Infinity;
    for(let k=0;k<poly.length;k++){
      const p=poly[k],q=poly[(k+1)%poly.length];
      const d1=Math.abs((p[0]-hg.a[0])*hg.d[1]-(p[1]-hg.a[1])*hg.d[0]);
      const d2=Math.abs((q[0]-hg.a[0])*hg.d[1]-(q[1]-hg.a[1])*hg.d[0]);
      if(d1+d2<bd){bd=d1+d2;best=[p,q];}
    }
    return best;
  }
  applyMarks(){
    if(!this.nodes) return;
    const m=this.opts.marks||{};
    this.nodes.forEach((n,i)=>{
      n.classList.toggle("pick",!!m[i]);
      n.classList.remove("clash");
    });
    const cs=this.opts.clashSides;
    if(this.opts.clash&&cs){
      const c={}; cs.forEach(s=>c[s]=(c[s]||0)+1);
      this.nodes.forEach((n,i)=>{ if(c[cs[i]]>1) n.classList.add("clash"); });
    }
  }
  mark(i,on){ this.opts.marks[i]=on; this.applyMarks(); }
  showClash(on){ this.opts.clash=on; this.applyMarks(); }
  update(){
    if(!this.px) return;
    const t=this.t;
    this.stage.classList.toggle("folded",t>0.02);
    this.world.style.transform="rotateX("+this.tilt+"deg) rotateZ("+this.spin+"deg)";
    const c=[0,1,2].map(k=>this.cFlat[k]+(this.cSolid[k]-this.cFlat[k])*t);
    this.wrap.style.transform="translate3d("+(-c[0])+"px,"+(-c[1])+"px,"+(-c[2])+"px)";
    this.nodes.forEach((n,i)=>{
      const hg=this.px.hinges[i]; if(!hg) return;
      const deg=hg.theta*t*180/Math.PI;
      n.style.transform="translate3d("+hg.a[0]+"px,"+hg.a[1]+"px,0) rotate3d("
        +hg.d[0].toFixed(6)+","+hg.d[1].toFixed(6)+",0,"+deg.toFixed(3)+"deg) translate3d("
        +(-hg.a[0])+"px,"+(-hg.a[1])+"px,0)";
    });
  }
  animateTo(target,ms){
    if(matchMedia("(prefers-reduced-motion: reduce)").matches){ this.setFold(target); return; }
    cancelAnimationFrame(this._raf);
    const from=this.t, t0=performance.now(); ms=ms||850;
    const step=now=>{
      const k=Math.min(1,(now-t0)/ms);
      const e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
      this.setFold(from+(target-from)*e);
      if(onFoldTick) onFoldTick(this.t);
      if(k<1) this._raf=requestAnimationFrame(step);
    };
    this._raf=requestAnimationFrame(step);
  }
}
let onFoldTick=null;

function netThumb(net){
  const xs=[].concat(...net.polys.map(p=>p.map(q=>q[0])));
  const ys=[].concat(...net.polys.map(p=>p.map(q=>q[1])));
  const x0=Math.min(...xs),y0=Math.min(...ys),bw=Math.max(...xs)-x0,bh=Math.max(...ys)-y0;
  const svg=document.createElementNS(SVGNS,"svg");
  svg.setAttribute("viewBox",(x0-0.06)+" "+(y0-0.06)+" "+(bw+0.12)+" "+(bh+0.12));
  svg.setAttribute("preserveAspectRatio","xMidYMid meet");
  for(const poly of net.polys){
    const pg=document.createElementNS(SVGNS,"polygon");
    pg.setAttribute("points",poly.map(p=>p[0].toFixed(3)+","+p[1].toFixed(3)).join(" "));
    svg.appendChild(pg);
  }
  return svg;
}

function foldStage(stage){
  onFoldTick=null;
  stage.append(h("div","hint",t("drag")));
  const rb=h("button","reset",t("reset"));
  stage.appendChild(rb);
  const view=new FoldView(stage);
  rb.onclick=()=>view.resetView();
  return view;
}

/* ---------- 7. game 1 — Fold Lab ---------- */
let foldShape="cube", foldIdx=0;
function renderFoldLab(side,stage){
  const view=foldStage(stage);
  let nets=[];

  const p0=h("div","panel");
  p0.append(h("h4",null,t("shape").toUpperCase()));
  const shapes=h("div","shapes");
  SHAPES.forEach(s=>{
    const b=h("button","shape",t(s.name));
    b.setAttribute("aria-pressed",s.id===foldShape);
    b.onclick=()=>{ foldShape=s.id; foldIdx=0; loadShape(); };
    shapes.appendChild(b);
  });
  p0.appendChild(shapes);

  const p1=h("div","panel");
  p1.append(h("h4",null,t("fold").toUpperCase()));
  const lw=h("div","lever-wrap");
  lw.appendChild(h("div","ticks"));
  const lever=document.createElement("input");
  lever.type="range";lever.min=0;lever.max=1000;lever.value=0;lever.className="lever";
  lever.setAttribute("aria-label",t("fold"));
  lw.appendChild(lever);
  const ll=h("div","leverlab"); ll.append(h("span",null,t("flat")),h("span",null,t("solid")));
  lw.appendChild(ll);
  p1.appendChild(lw);
  const rowb=h("div","rowbtns"); rowb.style.marginTop="14px";
  const bFold=h("button","btn",t("foldIt")), bFlat=h("button","btn alt",t("flatten"));
  rowb.append(bFold,bFlat); p1.appendChild(rowb);

  const p2=h("div","panel");
  const h4=h("h4",null,t("nets").toUpperCase());
  const strip=h("div","strip-nets");
  const note=h("p","note");
  p2.append(h4,strip,note);

  side.append(p0,p1,p2);
  lever.oninput=()=>{ view.stopAnim(); view.setFold(lever.value/1000); };
  onFoldTick=v=>lever.value=Math.round(v*1000);
  bFold.onclick=()=>view.animateTo(1);
  bFlat.onclick=()=>view.animateTo(0);

  function loadShape(){
    nets=netsOfSolid(foldShape);
    if(foldIdx>=nets.length) foldIdx=0;
    [...shapes.children].forEach((b,k)=>b.setAttribute("aria-pressed",SHAPES[k].id===foldShape));
    strip.innerHTML="";
    nets.forEach((n,i)=>{
      const b=h("button","thumb"); b.appendChild(netThumb(n));
      b.setAttribute("aria-pressed",i===foldIdx);
      b.onclick=()=>{ foldIdx=i; show(); [...strip.children].forEach((x,k)=>x.setAttribute("aria-pressed",k===i)); };
      strip.appendChild(b);
    });
    note.textContent=t("netsHelp")(nets.length,t(SHAPES.find(s=>s.id===foldShape).name));
    show();
  }
  function show(){
    view.setNet(nets[foldIdx]);
    view.setFold(0); lever.value=0; view.resetView();
  }
  loadShape();
}

/* ---------- 8. game 2 — Folds or not? (cubes) ---------- */
function renderNetQuiz(side,stage){
  const view=foldStage(stage);
  hudQuestion(stage,t("qNet"));
  const score=hudScore(stage);
  const act=hudActions(stage);
  const bYes=h("button","abtn yes",t("yesFold")), bNo=h("button","abtn no",t("noFold"));
  act.append(bYes,bNo);
  let answered=false, a=null, clashTimer=0, lastCells=null;
  pending.push(()=>clearTimeout(clashTimer));

  function deal(){
    clearTimeout(clashTimer);
    answered=false; act.hidden=false;
    let cells;
    do{ cells=Math.random()<0.5?rand(NETS_CUBE):rand(NOTNETS); }while(cells===lastCells);
    lastCells=cells;
    const net=netFromCells(cells); a=net.analysis;
    view.setNet(net,{clashSides:a.sides});
    view.setFold(0); view.resetView();
  }
  function answer(said){
    if(answered) return; answered=true;
    const ok=(said===a.valid);
    act.hidden=true;
    score.hit(ok);
    view.animateTo(1,1100);
    if(!a.valid) clashTimer=setTimeout(()=>view.showClash(true),1100);
    if(ok) scraps(stage);
    celebrate(stage,ok,
      a.valid ? t("okNet")+" "+t("okNetW") : t("badNet")+" "+t("clashW")(a.stacked,a.holes),
      deal, t("next"));
  }
  bYes.onclick=()=>answer(true);
  bNo.onclick=()=>answer(false);
  deal();
}

/* ---------- 9. game 3 — Opposite sides (cubes) ---------- */
function renderOpposite(side,stage){
  const view=foldStage(stage);
  stage.classList.add("pickmode");     // picking is the main action here, so one cursor throughout
  hudQuestion(stage,t("qOpp"));
  const score=hudScore(stage);
  let answered=false, star=0, a=null, lastKey={cells:null,star:-1};

  function deal(){
    answered=false;
    let cells,net;
    do{
      cells=rand(NETS_CUBE); net=netFromCells(cells); a=net.analysis;
      star=Math.floor(Math.random()*6);
    }while(cells===lastKey.cells && star===lastKey.star);
    lastKey={cells,star};
    view.onFace=pick;
    view.setNet(net,{star:star});
    view.setFold(0); view.resetView();
  }
  function pick(i){
    if(answered||i===star) return;
    answered=true;
    const target=a.sides.indexOf(a.sides[star]^1);   // ^1 flips +axis to -axis
    const ok=i===target;
    view.mark(i,true); view.mark(target,true);
    score.hit(ok);
    view.animateTo(1,1100);
    if(ok) scraps(stage);
    celebrate(stage,ok, ok?t("oppOk")(star+1,target+1):t("oppBad")(i+1,star+1,target+1),
      deal, t("nextO"));
  }
  deal();
}

/* ============================================================
   ARCADE 1 — Solid Lab: tap the nets that fold into a cube
   30s. Shapes live 2s. 70% gold / 30% blue. 200/150/100/50 by
   speed; blue adds a second; wrong tap -100. One more shape
   allowed on screen every 10s of hidden play time, up to 5.
   ============================================================ */
/* the largest bounding box any of the 35 shapes occupies, in cells */
const HEX_BOX=(()=>{
  let w=0,h=0;
  for(const c of [...NETS_CUBE,...NOTNETS]){
    const rs=c.map(p=>p[0]), cs=c.map(p=>p[1]);
    w=Math.max(w,Math.max(...cs)-Math.min(...cs)+1);
    h=Math.max(h,Math.max(...rs)-Math.min(...rs)+1);
  }
  return {w,h};
})();
/* (slot layout lives in games/spawner.js)
   Lay the play area out as a grid of slots, one shape per slot. Overlap then
   becomes impossible by construction rather than something rejection sampling
   has to stumble on, which also lets the shapes be far bigger. Pick whichever
   grid gives the largest cell while still offering at least 5 slots. */
function arcCubeShape(cell){
  const correct=Math.random()<0.5;
  const cells=correct?rand(NETS_CUBE):rand(NOTNETS);
  const blue=Math.random()<0.3;                       // 70% gold / 30% blue
  const rows=cells.map(p=>p[0]), cols=cells.map(p=>p[1]);
  const r0=Math.min(...rows), c0=Math.min(...cols);
  const nr=Math.max(...rows)-r0+1, nc=Math.max(...cols)-c0+1;
  const svg=document.createElementNS(SVGNS,"svg");
  const w=nc*cell, hgt=nr*cell;
  svg.setAttribute("width",w); svg.setAttribute("height",hgt);
  svg.setAttribute("viewBox","0 0 "+w+" "+hgt);
  for(const [r,c] of cells){
    const rc=document.createElementNS(SVGNS,"rect");
    rc.setAttribute("x",(c-c0)*cell); rc.setAttribute("y",(r-r0)*cell);
    rc.setAttribute("width",cell); rc.setAttribute("height",cell);
    rc.setAttribute("rx",3);
    rc.setAttribute("fill",blue?"var(--c3)":"var(--c1)");
    rc.setAttribute("stroke","rgba(255,255,255,.85)");
    rc.setAttribute("stroke-width",2);
    svg.appendChild(rc);
  }
  return {el:svg,w:w,h:hgt,correct:correct,blue:blue};
}
function renderCubeArcade(side,stage){
  let shapes=[], plan=slotPlan(stage,HEX_BOX);
  const clear=()=>{ shapes.forEach(s=>s.el.remove()); shapes=[]; };
  observeSize(stage,()=>{ plan=slotPlan(stage,HEX_BOX); });

  function spawn(api,played){
    const taken=new Set(shapes.map(s=>s.slot));
    const free=[];
    for(let i=0;i<plan.cols*plan.rows;i++) if(!taken.has(i)) free.push(i);
    if(!free.length) return;                  // cannot happen while the cap is 5
    const slot=rand(free);
    const made=arcCubeShape(plan.cell);
    // sit the shape anywhere inside its own slot, inset by half the gap on each
    // side — neighbouring slots therefore stay a full gap apart
    const sx=ARC_SIDE+(slot%plan.cols)*plan.sw, sy=ARC_TOP+Math.floor(slot/plan.cols)*plan.sh;
    const rx=Math.max(0,plan.sw-ARC_GAP-made.w), ry=Math.max(0,plan.sh-ARC_GAP-made.h);
    const x=sx+ARC_GAP/2+Math.random()*rx, y=sy+ARC_GAP/2+Math.random()*ry;
    const el=h("div","arc-shape");
    el.style.animationDuration=(280*api.tm)+"ms";   // fade-in stretches with the pacing too
    el.style.left=x+"px"; el.style.top=y+"px";
    el.style.width=made.w+"px"; el.style.height=made.h+"px";
    el.appendChild(made.el);
    const rec={el,x:x,y:y,w:made.w,h:made.h,slot:slot,born:played,
               correct:made.correct,blue:made.blue,dead:false};
    el.addEventListener("pointerdown",e=>{ e.stopPropagation(); tap(rec,api,played); });
    stage.appendChild(el);
    shapes.push(rec);
  }
  function tap(rec,api){
    if(!api.running||rec.dead) return;
    rec.dead=true;
    const cx=rec.x+rec.w/2, cy=rec.y+rec.h/2;
    if(rec.correct){
      const got=api.award(arcPoints(api.played-rec.born,api.tm));
      api.pop(cx,cy,"+"+got,"var(--c1)");
      if(rec.blue){ api.addTime(1000); api.pop(cx,cy-34,t("bonusSec"),"var(--c2)"); sfxBlue(); }
      else sfxGold();
    }else{
      api.penalise(100);
      api.pop(cx,cy,"-100","var(--red)");
      sfxWrong();
    }
    rec.el.classList.add("hit");
    setTimeout(()=>rec.el.remove(),220);
    shapes=shapes.filter(s=>s!==rec);
  }
  arcadeShell(stage,{
    key:"cube", how:"arcHow",
    rules:[["var(--c1)","ruleGold"],["var(--c3)","ruleBlue"],["var(--red)","ruleWrong"]],
    reset(){ plan=slotPlan(stage,HEX_BOX); clear(); },
    cleanup(){ clear(); },
    comboPos:"tl",
    frame(dt,played,api){
      const life=ARC_LIFE*api.tm, fade=ARC_FADE*api.tm;
      for(const s of shapes) if(played-s.born>=fade&&!s.el.classList.contains("out")){
        s.el.style.animationDuration=((ARC_LIFE-ARC_FADE)*api.tm)+"ms";
        s.el.classList.add("out");
      }
      const gone=shapes.filter(s=>played-s.born>=life);
      if(gone.length){ gone.forEach(s=>s.el.remove()); shapes=shapes.filter(s=>played-s.born<life); }
      // difficulty ramp on the hidden play clock. `holding` ignores shapes that are
      // already fading, so at level 1 the next appears as the last fades — the hard
      // cap keeps 5 on screen from ever being exceeded.
      const allowed=Math.min(5,1+Math.floor(played/(10000*api.tm)));
      const holding=shapes.filter(s=>played-s.born<fade).length;
      if(holding<allowed && shapes.length<5) spawn(api,played);
    }
  });
}

export default {
  games:[
    {id:"fold", name:"gFold", blurb:"gFoldP", render:renderFoldLab},
    {id:"net",  name:"gNet",  blurb:"gNetP",  render:renderNetQuiz,   full:true},
    {id:"opp",  name:"gOpp",  blurb:"gOppP",  render:renderOpposite,  full:true},
    {id:"arc",  name:"gArc",  blurb:"gArcP",  render:renderCubeArcade,full:true, rainbow:true}
  ]
};
