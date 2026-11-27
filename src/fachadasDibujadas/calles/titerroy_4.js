/**
 * Fachadas dibujadas: titerroy, tanda 4 (50 tramos de
 * src/barrios/compartido/fachadasCasa.js). Cada casa se describe mirando la hoja de fotos de su tramo
 * (carpeta _trabajo_fachadas); null = no se dibuja. Método: skill lava-game-fachadas.
 */

export default {
  nombre: 'titerroy 4',
  aceras: [
    // titerroy_299: del Castillo de las Coloradas, acera este, pasos 1 — hoja titerroy/titerroy_299.jpg — antes: #e2c079/tienda #e2c079/tienda
    { id: 'titerroy_299', a: [-615.8, -205.5], b: [-607.4, -223.1], anchos: [9.7, 9.7], altos: [6.6, 6.6], casas: [
      { pared: '#e8dcc0', carp: '#8b8f93', bajo: 'E Es:1.4 E', rejaEscaparate: '#a9abad', toldo: '#f2c200', zoc: { t: 'liso', c: '#4f6b63', h: 0.6 }, franja: { c: '#4f6b63', y: 2.9, h: 0.6 }, marcoEscaparate: '#8b8f93', cables: true },
      { pared: '#e8dcc0', carp: '#6d6f70', bajo: 'Es:3 Es:2.4', toldo: '#f2c200', zoc: { t: 'liso', c: '#4f6b63', h: 0.6 }, franja: { c: '#4f6b63', y: 2.9, h: 0.6 }, marcoEscaparate: '#5f6a66', esq: { c: '#4f6b63', lados: [0] } },
    ] },
    // titerroy_300: del Castillo de las Coloradas, acera oeste, pasos 2 — hoja titerroy/titerroy_300.jpg — antes: #f1eee7/tienda
    { id: 'titerroy_300', a: [-605.2, -252.1], b: [-610.4, -241.3], anchos: [12], altos: [6.6], casas: [
      { pared: '#9fa3a6', carp: '#8b8f93', bajo: '_:0.4 Es:2.2 Es:1.6 _:7', alto: '_', corn: { c: '#3aa64a' }, marcoEscaparate: '#8b8f93', num: 3, numX: 0.22 },
    ] },
    // titerroy_301: del Castillo de las Coloradas, acera este, pasos 3 — hoja titerroy/titerroy_301.jpg — antes: #f1eee7/solar
    { id: 'titerroy_301', a: [-601.8, -234.7], b: [-597.0, -244.7], anchos: [11], altos: [0], casas: [
      null,
    ] },
    // titerroy_302: del Castillo de las Coloradas, acera este, pasos 7,8 — hoja titerroy/titerroy_302.jpg — antes: #b9b2a4 #b9b2a4 #e6d3b8 #e6d3b8
    { id: 'titerroy_302', a: [-578.0, -283.5], b: [-558.6, -309.5], anchos: [9.2, 9.2, 7, 7], altos: [6.6, 6.6, 4, 4], casas: [
      { pared: '#a8a39a', carp: '#f4f4f2', bajo: 'VR:3.2 _', reja: '#f4f4f2' },
      null,
      null,
      { pared: '#f3f1ea', carp: '#a0743f', bajo: 'VA P VA', zoc: { t: 'liso', c: '#c9a66b', h: 1.0 }, franja: { c: '#9a7a52', y: 3.0, h: 0.2 }, corn: { c: '#9a7a52' }, esq: { c: '#9a7a52', lados: [0, 1] }, cables: true, contador: { x: 0.55 } },
    ] },
    // titerroy_303: Juan Luzardo, acera norte, pasos 3,4,5 — hoja titerroy/titerroy_303.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_303', a: [-1109.0, -434.8], b: [-1069.8, -401.5], anchos: [9.2, 9.2, 9.3, 9.3, 7.2, 7.2], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#3b2418', bajo: 'VR _ VR', alto: 'B VC' },
      { pared: '#f3f1ea', carp: '#3b2418', bajo: 'VR VR:2.4 VR', alto: 'VR:2.6', reja: '#3b2418' },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'VR VR', alto: 'B:2.4 VA' },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VR _ VR', alto: 'VC' },
      { pared: '#f3f1ea', carp: '#3b2418', bajo: 'VR Es:2.4', alto: 'B B', barandilla: '#3b2418' },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VR Es:2.2', alto: 'VC VR', reja: '#3b2418' },
    ] },
    // titerroy_304: Maracaibo, acera este, pasos 2,3,4,5,6,7,8,9 — hoja titerroy/titerroy_304.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_304', a: [-801.9, -1622.0], b: [-806.5, -1628.8], anchos: [4.5, 8, 8.1, 8, 7.8, 8.1, 8.3, 4.5], altos: [4, 4, 4, 6.6, 4, 6.6, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA:2.4', num: 8, numX: 0.2, contador: { x: 0.55 } },
      { pared: '#f3f1ea', carp: '#232323', bajo: 'VC:2.4 VC:2.4', contador: { x: 0.5 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VA VC P M:2.2', persiana: '#2f7a4a', zoc: { t: 'piedra', c: '#5a5856', junta: '#d8d8d8', h: 2.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#a87a4a', bajo: 'P:1.2 VA:3.5', alto: 'VA', franja: { c: '#9a948c', y: 3.0, h: 0.25 }, num: 14, numX: 0.3, contador: { x: 0.4 }, cables: true },
      { pared: '#f3f1ea', carp: '#4a3326', bajo: 'G P V', zoc: { t: 'granito', c: '#77797a', h: 1.1 }, cables: true },
      { pared: '#f3f1ea', carp: '#5a4636', bajo: 'V P V', zoc: { t: 'granito', c: '#6f6f6d', h: 1.4 }, esq: { c: '#9a9a98', t: 'sillares', lados: [1] }, contador: { x: 0.5 }, cables: true },
      { pared: '#bdbab5', carp: '#1f7a45', bajo: 'V:2 P', zoc: { t: 'granito', c: '#a7a5a2', h: 2.6 }, num: 20, numX: 0.75 },
      { pared: '#f3f1ea', carp: '#222222', bajo: 'VR P G:2', num: 22, numX: 0.55, reja: '#222222' },
    ] },
    // titerroy_305: Maracaibo, acera este, pasos 1 — hoja titerroy/titerroy_305.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_305', a: [-776.0, -1583.9], b: [-787.2, -1600.4], anchos: [10, 10], altos: [4, 4], casas: [
      { pared: '#e9e9e6', carp: '#2f5a3e', bajo: '_:3 P _:2' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V', zoc: { t: 'granito', c: '#b5a28c', h: 2.8 }, contador: { x: 0.85 } },
    ] },
    // titerroy_306: Tenique, acera este, pasos 1,2,3,4,5,6,7,8 — hoja titerroy/titerroy_306.jpg — antes: #efe6c8 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #e6d3b8 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_306', a: [-681.9, -1186.7], b: [-645.1, -1135.5], anchos: [4.5, 8.6, 8.6, 11.9, 12, 8.1, 8.3, 6.4, 4.5], altos: [6.6, 4, 4, 6.6, 4, 4, 6.6, 4, 4], casas: [
      { pared: '#ece6d6', carp: '#f4f4f2', bajo: 'VR P', alto: 'VA', zoc: { t: 'granito', c: '#d8cdbf', h: 0.8 }, cables: true, contador: { x: 0.5 } },
      { pared: '#f3f1ea', carp: '#6b3a24', bajo: 'VC:2.4 P VC:2.2', zoc: { t: 'piedra', c: '#a87a4c', junta: '#c9a37a', h: 2.0 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P M:3 P', persiana: '#9a9c9e', marcoPersiana: '#8b8f93', num: 14, numX: 0.92, cables: true },
      { pared: '#e9e3d3', carp: '#2f8a5f', bajo: 'G:3 V P PD:2', zoc: { t: 'granito', c: '#e2dccd', h: 1.0 }, cables: true, contador: { x: 0.45 } },
      { pared: '#b8aca2', carp: '#4a2c1f', bajo: 'V:2 _ V:2', zoc: { t: 'granito', c: '#c4b1a6', h: 2.4 }, cables: true, contador: { x: 0.6 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'P G:2.4 VC:2.6', cables: true, contador: { x: 0.8 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'VC:2.2 P V:2', zoc: { t: 'granito', c: '#7d7f82', h: 1.0 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P G', zoc: { t: 'liso', c: '#7a5446', h: 0.9 }, num: 4, numX: 0.25, cables: true },
      null,
    ] },
    // titerroy_307: Tenique, acera oeste, pasos 1,2,3,4,5,6,7,8 — hoja titerroy/titerroy_307.jpg — antes: #f1eee7 #d9b996 #d9b996 #a9abad #a9abad #a9abad #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_307', a: [-686.9, -1178.8], b: [-652.2, -1130.6], anchos: [4.5, 8.6, 8.6, 11.9, 12, 8.1, 8.3, 6.4, 4.5], altos: [6.6, 4, 4, 4, 6.6, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA P', alto: 'VR', contador: { x: 0.75 } },
      { pared: '#d4a596', carp: '#1f7a45', bajo: 'G:3.5', garajeVentanas: true, zoc: { t: 'granito', c: '#2f2c2e', h: 1.0 }, esq: { c: '#2f2c2e', lados: [0, 1] }, cables: true },
      { pared: '#35323a', carp: '#f4f4f2', bajo: 'G:3.5 P', cables: true },
      { pared: '#6a6c70', carp: '#f4f4f2', bajo: 'G:3.5' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA P VA:1.6', zoc: { t: 'granito', c: '#8e8a88', h: 2.6 }, num: 7, numX: 0.45, contador: { x: 0.6 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P VC', zoc: { t: 'liso', c: '#3a3a3c', h: 1.0 }, cables: true, contador: { x: 0.8 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G:3.4 P', contador: { x: 0.7 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G _ T:1.4', cables: true },
      null,
    ] },
    // titerroy_308: Tingafa, acera oeste, pasos 3 — hoja titerroy/titerroy_308.jpg — antes: #f1eee7
    { id: 'titerroy_308', a: [-593.4, -861.3], b: [-600.7, -870.8], anchos: [12], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#1f6e55', bajo: 'VC:2.4 P', cables: true },
    ] },
    // titerroy_309: Tingafa, acera oeste, pasos 2 — hoja titerroy/titerroy_309.jpg — antes: #efe6c8 #efe6c8
    { id: 'titerroy_309', a: [-603.3, -874.4], b: [-594.3, -862.6], anchos: [7.4, 7.4], altos: [6.6, 6.6], casas: [
      null,
      null,
    ] },
    // titerroy_310: de Juan Brito, acera sur, pasos 2,3,4,5 — hoja titerroy/titerroy_310.jpg — antes: #f1eee7/tienda #f1eee7/tienda #f1eee7/tienda #f1eee7/tienda #f1eee7/tienda
    { id: 'titerroy_310', a: [-646.9, -314.7], b: [-693.2, -314.0], anchos: [7.1, 7.1, 11.8, 9.7, 10.6], altos: [6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA E:3', rejaEscaparate: '#e9e9e6', alto: 'VA VA VA', zoc: { t: 'liso', c: '#c9c9c6', h: 0.4 }, marcoEscaparate: '#f4f4f2' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'E:3 E:3', rejaEscaparate: '#e9e9e6', alto: 'VA VA VA', zoc: { t: 'liso', c: '#c9c9c6', h: 0.4 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'E:2.4 E:3.4 P', rejaEscaparate: '#e9e9e6', alto: 'VA VA VA VA', zoc: { t: 'liso', c: '#c9c9c6', h: 0.4 }, barandilla: '#d9d9d6' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'Es:1.8 P:0.9 G:3.2 P', alto: 'VA VA', marcoEscaparate: '#f4f4f2' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P VR:2.6 _ VR:1.6', alto: 'VR:2 _ VR:2', reja: '#8b8f93', cables: true, contador: { x: 0.55 } },
    ] },
    // titerroy_311: Doctor Juan Negrìn, acera sur, pasos 2 — hoja titerroy/titerroy_311.jpg — antes: #f1eee7/tienda
    { id: 'titerroy_311', a: [-218.4, 48.4], b: [-228.7, 39.3], anchos: [13.7], altos: [6.6], casas: [
      { pared: '#e4e2dc', carp: '#8b8f93', bajo: 'Es:2.4 M:2.4 P E:2.4 Es:1.2 E:2.4', alto: 'VA B VA', persiana: '#6b5a4a', rejaEscaparate: '#8b8f93', marcoPersiana: '#5a4a3c', marcoEscaparate: '#d9d9d6', barandilla: '#f3f1ea', cables: true },
    ] },
    // titerroy_312: Doctor Juan Negrìn, acera norte, pasos 6 — hoja titerroy/titerroy_312.jpg — antes: #e6d3b8/tienda
    { id: 'titerroy_312', a: [-251.0, -10.4], b: [-243.2, -3.8], anchos: [10.3], altos: [9.4], casas: [
      null,
    ] },
    // titerroy_313: Doctor Juan Negrìn, acera sur, pasos 7,8,9,10,11 — hoja titerroy/titerroy_313.jpg — antes: #e6d3b8/tienda #e6d3b8/tienda #e6d3b8/tienda #f1eee7 #f1eee7 #efe6c8
    { id: 'titerroy_313', a: [-253.0, 6.4], b: [-304.7, -37.4], anchos: [13.1, 8.6, 8.6, 11.9, 12.2, 13.3], altos: [9.4, 9.4, 9.4, 4, 4, 4], casas: [
      { pared: '#efe3c4', carp: '#8b8f93', bajo: 'Es:2 _ Es:2.4', zoc: { t: 'granito', c: '#9c7f5c', h: 3.0 }, esq: { c: '#b88f7f', lados: [0] }, marcoEscaparate: '#b88f7f' },
      null,
      { pared: '#efe3c4', carp: '#8b8f93', bajo: 'Es:2 _ _', zoc: { t: 'granito', c: '#9c6b6b', h: 3.0 }, marcoEscaparate: '#b88f7f', contador: { x: 0.6 } },
      { pared: '#e8e2d6', carp: '#a39a90', bajo: 'T _ T', zoc: { t: 'piedra', c: '#3c3835', h: 0.8 }, corn: { c: '#d9b56a' } },
      { pared: '#f3f1ea', carp: '#2a55a8', bajo: 'VR P:1.3 P:1.3', reja: '#f4f4f2', zoc: { t: 'granito', c: '#a9a6a0', h: 1.0 }, corn: { c: '#2a55a8' }, esq: { c: '#2a55a8', lados: [1] }, num: 7, numX: 0.75, contador: { x: 0.5 } },
      { pared: '#d8b76c', carp: '#a39a90', bajo: 'T:1.2 T:1.2 T:1.2', zoc: { t: 'liso', c: '#e9e6df', h: 2.7 }, cables: true },
    ] },
    // titerroy_314: Doctor Juan Negrìn, acera norte, pasos 12,13 — hoja titerroy/titerroy_314.jpg — antes: #f1eee7/tienda #f1eee7/tienda
    { id: 'titerroy_314', a: [-300.0, -46.2], b: [-317.6, -61.1], anchos: [11.5, 11.5], altos: [9.4, 9.4], casas: [
      { pared: '#e6d3b8', carp: '#5a3a2e', bajo: 'PD:2.2 P', alto: 'VR VR', zoc: { t: 'granito', c: '#9c6b6b', h: 3.0 }, franja: { c: '#d8c4a6', y: 3.1, h: 0.3 }, reja: '#5a3a2e', num: 28, numX: 0.6, cables: true },
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'Es:2.4 P', zoc: { t: 'granito', c: '#3f6a5c', h: 3.0 }, marcoEscaparate: '#f4f4f2', num: 2, numX: 0.75 },
    ] },
    // titerroy_315: Doctor Juan Negrìn, acera sur, pasos 14 — hoja titerroy/titerroy_315.jpg — antes: #f1eee7/tienda
    { id: 'titerroy_315', a: [-328.6, -42.0], b: [-334.3, -46.8], anchos: [7.3], altos: [9.4], casas: [
      { pared: '#d9d6cf', carp: '#f4f4f2', bajo: 'P Es:1.4 Es:3', zoc: { t: 'granito', c: '#2f2d2e', h: 3.2 }, marcoEscaparate: '#f4f4f2' },
    ] },
    // titerroy_316: Doctor Juan Negrìn, acera sur, pasos 16,17,18 — hoja titerroy/titerroy_316.jpg — antes: #e4cfc9 #efe6c8 #f1eee7/tienda #f1eee7
    { id: 'titerroy_316', a: [-348.9, -74.8], b: [-381.3, -102.4], anchos: [6.8, 11.2, 11.2, 13.4], altos: [4, 4, 6.6, 4], casas: [
      { pared: '#e4cfc9', carp: '#3f8f86', bajo: 'T _ T', zoc: { t: 'piedra', c: '#5a5048', h: 1.2 }, cables: true },
      { pared: '#ece8de', carp: '#2f8a6f', bajo: 'T:1.4 P T:2', zoc: { t: 'liso', c: '#a08a7a', h: 0.9 }, cables: true },
      { pared: '#dba15e', carp: '#f4f4f2', bajo: 'Es:3.5 Es:2', alto: 'VR:2.4', marcoEscaparate: '#f4f4f2', cables: true },
      { pared: '#eae4dc', carp: '#8a2a2a', bajo: 'PA P VC:1.4 _ M:3.5', persiana: '#e4e4e0', zoc: { t: 'granito', c: '#c9b5ac', h: 1.7 }, marcoPersiana: '#d9d9d6', contador: { x: 0.3 } },
    ] },
    // titerroy_317: Doctor Juan Negrìn, acera sur, pasos 19 — hoja titerroy/titerroy_317.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_317', a: [-389.4, -107.2], b: [-401.3, -117.5], anchos: [7.9, 7.9], altos: [4, 4], casas: [
      { pared: '#ece9e2', carp: '#e9e9e6', bajo: 'M:3 _', persiana: '#e4e4e0', zoc: { t: 'piedra', c: '#4a4440', h: 0.7 }, marcoPersiana: '#d9d9d6', cables: true },
      { pared: '#f3f1ea', carp: '#2f9a4f', bajo: 'PD:1.6', zoc: { t: 'piedra', c: '#34302d', h: 1.0 }, esq: { c: '#9fa1a3', lados: [1] }, corn: { c: '#e9e7e0' } },
    ] },
    // titerroy_318: Doctor Juan Negrìn, acera sur, pasos 20,21,22 — hoja titerroy/titerroy_318.jpg — antes: #f1eee7/tienda #f1eee7 #f1eee7 #f1eee7 #f1eee7/tienda #f1eee7/tienda #f1eee7/tienda
    { id: 'titerroy_318', a: [-401.2, -117.5], b: [-453.0, -161.2], anchos: [10.3, 9, 9, 9, 10.2, 10.2, 10.2], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#3b2a22', bajo: 'E:3 P', rejaEscaparate: '#e9e9e6', persiana: '#a9abad', alto: 'B VA', zoc: { t: 'piedra', c: '#d29a5a', junta: '#e8c79a', h: 1.3 }, marcoPersiana: '#8b8f93', cables: true, contador: { x: 0.9 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'E:2.4 _ PA', rejaEscaparate: '#e9e9e6', zoc: { t: 'piedra', c: '#d29a5a', junta: '#e8c79a', h: 1.3 }, esq: { c: '#9c6b6b', lados: [1] }, contador: { x: 0.45 } },
      null,
      null,
      null,
      { pared: '#e8e2dc', carp: '#f4f4f2', bajo: 'Es:2 Es:1.6 Es:2', zoc: { t: 'granito', c: '#9c6b6b', h: 0.6 }, esq: { c: '#9c6b6b', lados: [0, 1] }, marcoEscaparate: '#f4f4f2' },
      null,
    ] },
    // titerroy_319: Doctor Juan Negrìn, acera norte, pasos 1,2,3,4 — hoja titerroy/titerroy_319.jpg — antes: #f1eee7/tienda #f1eee7/tienda #f1eee7/tienda #e9c3a4 #e9c3a4 #e9c3a4/tienda #e9c3a4/tienda #f1eee7/solar
    { id: 'titerroy_319', a: [-184.2, 52.1], b: [-229.9, 12.3], anchos: [8.2, 8.2, 8.2, 9.7, 9.7, 7.5, 7.5, 4.5], altos: [6.6, 6.6, 6.6, 9.4, 9.4, 9.4, 9.4, 0], casas: [
      null,
      { pared: '#eeeeec', carp: '#2a55a8', bajo: 'Es:1.6 Es:3', zoc: { t: 'granito', c: '#a9abad', h: 2.8 }, franja: { c: '#3a5fb0', y: 1.0, h: 0.08 }, marcoEscaparate: '#2a55a8' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P Es:2', alto: 'B', zoc: { t: 'granito', c: '#2f2d2e', h: 3.0 }, num: 8, numX: 0.15, barandilla: '#f3f1ea', cables: true },
      null,
      { pared: '#c7a899', carp: '#3b2a22', bajo: 'V:1.2 V:1.6 Es:3.5', alto: 'VA:3 VA:3', zoc: { t: 'granito', c: '#b08a7c', h: 3.2 }, marcoEscaparate: '#a8857a' },
      null,
      { pared: '#c7a899', carp: '#6d6f70', bajo: 'Es:5', alto: 'VA:5', zoc: { t: 'granito', c: '#b08a7c', h: 3.2 }, marcoEscaparate: '#a8857a' },
      null,
    ] },
    // titerroy_320: Doctor Juan Negrìn, acera norte, pasos 8,9,10,11 — hoja titerroy/titerroy_320.jpg — antes: #f1eee7/tienda #f1eee7 #9d9890 #efe6c8
    { id: 'titerroy_320', a: [-266.8, -18.3], b: [-297.2, -44.1], anchos: [4.5, 11.9, 12.2, 11.9], altos: [6.6, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#8b8f93', bajo: 'Es:3 Es:2', zoc: { t: 'liso', c: '#7f8285', h: 0.5 }, marcoEscaparate: '#8b8f93', cables: true },
      { pared: '#e9e8e4', carp: '#3f8a86', bajo: 'PD:1.8 P:1.1', zoc: { t: 'liso', c: '#b9b9b6', h: 0.9 }, esq: { c: '#b9b9b6', lados: [1] }, num: 20, numX: 0.1, cables: true },
      null,
      { pared: '#d8d4c8', carp: '#3f8a86', bajo: 'P VR:0.8 P', corn: { c: '#e9e7e0' }, contador: { x: 0.1 }, cables: true },
    ] },
    // titerroy_321: Doctor Juan Negrìn, acera sur, pasos 12,13 — hoja titerroy/titerroy_321.jpg — antes: #d9b996/tienda #d9b996
    { id: 'titerroy_321', a: [-306.3, -38.8], b: [-323.4, -53.3], anchos: [11.5, 10.9], altos: [9.4, 9.4], casas: [
      { pared: '#e8e6e0', carp: '#f4f4f2', bajo: 'Es:3 Es:1.6 P', zoc: { t: 'granito', c: '#5d5b58', h: 3.2 }, marcoEscaparate: '#f4f4f2', cables: true },
      { pared: '#efe9da', carp: '#f4f4f2', bajo: 'P Es:1.4 Es:3 Es:2', alto: 'B B', zoc: { t: 'granito', c: '#2f2d2e', h: 3.2 }, marcoEscaparate: '#f4f4f2', barandilla: '#f4f4f2', num: 15, numX: 0.08, cables: true },
    ] },
    // titerroy_322: Doctor Juan Negrìn, acera norte, pasos 14 — hoja titerroy/titerroy_322.jpg — antes: #a9abad/tienda #a9abad/tienda
    { id: 'titerroy_322', a: [-314.7, -58.5], b: [-328.2, -70.0], anchos: [8.9, 8.9], altos: [6.6, 6.6], casas: [
      { pared: '#e6e3da', carp: '#f4f4f2', bajo: 'P:1.6 _', zoc: { t: 'granito', c: '#4d6b62', h: 3.2 }, contador: { x: 0.05 } },
      { pared: '#e9e7e2', carp: '#f4f4f2', bajo: 'Es:2.4 P', zoc: { t: 'granito', c: '#4d6b62', h: 3.0 }, marcoEscaparate: '#f4f4f2' },
    ] },
    // titerroy_323: Doctor Juan Negrìn, acera norte, pasos 16 — hoja titerroy/titerroy_323.jpg — antes: #a9abad/tienda
    { id: 'titerroy_323', a: [-335.4, -76.7], b: [-344.5, -84.5], anchos: [12], altos: [6.6], casas: [
      { pared: '#e9e7e2', carp: '#f4f4f2', bajo: 'PD:2.6 _ Es:3', alto: 'VR', zoc: { t: 'granito', c: '#3a3b3e', h: 3.2 }, toldo: '#3b6fa8', reja: '#f4f4f2', marcoEscaparate: '#f4f4f2', contador: { x: 0.45 } },
    ] },
    // titerroy_324: Doctor Juan Negrìn, acera norte, pasos 17,18,19,20 — hoja titerroy/titerroy_324.jpg — antes: #d9b996/tienda #d9b996/tienda #e6d3b8 #e6d3b8 #a9abad #a9abad #efe6c8/tienda
    { id: 'titerroy_324', a: [-353.4, -91.6], b: [-393.8, -125.8], anchos: [7.5, 7.5, 9.2, 9.2, 7.7, 7.7, 4.5], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#efe3c4', carp: '#4a2c1f', bajo: 'PA:2 PA', zoc: { t: 'piedra', c: '#b5714a', junta: '#e0c4a8', h: 3.0 }, corn: { c: '#f3f1ea' }, cables: true },
      null,
      null,
      { pared: '#e6d3b8', carp: '#2b2b2b', bajo: 'VR:1.6 VR:1.8 P', zoc: { t: 'granito', c: '#b89a8c', h: 3.2 }, reja: '#f4f4f2', num: 42, numX: 0.85, contador: { x: 0.75 } },
      { pared: '#f3f1ea', carp: '#3a3a3a', bajo: 'M:4 P:1.2', persiana: '#e4e4e0', zoc: { t: 'granito', c: '#5f7f74', h: 3.2 }, franja: { c: '#d9a640', y: 3.3, h: 0.25 }, marcoPersiana: '#c9c9c6', num: 44, numX: 0.85, contador: { x: 0.6 } },
      null,
      { pared: '#efe3d2', carp: '#4a2c1f', bajo: 'Es:1.4 Es:1.6', alto: 'B VA', franja: { c: '#8a6a5a', y: 2.6, h: 0.15 }, barandilla: '#2a2a2a', marcoEscaparate: '#4a2c1f', cables: true },
    ] },
    // titerroy_325: Avenida de Eugenio Rijo Rocha, acera oeste, pasos 1,2 — hoja titerroy/titerroy_325.jpg — antes: #efe6c8/tienda #efe6c8/tienda #efe6c8/tienda #f1eee7
    { id: 'titerroy_325', a: [-635.3, -628.1], b: [-658.2, -656.7], anchos: [8.2, 8.2, 8.2, 11.9], altos: [6.6, 6.6, 6.6, 4], casas: [
      null,
      { pared: '#e8d39a', carp: '#4a2c1f', bajo: 'M:2.2 M:2.4 P', persiana: '#b8b8b8', alto: 'VA:2 VA:2 VR', toldo: '#d9642a', marcoPersiana: '#b8b8b8', contador: { x: 0.85 } },
      { pared: '#f3f1ea', carp: '#3f8a86', bajo: 'G VC', alto: 'V VA', cables: true },
      { pared: '#f0eeea', carp: '#3f8a86', bajo: 'VC:1.6 VC:1.6', cables: true },
    ] },
    // titerroy_326: Avenida de Eugenio Rijo Rocha, acera oeste, pasos 3 — hoja titerroy/titerroy_326.jpg — antes: #f1eee7
    { id: 'titerroy_326', a: [-666.9, -672.5], b: [-670.8, -677.7], anchos: [6.5], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: '_ _ V', zoc: { t: 'liso', c: '#8e9093', h: 0.9 }, cables: true },
    ] },
    // titerroy_327: Avenida de Eugenio Rijo Rocha, acera este, pasos 4 — hoja titerroy/titerroy_327.jpg — antes: #e6d3b8/tienda
    { id: 'titerroy_327', a: [-668.3, -705.3], b: [-661.1, -695.7], anchos: [12], altos: [6.6], casas: [
      { pared: '#efe6cf', carp: '#3a3a3a', bajo: 'Es:2.6 E:1.4 _ M:3', rejaEscaparate: '#2a55a8', persiana: '#7f8285', alto: 'V V V', toldo: '#3b4a6b', marcoEscaparate: '#2a55a8', marcoPersiana: '#8b8f93', contador: { x: 0.62 }, cables: true },
    ] },
    // titerroy_328: Avenida de Eugenio Rijo Rocha, acera este, pasos 1,2 — hoja titerroy/titerroy_328.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_328', a: [-620.2, -640.0], b: [-643.0, -668.4], anchos: [8.3, 8.3, 8.3, 11.5], altos: [4, 4, 4, 4], casas: [
      null,
      { pared: '#cdbca3', carp: '#7a7a52', bajo: 'PD:2' },
      { pared: '#f3f1ea', carp: '#5a3a4a', bajo: 'PD:2.2 VR:1.6', zoc: { t: 'piedra', c: '#c0653a', junta: '#d9845a', h: 2.2 }, franja: { c: '#7a4a3a', y: 2.2, h: 0.12 }, reja: '#2a2a2a', cables: true },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: '_', zoc: { t: 'piedra', c: '#c0653a', junta: '#d9845a', h: 2.2 }, franja: { c: '#7a4a3a', y: 2.2, h: 0.12 } },
    ] },
    // titerroy_329: Avenida de Eugenio Rijo Rocha, acera oeste, pasos 4 — hoja titerroy/titerroy_329.jpg — antes: #efe6c8/tienda #efe6c8/tienda
    { id: 'titerroy_329', a: [-688.6, -701.8], b: [-675.8, -684.7], anchos: [10.7, 10.7], altos: [6.6, 6.6], casas: [
      null,
      { pared: '#dcc4a8', carp: '#4a4a48', bajo: 'Es:2 VA Es:1.8 P', alto: 'VA VA', zoc: { t: 'granito', c: '#b8a48e', h: 3.0 }, marcoEscaparate: '#4a4a48', contador: { x: 0.85 } },
    ] },
    // titerroy_330: Paraná, acera norte, pasos 1 — hoja titerroy/titerroy_330.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_330', a: [-880.1, -1223.4], b: [-855.7, -1241.1], anchos: [10.1, 10.1, 10.1], altos: [4, 4, 4], casas: [
      null,
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V:1.6 _ PD:2.4', zoc: { t: 'piedra', c: '#6f6a66', junta: '#b5aea8', h: 1.0 }, cables: true, contador: { x: 0.97 } },
      null,
    ] },
    // titerroy_331: Paraná, acera norte, pasos 2 — hoja titerroy/titerroy_331.jpg — antes: #f1eee7
    { id: 'titerroy_331', a: [-855.8, -1241.3], b: [-862.7, -1236.2], anchos: [8.5], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#3b2a22', bajo: 'P V:1.8', alto: 'VA B', zoc: { t: 'piedra', c: '#4a4744', h: 1.4 }, barandilla: '#4a2c1f', contador: { x: 0.35 }, cables: true },
    ] },
    // titerroy_332: de Zaragoza, acera oeste, pasos 3,4,5,6 — hoja titerroy/titerroy_332.jpg — antes: #f1eee7/solar #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_332', a: [-655.4, -115.7], b: [-671.4, -146.3], anchos: [9.8, 9.6, 7.4, 7.7], altos: [0, 4, 4, 6.6], casas: [
      null,
      { pared: '#f3f1ea', carp: '#6b3f22', bajo: 'G P _ P', zoc: { t: 'bloque', c: '#8e9093', h: 1.2 }, corn: { c: '#f3f1ea' } },
      { pared: '#f3f1ea', carp: '#222222', bajo: 'PD:2.6', zoc: { t: 'piedra', c: '#4a4038', h: 0.8 }, num: 13, numX: 0.3 },
      { pared: '#f3f1ea', bajo: '_', alto: '_', zoc: { t: 'piedra', c: '#5a4d42', junta: '#8a7a6a', h: 1.6 }, contador: { x: 0.4 } },
    ] },
    // titerroy_333: de Zaragoza, acera este, pasos 1 — hoja titerroy/titerroy_333.jpg — antes: #a9abad
    { id: 'titerroy_333', a: [-633.7, -94.5], b: [-637.6, -101.8], anchos: [8.3], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#1e4a35', bajo: 'VC:2.6 P', zoc: { t: 'liso', c: '#a49ea0', h: 3.0 }, franja: { c: '#5a5a5a', y: 3.0, h: 0.1 }, num: 6, numX: 0.7 },
    ] },
    // titerroy_334: de Zaragoza, acera este, pasos 2,3,4,5,6,7 — hoja titerroy/titerroy_334.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #efe6c8 #efe6c8/tienda #f1eee7
    { id: 'titerroy_334', a: [-637.7, -101.8], b: [-669.3, -161.9], anchos: [7.6, 7.6, 7.6, 7.6, 9.6, 7.4, 9.9, 10.7], altos: [4, 4, 6.6, 6.6, 4, 6.6, 6.6, 4], casas: [
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'PD:3.4', zoc: { t: 'liso', c: '#a9c4dd', h: 0.9 }, cables: true },
      { pared: '#f3f1ea', carp: '#3b2418', bajo: 'PD:2.6', zoc: { t: 'liso', c: '#a9c4dd', h: 0.9 } },
      null,
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'PD:3.2 VC:1.2', zoc: { t: 'liso', c: '#a9c4dd', h: 1.2 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'PD:2 PD:2.6 P', zoc: { t: 'liso', c: '#a9c4dd', h: 0.9 }, contador: { x: 0.35 }, cables: true },
      { pared: '#efe3c4', carp: '#4a2c1f', bajo: 'VC:2.4 P V', zoc: { t: 'piedra', c: '#7a6a58', junta: '#a08a6a', h: 1.6 }, num: 16, numX: 0.55, contador: { x: 0.4 } },
      { pared: '#efe3c4', carp: '#4a2c1f', bajo: 'V:2.4 _', zoc: { t: 'piedra', c: '#7a6a58', junta: '#a08a6a', h: 1.6 }, contador: { x: 0.8 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'M:2.6 _ VR', persiana: '#a9abad', marcoPersiana: '#8b8f93', ventanaAlta: true },
    ] },
    // titerroy_335: de Luis de Guadarfia, acera norte, pasos 2,3 — hoja titerroy/titerroy_335.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_335', a: [-722.8, -902.5], b: [-731.9, -895.8], anchos: [7.7, 4.5], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#6b4a33', bajo: 'P:1.2 _:2 P:0.9' },
      null,
    ] },
    // titerroy_336: el Peral, acera norte, pasos 7 — hoja titerroy/titerroy_336.jpg — antes: #dd7d70/tienda #dd7d70/tienda
    { id: 'titerroy_336', a: [-896.9, -915.4], b: [-911.9, -905.4], anchos: [9, 9], altos: [4, 4], casas: [
      { pared: '#f0ece4', carp: '#3f8a7a', bajo: 'P', zoc: { t: 'liso', c: '#d9d6cf', h: 0.8 } },
      { pared: '#d9705f', carp: '#6b5a3a', bajo: 'VR:1.2 Es:1.4', corn: { c: '#f0ece4' }, marcoEscaparate: '#6b5a3a', reja: '#222222', num: 3, numX: 0.55, contador: { x: 0.25 } },
    ] },
    // titerroy_337: el Antonio, acera sur, pasos 1 — hoja titerroy/titerroy_337.jpg — antes: #f1eee7
    { id: 'titerroy_337', a: [-408.2, -583.1], b: [-401.4, -587.8], anchos: [8.2], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VR VR VR VR', reja: '#f4f4f2' },
    ] },
    // titerroy_338: de Cuenca, acera norte, pasos 1,2,3,4 — hoja titerroy/titerroy_338.jpg — antes: #f1eee7 #f1eee7/solar #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_338', a: [-288.7, -822.9], b: [-299.8, -815.1], anchos: [4.5, 15.2, 9.7, 9.7, 4.5], altos: [4, 0, 6.6, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#5a3a28', bajo: 'VC VC P', contador: { x: 0.5 }, cables: true },
      null,
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'G:3.4 P', alto: 'V VA', contador: { x: 0.55 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P V:1.6', alto: 'V:2 VA', cables: true },
      { pared: '#f3f1ea', carp: '#6d6f70', bajo: 'G:2.6 _', alto: 'VR VA', esq: { c: '#8a6a5a', t: 'sillares', lados: [0] } },
    ] },
    // titerroy_339: el Faustino, acera norte, pasos 4 — hoja titerroy/titerroy_339.jpg — antes: #f1eee7
    { id: 'titerroy_339', a: [-443.5, -845.7], b: [-435.0, -851.8], anchos: [10.4], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V:1 P VR:2', alto: 'B:3.5', reja: '#f4f4f2', barandilla: '#d9d9d6', num: 7, numX: 0.08 },
    ] },
    // titerroy_340: el Faustino, acera norte, pasos 2 — hoja titerroy/titerroy_340.jpg — antes: #f1eee7/tienda
    { id: 'titerroy_340', a: [-435.0, -851.8], b: [-444.6, -844.8], anchos: [11.9], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#c9c9c4', bajo: 'P _ PD:2.6 PD:2.6', contador: { x: 0.3 }, cables: true },
    ] },
    // titerroy_341: Gusa, acera este, pasos 1 — hoja titerroy/titerroy_341.jpg — antes: #9d9890 #9d9890 #9d9890
    { id: 'titerroy_341', a: [-814.6, -541.2], b: [-796.3, -564.1], anchos: [9.8, 9.8, 9.8], altos: [6.6, 6.6, 6.6], casas: [
      null,
      null,
      null,
    ] },
    // titerroy_342: de Santander, acera oeste, pasos 2 — hoja titerroy/titerroy_342.jpg — antes: #f1eee7/solar
    { id: 'titerroy_342', a: [-605.3, -336.4], b: [-599.5, -342.9], anchos: [8.6], altos: [0], casas: [
      null,
    ] },
    // titerroy_343: de Santander, acera este, pasos 3,4 — hoja titerroy/titerroy_343.jpg — antes: #9d9890 #f1eee7 #f1eee7
    { id: 'titerroy_343', a: [-582.6, -346.1], b: [-573.4, -356.1], anchos: [4.2, 4.2, 5.2], altos: [6.6, 4, 4], casas: [
      { pared: 'bloque', carp: '#6d6f70', bajo: '_ T:1', alto: 'VA:1' },
      { pared: '#e8d4a8', carp: '#f4f4f2', bajo: 'PD:2.4', zoc: { t: 'liso', c: '#8f857c', h: 1.1 }, contador: { x: 0.85 }, cables: true },
      { pared: '#e8d4a8', carp: '#f4f4f2', bajo: 'P _ VA P VA', zoc: { t: 'liso', c: '#8f857c', h: 1.1 }, contador: { x: 0.15 }, cables: true },
    ] },
    // titerroy_344: de Santander, acera oeste, pasos 5,6 — hoja titerroy/titerroy_344.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'titerroy_344', a: [-595.6, -346.9], b: [-579.1, -364.9], anchos: [8.4, 8.4, 7.7], altos: [4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VC:1.8 _ VC:1.4', zoc: { t: 'piedra', c: '#c9b89a', junta: '#e3d6bf', h: 1.3 }, franja: { c: '#1f7a45', y: 1.3, h: 0.08 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VC P', zoc: { t: 'piedra', c: '#c9b89a', junta: '#e3d6bf', h: 1.3 }, franja: { c: '#1f7a45', y: 1.3, h: 0.08 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VC P PD:1.6', zoc: { t: 'piedra', c: '#c9b89a', junta: '#e3d6bf', h: 1.3 }, franja: { c: '#1f7a45', y: 1.3, h: 0.08 }, contador: { x: 0.75 }, cables: true },
    ] },
    // titerroy_345: de Santander, acera este, pasos 1 — hoja titerroy/titerroy_345.jpg — antes: #f1eee7 #f1eee7
    { id: 'titerroy_345', a: [-605.9, -306.6], b: [-596.3, -317.4], anchos: [7.2, 7.2], altos: [9.4, 9.4], casas: [
      null,
      { pared: '#ece9e1', carp: '#3f6b4a', bajo: '_ _ M:1.6 VR:1.2', persiana: '#4f7a5a', alto: 'VA VA', zoc: { t: 'liso', c: '#e3dccb', h: 3.2 }, franja: { c: '#d9d3c4', y: 3.3, h: 0.2 }, marcoPersiana: '#6d6f70' },
    ] },
    // titerroy_346: de Santander, acera este, pasos 2 — hoja titerroy/titerroy_346.jpg — antes: #f1eee7/tienda
    { id: 'titerroy_346', a: [-596.9, -329.2], b: [-591.2, -335.5], anchos: [8.5], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#2a55a8', bajo: 'M:2 _ VR P', persiana: '#a9abad', marcoPersiana: '#2a55a8', reja: '#2a55a8', corn: { c: '#e9e7e0' }, cables: true },
    ] },
    // titerroy_347: de Santander, acera oeste, pasos 3,4 — hoja titerroy/titerroy_347.jpg — antes: #e6d3b8 #e6d3b8/tienda
    { id: 'titerroy_347', a: [-590.0, -353.0], b: [-579.1, -364.9], anchos: [8.4, 7.8], altos: [6.6, 4], casas: [
      { pared: '#9a8e80', carp: '#7a5234', bajo: 'P PD:1.6', contador: { x: 0.25 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'P VC P VC', zoc: { t: 'granito', c: '#e6e0d2', h: 2.0 }, franja: { c: '#1f7a45', y: 2.0, h: 0.08 }, cables: true },
    ] },
    // titerroy_348: de Santander, acera este, pasos 5 — hoja titerroy/titerroy_348.jpg — antes: #f1eee7/tienda #f1eee7/tienda
    { id: 'titerroy_348', a: [-586.3, -341.5], b: [-573.1, -355.8], anchos: [9.7, 9.7], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#222222', bajo: 'E:2.2 VA:3', rejaEscaparate: '#222222', reja: '#222222', cables: true },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V P', zoc: { t: 'piedra', c: '#4a4540', h: 1.6 } },
    ] },
  ],
};
