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
    nextQ:"Next question",
    arcHowTma:"Drag a number onto the grid cell where its row and column multiply to match. Fill a whole row or column to clear it for points — clear a row and column together and it pays out even more.",
    ruleTmaLine:"Clear a row or a column — 300 points, +1s",
    ruleTmaDual:"Clear a row and a column together — 1000 points, +3s",
    ruleTmaMiss:"Wrong cell — 100 points off",
    tmaBonus3s:"+3s",
    tmaDiffNote:"Normal uses whole numbers only. Hard mixes in decimals. The clock is 30s either way.",
    gVenn:"Venn Sort",
    gVennP:"One number truly belongs in the diagram. Find it and drag it home.",
    qVenn:"Only one of these numbers fits the diagram. Drag it to where it belongs.",
    divTitle:function(n){return "Divisible by "+n;},
    vennBothLabel:function(x,y){return "Divisible by both "+x+" and "+y;},
    vennDivOk:function(val,d,q){return val+" ÷ "+d+" = "+q;},
    vennDivNo:function(val,d,r){return val+" ÷ "+d+" → remainder "+r;},
    vennWhy:function(region,val,x,y){
      if(region==="both") return val+" belongs where the circles overlap — it divides evenly by both "+x+" and "+y+".";
      if(region==="left") return val+" belongs only in the "+x+" circle — it divides evenly by "+x+" but not by "+y+".";
      return val+" belongs only in the "+y+" circle — it divides evenly by "+y+" but not by "+x+".";
    }
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
    nextQ:"Câu tiếp theo",
    arcHowTma:"Kéo một số vào ô mà hàng và cột của nó nhân lại đúng bằng số đó. Điền kín một hàng hoặc một cột để xoá và ghi điểm — xoá cả hàng và cột cùng lúc thì được nhiều điểm hơn nữa.",
    ruleTmaLine:"Xoá một hàng hoặc một cột — 300 điểm, +1 giây",
    ruleTmaDual:"Xoá cả hàng và cột cùng lúc — 1000 điểm, +3 giây",
    ruleTmaMiss:"Sai ô — trừ 100 điểm",
    tmaBonus3s:"+3 giây",
    tmaDiffNote:"Bình thường chỉ dùng số nguyên. Khó có thêm số thập phân. Đồng hồ vẫn 30 giây.",
    gVenn:"Xếp Biểu Đồ Venn",
    gVennP:"Chỉ một số thực sự thuộc biểu đồ. Tìm nó và kéo về đúng chỗ.",
    qVenn:"Chỉ một trong các số này thuộc biểu đồ. Kéo nó vào đúng chỗ.",
    divTitle:function(n){return "Chia hết cho "+n;},
    vennBothLabel:function(x,y){return "Chia hết cho cả "+x+" và "+y;},
    vennDivOk:function(val,d,q){return val+" ÷ "+d+" = "+q;},
    vennDivNo:function(val,d,r){return val+" ÷ "+d+" → dư "+r;},
    vennWhy:function(region,val,x,y){
      if(region==="both") return val+" thuộc phần hai vòng tròn chồng lên nhau — nó chia hết cho cả "+x+" và "+y+".";
      if(region==="left") return val+" chỉ thuộc vòng tròn "+x+" — nó chia hết cho "+x+" nhưng không chia hết cho "+y+".";
      return val+" chỉ thuộc vòng tròn "+y+" — nó chia hết cho "+y+" nhưng không chia hết cho "+x+".";
    }
  }
};
