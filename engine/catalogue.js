/* Workbench — the catalogue.

   Card titles live HERE, not in the module's own strings file: the hub draws
   every card before any module is fetched, so anything it displays has to be
   available without loading the module.

   Every module is tagged with its syllabus, stage and the curriculum objectives
   it covers, so a teacher can find the game for the objective they are teaching
   and gaps in coverage are visible at a glance. `load` is a dynamic import: the
   code for a module is only fetched when someone opens it. */

export const SUBJECTS=[
  {id:"math", name:"subjMath", syllabus:"0096"}
];

export const CATALOGUE=[
  { id:"solids", subject:"math", stage:4, live:true,
    title:{en:"Solid Lab", vi:"Xưởng Hình Khối"},
    blurb:{en:"Flatten a solid into paper — then fold it back up.", vi:"Trải một khối thành giấy phẳng, rồi gấp lại."}, colors:[0,1,2,3,4,5],
    objectives:["4Gg.05","4Gg.06"],
    load:()=>import("../subjects/math/stage4/solids.js") },

  { id:"ang", subject:"math", stage:4, live:true,
    title:{en:"Angle Lab", vi:"Xưởng Góc"},
    blurb:{en:"Tell acute from right from obtuse — and catch a reflex.", vi:"Phân biệt góc nhọn, góc vuông, góc tù — và bắt được góc phản."}, colors:[2,1,3,5,4],
    objectives:["4Gg.08","4Gg.09"],
    load:()=>import("../subjects/math/stage4/angles.js") },

  { id:"frac", subject:"math", stage:4, live:true,
    title:{en:"Fraction Lab", vi:"Xưởng Phân Số"},
    blurb:{en:"Cut it, shade it, compare it. Fractions and percentages.", vi:"Cắt, tô, so sánh. Phân số và phần trăm."}, colors:[1,2,3,1,2,3],
    objectives:["4Nf.01","4Nf.02","4Nf.03","4Nf.04","4Nf.05","4Nf.06","4Nf.07"],
    load:()=>import("../subjects/math/stage4/fractions.js") },

  // ——— planned; see README for the full Stage 4 coverage map ———
  { id:"times", subject:"math", stage:4, title:{en:"Times Tables", vi:"Bảng Nhân"},
    blurb:{en:"Coming next.", vi:"Sắp có."},
    objectives:["4Ni.04","4Ni.07","4Ni.08"] },
  { id:"place", subject:"math", stage:4, title:{en:"Place Value", vi:"Giá Trị Theo Vị Trí"},
    blurb:{en:"Coming next.", vi:"Sắp có."},
    objectives:["4Np.01","4Np.02","4Np.03","4Np.05"] },
  { id:"time",  subject:"math", stage:4, title:{en:"Telling Time", vi:"Xem Giờ"},
    blurb:{en:"Coming next.", vi:"Sắp có."},
    objectives:["4Gt.01","4Gt.02","4Gt.03","4Gt.04"] }
];
