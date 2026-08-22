/* Workbench — the catalogue.

   Card titles live HERE, not in the module's own strings file: the hub draws
   every card before any module is fetched, so anything it displays has to be
   available without loading the module.

   Every module is tagged with its syllabus, stage and the curriculum objectives
   it covers, so a teacher can find the game for the objective they are teaching
   and gaps in coverage are visible at a glance. `load` is a dynamic import: the
   code for a module is only fetched when someone opens it.

   Every module also carries a `strand` — the top-level choice on the hub's
   first screen, matching the Cambridge framework's own strands (Number,
   Geometry & Measure, Statistics & Probability). A module without one won't
   appear under any strand. */

export const SUBJECTS=[
  {id:"math", name:"subjMath", syllabus:"0096"}
];

export const STRANDS=[
  { id:"number", name:{en:"Number", vi:"Số"},
    blurb:{en:"Place value, times tables, fractions and decimals.",
           vi:"Giá trị theo vị trí, bảng nhân, phân số và số thập phân."} },
  { id:"geometry", name:{en:"Geometry & Measure", vi:"Hình Học & Đo Lường"},
    blurb:{en:"Shapes, angles, position and units.",
           vi:"Hình khối, góc, vị trí và đơn vị đo."} },
  { id:"stats", name:{en:"Statistics & Probability", vi:"Thống Kê & Xác Suất"},
    blurb:{en:"Charts, data and the language of chance.",
           vi:"Biểu đồ, dữ liệu và ngôn ngữ của xác suất."} }
];

export const CATALOGUE=[
  { id:"solids", subject:"math", stage:4, strand:"geometry", live:true,
    title:{en:"Solid Lab", vi:"Xưởng Hình Khối"},
    blurb:{en:"Flatten a solid into paper — then fold it back up.", vi:"Trải một khối thành giấy phẳng, rồi gấp lại."}, colors:[0,1,2,3,4,5],
    objectives:["4Gg.05","4Gg.06"],
    load:()=>import("../subjects/math/stage4/solids.js") },

  { id:"ang", subject:"math", stage:4, strand:"geometry", live:true,
    title:{en:"Angle Lab", vi:"Xưởng Góc"},
    blurb:{en:"Tell acute from right from obtuse — and catch a reflex.", vi:"Phân biệt góc nhọn, góc vuông, góc tù — và bắt được góc phản."}, colors:[2,1,3,5,4],
    objectives:["4Gg.08","4Gg.09"],
    load:()=>import("../subjects/math/stage4/angles.js") },

  { id:"sym", subject:"math", stage:4, strand:"geometry", live:true,
    title:{en:"Symmetry Lab", vi:"Xưởng Đối Xứng"},
    blurb:{en:"Spot the lines that split a shape into matching halves.", vi:"Tìm đường chia hình thành hai nửa giống hệt nhau."}, colors:[3,5,2],
    objectives:["4Gg.07","4Gp.03"],
    load:()=>import("../subjects/math/stage4/symmetry.js") },

  { id:"frac", subject:"math", stage:4, strand:"number", live:true,
    title:{en:"Fraction Lab", vi:"Xưởng Phân Số"},
    blurb:{en:"Cut it, shade it, compare it. Fractions and percentages.", vi:"Cắt, tô, so sánh. Phân số và phần trăm."}, colors:[1,2,3,1,2,3],
    objectives:["4Nf.01","4Nf.02","4Nf.03","4Nf.04","4Nf.05","4Nf.06","4Nf.07"],
    load:()=>import("../subjects/math/stage4/fractions.js") },

  { id:"times", subject:"math", stage:4, strand:"number", live:true,
    title:{en:"Times Tables", vi:"Bảng Nhân"},
    blurb:{en:"Build the array, find the missing factor, shift by 10 and 100.",
           vi:"Xếp mảng nhân, tìm số còn thiếu, nhân chia cho 10 và 100."}, colors:[4,5,0],
    objectives:["4Ni.04","4Ni.07","4Ni.08"],
    load:()=>import("../subjects/math/stage4/times.js") },

  { id:"place", subject:"math", stage:4, strand:"number", live:true,
    title:{en:"Place Value", vi:"Giá Trị Theo Vị Trí"},
    blurb:{en:"Build a number in blocks, round it, and explore below zero.",
           vi:"Xây một số bằng khối, làm tròn, và khám phá dưới 0."}, colors:[3,4,1,2],
    objectives:["4Np.01","4Np.02","4Np.03","4Np.05"],
    load:()=>import("../subjects/math/stage4/place.js") },

  // ——— planned; see README for the full Stage 4 coverage map ———
  { id:"time",  subject:"math", stage:4, strand:"geometry",
    title:{en:"Telling Time", vi:"Xem Giờ"},
    blurb:{en:"Coming next.", vi:"Sắp có."},
    objectives:["4Gt.01","4Gt.02","4Gt.03","4Gt.04"] }
];
