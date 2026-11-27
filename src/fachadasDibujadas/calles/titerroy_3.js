/**
 * Fachadas dibujadas: titerroy, tanda 3 (50 tramos de
 * src/barrios/compartido/fachadasCasa.js). Cada casa se describe mirando la hoja de fotos de su tramo
 * (carpeta _trabajo_fachadas); null = no se dibuja. Método: skill lava-game-fachadas.
 */

export default {
  nombre: 'titerroy 3',
  aceras: [
    // titerroy_246: de Francisco Acosta Espinosa, acera norte, pasos 2,3,4,5,6,7 — hoja titerroy/titerroy_246.jpg — antes: #a9abad #f1eee7 #f1eee7 #e6d3b8 #d9b996 #f1eee7
    { id: 'titerroy_246', a: [-807.9, -768.7], b: [-760.8, -803.3], anchos: [8.8, 8, 8, 12, 12, 9.6], altos: [4, 4, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VC VC VC', zoc: { t: 'liso', c: '#b06a4e', h: 0.7 }, cables: true, contador: { x: 0.85 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V:2.4 V:1.6 P', zoc: { t: 'granito', c: '#8c7360', h: 1.1 }, num: 9, numX: 0.75, cables: true },
      { pared: '#ece4df', carp: '#f4f4f2', bajo: 'P', zoc: { t: 'liso', c: '#a8826e', h: 1.0 }, contador: { x: 0.35 }, cables: true },
      { pared: '#f3f1ea', carp: '#e8e4da', bajo: 'VC:2.8 P', cables: true },
      { pared: '#e8ddd6', carp: '#1f7a45', bajo: 'V:1.6', zoc: { t: 'liso', c: '#6e6c6a', h: 1.4 }, contador: { x: 0.2 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VC P VA', zoc: { t: 'liso', c: '#d9d6cf', h: 2.4 }, cables: true },
    ] },
    // titerroy_247: la Niña, acera sur, pasos 2 — hoja titerroy/titerroy_247.jpg — antes: #f1eee7
    { id: 'titerroy_247', a: [-1039.6, -838.4], b: [-1029.8, -830.2], anchos: [12.8], altos: [4], casas: [
      null,
    ] },
    // titerroy_248: de Antonio María Manrique, acera sur, pasos 2,3,4,5,6,7 — hoja titerroy/titerroy_248.jpg — antes: #e9b99c #e9b99c #f1eee7 #d9b996 #d9b996 #f1eee7 #e2c079
    { id: 'titerroy_248', a: [-664.6, -828.2], b: [-716.4, -789.7], anchos: [9.9, 9.9, 12.1, 8, 7.6, 8, 9.2], altos: [4, 4, 4, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#3b2418', bajo: 'V V', zoc: { t: 'liso', c: '#a0564a', h: 2.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G:3 V P V', zoc: { t: 'liso', c: '#dccac6', h: 2.5 }, contador: { x: 0.55 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VC P VC', zoc: { t: 'liso', c: '#8e9093', h: 1.1 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA VA VA', zoc: { t: 'liso', c: '#b08a78', h: 2.3 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'PA VA V G:2.2', garajeVentanas: true, zoc: { t: 'liso', c: '#8a6b5a', h: 2.3 }, contador: { x: 0.55 }, cables: true },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'V P VA VR', zoc: { t: 'liso', c: '#8e9093', h: 1.0 }, contador: { x: 0.4 }, cables: true },
      { pared: '#f3f1ea', carp: '#6b4a3a', bajo: 'VR PA VR', zoc: { t: 'liso', c: '#c99a5a', h: 1.0 }, contador: { x: 0.25 }, cables: true },
    ] },
    // titerroy_249: de Antonio María Manrique, acera norte, pasos 8 — hoja titerroy/titerroy_249.jpg — antes: #a9abad #a9abad
    { id: 'titerroy_249', a: [-733.6, -789.2], b: [-720.1, -799.3], anchos: [8.4, 8.4], altos: [4, 4], casas: [
      null,
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V P V', esq: { c: '#5a5552', lados: [0] } },
    ] },
    // titerroy_250: de Antonio María Manrique, acera sur, pasos 9 — hoja titerroy/titerroy_250.jpg — antes: #f1eee7
    { id: 'titerroy_250', a: [-720.7, -786.7], b: [-727.8, -781.3], anchos: [8.9], altos: [4], casas: [
      { pared: '#ddd8cc', carp: '#6b5a4a', bajo: 'P T:1.3 T:1.3', zoc: { t: 'liso', c: '#7d7480', h: 0.8 }, num: 2, numX: 0.25, cables: true },
    ] },
    // titerroy_251: de Antonio María Manrique, acera norte, pasos 2,3,4,5,6,7 — hoja titerroy/titerroy_251.jpg — antes: #d9b996 #d9b996 #d9b996 #f1eee7 #e6d3b8 #d9b996 #e9b99c
    { id: 'titerroy_251', a: [-670.0, -836.2], b: [-722.1, -797.4], anchos: [10.1, 10.1, 12.1, 8, 7.6, 8, 9.2], altos: [4, 4, 4, 4, 4, 4, 4], casas: [
      null,
      { pared: '#f3f1ea', carp: '#5a3326', bajo: 'V:1.6', zoc: { t: 'liso', c: '#c2a888', h: 2.3 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P V V', zoc: { t: 'liso', c: '#b88c6c', h: 2.5 }, contador: { x: 0.25 }, cables: true },
      { pared: '#f3f1ea', carp: '#4a3326', bajo: 'VC:1.8 P VC:0.8', zoc: { t: 'liso', c: '#a9abad', h: 0.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#3b2418', bajo: 'V V V', zoc: { t: 'liso', c: '#d8c8b6', h: 2.6 }, contador: { x: 0.9 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V VA P VA', zoc: { t: 'liso', c: '#8c6a58', h: 2.4 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA PA VA VA', zoc: { t: 'liso', c: '#b07a70', h: 2.5 }, num: 25, numX: 0.3, contador: { x: 0.1 }, cables: true },
    ] },
    // titerroy_252: de Antonio María Manrique, acera sur, pasos 8 — hoja titerroy/titerroy_252.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_252', a: [-727.8, -781.2], b: [-714.2, -791.3], anchos: [8.5, 8.5], altos: [4, 4], casas: [
      { pared: '#ddd8cc', carp: '#6b5a4a', bajo: 'T:1.3 T:1.3 P', zoc: { t: 'liso', c: '#7d7480', h: 0.8 }, num: 2, numX: 0.75, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA P G:2.8', zoc: { t: 'granito', c: '#3a3d45', h: 3.3 }, contador: { x: 0.45 } },
    ] },
    // titerroy_253: de Antonio María Manrique, acera norte, pasos 9 — hoja titerroy/titerroy_253.jpg — antes: #e4cfc9
    { id: 'titerroy_253', a: [-726.6, -794.6], b: [-733.7, -789.3], anchos: [8.9], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA:2.4 VA:1.6', zoc: { t: 'liso', c: '#ecc9c3', h: 3.1 }, contador: { x: 0.95 } },
    ] },
    // titerroy_254: de Antonio María Manrique, acera sur, pasos 10 — hoja titerroy/titerroy_254.jpg — antes: #e4cfc9
    { id: 'titerroy_254', a: [-727.8, -781.3], b: [-721.3, -786.2], anchos: [8.1], altos: [4], casas: [
      null,
    ] },
    // titerroy_255: Tinamala, acera sur, pasos 4,5,6,7,8 — hoja titerroy/titerroy_255.jpg — antes: #e9b99c #9d9890 #9d9890 #f1eee7/tienda #a9abad #d9b996 #e2c079
    { id: 'titerroy_255', a: [-636.3, -741.7], b: [-674.5, -714.0], anchos: [5, 5, 9.7, 8.5, 4.1, 4.1, 10.8], altos: [4, 6.6, 6.6, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'V:1.6', zoc: { t: 'liso', c: '#b5694a', h: 1.2 }, cables: true },
      { pared: 'bloque', carp: '#7a5a3a', bajo: '_', alto: 'T:1.6', cables: true },
      null,
      { pared: '#e6cf8a', carp: '#f4f4f2', bajo: 'Es:2.2 P VR', marcoEscaparate: '#f4f4f2', zoc: { t: 'liso', c: '#b9a58a', h: 2.4 }, num: 16, numX: 0.45, contador: { x: 0.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#4a2a20', bajo: 'VC P', num: 14, numX: 0.8, cables: true },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'V V', zoc: { t: 'liso', c: '#c8b89a', h: 2.9 }, contador: { x: 0.8 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'PD:3 V P V', zoc: { t: 'liso', c: '#c9772f', h: 3.0 }, franja: { c: '#a0522d', y: 3.0, h: 0.15 }, num: 12, numX: 0.6, contador: { x: 0.5 }, cables: true },
    ] },
    // titerroy_256: Tinamala, acera norte, pasos 12,13,14 — hoja titerroy/titerroy_256.jpg — antes: #e6d3b8/tienda #d9b996 #d9b996
    { id: 'titerroy_256', a: [-695.1, -711.6], b: [-714.8, -696.5], anchos: [10.4, 8.4, 6.1], altos: [4, 4, 4], casas: [
      null,
      { pared: '#ece9e2', carp: '#6b2e1f', bajo: 'T P VC:1.6', zoc: { t: 'liso', c: '#8e9093', h: 1.0 }, contador: { x: 0.6 }, cables: true },
      { pared: '#ece9e2', carp: '#6b2e1f', bajo: 'VC:1.8 PA', zoc: { t: 'liso', c: '#8a4a3a', h: 1.2 }, cables: true },
    ] },
    // titerroy_257: Tinamala, acera sur, pasos 15 — hoja titerroy/titerroy_257.jpg — antes: #d9b996 #d9b996
    { id: 'titerroy_257', a: [-698.8, -694.4], b: [-715.0, -682.1], anchos: [10.2, 10.2], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA PA VA PA', zoc: { t: 'liso', c: '#dcb98c', h: 2.7 }, num: 6, numX: 0.7, contador: { x: 0.5 }, cables: true },
      { pared: '#ece9e2', carp: '#1f5a3a', bajo: 'P', zoc: { t: 'piedra', c: '#4a4440', h: 0.9 }, num: 4, numX: 0.3, cables: true },
    ] },
    // titerroy_258: Tinamala, acera norte, pasos 4,5,6,7,8 — hoja titerroy/titerroy_258.jpg — antes: #f1eee7 #f1eee7 #b9b2a4 #d9b996 #d9b996
    { id: 'titerroy_258', a: [-641.6, -749.0], b: [-680.3, -721.0], anchos: [10, 9.7, 8.5, 8.2, 11.4], altos: [4, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#3b2418', bajo: 'V:2 P V:1.6', num: 13, numX: 0.5, contador: { x: 0.35 }, cables: true },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'PD:3 P V', zoc: { t: 'liso', c: '#b8b2b4', h: 1.3 }, cables: true },
      { pared: '#ead8c4', carp: '#4a3326', bajo: 'V P VA', zoc: { t: 'piedra', c: '#6b5d55', junta: '#c9c0b0', h: 2.5 }, contador: { x: 0.25 }, cables: true },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VC P VA', zoc: { t: 'liso', c: '#d6c2a8', h: 1.4 }, num: 7, numX: 0.5, cables: true },
      { pared: '#ead8c4', carp: '#f4f4f2', bajo: 'P V V', zoc: { t: 'liso', c: '#9c7454', h: 2.5 } },
    ] },
    // titerroy_259: Tinamala, acera sur, pasos 12,13,14 — hoja titerroy/titerroy_259.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_259', a: [-688.8, -702.2], b: [-715.0, -682.1], anchos: [9.8, 8.4, 7.5, 7.5], altos: [4, 4, 4, 4], casas: [
      { pared: '#d4c2ac', carp: '#c9c9c6', bajo: 'Es:3.6 _', marcoEscaparate: '#c9c9c6', contador: { x: 0.8 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA PA VA', zoc: { t: 'liso', c: '#d8b896', h: 2.8 }, contador: { x: 0.1 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA PA', zoc: { t: 'liso', c: '#d8b896', h: 2.8 }, num: 6, numX: 0.65, contador: { x: 0.45 }, cables: true },
      { pared: '#ece9e2', carp: '#1f5a3a', bajo: 'P VC VC', zoc: { t: 'piedra', c: '#4a4440', h: 1.0 }, num: 4, numX: 0.12, cables: true },
    ] },
    // titerroy_260: Tinamala, acera norte, pasos 15 — hoja titerroy/titerroy_260.jpg — antes: #f1eee7
    { id: 'titerroy_260', a: [-705.9, -703.7], b: [-715.0, -696.7], anchos: [11.5], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'PD:1.8 V P', zoc: { t: 'liso', c: '#b56a5a', h: 1.4 }, num: 1, numX: 0.12 },
    ] },
    // titerroy_261: el Bartolo, acera norte, pasos 1 — hoja titerroy/titerroy_261.jpg — antes: #f1eee7
    { id: 'titerroy_261', a: [-831.2, -625.5], b: [-823.5, -619.0], anchos: [10.1], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#d9d3c4', reja: '#d9d3c4', bajo: '_ VR:2.6', ventanaAlta: true },
    ] },
    // titerroy_262: de Navarra, acera sur, pasos 2,3,4,5,6,7 — hoja titerroy/titerroy_262.jpg — antes: #e6d3b8 #f1eee7 #f1eee7/solar #f1eee7/solar #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_262', a: [-477.0, -1051.7], b: [-502.5, -1032.9], anchos: [4.5, 6, 6, 15.9, 12.1, 8, 6.8], altos: [6.6, 4, 0, 0, 6.6, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G:2.4 P', alto: 'VA', zoc: { t: 'liso', c: '#b89484', h: 3.0 }, num: 34, numX: 0.75, contador: { x: 0.6 } },
      { pared: '#ece6da', carp: '#f4f4f2', bajo: 'PD:1.6 P', num: 32, numX: 0.75, contador: { x: 0.45 }, cables: true },
      null,
      null,
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P P VA', alto: 'VA VA', zoc: { t: 'liso', c: '#8e9093', h: 0.9 }, num: 24, numX: 0.25, contador: { x: 0.75 }, cables: true },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'V P VA:2', zoc: { t: 'liso', c: '#e6dccb', h: 1.0 }, contador: { x: 0.1 } },
      { pared: '#f3f1ea', carp: '#5a3a2a', bajo: 'P G:3.2', zoc: { t: 'liso', c: '#8e9093', h: 1.3 }, num: 22, numX: 0.2, cables: true },
    ] },
    // titerroy_263: de Navarra, acera norte, pasos 2,3,4,5,6,7 — hoja titerroy/titerroy_263.jpg — antes: #efe6c8 #efe6c8 #f1eee7 #9d9890 #9d9890 #9d9890 #efe6c8 #efe6c8
    { id: 'titerroy_263', a: [-451.2, -1080.9], b: [-507.3, -1039.5], anchos: [7.4, 7.4, 12, 8, 8, 12.1, 8, 6.8], altos: [4, 4, 6.6, 4, 4, 4, 4, 4], casas: [
      null,
      { pared: '#f1ede2', carp: '#4a2c1f', bajo: 'VA:1.8 P VA:0.8', zoc: { t: 'liso', c: '#8e9093', h: 1.1 }, contador: { x: 0.7 }, cables: true },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'VA:1.8 P', alto: 'VA VA', franja: { c: '#6f7378', y: 3.2, h: 0.5 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V', contador: { x: 0.6 } },
      { pared: '#8a8078', carp: '#b9bcbf', bajo: 'PD:4', contador: { x: 0.9 }, cables: true },
      { pared: '#8a8078', carp: '#b9bcbf', bajo: 'P _', num: 23, numX: 0.2, contador: { x: 0.5 }, cables: true },
      { pared: '#eee2c2', carp: '#4a2c1f', bajo: 'P VR' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V V', contador: { x: 0.7 } },
    ] },
    // titerroy_267: de Aragón, acera sur, pasos 11 — hoja titerroy/titerroy_267.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_267', a: [-932.1, -219.2], b: [-911.4, -217.3], anchos: [10.4, 10.4], altos: [4, 4], casas: [
      { pared: '#d6cbbd', carp: '#4a3a30', bajo: 'V V', zoc: { t: 'liso', c: '#9a9a96', h: 0.5 }, esq: { c: '#9a9a96', lados: [0, 1] } },
      { pared: '#d6cbbd', carp: '#2e2e2e', bajo: '_ Es:2.4', marcoEscaparate: '#2e2e2e', zoc: { t: 'liso', c: '#9a9a96', h: 0.5 }, esq: { c: '#9a9a96', lados: [0] }, num: 5, numX: 0.85, contador: { x: 0.55 } },
    ] },
    // titerroy_268: Aconcagua, acera sur, pasos 1 — hoja titerroy/titerroy_268.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_268', a: [-830.6, -1558.1], b: [-844.9, -1547.5], anchos: [8.9, 8.9], altos: [4, 4], casas: [
      { pared: '#d8d6d0', carp: '#8a7560', bajo: '_ P _', num: 16, numX: 0.45, cables: true },
      null,
    ] },
    // titerroy_269: Aconcagua, acera norte, pasos 1 — hoja titerroy/titerroy_269.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_269', a: [-829.0, -1573.3], b: [-841.1, -1564.3], anchos: [7.5, 7.5], altos: [6.6, 6.6], casas: [
      null,
      { pared: '#f3f1ea', carp: '#3b2a20', bajo: '_ P _', contador: { x: 0.75 }, cables: true },
    ] },
    // titerroy_270: Aconcagua, acera norte, pasos 3 — hoja titerroy/titerroy_270.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_270', a: [-860.4, -1549.8], b: [-877.0, -1537.2], anchos: [10.4, 10.4], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#3b2a20', bajo: 'P V:1.6' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V V', contador: { x: 0.55 } },
    ] },
    // titerroy_271: Aconcagua, acera norte, pasos 7 — hoja titerroy/titerroy_271.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_271', a: [-925.0, -1499.3], b: [-938.4, -1489.1], anchos: [8.4, 8.4], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VC VC', cables: true },
      { pared: '#f3f1ea', carp: '#3a3a3a', bajo: '_ P', franja: { c: '#e2e2de', y: 0.5, h: 0.08 }, num: 1, numX: 0.75, contador: { x: 0.95 }, cables: true },
    ] },
    // titerroy_272: de Santa Teresa de Jesús, acera norte, pasos 11 — hoja titerroy/titerroy_272.jpg — antes: #f1eee7
    { id: 'titerroy_272', a: [-827.9, -259.1], b: [-821.7, -258.5], anchos: [6.2], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VC:1.6 _', zoc: { t: 'liso', c: '#9a9ea3', h: 1.2 } },
    ] },
    // titerroy_273: de Santa Teresa de Jesús, acera sur, pasos 2,3,4 — hoja titerroy/titerroy_273.jpg — antes: #a9abad/tienda #a9abad/tienda #a9abad/tienda #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_273', a: [-927.5, -261.0], b: [-879.6, -255.9], anchos: [7.8, 7.8, 7.8, 8.2, 8.2, 8.2], altos: [6.6, 6.6, 6.6, 4, 4, 4], casas: [
      null,
      { pared: '#e8e8e4', carp: '#a9adb1', bajo: 'Es Es', marcoEscaparate: '#a9adb1', alto: 'VA:3 VA:3', zoc: { t: 'granito', c: '#3c3f44', h: 3.0 }, num: 43, numX: 0.8 },
      { pared: '#ecebe6', carp: '#3f7f76', bajo: 'T:1.6 T VR P', zoc: { t: 'liso', c: '#9a9ea3', h: 1.0 }, num: 37, numX: 0.5, contador: { x: 0.65 }, cables: true },
      { pared: '#d9826b', carp: '#f4f4f2', bajo: 'V', zoc: { t: 'liso', c: '#7a2a2a', h: 2.8 }, franja: { c: '#c9b7a5', y: 2.8, h: 0.2 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'VC:1.6 P V', zoc: { t: 'liso', c: '#5f7686', h: 1.2 }, num: 31, numX: 0.6, contador: { x: 0.45 }, cables: true },
      null,
    ] },
    // titerroy_274: de Santa Teresa de Jesús, acera sur, pasos 7,8,9,10,11 — hoja titerroy/titerroy_274.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_274', a: [-846.8, -253.6], b: [-822.5, -251.1], anchos: [4.5, 12.3, 12.6, 8.6, 6.2], altos: [4, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P V', zoc: { t: 'liso', c: '#a9b2bb', h: 1.0 }, num: 23, numX: 0.4, contador: { x: 0.1 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V:2.2 P V', zoc: { t: 'liso', c: '#8e9093', h: 1.1 }, num: 21, numX: 0.4, contador: { x: 0.05 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V:2 P V', zoc: { t: 'liso', c: '#a5502f', h: 1.0 }, num: 18, numX: 0.6, contador: { x: 0.45 } },
      { pared: '#ecebe6', carp: '#2e211b', bajo: 'V P VC', zoc: { t: 'liso', c: '#a9b2bb', h: 0.9 }, cables: true },
      { pared: '#e6e2da', carp: '#5a4030', bajo: 'VC _', cables: true },
    ] },
    // titerroy_275: Copacabana, acera norte, pasos 1 — hoja titerroy/titerroy_275.jpg — antes: #f1eee7/solar
    { id: 'titerroy_275', a: [-895.0, -1411.4], b: [-877.6, -1424.8], anchos: [21.9], altos: [0], casas: [
      null,
    ] },
    // titerroy_276: Copacabana, acera sur, pasos 1 — hoja titerroy/titerroy_276.jpg — antes: #e6d3b8
    { id: 'titerroy_276', a: [-881.1, -1408.6], b: [-871.5, -1416.0], anchos: [12.2], altos: [4], casas: [
      { pared: '#e0d3bd', carp: '#ecebe6', bajo: 'V:1.6 PA _', zoc: { t: 'liso', c: '#b07a5e', h: 1.0 } },
    ] },
    // titerroy_277: la Santa María, acera este, pasos 2,3 — hoja titerroy/titerroy_277.jpg — antes: #efe6c8 #f1eee7
    { id: 'titerroy_277', a: [-709.0, -674.1], b: [-715.1, -682.3], anchos: [4.7, 5.5], altos: [4, 6.6], casas: [
      null,
      { pared: '#f3f1ea', carp: '#3f7f76', bajo: 'VC VC', alto: 'VC VC', zoc: { t: 'liso', c: '#9a9ea0', h: 1.0 } },
    ] },
    // titerroy_278: la Santa María, acera este, pasos 4,5,6,7 — hoja titerroy/titerroy_278.jpg — antes: #e9b99c #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_278', a: [-683.4, -638.1], b: [-660.6, -608.9], anchos: [12.1, 13, 5.1, 6.8], altos: [4, 4, 4, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#3b2a2a', bajo: '_ V:1.6 _', zoc: { t: 'piedra', c: '#a06a50', junta: '#c9b39a', h: 2.5 } },
      { pared: '#f3f1ea', carp: '#4a2a20', bajo: 'PD:2.4 P V', zoc: { t: 'liso', c: '#e0b48c', h: 2.2 }, contador: { x: 0.45 } },
      { pared: '#f3f1ea', carp: '#5a2a24', bajo: '_ P _', zoc: { t: 'liso', c: '#cfd3bc', h: 1.1 }, franja: { c: '#5a2a20', y: 1.1, h: 0.08 }, contador: { x: 0.1 } },
      { pared: '#f3f1ea', carp: '#5a2a24', bajo: 'V:1.6 _', alto: '_ VC:0.8', zoc: { t: 'liso', c: '#cfd3bc', h: 1.1 }, franja: { c: '#5a2a20', y: 1.1, h: 0.08 } },
    ] },
    // titerroy_279: la Santa María, acera oeste, pasos 4,5,6,7 — hoja titerroy/titerroy_279.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_279', a: [-692.4, -632.3], b: [-669.5, -603.0], anchos: [13.1, 13, 5.1, 6], altos: [6.6, 4, 6.6, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V _ V', alto: 'V V', zoc: { t: 'liso', c: '#d9c7a8', h: 1.2 }, contador: { x: 0.85 }, cables: true },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'P V:2 P VC', zoc: { t: 'liso', c: '#8a6a58', h: 1.2 }, contador: { x: 0.4 }, cables: true },
      { pared: '#f3f1ea', carp: '#5a3a2a', bajo: 'PD:2.2 VC', alto: 'VA', zoc: { t: 'liso', c: '#8a6a58', h: 1.2 }, cables: true },
      { pared: '#f3f1ea', carp: '#5a3a2a', bajo: 'VC P VC', zoc: { t: 'liso', c: '#7e7a74', h: 1.2 }, contador: { x: 0.35 }, cables: true },
    ] },
    // titerroy_280: la Cristina, acera sur, pasos 1,2 — hoja titerroy/titerroy_280.jpg — antes: #f1eee7 #f1eee7 #f1eee7/tienda #f1eee7/tienda #f1eee7/tienda
    { id: 'titerroy_280', a: [-161.0, -814.6], b: [-195.5, -791.3], anchos: [8.4, 8.4, 8.3, 8.3, 8.3], altos: [4, 4, 6.6, 6.6, 6.6], casas: [
      { pared: '#b9bbbd', carp: '#ecebe6', bajo: 'M:3.6 _', marcoPersiana: '#ecebe6' },
      { pared: '#f3f1ea', carp: '#ecebe6', bajo: '_ M:3', marcoPersiana: '#ecebe6', zoc: { t: 'liso', c: '#cfcac6', h: 3.0 } },
      { pared: '#f3f1ea', carp: '#2a7a5e', bajo: 'PD:2.4 P', alto: 'VA VA', cables: true },
      { pared: 'bloque', carp: '#f4f4f2', bajo: 'PA G:3', alto: 'B:2.5', barandilla: '#f4f4f2', zoc: { t: 'granito', c: '#c4a39a', h: 3.2 }, contador: { x: 0.3 }, cables: true },
      { pared: '#f3f1ea', carp: '#3f9a8a', bajo: 'P _', alto: 'VA', contador: { x: 0.7 }, cables: true },
    ] },
    // titerroy_281: de Felipe II, acera oeste, pasos 23 — hoja titerroy/titerroy_281.jpg — antes: #e2c079 #e2c079
    { id: 'titerroy_281', a: [-1307.2, -73.6], b: [-1312.1, -88.8], anchos: [8, 8], altos: [6.6, 6.6], casas: [
      null,
      { pared: '#f3f1ea', carp: '#1e1e1e', bajo: 'VC:2.4 P', alto: 'VA VA', esq: { c: '#d9a640', lados: [1] }, contador: { x: 0.3 } },
    ] },
    // titerroy_282: de Felipe II, acera oeste, pasos 1 — hoja titerroy/titerroy_282.jpg — antes: #e9c3a4
    { id: 'titerroy_282', a: [-1380.9, -306.5], b: [-1377.9, -297.1], anchos: [9.8], altos: [6.6], casas: [
      { pared: '#e0cdb5', carp: '#f4f4f2', bajo: 'P G:3.2', alto: 'VA VA', zoc: { t: 'granito', c: '#b08a80', h: 0.9 }, franja: { c: '#f3f1ea', y: 3.3, h: 0.2 } },
    ] },
    // titerroy_283: de Felipe II, acera oeste, pasos 24 — hoja titerroy/titerroy_283.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_283', a: [-1312.1, -88.8], b: [-1307.2, -73.6], anchos: [8, 8], altos: [6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#1f6a45', barandilla: '#1f6a45', bajo: '_ VB:1.6', alto: 'VA VA', contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#1f6a45', reja: '#1f6a45', bajo: 'PA VR', alto: 'VA VA', num: 68, numX: 0.65 },
    ] },
    // titerroy_284: de la Princesa Yaiza, acera oeste, pasos 1,2,3,4,5,6,7 — hoja titerroy/titerroy_284.jpg — antes: #f1eee7 #e9c3a4 #e9c3a4 #e9c3a4 #d9b996 #d9b996 #d9b996 #f1eee7 #f1eee7
    { id: 'titerroy_284', a: [-668.9, -1342.7], b: [-674.4, -1428.5], anchos: [11.9, 12.8, 12, 10, 10, 7.1, 7.1, 7.6, 7.6], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: '_ G:3 _', cables: true },
      { pared: '#dcc2a2', carp: '#4a2c24', barandilla: '#3a3a3a', bajo: 'PD:2.4 P P V:2.6 P', alto: 'B VA', zoc: { t: 'liso', c: '#cdb391', h: 1.0 }, franja: { c: '#ece6d8', y: 3.0, h: 0.3 }, contador: { x: 0.75 }, cables: true },
      { pared: '#dcc2a2', carp: '#4a2c24', bajo: 'V:2 P V:2.4 P', zoc: { t: 'liso', c: '#cdb391', h: 1.0 }, franja: { c: '#ece6d8', y: 3.0, h: 0.3 }, contador: { x: 0.2 } },
      { pared: '#dcc2a2', carp: '#4a2c24', barandilla: '#3a3a3a', bajo: 'V:2 V:2.6', alto: 'B:2.5 VA', zoc: { t: 'liso', c: '#cdb391', h: 1.0 }, franja: { c: '#b9bcbf', y: 3.0, h: 0.2 }, contador: { x: 0.8 } },
      { pared: '#dcc2a2', carp: '#4a2c24', barandilla: '#3a3a3a', bajo: 'V:2 V:2.6', alto: 'B:2.5 B:2.5', zoc: { t: 'liso', c: '#cdb391', h: 2.8 } },
      { pared: '#dcc2a2', carp: '#4a2c24', bajo: 'V Es:1.6', marcoEscaparate: '#4a2c24', zoc: { t: 'liso', c: '#cdb391', h: 2.8 }, franja: { c: '#b9bcbf', y: 3.0, h: 0.2 } },
      { pared: '#dcc2a2', carp: '#4a2c24', bajo: 'V:3', zoc: { t: 'liso', c: '#cdb391', h: 2.8 }, contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'V G:2.4', zoc: { t: 'liso', c: '#c9b49a', h: 2.6 }, contador: { x: 0.2 }, cables: true },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'VC:2 _', zoc: { t: 'liso', c: '#e2dcd2', h: 1.0 }, franja: { c: '#4a6a8a', y: 1.0, h: 0.1 }, cables: true },
    ] },
    // titerroy_285: de la Princesa Yaiza, acera este, pasos 8,9 — hoja titerroy/titerroy_285.jpg — antes: #efe6c8 #efe6c8 #a9abad
    { id: 'titerroy_285', a: [-655.7, -1428.2], b: [-657.4, -1455.0], anchos: [9.9, 9.9, 7.2], altos: [4, 4, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#d9c8b4', reja: '#2a2a2a', bajo: 'VR P', num: 20, numX: 0.05, contador: { x: 0.85 }, cables: true },
      { pared: '#f3f1ea', carp: '#d9c8b4', reja: '#3a3a3a', bajo: 'P VR:1.0', contador: { x: 0.35 }, cables: true },
      { pared: '#f3f1ea', carp: '#6b4a30', reja: '#1f7a45', bajo: 'P VR:1.6', num: 24, numX: 0.25, contador: { x: 0.8 }, cables: true },
    ] },
    // titerroy_286: de la Princesa Yaiza, acera este, pasos 1,2,3,4,5,6,7 — hoja titerroy/titerroy_286.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #a9abad #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_286', a: [-658.1, -1345.0], b: [-663.5, -1429.2], anchos: [10.3, 12.8, 12, 10, 10, 7.1, 7.1, 7.6, 7.6], altos: [4, 4, 6.6, 6.6, 6.6, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f2a5a', bajo: '_ _ VR', ventanaAlta: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V:2.4 P G:2.6', contador: { x: 0.85 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P G:3', num: 4, numX: 0.1, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P V P G:2.6', zoc: { t: 'liso', c: '#3e4a78', h: 1.1 }, num: 6, numX: 0.15, contador: { x: 0.3 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', barandilla: '#f4f4f2', bajo: 'G:2.6 P G:2.6', alto: 'VB V', zoc: { t: 'liso', c: '#5a5560', h: 3.2 }, contador: { x: 0.45 } },
      { pared: '#f3f1ea', carp: '#1f8a5a', bajo: 'PD:3 P V', zoc: { t: 'liso', c: '#d0a050', h: 1.0 }, franja: { c: '#1f8a5a', y: 1.0, h: 0.08 }, contador: { x: 0.1 }, cables: true },
      null,
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V P', zoc: { t: 'liso', c: '#4a4650', h: 1.0 }, num: 12, numX: 0.6, contador: { x: 0.85 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'PD:2.8 P', zoc: { t: 'liso', c: '#4a4650', h: 1.0 }, contador: { x: 0.65 }, cables: true },
    ] },
    // titerroy_287: de la Princesa Yaiza, acera oeste, pasos 8,9 — hoja titerroy/titerroy_287.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_287', a: [-674.2, -1427.0], b: [-676.7, -1467.4], anchos: [9.9, 9.9, 10.4, 10.4], altos: [4, 4, 4, 4], casas: [
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'P G:3', zoc: { t: 'piedra', c: '#a08670', junta: '#d8ccb8', h: 1.3 }, contador: { x: 0.45 }, cables: true },
      null,
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'G:3 P G:2.6', zoc: { t: 'liso', c: '#a89a9e', h: 2.8 }, num: 26, numX: 0.6, contador: { x: 0.6 }, cables: true },
      null,
    ] },
    // titerroy_288: Tebete, acera este, pasos 3 — hoja titerroy/titerroy_288.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_288', a: [-626.7, -1180.5], b: [-613.0, -1160.4], anchos: [8.1, 8.1, 8.1], altos: [6.6, 6.6, 6.6], casas: [
      null,
      { pared: '#ece9e2', carp: '#5a3a2a', bajo: 'VA:2.2 VA:1.6', cables: true },
      { pared: '#ddd0bc', carp: '#1f7a45', bajo: '_ VR', cables: true },
    ] },
    // titerroy_289: Tebete, acera oeste, pasos 3 — hoja titerroy/titerroy_289.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_289', a: [-631.6, -1167.8], b: [-621.3, -1152.8], anchos: [9.1, 9.1], altos: [6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#7a4a2a', bajo: 'M:2.4 VC:1.6 V P', persiana: '#8a5a35', marcoPersiana: '#7a4a2a', alto: 'B:2.6 VA', zoc: { t: 'granito', c: '#6e7074', h: 1.2 }, num: 3, numX: 0.75, cables: true },
      { pared: '#f3f1ea', carp: '#9a9590', bajo: '_ G:2.6', zoc: { t: 'granito', c: '#6e7074', h: 1.2 }, cables: true },
    ] },
    // titerroy_290: Managua, acera sur, pasos 1 — hoja titerroy/titerroy_290.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_290', a: [-748.8, -1737.7], b: [-728.6, -1737.6], anchos: [10.1, 10.1], altos: [6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#2a8a6a', bajo: '_ PD:1.8', alto: 'VC:2 VC', zoc: { t: 'liso', c: '#5a6068', h: 1.0 }, num: 23, numX: 0.75, contador: { x: 0.95 }, cables: true },
      { pared: '#f3f1ea', carp: '#2a8a6a', bajo: 'P PD:3.2', alto: 'VC VC', num: 21, numX: 0.2, contador: { x: 0.4 }, cables: true },
    ] },
    // titerroy_291: Managua, acera sur, pasos 3,4,5,6 — hoja titerroy/titerroy_291.jpg — antes: #f1eee7 #f1eee7 #efe6c8/tienda #efe6c8/tienda
    { id: 'titerroy_291', a: [-698.8, -1739.6], b: [-658.7, -1740.0], anchos: [11.4, 9.5, 8.4, 10.7], altos: [6.6, 6.6, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VR:2.4 P G:2.6', alto: 'VC:3 VC', contador: { x: 0.5 }, cables: true },
      { pared: '#f3f1ea', carp: '#7a6a5a', bajo: 'Mr:3.2', marcoPersiana: '#6a7a8a', alto: 'VC VC', contador: { x: 0.2 }, cables: true },
      { pared: '#efe3c4', carp: '#1f7a45', bajo: 'PA _', zoc: { t: 'liso', c: '#c9a898', h: 1.0 }, num: 9, numX: 0.3, contador: { x: 0.65 }, cables: true },
      { pared: '#efe3c4', carp: '#1f7a45', bajo: 'Es:2.6 _', marcoEscaparate: '#1f7a45', toldo: '#2f6a4a', zoc: { t: 'liso', c: '#c9a898', h: 1.0 }, cables: true },
    ] },
    // titerroy_292: Managua, acera sur, pasos 7,8,9 — hoja titerroy/titerroy_292.jpg — antes: #f1eee7 #e9c3a4 #e9c3a4
    { id: 'titerroy_292', a: [-649.7, -1740.8], b: [-613.0, -1741.8], anchos: [13.2, 13.2, 10.4], altos: [6.6, 9.4, 9.4], casas: [
      { pared: '#f3f1ea', carp: '#2f4a42', reja: '#f4f4f2', bajo: 'VR:1.2 P PD:2', num: 5, numX: 0.92, contador: { x: 0.4 } },
      { pared: '#dcb9a0', carp: '#f4f4f2', barandilla: '#f4f4f2', bajo: 'V P V V P V', alto: 'VB VB VB', zoc: { t: 'liso', c: '#b49a80', h: 1.0 }, contador: { x: 0.2 } },
      { pared: '#dcb9a0', carp: '#f4f4f2', barandilla: '#f4f4f2', bajo: 'V V P V', alto: 'VB VB', zoc: { t: 'liso', c: '#b49a80', h: 1.0 }, contador: { x: 0.9 } },
    ] },
    // titerroy_293: del Mar del Plata, acera sur, pasos 1 — hoja titerroy/titerroy_293.jpg — antes: #e9c3a4 #e9c3a4
    { id: 'titerroy_293', a: [-747.2, -1394.7], b: [-759.3, -1385.9], anchos: [7.5, 7.5], altos: [6.6, 6.6], casas: [
      { pared: '#ddc9b2', carp: '#3b2620', bajo: 'P VA:2.4', zoc: { t: 'granito', c: '#6e7a74', h: 1.3 }, esq: { c: '#c9b69a', lados: [0] }, num: 12, numX: 0.1, contador: { x: 0.6 } },
      { pared: '#ddc9b2', carp: '#3b2620', bajo: 'VA _', zoc: { t: 'granito', c: '#6e7a74', h: 1.3 } },
    ] },
    // titerroy_294: del Mar del Plata, acera norte, pasos 1 — hoja titerroy/titerroy_294.jpg — antes: #f1eee7
    { id: 'titerroy_294', a: [-753.0, -1403.5], b: [-762.9, -1396.4], anchos: [12.2], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V:1.6 P G:2.8', zoc: { t: 'liso', c: '#9c7a5e', h: 1.3 }, contador: { x: 0.45 }, cables: true },
    ] },
    // titerroy_295: del Mar del Plata, acera norte, pasos 2,3 — hoja titerroy/titerroy_295.jpg — antes: #f1eee7/solar #f1eee7
    { id: 'titerroy_295', a: [-785.0, -1384.8], b: [-798.9, -1374.6], anchos: [13.6, 4.5], altos: [0, 4], casas: [
      null,
      null,
    ] },
    // titerroy_296: del Castillo de las Coloradas, acera oeste, pasos 1 — hoja titerroy/titerroy_296.jpg — antes: #e2c079 #e2c079
    { id: 'titerroy_296', a: [-625.4, -212.4], b: [-618.0, -228.1], anchos: [8.7, 8.7], altos: [6.6, 6.6], casas: [
      { pared: '#e2c79a', carp: '#a89a88', bajo: '_', alto: 'V:2.6 V:2.6' },
      { pared: '#e2c79a', carp: '#a89a88', bajo: '_', alto: 'V:2.6 V:2.6', contador: { x: 0.5 } },
    ] },
    // titerroy_297: del Castillo de las Coloradas, acera este, pasos 2 — hoja titerroy/titerroy_297.jpg — antes: #a9abad/tienda
    { id: 'titerroy_297', a: [-597.0, -244.7], b: [-600.8, -236.7], anchos: [8.8], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#c8a070', bajo: 'P:1.4 Es:2.6 P', marcoEscaparate: '#d8d8d6', num: 6, numX: 0.1, contador: { x: 0.25 } },
    ] },
    // titerroy_298: del Castillo de las Coloradas, acera oeste, pasos 3,4,5,6 — hoja titerroy/titerroy_298.jpg — antes: #a9abad/tienda #a9abad #f1eee7/tienda #f1eee7/tienda
    { id: 'titerroy_298', a: [-608.2, -242.9], b: [-591.1, -278.7], anchos: [10.2, 13.1, 8.9, 7.5], altos: [6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#a9adb3', carp: '#6a6e74', bajo: 'P Es:3', marcoEscaparate: '#6a6e74', num: 3, numX: 0.35 },
      { pared: '#a9adb3', carp: '#4a4e54', bajo: 'P:1.2 _ _', contador: { x: 0.7 }, cables: true },
      { pared: '#dcd8d0', carp: '#f4f4f2', bajo: 'P Es:2.8', marcoEscaparate: '#f4f4f2', zoc: { t: 'granito', c: '#2e2e30', h: 1.0 }, num: 5, numX: 0.08, cables: true },
      { pared: '#dcd8d0', carp: '#e6e6e4', bajo: 'Es:3.6', marcoEscaparate: '#e6e6e4', zoc: { t: 'granito', c: '#2e2e30', h: 1.2 }, esq: { c: '#2e2e30', lados: [1] }, cables: true },
    ] },
  ],
};
