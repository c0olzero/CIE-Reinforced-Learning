/* Workbench — Statistics Lab (chance & probability)
   Strings only. Add a language by adding a block here. */
export default {
  en:{
    gChSpin:"Spinner Bench",
    gChSpinP:"Spin it a few times, then spin it a lot. Watch the results settle.",
    gChWords:"Chance Words",
    gChWordsP:"Impossible, unlikely, even chance, likely, certain — pick the right word.",

    chSpinHelp:"Spin once to see one result, or spin many at once to see the pattern.",
    chNewSpinner:"New Spinner",
    chSpinOnce:"Spin",
    chSpinMany:"Spin ×20",
    chResultsLbl:"What you got",
    chExpectedLbl:"What's expected",
    chSpinsCount:function(n){return n+(n===1?" spin":" spins");},

    chQLikely:function(name){return "How likely is the spinner to land on "+name+"?";},
    chImpossible:"Impossible",
    chUnlikely:"Unlikely",
    chEven:"Even Chance",
    chLikely:"Likely",
    chCertain:"Certain",
    chWhy:function(n,word){return n+" out of 8 sections, so it's "+word+".";},
    nextQ:"Next question"
  },
  vi:{
    gChSpin:"Bàn Vòng Quay",
    gChSpinP:"Quay vài lần, rồi quay thật nhiều lần. Xem kết quả ổn định dần.",
    gChWords:"Từ Chỉ Khả Năng",
    gChWordsP:"Không thể, khó xảy ra, ngang nhau, dễ xảy ra, chắc chắn — chọn đúng từ.",

    chSpinHelp:"Quay một lần để xem một kết quả, hoặc quay nhiều lần liền để thấy quy luật.",
    chNewSpinner:"Vòng Quay Mới",
    chSpinOnce:"Quay",
    chSpinMany:"Quay ×20",
    chResultsLbl:"Kết quả của bạn",
    chExpectedLbl:"Kết quả dự kiến",
    chSpinsCount:function(n){return n+" lần quay";},

    chQLikely:function(name){return "Khả năng vòng quay dừng ở màu "+name+" là bao nhiêu?";},
    chImpossible:"Không Thể",
    chUnlikely:"Khó Xảy Ra",
    chEven:"Ngang Nhau",
    chLikely:"Dễ Xảy Ra",
    chCertain:"Chắc Chắn",
    chWhy:function(n,word){return n+" trên 8 phần, nên là "+word+".";},
    nextQ:"Câu tiếp theo"
  }
};
