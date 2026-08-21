/* Workbench — Place Value Lab
   Strings only. Add a language by adding a block here. */
export default {
  en:{
    gBench:"Place Bench",
    gBenchP:"Build a number, block by block.",
    thLabel:"Th", hLabel:"H", tLabel:"T", oLabel:"O",
    benchHelp:"Each column can only hold 0 to 9. Ten of one column makes one of the next.",
    expandLbl:"Expanded form",
    altLbl:"Another way to say it",
    hundredsWord:"hundreds", onesWord:"ones",
    gRound:"Round It",
    gRoundP:"Round to the nearest 10 or 100.",
    qRound:function(n,unit){return "Round "+n+" to the nearest "+unit+".";},
    roundWhy:function(n,lo,hi,ans){return n+" sits between "+lo+" and "+hi+" — the nearest one is "+ans+".";},
    gZero:"Below Zero",
    gZeroP:"Two thermometers. Compare what's colder.",
    freezing:"0°C — freezing",
    zeroHelp:"Drag both levers. Colder numbers sit further below zero.",
    gOrder:"Compare & Order",
    gOrderP:"Which is bigger? Which is smallest?",
    qWhich:"Which symbol goes in the middle?",
    qBiggest:"Tap the biggest number.",
    qSmallest:"Tap the smallest number.",
    cmpWhy:function(a,b,sym,place){return place==null
      ? a+" "+sym+" "+b+" — every digit matches."
      : a+" "+sym+" "+b+" — look at the "+place+" column first.";},
    orderWhy:function(list){return "In order: "+list.join(" < ")+".";},
    placeTh:"thousands", placeH:"hundreds", placeT:"tens", placeO:"ones",
    nextQ:"Next question"
  },
  vi:{
    gBench:"Bàn Giá Trị",
    gBenchP:"Xây một con số, từng khối một.",
    thLabel:"N", hLabel:"T", tLabel:"C", oLabel:"Đ",
    benchHelp:"Mỗi cột chỉ chứa được từ 0 đến 9. Mười của cột này thành một của cột kế tiếp.",
    expandLbl:"Dạng khai triển",
    altLbl:"Một cách nói khác",
    hundredsWord:"trăm", onesWord:"đơn vị",
    gRound:"Làm Tròn",
    gRoundP:"Làm tròn đến hàng chục hoặc hàng trăm.",
    qRound:function(n,unit){return "Làm tròn "+n+" đến hàng "+unit+".";},
    roundWhy:function(n,lo,hi,ans){return n+" nằm giữa "+lo+" và "+hi+" — số gần nhất là "+ans+".";},
    gZero:"Dưới Số 0",
    gZeroP:"Hai nhiệt kế. So xem cái nào lạnh hơn.",
    freezing:"0°C — điểm đóng băng",
    zeroHelp:"Kéo cả hai cần gạt. Số càng lạnh thì càng ở dưới 0 xa hơn.",
    gOrder:"So Sánh & Sắp Xếp",
    gOrderP:"Số nào lớn hơn? Số nào nhỏ nhất?",
    qWhich:"Dấu nào điền vào giữa?",
    qBiggest:"Chạm vào số lớn nhất.",
    qSmallest:"Chạm vào số nhỏ nhất.",
    cmpWhy:function(a,b,sym,place){return place==null
      ? a+" "+sym+" "+b+" — mọi chữ số đều giống nhau."
      : a+" "+sym+" "+b+" — nhìn vào hàng "+place+" trước tiên.";},
    orderWhy:function(list){return "Thứ tự: "+list.join(" < ")+".";},
    placeTh:"nghìn", placeH:"trăm", placeT:"chục", placeO:"đơn vị",
    nextQ:"Câu tiếp theo"
  }
};
