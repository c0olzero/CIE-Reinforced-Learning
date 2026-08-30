/* Workbench — the catalogue.

   Card titles live HERE, not in the module's own strings file: the hub draws
   every card before any module is fetched, so anything it displays has to be
   available without loading the module.

   Every module is tagged with its syllabus, stage and the curriculum objectives
   it covers, so a teacher can find the game for the objective they are teaching
   and gaps in coverage are visible at a glance. `load` is a dynamic import: the
   code for a module is only fetched when someone opens it.

   The hub is four levels: subject -> strand -> module -> game. Every module
   carries both a `subject` and a `strand`; every strand carries the `subject`
   it belongs to. A module missing either won't be reachable from the hub.

   Strand ids must stay unique across subjects — they are the route key. */

export const SUBJECTS=[
  { id:"math", syllabus:"0096",
    name:{en:"Mathematics", vi:"Toán"},
    blurb:{en:"Number, shape, measure and data.",
           vi:"Số, hình, phép đo và dữ liệu."} },
  { id:"science", syllabus:"0097",
    name:{en:"Science", vi:"Khoa Học"},
    blurb:{en:"Living things, materials, energy and the Earth.",
           vi:"Sinh vật, vật chất, năng lượng và Trái Đất."} }
];

export const STRANDS=[
  { id:"number", subject:"math", name:{en:"Number", vi:"Số"},
    blurb:{en:"Place value, times tables, fractions, decimals and time.",
           vi:"Giá trị theo vị trí, bảng nhân, phân số, số thập phân và thời gian."} },
  { id:"geometry", subject:"math", name:{en:"Geometry & Measure", vi:"Hình Học & Đo Lường"},
    blurb:{en:"Shapes, angles, position and units.",
           vi:"Hình khối, góc, vị trí và đơn vị đo."} },
  { id:"stats", subject:"math", name:{en:"Statistics & Probability", vi:"Thống Kê & Xác Suất"},
    blurb:{en:"Charts, data and the language of chance.",
           vi:"Biểu đồ, dữ liệu và ngôn ngữ của xác suất."} },

  { id:"bio", subject:"science", name:{en:"Biology", vi:"Sinh Học"},
    blurb:{en:"Plants, bodies, animal groups and food chains.",
           vi:"Thực vật, cơ thể, nhóm động vật và chuỗi thức ăn."} },
  { id:"chem", subject:"science", name:{en:"Chemistry", vi:"Hoá Học"},
    blurb:{en:"Solids, liquids, gases and what materials can do.",
           vi:"Chất rắn, chất lỏng, chất khí và tính chất vật liệu."} },
  { id:"phys", subject:"science", name:{en:"Physics", vi:"Vật Lý"},
    blurb:{en:"Energy, heat, light, forces and magnets.",
           vi:"Năng lượng, nhiệt, ánh sáng, lực và nam châm."} },
  { id:"earth", subject:"science", name:{en:"Earth & Space", vi:"Trái Đất & Vũ Trụ"},
    blurb:{en:"Inside the Earth, its soils, and the day-night cycle.",
           vi:"Bên trong Trái Đất, các loại đất, và chu kỳ ngày đêm."} }
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
    blurb:{en:"Build the array, find the missing factor, race the arcade.",
           vi:"Xếp mảng nhân, tìm số còn thiếu, đua trong xưởng trò chơi."}, colors:[4,5,0],
    objectives:["4Ni.04"],
    load:()=>import("../subjects/math/stage4/times.js") },

  { id:"place", subject:"math", stage:4, strand:"number", live:true,
    title:{en:"Place Value", vi:"Giá Trị Theo Vị Trí"},
    blurb:{en:"Build a number with sliders, round it, and explore below zero.",
           vi:"Xây một số bằng thanh trượt, làm tròn, và khám phá dưới 0."}, colors:[3,4,1,2],
    objectives:["4Np.01","4Np.02","4Np.03","4Np.05","4Ni.07","4Ni.08"],
    load:()=>import("../subjects/math/stage4/place.js") },

  { id:"time",  subject:"math", stage:4, strand:"number", live:true,
    title:{en:"Telling Time", vi:"Xem Giờ"},
    blurb:{en:"Read a clock, switch between 12- and 24-hour time, and work out how long something takes.",
           vi:"Xem giờ, đổi giữa giờ 12 và giờ 24, và tính xem việc gì đó mất bao lâu."}, colors:[1,3,5,2],
    objectives:["4Gt.01","4Gt.02","4Gt.03","4Gt.04"],
    load:()=>import("../subjects/math/stage4/time.js") },

  { id:"perim", subject:"math", stage:4, strand:"geometry", live:true,
    title:{en:"Perimeter & Area", vi:"Chu Vi & Diện Tích"},
    blurb:{en:"Trace a shape's edge, split its area, then measure one yourself.",
           vi:"Lần theo cạnh của một hình, chia diện tích, rồi tự mình đo một hình."}, colors:[2,4,5],
    objectives:["4Gg.02","4Gg.03","4Gg.04"],
    load:()=>import("../subjects/math/stage4/perimeter.js") },

  { id:"data", subject:"math", stage:4, strand:"stats", live:true,
    title:{en:"Data Lab", vi:"Xưởng Dữ Liệu"},
    blurb:{en:"Sort it into a diagram, chart it, then read it back.",
           vi:"Phân loại vào sơ đồ, vẽ biểu đồ, rồi đọc lại."}, colors:[3,4,5,0],
    objectives:["4Ss.01","4Ss.02","4Ss.03"],
    load:()=>import("../subjects/math/stage4/data.js") },

  { id:"chance", subject:"math", stage:4, strand:"stats", live:true,
    title:{en:"Statistics Lab", vi:"Xưởng Thống Kê"},
    blurb:{en:"Spin it, tally it, then say how likely it was.",
           vi:"Quay, kiểm đếm, rồi nói xem khả năng xảy ra là bao nhiêu."}, colors:[0,2,3,5],
    objectives:["4Sp.01","4Sp.02"],
    load:()=>import("../subjects/math/stage4/chance.js") },

  /* ---- Science (0097) ----
     The Stage 4 science summary we are working from lists topics by section
     number rather than Cambridge's own objective codes, so `objectives` here
     carries those section refs ("Sci 2.1"). Swap them for the real codes when
     the full framework is to hand — nothing but this field depends on them. */
  { id:"matter", subject:"science", stage:4, strand:"chem", live:true,
    title:{en:"Matter Lab", vi:"Xưởng Vật Chất"},
    blurb:{en:"Heat it, cool it, and name what just happened.",
           vi:"Đun nóng, làm lạnh, rồi gọi tên điều vừa xảy ra."}, colors:[3,2,1,5],
    objectives:["Sci 2.1"],
    load:()=>import("../subjects/science/stage4/matter.js") }
];
