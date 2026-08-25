/* Workbench — Telling Time
   Strings only. Add a language by adding a block here. */
const EN_HOUR_WORDS=["twelve","one","two","three","four","five","six","seven",
  "eight","nine","ten","eleven"];
const EN_MIN_WORDS={5:"five",10:"ten",15:"quarter",20:"twenty",25:"twenty-five",30:"half"};

export default {
  en:{
    gClock:"Clock Bench",
    gClockP:"Drag the hands and watch the digital time keep up.",
    gUnits:"Unit Converter",
    gUnitsP:"Turn days into hours, hours into minutes, minutes into seconds.",
    gRead:"Read the Clock",
    gReadP:"What time does the clock show?",
    gUnitQuiz:"Convert It!",
    gUnitQuizP:"Change days, hours, minutes and seconds into each other.",
    gElapsed:"Elapsed Time",
    gElapsedP:"Work out how long it's been, or what time it'll be.",
    hour:"Hour",
    minute:"Minute",
    ampm:"Morning or afternoon",
    am:"am",
    pm:"pm",
    amShort:"AM",
    pmShort:"PM",
    fromUnit:"From",
    toUnit:"To",
    amount:"Amount",
    dayOne:"day", dayMany:"days",
    secOne:"second", secMany:"seconds",
    qRead:"What time does the clock show?",
    readWhy:function(truth){return "The clock shows "+truth+".";},
    pastToPhrase:function(hh,mm){
      const hw=EN_HOUR_WORDS[hh%12];
      if(mm===0) return hw+" o'clock";
      if(mm<=30) return EN_MIN_WORDS[mm]+" past "+hw;
      const nextH=(hh%12)+1;
      return EN_MIN_WORDS[60-mm]+" to "+EN_HOUR_WORDS[nextH%12];
    },
    qUnitConvert:function(fromText,toUnit){return fromText+" = ?? "+toUnit;},
    unitWhyMul:function(oneUnit,ratio,manyUnit,valText,truthText){return "1 "+oneUnit+" = "+ratio+" "+manyUnit+", so "+valText+" = "+truthText+".";},
    unitWhyDiv:function(ratio,manyUnit,oneUnit,valText,truthText){return ratio+" "+manyUnit+" = 1 "+oneUnit+", so "+valText+" = "+truthText+".";},
    qDuration:"How long is it from the first time to the second?",
    qEndTime:function(dur){return "It's "+dur+" later. What time is it now?";},
    qBeforeTime:function(dur){return "It was "+dur+" before this time. What time was it?";},
    elapsedWhy:function(s,e,dur){return "From "+s+" to "+e+" is "+dur+".";},
    clkMins:"minutes",
    clkMin1:"minute",
    clkHrs:"hours",
    clkHr1:"hour",
    nextQ:"Next question"
  },
  vi:{
    gClock:"Đồng Hồ",
    gClockP:"Kéo kim đồng hồ và xem giờ điện tử thay đổi theo.",
    gUnits:"Đổi Đơn Vị",
    gUnitsP:"Đổi ngày sang giờ, giờ sang phút, phút sang giây.",
    gRead:"Xem Đồng Hồ",
    gReadP:"Đồng hồ đang chỉ mấy giờ?",
    gUnitQuiz:"Đổi Xem Nào!",
    gUnitQuizP:"Đổi ngày, giờ, phút và giây qua lại với nhau.",
    gElapsed:"Khoảng Thời Gian",
    gElapsedP:"Tính xem đã trôi qua bao lâu, hoặc bây giờ là mấy giờ.",
    hour:"Giờ",
    minute:"Phút",
    ampm:"Sáng hay chiều",
    am:"sáng",
    pm:"chiều",
    amShort:"SA",
    pmShort:"CH",
    fromUnit:"Từ",
    toUnit:"Sang",
    amount:"Số lượng",
    dayOne:"ngày", dayMany:"ngày",
    secOne:"giây", secMany:"giây",
    qRead:"Đồng hồ đang chỉ mấy giờ?",
    readWhy:function(truth){return "Đồng hồ đang chỉ "+truth+".";},
    pastToPhrase:function(hh,mm){
      if(mm===0) return hh+" giờ đúng";
      if(mm===30) return hh+" giờ rưỡi";
      if(mm<30) return hh+" giờ "+mm+" phút";
      const nextH=(hh%12)+1;
      return nextH+" giờ kém "+(60-mm)+" phút";
    },
    qUnitConvert:function(fromText,toUnit){return fromText+" = ?? "+toUnit;},
    unitWhyMul:function(oneUnit,ratio,manyUnit,valText,truthText){return "1 "+oneUnit+" = "+ratio+" "+manyUnit+", nên "+valText+" = "+truthText+".";},
    unitWhyDiv:function(ratio,manyUnit,oneUnit,valText,truthText){return ratio+" "+manyUnit+" = 1 "+oneUnit+", nên "+valText+" = "+truthText+".";},
    qDuration:"Từ thời điểm đầu đến thời điểm sau là bao lâu?",
    qEndTime:function(dur){return "Đã trôi qua "+dur+". Bây giờ là mấy giờ?";},
    qBeforeTime:function(dur){return "Trước đó "+dur+". Lúc đó là mấy giờ?";},
    elapsedWhy:function(s,e,dur){return "Từ "+s+" đến "+e+" là "+dur+".";},
    clkMins:"phút",
    clkMin1:"phút",
    clkHrs:"giờ",
    clkHr1:"giờ",
    nextQ:"Câu tiếp theo"
  }
};
