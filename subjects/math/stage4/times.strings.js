/* Workbench — Times Table Lab
   Strings only. Add a language by adding a block here. */
export default {
  en:{
    gBench:"Times Bench",
    gBenchP:"Build an array and watch the facts appear.",
    rows:"Rows",
    cols:"Columns",
    benchHelp:"Drag both levers. The grid is the multiplication — count it any way you like.",
    gFact:"Missing Factor",
    gFactP:"One number is hiding. Find it.",
    qFact:"What number is missing?",
    factWhy:function(a,b,c){return a+" × "+b+" = "+c+".";},
    gShift:"Shift by 10 & 100",
    gShiftP:"Multiply and divide by 10 and 100.",
    qShift:"What is the answer?",
    shiftWhyMul:function(n,factor,ans){return "×"+factor+" moves every digit "+
      (factor===10?"one place":"two places")+" left — "+n+" becomes "+ans+".";},
    shiftWhyDiv:function(n,factor,ans){return "÷"+factor+" moves every digit "+
      (factor===10?"one place":"two places")+" right — "+n+" becomes "+ans+".";},
    nextQ:"Next question"
  },
  vi:{
    gBench:"Bàn Nhân",
    gBenchP:"Xếp một mảng ô vuông rồi xem các phép tính hiện ra.",
    rows:"Hàng",
    cols:"Cột",
    benchHelp:"Kéo cả hai cần gạt. Lưới ô chính là phép nhân — đếm kiểu nào cũng được.",
    gFact:"Số Còn Thiếu",
    gFactP:"Có một số đang trốn. Tìm nó ra.",
    qFact:"Số nào còn thiếu?",
    factWhy:function(a,b,c){return a+" × "+b+" = "+c+".";},
    gShift:"Nhân Chia 10 & 100",
    gShiftP:"Nhân và chia cho 10 và 100.",
    qShift:"Kết quả là bao nhiêu?",
    shiftWhyMul:function(n,factor,ans){return "×"+factor+" dịch mỗi chữ số "+
      (factor===10?"một hàng":"hai hàng")+" sang trái — "+n+" thành "+ans+".";},
    shiftWhyDiv:function(n,factor,ans){return "÷"+factor+" dịch mỗi chữ số "+
      (factor===10?"một hàng":"hai hàng")+" sang phải — "+n+" thành "+ans+".";},
    nextQ:"Câu tiếp theo"
  }
};
