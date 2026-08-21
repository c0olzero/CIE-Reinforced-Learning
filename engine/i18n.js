/* Workbench — language table and lookup
   Part of a static, offline-capable learning app. No tracking, no accounts. */

/* Core strings live here. Each subject module registers its own with
   addStrings(), so a translator can add a language without touching game code. */
export const T = {
  en:{
    loading:"Loading…", loadFail:"Could not load that. Check your connection.",
    subjMath:"Mathematics",
    brand:"Workbench",
    tagline:"mini-games for curious kids",
    back:"Back",
    lang:"Tiếng Việt",
    lede:["Learn by ","making a mess"," of it."],
    sub:"Pick a workshop. Each one holds a few small games that only work if you actually understand the idea.",
    subStrand:"Pick a strand to start exploring the framework.",
    noneYet:"Nothing here yet — check back soon.",
    soon:"in the workshop",
    pattern:"Pattern",
    right:"Nice.",
    wrong:"Not this one.",
    cubeOnly:"This game uses cubes only.",
    streak:"Streak",
    best:"Best",
    solved:"Solved",
    gArc:"Arcade",
    gArcP:"Beat the clock. Chase a high score.",
    scoreL:"Score",
    bestL:"Best",
    ready:"Ready?",
    start:"Start",
    again:"Play again",
    timeUp:"Time's up!",
    newBest:"NEW BEST!",
    playedFor:function(s){return "You lasted "+s+" seconds.";},
    finalBest:function(b){return "Best so far: "+b;},
    percent:"Percent",
    qEq:"Equal to",
    qGt:"Bigger than",
    qLt:"Smaller than",
    diffPick:"Select your difficulty",
    toHard:"Switch to hard mode",
    toNormal:"Switch to normal mode",
    diffN:"Normal",
    diffH:"Hard",
    diffNote:"Normal slows the pacing. The clock is 30s either way.",
    comboLbl:"Combo",
    bonusSec:"+1s"
  },
  vi:{
    loading:"Đang tải…", loadFail:"Không tải được. Kiểm tra kết nối nhé.",
    subjMath:"Toán",
    brand:"Bàn Thợ",
    tagline:"trò chơi nhỏ cho bạn nhỏ tò mò",
    back:"Quay lại",
    lang:"English",
    lede:["Học bằng cách ","nghịch cho tới khi hiểu","."],
    sub:"Chọn một xưởng. Mỗi xưởng có vài trò chơi nhỏ, chỉ thắng được khi mình thật sự hiểu.",
    subStrand:"Chọn một mạch kiến thức để bắt đầu khám phá.",
    noneYet:"Chưa có gì ở đây — quay lại sau nhé.",
    soon:"đang làm",
    pattern:"Hình trải",
    right:"Giỏi lắm.",
    wrong:"Chưa đúng.",
    cubeOnly:"Trò này chỉ dùng khối lập phương.",
    streak:"Chuỗi",
    best:"Kỷ lục",
    solved:"Đã giải",
    gArc:"Đua điểm",
    gArcP:"Chạy đua với đồng hồ. Săn kỷ lục.",
    scoreL:"Điểm",
    bestL:"Kỷ lục",
    ready:"Sẵn sàng chưa?",
    start:"Bắt đầu",
    again:"Chơi lại",
    timeUp:"Hết giờ!",
    newBest:"KỶ LỤC MỚI!",
    playedFor:function(s){return "Bạn đã chơi "+s+" giây.";},
    finalBest:function(b){return "Kỷ lục: "+b;},
    percent:"Phần trăm",
    qEq:"Bằng",
    qGt:"Lớn hơn",
    qLt:"Nhỏ hơn",
    diffPick:"Chọn độ khó",
    toHard:"Chuyển sang chế độ Khó",
    toNormal:"Chuyển sang chế độ Bình thường",
    diffN:"Bình thường",
    diffH:"Khó",
    diffNote:"Chế độ Bình thường chậm hơn. Đồng hồ vẫn 30 giây.",
    comboLbl:"Chuỗi",
    bonusSec:"+1 giây"
  }
};


let L="en";
export const t = k => T[L][k];
export const getLang = () => L;
export const setLang = v => { L=v; document.documentElement.lang=v; };
export function addStrings(more){ for(const lang in more) Object.assign(T[lang],more[lang]); }


/* ============================================================
   2. GEOMETRY

   Two producers, one consumer.
   (a) grid nets  — 6 squares on a grid, used by the cube quizzes
                    (they need INVALID shapes too, which only the
                    grid enumeration can give us)
   (b) solid nets — any polyhedron, unfolded along a spanning tree
   Both emit the same flat-net format that the renderer eats.
   ============================================================ */
