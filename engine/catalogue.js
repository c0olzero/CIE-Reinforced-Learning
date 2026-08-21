/* Workbench — the catalogue.

   Every module is tagged with its syllabus, stage and the curriculum objectives
   it covers, so a teacher can find the game for the objective they are teaching
   and gaps in coverage are visible at a glance. `load` is a dynamic import: the
   code for a module is only fetched when someone opens it. */

export const SUBJECTS=[
  {id:"math", name:"subjMath", syllabus:"0096"}
];

export const CATALOGUE=[
  { id:"solids", subject:"math", stage:4, live:true,
    name:"modCube", blurb:"modCubeP", colors:[0,1,2,3,4,5],
    objectives:["4Gg.05","4Gg.06"],
    load:()=>import("../subjects/math/stage4/solids.js") },

  { id:"ang", subject:"math", stage:4, live:true,
    name:"modAng", blurb:"modAngP", colors:[2,1,3,5,4],
    objectives:["4Gg.08","4Gg.09"],
    load:()=>import("../subjects/math/stage4/angles.js") },

  { id:"frac", subject:"math", stage:4, live:true,
    name:"modFrac2", blurb:"modFrac2P", colors:[1,2,3,1,2,3],
    objectives:["4Nf.01","4Nf.02","4Nf.03","4Nf.04","4Nf.05","4Nf.06","4Nf.07"],
    load:()=>import("../subjects/math/stage4/fractions.js") },

  // ——— planned; see README for the full Stage 4 coverage map ———
  { id:"times", subject:"math", stage:4, name:"modTimes", blurb:"modTimesP",
    objectives:["4Ni.04","4Ni.07","4Ni.08"] },
  { id:"place", subject:"math", stage:4, name:"modPlace", blurb:"modPlaceP",
    objectives:["4Np.01","4Np.02","4Np.03","4Np.05"] },
  { id:"time",  subject:"math", stage:4, name:"modClock", blurb:"modClockP",
    objectives:["4Gt.01","4Gt.02","4Gt.03","4Gt.04"] }
];
