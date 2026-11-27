/**
 * Fachadas dibujadas: argana_alta, tanda 1 (50 tramos de
 * src/barrios/compartido/fachadasCasa.js). Cada casa se describe mirando la hoja de fotos de su tramo
 * (carpeta _trabajo_fachadas); null = no se dibuja. Método: skill lava-game-fachadas.
 */

export default {
  nombre: 'argana_alta 1',
  aceras: [
    // argana_alta_028: de Luján Pérez, acera norte, pasos 1,2,3,4,5,6 — hoja argana_alta/argana_alta_028.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7/solar #f1eee7/solar #f1eee7/solar
    { id: 'argana_alta_028', a: [-2269.4, -1905.9], b: [-2239.3, -1915.8], anchos: [4.5, 10, 10, 10, 10, 11], altos: [4, 4, 4, 0, 0, 0], casas: [
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'V', zoc: { t: 'liso', c: '#c49a6c', h: 1.4 }, cables: true },
      { pared: '#f3f1ea', carp: '#d9bf94', bajo: 'P V', zoc: { t: 'liso', c: '#8a4a32', h: 0.9 }, num: 5, numX: 0.12 },
      null,
      null,
      null,
      null,
    ] },
    // argana_alta_029: de Luján Pérez, acera norte, pasos 9,10,11,12,13,14,15 — hoja argana_alta/argana_alta_029.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #e9c3a4 #e9c3a4
    { id: 'argana_alta_029', a: [-2218.7, -1921.9], b: [-2153.5, -1943.2], anchos: [7.6, 10, 10.1, 10, 10, 10, 11], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      null,
      null,
      { pared: '#f3f1ea', carp: '#3b2a20', bajo: 'PD:2.4 V', alto: 'VR VR', zoc: { t: 'piedra', c: '#6b5a4a', junta: '#a89480', h: 0.5 }, num: 31, numX: 0.45, contador: { x: 0.55 } },
      null,
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'V VR PA', alto: 'V VR', num: 25, numX: 0.7, contador: { x: 0.4 } },
      { pared: '#e8cfc0', carp: '#2e211b', bajo: 'P V VA', alto: 'VA VA', contador: { x: 0.2 } },
      { pared: '#e8cfc0', carp: '#2e211b', bajo: 'VA V', alto: 'VA VA', contador: { x: 0.6 }, cables: true },
    ] },
    // argana_alta_030: de Luján Pérez, acera norte, pasos 21,22,23,24 — hoja argana_alta/argana_alta_030.jpg — antes: #e4cfc9 #e4cfc9 #f1eee7 #f1eee7
    { id: 'argana_alta_030', a: [-2103.6, -1959.0], b: [-2073.0, -1969.1], anchos: [6.7, 10, 10, 5.6], altos: [4, 4, 4, 4], casas: [
      null,
      { pared: '#e4cfc9', carp: '#7a5a3e', bajo: 'P', num: 41, numX: 0.35, contador: { x: 0.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f8a6a', bajo: 'P V', zoc: { t: 'granito', c: '#8c8790', h: 1.0 }, num: 43, numX: 0.25, contador: { x: 0.5 }, cables: true },
      { pared: '#f3f1ea', carp: '#6b3a2a', bajo: 'P', zoc: { t: 'liso', c: '#8e9093', h: 0.6 } },
    ] },
    // argana_alta_031: de Luján Pérez, acera norte, pasos 27 — hoja argana_alta/argana_alta_031.jpg — antes: #f1eee7
    { id: 'argana_alta_031', a: [-2052.6, -1976.5], b: [-2040.0, -1980.9], anchos: [13.4], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#7a5236', bajo: 'P VR', ventanaAlta: true, zoc: { t: 'piedra', c: '#5a5a58', junta: '#8e8e8a', h: 0.7 }, cables: true },
    ] },
    // argana_alta_032: de Luján Pérez, acera sur, pasos 29 — hoja argana_alta/argana_alta_032.jpg — antes: #f1eee7/tienda
    { id: 'argana_alta_032', a: [-2008.9, -1976.0], b: [-2020.9, -1970.3], anchos: [13.3], altos: [6.6], casas: [
      null,
    ] },
    // argana_alta_033: de Luján Pérez, acera norte, pasos 30,31,32,33,34 — hoja argana_alta/argana_alta_033.jpg — antes: #f1eee7/tienda #f1eee7/tienda #f1eee7 #e6d3b8 #f1eee7 #f1eee7
    { id: 'argana_alta_033', a: [-2029.4, -1985.6], b: [-1972.7, -2004.9], anchos: [8.9, 8.9, 10, 10, 10, 12.2], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 4], casas: [
      null,
      { pared: '#f3f1ea', carp: '#222222', bajo: 'Es:1.8 Es:1.6', marcoEscaparate: '#222222', alto: 'B VA', zoc: { t: 'liso', c: '#4a4d52', h: 1.6 }, cables: true, contador: { x: 0.9 } },
      { pared: '#f3f1ea', carp: '#4a3326', bajo: 'V PA PA V', alto: 'V V', zoc: { t: 'piedra', c: '#6e5f58', junta: '#9a8c84', h: 1.6 }, num: 61, numX: 0.5, cables: true },
      { pared: '#e6d3b8', carp: '#4a2c1f', bajo: 'PA PD:2.6', alto: 'VA VA', zoc: { t: 'granito', c: '#b5ab9d', h: 2.8 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G G', alto: 'VA VA', zoc: { t: 'liso', c: '#d09a6a', h: 2.5 }, cables: true, contador: { x: 0.5 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V VR', ventanaAlta: true, zoc: { t: 'liso', c: '#d09a6a', h: 1.4 } },
    ] },
    // argana_alta_034: de Luján Pérez, acera norte, pasos 36,37,38,39,40,41,42,43,44,45 — hoja argana_alta/argana_alta_034.jpg — antes: #f1eee7/tienda #f1eee7/solar #f0dd96 #f1eee7 #f1eee7 #f1eee7 #efe6c8 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_034', a: [-1949.0, -2013.1], b: [-1910.3, -2026.5], anchos: [4.5, 10, 10, 10, 10, 10, 10, 10, 10, 4.5], altos: [6.6, 0, 6.6, 4, 4, 6.6, 4, 6.6, 4, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#3b2a20', bajo: 'P:1.2', alto: 'VA', zoc: { t: 'liso', c: '#8a5a44', h: 1.0 }, cables: true },
      null,
      { pared: '#e3c77a', carp: '#3b2a20', bajo: 'G:3 P', alto: 'VA VA', num: 63, numX: 0.6, contador: { x: 0.52 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f6e4a', bajo: 'P V', zoc: { t: 'liso', c: '#dcc0b4', h: 2.3 }, contador: { x: 0.45 } },
      { pared: '#f3f1ea', carp: '#1f6e4a', bajo: 'PD:3', zoc: { t: 'liso', c: '#dcc0b4', h: 2.3 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f6e4a', bajo: 'G P', alto: 'VA', zoc: { t: 'granito', c: '#b5a48c', h: 2.4 }, num: 67, numX: 0.8, contador: { x: 0.65 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f6e4a', bajo: 'VR VR VR', ventanaAlta: true, zoc: { t: 'granito', c: '#7a6e62', h: 0.6 }, cables: true },
      null,
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G P V', zoc: { t: 'liso', c: '#dcc0b4', h: 2.0 }, cables: true },
      null,
    ] },
    // argana_alta_035: de Luján Pérez, acera norte, pasos 47,48,49,50 — hoja argana_alta/argana_alta_035.jpg — antes: #9d9890 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_035', a: [-1858.9, -2045.2], b: [-1824.3, -2057.1], anchos: [7.1, 10, 10, 9.5], altos: [4, 4, 4, 4], casas: [
      { pared: '#9d9890', carp: '#4f6e5a', bajo: 'PD:4.2' },
      { pared: '#f3f1ea', carp: '#8b8f93', bajo: 'P VR', num: 87, numX: 0.55 },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G P V', num: 89, numX: 0.55, cables: true },
      { pared: '#f3f1ea', carp: '#1f6e4a', bajo: 'V P PD:2', num: 91, numX: 0.45, cables: true, contador: { x: 0.6 } },
    ] },
    // argana_alta_036: de Luján Pérez, acera norte, pasos 52,53,54,55,56 — hoja argana_alta/argana_alta_036.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #9d9890
    { id: 'argana_alta_036', a: [-1813.6, -2059.9], b: [-1767.3, -2075.9], anchos: [9.6, 10, 10, 10, 9.5], altos: [6.6, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G P PD:2.2', alto: 'B VA B', zoc: { t: 'piedra', c: '#8a7660', junta: '#d8c9a8', h: 1.4 }, num: 95, numX: 0.5, contador: { x: 0.4 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA VA P VA', zoc: { t: 'liso', c: '#2b2c30', h: 2.2 }, num: 97, numX: 0.62, cables: true },
      { pared: '#f3f1ea', carp: '#1f6e4a', bajo: 'V V P', zoc: { t: 'liso', c: '#2b2c30', h: 2.0 }, cables: true, contador: { x: 0.1 } },
      { pared: '#f3f1ea', carp: '#1a6b45', bajo: 'V P VC VC', zoc: { t: 'granito', c: '#b9b6b0', h: 2.2 }, franja: { c: '#1a6b45', y: 2.2, h: 0.08 }, cables: true },
      { pared: '#f3f1ea', carp: '#6b5a48', bajo: 'PD:2.5', num: 103, numX: 0.05, cables: true },
    ] },
    // argana_alta_037: de Luján Pérez, acera norte, pasos 61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78 — hoja argana_alta/argana_alta_037.jpg — antes: #e6d3b8 #f1eee7 #f1eee7 #f1eee7 #efe6c8 #f1eee7 #f1eee7 #f1eee7 #e2c079 #f1eee7/tienda #f1eee7 #f1eee7/tienda #f1eee7 #f1eee7 #e9b99c/tienda #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_037', a: [-1731.1, -2088.9], b: [-1560.8, -2149.3], anchos: [12, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8.7], altos: [6.6, 6.6, 6.6, 4, 6.6, 4, 6.6, 4, 4, 4, 6.6, 6.6, 4, 4, 6.6, 4, 6.6, 6.6], casas: [
      { pared: '#e6d3b8', carp: '#3b2a20', bajo: 'V P G', alto: 'VA VA', zoc: { t: 'granito', c: '#c9b9a0', h: 2.6 }, num: 107, numX: 0.62, cables: true },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'PD:3', alto: 'B VA', zoc: { t: 'granito', c: '#a7a29b', h: 2.2 } },
      { pared: '#f3f1ea', carp: '#5a3a28', bajo: 'PD:2.8 V', alto: 'B B', barandilla: '#efe3c4', zoc: { t: 'liso', c: '#9a9a98', h: 2.4 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f6e4a', bajo: 'P V P G', zoc: { t: 'piedra', c: '#9a8f80', junta: '#d8d2c8', h: 2.2 }, cables: true },
      { pared: '#f0e6c8', carp: '#4a3326', bajo: 'G P G', alto: 'V', contador: { x: 0.55 }, cables: true },
      { pared: '#f3f1ea', carp: '#4a4c4e', bajo: 'E:2.4', rejaEscaparate: '#4a4c4e', cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G P PD:1.6', alto: 'VA', contador: { x: 0.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V', zoc: { t: 'liso', c: '#6e4a3e', h: 1.4 }, contador: { x: 0.3 } },
      { pared: '#e8cf8a', carp: '#f4f4f2', bajo: 'G P V P', contador: { x: 0.4 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P G G', zoc: { t: 'liso', c: '#c98a78', h: 0.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA P P V', alto: 'V VA', cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G P G', alto: 'VA VA', garajeVentanas: true, cables: true },
      { pared: '#f3f1ea', carp: '#2f5e46', bajo: 'V P P', zoc: { t: 'granito', c: '#8f8d88', h: 2.4 }, num: 131, numX: 0.9, cables: true },
      { pared: '#f3f1ea', carp: '#2f5e46', bajo: 'V V', zoc: { t: 'granito', c: '#8f8d88', h: 2.4 }, cables: true },
      { pared: '#e2a98a', carp: '#f4f4f2', bajo: 'Es:2.2 P', marcoEscaparate: '#f4f4f2', alto: 'VA', cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V', zoc: { t: 'liso', c: '#6d6d6d', h: 0.8 }, esq: { c: '#4a4a4a', t: 'sillares', lados: [0, 1] }, cables: true },
      { pared: '#f3f1ea', carp: '#1f6e4a', bajo: 'V P V', alto: 'V V', zoc: { t: 'liso', c: '#6d6d6d', h: 0.8 }, esq: { c: '#4a4a4a', t: 'sillares', lados: [0, 1] }, cables: true },
      { pared: '#e6d3b8', carp: '#f4f4f2', bajo: 'P V P', alto: 'VA', esq: { c: '#4a4a4a', t: 'sillares', lados: [0] } },
    ] },
    // argana_alta_038: de Luján Pérez, acera sur, pasos 14,15,16,17 — hoja argana_alta/argana_alta_038.jpg — antes: #f1eee7 #f1eee7 #f0dd96 #f1eee7/solar #f1eee7/solar #f0dd96
    { id: 'argana_alta_038', a: [-2152.6, -1933.7], b: [-2146.9, -1935.6], anchos: [4.5, 10, 5, 5, 2.2, 2.2], altos: [4, 4, 6.6, 0, 0, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#1f6e4a', bajo: 'P', cables: true },
      { pared: '#f3f1ea', carp: '#8a3a32', bajo: 'PD:3.2', cables: true },
      null,
      null,
      null,
      { pared: '#efe0b0', carp: '#222222', bajo: 'P VR', alto: 'VA', contador: { x: 0.3 } },
    ] },
    // argana_alta_039: de Luján Pérez, acera sur, pasos 35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59 — hoja argana_alta/argana_alta_039.jpg — antes: #e6d3b8 #e6d3b8 #e6d3b8 #f1eee7/solar #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #efe6c8 #efe6c8 #f1eee7 #f1eee7 #e6d3b8 #e6d3b8 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #d9b996 #efe6c8 #efe6c8/tienda #efe6c8/tienda
    { id: 'argana_alta_039', a: [-1933.0, -2007.6], b: [-1741.4, -2073.8], anchos: [4.5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 4.5], altos: [6.6, 6.6, 4, 0, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 4, 4, 6.6, 4, 4, 6.6, 6.6, 6.6, 4, 6.6, 6.6, 6.6], casas: [
      { pared: '#efe3c4', carp: '#3b2a20', bajo: 'V', alto: 'V', zoc: { t: 'liso', c: '#9a5a48', h: 2.0 } },
      { pared: '#efe3c4', carp: '#3b2a20', bajo: 'V V G', alto: 'V V V', zoc: { t: 'liso', c: '#9a5a48', h: 2.0 } },
      { pared: '#efe3c4', carp: '#3b2a20', bajo: 'V', zoc: { t: 'liso', c: '#a15e4a', h: 1.6 }, franja: { c: '#e6dcc4', y: 1.6, h: 0.6 } },
      null,
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA VA P', alto: 'B B', zoc: { t: 'granito', c: '#4e4e50', h: 1.1 }, num: 62, numX: 0.8, contador: { x: 0.6 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'VR P', alto: 'VA', zoc: { t: 'liso', c: '#b07a5a', h: 2.3 }, num: 64, numX: 0.55, contador: { x: 0.35 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'PA PD:2.8', alto: 'VA VA', zoc: { t: 'liso', c: '#e8d8a8', h: 1.2 } },
      { pared: '#f3f1ea', carp: '#7a4a2a', bajo: 'Es:2.4 Es:2.4', marcoEscaparate: '#7a4a2a', alto: 'VA' },
      { pared: '#f3f1ea', carp: '#4a3326', bajo: 'V G', alto: 'VA VA', contador: { x: 0.1 } },
      { pared: '#f3f1ea', carp: '#222222', bajo: 'P VR P', reja: '#222222', alto: 'B B', barandilla: '#222222', num: 72, numX: 0.2, contador: { x: 0.45 } },
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'V P V', alto: 'VA VA', franja: { c: '#e6dcc0', y: 3.0, h: 0.3 }, num: 76, numX: 0.45, cables: true },
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'V:2 P V:2', alto: 'VA VA', franja: { c: '#e6dcc0', y: 3.0, h: 0.3 }, num: 78, numX: 0.5, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P VR', reja: '#f4f4f2', alto: 'VA' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G P V', zoc: { t: 'liso', c: '#8a4a38', h: 2.6 }, contador: { x: 0.2 } },
      { pared: '#efe3c4', carp: '#9fb0c0', bajo: 'PD:2.6 P', zoc: { t: 'piedra', c: '#a08670', junta: '#d8c8b0', h: 2.8 }, corn: { c: '#e9d7a0' }, num: 86, numX: 0.85 },
      { pared: '#efe3c4', carp: '#4a2c1f', bajo: 'P VC VC', alto: 'B B', barandilla: '#3a2a20', reja: '#222222', zoc: { t: 'granito', c: '#4a4a4a', h: 0.9 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G:2 P V', zoc: { t: 'piedra', c: '#5e5e5c', junta: '#7a7a78', h: 1.2 }, contador: { x: 0.5 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'V P G', alto: 'B B', barandilla: '#f4f4f2', corn: { c: '#f4f4f2' }, contador: { x: 0.25 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VR G PA', alto: 'VA VA', contador: { x: 0.4 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P VR P V', reja: '#222222', alto: 'B VA', num: 96, numX: 0.4 },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#5a5c60', h: 0.8 }, contador: { x: 0.6 } },
      { pared: '#dcc39a', carp: '#5a2430', bajo: 'VR P VC', alto: 'VA', zoc: { t: 'liso', c: '#d9cbb0', h: 1.0 }, cables: true },
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'P VR V', alto: 'VB VA', zoc: { t: 'liso', c: '#d8cbb4', h: 1.2 }, esq: { c: '#e3c47a', lados: [0, 1] }, contador: { x: 0.45 } },
      { pared: '#e8d4a8', carp: '#f4f4f2', bajo: 'VR M:3', marcoPersiana: '#4a4a4a', persiana: '#e8e8e4', alto: 'VA', contador: { x: 0.2 } },
      { pared: '#e8d4a8', carp: '#8b8f93', bajo: 'M:2.6', persiana: '#e8e8e4', alto: 'V', esq: { c: '#4a4a4a', lados: [1] } },
    ] },
    // argana_alta_040: Malagueña, acera norte, pasos 29 — hoja argana_alta/argana_alta_040.jpg — antes: #efe6c8
    { id: 'argana_alta_040', a: [-1778.1, -1757.2], b: [-1770.0, -1761.1], anchos: [9], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#6b4a33', bajo: 'M:3.2', marcoPersiana: '#d8d8d4', persiana: '#e8e6de', alto: 'B', barandilla: '#6b4a33', cables: true },
    ] },
    // argana_alta_041: Malagueña, acera norte, pasos 32 — hoja argana_alta/argana_alta_041.jpg — antes: #f1eee7
    { id: 'argana_alta_041', a: [-1744.9, -1776.6], b: [-1733.0, -1782.6], anchos: [13.3], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#2e9a52', bajo: 'V P PD:3', zoc: { t: 'liso', c: '#2a2a2e', h: 1.2 }, cables: true, contador: { x: 0.45 } },
    ] },
    // argana_alta_042: Malagueña, acera norte, pasos 36,37,38,39,40,41,42,43,44,45,46 — hoja argana_alta/argana_alta_042.jpg — antes: #f1eee7/solar #f1eee7 #5f8f5a #f1eee7/tienda #dd7d70 #d9b996 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_042', a: [-1692.5, -1790.4], b: [-1607.2, -1833.2], anchos: [4.5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 6.1], altos: [0, 6.6, 4, 6.6, 4, 6.6, 4, 4, 4, 4, 6.6], casas: [
      null,
      { pared: '#f3f1ea', carp: '#3b2a20', bajo: 'P PD:3', alto: 'VA B', barandilla: '#222222', zoc: { t: 'piedra', c: '#5a5048', junta: '#8a8070', h: 0.9 }, num: 77, numX: 0.3, cables: true },
      { pared: '#3f8a4a', carp: '#f4f4f2', bajo: 'P V:2.6', contador: { x: 0.4 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'Es:1.6 P', alto: 'VB VA', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#222222', h: 0.4 }, cables: true },
      { pared: '#a8503a', carp: '#1f6e4a', bajo: 'P VR M:2.6', persiana: '#efefea', reja: '#1f6e4a' },
      { pared: '#d9b49a', carp: '#f4f4f2', bajo: 'G P G', alto: 'VA VA', zoc: { t: 'granito', c: '#7a5a50', h: 0.8 }, num: 85, numX: 0.45 },
      { pared: '#f3f1ea', carp: '#2f5e46', bajo: 'V VC P', zoc: { t: 'piedra', c: '#4e4e50', h: 1.0 }, num: 87, numX: 0.6, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P VA', zoc: { t: 'liso', c: '#3e3e40', h: 1.0 }, esq: { c: '#5a5a5c', lados: [0, 1] }, num: 89, numX: 0.05, cables: true },
      { pared: '#f3f1ea', carp: '#3b2a20', bajo: 'V PA V', zoc: { t: 'liso', c: '#dcd8d0', h: 1.0 }, cables: true },
      { pared: '#efe6c8', carp: '#f4f4f2', bajo: 'VA G', zoc: { t: 'liso', c: '#8a5a4a', h: 1.4 }, cables: true, contador: { x: 0.15 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V P V', alto: 'VA', cables: true },
    ] },
    // argana_alta_043: Malagueña, acera norte, pasos 49 — hoja argana_alta/argana_alta_043.jpg — antes: #f1eee7
    { id: 'argana_alta_043', a: [-1585.6, -1854.0], b: [-1580.1, -1856.8], anchos: [6.2], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VR:2 P', reja: '#f4f4f2', alto: 'VA VA', corn: { c: '#f4f4f2' }, num: 101, numX: 0.85 },
    ] },
    // argana_alta_044: Malagueña, acera sur, pasos 29 — hoja argana_alta/argana_alta_044.jpg — antes: #e2c079
    { id: 'argana_alta_044', a: [-1766.6, -1732.8], b: [-1758.3, -1736.7], anchos: [9.2], altos: [6.6], casas: [
      { pared: '#e8c060', carp: '#1f8a4a', bajo: 'P V', zoc: { t: 'piedra', c: '#b89a80', junta: '#e3d3b6', h: 2.4 }, num: 56, numX: 0.15, cables: true },
    ] },
    // argana_alta_045: de los Aires de Lima, acera norte, pasos 10,11,12,13,14,15,16,17,18,19,20,21,22,23,24 — hoja argana_alta/argana_alta_045.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7/tienda #f1eee7 #f1eee7 #e6d3b8 #f0dd96 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_045', a: [-1860.3, -1603.1], b: [-1724.8, -1666.8], anchos: [7.2, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12.6], altos: [4, 4, 4, 6.6, 4, 6.6, 4, 4, 6.6, 6.6, 4, 6.6, 4, 6.6, 4], casas: [
      { pared: '#f3f1ea', carp: '#d8d8d4', bajo: 'M:2.6', persiana: '#e8e8e4', num: 23, numX: 0.85 },
      { pared: '#f3f1ea', carp: '#2a2a2a', bajo: 'PD:4', cables: true, contador: { x: 0.15 } },
      { pared: '#f3f1ea', carp: '#2a2a2a', bajo: 'P VR PD:3', ventanaAlta: true, cables: true },
      { pared: '#f3f1ea', carp: '#1f8a5a', bajo: 'V P P', alto: 'VB VB', barandilla: '#1f8a5a', num: 27, numX: 0.9 },
      { pared: '#f3f1ea', carp: '#5aa59a', bajo: 'PD:4.2', cables: true, contador: { x: 0.85 } },
      { pared: '#f3f1ea', carp: '#e8e8e4', bajo: 'M:3 PD:3', persiana: '#efefea', alto: 'VA', contador: { x: 0.45 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P M:3', persiana: '#9a9c9e', cables: true },
      { pared: '#f3f1ea', carp: '#3a7ab5', bajo: 'Es:2.6 P', marcoEscaparate: '#3a7ab5', num: 33, numX: 0.9, cables: true },
      { pared: '#f3f1ea', carp: '#2a8a6a', bajo: 'PD:3 V P', alto: 'V', num: 35, numX: 0.35, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P V', alto: 'VA VA', zoc: { t: 'liso', c: '#9a4a3a', h: 2.4 }, num: 39, numX: 0.7 },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V', zoc: { t: 'liso', c: '#d8a080', h: 1.1 }, cables: true },
      { pared: '#efdca0', carp: '#1f8a5a', bajo: 'P G', alto: 'VA VA', esq: { c: '#2a2a2e', lados: [1] }, num: 41, numX: 0.25, cables: true },
      { pared: '#f3f1ea', carp: '#8fa8c0', bajo: 'PD:3.2', num: 45, numX: 0.9, cables: true },
      { pared: '#efe3c4', carp: '#4a2c1f', bajo: 'V P G', alto: 'B B', barandilla: '#2a2a2a', zoc: { t: 'granito', c: '#6e4a40', h: 2.8 }, num: 49, numX: 0.6 },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V P G', zoc: { t: 'granito', c: '#8a6a5a', h: 2.4 } },
    ] },
    // argana_alta_046: de los Aires de Lima, acera norte, pasos 28 — hoja argana_alta/argana_alta_046.jpg — antes: #f1eee7/tienda #f1eee7/tienda
    { id: 'argana_alta_046', a: [-1703.6, -1690.8], b: [-1688.5, -1698.2], anchos: [8.4, 8.4], altos: [6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'E:2.6 PA', alto: 'B VA', cables: true, contador: { x: 0.75 } },
      { pared: '#f3f1ea', carp: '#e8e6e0', bajo: 'PD:3.2', alto: 'B' },
    ] },
    // argana_alta_047: de los Aires de Lima, acera norte, pasos 30,31,32,33,34,35,36,37,38,39,40,41,42 — hoja argana_alta/argana_alta_047.jpg — antes: #f1eee7/solar #f1eee7/solar #f1eee7 #efe6c8 #efe6c8 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #efe6c8 #efe6c8 #f1eee7/solar #f1eee7 #f1eee7
    { id: 'argana_alta_047', a: [-1668.7, -1696.8], b: [-1586.5, -1737.2], anchos: [4.5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 5, 5, 4.5], altos: [0, 0, 4, 6.6, 6.6, 6.6, 4, 6.6, 4, 6.6, 4, 0, 6.6, 6.6], casas: [
      null,
      null,
      { pared: '#f3f1ea', carp: '#2a5a9a', bajo: 'P G P V', zoc: { t: 'liso', c: '#8e9093', h: 0.8 }, num: 67, numX: 0.7, cables: true },
      { pared: '#efe6c8', carp: '#f4f4f2', bajo: 'V P VR', reja: '#f4f4f2', alto: 'B VA', barandilla: '#f4f4f2', contador: { x: 0.5 } },
      { pared: '#efe6c8', carp: '#f4f4f2', bajo: 'V P V:2.2', alto: 'VA B', barandilla: '#f4f4f2', contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'V P VA', zoc: { t: 'piedra', c: '#7a7570', junta: '#a8a39c', h: 2.6 }, contador: { x: 0.2 } },
      { pared: '#f3f1ea', carp: '#3b2a20', bajo: 'PD:2 P PD:2.6', cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA V P VA', alto: 'B B', barandilla: '#f4f4f2' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P VR PD:3', reja: '#f4f4f2', num: 77, numX: 0.05 },
      { pared: '#efe3c4', carp: '#f4f4f2', bajo: 'VC PA VC', alto: 'VA', zoc: { t: 'liso', c: '#d8c4a0', h: 1.1 }, num: 79, numX: 0.5 },
      { pared: '#f3f1ea', carp: '#1f8a5a', bajo: 'P PD:3.4', num: 81, numX: 0.15 },
      null,
      { pared: '#f3f1ea', carp: '#5a3a2a', bajo: 'P', alto: 'V:2.6', barandilla: '#f4f4f2' },
      { pared: '#f3f1ea', carp: '#2a2a2a', bajo: 'P VR P', reja: '#222222', zoc: { t: 'piedra', c: '#3a3634', h: 1.4 }, alto: 'B B B', barandilla: '#222222' },
    ] },
    // argana_alta_048: de los Aires de Lima, acera norte, pasos 59 — hoja argana_alta/argana_alta_048.jpg — antes: #e9c3a4 #e9c3a4
    { id: 'argana_alta_048', a: [-1430.5, -1824.4], b: [-1417.4, -1831.0], anchos: [7.3, 7.3], altos: [6.6, 6.6], casas: [
      { pared: '#e8b898', carp: '#f4f4f2', bajo: 'P VR', reja: '#222222', alto: 'VA', zoc: { t: 'granito', c: '#4a4c50', h: 0.9 }, num: 119, numX: 0.1 },
      { pared: '#e8b898', carp: '#f4f4f2', bajo: 'V', alto: 'VA', zoc: { t: 'granito', c: '#4a4c50', h: 0.9 } },
    ] },
    // argana_alta_049: de los Aires de Lima, acera sur, pasos 27,28,29,30,31,32,33,34,35,36,37,38,39 — hoja argana_alta/argana_alta_049.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7/solar #efe6c8 #f1eee7 #f1eee7 #f1eee7 #f1eee7/solar #f1eee7/solar #f1eee7/solar #efe6c8
    { id: 'argana_alta_049', a: [-1658.3, -1690.1], b: [-1637.8, -1700.2], anchos: [4.5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 4.5], altos: [4, 4, 4, 4, 0, 4, 4, 4, 4, 0, 0, 0, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f7a55', bajo: 'VR:2.2', ventanaAlta: true, zoc: { t: 'liso', c: '#8e9093', h: 1.5 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f8a55', bajo: 'PD:4 P', zoc: { t: 'liso', c: '#8e9093', h: 1.5 } },
      { pared: '#f3f1ea', carp: '#1f8a55', bajo: 'PD:3 E:1.6', toldo: '#2f6f90', zoc: { t: 'liso', c: '#8e9093', h: 1.5 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f8a55', bajo: 'PD:4.2', zoc: { t: 'liso', c: '#8e9093', h: 1.5 }, cables: true },
      null,
      { pared: '#f3f1ea', carp: '#1f8a6a', bajo: 'VR:1.6', ventanaAlta: true, contador: { x: 0.6 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f7a50', bajo: 'PD:3 V', zoc: { t: 'granito', c: '#8a8c88', h: 1.9 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f8a6a', bajo: 'P V P', zoc: { t: 'granito', c: '#8a8c88', h: 1.9 }, contador: { x: 0.4 }, cables: true },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'P VR G', reja: '#4a2c1f', cables: true },
      null,
      null,
      null,
      { pared: '#efe6c8', carp: '#7a5a40', bajo: 'PD:3.5' },
    ] },
    // argana_alta_050: del León Felipe, acera este, pasos 27,28 — hoja argana_alta/argana_alta_050.jpg — antes: #e6d3b8 #e6d3b8
    { id: 'argana_alta_050', a: [-2363.6, -1975.6], b: [-2355.5, -1964.1], anchos: [5.7, 8.4], altos: [6.6, 6.6], casas: [
      { pared: '#dfc6ac', carp: '#f4f4f2', bajo: 'V:2 P', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'granito', c: '#c9b8a6', h: 1.2 }, esq: { c: '#e8d8c8', lados: [1] } },
      { pared: '#dfc6ac', carp: '#f4f4f2', bajo: 'P VR', reja: '#f4f4f2', alto: 'VR VB', barandilla: '#f4f4f2', zoc: { t: 'granito', c: '#c9b8a6', h: 1.4 }, num: 26, numX: 0.15, contador: { x: 0.3 } },
    ] },
    // argana_alta_051: del León Felipe, acera este, pasos 35,36,37 — hoja argana_alta/argana_alta_051.jpg — antes: #efe6c8 #efe6c8 #efe6c8
    { id: 'argana_alta_051', a: [-2315.0, -1906.1], b: [-2307.2, -1895.1], anchos: [4.5, 10, 4.5], altos: [4, 6.6, 6.6], casas: [
      { pared: '#efe3c4', carp: '#3e4a44', bajo: 'PD:2.4 VR', reja: '#2a2a2a', alto: 'VA' },
      null,
      null,
    ] },
    // argana_alta_052: del León Felipe, acera este, pasos 47,48,49 — hoja argana_alta/argana_alta_052.jpg — antes: #f1eee7/tienda #f1eee7 #f1eee7
    { id: 'argana_alta_052', a: [-2245.4, -1807.6], b: [-2241.6, -1802.1], anchos: [4.5, 10, 4.5], altos: [6.6, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#5a4a3e', bajo: 'M:2.6', marcoPersiana: '#5a4a3e', persiana: '#5a4a3e', alto: 'VA', zoc: { t: 'liso', c: '#5e5a60', h: 1.0 } },
      { pared: '#f3f1ea', carp: '#5a4a3e', bajo: 'M:2.8 PD:2.8', marcoPersiana: '#5a4a3e', persiana: '#5a4a3e', alto: 'VA VA', zoc: { t: 'liso', c: '#5e5a60', h: 1.0 } },
      { pared: '#f3f1ea', carp: '#5a4a3e', bajo: 'PD:2.4', alto: 'B B', barandilla: '#222222' },
    ] },
    // argana_alta_053: Polca, acera oeste, pasos 11,12,13 — hoja argana_alta/argana_alta_053.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_053', a: [-1841.5, -1539.5], b: [-1856.3, -1569.1], anchos: [12.4, 10, 10.7], altos: [4, 4, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#2a55a8', bajo: 'VR:4 VR:1.4', ventanaAlta: true, reja: '#2a55a8', zoc: { t: 'granito', c: '#9a9a98', h: 1.2 } },
      { pared: '#f3f1ea', carp: '#2a55a8', bajo: 'VR:1.8 VR:4', ventanaAlta: true, reja: '#2a55a8', zoc: { t: 'granito', c: '#9a9a98', h: 1.2 } },
      { pared: '#f3f1ea', carp: '#4a3326', bajo: 'V PD:2.6', alto: 'VR', reja: '#222222', num: 31, numX: 0.85, contador: { x: 0.55 } },
    ] },
    // argana_alta_054: Polca, acera oeste, pasos 14,15 — hoja argana_alta/argana_alta_054.jpg — antes: #f1eee7 #f1eee7
    { id: 'argana_alta_054', a: [-1856.3, -1569.3], b: [-1862.7, -1582.1], anchos: [9.1, 5.2], altos: [6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#3b2a20', bajo: 'PD:2 V VR V V', reja: '#222222', alto: 'V V', zoc: { t: 'liso', c: '#4a4a4e', h: 2.6 } },
      { pared: '#efe3c4', carp: '#4a3326', bajo: 'PD:2 V', alto: 'VA', num: 23, numX: 0.1, contador: { x: 0.8 } },
    ] },
    // argana_alta_055: Polca, acera oeste, pasos 30 — hoja argana_alta/argana_alta_055.jpg — antes: #e9c3a4/tienda
    { id: 'argana_alta_055', a: [-1944.2, -1730.8], b: [-1947.0, -1736.6], anchos: [6.4], altos: [6.6], casas: [
      { pared: '#e8d4b8', carp: '#8b8f93', bajo: 'Es:2.6 Es:2.6', marcoEscaparate: '#d8c8b0', zoc: { t: 'liso', c: '#7a7c80', h: 1.0 }, alto: 'VA' },
    ] },
    // argana_alta_056: Polca, acera este, pasos 10,11,12 — hoja argana_alta/argana_alta_056.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_056', a: [-1829.0, -1542.4], b: [-1840.1, -1564.6], anchos: [5.4, 10, 9.5], altos: [6.6, 6.6, 6.6], casas: [
      null,
      { pared: '#f3f1ea', carp: '#8b8f93', bajo: 'P', alto: 'VR VR', reja: '#8b8f93', contador: { x: 0.6 } },
      { pared: '#f3f1ea', carp: '#8c97a0', bajo: 'PD:4.4', alto: 'VR', reja: '#8b8f93' },
    ] },
    // argana_alta_057: Polca, acera este, pasos 17,18,19 — hoja argana_alta/argana_alta_057.jpg — antes: #efe6c8 #efe6c8 #efe6c8
    { id: 'argana_alta_057', a: [-1860.7, -1602.9], b: [-1872.0, -1627.8], anchos: [6.9, 10, 10.4], altos: [6.6, 6.6, 6.6], casas: [
      { pared: '#efe8d6', carp: '#f4f4f2', bajo: 'VR:1.6', ventanaAlta: true, reja: '#f4f4f2', alto: 'V', franja: { c: '#e6dcc4', y: 3.2, h: 0.3 } },
      { pared: '#efe8d6', carp: '#f4f4f2', bajo: 'P', alto: 'V', franja: { c: '#e6dcc4', y: 3.2, h: 0.3 }, num: 6, numX: 0.5 },
      { pared: '#efe8d6', carp: '#f4f4f2', bajo: 'VR V', ventanaAlta: true, reja: '#f4f4f2', alto: 'VA', franja: { c: '#e6dcc4', y: 3.2, h: 0.3 }, contador: { x: 0.9 } },
    ] },
    // argana_alta_058: Polca, acera este, pasos 30,31,32 — hoja argana_alta/argana_alta_058.jpg — antes: #e9c3a4/tienda #e9c3a4/tienda #e9c3a4/tienda
    { id: 'argana_alta_058', a: [-1924.3, -1737.5], b: [-1936.2, -1761.7], anchos: [8.2, 10, 8.8], altos: [6.6, 6.6, 6.6], casas: [
      { pared: '#e6bc8e', carp: '#3a2a24', bajo: 'Es:3 Es:3', toldo: '#2a55a8', marcoEscaparate: '#3a2a24', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#8e9093', h: 1.3 } },
      { pared: '#e6bc8e', carp: '#f4f4f2', bajo: 'E:2 Es:2.4 Es:2', marcoEscaparate: '#efe3c4', alto: 'VB VA', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#8e9093', h: 1.3 } },
      { pared: '#e6bc8e', carp: '#f4f4f2', bajo: 'Es:1.8 Es:3.6', marcoEscaparate: '#efe3c4', alto: 'VB VA', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#8e9093', h: 1.3 } },
    ] },
    // argana_alta_059: Tajaraste, acera sur, pasos 38 — hoja argana_alta/argana_alta_059.jpg — antes: #efe6c8 #efe6c8
    { id: 'argana_alta_059', a: [-2012.1, -1826.1], b: [-2027.0, -1821.7], anchos: [7.8, 7.8], altos: [6.6, 6.6], casas: [
      { pared: '#efe4cc', carp: '#f4f4f2', bajo: 'VA P V', alto: 'VA VA', zoc: { t: 'piedra', c: '#5a5450', h: 0.4 } },
      { pared: '#efe4cc', carp: '#f4f4f2', bajo: 'P V P', alto: 'VA VA', zoc: { t: 'piedra', c: '#5a5450', h: 0.4 }, contador: { x: 0.4 } },
    ] },
    // argana_alta_060: Tajaraste, acera norte, pasos 66,67,68,69,70 — hoja argana_alta/argana_alta_060.jpg — antes: #f1eee7 #f1eee7 #efe6c8 #efe6c8 #efe6c8
    { id: 'argana_alta_060', a: [-1826.0, -1928.5], b: [-1777.7, -1949.0], anchos: [13.6, 10, 10, 10, 8.9], altos: [6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA P VA', alto: 'VA VB VA VB', contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VA P VA', alto: 'VB VA VB', contador: { x: 0.2 } },
      { pared: '#efe6c8', carp: '#2e211b', bajo: 'P VA P VA', alto: 'VB VA VB VA', contador: { x: 0.6 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'P VA P VA', alto: 'VB VA VB VA', zoc: { t: 'piedra', c: '#8a8580', junta: '#c8c2b8', h: 1.6 } },
      { pared: '#efe6c8', carp: '#4a3326', bajo: 'VA P VA P', alto: 'VA VB VA', zoc: { t: 'liso', c: '#7a5a48', h: 1.2 } },
    ] },
    // argana_alta_061: Tajaraste, acera norte, pasos 12,13,14,15,16 — hoja argana_alta/argana_alta_061.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_061', a: [-1777.7, -1949.1], b: [-1825.8, -1928.0], anchos: [10.1, 9.9, 10, 10, 12.4], altos: [6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#3b2a20', bajo: 'P VA P VA', reja: '#222222', alto: 'VA VB VA', num: 49, numX: 0.2, contador: { x: 0.45 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA P VA', alto: 'VB VA VB', zoc: { t: 'piedra', c: '#8a8580', junta: '#c8c2b8', h: 1.6 }, num: 43, numX: 0.6 },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VA P VA P', alto: 'VA VB VA', barandilla: '#222222', contador: { x: 0.5 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA P VA', alto: 'VA VB VA VB', contador: { x: 0.35 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VA P VA P VA', alto: 'VA VB VA VA', num: 33, numX: 0.45 },
    ] },
    // argana_alta_062: Tajaraste, acera sur, pasos 41,42,43 — hoja argana_alta/argana_alta_062.jpg — antes: #e9c3a4/tienda #e9c3a4 #e9c3a4
    { id: 'argana_alta_062', a: [-2045.7, -1822.8], b: [-2026.1, -1822.0], anchos: [7.8, 10.5, 4.5], altos: [6.6, 6.6, 6.6], casas: [
      { pared: '#e6cfb2', carp: '#3a3a3a', bajo: 'Es:3 Es:3', toldo: '#e07a2a', alto: 'VA VA VA' },
      { pared: '#efe2c8', carp: '#f4f4f2', bajo: 'V P P V', alto: 'VA VA VA' },
      { pared: '#efe2c8', carp: '#f4f4f2', bajo: 'V P', alto: 'VA' },
    ] },
    // argana_alta_063: de Felo Monzón, acera norte, pasos 1 — hoja argana_alta/argana_alta_063.jpg — antes: #e9c3a4/tienda #e9c3a4/tienda #e9c3a4/tienda
    { id: 'argana_alta_063', a: [-1981.0, -1752.4], b: [-1959.4, -1761.8], anchos: [7.8, 7.8, 7.8], altos: [6.6, 6.6, 6.6], casas: [
      null,
      { pared: '#e3cdb0', carp: '#f4f4f2', bajo: 'Es:2.6 Es:3', marcoEscaparate: '#f4f4f2', alto: 'VB VA' },
      { pared: '#e3cdb0', carp: '#f4f4f2', bajo: 'Es:3.4', marcoEscaparate: '#efe3c4', alto: 'VA' },
    ] },
    // argana_alta_064: de Felo Monzón, acera norte, pasos 5 — hoja argana_alta/argana_alta_064.jpg — antes: #e9c3a4/tienda
    { id: 'argana_alta_064', a: [-1935.8, -1781.2], b: [-1929.1, -1784.5], anchos: [7.5], altos: [6.6], casas: [
      { pared: '#e3cdb0', carp: '#f4f4f2', bajo: 'Es:3', marcoEscaparate: '#efe3c4', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#cdb89c', h: 0.8 } },
    ] },
    // argana_alta_065: de Felo Monzón, acera norte, pasos 21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40 — hoja argana_alta/argana_alta_065.jpg — antes: #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8
    { id: 'argana_alta_065', a: [-1732.2, -1870.7], b: [-1613.3, -1929.8], anchos: [4.5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8.6], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'VA P VR', reja: '#3b2a20', alto: 'VA VR VA', num: 25, numX: 0.4, contador: { x: 0.15 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'P VR P VA', reja: '#3b2a20', alto: 'VA VA', contador: { x: 0.22 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'VA P VA', alto: 'V VA V', contador: { x: 0.29 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'P VR P VA', reja: '#3b2a20', alto: 'VA VR VA', num: 27, numX: 0.1, contador: { x: 0.36 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'P VR P VR', reja: '#3b2a20', alto: 'VA VA', num: 41, numX: 0.6, contador: { x: 0.43 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'P VR P VA', reja: '#3b2a20', alto: 'V VA V', num: 45, numX: 0.6, contador: { x: 0.50 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'VA P VR', reja: '#3b2a20', alto: 'VA VR VA', contador: { x: 0.57 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'VR P VA P', reja: '#3b2a20', alto: 'VA VA', num: 53, numX: 0.85, contador: { x: 0.64 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'P VA P V', alto: 'V VA V', contador: { x: 0.71 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'VR P VR P', reja: '#3b2a20', alto: 'VA VR VA', contador: { x: 0.18 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'P VA P VA', alto: 'VA VA', num: 69, numX: 0.9, contador: { x: 0.25 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'V P VA P', alto: 'V VA V', num: 73, numX: 0.4, contador: { x: 0.32 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'P VR P VR', reja: '#3b2a20', alto: 'VA VR VA', num: 79, numX: 0.65, contador: { x: 0.39 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'P VR P VR', reja: '#3b2a20', alto: 'VA VA', num: 83, numX: 0.65, contador: { x: 0.46 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'VR P VR', reja: '#3b2a20', alto: 'V VA V', num: 87, numX: 0.45, contador: { x: 0.53 } },
      null,
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'VR P VR P', reja: '#3b2a20', alto: 'VA VA', num: 95, numX: 0.3, contador: { x: 0.67 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'V P VA', alto: 'V VA V', contador: { x: 0.74 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'VA P VA P', alto: 'VA VR VA', num: 103, numX: 0.3, contador: { x: 0.21 } },
      { pared: '#efe6c8', carp: '#3b2a20', bajo: 'VR P P VR', reja: '#3b2a20', alto: 'VA VA', num: 107, numX: 0.4, contador: { x: 0.28 } },
    ] },
    // argana_alta_066: de Felo Monzón, acera sur, pasos 1 — hoja argana_alta/argana_alta_066.jpg — antes: #e9c3a4/tienda #e9c3a4/tienda #e9c3a4/tienda
    { id: 'argana_alta_066', a: [-1977.3, -1742.5], b: [-1954.6, -1752.4], anchos: [8.3, 8.3, 8.3], altos: [6.6, 6.6, 6.6], casas: [
      null,
      { pared: '#e6c49a', carp: '#8b8f93', bajo: 'Es:1.4 Es:4', marcoEscaparate: '#efe3c4', zoc: { t: 'granito', c: '#a8a6a2', h: 0.4 }, alto: 'VB VA', barandilla: '#f4f4f2' },
      null,
    ] },
    // argana_alta_067: de Felo Monzón, acera sur, pasos 4,5,6,7,8,9,10,11,12 — hoja argana_alta/argana_alta_067.jpg — antes: #e9c3a4 #e9c3a4 #e9c3a4 #e9c3a4 #e9c3a4 #e9c3a4 #e9c3a4 #e9c3a4 #e9c3a4
    { id: 'argana_alta_067', a: [-1936.0, -1761.8], b: [-1856.4, -1800.3], anchos: [5.1, 10, 10, 10, 10, 10, 10, 10, 13.3], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#e6c49a', carp: '#8b8f93', bajo: 'T:3', alto: 'VA', zoc: { t: 'liso', c: '#7e8288', h: 1.2 } },
      { pared: '#e6c49a', carp: '#f4f4f2', bajo: 'P:1.4 P P:1.4', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#7e8288', h: 1.3 } },
      { pared: '#e6c49a', carp: '#f4f4f2', bajo: 'VC E:1.6', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#7e8288', h: 1.3 } },
      { pared: '#e6c49a', carp: '#f4f4f2', bajo: 'V E:1.6 V', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#7e8288', h: 1.3 } },
      { pared: '#e6c49a', carp: '#f4f4f2', bajo: 'VA VA E:1.6', alto: 'VB VA', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#7e8288', h: 1.3 } },
      { pared: '#e6c49a', carp: '#f4f4f2', bajo: 'V:2 V VA', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#7e8288', h: 1.3 } },
      { pared: '#e6c49a', carp: '#f4f4f2', bajo: 'VA E:1.6 V', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#7e8288', h: 1.3 }, contador: { x: 0.15 } },
      { pared: '#e6c49a', carp: '#f4f4f2', bajo: 'V V:2.2 E:1.6', alto: 'VB VB', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#7e8288', h: 1.3 } },
      { pared: '#e6c49a', carp: '#f4f4f2', bajo: 'V V:2 E:1.6', alto: 'VA VB', barandilla: '#f4f4f2', zoc: { t: 'liso', c: '#7e8288', h: 1.3 } },
    ] },
    // argana_alta_068: de Felo Monzón, acera sur, pasos 14,15,16,17,18,19 — hoja argana_alta/argana_alta_068.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_068', a: [-1849.7, -1803.0], b: [-1792.7, -1830.5], anchos: [9.5, 10, 10, 10, 10, 13.8], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'V P VR P', reja: '#2e211b', alto: 'V VB V', num: 20, numX: 0.2, contador: { x: 0.35 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VR P VA P V', reja: '#2e211b', alto: 'V VB V', num: 24, numX: 0.2, contador: { x: 0.35 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA P VA', alto: 'V VB V', num: 28, numX: 0.2, contador: { x: 0.35 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VC P VA', alto: 'V VB V', num: 32, numX: 0.2, contador: { x: 0.35 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA P VC', alto: 'V VB V', num: 36, numX: 0.2, contador: { x: 0.35 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VR P V', reja: '#2e211b', alto: 'V VB V', num: 40, numX: 0.2, contador: { x: 0.35 } },
    ] },
    // argana_alta_069: de Felo Monzón, acera sur, pasos 32,33,34,35,36,37,38,39,40 — hoja argana_alta/argana_alta_069.jpg — antes: #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96
    { id: 'argana_alta_069', a: [-1683.7, -1883.4], b: [-1605.2, -1921.9], anchos: [5.1, 10, 10, 10, 10, 10, 10, 10, 12.3], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#efd98e', carp: '#2a2a2c', bajo: 'P V:2.2 P', alto: 'V V', contador: { x: 0.5 } },
      { pared: '#efd98e', carp: '#2a2a2c', bajo: 'P V:2.4 P _', alto: 'V V', contador: { x: 0.5 } },
      { pared: '#efd98e', carp: '#2a2a2c', bajo: 'P V:2.6 P', alto: 'V V', contador: { x: 0.5 } },
      { pared: '#efd98e', carp: '#2a2a2c', bajo: 'V P _ P', alto: 'V V', contador: { x: 0.5 } },
      { pared: '#efd98e', carp: '#2a2a2c', bajo: 'V:2.4 P P V', alto: 'V V', contador: { x: 0.5 } },
      { pared: '#efd98e', carp: '#2a2a2c', bajo: 'P VR P V', alto: 'V V', contador: { x: 0.5 } },
      { pared: '#efd98e', carp: '#4a3326', bajo: 'P P V P', alto: 'V V', contador: { x: 0.5 } },
      { pared: '#efd98e', carp: '#2a2a2c', bajo: 'P V P V', alto: 'V V', contador: { x: 0.5 } },
      { pared: '#efd98e', carp: '#2a2a2c', bajo: 'V P _ V P', alto: 'V V', contador: { x: 0.5 } },
    ] },
    // argana_alta_070: Mazurca, acera este, pasos 4 — hoja argana_alta/argana_alta_070.jpg — antes: #e6d3b8
    { id: 'argana_alta_070', a: [-1803.3, -1875.9], b: [-1799.3, -1867.8], anchos: [8.9], altos: [6.6], casas: [
      null,
    ] },
    // argana_alta_071: Mazurca, acera este, pasos 6 — hoja argana_alta/argana_alta_071.jpg — antes: #e6d3b8
    { id: 'argana_alta_071', a: [-1792.9, -1855.7], b: [-1787.6, -1845.6], anchos: [11.4], altos: [6.6], casas: [
      null,
    ] },
    // argana_alta_072: Mazurca, acera este, pasos 11 — hoja argana_alta/argana_alta_072.jpg — antes: #f0dd96
    { id: 'argana_alta_072', a: [-1773.1, -1814.7], b: [-1767.7, -1803.5], anchos: [12.4], altos: [6.6], casas: [
      null,
    ] },
    // argana_alta_073: Mazurca, acera este, pasos 26,27,28,29,30 — hoja argana_alta/argana_alta_073.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_073', a: [-1698.7, -1659.5], b: [-1680.1, -1624.9], anchos: [4.5, 10, 10, 10, 8.8], altos: [4, 4, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#1f7a60', bajo: 'VR VR', ventanaAlta: true, reja: '#1f7a60', zoc: { t: 'liso', c: '#9a9ca0', h: 1.8 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f8a6a', bajo: 'P VR PD:3.2', ventanaAlta: true, reja: '#1f8a6a', zoc: { t: 'liso', c: '#9a9ca0', h: 1.8 }, cables: true },
      { pared: '#f3f1ea', carp: '#2a9aa0', bajo: 'VR P P:0.9 PD:3.4', ventanaAlta: true, reja: '#1f8a6a', zoc: { t: 'liso', c: '#9a9ca0', h: 1.8 }, cables: true, num: 2, numX: 0.35 },
      { pared: '#f3f1ea', carp: '#1f8a6a', bajo: 'PD:3 P VR P', ventanaAlta: true, reja: '#1f8a6a', zoc: { t: 'liso', c: '#9a9ca0', h: 1.8 }, cables: true },
      { pared: '#f3f1ea', carp: '#1f8a6a', bajo: 'VR VR', ventanaAlta: true, reja: '#1f8a6a', zoc: { t: 'liso', c: '#9a9ca0', h: 1.8 }, cables: true, contador: { x: 0.05 } },
    ] },
    // argana_alta_074: Mazurca, acera oeste, pasos 8,9 — hoja argana_alta/argana_alta_074.jpg — antes: #efe6c8 #efe6c8
    { id: 'argana_alta_074', a: [-1792.6, -1830.5], b: [-1787.1, -1818.9], anchos: [6, 6.9], altos: [6.6, 6.6], casas: [
      null,
      { pared: '#efe8dc', carp: '#222222', bajo: 'PD:1.6' },
    ] },
    // argana_alta_075: Mazurca, acera oeste, pasos 32 — hoja argana_alta/argana_alta_075.jpg — antes: #f1eee7
    { id: 'argana_alta_075', a: [-1687.7, -1607.9], b: [-1683.0, -1598.8], anchos: [10.3], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA VA:0.8 VA', alto: 'B VA', barandilla: '#222222', contador: { x: 0.85 } },
    ] },
    // argana_alta_076: Mazurca, acera oeste, pasos 35,36 — hoja argana_alta/argana_alta_076.jpg — antes: #f1eee7/tienda #f1eee7/tienda
    { id: 'argana_alta_076', a: [-1675.4, -1584.4], b: [-1663.6, -1561.5], anchos: [13.1, 12.6], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#5a3a2a', bajo: 'VR:2.2 VR:2.6', ventanaAlta: true, reja: '#5a3a2a', franja: { c: '#d6323a', y: 3.1, h: 0.55 }, esq: { c: '#4a4a4c', lados: [0, 1] } },
      { pared: '#f3f1ea', carp: '#5a3a2a', bajo: 'VR:2.4 VR:2.4 Es:1.8', ventanaAlta: true, reja: '#5a3a2a', marcoEscaparate: '#4a4a4c', franja: { c: '#d6323a', y: 3.1, h: 0.55 }, esq: { c: '#4a4a4c', lados: [0, 1] } },
    ] },
    // argana_alta_077: de Santiago Amón, acera sur, pasos 4,5,6,7,8,9,10,11,12,13,14,15,16,17 — hoja argana_alta/argana_alta_077.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_077', a: [-1734.4, -1998.8], b: [-1838.3, -1952.9], anchos: [4.5, 10, 10, 9.9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11.1], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VA P VA PA', alto: 'VA VB VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 }, num: 72, numX: 0.35 },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VA PA VA P', alto: 'VA VA VB', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 }, num: 68, numX: 0.3 },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA P VA', alto: 'VA VB VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 }, num: 64, numX: 0.1 },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VA P VC', alto: 'VA VB VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VC P VA PA', alto: 'VA VB VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VA P VR P', reja: '#2e211b', alto: 'VB VA VR', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA P VC', alto: 'VA VB VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 }, num: 38, numX: 0.6 },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VR P VA', reja: '#2e211b', alto: 'VA VB VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'PA VR P VA', reja: '#2e211b', alto: 'VA VB', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA PA', alto: 'VA VB VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 }, num: 26, numX: 0.1 },
      { pared: '#e8d0c0', carp: '#2e211b', bajo: 'VC P VA P', alto: 'VA VB VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 }, num: 22, numX: 0.3 },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA P', alto: 'VA VB VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 }, num: 20, numX: 0.1 },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'VC P VA', alto: 'VA VB VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 }, num: 18, numX: 0.45 },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: 'P VA PA', alto: 'VA VA', zoc: { t: 'liso', c: '#b5653e', h: 0.15 }, contador: { x: 0.3 } },
    ] },
  ],
};
