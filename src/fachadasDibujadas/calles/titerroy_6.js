/**
 * Fachadas dibujadas: titerroy, tanda 6 (45 tramos de
 * src/barrios/compartido/fachadasCasa.js). Cada casa se describe mirando la hoja de fotos de su tramo
 * (carpeta _trabajo_fachadas); null = no se dibuja. Método: skill lava-game-fachadas.
 */

export default {
  nombre: 'titerroy 6',
  aceras: [
    // titerroy_399: de Pamplona, acera norte, pasos 6 — hoja titerroy/titerroy_399.jpg — antes: #efe6c8 #efe6c8
    { id: 'titerroy_399', a: [-531.6, -1129.9], b: [-514.3, -1142.5], anchos: [10.7, 10.7], altos: [6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#3a2a22', bajo: 'P:1.5 G:3.2', alto: 'VA VA', cables: true, contador: { x: 0.33 } },
      null,
    ] },
    // titerroy_400: de Pamplona, acera norte, pasos 2,3 — hoja titerroy/titerroy_400.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_400', a: [-470.6, -1164.2], b: [-482.0, -1155.4], anchos: [7.8, 6.5], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#3f7f76', bajo: 'M:4.2', marcoPersiana: '#3f7f76', zoc: { t: 'liso', c: '#9a8f86', h: 0.3 } },
      { pared: '#f3f1ea', carp: '#3f7f76', bajo: '_ M:3.4', marcoPersiana: '#3f7f76', esq: { c: '#e9e6df', lados: [1] } },
    ] },
    // titerroy_401: Paseo Ana Suárez, acera norte, pasos 1 — hoja titerroy/titerroy_401.jpg — antes: #f1eee7
    { id: 'titerroy_401', a: [-610.7, -964.2], b: [-600.2, -958.4], anchos: [12], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VC:1.9 V:0.6 P VA', zoc: { t: 'granito', c: '#4a4446', h: 2.4 }, num: 3, numX: 0.42, cables: true },
    ] },
    // titerroy_402: Paseo Ana Suárez, acera norte, pasos 2 — hoja titerroy/titerroy_402.jpg — antes: #f1eee7
    { id: 'titerroy_402', a: [-588.9, -952.0], b: [-600.2, -958.2], anchos: [12.9], altos: [6.6], casas: [
      { pared: '#e2c9ad', carp: '#2f7d6a', bajo: 'V P', alto: 'B B B', barandilla: '#2f7d6a', zoc: { t: 'liso', c: '#c9a98a', h: 2.5 }, esq: { c: '#4a4648', lados: [0, 1] }, cables: true },
    ] },
    // titerroy_403: de Carlos V, acera norte, pasos 6,7,8 — hoja titerroy/titerroy_403.jpg — antes: #efe6c8 #f1eee7 #f1eee7
    { id: 'titerroy_403', a: [-1699.6, -264.7], b: [-1679.6, -268.1], anchos: [7.7, 7.8, 4.8], altos: [6.6, 4, 4], casas: [
      { pared: '#e9dfc8', carp: '#3a2a22', bajo: 'PA G:3.2', zoc: { t: 'liso', c: '#b5653f', h: 1.0 }, num: 48, numX: 0.05, contador: { x: 0.22 } },
      { pared: '#e8d9a8', carp: '#3b2a20', bajo: '_ P _', zoc: { t: 'piedra', c: '#a08578', junta: '#d8c8bc', h: 1.6 }, num: 44, numX: 0.45, cables: true, contador: { x: 0.1 } },
      { pared: '#e4e6e6', carp: '#2e211b', bajo: 'VC:3.2 P', cables: true },
    ] },
    // titerroy_404: de Carlos V, acera sur, pasos 2,3 — hoja titerroy/titerroy_404.jpg — antes: #efe6c8 #f1eee7
    { id: 'titerroy_404', a: [-1747.4, -237.8], b: [-1727.6, -241.2], anchos: [11.6, 8.4], altos: [6.6, 4], casas: [
      { pared: '#efe3c4', carp: '#4a2c1f', bajo: 'P VR:1.1 VR:0.8 G:3 VR:0.6', ventanaAlta: true, alto: 'B VA B', barandilla: '#2a2a2a', corn: { c: '#e6d7b2' }, contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'P VC:2', zoc: { t: 'liso', c: '#c98a5e', h: 1.2 }, num: 69, numX: 0.05, contador: { x: 0.45 } },
    ] },
    // titerroy_405: de Carlos V, acera norte, pasos 13,14,15 — hoja titerroy/titerroy_405.jpg — antes: #f1eee7/tienda #e2c079/tienda #f1eee7
    { id: 'titerroy_405', a: [-1653.2, -272.7], b: [-1624.6, -277.4], anchos: [11.6, 9.4, 8], altos: [6.6, 4, 4], casas: [
      { pared: '#e2cfb6', carp: '#f4f4f2', bajo: 'G:4', zoc: { t: 'granito', c: '#8a8a86', h: 0.5 }, cables: true },
      { pared: '#efe8d8', carp: '#1f4a3a', bajo: 'V:2 P', zoc: { t: 'liso', c: '#8a4f3e', h: 1.1 }, num: 36, numX: 0.92, contador: { x: 0.6 } },
      { pared: '#f3f1ea', carp: '#5a3a28', bajo: 'P VR:0.8 VR:1.2', ventanaAlta: true, cables: true },
    ] },
    // titerroy_406: Lope de Vega, acera este, pasos 1,2,3 — hoja titerroy/titerroy_406.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_406', a: [-753.9, -885.9], b: [-754.9, -894.9], anchos: [8.9, 4.5], altos: [6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#3a2c26', bajo: 'P V', alto: 'VA VA', cables: true },
      { pared: '#f3f1ea', carp: '#3a2c26', bajo: 'V VR:0.7', alto: 'VA' },
    ] },
    // titerroy_407: Lope de Vega, acera este, pasos 5 — hoja titerroy/titerroy_407.jpg — antes: #f1eee7
    { id: 'titerroy_407', a: [-748.7, -888.4], b: [-756.9, -899.3], anchos: [13.6], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#3a2c26', bajo: '_ P V:1.8', alto: 'VA VA', num: 2, numX: 0.5, cables: true },
    ] },
    // titerroy_408: de Madrid, acera este, pasos 1 — hoja titerroy/titerroy_408.jpg — antes: #f1eee7
    { id: 'titerroy_408', a: [-715.7, -1017.4], b: [-720.0, -1025.1], anchos: [8.8], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#2f7d4f', bajo: 'VR:0.7', zoc: { t: 'liso', c: '#c9b9a5', h: 1.9 } },
    ] },
    // titerroy_409: el Valbanera, acera oeste, pasos 2,3 — hoja titerroy/titerroy_409.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_409', a: [-896.6, -748.6], b: [-903.5, -737.7], anchos: [6.8, 6.1], altos: [4, 4], casas: [
      null,
      { pared: '#f3f1ea', carp: '#dcdcd8', bajo: 'PD:2.2 VR:1.6 VR:1.6', reja: '#f4f4f2', zoc: { t: 'liso', c: '#a9adb0', h: 1.3 }, cables: true },
    ] },
    // titerroy_410: el Valbanera, acera oeste, pasos 1 — hoja titerroy/titerroy_410.jpg — antes: #9d9890 #9d9890
    { id: 'titerroy_410', a: [-878.6, -777.2], b: [-886.3, -765.0], anchos: [7.2, 7.2], altos: [4, 4], casas: [
      { pared: 'bloque', carp: '#8fb3a0', bajo: 'P PD:2', cables: true },
      null,
    ] },
    // titerroy_411: Monseñor Óscar Romero, acera oeste, pasos 2,3 — hoja titerroy/titerroy_411.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_411', a: [-507.1, -689.6], b: [-488.4, -664.8], anchos: [8.1, 8.1, 7.4, 7.4], altos: [4, 4, 4, 4], casas: [
      null,
      { pared: '#eeeeea', carp: '#f4f4f2', bajo: '_ PD:2.2 _ VR:1.1', reja: '#f4f4f2', zoc: { t: 'liso', c: '#a59a8c', h: 0.9 } },
      null,
      { pared: '#eeeeea', carp: '#f4f4f2', bajo: 'VR:3.6 _ VR:1.4', ventanaAlta: true, reja: '#f4f4f2', zoc: { t: 'liso', c: '#9a8f82', h: 1.0 }, cables: true },
    ] },
    // titerroy_412: Monseñor Óscar Romero, acera este, pasos 4 — hoja titerroy/titerroy_412.jpg — antes: #f1eee7
    { id: 'titerroy_412', a: [-475.0, -660.2], b: [-480.5, -667.2], anchos: [8.9], altos: [4], casas: [
      null,
    ] },
    // titerroy_413: de Tinguafaya, acera este, pasos 1 — hoja titerroy/titerroy_413.jpg — antes: #efe6c8 #efe6c8
    { id: 'titerroy_413', a: [-728.1, -1302.4], b: [-726.1, -1282.7], anchos: [9.9, 9.9], altos: [6.6, 6.6], casas: [
      { pared: '#f0d4bb', carp: '#6b4a33', bajo: '_ V:1.6 G:3.2', alto: 'B:2.6 VA', barandilla: '#6b4a33', zoc: { t: 'piedra', c: '#8a7a68', junta: '#cfc4b4', h: 1.0 }, cables: true },
      null,
    ] },
    // titerroy_414: de Tinguafaya, acera oeste, pasos 1 — hoja titerroy/titerroy_414.jpg — antes: #f1eee7/tienda
    { id: 'titerroy_414', a: [-747.8, -1300.6], b: [-747.0, -1293.7], anchos: [7], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#2a55a8', bajo: 'P:1.3 VR:1.6 P', alto: 'VA VA', carpAlto: '#3a3330', corn: { c: '#8a6a4a' }, contador: { x: 0.1 } },
    ] },
    // titerroy_415: del Doctor Severo Ochoa, acera oeste, pasos 19 — hoja titerroy/titerroy_415.jpg — antes: #f1eee7
    { id: 'titerroy_415', a: [-846.6, -484.9], b: [-854.1, -476.0], anchos: [11.6], altos: [4], casas: [
      null,
    ] },
    // titerroy_416: México, acera oeste, pasos 18,19,20,21,22,23,24 — hoja titerroy/titerroy_416.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7/tienda
    { id: 'titerroy_416', a: [-651.0, 112.7], b: [-669.3, 77.7], anchos: [4.5, 12.1, 10.4, 7, 7, 13.7, 9.7, 4.5], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      null,
      null,
      null,
      null,
      { pared: '#eeeff0', carp: '#6b4a33', bajo: '_', alto: 'V:0.8 _ V:1.1', zoc: { t: 'liso', c: '#c9c9c6', h: 0.3 } },
      null,
      { pared: '#eeeff0', carp: '#6b4a33', bajo: '_', alto: 'V:1.3 _ V:1.8 VC:1.4' },
      { pared: '#eeeff0', carp: '#5a3a28', bajo: '_ P:1.4', alto: 'VC VC' },
    ] },
    // titerroy_417: México, acera este, pasos 17,18,19,20,21,22,23,24 — hoja titerroy/titerroy_417.jpg — antes: #f1eee7/tienda #f1eee7/tienda #f1eee7 #f1eee7/tienda #f1eee7 #f1eee7 #d9b996 #e6d3b8 #f1eee7
    { id: 'titerroy_417', a: [-622.5, 144.7], b: [-650.6, 91.1], anchos: [7.6, 13.5, 12.1, 10.4, 7, 7, 13.7, 9.7, 4.5], altos: [4, 4, 4, 4, 4, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#2e2b2a', bajo: '_ Es:3', toldo: '#5a4a44', zoc: { t: 'piedra', c: '#3a3634', h: 0.9 }, esq: { c: '#3a3634', lados: [0] }, cables: true },
      { pared: '#f3f1ea', carp: '#2e2b2a', bajo: 'Es:2.6 _ _', toldo: '#5a4a44', zoc: { t: 'liso', c: '#4a4a4a', h: 0.9 }, franja: { c: '#a9b0b3', y: 3.4, h: 0.3 }, cables: true, contador: { x: 0.85 } },
      null,
      { pared: '#f0efe9', carp: '#2f7d6a', bajo: 'T:1.4 T:0.9 T:1.4', zoc: { t: 'bloque', h: 0.6 }, cables: true },
      null,
      { pared: '#f3f1ea', carp: '#3b2418', bajo: 'P V:1.6', zoc: { t: 'liso', c: '#d4a77a', h: 1.6 }, num: 26, numX: 0.2, contador: { x: 0.05 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'Es:2.4 P', zoc: { t: 'liso', c: '#c99a6e', h: 1.6 } },
      { pared: '#eceeef', carp: '#a9b0b6', bajo: 'VA P VA', zoc: { t: 'liso', c: '#5f666c', h: 1.3 }, num: 30, numX: 0.6, contador: { x: 0.35 } },
      null,
    ] },
    // titerroy_418: de Toledo, acera este, pasos 7 — hoja titerroy/titerroy_418.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_418', a: [-963.6, -1504.3], b: [-953.6, -1490.8], anchos: [8.4, 8.4], altos: [4, 4], casas: [
      { pared: '#e6d6b8', carp: '#f4f4f2', bajo: '_ G:3.6', corn: { c: '#e9dcc0' }, esq: { c: '#c9b69a', t: 'sillares', lados: [1] } },
      { pared: '#e6d6b8', carp: '#f4f4f2', bajo: 'P G:3.6', corn: { c: '#e9dcc0' }, esq: { c: '#c9b69a', t: 'sillares', lados: [0, 1] }, cables: true },
    ] },
    // titerroy_419: la Pardela, acera sur, pasos 10 — hoja titerroy/titerroy_419.jpg — antes: #f1eee7
    { id: 'titerroy_419', a: [-598.8, -1305.8], b: [-592.4, -1311.9], anchos: [8.8], altos: [4], casas: [
      null,
    ] },
    // titerroy_420: de Vicente Guerra, acera norte, pasos 8,9,10 — hoja titerroy/titerroy_420.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7/solar
    { id: 'titerroy_420', a: [-231.9, -663.2], b: [-183.3, -694.4], anchos: [8.9, 8.9, 8.9, 11.2, 11.2, 4.3, 4.3], altos: [6.6, 6.6, 6.6, 4, 4, 4, 0], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA _ V:2', alto: 'B B', barandilla: '#8b8f93', zoc: { t: 'liso', c: '#c9c1b6', h: 1.6 }, esq: { c: '#d8cbb8', lados: [1] } },
      null,
      null,
      null,
      { pared: '#f3f1ea', carp: '#2f4a5c', bajo: 'P M:3.2', marcoPersiana: '#f4f4f2', zoc: { t: 'liso', c: '#2f4f8a', h: 0.15 }, num: 23, numX: 0.3, contador: { x: 0.45 } },
      { pared: '#f3f1ea', carp: '#9aa3a8', bajo: 'M:2 P:0.9 VA:0.8', marcoPersiana: '#b9b3a6', num: 25, numX: 0.5 },
      null,
    ] },
    // titerroy_421: de Vicente Guerra, acera sur, pasos 8,9,10 — hoja titerroy/titerroy_421.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_421', a: [-232.8, -649.6], b: [-169.2, -690.6], anchos: [8.7, 8.7, 8.7, 8.7, 11.2, 11.2, 9.2, 9.2], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 4, 4], casas: [
      null,
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA:2 P V:2', alto: 'VA V', zoc: { t: 'liso', c: '#d9d6cf', h: 1.3 }, esq: { c: '#7a6a5c', lados: [0] }, contador: { x: 0.75 } },
      null,
      null,
      null,
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'M:3 P VR:2.4', reja: '#f4f4f2', alto: 'B:2.4 B', barandilla: '#f4f4f2', contador: { x: 0.85 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VR VR VR:2.4 VR:1', reja: '#f4f4f2', contador: { x: 0.9 } },
      null,
    ] },
    // titerroy_422: del Fray Mendo de Viedma, acera sur, pasos 9,10,11,12,13,14,15,16 — hoja titerroy/titerroy_422.jpg — antes: #e6d3b8 #f1eee7 #f1eee7 #f1eee7 #a9abad #f1eee7 #a9abad #f1eee7 #f1eee7
    { id: 'titerroy_422', a: [-760.4, -825.6], b: [-704.3, -867.0], anchos: [6.4, 8.5, 8, 8, 8, 8, 8, 7.4, 7.4], altos: [4, 4, 4, 4, 4, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VC:0.9 VC:0.9 VC:0.9', zoc: { t: 'liso', c: '#a9abad', h: 1.0 }, cables: true, contador: { x: 0.85 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P:1.4 V', zoc: { t: 'liso', c: '#c7ab8e', h: 2.2 }, num: 26, numX: 0.35, cables: true, contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P V V', zoc: { t: 'liso', c: '#c7ab8e', h: 2.2 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V V', zoc: { t: 'liso', c: '#a9a49e', h: 2.3 }, num: 28, numX: 0.1, cables: true, contador: { x: 0.95 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V:1.6 V:0.9', cables: true, contador: { x: 0.1 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V P VC V P', zoc: { t: 'liso', c: '#b9b9b6', h: 0.4 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VR:0.9 VR:0.9 VA:0.9 VA:0.9', reja: '#f4f4f2', zoc: { t: 'liso', c: '#5f6266', h: 1.2 }, cables: true, contador: { x: 0.55 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA:0.8 VA:0.8 VA:0.9 P VA:0.9', zoc: { t: 'liso', c: '#6a6d70', h: 1.1 }, cables: true, contador: { x: 0.45 } },
      null,
    ] },
    // titerroy_423: del Fray Mendo de Viedma, acera norte, pasos 17 — hoja titerroy/titerroy_423.jpg — antes: #efe6c8
    { id: 'titerroy_423', a: [-717.4, -869.8], b: [-710.3, -875.0], anchos: [8.8], altos: [4], casas: [
      { pared: '#ece3c8', carp: '#3a7a4a', bajo: 'V V:1.4 _', zoc: { t: 'liso', c: '#c9bfa6', h: 0.4 }, contador: { x: 0.6 } },
    ] },
    // titerroy_424: del Fray Mendo de Viedma, acera norte, pasos 11,12,13,14,15,16 — hoja titerroy/titerroy_424.jpg — antes: #d9b996 #f1eee7 #f1eee7 #f1eee7 #a9abad #a9abad #a9abad
    { id: 'titerroy_424', a: [-756.3, -841.0], b: [-710.3, -875.0], anchos: [10.5, 8, 8, 8, 8, 7.4, 7.4], altos: [4, 6.6, 4, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#5a3a30', bajo: '_ V:2.6 _', zoc: { t: 'liso', c: '#c9c9c6', h: 1.0 }, contador: { x: 0.95 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V V:1.8', zoc: { t: 'liso', c: '#b8ab98', h: 1.8 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V V P', zoc: { t: 'liso', c: '#d4d4d0', h: 2.2 }, num: 29, numX: 0.75, contador: { x: 0.55 } },
      { pared: '#f3f1ea', carp: '#5a3a30', bajo: 'P V', zoc: { t: 'liso', c: '#d0d0cc', h: 1.1 }, num: 31, numX: 0.35, cables: true, contador: { x: 0.6 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA:1 VA:1 VA:1 P', zoc: { t: 'liso', c: '#d4d4d0', h: 2.0 }, num: 33, numX: 0.9, contador: { x: 0.75 } },
      { pared: '#efe3c4', carp: '#2f7a55', bajo: 'P:1.3 V', zoc: { t: 'liso', c: '#e2d8bf', h: 0.4 }, cables: true, contador: { x: 0.45 } },
      null,
    ] },
    // titerroy_425: del Fray Mendo de Viedma, acera sur, pasos 17 — hoja titerroy/titerroy_425.jpg — antes: #a9abad
    { id: 'titerroy_425', a: [-711.2, -861.5], b: [-704.1, -866.8], anchos: [8.9], altos: [4], casas: [
      { pared: '#dfe2e6', carp: '#4a2c1f', bajo: 'V:1.4 V:0.9 V:0.9', zoc: { t: 'liso', c: '#7d7c84', h: 2.5 }, cables: true, contador: { x: 0.02 } },
    ] },
    // titerroy_426: Tinamala, acera norte, pasos 7 — hoja titerroy/titerroy_426.jpg — antes: #efe6c8
    { id: 'titerroy_426', a: [-591.6, -789.2], b: [-582.0, -796.4], anchos: [12], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#2f7a4a', bajo: 'V V:1.6 M:3.4', marcoPersiana: '#e9e9e6', zoc: { t: 'liso', c: '#a9abad', h: 1.2 }, cables: true, contador: { x: 0.25 } },
    ] },
    // titerroy_427: Tinamala, acera norte, pasos 4 — hoja titerroy/titerroy_427.jpg — antes: #f1eee7
    { id: 'titerroy_427', a: [-536.9, -828.5], b: [-546.1, -821.8], anchos: [11.4], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#3b2a20', bajo: 'V:2 V:2', zoc: { t: 'liso', c: '#b4b6b8', h: 1.0 }, corn: { c: '#f3f1ea' }, cables: true },
    ] },
    // titerroy_428: Tinamala, acera norte, pasos 5 — hoja titerroy/titerroy_428.jpg — antes: #e4cfc9
    { id: 'titerroy_428', a: [-564.3, -809.5], b: [-572.6, -803.4], anchos: [10.3], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#1f6b45', bajo: '_ V P VC:0.8', zoc: { t: 'liso', c: '#b59a8f', h: 2.3 }, esq: { c: '#8e8a86', lados: [1] }, cables: true, contador: { x: 0.7 } },
    ] },
    // titerroy_429: Tinamala, acera sur, pasos 7,8 — hoja titerroy/titerroy_429.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_429', a: [-576.1, -786.5], b: [-598.8, -769.4], anchos: [8, 8, 12.4], altos: [4, 4, 4], casas: [
      { pared: '#ece2cc', carp: '#f4f4f2', bajo: 'VR P', reja: '#f4f4f2', zoc: { t: 'granito', c: '#a8968c', h: 1.1 }, corn: { c: '#e4d8bf' }, num: 30, numX: 0.75, contador: { x: 0.62 } },
      null,
      { pared: '#f3f1ea', carp: '#222', bajo: 'VR E P', reja: '#222', zoc: { t: 'granito', c: '#9a9a98', h: 2.4 }, num: 28, numX: 0.85, contador: { x: 0.75 } },
    ] },
    // titerroy_432: de Santa Teresa de Jesús, acera norte, pasos 12 — hoja titerroy/titerroy_432.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_432', a: [-811.9, -257.6], b: [-794.4, -255.9], anchos: [8.8, 8.8], altos: [4, 4], casas: [
      null,
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'VC:1.2 _ M:2.6', marcoPersiana: '#e9e9e6', cables: true },
    ] },
    // titerroy_433: de Santa Teresa de Jesús, acera norte, pasos 14 — hoja titerroy/titerroy_433.jpg — antes: #f1eee7
    { id: 'titerroy_433', a: [-777.5, -254.0], b: [-768.0, -253.1], anchos: [9.5], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#3a3a3a', bajo: 'VR:1.9 P:0.6 VR:1.6', reja: '#2a2a2a', zoc: { t: 'liso', c: '#a49d93', h: 0.35 }, corn: { c: '#eceae4' } },
    ] },
    // titerroy_434: de Santa Teresa de Jesús, acera sur, pasos 12,13,14 — hoja titerroy/titerroy_434.jpg — antes: #f1eee7/tienda #f1eee7/tienda #f1eee7 #f1eee7
    { id: 'titerroy_434', a: [-803.2, -247.8], b: [-771.3, -244.5], anchos: [7.1, 7.1, 11.3, 6.8], altos: [6.6, 6.6, 6.6, 4], casas: [
      { pared: '#e9eaea', carp: '#b9bcbf', bajo: 'Es:2.6 _ P:0.6', marcoEscaparate: '#d9dbdc', zoc: { t: 'granito', c: '#9a9a98', h: 0.6 }, franja: { c: '#d6d8d8', y: 2.2, h: 0.08 } },
      null,
      { pared: '#f3f1ea', carp: '#1f7a55', bajo: 'VC:1.6 VC:0.9 P:0.8', alto: 'B B B', barandilla: '#1f7a55', cables: true },
      { pared: '#f3f1ea', carp: '#1f7a55', bajo: 'P VC:1.6 P', zoc: { t: 'liso', c: '#d9d6cf', h: 0.6 }, cables: true },
    ] },
    // titerroy_435: Gaire, acera este, pasos 5 — hoja titerroy/titerroy_435.jpg — antes: #f1eee7
    { id: 'titerroy_435', a: [-867.4, -670.1], b: [-863.1, -675.3], anchos: [6.8], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#1f3a32', bajo: 'P VR:2.4', ventanaAlta: true, reja: '#2a2a2a', esq: { c: '#eceae4', lados: [0, 1] }, num: 11, numX: 0.4, cables: true },
    ] },
    // titerroy_436: Sorondongo, acera norte, pasos 5 — hoja titerroy/titerroy_436.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_436', a: [-1265.9, 46.8], b: [-1280.6, 49.8], anchos: [7.5, 7.5], altos: [4, 4], casas: [
      null,
      { pared: '#f3f1ea', carp: '#1f8a5a', bajo: 'V:0.8 P V:3.2', zoc: { t: 'liso', c: '#c0703f', h: 2.0 }, cables: true },
    ] },
    // titerroy_437: Tingafa, acera este, pasos 5 — hoja titerroy/titerroy_437.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_437', a: [-579.3, -854.5], b: [-567.6, -839.8], anchos: [9.4, 9.4], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#8b8f93', bajo: '_ VA' },
      { pared: '#f3f1ea', carp: '#c8c2b0', bajo: 'PD:3 _', cables: true },
    ] },
    // titerroy_438: Tingafa, acera este, pasos 7 — hoja titerroy/titerroy_438.jpg — antes: #f1eee7/solar
    { id: 'titerroy_438', a: [-556.6, -836.4], b: [-546.2, -821.8], anchos: [18], altos: [0], casas: [
      null,
    ] },
    // titerroy_439: de la Princesa Artiaga, acera oeste, pasos 3,4,5 — hoja titerroy/titerroy_439.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_439', a: [-801.0, -1672.2], b: [-782.2, -1645.2], anchos: [8.1, 8.1, 9, 7.8], altos: [4, 4, 4, 4], casas: [
      null,
      { pared: '#e8dbb0', carp: '#1f8a4a', bajo: 'PD:3 _', zoc: { t: 'liso', c: '#c9c4bb', h: 1.0 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V:1.4 P V:1.4 P:0.8', zoc: { t: 'liso', c: '#9a9a98', h: 1.0 }, num: 15, numX: 0.3, cables: true, contador: { x: 0.7 } },
      { pared: '#f3f1ea', carp: '#9c9488', bajo: 'P:0.9 _ PD:1.6', zoc: { t: 'liso', c: '#a9abad', h: 0.9 }, cables: true, contador: { x: 0.1 } },
    ] },
    // titerroy_440: de la Princesa Artiaga, acera sur, pasos 7 — hoja titerroy/titerroy_440.jpg — antes: #f1eee7
    { id: 'titerroy_440', a: [-771.9, -1624.4], b: [-763.4, -1617.1], anchos: [11.2], altos: [6.6], casas: [
      null,
    ] },
    // titerroy_441: Agustín Espinosa, acera sur, pasos 19 — hoja titerroy/titerroy_441.jpg — antes: #f1eee7
    { id: 'titerroy_441', a: [-1572.9, 19.0], b: [-1583.2, 20.6], anchos: [10.5], altos: [6.6], casas: [
      null,
    ] },
    // titerroy_442: Agustín Espinosa, acera norte, pasos 3 — hoja titerroy/titerroy_442.jpg — antes: #f1eee7
    { id: 'titerroy_442', a: [-1383.9, -38.9], b: [-1397.0, -36.8], anchos: [13.3], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#3d5a4f', bajo: '_ P:1.3', alto: 'V:2.4' },
    ] },
    // titerroy_443: Agustín Espinosa, acera norte, pasos 23 — hoja titerroy/titerroy_443.jpg — antes: #f1eee7/solar
    { id: 'titerroy_443', a: [-1656.2, 10.3], b: [-1666.5, 11.9], anchos: [10.4], altos: [0], casas: [
      null,
    ] },
    // titerroy_444: Tampico, acera sur, pasos 1 — hoja titerroy/titerroy_444.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_444', a: [-805.4, -280.6], b: [-789.2, -276.7], anchos: [8.3, 8.3], altos: [6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'VR P:1.4 VR', reja: '#4a2c1f', alto: 'B:2.4 VC', barandilla: '#2e211b', num: 19, numX: 0.62, cables: true },
      { pared: '#f3f1ea', carp: '#5a3a28', bajo: 'V:1.3 P', alto: 'VC VC', franja: { c: '#e2ddd2', y: 3.2, h: 0.2 }, num: 17, numX: 0.85, cables: true, contador: { x: 0.95 } },
    ] },
    // titerroy_445: Tampico, acera sur, pasos 7 — hoja titerroy/titerroy_445.jpg — antes: #f1eee7/tienda
    { id: 'titerroy_445', a: [-732.0, -260.9], b: [-723.4, -257.7], anchos: [9.1], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#3a2418', bajo: 'E:2.4 P Es:2.2', reja: '#4a2c1f', toldo: '#5a3a30', zoc: { t: 'granito', c: '#8f8f8c', h: 1.4 }, num: 1, numX: 0.5, cables: true, contador: { x: 0.45 } },
    ] },
  ],
};
