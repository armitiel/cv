/* Logical pixels are independent of the resolution of a downloaded WebP. */
window.ATOMIC_CHERRY_CONFIG = {
  width: 2816, height: 1965, duration: 8600,
  layers: [
    {id:'background', asset:'background', label:'Tło', x:0, y:0, width:2816, height:1592, z:0, at:0, duration:900, from:{scale:1.04}},
    {id:'body', asset:'frame', label:'Obudowa', x:528, y:223, width:1761, height:1228, z:4, at:500, duration:1000, clip:'inset(74% 0 0 0)', from:{y:180,scale:.94}},
    {id:'reels', asset:'reels', label:'Bębny', x:670, y:407, width:1478, height:698, z:3, at:1450, duration:1000, from:{y:140,scale:.92}},
    {id:'sides', asset:'sides', label:'Boki', x:412, y:560, width:1993, height:713, z:2, at:2250, duration:1000, from:{scale:1.25}},
    {id:'frame', asset:'frame', label:'Rama', x:528, y:223, width:1761, height:1228, z:5, at:3100, duration:1000, clip:'inset(0 0 26% 0)', from:{y:-150,scale:1.04}},
    {id:'jackpot', asset:'jackpot', label:'Jackpot', x:776, y:100, width:1265, height:279, z:6, at:3950, duration:950, from:{y:-150,scale:.94}},
    {id:'ac-jackpot', asset:'ac-jackpot', label:'Logo jackpotu', x:1081, y:147, width:652, height:170, z:7, at:4900, duration:700, from:{y:25,scale:.9}},
    {id:'jackpot-value', asset:'jackpot-value', label:'Wartość jackpotu', x:1119, y:329, width:574, height:47, z:8, at:5100, duration:650, from:{y:10}},
    {id:'symbols', asset:'symbols', label:'Symbole', x:712, y:427, width:1332, height:656, z:4, at:4600, duration:900, from:{y:45,scale:.78}},
    {id:'info-bar', asset:'info-bar', label:'Panel informacyjny', x:814, y:1080, width:1189, height:185, z:7, at:5250, duration:850, from:{y:100}},
    {id:'info-content', asset:'info-content', label:'Treść panelu informacyjnego', x:954, y:1105, width:902, height:74, z:8, at:6100, duration:650, from:{y:15}},
    {id:'ui', asset:'ui', label:'Panel UI', x:.5, y:1592, width:2815, height:373, z:8, at:5850, duration:950, from:{y:160}},
    {id:'light-left', asset:'light-left', label:'Lewe światło', x:-100, y:410, width:1146, height:1196, z:1, at:6650, duration:1000, from:{scale:.7}},
    {id:'light-right', asset:'light-right', label:'Prawe światło', x:1770, y:410, width:1146, height:1216, z:1, at:6900, duration:1000, from:{scale:.7}}
  ],
  steps:[
    {label:'Tło',at:0,end:500}, {label:'Obudowa',at:500,end:1450},
    {label:'Bębny',at:1450,end:2250}, {label:'Boki',at:2250,end:3100},
    {label:'Rama',at:3100,end:3950}, {label:'Jackpot i symbole',at:3950,end:5250},
    {label:'Panele UI',at:5250,end:6650}, {label:'Światła',at:6650,end:8600}
  ]
};
