/* Workbench — Place Value Lab
   Strings only. Add a language by adding a block here. */
export default {
  en:{
    gPvBench:"Number Bench",
    gPvBenchP:"Build a number with sliders, then shift it by 10.",
    pvBenchHelp:"Drag each slider to set a digit. ×10 and ÷10 shift every digit's place value.",
    expandLbl:"Expanded form",
    wordsLbl:"In words",
    pvbHTh:"Hundred thousands", pvbTTh:"Ten thousands", pvbTh:"Thousands", pvbH:"Hundreds", pvbT:"Tens", pvbO:"Ones",
    pvbTenths:"Tenths", pvbHundredths:"Hundredths",
    pvbDiv10:"÷10", pvbMul10:"×10",
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
    gPvBench:"Bàn Giá Trị",
    gPvBenchP:"Xây một số bằng các thanh trượt, rồi dịch chuyển nó theo hệ số 10.",
    pvBenchHelp:"Kéo mỗi thanh trượt để đặt một chữ số. ×10 và ÷10 dịch chuyển giá trị theo vị trí của mỗi chữ số.",
    expandLbl:"Dạng khai triển",
    wordsLbl:"Viết bằng chữ",
    pvbHTh:"Trăm nghìn", pvbTTh:"Chục nghìn", pvbTh:"Nghìn", pvbH:"Trăm", pvbT:"Chục", pvbO:"Đơn vị",
    pvbTenths:"Phần mười", pvbHundredths:"Phần trăm",
    pvbDiv10:"÷10", pvbMul10:"×10",
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
