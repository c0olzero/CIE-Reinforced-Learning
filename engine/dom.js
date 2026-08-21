/* Workbench — DOM helpers, shared timers and small utilities
   Part of a static, offline-capable learning app. No tracking, no accounts. */

const SVGNS="http://www.w3.org/2000/svg";

function h(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}

const rand=arr=>arr[Math.floor(Math.random()*arr.length)];

let pending=[];
function stopPending(){ pending.forEach(f=>f()); pending=[]; }

/* Multiple-choice options without a rejection loop. The old `while(set.size<4)`
   spun forever whenever fewer than four values existed in range — 1/3 + 1/3 and
   every 2/d - 1/d froze the tab outright. Draw from a real pool instead, and
   offer fewer buttons rather than never returning. */
function pickOptions(ans,lo,hi,want,near){
  const shuffle=arr=>{ for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1)); const t=arr[i]; arr[i]=arr[j]; arr[j]=t; } return arr; };
  const close=[], far=[], w=near||1e9;
  for(let v=lo;v<=hi;v++){
    if(v===ans) continue;
    (Math.abs(v-ans)<=w ? close : far).push(v);
  }
  // near misses first, distant values only to fill out a thin range
  const pool=shuffle(close).concat(shuffle(far));
  return [ans].concat(pool.slice(0,Math.max(0,want-1))).sort((x,y)=>x-y);
}

/* Resize handling: coalesce to one callback per frame, and stop observing when
   the screen goes away. Observers used to pile up on every tab switch. */
function observeSize(el,fn){
  let queued=0;
  const ro=new ResizeObserver(()=>{
    if(queued) return;
    queued=requestAnimationFrame(()=>{ queued=0; fn(); });
  });
  ro.observe(el);
  pending.push(()=>{ ro.disconnect(); if(queued) cancelAnimationFrame(queued); });
  return ro;
}

function scraps(host){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cols=["var(--c0)","var(--c1)","var(--c2)","var(--c3)","var(--c4)","var(--c5)"];
  for(let i=0;i<16;i++){
    const s=h("div","scrap");
    s.style.background=cols[i%6];
    s.style.left="50%"; s.style.top="46%";
    s.style.setProperty("--dx",(Math.random()*300-150)+"px");
    s.style.setProperty("--dy",(Math.random()*-220-40)+"px");
    s.style.setProperty("--rot",(Math.random()*720-360)+"deg");
    s.style.animation="fly "+(700+Math.random()*500)+"ms cubic-bezier(.2,.7,.4,1) forwards";
    host.appendChild(s);
    setTimeout(()=>s.remove(),1400);
  }
}

export {SVGNS, h, rand, pending, stopPending, pickOptions, observeSize, scraps};
