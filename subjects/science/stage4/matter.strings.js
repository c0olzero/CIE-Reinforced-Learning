/* Workbench — Matter Lab
   Strings only. Add a language by adding a block here. */
export default {
  en:{
    gMtBench:"Particle Bench",
    gMtBenchP:"Heat it and cool it. Watch the particles change their minds.",
    gMtSort:"Solid, Liquid or Gas?",
    gMtSortP:"Sort everyday things into the three states.",
    gMtChange:"Name the Change",
    gMtChangeP:"Melting, freezing, evaporating or condensing?",
    gMtArc:"Arcade",
    gMtArcP:"Sort them into the right jar before they land.",

    mtSolid:"Solid",
    mtLiquid:"Liquid",
    mtGas:"Gas",
    mtState:"State",
    mtBenchHelp:"Slide between the three states and watch what the same particles do in each one.",
    mtRangeSolid:"Water is solid ice below 0°C",
    mtRangeLiquid:"Water is liquid between 0°C and 100°C",
    mtRangeGas:"Water is a gas above 100°C",
    mtSolidNote:"Packed in a fixed pattern. They only wobble on the spot, so a solid keeps its own shape.",
    mtLiquidNote:"Still touching, but free to slide past each other — so a liquid takes the shape of its container.",
    mtGasNote:"Far apart and moving fast in every direction, so a gas spreads out to fill all the space it can.",

    mtQSort:"Solid, liquid or gas?",
    mtSortWhy:function(item,state){return item+" is a "+state.toLowerCase()+".";},
    mtItems:{
      ice:"Ice", rock:"A rock", book:"A book", coin:"A coin", wood:"Wood", key:"A key",
      water:"Water", milk:"Milk", juice:"Juice", honey:"Honey", tea:"Tea", oil:"Oil",
      steam:"Steam", air:"Air", helium:"Helium in a balloon", fizz:"The fizz in a drink"
    },
    mtScenes:{
      iceCube:"An ice cube left out on a plate.",
      snow:"Snow in the spring sunshine.",
      choc:"Chocolate held in a warm hand.",
      freezer:"Water left in the freezer overnight.",
      frost:"A puddle on a freezing night.",
      puddle:"A puddle drying up in the sun.",
      washing:"Wet washing on the line all afternoon.",
      kettle:"Water boiling away in a kettle.",
      mirror:"Steam hitting a cold bathroom mirror.",
      coldGlass:"A cold glass on a hot day goes wet outside."
    },

    mtQChange:"What is this change called?",
    mtMelting:"Melting",
    mtFreezing:"Freezing",
    mtEvaporating:"Evaporating",
    mtCondensing:"Condensing",
    mtChangeArrow:function(from,to){return from+" → "+to;},
    mtChangeWhy:function(from,to,name){return from+" turning into "+to+" is called "+name.toLowerCase()+".";},

    arcHowMt:"Boxes drop from the top. Send each one to the jar for its state before it reaches the bottom. The box's colour tells you what it pays, not what is inside it.",
    ruleMtGold:"Gold box, right jar — 300 points",
    ruleMtBlue:"Blue box, right jar — 300 points and 1 extra second",
    ruleMtBad:"Wrong jar — 150 points off",
    ruleMtMiss:"Let one land — 100 points off",
    mtBinHint:"Click a jar, or press 1, 2 or 3."
  },
  vi:{
    gMtBench:"Bàn Hạt",
    gMtBenchP:"Đun nóng rồi làm lạnh. Xem các hạt đổi ý thế nào.",
    gMtSort:"Rắn, Lỏng hay Khí?",
    gMtSortP:"Phân loại đồ vật quen thuộc vào ba thể.",
    gMtChange:"Gọi Tên Sự Biến Đổi",
    gMtChangeP:"Nóng chảy, đông đặc, bay hơi hay ngưng tụ?",
    gMtArc:"Đua điểm",
    gMtArcP:"Phân loại vào đúng lọ trước khi chúng rơi xuống.",

    mtSolid:"Chất rắn",
    mtLiquid:"Chất lỏng",
    mtGas:"Chất khí",
    mtState:"Thể",
    mtBenchHelp:"Trượt qua ba thể và xem cùng những hạt đó hoạt động thế nào ở mỗi thể.",
    mtRangeSolid:"Dưới 0°C nước là thể rắn (nước đá)",
    mtRangeLiquid:"Từ 0°C đến 100°C nước là thể lỏng",
    mtRangeGas:"Trên 100°C nước là thể khí",
    mtSolidNote:"Xếp chặt theo một trật tự cố định. Chúng chỉ rung tại chỗ, nên chất rắn giữ nguyên hình dạng.",
    mtLiquidNote:"Vẫn chạm nhau nhưng trượt được qua nhau — nên chất lỏng mang hình dạng của vật chứa.",
    mtGasNote:"Cách xa nhau và chuyển động rất nhanh theo mọi hướng, nên chất khí lan ra chiếm hết không gian.",

    mtQSort:"Rắn, lỏng hay khí?",
    mtSortWhy:function(item,state){return item+" là "+state.toLowerCase()+".";},
    mtItems:{
      ice:"Nước đá", rock:"Hòn đá", book:"Quyển sách", coin:"Đồng xu",
      wood:"Gỗ", key:"Chìa khoá",
      water:"Nước", milk:"Sữa", juice:"Nước ép", honey:"Mật ong",
      tea:"Trà", oil:"Dầu",
      steam:"Hơi nước", air:"Không khí", helium:"Khí heli trong bong bóng",
      fizz:"Bọt ga trong nước ngọt"
    },
    mtScenes:{
      iceCube:"Viên đá để quên trên đĩa.",
      snow:"Tuyết dưới nắng xuân.",
      choc:"Sô cô la cầm trong tay ấm.",
      freezer:"Nước để trong ngăn đá qua đêm.",
      frost:"Vũng nước trong đêm lạnh giá.",
      puddle:"Vũng nước khô dần dưới nắng.",
      washing:"Quần áo ướt phơi cả buổi chiều.",
      kettle:"Nước sôi cạn dần trong ấm.",
      mirror:"Hơi nước bám vào gương lạnh trong nhà tắm.",
      coldGlass:"Ly nước lạnh ngày nóng bị ướt bên ngoài."
    },

    mtQChange:"Sự biến đổi này gọi là gì?",
    mtMelting:"Nóng chảy",
    mtFreezing:"Đông đặc",
    mtEvaporating:"Bay hơi",
    mtCondensing:"Ngưng tụ",
    mtChangeArrow:function(from,to){return from+" → "+to;},
    mtChangeWhy:function(from,to,name){return from+" biến thành "+to+" gọi là "+name.toLowerCase()+".";},

    arcHowMt:"Các hộp rơi từ trên xuống. Hãy đưa mỗi hộp vào lọ đúng thể của nó trước khi chạm đáy. Màu hộp cho biết phần thưởng, không phải thứ bên trong.",
    ruleMtGold:"Hộp vàng, đúng lọ — 300 điểm",
    ruleMtBlue:"Hộp xanh, đúng lọ — 300 điểm và thêm 1 giây",
    ruleMtBad:"Sai lọ — trừ 150 điểm",
    ruleMtMiss:"Để rơi mất — trừ 100 điểm",
    mtBinHint:"Bấm vào một lọ, hoặc nhấn phím 1, 2 hoặc 3."
  }
};
