/**
 * Fachadas dibujadas: titerroy, tanda 2 (50 tramos de
 * src/barrios/compartido/fachadasCasa.js). Cada casa se describe mirando la hoja de fotos de su tramo
 * (carpeta _trabajo_fachadas); null = no se dibuja. Método: skill lava-game-fachadas.
 */

const BLANCO = '#f3f1ea', CREMA = '#efe3c4', BLANCA = '#f4f4f2';
const MARRON = '#4a2c1f', MARRON_OSC = '#2e211b', VERDE = '#1f7a45', VERDE_AGUA = '#3f7f76';

export default {
  nombre: 'titerroy 2',
  aceras: [
    // titerroy_196: de Guatemala, acera norte, pasos 2,3 — hoja titerroy/titerroy_196.jpg — antes: #efe6c8 #f1eee7
    { id: 'titerroy_196', a: [-655.7, -181.7], b: [-667.7, -175.4], anchos: [6.9, 6.7], altos: [6.6, 4], casas: [
      { pared: BLANCO, carp: '#4a3226', bajo: 'P:0.8 PD P VC', alto: 'VA VA', zoc: { t: 'liso', c: '#4d6b2e', h: 0.9 }, num: 6, numX: 0.6, cables: true, contador: { x: 0.05 } },
      { pared: BLANCO, carp: '#2f9a48', bajo: 'PD:2.4', cables: true },
    ] },
    // titerroy_197: de Guatemala, acera norte, pasos 1 — hoja titerroy/titerroy_197.jpg — antes: #f1eee7
    { id: 'titerroy_197', a: [-631.0, -194.3], b: [-640.6, -189.4], anchos: [10.7], altos: [6.6], casas: [
      { pared: BLANCO, carp: '#5a3a28', bajo: 'VR:2 P G:3', alto: 'VA VA', zoc: { t: 'granito', c: '#c9c2b5', h: 1.0 }, cables: true, contador: { x: 0.45 } },
    ] },
    // titerroy_198: de Guatemala, acera sur, pasos 2,3 — hoja titerroy/titerroy_198.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_198', a: [-650.3, -171.4], b: [-668.1, -162.2], anchos: [6.9, 13.1], altos: [6.6, 4], casas: [
      { pared: '#e9dcc0', carp: '#3e2a20', bajo: 'M:2.8 P', persiana: '#4a3226', marcoPersiana: '#3e2a20', alto: 'VA VA', zoc: { t: 'liso', c: '#d6c2a0', h: 1.0 }, cables: true },
      { pared: BLANCO, carp: '#3e2a20', bajo: 'PD P PD P V M:2.4', persiana: '#9a9c9e', marcoPersiana: '#8b8f93', zoc: { t: 'liso', c: '#8e9093', h: 1.0 }, num: 3, numX: 0.55, cables: true },
    ] },
    // titerroy_199: Timbayba, acera norte, pasos 1 — hoja titerroy/titerroy_199.jpg — antes: #f1eee7
    { id: 'titerroy_199', a: [-697.1, -745.0], b: [-686.0, -753.2], anchos: [13.8], altos: [4], casas: [
      { pared: BLANCO, carp: '#3a2e28', bajo: 'P:1.3 _ PD:3.2', zoc: { t: 'granito', c: '#8a8784', h: 1.1 }, franja: { c: '#3a3634', y: 1.1, h: 0.1 }, cables: true, contador: { x: 0.45 } },
    ] },
    // titerroy_200: Timbayba, acera sur, pasos 2,3 — hoja titerroy/titerroy_200.jpg — antes: #f1eee7 #f1eee7 #e2c079 #e2c079
    { id: 'titerroy_200', a: [-680.1, -746.1], b: [-652.4, -766.3], anchos: [8.6, 8.6, 8.6, 8.6], altos: [4, 4, 6.6, 6.6], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: 'V P G', zoc: { t: 'granito', c: '#9e9c98', h: 1.2 }, cables: true },
      { pared: BLANCO, carp: BLANCA, bajo: 'VA P', zoc: { t: 'piedra', c: '#8a6a50', junta: '#c9b9a5', h: 1.0 }, num: 6, numX: 0.95, contador: { x: 0.2 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'V P VC', zoc: { t: 'piedra', c: '#9a7d66', junta: '#cdbba5', h: 2.2 }, cables: true, contador: { x: 0.9 } },
      null,
    ] },
    // titerroy_201: Timbayba, acera norte, pasos 4,5 — hoja titerroy/titerroy_201.jpg — antes: #f1eee7 #f1eee7 #e9c3a4 #e9c3a4 #e9c3a4
    { id: 'titerroy_201', a: [-671.6, -763.9], b: [-638.0, -788.4], anchos: [8.5, 8.5, 8.2, 8.2, 8.2], altos: [4, 4, 6.6, 6.6, 6.6], casas: [
      { pared: '#d6ad62', carp: MARRON_OSC, bajo: 'V P', cables: true },
      { pared: BLANCO, carp: BLANCA, bajo: 'VA P', zoc: { t: 'piedra', c: '#a08670', junta: '#d7c7b2', h: 1.6 }, contador: { x: 0.08 } },
      null,
      { pared: '#e9c3a4', carp: BLANCA, bajo: 'V:1.8 P V', zoc: { t: 'piedra', c: '#3b3a38', h: 1.0 }, cables: true },
      null,
    ] },
    // titerroy_202: Timbayba, acera sur, pasos 6 — hoja titerroy/titerroy_202.jpg — antes: #dd7d70
    { id: 'titerroy_202', a: [-631.1, -782.1], b: [-637.9, -777.1], anchos: [8.4], altos: [4], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: 'V:2 P V:2', zoc: { t: 'granito', c: '#9a9a98', h: 1.2 }, franja: { c: '#2b2b2b', y: 1.2, h: 0.08 }, cables: true, contador: { x: 0.4 } },
    ] },
    // titerroy_203: Timbayba, acera sur, pasos 7,8,9,10,11 — hoja titerroy/titerroy_203.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_203', a: [-622.5, -788.5], b: [-574.4, -823.3], anchos: [13.5, 11.3, 12.9, 12.2, 9.4], altos: [4, 4, 4, 4, 4], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: 'G:3 VR', zoc: { t: 'granito', c: '#c8b49a', h: 2.4 } },
      { pared: BLANCO, carp: MARRON, bajo: 'P G P VC:2', contador: { x: 0.85 } },
      { pared: BLANCO, carp: '#2b2b2b', bajo: 'P P VC PA V', num: 26, numX: 0.72, cables: true, contador: { x: 0.8 } },
      { pared: BLANCO, carp: VERDE_AGUA, bajo: 'V V _ VC', cables: true },
      { pared: BLANCO, carp: '#6b3a28', bajo: 'P V', num: 28, numX: 0.08, cables: true, contador: { x: 0.5 } },
    ] },
    // titerroy_204: Timbayba, acera sur, pasos 1 — hoja titerroy/titerroy_204.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_204', a: [-692.1, -737.2], b: [-680.5, -745.7], anchos: [7.2, 7.2], altos: [6.6, 6.6], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: 'VR:1.2', alto: 'VA', cables: true, contador: { x: 0.4 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'VR:1.1', alto: 'VA', franja: { c: '#e6e4dc', y: 3.2, h: 0.12 }, cables: true },
    ] },
    // titerroy_205: Timbayba, acera norte, pasos 2,3 — hoja titerroy/titerroy_205.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_205', a: [-685.5, -753.5], b: [-657.9, -773.7], anchos: [8.6, 8.6, 8.6, 8.6], altos: [4, 4, 4, 4], casas: [
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'VC:2 P', zoc: { t: 'granito', c: '#a59f86', h: 2.3 }, contador: { x: 0.05 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'P VC', zoc: { t: 'granito', c: '#a59f86', h: 2.0 }, cables: true },
      { pared: '#dcb874', carp: '#3b2418', bajo: 'V P', zoc: { t: 'piedra', c: '#8f6e52', junta: '#c4a988', h: 1.1 }, cables: true },
      { pared: BLANCO, carp: BLANCA, bajo: 'VA P', zoc: { t: 'piedra', c: '#9a7d66', junta: '#cdbba5', h: 2.0 }, contador: { x: 0.1 } },
    ] },
    // titerroy_206: Timbayba, acera sur, pasos 4,5 — hoja titerroy/titerroy_206.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_206', a: [-666.1, -756.4], b: [-632.6, -781.0], anchos: [8.5, 8.5, 8.2, 8.2, 8.2], altos: [4, 4, 6.6, 6.6, 6.6], casas: [
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'V:2 P V:1.8', zoc: { t: 'piedra', c: '#9a6a4e', junta: '#d8c4ae', h: 1.1 }, cables: true },
      { pared: BLANCO, carp: '#5a3a2a', bajo: 'V P', zoc: { t: 'granito', c: '#2f2f30', h: 2.5 }, contador: { x: 0.1 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'V:2 P V', alto: 'VA VA', zoc: { t: 'granito', c: '#55534f', h: 1.0 }, cables: true },
      { pared: BLANCO, carp: BLANCA, bajo: 'PA VA', alto: 'VA B:2', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#b8b8b6', h: 1.6 }, num: 14, numX: 0.3, cables: true },
      null,
    ] },
    // titerroy_207: Timbayba, acera norte, pasos 6 — hoja titerroy/titerroy_207.jpg — antes: #f1eee7
    { id: 'titerroy_207', a: [-636.4, -789.7], b: [-643.4, -784.6], anchos: [8.6], altos: [4], casas: [
      { pared: '#c9483c', carp: '#3a2a22', bajo: 'VC:1.8 _ P', zoc: { t: 'piedra', c: '#34302d', h: 1.3 }, esq: { c: '#2f2c2a', t: 'sillares', lados: [0] }, contador: { x: 0.45 } },
    ] },
    // titerroy_208: Timbayba, acera norte, pasos 8,9,10,11,12 — hoja titerroy/titerroy_208.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_208', a: [-615.9, -804.5], b: [-574.1, -834.7], anchos: [10.1, 12.9, 12.2, 8.4, 7.9], altos: [6.6, 4, 4, 4, 4], casas: [
      { pared: BLANCO, carp: VERDE, bajo: 'V V', zoc: { t: 'piedra', c: '#a86a5e', junta: '#d9b3a8', h: 1.3 }, contador: { x: 0.2 } },
      { pared: BLANCO, carp: VERDE, bajo: 'V _ VC:0.9', zoc: { t: 'piedra', c: '#7a3a2c', junta: '#c9a093', h: 1.0 }, contador: { x: 0.6 }, cables: true },
      { pared: BLANCO, carp: '#5e3d2e', bajo: 'PA V PD V', zoc: { t: 'liso', c: '#a9abad', h: 1.0 }, cables: true },
      { pared: BLANCO, carp: VERDE, bajo: 'VC _ V', zoc: { t: 'liso', c: '#a9abad', h: 1.4 }, num: 31, numX: 0.95, cables: true, contador: { x: 0.1 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'P V V', num: 33, numX: 0.08, contador: { x: 0.5 } },
    ] },
    // titerroy_209: de Carlos III, acera norte, pasos 3,4,5 — hoja titerroy/titerroy_209.jpg — antes: #f1eee7 #9d9890 #e6d3b8 #e6d3b8
    { id: 'titerroy_209', a: [-385.2, -815.6], b: [-416.3, -792.3], anchos: [11.4, 13, 7.3, 7.3], altos: [4, 4, 6.6, 6.6], casas: [
      { pared: BLANCO, carp: '#2f9a5a', bajo: 'P _ M:3.2', persiana: '#2c3a6b', marcoPersiana: '#c8333a', zoc: { t: 'liso', c: '#8e9093', h: 1.0 }, num: 65, numX: 0.2, cables: true, contador: { x: 0.1 } },
      null,
      null,
      { pared: BLANCO, carp: '#3a2a24', bajo: 'PD:3', zoc: { t: 'liso', c: '#7d7f82', h: 0.9 }, cables: true, contador: { x: 0.9 } },
    ] },
    // titerroy_210: de Carlos III, acera sur, pasos 5 — hoja titerroy/titerroy_210.jpg — antes: #f1eee7
    { id: 'titerroy_210', a: [-407.4, -785.0], b: [-401.1, -789.6], anchos: [7.8], altos: [4], casas: [
      { pared: '#c4b39c', carp: '#5a3d2e', bajo: 'P V P PD:2.6', cables: true },
    ] },
    // titerroy_211: de Carlos III, acera norte, pasos 6 — hoja titerroy/titerroy_211.jpg — antes: #f1eee7/tienda #f1eee7/tienda
    { id: 'titerroy_211', a: [-415.0, -793.6], b: [-429.3, -782.9], anchos: [8.9, 8.9], altos: [4, 4], casas: [
      { pared: '#d7d5d0', carp: '#8b8f93', bajo: 'Es:2 VR:1.2', ventanaAlta: true, zoc: { t: 'piedra', c: '#5a4a44', junta: '#c9bfb8', h: 0.9 }, cables: true, contador: { x: 0.1 } },
      null,
    ] },
    // titerroy_212: de Carlos III, acera norte, pasos 9,10 — hoja titerroy/titerroy_212.jpg — antes: #a9abad/tienda #f1eee7/tienda
    { id: 'titerroy_212', a: [-459.2, -761.4], b: [-467.1, -755.4], anchos: [4.5, 6.2], altos: [6.6, 4], casas: [
      { pared: '#a5a29c', carp: BLANCA, bajo: 'E:2.6', alto: 'VA', zoc: { t: 'granito', c: '#2a2a2a', h: 0.8 }, cables: true },
      { pared: '#a5a29c', carp: BLANCA, bajo: 'M:2 E:2.4', persiana: '#c4c4c2', marcoPersiana: '#b5b5b5', zoc: { t: 'granito', c: '#2a2a2a', h: 1.6 }, franja: { c: '#2d2d2d', y: 3.0, h: 0.8 } },
    ] },
    // titerroy_213: de Carlos III, acera norte, pasos 11,12,13 — hoja titerroy/titerroy_213.jpg — antes: #f1eee7 #efe6c8 #efe6c8 #f1eee7 #f1eee7
    { id: 'titerroy_213', a: [-475.1, -746.6], b: [-513.9, -717.9], anchos: [12.9, 9.6, 9.6, 8.1, 8.1], altos: [4, 4, 4, 4, 4], casas: [
      { pared: BLANCO, carp: '#4a3326', bajo: 'V:1.8 _ V', zoc: { t: 'granito', c: '#e2ddd2', h: 2.3 }, cables: true, contador: { x: 0.9 } },
      { pared: CREMA, carp: BLANCA, bajo: 'P:1.7 P:1.3' },
      null,
      null,
      { pared: BLANCO, carp: VERDE, bajo: 'VR P', num: 39, numX: 0.9, cables: true },
    ] },
    // titerroy_214: de Carlos III, acera norte, pasos 14,15,16 — hoja titerroy/titerroy_214.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_214', a: [-521.9, -711.9], b: [-550.6, -690.4], anchos: [7.2, 7.2, 13.9, 7.6], altos: [4, 4, 4, 4], casas: [
      { pared: BLANCO, carp: '#1e1c1c', bajo: 'VC P VC', zoc: { t: 'granito', c: '#3a3436', h: 1.3 }, num: 37, numX: 0.5, cables: true },
      { pared: BLANCO, carp: VERDE, bajo: 'VC P VC', zoc: { t: 'piedra', c: '#b8784f', junta: '#e0c3a8', h: 1.1 }, cables: true, contador: { x: 0.92 } },
      { pared: BLANCO, carp: '#3e2a20', bajo: 'PA:2.2 VR:1.8', zoc: { t: 'granito', c: '#b9b2a6', h: 1.0 }, num: 31, numX: 0.45, cables: true },
      { pared: BLANCO, carp: '#3e2a20', bajo: 'P:1.2', zoc: { t: 'granito', c: '#b9ad9e', h: 1.1 }, cables: true },
    ] },
    // titerroy_215: de Carlos III, acera norte, pasos 17,18,19,20 — hoja titerroy/titerroy_215.jpg — antes: #f1eee7 #f1eee7 #5f8f5a #ece8e0 #5f8f5a #f1eee7
    { id: 'titerroy_215', a: [-559.9, -684.3], b: [-595.4, -658.3], anchos: [7.2, 7.2, 4.6, 4.6, 10, 10.2], altos: [4, 4, 4, 4, 4, 4], casas: [
      null,
      { pared: BLANCO, carp: '#4a3326', bajo: 'V:1.8 V P', zoc: { t: 'piedra', c: '#8c7a6a', junta: '#d0c4b8', h: 1.3 }, cables: true, contador: { x: 0.75 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'VA', zoc: { t: 'granito', c: '#b5a796', h: 2.3 }, contador: { x: 0.2 }, cables: true },
      { pared: '#8fae3a', carp: '#a0743e', bajo: 'PD:2.4 V:0.8', cables: true, contador: { x: 0.65 } },
      { pared: '#8fae3a', carp: '#5a3a28', bajo: 'VC:1.8 P VR', cables: true },
      { pared: BLANCO, carp: '#4a2c24', bajo: 'V:1.6 V V:1', zoc: { t: 'liso', c: '#a9abad', h: 1.2 }, cables: true, contador: { x: 0.4 } },
    ] },
    // titerroy_216: Alcalde Ginés de la Hoz, acera oeste, pasos 2 — hoja titerroy/titerroy_216.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_216', a: [-631.7, -619.3], b: [-617.9, -600.2], anchos: [7.8, 7.8, 7.8], altos: [6.6, 6.6, 6.6], casas: [
      { pared: '#e6e6e2', carp: BLANCA, bajo: 'VR:2 P', zoc: { t: 'liso', c: '#cfcfcd', h: 2.3 }, cables: true, contador: { x: 0.95 } },
      { pared: BLANCO, carp: '#3e2a20', bajo: 'P VC:2', alto: 'VC VC', zoc: { t: 'piedra', c: '#b89a7c', junta: '#d9cbb8', h: 3.0 }, cables: true, contador: { x: 0.25 } },
      null,
    ] },
    // titerroy_217: la Pardela, acera sur, pasos 3,4 — hoja titerroy/titerroy_217.jpg — antes: #f1eee7/solar #f1eee7
    { id: 'titerroy_217', a: [-688.6, -1223.7], b: [-678.7, -1232.3], anchos: [6.6, 6.5], altos: [0, 4], casas: [
      null,
      { pared: BLANCO, carp: '#1f6e3c', bajo: 'PD:2 VC:2' },
    ] },
    // titerroy_218: la Pardela, acera sur, pasos 8,9,10,11 — hoja titerroy/titerroy_218.jpg — antes: #e6d3b8/tienda #e6d3b8/tienda #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_218', a: [-629.9, -1280.2], b: [-570.1, -1321.3], anchos: [11.2, 11.2, 10.4, 10.4, 10.4, 9.5, 9.5], altos: [6.6, 6.6, 4, 4, 4, 4, 4], casas: [
      { pared: '#d8b98e', carp: '#4a3a32', bajo: '_ PD:3.4', franja: { c: '#f4f4f2', y: 4.2, h: 1.0 }, esq: { c: '#e6d3b8', lados: [0] }, contador: { x: 0.3 } },
      null,
      { pared: BLANCO, carp: '#6b747a', bajo: '_ PD:3', zoc: { t: 'granito', c: '#5f6563', h: 1.4 }, contador: { x: 0.5 } },
      null,
      null,
      null,
      { pared: BLANCO, carp: '#6b747a', bajo: '_ _ PD:3', zoc: { t: 'granito', c: '#5f6563', h: 1.4 } },
    ] },
    // titerroy_219: Gaida, acera oeste, pasos 3 — hoja titerroy/titerroy_219.jpg — antes: #f1eee7
    { id: 'titerroy_219', a: [-995.8, -703.9], b: [-989.0, -712.1], anchos: [10.7], altos: [4], casas: [
      { pared: '#e8e2d0', carp: '#4f8a7e', bajo: 'P PD:2 PD:1.8', num: 34, numX: 0.1, cables: true },
    ] },
    // titerroy_220: Gaida, acera oeste, pasos 4 — hoja titerroy/titerroy_220.jpg — antes: #efe6c8
    { id: 'titerroy_220', a: [-981.0, -721.0], b: [-975.2, -727.9], anchos: [9], altos: [6.6], casas: [
      { pared: '#ecdcb4', carp: BLANCA, bajo: 'M:2.6 P M:3', persiana: '#f0ede6', marcoPersiana: '#e8d6a8', alto: 'VA VA VA', franja: { c: '#e2cf9e', y: 3.2, h: 0.25 }, num: 28, numX: 0.45, cables: true },
    ] },
    // titerroy_221: Gaida, acera oeste, pasos 5,6,7,8 — hoja titerroy/titerroy_221.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_221', a: [-974.7, -727.5], b: [-954.6, -751.7], anchos: [4.8, 7.7, 7.5, 11.5], altos: [6.6, 6.6, 6.6, 6.6], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: 'VR:1 VR:1 G:2.6', alto: 'VA', num: 26, numX: 0.55, contador: { x: 0.45 } },
      { pared: BLANCO, carp: '#b9b9b6', bajo: 'PD:3.2', alto: 'B VA', barandilla: '#f4f4f2', contador: { x: 0.1 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'PA G:3', alto: 'VA VA', zoc: { t: 'liso', c: '#b8b8b6', h: 1.0 }, num: 24, numX: 0.2, cables: true, contador: { x: 0.35 } },
      { pared: BLANCO, carp: '#9a9a96', bajo: 'PD:2.8 PA PD:2.6', alto: 'B B VA', barandilla: '#f4f4f2', num: 22, numX: 0.5, cables: true, contador: { x: 0.4 } },
    ] },
    // titerroy_222: Gaida, acera oeste, pasos 9 — hoja titerroy/titerroy_222.jpg — antes: #e9c3a4
    { id: 'titerroy_222', a: [-954.5, -751.6], b: [-948.6, -758.6], anchos: [9.2], altos: [6.6], casas: [
      { pared: '#eeb58c', carp: BLANCA, bajo: 'V:1.6 V:1.2', alto: 'VR VR', franja: { c: '#f3f1ea', y: 3.1, h: 0.25 }, cables: true, contador: { x: 0.05 } },
    ] },
    // titerroy_223: Gaida, acera este, pasos 10,11,12 — hoja titerroy/titerroy_223.jpg — antes: #e6d3b8 #f1eee7 #e9c3a4 #e9c3a4
    { id: 'titerroy_223', a: [-934.5, -759.9], b: [-910.8, -787.5], anchos: [8.3, 9.9, 9.1, 9.1], altos: [4, 6.6, 6.6, 6.6], casas: [
      { pared: CREMA, carp: BLANCA, bajo: 'VA VA', zoc: { t: 'liso', c: '#d8c196', h: 1.3 } },
      { pared: CREMA, carp: BLANCA, bajo: 'VA _ VA', zoc: { t: 'liso', c: '#d8c196', h: 1.2 }, cables: true },
      { pared: CREMA, carp: BLANCA, bajo: 'VA VA', zoc: { t: 'liso', c: '#d4bb8c', h: 1.4 }, cables: true, contador: { x: 0.85 } },
      null,
    ] },
    // titerroy_224: Gaida, acera oeste, pasos 13,14,15 — hoja titerroy/titerroy_224.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7/solar
    { id: 'titerroy_224', a: [-929.2, -781.6], b: [-892.6, -824.2], anchos: [9, 9, 8.4, 8.4, 21.3], altos: [6.6, 6.6, 4, 4, 0], casas: [
      { pared: BLANCO, carp: VERDE, bajo: 'PD:2 VC P', alto: 'B:3', barandilla: VERDE, zoc: { t: 'liso', c: '#a9abad', h: 1.1 }, cables: true },
      { pared: BLANCO, carp: VERDE, bajo: '_ P', zoc: { t: 'liso', c: '#a9abad', h: 1.1 }, cables: true, contador: { x: 0.25 } },
      { pared: BLANCO, carp: '#8b8f93', bajo: '_ M:3.2', persiana: '#b5b7b9', marcoPersiana: '#8b8f93', zoc: { t: 'liso', c: '#a9abad', h: 1.2 }, cables: true, contador: { x: 0.1 } },
      { pared: BLANCO, carp: '#5a3326', bajo: 'P', zoc: { t: 'liso', c: '#a9abad', h: 1.2 }, cables: true, contador: { x: 0.3 } },
      null,
    ] },
    // titerroy_225: Gaida, acera este, pasos 3 — hoja titerroy/titerroy_225.jpg — antes: #efe6c8 #efe6c8
    { id: 'titerroy_225', a: [-993.3, -690.7], b: [-980.6, -705.9], anchos: [9.9, 9.9], altos: [4, 4], casas: [
      null,
      { pared: '#ece6da', carp: BLANCA, bajo: '_ M:3.2', persiana: '#e9eaea', zoc: { t: 'piedra', c: '#c27a4a', junta: '#e8d2bf', h: 2.9 }, cables: true },
    ] },
    // titerroy_226: Gaida, acera este, pasos 4,5,6,7,8,9 — hoja titerroy/titerroy_226.jpg — antes: #efe6c8 #e9c3a4 #efe6c8 #efe6c8 #efe6c8 #f1eee7 #efe6c8 #f1eee7
    { id: 'titerroy_226', a: [-963.1, -726.3], b: [-941.6, -752.1], anchos: [2.2, 2.2, 8.8, 7.7, 7.5, 5, 5, 10.2], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 4], casas: [
      { pared: CREMA, carp: '#6b3a28', bajo: '_', zoc: { t: 'piedra', c: '#b89878', junta: '#e0d0b8', h: 1.3 } },
      { pared: BLANCO, carp: '#6b3a28', bajo: 'P', zoc: { t: 'granito', c: '#6d6d6b', h: 1.3 }, num: 25, numX: 0.2, contador: { x: 0.2 } },
      { pared: '#e8a77a', carp: '#a8653a', bajo: 'G:4.5', garajeVentanas: true, zoc: { t: 'granito', c: '#7a7876', h: 1.2 }, cables: true },
      { pared: CREMA, carp: '#5a2f24', bajo: 'PD:3.4 P VC', zoc: { t: 'piedra', c: '#b8875a', junta: '#dcc3a3', h: 2.6 }, num: 11, numX: 0.55, contador: { x: 0.9 } },
      { pared: '#efdcb4', carp: BLANCA, bajo: 'G:3.2 P', zoc: { t: 'piedra', c: '#c2a47c', junta: '#e5d6bf', h: 1.6 }, cables: true, contador: { x: 0.65 } },
      { pared: BLANCO, carp: '#1f9a5a', bajo: 'PD:2.4', cables: true },
      null,
      { pared: BLANCO, carp: '#1f9a5a', bajo: 'PD:3.6', cables: true },
    ] },
    // titerroy_227: Gaida, acera oeste, pasos 10,11,12 — hoja titerroy/titerroy_227.jpg — antes: #efe6c8 #efe6c8 #efe6c8
    { id: 'titerroy_227', a: [-941.7, -766.7], b: [-923.2, -788.3], anchos: [7.8, 9.9, 10.7], altos: [6.6, 6.6, 6.6], casas: [
      { pared: BLANCO, carp: '#2f6b4a', bajo: 'VR:1.3 VR:1 P', ventanaAlta: true, alto: 'VA', zoc: { t: 'granito', c: '#cbb8ab', h: 2.6 }, cables: true, contador: { x: 0.85 } },
      { pared: BLANCO, carp: '#2f8a5a', bajo: 'E:3.2 P VC', rejaEscaparate: '#2f8a5a', alto: 'VA B:2.5', barandilla: '#2f8a5a', cables: true, contador: { x: 0.45 } },
      { pared: '#d9ab93', carp: '#2f8a5a', bajo: 'V P V', alto: 'V V', zoc: { t: 'liso', c: '#a9abad', h: 1.0 }, num: 12, numX: 0.5, cables: true },
    ] },
    // titerroy_228: Gaida, acera este, pasos 15 — hoja titerroy/titerroy_228.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_228', a: [-896.5, -802.7], b: [-886.2, -814.7], anchos: [7.9, 7.9], altos: [4, 4], casas: [
      null,
      null,
    ] },
    // titerroy_229: de Vicente Guerra, acera sur, pasos 1 — hoja titerroy/titerroy_229.jpg — antes: #f1eee7/solar
    { id: 'titerroy_229', a: [-323.7, -588.9], b: [-307.8, -599.6], anchos: [19.1], altos: [0], casas: [
      null,
    ] },
    // titerroy_230: de Vicente Guerra, acera norte, pasos 2,3,4 — hoja titerroy/titerroy_230.jpg — antes: #f1eee7/solar #f1eee7/solar #e9c3a4
    { id: 'titerroy_230', a: [-306.0, -614.6], b: [-288.8, -626.1], anchos: [8.1, 14.4, 4.5], altos: [0, 0, 6.6], casas: [
      null,
      null,
      null,
    ] },
    // titerroy_231: Caracas, acera este, pasos 2 — hoja titerroy/titerroy_231.jpg — antes: #efe6c8
    { id: 'titerroy_231', a: [-846.7, -1632.0], b: [-839.6, -1622.3], anchos: [12], altos: [6.6], casas: [
      { pared: '#efe0b8', carp: BLANCA, bajo: 'P V:2 V:2 P', alto: 'VA VA', franja: { c: '#e8d6a8', y: 3.0, h: 0.2 }, num: 22, numX: 0.85, contador: { x: 0.55 } },
    ] },
    // titerroy_232: Caracas, acera oeste, pasos 3,4,5 — hoja titerroy/titerroy_232.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_232', a: [-860.7, -1616.6], b: [-841.2, -1590.0], anchos: [12.1, 13.2, 7.7], altos: [6.6, 6.6, 4], casas: [
      { pared: BLANCO, carp: '#1f6e4a', bajo: 'P:0.9 _ PD:3 P', zoc: { t: 'piedra', c: '#a6643f', junta: '#d8b49a', h: 2.7 }, num: 37, numX: 0.95, cables: true, contador: { x: 0.2 } },
      { pared: BLANCO, carp: '#6b3a22', bajo: 'VC P VC _ VC', zoc: { t: 'piedra', c: '#8a6a58', junta: '#cdb9a6', h: 1.4 }, cables: true, contador: { x: 0.6 } },
      { pared: BLANCO, carp: '#6b4a33', bajo: 'G:3', garajeVentanas: true, zoc: { t: 'piedra', c: '#c9b8a0', junta: '#e8dccb', h: 1.8 } },
    ] },
    // titerroy_233: Caracas, acera oeste, pasos 2 — hoja titerroy/titerroy_233.jpg — antes: #f1eee7
    { id: 'titerroy_233', a: [-861.0, -1616.4], b: [-856.4, -1610.0], anchos: [7.9], altos: [4], casas: [
      { pared: BLANCO, carp: '#5a2f20', bajo: 'PD:3.4 P', num: 39, numX: 0.75, cables: true, contador: { x: 0.6 } },
    ] },
    // titerroy_234: Caracas, acera este, pasos 3,4,5 — hoja titerroy/titerroy_234.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_234', a: [-846.2, -1630.8], b: [-819.9, -1595.0], anchos: [11.1, 11.1, 11.1, 11.1], altos: [4, 4, 4, 4], casas: [
      { pared: BLANCO, carp: '#6b3a22', bajo: 'PD:2.6 P VC:1.6', zoc: { t: 'piedra', c: '#b07a4a', junta: '#d9b48a', h: 2.6 }, num: 37, numX: 0.45, contador: { x: 0.35 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'V P', zoc: { t: 'granito', c: '#b5ada3', h: 1.1 }, contador: { x: 0.3 } },
      { pared: BLANCO, carp: '#8a5a32', bajo: 'PD:2.8 P VC:1.6', zoc: { t: 'liso', c: '#6d6d6b', h: 0.9 }, num: 26, numX: 0.5, cables: true, contador: { x: 0.03 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'M:3 P', persiana: '#eeeeec', marcoPersiana: '#3a3a3a', zoc: { t: 'piedra', c: '#34302d', h: 0.9 }, num: 24, numX: 0.75, cables: true, contador: { x: 0.65 } },
    ] },
    // titerroy_235: Tindaya, acera sur, pasos 3 — hoja titerroy/titerroy_235.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_235', a: [-524.1, -1190.4], b: [-536.4, -1181.3], anchos: [7.6, 7.6], altos: [6.6, 6.6], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: 'VA P VA:1.6', alto: 'VA VA', cables: true, contador: { x: 0.65 } },
      { pared: CREMA, carp: '#4a3226', bajo: 'PD:2.6', zoc: { t: 'granito', c: '#3a3838', h: 1.0 }, cables: true },
    ] },
    // titerroy_236: Tindaya, acera sur, pasos 5 — hoja titerroy/titerroy_236.jpg — antes: #f1eee7
    { id: 'titerroy_236', a: [-553.0, -1169.2], b: [-562.1, -1162.5], anchos: [11.3], altos: [4], casas: [
      { pared: BLANCO, carp: '#1f8a45', bajo: 'P V:1.8 P V PA V:1.6', zoc: { t: 'granito', c: '#a9abad', h: 1.2 }, num: 10, numX: 0.62, cables: true, contador: { x: 0.45 } },
    ] },
    // titerroy_237: Tindaya, acera norte, pasos 4,5 — hoja titerroy/titerroy_237.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_237', a: [-550.3, -1201.9], b: [-580.3, -1179.7], anchos: [9.2, 9.2, 9.5, 9.5], altos: [9.4, 9.4, 9.4, 9.4], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: 'P:1.4 V:1.5 V:1.2', alto: 'VA VA:2.5', cables: true, contador: { x: 0.2 } },
      { pared: BLANCO, carp: '#3a2e28', bajo: 'VC P', alto: 'B VA', barandilla: '#f4f4f2', cables: true },
      { pared: BLANCO, carp: '#3a2e28', bajo: 'V:1.6 P:1.2', alto: 'VA B', zoc: { t: 'liso', c: '#8e9093', h: 0.4 }, cables: true, contador: { x: 0.1 } },
      { pared: BLANCO, carp: '#3a2e28', bajo: 'VC VC', alto: 'VA VA', zoc: { t: 'liso', c: '#7d7f82', h: 0.4 }, cables: true },
    ] },
    // titerroy_238: Tindaya, acera sur, pasos 7 — hoja titerroy/titerroy_238.jpg — antes: #f1eee7
    { id: 'titerroy_238', a: [-580.5, -1148.9], b: [-570.2, -1156.5], anchos: [12.8], altos: [4], casas: [
      { pared: BLANCO, carp: '#c9ccc6', bajo: 'V PA PD:3', zoc: { t: 'liso', c: '#d9d9d6', h: 0.4 }, cables: true, contador: { x: 0.45 } },
    ] },
    // titerroy_239: del Fray Mendo de Viedma, acera norte, pasos 1 — hoja titerroy/titerroy_239.jpg — antes: #a9abad #a9abad
    { id: 'titerroy_239', a: [-842.2, -777.3], b: [-828.2, -787.6], anchos: [8.7, 8.7], altos: [4, 4], casas: [
      null,
      { pared: BLANCO, carp: BLANCA, bajo: 'VA VA:1.8 VA', zoc: { t: 'granito', c: '#8c7d78', h: 2.4 }, cables: true, contador: { x: 0.15 } },
    ] },
    // titerroy_240: del Fray Mendo de Viedma, acera sur, pasos 2,3,4,5,6,7,8,9 — hoja titerroy/titerroy_240.jpg — antes: #a9abad #e9b99c #e9b99c #e4cfc9 #e9b99c #e9b99c #efe6c8 #d9b996
    { id: 'titerroy_240', a: [-824.6, -779.3], b: [-771.7, -818.1], anchos: [8, 8, 8, 8, 8, 8, 8, 9.7], altos: [4, 4, 4, 4, 4, 4, 4, 4], casas: [
      { pared: BLANCO, carp: '#6b3a22', bajo: 'V V V:1.8', zoc: { t: 'granito', c: '#9aa3b0', h: 2.2 }, cables: true },
      { pared: BLANCO, carp: '#6b3a22', bajo: 'V:1.6 P', zoc: { t: 'granito', c: '#9aa3b0', h: 2.2 }, num: 6, numX: 0.6, cables: true },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'V P V', zoc: { t: 'granito', c: '#a8a09a', h: 2.6 }, num: 8, numX: 0.5, cables: true, contador: { x: 0.95 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'V P', zoc: { t: 'granito', c: '#8e9a95', h: 2.6 }, num: 10, numX: 0.6, cables: true, contador: { x: 0.9 } },
      { pared: BLANCO, carp: '#3e2418', bajo: 'V VC P VC', zoc: { t: 'granito', c: '#4a3d38', h: 2.6 }, num: 12, numX: 0.6, cables: true, contador: { x: 0.45 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'P V V', zoc: { t: 'granito', c: '#b8775a', h: 2.6 }, num: 14, numX: 0.9, cables: true, contador: { x: 0.2 } },
      { pared: BLANCO, carp: '#2b2422', bajo: 'PD:2.8 P V V', zoc: { t: 'granito', c: '#d2c0b3', h: 2.6 }, num: 16, numX: 0.4, cables: true, contador: { x: 0.25 } },
      { pared: BLANCO, carp: '#8b8f93', bajo: 'Es:2 Es:2 Es:2', zoc: { t: 'granito', c: '#3a3a38', h: 1.0 }, num: 20, numX: 0.6, cables: true, contador: { x: 0.05 } },
    ] },
    // titerroy_241: del Fray Mendo de Viedma, acera sur, pasos 1 — hoja titerroy/titerroy_241.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_241', a: [-836.1, -770.8], b: [-823.0, -780.5], anchos: [8.1, 8.1], altos: [4, 4], casas: [
      null,
      { pared: BLANCO, carp: BLANCA, bajo: 'V V', zoc: { t: 'liso', c: '#b9bcc0', h: 1.1 }, cables: true, contador: { x: 0.95 } },
    ] },
    // titerroy_242: del Fray Mendo de Viedma, acera norte, pasos 2,3,4,5,6,7,8,9 — hoja titerroy/titerroy_242.jpg — antes: #7fa3c7 #e4cfc9 #a9abad #a9abad #e9b99c #e4cfc9 #e4cfc9 #f1eee7
    { id: 'titerroy_242', a: [-829.8, -786.4], b: [-777.3, -824.9], anchos: [8, 8, 8, 8, 8, 8, 8, 9.1], altos: [4, 4, 4, 4, 4, 4, 4, 4], casas: [
      { pared: BLANCO, carp: '#4a2c1f', bajo: 'V:1.8 P:1.6', zoc: { t: 'liso', c: '#a3a5a7', h: 2.6 }, cables: true },
      { pared: BLANCO, carp: '#5a3322', bajo: 'V P V', zoc: { t: 'granito', c: '#c99c7c', h: 2.7 }, num: 2, numX: 0.55, contador: { x: 0.35 } },
      { pared: BLANCO, carp: '#2f7a5a', bajo: 'VC:1 VC:0.9', zoc: { t: 'liso', c: '#8e9093', h: 1.2 }, cables: true, contador: { x: 0.05 } },
      { pared: BLANCO, carp: '#3e2418', bajo: 'VC P VC V:1.6', zoc: { t: 'granito', c: '#d6ccc0', h: 2.4 }, cables: true, contador: { x: 0.05 } },
      { pared: BLANCO, carp: '#3e2a22', bajo: 'VC VC P', zoc: { t: 'piedra', c: '#b87a6a', junta: '#e0c3b8', h: 2.4 }, num: 13, numX: 0.95, cables: true, contador: { x: 0.6 } },
      { pared: BLANCO, carp: '#3a2420', bajo: 'V:1.8 V:1.4', zoc: { t: 'piedra', c: '#c48a7a', junta: '#e8cfc6', h: 2.6 }, contador: { x: 0.92 } },
      { pared: BLANCO, carp: '#4a2c24', bajo: 'V:1.6 P', zoc: { t: 'granito', c: '#e5d4b8', h: 2.4 }, contador: { x: 0.1 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'V:2.2', zoc: { t: 'piedra', c: '#8a6a5a', junta: '#c8b2a3', h: 2.6 }, cables: true },
    ] },
    // titerroy_243: de Francisco Acosta Espinosa, acera norte, pasos 1 — hoja titerroy/titerroy_243.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_243', a: [-825.2, -756.0], b: [-811.5, -766.1], anchos: [8.5, 8.5], altos: [4, 4], casas: [
      null,
      { pared: BLANCO, carp: '#6b4a33', bajo: 'V:2.2 V:1.8', zoc: { t: 'piedra', c: '#b8a68a', junta: '#e6dccb', h: 2.3 }, cables: true },
    ] },
    // titerroy_244: de Francisco Acosta Espinosa, acera sur, pasos 2,3,4,5,6,7 — hoja titerroy/titerroy_244.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_244', a: [-802.0, -760.7], b: [-755.5, -794.8], anchos: [8.8, 8, 8, 12, 12, 8.8], altos: [4, 4, 4, 4, 4, 4], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: 'V P VA VA', zoc: { t: 'granito', c: '#2b2a33', h: 2.3 }, num: 8, numX: 0.3, cables: true, contador: { x: 0.4 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'V:2', zoc: { t: 'liso', c: '#b8b8b6', h: 0.6 }, cables: true },
      { pared: BLANCO, carp: BLANCA, bajo: 'V V P VC', zoc: { t: 'liso', c: '#5f6266', h: 1.0 }, num: 10, numX: 0.65, cables: true, contador: { x: 0.45 } },
      { pared: BLANCO, carp: '#1f7a45', bajo: 'VC:1 VC:1 VC:1', zoc: { t: 'liso', c: '#5f6266', h: 1.0 }, cables: true },
      { pared: BLANCO, carp: '#4a2c1f', bajo: 'V V', zoc: { t: 'granito', c: '#cbb79e', h: 2.2 }, cables: true, contador: { x: 0.95 } },
      { pared: BLANCO, carp: '#3a2420', bajo: 'V V VC P', zoc: { t: 'liso', c: '#2a2828', h: 0.9 }, num: 18, numX: 0.5, cables: true, contador: { x: 0.55 } },
    ] },
    // titerroy_245: de Francisco Acosta Espinosa, acera sur, pasos 1 — hoja titerroy/titerroy_245.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_245', a: [-818.7, -748.4], b: [-805.5, -758.0], anchos: [8.2, 8.2], altos: [4, 4], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: '_ P', zoc: { t: 'piedra', c: '#4a4a4a', h: 0.9 }, cables: true },
      { pared: BLANCO, carp: BLANCA, bajo: 'Es:2.4 P:1.3', marcoEscaparate: '#f4f4f2', zoc: { t: 'piedra', c: '#4a4a4a', h: 0.9 }, cables: true, contador: { x: 0.05 } },
    ] },
  ],
};
