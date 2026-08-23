/* Workbench — Times Table Lab
   Strings only. Add a language by adding a block here. */
export default {
  en:{
    gTmBench:"Multiplication Bench",
    gTmBenchP:"Build an array and watch the facts appear.",
    rows:"Rows",
    cols:"Columns",
    tmBenchHelp:"Drag both levers. The grid is the multiplication — count it any way you like.",
    showCol:function(n){return "Show "+n+" column"+(n===1?"":"s")+".";},
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
    nextQ:"Next question",
    arcHowTma:"Drag a number onto the grid cell where its row and column multiply to match. Fill a whole row or column to clear it for points — clear a row and column together and it pays out even more.",
    ruleTmaLine:"Clear a row or a column — 300 points, +1s",
    ruleTmaDual:"Clear a row and a column together — 1000 points, +3s",
    ruleTmaMiss:"Wrong cell — 100 points off",
    tmaBonus3s:"+3s"
  },
  vi:{
    gTmBench:"Bàn Nhân",
    gTmBenchP:"Xếp một mảng ô vuông rồi xem các phép tính hiện ra.",
    rows:"Hàng",
    cols:"Cột",
    tmBenchHelp:"Kéo cả hai cần gạt. Lưới ô chính là phép nhân — đếm kiểu nào cũng được.",
    showCol:function(n){return "Xem "+n+" cột.";},
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
    nextQ:"Câu tiếp theo",
    arcHowTma:"Kéo một số vào ô mà hàng và cột của nó nhân lại đúng bằng số đó. Điền kín một hàng hoặc một cột để xoá và ghi điểm — xoá cả hàng và cột cùng lúc thì được nhiều điểm hơn nữa.",
    ruleTmaLine:"Xoá một hàng hoặc một cột — 300 điểm, +1 giây",
    ruleTmaDual:"Xoá cả hàng và cột cùng lúc — 1000 điểm, +3 giây",
    ruleTmaMiss:"Sai ô — trừ 100 điểm",
    tmaBonus3s:"+3 giây"
  }
};
