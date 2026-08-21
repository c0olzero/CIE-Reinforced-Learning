/* Workbench — slot-grid spawner shared by tap-the-shape arcades */

/* Placement is a grid of slots, one item per slot, so overlap is impossible by
   construction rather than something rejection sampling has to stumble on. */
export function arcPoints(ageMs,tm){
  const a=ageMs/tm;                        // bands stretch with the pacing
  if(a<500)  return 200;
  if(a<1000) return 150;
  if(a<1500) return 100;
  return 50;
}
/* Lay the play area out as a grid of slots, one shape per slot. Overlap then
   becomes impossible by construction rather than something rejection sampling
   has to stumble on, which also lets the shapes be far bigger. Pick whichever
   grid gives the largest cell while still offering at least 5 slots. */
export const ARC_TOP=92, ARC_BOT=28, ARC_SIDE=16, ARC_GAP=16;
export function slotPlan(stage,BOX){
  const pw=Math.max(80,stage.clientWidth-ARC_SIDE*2);
  const ph=Math.max(80,stage.clientHeight-ARC_TOP-ARC_BOT);
  let best=null;
  for(let cols=1;cols<=7;cols++) for(let rows=1;rows<=4;rows++){
    if(cols*rows<5) continue;                       // never fewer slots than shapes
    const sw=pw/cols, sh=ph/rows;
    const cell=Math.min((sw-ARC_GAP)/BOX.w,(sh-ARC_GAP)/BOX.h);
    if(!best||cell>best.cell) best={cell,cols,rows,sw,sh};
  }
  best.cell=Math.max(13,Math.min(62,Math.floor(best.cell)));
  best.pw=pw; best.ph=ph;
  return best;
}
