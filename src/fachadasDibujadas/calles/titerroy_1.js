/**
 * Fachadas dibujadas: titerroy, tanda 1 (50 tramos de
 * src/barrios/compartido/fachadasCasa.js). Cada casa se describe mirando la hoja de fotos de su tramo
 * (carpeta _trabajo_fachadas); null = no se dibuja. Método: skill lava-game-fachadas.
 */

export default {
  nombre: 'titerroy 1',
  aceras: [
    // titerroy_146: de Blas Cabrera Topham, acera oeste, pasos 1,2 — hoja titerroy/titerroy_146.jpg — antes: #efe6c8/tienda #efe6c8/tienda #efe6c8/tienda #efe6c8/tienda
    { id: 'titerroy_146', a: [-759.2, -327.1], b: [-740.9, -291.2], anchos: [9.4, 9.4, 10.7, 10.7], altos: [9.4, 9.4, 9.4, 9.4], casas: [
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'Es:3 Es:3', alto: 'VB VB VB', zoc: { t: 'granito', c: '#a3a19c', h: 3.1 }, franja: { c: '#f3f1ea', y: 3.2, h: 0.25 }, toldo: '#6b4a44', marcoEscaparate: '#f4f4f2', barandilla: '#f4f4f2' },
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'Es:3.2 P Es:2.6', alto: 'VB VA VB', zoc: { t: 'granito', c: '#a3a19c', h: 3.1 }, franja: { c: '#f3f1ea', y: 3.2, h: 0.25 }, toldo: '#6b4a44', marcoEscaparate: '#f4f4f2', barandilla: '#f4f4f2' },
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'Es:2.2 Es:2.6', alto: 'VB VB VA', zoc: { t: 'granito', c: '#9e9d99', h: 3.1 }, franja: { c: '#f3f1ea', y: 3.2, h: 0.25 }, toldo: '#5e3f38', marcoEscaparate: '#f4f4f2', barandilla: '#f4f4f2' },
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'Es:4 _', alto: 'VA VB', zoc: { t: 'granito', c: '#9e9d99', h: 3.1 }, franja: { c: '#f3f1ea', y: 3.2, h: 0.25 }, toldo: '#5e3f38', marcoEscaparate: '#f4f4f2', barandilla: '#f4f4f2' },
    ] },
    // titerroy_147: la Fermina, acera este, pasos 3 — hoja titerroy/titerroy_147.jpg — antes: #e6d3b8
    { id: 'titerroy_147', a: [-543.0, -1087.8], b: [-538.8, -1082.2], anchos: [6.9], altos: [6.6], casas: [
      { pared: '#e3cba6', carp: '#f4f4f2', bajo: 'V _ V', esq: { c: '#e8e6e0', lados: [1] } },
    ] },
    // titerroy_148: la Fermina, acera este, pasos 6 — hoja titerroy/titerroy_148.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_148', a: [-517.9, -1054.2], b: [-507.5, -1039.7], anchos: [8.9, 8.9], altos: [4, 4], casas: [
      null,
      { pared: '#e9e8e3', carp: '#f4f4f2', bajo: 'V _ V', cables: true },
    ] },
    // titerroy_149: la Fermina, acera oeste, pasos 1 — hoja titerroy/titerroy_149.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_149', a: [-574.6, -1112.2], b: [-562.1, -1095.1], anchos: [10.6, 10.6], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: '_ G:3', zoc: { t: 'liso', c: '#8e9093', h: 1.1 }, franja: { c: '#8e9093', y: 3.3, h: 0.3 }, contador: { x: 0.25 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'M:2.4', persiana: '#ecebe6', marcoPersiana: '#d9d7d2', zoc: { t: 'liso', c: '#8e9093', h: 1.1 }, franja: { c: '#8e9093', y: 3.3, h: 0.3 } },
    ] },
    // titerroy_150: la Fermina, acera oeste, pasos 3 — hoja titerroy/titerroy_150.jpg — antes: #9d9890 #9d9890
    { id: 'titerroy_150', a: [-557.2, -1088.6], b: [-548.2, -1076.7], anchos: [7.5, 7.5], altos: [4, 4], casas: [
      null,
      { pared: 'bloque', carp: '#ece9e1', bajo: 'G:2.6' },
    ] },
    // titerroy_151: la Fermina, acera oeste, pasos 6 — hoja titerroy/titerroy_151.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_151', a: [-525.0, -1045.2], b: [-516.2, -1032.9], anchos: [7.5, 7.5], altos: [4, 4], casas: [
      null,
      { pared: '#ecebe8', carp: '#3a2a22', bajo: 'P V:1.6', zoc: { t: 'liso', c: '#8d9ba6', h: 1.2 }, num: '71 A', numX: 0.25 },
    ] },
    // titerroy_152: del Doctor Severo Ochoa, acera sur, pasos 2 — hoja titerroy/titerroy_152.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_152', a: [-692.6, -632.8], b: [-709.7, -618.6], anchos: [11.1, 11.1], altos: [6.6, 6.6], casas: [
      { pared: '#ecebe8', carp: '#f4f4f2', bajo: 'VR:1.8 P', alto: 'VA VA', zoc: { t: 'piedra', c: '#6b6966', junta: '#9b9893', h: 2.9 }, reja: '#f4f4f2' },
      { pared: '#ecebe8', carp: '#f4f4f2', bajo: 'V P', alto: 'VA', zoc: { t: 'granito', c: '#2f3031', h: 2.9 }, cables: true },
    ] },
    // titerroy_153: del Doctor Severo Ochoa, acera este, pasos 8 — hoja titerroy/titerroy_153.jpg — antes: #f1eee7/tienda
    { id: 'titerroy_153', a: [-758.2, -574.5], b: [-766.9, -564.1], anchos: [13.6], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#6b3a2e', bajo: 'E:3.2 _ PD:2.4', alto: 'VA VA', rejaEscaparate: '#e9e9e6', cables: true },
    ] },
    // titerroy_154: del Doctor Severo Ochoa, acera este, pasos 15 — hoja titerroy/titerroy_154.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_154', a: [-815.4, -506.4], b: [-825.8, -493.1], anchos: [8.4, 8.4], altos: [4, 4], casas: [
      { pared: '#f6f5f1', carp: '#1f6e45', bajo: 'VR:2.2', reja: '#1f6e45' },
      { pared: '#f6f5f1', carp: '#1f6e45', bajo: 'VR:1.2', reja: '#1f6e45', cables: true },
    ] },
    // titerroy_155: del Doctor Severo Ochoa, acera este, pasos 17 — hoja titerroy/titerroy_155.jpg — antes: #f1eee7
    { id: 'titerroy_155', a: [-844.7, -465.8], b: [-850.9, -458.5], anchos: [9.6], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#9a988f', bajo: 'P:1 Es:2.6', alto: 'VA:1.2 VA:2.6', zoc: { t: 'piedra', c: '#d6c6b2', junta: '#efe6da', h: 3.0 }, franja: { c: '#9a9893', y: 3.0, h: 0.2 }, contador: { x: 0.3 } },
    ] },
    // titerroy_156: del Doctor Severo Ochoa, acera oeste, pasos 7,8 — hoja titerroy/titerroy_156.jpg — antes: #e6d3b8 #e6d3b8 #f1eee7/tienda
    { id: 'titerroy_156', a: [-754.6, -594.7], b: [-774.0, -571.6], anchos: [10.1, 10.1, 9.9], altos: [6.6, 6.6, 6.6], casas: [
      { pared: '#b9ad9c', carp: '#5a3a2a', bajo: 'G:3.4', alto: 'VA:2.4', franja: { c: '#f3f1ea', y: 3.1, h: 0.35 }, cables: true },
      { pared: '#b9ad9c', carp: '#5a3a2a', bajo: '_ P', alto: 'VA', franja: { c: '#f3f1ea', y: 3.1, h: 0.35 }, cables: true, contador: { x: 0.35 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'E:3 P VR', reja: '#f4f4f2', rejaEscaparate: '#f4f4f2', zoc: { t: 'liso', c: '#6e6c69', h: 1.2 }, num: 19, numX: 0.55, cables: true, contador: { x: 0.45 } },
    ] },
    // titerroy_157: del Doctor Severo Ochoa, acera oeste, pasos 14,15 — hoja titerroy/titerroy_157.jpg — antes: #f1eee7/tienda #f1eee7/tienda #f1eee7
    { id: 'titerroy_157', a: [-812.9, -523.4], b: [-832.6, -498.4], anchos: [9.1, 9.1, 13.7], altos: [6.6, 6.6, 4], casas: [
      { pared: '#dcc4a0', carp: '#f4f4f2', bajo: 'Es:2.6 P', zoc: { t: 'granito', c: '#a59a92', h: 3.0 }, marcoEscaparate: '#f4f4f2', cables: true },
      null,
      null,
    ] },
    // titerroy_158: la Carmen, acera sur, pasos 8 — hoja titerroy/titerroy_158.jpg — antes: #f1eee7
    { id: 'titerroy_158', a: [-831.7, -539.6], b: [-822.1, -531.2], anchos: [12.7], altos: [4], casas: [
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'E:2.6 P M:2.4', zoc: { t: 'liso', c: '#8e9093', h: 1.3 }, toldo: '#d8332f', rejaEscaparate: '#9a9a96', persiana: '#ecebe6', marcoPersiana: '#e8e6e0', num: 7, numX: 0.5, contador: { x: 0.68 } },
    ] },
    // titerroy_159: el Rafael, acera norte, pasos 1 — hoja titerroy/titerroy_159.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_159', a: [-808.0, -994.7], b: [-790.5, -1007.3], anchos: [10.8, 10.8], altos: [4, 4], casas: [
      null,
      { pared: '#f1f0ec', carp: '#5a3426', bajo: 'P _ VR:2', reja: '#e6e3dc', num: 9, numX: 0.08, cables: true, contador: { x: 0.45 } },
    ] },
    // titerroy_160: el Rafael, acera norte, pasos 6 — hoja titerroy/titerroy_160.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_160', a: [-763.2, -1015.2], b: [-743.1, -1025.0], anchos: [11.1, 11.1], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#5a3426', bajo: 'P V', zoc: { t: 'liso', c: '#d6d6d2', h: 1.7 } },
      { pared: '#f3f1ea', carp: '#1e1e1e', bajo: 'VR', reja: '#1e1e1e' },
    ] },
    // titerroy_161: el Rafael, acera norte, pasos 5 — hoja titerroy/titerroy_161.jpg — antes: #f1eee7
    { id: 'titerroy_161', a: [-753.7, -1019.6], b: [-763.1, -1015.0], anchos: [10.4], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'V P VA:1.7 PA', zoc: { t: 'granito', c: '#b5b3ad', h: 1.4 } },
    ] },
    // titerroy_162: de José Pereyra Galviaty, acera este, pasos 3 — hoja titerroy/titerroy_162.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_162', a: [-256.4, -548.2], b: [-267.9, -563.8], anchos: [9.7, 9.7], altos: [6.6, 6.6], casas: [
      { pared: '#eeede8', carp: '#5f8f80', bajo: 'M:5', persiana: '#5f8f80', marcoPersiana: '#5f8f80' },
      { pared: '#f3f1ea', carp: '#2f7a4f', bajo: 'PD:2.4 _ P', alto: 'VC B VC', barandilla: '#2a2a2a' },
    ] },
    // titerroy_163: Guadalajara, acera este, pasos 3 — hoja titerroy/titerroy_163.jpg — antes: #f1eee7/tienda #f1eee7/tienda
    { id: 'titerroy_163', a: [-764.0, -1303.5], b: [-753.6, -1289.4], anchos: [8.8, 8.8], altos: [6.6, 6.6], casas: [
      null,
      { pared: '#f3f1ea', carp: '#3a2a22', bajo: 'VC:3.2', esq: { c: '#d9b98a', lados: [1] }, cables: true },
    ] },
    // titerroy_164: Guadalajara, acera oeste, pasos 3 — hoja titerroy/titerroy_164.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_164', a: [-767.3, -1289.0], b: [-758.2, -1276.5], anchos: [7.7, 7.7], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#3e2a24', bajo: '_ P _', cables: true, contador: { x: 0.75 } },
      { pared: '#f3f1ea', carp: '#6e5a4a', bajo: 'M:2.4 Es:2.2', persiana: '#6e5a4a', marcoPersiana: '#6e5a4a', cables: true },
    ] },
    // titerroy_165: de Toledo, acera este, pasos 1,2,3 — hoja titerroy/titerroy_165.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_165', a: [-994.9, -1546.1], b: [-963.8, -1504.2], anchos: [10.8, 10.8, 7.6, 7.6, 7.7, 7.7], altos: [4, 4, 4, 4, 6.6, 6.6], casas: [
      null,
      null,
      null,
      { pared: '#f3f1ea', carp: '#e8e8e4', bajo: 'M:3', persiana: '#e8e8e4', marcoPersiana: '#e8e8e4', num: 72, numX: 0.5 },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V', alto: 'B', barandilla: '#222', cables: true, contador: { x: 0.75 } },
      { pared: '#f3f1ea', carp: '#1e1e1e', bajo: 'P:1.4', reja: '#1e1e1e', num: 68, numX: 0.1, cables: true },
    ] },
    // titerroy_166: de Toledo, acera este, pasos 7 — hoja titerroy/titerroy_166.jpg — antes: #f1eee7
    { id: 'titerroy_166', a: [-953.6, -1490.7], b: [-948.4, -1483.8], anchos: [8.7], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'V _ P VC:2.2', zoc: { t: 'piedra', c: '#a1806f', junta: '#e8dcd2', h: 1.2 }, num: 62, numX: 0.6, contador: { x: 0.4 } },
    ] },
    // titerroy_167: de Toledo, acera este, pasos 9 — hoja titerroy/titerroy_167.jpg — antes: #f1eee7
    { id: 'titerroy_167', a: [-937.5, -1468.4], b: [-933.8, -1463.4], anchos: [6.3], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G:3.2 T:0.9', zoc: { t: 'granito', c: '#3a3a3c', h: 2.0 } },
    ] },
    // titerroy_168: de Toledo, acera este, pasos 13,14 — hoja titerroy/titerroy_168.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_168', a: [-910.4, -1432.1], b: [-895.2, -1411.5], anchos: [13.7, 11.9], altos: [6.6, 4], casas: [
      { pared: '#f3f1ea', carp: '#3e2a22', bajo: 'G:3 _ P _ P V', alto: 'VA V', franja: { c: '#e8dcc0', y: 3.1, h: 0.3 }, contador: { x: 0.3 } },
      { pared: '#e8e7e2', carp: '#7d8a78', bajo: 'PD:3.8' },
    ] },
    // titerroy_169: de Toledo, acera este, pasos 21 — hoja titerroy/titerroy_169.jpg — antes: #f1eee7
    { id: 'titerroy_169', a: [-829.7, -1322.4], b: [-824.6, -1315.6], anchos: [8.5], altos: [6.6], casas: [
      null,
    ] },
    // titerroy_170: de Colombia, acera este, pasos 3,4,5,6,7,8 — hoja titerroy/titerroy_170.jpg — antes: #f1eee7/tienda #f1eee7/tienda #f1eee7/tienda #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_170', a: [-816.8, -144.1], b: [-801.2, -108.4], anchos: [4.5, 7.9, 7.9, 11.8, 5.4, 8.6, 8], altos: [6.6, 6.6, 6.6, 4, 4, 4, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#2a55a8', bajo: 'Es:2 P', zoc: { t: 'granito', c: '#a89286', h: 1.3 }, marcoEscaparate: '#f4f4f2', num: 32, numX: 0.85, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'E:2.6 _ P:1.6', rejaEscaparate: '#f4f4f2', cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VR:2.4 G:3', reja: '#8b8f93', zoc: { t: 'piedra', c: '#4a3f38', junta: '#c9bfb0', h: 2.0 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f6a45', bajo: 'V _ P V', zoc: { t: 'piedra', c: '#70757a', junta: '#a9adb0', h: 1.2 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f6a45', bajo: 'VC _ P', zoc: { t: 'liso', c: '#8e9093', h: 1.4 }, num: 46, numX: 0.75, cables: true },
      { pared: '#f3f1ea', carp: '#1f6a45', bajo: 'PD:2.2 V P', zoc: { t: 'piedra', c: '#3e3b39', h: 1.2 }, num: 44, numX: 0.85, cables: true },
      { pared: '#f3f1ea', carp: '#22302c', bajo: '_ P:1.6', zoc: { t: 'liso', c: '#7e8082', h: 1.5 }, cables: true },
    ] },
    // titerroy_171: de Colombia, acera oeste, pasos 9,10,11,12 — hoja titerroy/titerroy_171.jpg — antes: #f1eee7 #e9c3a4 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_171', a: [-805.0, -94.8], b: [-783.6, -46.4], anchos: [11, 10.9, 10.9, 10.1, 10.1], altos: [4, 6.6, 4, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#8b8f93', bajo: 'M:2.6', persiana: '#8b8f93', marcoPersiana: '#8b8f93', cables: true },
      { pared: '#f3f1ea', carp: '#4a3226', bajo: 'P G:3.2', alto: 'VA VA', zoc: { t: 'piedra', c: '#d39a5e', junta: '#f2dcc0', h: 3.0 }, cables: true, contador: { x: 0.35 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'PA M:3 P', persiana: '#9a9a96', marcoPersiana: '#5a4a40', num: 15, numX: 0.85, cables: true, contador: { x: 0.65 } },
      null,
      null,
    ] },
    // titerroy_172: de Colombia, acera oeste, pasos 2,3,4,5,6,7,8 — hoja titerroy/titerroy_172.jpg — antes: #f1eee7/tienda #f1eee7/tienda #f1eee7 #f1eee7/tienda #f1eee7/tienda #f1eee7 #f1eee7/tienda #f1eee7 #f1eee7
    { id: 'titerroy_172', a: [-839.9, -176.6], b: [-808.5, -104.9], anchos: [7.3, 7.3, 13.9, 7.9, 7.9, 11.8, 5.4, 8.2, 8.5], altos: [6.6, 6.6, 4, 4, 4, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#3a2e28', bajo: 'VR E:2', reja: '#6b5f58', rejaEscaparate: '#6b5f58', alto: 'VA VA', cables: true },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VR P', reja: '#6b5f58', alto: 'V', cables: true, contador: { x: 0.85 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P V:1.8 _ VC VC', zoc: { t: 'piedra', c: '#b9b7b0', junta: '#e4e2dc', h: 1.3 }, num: 35, numX: 0.1, cables: true, contador: { x: 0.45 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'V:1.6 P', zoc: { t: 'piedra', c: '#cdbf9e', junta: '#e8dfcc', h: 2.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'Es:2.2 P', marcoEscaparate: '#f4f4f2', cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P _ V', zoc: { t: 'liso', c: '#3d3f44', h: 1.1 }, num: 29, numX: 0.35, cables: true, contador: { x: 0.2 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V:1.8 P', zoc: { t: 'liso', c: '#3a3c40', h: 1.0 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'Es:2 P', zoc: { t: 'granito', c: '#8f9192', h: 3.0 }, marcoEscaparate: '#f4f4f2', contador: { x: 0.55 } },
      { pared: '#f3f1ea', carp: '#22352f', bajo: 'P V _ V', zoc: { t: 'liso', c: '#55575b', h: 1.0 }, cables: true },
    ] },
    // titerroy_173: de Colombia, acera este, pasos 10,11,12 — hoja titerroy/titerroy_173.jpg — antes: #e2c079 #f1eee7 #f1eee7
    { id: 'titerroy_173', a: [-792.1, -87.2], b: [-778.9, -57.4], anchos: [9.8, 10.9, 12], altos: [4, 6.6, 4], casas: [
      { pared: '#d8a98a', carp: '#f4f4f2', bajo: 'V:2.4 PA V', zoc: { t: 'granito', c: '#b39a7c', h: 1.5 }, num: 38, numX: 0.6, cables: true, contador: { x: 0.45 } },
      { pared: '#eeede8', carp: '#2f8279', bajo: 'VC P _ VC', zoc: { t: 'liso', c: '#9a9c9e', h: 1.0 }, cables: true },
      { pared: '#efefec', carp: '#f4f4f2', bajo: 'V:2 P VA:1.8 _ VA P', zoc: { t: 'granito', c: '#3c3c42', h: 3.0 }, num: 32, numX: 0.35, cables: true },
    ] },
    // titerroy_174: de Teruel, acera este, pasos 1,2 — hoja titerroy/titerroy_174.jpg — antes: #a9abad #a9abad #e9c3a4 #e9c3a4
    { id: 'titerroy_174', a: [-948.6, -83.8], b: [-934.6, -117.3], anchos: [10, 10, 8.1, 8.1], altos: [9.4, 9.4, 9.4, 9.4], casas: [
      null,
      null,
      { pared: '#d9a98e', carp: '#3a3a3c', bajo: '_ P', zoc: { t: 'granito', c: '#8d918c', h: 3.6 } },
      { pared: '#d9a98e', carp: '#3a3a3c', bajo: '_', zoc: { t: 'granito', c: '#8d918c', h: 3.6 }, contador: { x: 0.15 } },
    ] },
    // titerroy_175: de Teruel, acera sur, pasos 5 — hoja titerroy/titerroy_175.jpg — antes: #e9c3a4
    { id: 'titerroy_175', a: [-898.0, -150.7], b: [-886.1, -155.1], anchos: [12.7], altos: [9.4], casas: [
      { pared: '#dcaa80', carp: '#7a7c7e', bajo: '_ P:2 V V', zoc: { t: 'granito', c: '#6f7a72', h: 1.2 }, franja: { c: '#c9976e', y: 2.2, h: 0.05 }, num: 27, numX: 0.5, contador: { x: 0.2 } },
    ] },
    // titerroy_176: de Teruel, acera sur, pasos 6 — hoja titerroy/titerroy_176.jpg — antes: #f1eee7/tienda
    { id: 'titerroy_176', a: [-876.5, -161.5], b: [-863.9, -166.4], anchos: [13.5], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#3a2a24', bajo: 'P VR _ PA V Es:2.6', alto: 'VA _ VA VB', toldo: '#b23a4e', reja: '#3a2a24', barandilla: '#222', num: 25, numX: 0.6 },
    ] },
    // titerroy_177: de Teruel, acera sur, pasos 8,9,10 — hoja titerroy/titerroy_177.jpg — antes: #e9c3a4 #e9c3a4 #e9c3a4 #e9c3a4
    { id: 'titerroy_177', a: [-831.8, -178.2], b: [-804.7, -187.5], anchos: [6.4, 7, 7.6, 7.6], altos: [6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#dcc0a0', carp: '#f4f4f2', bajo: 'V:2.2', alto: 'VA', zoc: { t: 'granito', c: '#8e8c88', h: 1.2 } },
      { pared: '#dcc0a0', carp: '#f4f4f2', bajo: 'V:2.2 P:1.7 V:1.8', alto: 'VA VA', zoc: { t: 'granito', c: '#8e8c88', h: 1.0 }, contador: { x: 0.2 } },
      { pared: '#dcc0a0', carp: '#f4f4f2', bajo: 'V:2 _ V', alto: 'VA', zoc: { t: 'granito', c: '#8e8c88', h: 1.1 } },
      { pared: '#f3f1ea', carp: '#a0a2a4', bajo: 'M:3', persiana: '#a0a2a4', marcoPersiana: '#a0a2a4', zoc: { t: 'liso', c: '#7a746c', h: 1.2 } },
    ] },
    // titerroy_178: Guanareme, acera este, pasos 2,3,4,5 — hoja titerroy/titerroy_178.jpg — antes: #f1eee7 #f1eee7 #f1eee7/tienda #f1eee7
    { id: 'titerroy_178', a: [-698.8, -1738.8], b: [-697.3, -1694.7], anchos: [12.6, 13.2, 11.1, 7.2], altos: [4, 6.6, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f7a5a', bajo: 'VR VR VR P', reja: '#1f7a5a', num: 48, numX: 0.35, cables: true, contador: { x: 0.85 } },
      { pared: '#f3f1ea', carp: '#2f8a74', bajo: 'G:2.6 P G:3', alto: 'VA', garajeVentanas: true, num: 46, numX: 0.4, cables: true, contador: { x: 0.5 } },
      { pared: '#f3f1ea', carp: '#2e8a5a', bajo: 'G:3', zoc: { t: 'liso', c: '#c9aaa2', h: 0.6 }, num: 44, numX: 0.45, cables: true },
      { pared: '#f3f1ea', carp: '#8a8680', bajo: 'Mr:3 P', marcoPersiana: '#7a5a40', num: 42, numX: 0.75, cables: true },
    ] },
    // titerroy_179: Guanareme, acera este, pasos 6,7,8,9 — hoja titerroy/titerroy_179.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7/solar
    { id: 'titerroy_179', a: [-697.3, -1694.7], b: [-695.2, -1634.7], anchos: [9, 9, 7.6, 7.6, 7.6, 7.6, 11.7], altos: [4, 4, 6.6, 6.6, 4, 4, 0], casas: [
      { pared: '#f3f1ea', carp: '#4e3428', bajo: 'G:3 _ P', num: 40, numX: 0.6, cables: true, contador: { x: 0.55 } },
      { pared: '#f3f1ea', carp: '#4e3428', bajo: 'G:4.2', garajeVentanas: true, cables: true },
      { pared: '#efe6d6', carp: '#1f7a45', bajo: 'P V:1.8', alto: 'V:1.8', zoc: { t: 'piedra', c: '#d8bfa8', junta: '#efe3d6', h: 3.0 }, cables: true, contador: { x: 0.6 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'V:2.4 P P', alto: 'V', cables: true, contador: { x: 0.75 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G:2.6 VA:2.8', zoc: { t: 'piedra', c: '#c49f88', junta: '#e6d6c8', h: 1.3 }, num: 34, numX: 0.55, cables: true },
      null,
      null,
    ] },
    // titerroy_180: Guanareme, acera este, pasos 12 — hoja titerroy/titerroy_180.jpg — antes: #f1eee7
    { id: 'titerroy_180', a: [-684.6, -1594.0], b: [-684.4, -1584.7], anchos: [9.3], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#3e2c24', bajo: 'M:3 _ P', persiana: '#3e2c24', marcoPersiana: '#3e2c24', zoc: { t: 'piedra', c: '#8a7f7a', junta: '#d8d2cc', h: 2.0 }, cables: true, contador: { x: 0.7 } },
    ] },
    // titerroy_181: Guanareme, acera oeste, pasos 2,3,4,5,6,7,8,9,10,11,12 — hoja titerroy/titerroy_181.jpg — antes: #f1eee7 #e2c079 #f1eee7 #f1eee7 #e2c079 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #e6d3b8 #e6d3b8 #e6d3b8 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_181', a: [-707.7, -1738.5], b: [-702.5, -1580.4], anchos: [12.6, 6.6, 6.6, 5.5, 5.5, 10.1, 7.6, 7.6, 7.6, 7.6, 7.6, 7.6, 8.4, 8.4, 8.4, 10, 10, 9.5, 10.9], altos: [4, 6.6, 6.6, 6.6, 6.6, 6.6, 4, 4, 4, 4, 4, 4, 6.6, 6.6, 6.6, 4, 4, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#2a8a5a', bajo: 'P _ G:3', cables: true, contador: { x: 0.25 } },
      { pared: '#f3f1ea', carp: '#1f5a46', bajo: 'P VC:2.4 G:2.2', zoc: { t: 'piedra', c: '#c99a5e', junta: '#ead7b8', h: 3.0 }, cables: true },
      { pared: '#e2c7a2', carp: '#3a2620', bajo: '_ PA _', alto: 'VA', franja: { c: '#d9a640', y: 3.0, h: 0.3 }, zoc: { t: 'granito', c: '#a89a8c', h: 1.0 } },
      { pared: '#e2c7a2', carp: '#2e211b', bajo: 'PA VR P', reja: '#1e1e1e', alto: 'VA', franja: { c: '#d9a640', y: 3.0, h: 0.3 }, zoc: { t: 'granito', c: '#a89a8c', h: 1.0 }, contador: { x: 0.45 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G:2.6 P', alto: 'B', barandilla: '#f4f4f2', zoc: { t: 'piedra', c: '#b58a6a', junta: '#e0cdbb', h: 1.0 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P _ G:3.2', alto: 'VC B', barandilla: '#f4f4f2', num: 41, numX: 0.12, cables: true, contador: { x: 0.25 } },
      { pared: '#f3f1ea', carp: '#7a4a30', bajo: 'P:1.6 G:3', num: 39, numX: 0.05, cables: true, contador: { x: 0.45 } },
      null,
      { pared: '#f3f1ea', carp: '#1f8a5a', bajo: 'G:3 _ P', zoc: { t: 'liso', c: '#3a3a3c', h: 1.0 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P VA', zoc: { t: 'liso', c: '#3a3a3c', h: 1.0 }, cables: true },
      { pared: '#f3f1ea', carp: '#1e5a3e', bajo: 'P _ G:3.2', zoc: { t: 'piedra', c: '#9a7a64', junta: '#cdb9a6', h: 1.3 }, cables: true, contador: { x: 0.2 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'V:2 P', zoc: { t: 'piedra', c: '#a8714f', junta: '#dcc0a8', h: 2.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#6a5f3e', bajo: '_ G:3.4', zoc: { t: 'piedra', c: '#c08860', junta: '#e8cdb0', h: 3.0 }, contador: { x: 0.25 } },
      { pared: '#e2cba8', carp: '#4a2c1f', bajo: 'VC:3 P _ P', alto: 'B VA', barandilla: '#222', zoc: { t: 'granito', c: '#b89a90', h: 1.0 } },
      null,
      null,
      { pared: '#f3f1ea', carp: '#5a3a2a', bajo: 'VC:3 P _ P VA', zoc: { t: 'piedra', c: '#b08060', junta: '#dcc6b2', h: 2.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V:2 _ P P P', alto: 'VB VA', barandilla: '#f4f4f2', zoc: { t: 'piedra', c: '#34302d', h: 1.4 }, contador: { x: 0.2 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V _ V P P', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'piedra', c: '#34302d', h: 1.4 }, franja: { c: '#d8d6d0', y: 3.2, h: 0.25 }, contador: { x: 0.2 } },
    ] },
    // titerroy_182: Guanareme, acera oeste, pasos 13 — hoja titerroy/titerroy_182.jpg — antes: #dd7d70 #f1eee7/solar
    { id: 'titerroy_182', a: [-702.5, -1580.4], b: [-701.9, -1560.2], anchos: [10.1, 10.1], altos: [4, 0], casas: [
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'V P G:2.6', zoc: { t: 'piedra', c: '#b8806a', junta: '#d9b5a4', h: 3.0 }, cables: true, contador: { x: 0.45 } },
      null,
    ] },
    // titerroy_183: del Doctor Gregorio Chil y Naranjo, acera oeste, pasos 1,2 — hoja titerroy/titerroy_183.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_183', a: [-566.2, -692.7], b: [-581.1, -714.0], anchos: [8.7, 8.6, 8.6], altos: [4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'P _ _ _', cables: true },
      { pared: '#f3f1ea', carp: '#b0b0ae', bajo: '_ M:2.6', persiana: '#b8b8b5', marcoPersiana: '#d6d6d2', zoc: { t: 'liso', c: '#a9abad', h: 1.0 } },
      { pared: '#f3f1ea', carp: '#5a3a28', bajo: 'VA P', zoc: { t: 'liso', c: '#a9abad', h: 1.0 } },
    ] },
    // titerroy_184: del Doctor Gregorio Chil y Naranjo, acera oeste, pasos 6,7 — hoja titerroy/titerroy_184.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #efe6c8
    { id: 'titerroy_184', a: [-592.0, -729.7], b: [-613.2, -758.7], anchos: [7.7, 7.7, 7.7, 12.9], altos: [4, 4, 4, 6.6], casas: [
      null,
      { pared: '#f3f1ea', carp: '#2a1f1c', bajo: 'P _ _', cables: true },
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'PA _' },
      { pared: '#ede2bf', carp: '#3a2a22', bajo: '_', alto: 'VA _ VC', cables: true },
    ] },
    // titerroy_185: del Doctor Gregorio Chil y Naranjo, acera oeste, pasos 8 — hoja titerroy/titerroy_185.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_185', a: [-619.0, -765.9], b: [-631.1, -782.1], anchos: [10.1, 10.1], altos: [6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: '_ VR:1', alto: 'VA', reja: '#3a3a3a', zoc: { t: 'piedra', c: '#b7b2a6', junta: '#e0dcd2', h: 0.9 }, contador: { x: 0.9 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VR VA:2.6', alto: 'VA VA', reja: '#f4f4f2', zoc: { t: 'piedra', c: '#cdb49a', junta: '#e8dccd', h: 3.2 } },
    ] },
    // titerroy_186: del Doctor Gregorio Chil y Naranjo, acera oeste, pasos 9 — hoja titerroy/titerroy_186.jpg — antes: #f1eee7
    { id: 'titerroy_186', a: [-636.4, -789.7], b: [-640.7, -795.5], anchos: [7.2], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#5a3a28', bajo: 'VC _ VC', alto: 'V _ V', zoc: { t: 'liso', c: '#d8c4a8', h: 0.8 }, cables: true },
    ] },
    // titerroy_187: del Doctor Gregorio Chil y Naranjo, acera este, pasos 1,2 — hoja titerroy/titerroy_187.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_187', a: [-557.3, -698.9], b: [-571.9, -719.9], anchos: [8.7, 8.4, 8.4], altos: [6.6, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#5a3a2e', bajo: '_ _ P V', alto: 'B VC B', barandilla: '#f4f4f2', cables: true, contador: { x: 0.95 } },
      { pared: '#f3f1ea', carp: '#5a3a2e', bajo: '_ VC', cables: true },
      { pared: '#f3f1ea', carp: '#9a9a96', bajo: 'M:3 _', persiana: '#b8b8b4', marcoPersiana: '#9a9a96', cables: true, contador: { x: 0.6 } },
    ] },
    // titerroy_188: del Doctor Gregorio Chil y Naranjo, acera este, pasos 8 — hoja titerroy/titerroy_188.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_188', a: [-611.9, -774.2], b: [-622.3, -788.2], anchos: [8.7, 8.7], altos: [4, 4], casas: [
      null,
      null,
    ] },
    // titerroy_189: del Doctor Gregorio Chil y Naranjo, acera este, pasos 9 — hoja titerroy/titerroy_189.jpg — antes: #f1eee7
    { id: 'titerroy_189', a: [-627.0, -796.2], b: [-632.8, -804.0], anchos: [9.7], altos: [4], casas: [
      null,
    ] },
    // titerroy_190: Veracruz, acera este, pasos 1 — hoja titerroy/titerroy_190.jpg — antes: #f1eee7
    { id: 'titerroy_190', a: [-730.9, -1406.2], b: [-735.9, -1413.0], anchos: [8.4], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#5a3a2a', bajo: 'P G:3 _', alto: 'VA', zoc: { t: 'liso', c: '#a9abad', h: 1.2 }, cables: true, contador: { x: 0.1 } },
    ] },
    // titerroy_191: Veracruz, acera oeste, pasos 3 — hoja titerroy/titerroy_191.jpg — antes: #f1eee7/solar
    { id: 'titerroy_191', a: [-763.0, -1416.7], b: [-753.2, -1403.5], anchos: [16.4], altos: [0], casas: [
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: '_ _ P M:3', persiana: '#7a4a36', marcoPersiana: '#7a4a36', num: 3, numX: 0.6, cables: true, contador: { x: 0.75 } },
    ] },
    // titerroy_192: de Maciot de Bethencourt, acera este, pasos 8 — hoja titerroy/titerroy_192.jpg — antes: #e6d3b8
    { id: 'titerroy_192', a: [-645.2, -1617.1], b: [-644.8, -1604.7], anchos: [12.4], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#2f6a44', bajo: 'Mr:1 _ _ V:2.2', zoc: { t: 'piedra', c: '#9a7462', junta: '#d8c4b4', h: 1.8 }, cables: true },
    ] },
    // titerroy_193: de Maciot de Bethencourt, acera este, pasos 10,11,12,13 — hoja titerroy/titerroy_193.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_193', a: [-646.0, -1635.3], b: [-647.3, -1670.1], anchos: [11.6, 10.2, 10.2, 4.5], altos: [4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f6e45', bajo: 'V:1.6 P VC', zoc: { t: 'granito', c: '#6f7a70', h: 1.4 }, num: 28, numX: 0.55, cables: true, contador: { x: 0.75 } },
      { pared: '#f3f1ea', carp: '#6a4a2e', bajo: '_ P', zoc: { t: 'liso', c: '#b8705a', h: 3.0 }, cables: true },
      { pared: '#f3f1ea', carp: '#7a5a38', bajo: 'P G:3', zoc: { t: 'granito', c: '#2a2a30', h: 1.4 }, num: 40, numX: 0.15, cables: true, contador: { x: 0.25 } },
      { pared: '#f3f1ea', carp: '#6a3a24', bajo: 'G:2 VC:1 P:0.9', zoc: { t: 'granito', c: '#25262b', h: 1.6 }, cables: true },
    ] },
    // titerroy_194: de Maciot de Bethencourt, acera oeste, pasos 2,3 — hoja titerroy/titerroy_194.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_194', a: [-650.6, -1501.4], b: [-651.3, -1525.2], anchos: [12.8, 11], altos: [6.6, 4], casas: [
      { pared: '#f3f1ea', carp: '#5a3424', bajo: 'VR:1 VR:2.4 VR:1 P', reja: '#222', alto: 'B B B', barandilla: '#4fa08a', cables: true },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'V:2.6 P', num: 5, numX: 0.62, contador: { x: 0.75 } },
    ] },
    // titerroy_195: de Guatemala, acera sur, pasos 1 — hoja titerroy/titerroy_195.jpg — antes: #d9b996 #d9b996
    { id: 'titerroy_195', a: [-622.1, -184.9], b: [-634.8, -178.3], anchos: [7.2, 7.2], altos: [4, 4], casas: [
      { pared: '#cdb8a6', carp: '#9aa0a6', bajo: '_ E:2', rejaEscaparate: '#9aa0a6', zoc: { t: 'granito', c: '#bba493', h: 3.2 }, cables: true },
      { pared: '#cdb8a6', carp: '#9aa0a6', bajo: 'E:2 _', rejaEscaparate: '#9aa0a6', zoc: { t: 'granito', c: '#bba493', h: 3.2 }, cables: true },
    ] },
  ],
};
