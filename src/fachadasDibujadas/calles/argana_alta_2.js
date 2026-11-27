/**
 * Fachadas dibujadas: argana_alta, tanda 2 (50 tramos de
 * src/barrios/compartido/fachadasCasa.js). Cada casa se describe mirando la hoja de fotos de su tramo
 * (carpeta _trabajo_fachadas); null = no se dibuja. Método: skill lava-game-fachadas.
 */

const AMARILLO = '#ecd896', BLANCO = '#f3f1ea', CREMA = '#efe3c4', BEIS = '#e6d3b8';
const MARRON = '#4a2c1f', MARRON_OSC = '#2e211b', VERDE = '#1f7a45', BLANCA = '#f4f4f2', ALU = '#8b8f93';
const REPISA = { c: '#4a2c1f', y: 2.8, h: 0.08 };

export default {
  nombre: 'argana_alta 2',
  aceras: [
    // argana_alta_078: de Santiago Amón, acera norte, pasos 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17 — hoja argana_alta/argana_alta_078.jpg — antes: #f0dd96 #f0dd96 #f1eee7 #f1eee7 #f0dd96 #efe6c8 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f1eee7 #f0dd96 #f0dd96 #f1eee7 #f0dd96 #f1eee7 #f0dd96 #f1eee7
    { id: 'argana_alta_078', a: [-1701.1, -2022.6], b: [-1805.3, -1976.6], anchos: [12.5, 5, 5, 5, 5, 5, 5, 9.9, 10, 10, 10, 10, 10, 10, 5, 5, 5, 5, 5, 5, 2.2, 2.2], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'VR V V P', alto: 'V V V', franja: REPISA, cables: true, contador: { x: 0.15 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'PA', alto: 'VA', contador: { x: 0.8 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'PA', alto: 'V', franja: REPISA },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'VR', alto: 'V', franja: REPISA },
      { pared: AMARILLO, carp: MARRON, bajo: 'P _', alto: 'VA', contador: { x: 0.8 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'V', alto: 'V', zoc: { t: 'liso', c: '#c9c6bf', h: 0.3 } },
      { pared: AMARILLO, carp: '#7a4a2a', bajo: 'P', alto: 'V', contador: { x: 0.4 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:2.4 PA', alto: 'V V', franja: REPISA, contador: { x: 0.8 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'P V V:2.4', alto: 'V V', franja: REPISA, contador: { x: 0.15 } },
      { pared: AMARILLO, carp: MARRON, bajo: 'V:2.4 _ P', alto: 'V V', franja: REPISA },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V V:2.4', alto: 'V V', franja: REPISA },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'P _ V', alto: 'V V', contador: { x: 0.3 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'PA _ V:2.4', alto: 'V V', franja: REPISA },
      { pared: AMARILLO, carp: '#9a7b55', bajo: 'V _ P', alto: 'V V', contador: { x: 0.6 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'V:2.4', alto: 'V' },
      { pared: AMARILLO, carp: MARRON, bajo: '_ P', alto: 'VA', contador: { x: 0.3 } },
      { pared: AMARILLO, carp: MARRON, bajo: 'P _', alto: 'VA' },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'P VR', alto: 'V' },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'PA V:2.4', alto: 'V', franja: REPISA },
      { pared: BLANCO, carp: '#7a4a2a', bajo: 'P', alto: 'V' },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'PA' },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'VR' },
    ] },
    // argana_alta_079: de Agustina Ayala, acera norte, pasos 7,8,9,10,11,12,13,14 — hoja argana_alta/argana_alta_079.jpg — antes: #e2c079 #f0dd96 #f1eee7 #f0dd96 #f0dd96 #f0dd96 #f1eee7 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f1eee7 #f0dd96 #f0dd96 #f0dd96 #f1eee7 #f1eee7
    { id: 'argana_alta_079', a: [-1786.8, -2007.6], b: [-1714.8, -2039.9], anchos: [4.5, 6.2, 6.2, 8.2, 8.2, 8.2, 13.1, 13.1, 9.4, 9.4, 9.3, 9.3, 7.9, 7.9, 7.9, 9.7, 9.7], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      null,
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V _ P', alto: 'V', franja: REPISA, contador: { x: 0.75 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: '_ P', alto: 'V VA', zoc: { t: 'liso', c: '#e9e7e2', h: 0.3 }, contador: { x: 0.3 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'PA VR:2.6', alto: 'V V', zoc: { t: 'piedra', c: '#6b5a4a', junta: '#c9b59a', h: 0.3 }, franja: REPISA },
      { pared: BLANCO, carp: MARRON, bajo: 'P _', alto: 'VA:3', contador: { x: 0.8 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'P _', alto: 'V' },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:2.4 VR V:2.4', alto: 'V V', zoc: { t: 'liso', c: '#8a6a55', h: 1.0 }, franja: REPISA },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'P _ V:2.4 V:2.4', alto: 'V V', franja: REPISA, contador: { x: 0.95 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'V:2.4 VR _ P', alto: 'V V', franja: REPISA },
      { pared: BLANCO, carp: MARRON, bajo: 'P V', alto: 'V', contador: { x: 0.2 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'P', alto: 'VA', zoc: { t: 'piedra', c: '#8a6f5a', junta: '#cdb89c', h: 3.0 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:2.4 P', alto: 'V V', franja: REPISA },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'P V:2.4', alto: 'V', franja: REPISA },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'VR _ V:2.4', alto: 'V' },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:2.4 VR', alto: 'V V', franja: REPISA },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'P VR', alto: 'V V' },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'VR V', alto: 'V' },
    ] },
    // argana_alta_080: de Agustina Ayala, acera sur, pasos 7,8,9,10,11,12,13,14 — hoja argana_alta/argana_alta_080.jpg — antes: #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f1eee7
    { id: 'argana_alta_080', a: [-1849.6, -1970.1], b: [-1780.4, -2001.2], anchos: [7.9, 12.3, 8.2, 8.2, 8.2, 8.7, 8.7, 8.7, 9.4, 9.4, 9.3, 9.3, 7.9, 7.9, 7.9, 4.5], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:2.4', alto: 'V', franja: REPISA },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'P V:2.4', alto: 'V V', franja: REPISA, contador: { x: 0.1 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'PA', alto: 'V', contador: { x: 0.5 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:3 PA', alto: 'V V', franja: REPISA },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:3 VR P', alto: 'V V', franja: REPISA, zoc: { t: 'liso', c: '#b5553a', h: 0.2 }, contador: { x: 0.9 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:3 VR P', alto: 'V', franja: REPISA, zoc: { t: 'liso', c: '#b5553a', h: 0.2 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: '_ _ P', alto: 'V V', contador: { x: 0.7 } },
      { pared: AMARILLO, carp: '#3a2a20', bajo: '_ _ P', alto: 'V', franja: REPISA },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:2.4 PA', alto: 'V V', franja: REPISA },
      { pared: AMARILLO, carp: '#7a3e2a', bajo: 'V:2.4 P', alto: 'V', contador: { x: 0.9 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'P V:2.4', alto: 'V V', franja: REPISA },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'VR P', alto: 'V V' },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'P V:2.4', alto: 'V', franja: REPISA },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'P VR', alto: 'V V' },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V V', alto: 'V', franja: REPISA, zoc: { t: 'liso', c: '#9a5a3a', h: 0.9 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'P _', alto: 'V', zoc: { t: 'liso', c: '#b5553a', h: 0.2 }, contador: { x: 0.15 } },
    ] },
    // argana_alta_081: Zaranda, acera norte, pasos 7,8,9,10,11 — hoja argana_alta/argana_alta_081.jpg — antes: #ece8e0 #9d9890 #9d9890 #f1eee7 #f1eee7/solar
    { id: 'argana_alta_081', a: [-2122.1, -1916.4], b: [-2157.9, -1904.4], anchos: [6.5, 10, 10, 10, 4.5], altos: [4, 4, 4, 4, 0], casas: [
      { pared: '#e8e2d8', carp: MARRON_OSC, bajo: 'V:2', zoc: { t: 'liso', c: '#9a6a4a', h: 1.0 }, cables: true, contador: { x: 0.3 } },
      { pared: '#9d9890', carp: '#5a3a2a', bajo: 'V:2.2 _', zoc: { t: 'granito', c: '#8e8e8c', h: 0.9 } },
      { pared: '#9d9890', carp: '#5a3a2a', bajo: 'V:2 M:2.4', marcoPersiana: '#d8d8d4', zoc: { t: 'granito', c: '#8e8e8c', h: 0.7 } },
      { pared: '#ece9e2', carp: '#7a4a33', bajo: '_ VR:2.4 _', reja: '#7a4a33' },
      null,
    ] },
    // argana_alta_082: De Claudio Toledo Cabrera, acera norte, pasos 1,2,3,4,5,6,7,8,9,10,11 — hoja argana_alta/argana_alta_082.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #e9c3a4 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_082', a: [-1680.3, -1624.9], b: [-1572.7, -1682.3], anchos: [9.2, 9.2, 10, 10, 10, 10, 10, 10, 10, 10, 10, 13.6], altos: [6.6, 6.6, 4, 6.6, 6.6, 4, 6.6, 6.6, 6.6, 4, 4, 4], casas: [
      { pared: BLANCO, carp: '#1f7a6a', bajo: 'M:3.4 _', persiana: '#1f7a6a', marcoPersiana: '#1f7a6a', alto: 'VR', zoc: { t: 'liso', c: '#a9abad', h: 1.0 }, cables: true },
      { pared: BLANCO, carp: '#1f7a6a', bajo: 'P _ P', alto: 'VR VA', zoc: { t: 'liso', c: '#a9abad', h: 1.0 }, cables: true, contador: { x: 0.1 } },
      { pared: BLANCO, carp: '#2a2a2a', bajo: 'V P M:3', marcoPersiana: '#c9c9c6', zoc: { t: 'liso', c: '#3a3a3a', h: 0.3 }, num: 33, numX: 0.45, cables: true },
      { pared: '#9b4f3a', carp: BLANCA, bajo: '_ PD:3.2 _', cables: true },
      { pared: '#e9dccd', carp: BLANCA, bajo: 'VR P VR V', alto: 'B VA', zoc: { t: 'granito', c: '#8a8a88', h: 1.2 }, num: 39, numX: 0.35 },
      { pared: BLANCO, carp: '#1d6b3a', bajo: 'P M:3.4', persiana: '#1d6b3a', marcoPersiana: '#1d6b3a', alto: 'VA', cables: true, contador: { x: 0.12 } },
      { pared: BLANCO, carp: '#7a4a2e', bajo: 'P G:3', alto: 'VA', num: 43, numX: 0.3, cables: true, contador: { x: 0.45 } },
      { pared: BLANCO, carp: MARRON, bajo: 'V M:3 P', marcoPersiana: '#e0ded8', alto: 'B VA', zoc: { t: 'liso', c: '#5a5652', h: 0.3 }, num: 47, numX: 0.9, cables: true },
      { pared: BLANCO, carp: '#e8e6e0', bajo: 'M:2.8 G P', marcoPersiana: '#d8d8d4', alto: 'VA', zoc: { t: 'piedra', c: '#3e3a36', h: 1.0 }, cables: true },
      { pared: BLANCO, carp: '#5a3a2a', bajo: 'P V V', zoc: { t: 'liso', c: '#a9abad', h: 0.5 }, cables: true, contador: { x: 0.9 } },
      { pared: '#e6e0d2', carp: '#b9a27a', bajo: '_ G _', zoc: { t: 'bloque', c: '#d8d2c4', h: 0.4 }, cables: true },
      { pared: BLANCO, carp: '#1f6e3e', bajo: 'P V V', zoc: { t: 'granito', c: '#4a4a4a', h: 1.8 }, num: 55, numX: 0.05, cables: true, contador: { x: 0.2 } },
    ] },
    // argana_alta_083: De Claudio Toledo Cabrera, acera norte, pasos 12,13,14,15,16,17,18,19 — hoja argana_alta/argana_alta_083.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7/solar #f1eee7 #f1eee7/solar #f1eee7/solar #f1eee7 #f1eee7
    { id: 'argana_alta_083', a: [-1572.7, -1682.3], b: [-1508.2, -1717.2], anchos: [6.4, 10, 10, 10, 10, 10, 5, 5, 7], altos: [6.6, 6.6, 4, 0, 6.6, 0, 0, 6.6, 6.6], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: 'P VR', alto: 'VA VA', num: 59, numX: 0.3, cables: true, contador: { x: 0.55 } },
      { pared: BLANCO, carp: BLANCA, bajo: 'M:1.6 P P VR', marcoPersiana: '#f4f4f2', alto: 'VA VA', num: 59, numX: 0.5, cables: true, contador: { x: 0.8 } },
      { pared: BLANCO, carp: VERDE, bajo: 'P VC:2', num: 61, numX: 0.4, cables: true, contador: { x: 0.85 } },
      null,
      { pared: BLANCO, carp: '#6b3f22', bajo: 'PD:3', alto: 'B', esq: { c: '#7a7570', t: 'sillares', lados: [0, 1] }, barandilla: '#2a2a2a' },
      null,
      null,
      { pared: BLANCO, carp: '#3a2a20', bajo: '_ M:3.2', persiana: '#3a2a20', marcoPersiana: '#3a2a20', alto: 'VA', cables: true },
      { pared: BLANCO, carp: '#3a2a20', bajo: 'P M:3.6', persiana: '#3a2a20', marcoPersiana: '#3a2a20', alto: 'V VA', num: 65, numX: 0.08, cables: true },
    ] },
    // argana_alta_084: De Claudio Toledo Cabrera, acera sur, pasos 8 — hoja argana_alta/argana_alta_084.jpg — antes: #e2c079
    { id: 'argana_alta_084', a: [-1605.7, -1650.1], b: [-1600.6, -1652.8], anchos: [5.8], altos: [6.6], casas: [
      { pared: '#e8d39a', carp: '#2f5a4a', bajo: '_ V:1.4', alto: '_ V', franja: { c: '#d9c182', y: 1.2, h: 0.06 } },
    ] },
    // argana_alta_085: De Claudio Toledo Cabrera, acera sur, pasos 10 — hoja argana_alta/argana_alta_085.jpg — antes: #e2c079
    { id: 'argana_alta_085', a: [-1587.8, -1659.9], b: [-1582.5, -1662.7], anchos: [6], altos: [6.6], casas: [
      null,
    ] },
    // argana_alta_086: De Claudio Toledo Cabrera, acera sur, pasos 12 — hoja argana_alta/argana_alta_086.jpg — antes: #e2c079
    { id: 'argana_alta_086', a: [-1569.8, -1669.7], b: [-1564.3, -1672.7], anchos: [6.3], altos: [6.6], casas: [
      null,
    ] },
    // argana_alta_087: De Claudio Toledo Cabrera, acera sur, pasos 18 — hoja argana_alta/argana_alta_087.jpg — antes: #e2c079
    { id: 'argana_alta_087', a: [-1510.5, -1693.2], b: [-1505.1, -1696.1], anchos: [6.1], altos: [6.6], casas: [
      null,
    ] },
    // argana_alta_088: De Claudio Toledo Cabrera, acera sur, pasos 20 — hoja argana_alta/argana_alta_088.jpg — antes: #e2c079
    { id: 'argana_alta_088', a: [-1492.1, -1702.8], b: [-1487.0, -1705.6], anchos: [5.8], altos: [6.6], casas: [
      null,
    ] },
    // argana_alta_089: de Miguel Hernández, acera sur, pasos 3 — hoja argana_alta/argana_alta_089.jpg — antes: #f1eee7
    { id: 'argana_alta_089', a: [-2070.8, -1881.2], b: [-2081.6, -1877.4], anchos: [11.5], altos: [6.6], casas: [
      { pared: '#efece4', carp: BLANCA, bajo: '_ VR:2.4 _ P', alto: 'B VA', zoc: { t: 'liso', c: '#9a6a4a', h: 1.1 }, barandilla: '#f4f4f2', reja: '#f4f4f2' },
    ] },
    // argana_alta_090: Torriani, acera norte, pasos 1 — hoja argana_alta/argana_alta_090.jpg — antes: #f1eee7 #f1eee7
    { id: 'argana_alta_090', a: [-1538.4, -1509.0], b: [-1523.4, -1517.0], anchos: [8.5, 8.5], altos: [6.6, 6.6], casas: [
      { pared: BLANCO, carp: '#1f5a3a', bajo: '_ PD:3', alto: 'V V', contador: { x: 0.12 } },
      { pared: BLANCO, carp: '#1f5a3a', bajo: 'VR P VR', alto: 'V V' },
    ] },
    // argana_alta_091: Torriani, acera norte, pasos 3,4 — hoja argana_alta/argana_alta_091.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_091', a: [-1491.6, -1534.5], b: [-1471.7, -1545.2], anchos: [7.9, 7.9, 6.8], altos: [6.6, 6.6, 6.6], casas: [
      { pared: BLANCO, carp: '#7a4a30', bajo: '_ PD:3 _', alto: 'V V', contador: { x: 0.85 } },
      { pared: BLANCO, carp: '#2f6a4a', bajo: '_ _ VR', alto: 'V V', contador: { x: 0.3 } },
      { pared: BLANCO, carp: '#6b5040', bajo: '_ PD:2.4', alto: 'V VR' },
    ] },
    // argana_alta_092: Torriani, acera norte, pasos 5 — hoja argana_alta/argana_alta_092.jpg — antes: #f1eee7
    { id: 'argana_alta_092', a: [-1465.0, -1548.7], b: [-1455.8, -1553.6], anchos: [10.5], altos: [6.6], casas: [
      { pared: BLANCO, carp: '#1f6a3a', bajo: '_ G:3.6 _', alto: 'V V V', zoc: { t: 'piedra', c: '#8a8580', junta: '#d8d4cc', h: 1.0 }, num: 31, numX: 0.4, contador: { x: 0.85 } },
    ] },
    // argana_alta_093: Torriani, acera norte, pasos 7 — hoja argana_alta/argana_alta_093.jpg — antes: #f1eee7 #f1eee7
    { id: 'argana_alta_093', a: [-1446.0, -1560.1], b: [-1429.5, -1569.2], anchos: [9.4, 9.4], altos: [6.6, 6.6], casas: [
      { pared: BLANCO, carp: '#1f6a3a', bajo: 'PD:3.8 _', alto: 'V V V' },
      { pared: BLANCO, carp: '#3a2a22', bajo: 'PD:3 _', alto: 'V V', zoc: { t: 'piedra', c: '#6e6a66', junta: '#bdb8b0', h: 1.2 } },
    ] },
    // argana_alta_094: Torriani, acera norte, pasos 12 — hoja argana_alta/argana_alta_094.jpg — antes: #f1eee7
    { id: 'argana_alta_094', a: [-1370.5, -1601.5], b: [-1362.2, -1606.1], anchos: [9.4], altos: [6.6], casas: [
      { pared: BLANCO, carp: '#1f6a4a', bajo: '_ _ _', alto: 'V V B', zoc: { t: 'liso', c: '#8a5a44', h: 1.2 }, barandilla: '#2f6a5a', contador: { x: 0.05 } },
    ] },
    // argana_alta_095: de Alonso Quesada, acera este, pasos 1,2 — hoja argana_alta/argana_alta_095.jpg — antes: #f1eee7/tienda #f1eee7/tienda #f1eee7
    { id: 'argana_alta_095', a: [-1972.4, -2037.3], b: [-1963.8, -2008.6], anchos: [9.9, 9.9, 10.1], altos: [4, 4, 4], casas: [
      { pared: BLANCO, carp: '#d8d8d4', bajo: 'G:3 _', num: 24, numX: 0.1, cables: true },
      { pared: BLANCO, carp: MARRON_OSC, bajo: 'V:2.2 _ Es:2', marcoEscaparate: BLANCA, cables: true },
      { pared: BLANCO, carp: ALU, bajo: '_ _ _', zoc: { t: 'liso', c: '#8a4a34', h: 1.2 }, cables: true, contador: { x: 0.1 } },
    ] },
    // argana_alta_096: de Alonso Quesada, acera oeste, pasos 3 — hoja argana_alta/argana_alta_096.jpg — antes: #dd7d70
    { id: 'argana_alta_096', a: [-1966.1, -1989.2], b: [-1970.9, -1995.4], anchos: [7.8], altos: [4], casas: [
      null,
    ] },
    // argana_alta_097: de Alonso Quesada, acera oeste, pasos 1,2 — hoja argana_alta/argana_alta_097.jpg — antes: #f1eee7 #f1eee7
    { id: 'argana_alta_097', a: [-1978.9, -2025.0], b: [-1972.8, -2004.7], anchos: [10, 11.2], altos: [4, 4], casas: [
      { pared: BLANCO, carp: VERDE, bajo: 'V V P', num: 5, numX: 0.85, contador: { x: 0.8 } },
      { pared: BLANCO, carp: '#d6d2c8', bajo: '_ M:3 _', marcoPersiana: '#e8e6e0' },
    ] },
    // argana_alta_098: de Gabriel Celaya, acera este, pasos 1 — hoja argana_alta/argana_alta_098.jpg — antes: #f0dd96 #f0dd96
    { id: 'argana_alta_098', a: [-2258.8, -2081.8], b: [-2254.8, -2063.5], anchos: [9.4, 9.4], altos: [6.6, 6.6], casas: [
      { pared: '#efe0b0', carp: BLANCA, bajo: '_ P VC _', alto: 'V V', zoc: { t: 'piedra', c: '#34302d', h: 1.6 }, contador: { x: 0.2 } },
      { pared: '#efe0b0', carp: '#2a2a2a', bajo: 'P VC', alto: 'V V', zoc: { t: 'piedra', c: '#34302d', h: 1.6 }, reja: '#2a2a2a' },
    ] },
    // argana_alta_099: de Gabriel Celaya, acera oeste, pasos 1 — hoja argana_alta/argana_alta_099.jpg — antes: #f0dd96 #f0dd96
    { id: 'argana_alta_099', a: [-2269.7, -2082.0], b: [-2265.2, -2061.2], anchos: [10.6, 10.6], altos: [6.6, 6.6], casas: [
      { pared: '#ecdcb4', carp: BLANCA, bajo: 'G V', alto: 'B VA', zoc: { t: 'piedra', c: '#3a3633', h: 0.9 }, barandilla: '#222' },
      { pared: '#ecdcb4', carp: BLANCA, bajo: 'G V', alto: 'VA B', zoc: { t: 'piedra', c: '#3a3633', h: 0.9 }, barandilla: '#222', contador: { x: 0.55 } },
    ] },
    // argana_alta_100: de Palacio Valdés, acera oeste, pasos 2,3 — hoja argana_alta/argana_alta_100.jpg — antes: #efe6c8 #f1eee7
    { id: 'argana_alta_100', a: [-1818.5, -1428.8], b: [-1830.2, -1442.1], anchos: [9, 8.7], altos: [6.6, 4], casas: [
      { pared: BLANCO, carp: '#c47c7c', bajo: 'VR:1 _ VR:1 _ M:3.4', persiana: '#c47c7c', marcoPersiana: '#b0605e', alto: 'VB VB VB', franja: { c: '#a0605a', y: 3.0, h: 0.15 }, zoc: { t: 'piedra', c: '#5a4a40', junta: '#cfc2b0', h: 0.6 }, reja: '#5a3a2a', barandilla: BLANCA },
      { pared: BLANCO, carp: '#c47c7c', bajo: 'M:3.6 M:3.6', persiana: '#c47c7c', marcoPersiana: '#b0605e', zoc: { t: 'piedra', c: '#5a4a40', junta: '#cfc2b0', h: 0.4 } },
    ] },
    // argana_alta_101: de Palacio Valdés, acera oeste, pasos 4,5 — hoja argana_alta/argana_alta_101.jpg — antes: #f1eee7 #efe6c8 #efe6c8
    { id: 'argana_alta_101', a: [-1831.3, -1443.7], b: [-1848.9, -1463.9], anchos: [12.6, 7.1, 7.1], altos: [6.6, 6.6, 6.6], casas: [
      { pared: BLANCO, carp: BLANCA, bajo: 'P _ M:2.2', marcoPersiana: '#e8e8e4', alto: '_', contador: { x: 0.45 } },
      { pared: '#e8d2ae', carp: BLANCA, bajo: 'P M:3', marcoPersiana: '#6e6e6e', alto: 'VR', reja: BLANCA },
      { pared: '#e8d2ae', carp: BLANCA, bajo: 'P', alto: 'VR', reja: BLANCA, num: 5, numX: 0.5, contador: { x: 0.2 } },
    ] },
    // argana_alta_102: de Palacio Valdés, acera sur, pasos 6,7,8 — hoja argana_alta/argana_alta_102.jpg — antes: #efe6c8 #9d9890 #9d9890 #f1eee7
    { id: 'argana_alta_102', a: [-1860.7, -1478.9], b: [-1885.1, -1497.0], anchos: [9.2, 7.3, 7.3, 6.6], altos: [6.6, 4, 4, 4], casas: [
      { pared: '#e6d3b8', carp: BLANCA, bajo: 'P _ VC', alto: 'B', zoc: { t: 'granito', c: '#8e8a86', h: 1.3 }, barandilla: BLANCA, contador: { x: 0.1 } },
      null,
      { pared: 'bloque', carp: '#8f949a', bajo: 'VR:1 M:4', persiana: '#9aa0a6', marcoPersiana: '#7a7e82', reja: '#6b4a33' },
      { pared: BLANCO, carp: ALU, bajo: 'VR:1 _ _', num: 13, numX: 0.9 },
    ] },
    // argana_alta_103: el Fausto, acera oeste, pasos 1,2 — hoja argana_alta/argana_alta_103.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_103', a: [-2080.9, -1358.6], b: [-2063.1, -1397.5], anchos: [8.2, 8.2, 8.2, 9.1, 9.1], altos: [6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      null,
      { pared: BLANCO, carp: ALU, bajo: '_ _', alto: '_', contador: { x: 0.65 }, cables: true },
      null,
      null,
      { pared: BLANCO, carp: '#2f6a4a', bajo: '_ M:4', persiana: '#2f6a4a', marcoPersiana: '#2f6a4a', alto: '_', cables: true },
    ] },
    // argana_alta_104: el Fausto, acera este, pasos 3 — hoja argana_alta/argana_alta_104.jpg — antes: #f1eee7
    { id: 'argana_alta_104', a: [-2046.7, -1406.1], b: [-2051.7, -1395.2], anchos: [12], altos: [6.6], casas: [
      { pared: BLANCO, carp: '#2a6ab0', bajo: '_ _ M:3.8', persiana: '#2a6ab0', marcoPersiana: '#2a6ab0', alto: '_', zoc: { t: 'liso', c: '#3a6aa8', h: 1.2 } },
    ] },
    // argana_alta_105: el Fausto, acera oeste, pasos 4,5,6 — hoja argana_alta/argana_alta_105.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_105', a: [-2050.9, -1424.8], b: [-2032.3, -1465.3], anchos: [11.1, 12.4, 10.5, 10.5], altos: [6.6, 6.6, 6.6, 6.6], casas: [
      { pared: BLANCO, carp: '#2f5a4a', bajo: '_ _', alto: '_ VR', reja: '#2f5a4a' },
      { pared: BLANCO, carp: '#2f5a4a', bajo: '_ VR _', alto: '_', ventanaAlta: true, reja: '#2f5a4a' },
      { pared: BLANCO, carp: '#2f5a4a', bajo: 'VR _ VR', ventanaAlta: true, alto: '_ VR', reja: '#2f5a4a', cables: true },
      { pared: BLANCO, carp: '#2f5a4a', bajo: '_ VR', alto: '_', ventanaAlta: true, reja: '#2f5a4a' },
    ] },
    // argana_alta_106: el Fausto, acera este, pasos 1,2 — hoja argana_alta/argana_alta_106.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_106', a: [-2065.2, -1366.8], b: [-2053.2, -1393.0], anchos: [10.7, 9.1, 9.1], altos: [6.6, 6.6, 6.6], casas: [
      null,
      null,
      { pared: BLANCO, carp: BLANCA, bajo: '_ _', alto: '_ VR', zoc: { t: 'liso', c: '#3a6aa8', h: 1.3 } },
    ] },
    // argana_alta_107: el Fausto, acera oeste, pasos 3 — hoja argana_alta/argana_alta_107.jpg — antes: #f1eee7
    { id: 'argana_alta_107', a: [-2057.1, -1410.9], b: [-2062.1, -1400.0], anchos: [12], altos: [6.6], casas: [
      { pared: BLANCO, carp: '#8fb2d8', bajo: 'P:1.2 _ M:3.6 _ _', persiana: '#8fb2d8', marcoPersiana: '#d8dde2', alto: '_', contador: { x: 0.85 } },
    ] },
    // argana_alta_108: el Fausto, acera este, pasos 4,5,6 — hoja argana_alta/argana_alta_108.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_108', a: [-2040.1, -1419.9], b: [-2022.8, -1457.7], anchos: [11.1, 12.4, 9, 9], altos: [6.6, 6.6, 6.6, 6.6], casas: [
      { pared: BLANCO, carp: '#2a6ab0', bajo: 'M:2.4 _ _', persiana: '#2a6ab0', marcoPersiana: '#2a6ab0', alto: '_ VR _', reja: '#6b6b6b', zoc: { t: 'liso', c: '#3a6aa8', h: 1.3 }, cables: true },
      { pared: BLANCO, carp: '#6b6b6b', bajo: '_ _ _', alto: '_ VR _', zoc: { t: 'liso', c: '#3a6aa8', h: 1.3 }, cables: true },
      { pared: BLANCO, carp: '#6b6b6b', bajo: '_ _', alto: 'VR _ _', zoc: { t: 'liso', c: '#3a6aa8', h: 1.3 }, cables: true },
      null,
    ] },
    // argana_alta_109: Sirinoque, acera oeste, pasos 5 — hoja argana_alta/argana_alta_109.jpg — antes: #e2c079 #e2c079
    { id: 'argana_alta_109', a: [-1592.2, -1799.5], b: [-1598.9, -1813.6], anchos: [7.8, 7.8], altos: [4, 4], casas: [
      null,
      { pared: BLANCO, carp: BLANCA, bajo: 'PD:2.6 _', reja: BLANCA, cables: true },
    ] },
    // argana_alta_110: de la Gloria Fuertes, acera este, pasos 4 — hoja argana_alta/argana_alta_110.jpg — antes: #e4cfc9
    { id: 'argana_alta_110', a: [-2107.7, -1971.5], b: [-2103.6, -1959.5], anchos: [12.7], altos: [6.6], casas: [
      { pared: '#e2cdd0', carp: '#2f5a44', bajo: 'M:2.4 _ VR:2 _', persiana: '#2f5a44', marcoPersiana: '#2f5a44', alto: '_', ventanaAlta: true, reja: ALU },
    ] },
    // argana_alta_111: de la Gloria Fuertes, acera este, pasos 2,3 — hoja argana_alta/argana_alta_111.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_111', a: [-2118.5, -2004.3], b: [-2107.0, -1970.4], anchos: [8.9, 8.9, 9, 9], altos: [4, 4, 4, 4], casas: [
      { pared: '#dcb69c', carp: '#4a3a2e', bajo: 'P B:2.2 V:0.7', barandilla: '#3a2e24', zoc: { t: 'liso', c: '#c9a58a', h: 0.4 } },
      { pared: '#dcb69c', carp: '#4a3a2e', bajo: 'P:1.1 B:2 V:0.7', barandilla: '#3a2e24', zoc: { t: 'liso', c: '#c9a58a', h: 0.4 }, contador: { x: 0.92 } },
      { pared: '#dcb69c', carp: '#3e3026', bajo: 'P B:2.2 _ V:0.7', barandilla: '#3a2e24', zoc: { t: 'liso', c: '#c9a58a', h: 0.4 } },
      { pared: '#dcb69c', carp: '#4a3a2e', bajo: 'P:1.2 B:2.2 V:0.7', barandilla: '#3a2e24', zoc: { t: 'liso', c: '#c9a58a', h: 0.4 }, contador: { x: 0.9 } },
    ] },
    // argana_alta_112: Seguidilla, acera sur, pasos 1,2,3 — hoja argana_alta/argana_alta_112.jpg — antes: #e9c3a4 #e9c3a4 #e9c3a4 #a9abad #a9abad #a9abad
    { id: 'argana_alta_112', a: [-1464.3, -1940.7], b: [-1511.9, -1917.1], anchos: [8.2, 8.2, 8.2, 9.5, 9.5, 9.5], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#dcb98c', carp: BLANCA, bajo: 'P:1.2 _ VA:2.4', alto: 'VA VA', zoc: { t: 'granito', c: '#7e8b86', h: 1.6 } },
      { pared: '#dcb98c', carp: BLANCA, bajo: 'VA:2.4 VA', alto: 'VA B', zoc: { t: 'granito', c: '#7e8b86', h: 1.6 } },
      { pared: '#d9cbb6', carp: BLANCA, bajo: 'P VA:2.4', alto: 'VA VA', zoc: { t: 'granito', c: '#7e8b86', h: 1.6 }, num: 126, numX: 0.15, contador: { x: 0.05 } },
      { pared: '#d9cbb6', carp: BLANCA, bajo: 'VA:2.4 _ VA:2.4', alto: 'VA:2.4 VA', zoc: { t: 'granito', c: '#7e8b86', h: 1.6 } },
      { pared: '#d9cbb6', carp: BLANCA, bajo: 'VA:2.4 VA:2.4', alto: 'VA VA', zoc: { t: 'granito', c: '#7e8b86', h: 1.6 }, contador: { x: 0.1 } },
      { pared: '#d9cbb6', carp: BLANCA, bajo: 'VA:2.4 P', alto: 'VA VA', zoc: { t: 'granito', c: '#7e8b86', h: 1.6 } },
    ] },
    // argana_alta_113: Seguidilla, acera sur, pasos 8 — hoja argana_alta/argana_alta_113.jpg — antes: #e2c079
    { id: 'argana_alta_113', a: [-1548.0, -1899.6], b: [-1554.5, -1896.4], anchos: [7.3], altos: [4], casas: [
      { pared: '#e7cf9e', carp: '#1e1e1e', bajo: 'M:3 P:1.3 _', marcoPersiana: '#e8e6e0', contador: { x: 0.48 }, reja: '#1e1e1e', barandilla: BLANCA },
    ] },
    // argana_alta_114: Seguidilla, acera norte, pasos 13,14 — hoja argana_alta/argana_alta_114.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'argana_alta_114', a: [-1615.1, -1876.9], b: [-1643.1, -1863.1], anchos: [7.8, 7.8, 7.8, 7.8], altos: [4, 4, 4, 4], casas: [
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:2 P _ _', contador: { x: 0.25 } },
      { pared: BLANCO, carp: MARRON_OSC, bajo: '_ _ P', contador: { x: 0.9 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V VR V PA', zoc: { t: 'liso', c: '#b5553a', h: 0.2 } },
      { pared: AMARILLO, carp: MARRON_OSC, bajo: 'V:2 P', contador: { x: 0.15 } },
    ] },
    // argana_alta_115: Seguidilla, acera norte, pasos 18,19,20 — hoja argana_alta/argana_alta_115.jpg — antes: #e9c3a4 #e9c3a4 #e9c3a4 #e9c3a4
    { id: 'argana_alta_115', a: [-1675.3, -1848.1], b: [-1714.0, -1829.2], anchos: [10, 10, 11.1, 12], altos: [6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#ecdcae', carp: MARRON_OSC, bajo: 'V:2.2 V:2.2 _ P', alto: 'V V', franja: REPISA, contador: { x: 0.95 } },
      { pared: '#ecdcae', carp: MARRON_OSC, bajo: 'V:2.4 V:2.6', alto: 'V V', franja: REPISA, zoc: { t: 'piedra', c: '#6b5a4a', junta: '#cdbb9e', h: 0.25 } },
      { pared: '#ecdcae', carp: MARRON_OSC, bajo: 'P _ VR:2.4', alto: 'V V', franja: REPISA, contador: { x: 0.12 } },
      { pared: '#ecdcae', carp: MARRON_OSC, bajo: '_ P _ V', alto: 'V V', franja: REPISA, contador: { x: 0.3 } },
    ] },
    // argana_alta_116: Seguidilla, acera norte, pasos 10,11,12 — hoja argana_alta/argana_alta_116.jpg — antes: #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96
    { id: 'argana_alta_116', a: [-1583.3, -1892.1], b: [-1617.4, -1875.1], anchos: [7.2, 7.3, 7.3, 8.1, 8.1], altos: [6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#ecd9a2', carp: MARRON_OSC, bajo: 'VR V:2.2 _ P', alto: 'V V', franja: REPISA, contador: { x: 0.92 } },
      { pared: '#ecd9a2', carp: MARRON_OSC, bajo: 'VC V:2.4 _ P', alto: 'V V', franja: REPISA, contador: { x: 0.75 } },
      { pared: '#ecd9a2', carp: MARRON_OSC, bajo: '_ P', alto: 'VA', contador: { x: 0.6 } },
      { pared: '#ecd9a2', carp: MARRON_OSC, bajo: '_ _ P', alto: 'B', barandilla: MARRON_OSC, contador: { x: 0.2 } },
      { pared: '#ecd9a2', carp: MARRON_OSC, bajo: 'V:2.4 P', alto: 'V V', franja: REPISA, num: 113, numX: 0.9, contador: { x: 0.95 } },
    ] },
    // argana_alta_117: Seguidilla, acera norte, pasos 15,16 — hoja argana_alta/argana_alta_117.jpg — antes: #f0dd96 #f0dd96 #f0dd96 #f0dd96
    { id: 'argana_alta_117', a: [-1637.7, -1866.0], b: [-1670.9, -1849.7], anchos: [9.6, 9.6, 8.9, 8.9], altos: [6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#efe0aa', carp: MARRON_OSC, bajo: '_ _ P', alto: 'VA:3', contador: { x: 0.1 } },
      { pared: '#efe0aa', carp: MARRON_OSC, bajo: 'V:2.2 P', alto: 'V V', franja: REPISA },
      { pared: '#efe0aa', carp: MARRON_OSC, bajo: 'VR V:2.2 PA', alto: 'V V', franja: REPISA },
      { pared: '#efe0aa', carp: MARRON_OSC, bajo: 'PA V:2.2 _', alto: 'V V', zoc: { t: 'piedra', c: '#6b5a4a', junta: '#d0c0a4', h: 0.3 }, franja: REPISA, contador: { x: 0.85 } },
    ] },
    // argana_alta_118: Seguidilla, acera norte, pasos 17 — hoja argana_alta/argana_alta_118.jpg — antes: #f0dd96
    { id: 'argana_alta_118', a: [-1675.3, -1848.0], b: [-1682.8, -1844.3], anchos: [8.4], altos: [6.6], casas: [
      { pared: '#ecd9a2', carp: '#2a2422', bajo: 'V:2.4 _ P', alto: 'V V', franja: REPISA, contador: { x: 0.92 } },
    ] },
    // argana_alta_119: de Camilo José Cela, acera norte, pasos 5 — hoja argana_alta/argana_alta_119.jpg — antes: #f1eee7/tienda
    { id: 'argana_alta_119', a: [-2298.0, -1942.6], b: [-2310.7, -1939.9], anchos: [13], altos: [6.6], casas: [
      { pared: '#efe6cc', carp: '#3f6a4e', bajo: 'P M:2.6 _ VA', persiana: '#8a958c', marcoPersiana: '#6a6a68', alto: 'VR B:3', zoc: { t: 'granito', c: '#6e6e6c', h: 1.0 }, barandilla: '#3f6a4e', reja: '#3f6a4e', cables: true, contador: { x: 0.08 } },
    ] },
    // argana_alta_120: Folias, acera sur, pasos 4,5,6,7,8,9,10,11 — hoja argana_alta/argana_alta_120.jpg — antes: #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8 #efe6c8
    { id: 'argana_alta_120', a: [-1697.6, -1928.5], b: [-1790.4, -1881.9], anchos: [4.5, 12.8, 12.7, 9.1, 9.1, 10.4, 10.4, 10, 10, 10, 10, 9.3, 9.3], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'P VR', alto: 'VA', reja: '#3a2420' },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'P M:2.2 _ VR P', alto: 'VA VA', reja: '#3a2420', num: 102, numX: 0.08 },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'M:2.2 P _ VR P', alto: 'VA VA', reja: '#3a2420', num: 96, numX: 0.3 },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'VR P VR P', alto: 'VA VA', reja: '#3a2420', num: 92, numX: 0.3 },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'V:2 P VR P', alto: 'VA VA', reja: '#3a2420' },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'VR P M:2.2 P', alto: 'VA VA', reja: '#3a2420', num: 84, numX: 0.3 },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'V P VR P', alto: 'VA VA', reja: '#3a2420' },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'M:2 P V:2.2 P', alto: 'VA VA', reja: '#3a2420', num: 74, numX: 0.28 },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'V:2.2 P VR P', alto: 'VA VA', reja: '#3a2420' },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'VR P VR:2 P', alto: 'VA VA', reja: '#3a2420', num: 64, numX: 0.25 },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'VR P M:2 P', alto: 'VA VA', reja: '#3a2420' },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'P VR:2 P', alto: 'VA VA', reja: '#3a2420', num: 56, numX: 0.08 },
      { pared: '#eee8d6', carp: '#3a2420', bajo: 'P VR:2 P', alto: 'VA VA', reja: '#3a2420', num: 48, numX: 0.08 },
    ] },
    // argana_alta_121: Folias, acera sur, pasos 13,14,15,16,17,18,19,20,21 — hoja argana_alta/argana_alta_121.jpg — antes: #d9b996 #d9b996 #d9b996 #d9b996 #d9b996 #d9b996 #d9b996 #d9b996 #d9b996 #d9b996 #d9b996 #d9b996 #d9b996 #d9b996
    { id: 'argana_alta_121', a: [-1820.9, -1867.4], b: [-1939.4, -1811.7], anchos: [7.9, 13.3, 8.3, 8.3, 8.5, 8.5, 8.8, 8.8, 10.1, 10.1, 10, 10, 9.3, 9.3], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#d9b996', carp: BLANCA, bajo: 'PD:2.2 V:2.4 VR', alto: 'B VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA, reja: '#2a2a2a' },
      { pared: '#d9b996', carp: BLANCA, bajo: 'V PD:2.2 V:2.2', alto: 'B VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA, num: 34, numX: 0.2 },
      { pared: '#d9b996', carp: BLANCA, bajo: 'V:2.2 V', alto: 'VA VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 } },
      { pared: '#d9b996', carp: BLANCA, bajo: 'V:2.6 V _', alto: 'B VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA },
      { pared: '#d9b996', carp: BLANCA, bajo: 'V V:2.4 PD:2', alto: 'B VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA, num: 28, numX: 0.6 },
      { pared: '#d9b996', carp: BLANCA, bajo: 'M:2.4 PD:2', marcoPersiana: BLANCA, alto: 'B VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA, num: 26, numX: 0.55 },
      { pared: '#d9b996', carp: BLANCA, bajo: 'V:2.4 V', alto: 'VA B', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA },
      { pared: '#d9b996', carp: BLANCA, bajo: 'PD:2 V:2.4', alto: 'VA VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 } },
      { pared: '#d9b996', carp: BLANCA, bajo: 'V V:2.4', alto: 'B VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA },
      { pared: '#d9b996', carp: BLANCA, bajo: 'V V:2.4 _', alto: 'VA B', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA },
      { pared: '#d9b996', carp: BLANCA, bajo: 'PD:2 V', alto: 'B VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA, num: 20, numX: 0.3 },
      { pared: '#d9b996', carp: BLANCA, bajo: 'V:2.4 V', alto: 'VA B', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA },
      { pared: '#d9b996', carp: BLANCA, bajo: 'V:2.4 V V', alto: 'B VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 }, barandilla: BLANCA },
      { pared: '#d9b996', carp: BLANCA, bajo: 'V V:2.4', alto: 'VA VA', zoc: { t: 'liso', c: '#c9a882', h: 1.1 } },
    ] },
    // argana_alta_122: de María Morales Topham, acera norte, pasos 2,3,4 — hoja argana_alta/argana_alta_122.jpg — antes: #f0dd96 #f0dd96 #f0dd96
    { id: 'argana_alta_122', a: [-1599.8, -1911.0], b: [-1620.5, -1900.5], anchos: [5.3, 9.1, 8.8], altos: [6.6, 6.6, 6.6], casas: [
      { pared: '#ecd9a2', carp: '#3a2420', bajo: 'VA:1.8 _ P', alto: 'V', franja: REPISA, contador: { x: 0.95 } },
      { pared: '#ecd9a2', carp: '#3a2420', bajo: 'V:2.2 _ P _ VR:2 _', alto: 'V V', franja: REPISA, contador: { x: 0.55 } },
      { pared: '#ecd9a2', carp: '#2a2422', bajo: 'VR:1.8 _ P V:2', alto: 'V V', franja: REPISA, contador: { x: 0.75 } },
    ] },
    // argana_alta_123: de María Morales Topham, acera sur, pasos 5,6 — hoja argana_alta/argana_alta_123.jpg — antes: #f0dd96 #f0dd96
    { id: 'argana_alta_123', a: [-1616.1, -1890.6], b: [-1632.9, -1882.1], anchos: [9.4, 9.4], altos: [6.6, 6.6], casas: [
      { pared: '#ecd9a2', carp: MARRON_OSC, bajo: 'V P _ _ P', alto: 'V V', zoc: { t: 'liso', c: '#a85c3e', h: 2.2 }, contador: { x: 0.12 } },
      { pared: '#ecd9a2', carp: MARRON_OSC, bajo: 'V:2.4 P P V:2.4', alto: 'V V', franja: REPISA, num: 66, numX: 0.42, contador: { x: 0.55 } },
    ] },
    // argana_alta_124: de María Morales Topham, acera norte, pasos 7,8 — hoja argana_alta/argana_alta_124.jpg — antes: #f0dd96 #f0dd96
    { id: 'argana_alta_124', a: [-1642.0, -1890.1], b: [-1654.1, -1884.0], anchos: [6.8, 6.8], altos: [6.6, 6.6], casas: [
      { pared: '#efdca6', carp: '#3a2a22', bajo: 'V:2 P _ _', alto: 'V V', franja: REPISA, contador: { x: 0.55 } },
      { pared: '#efdca6', carp: '#2e211b', bajo: 'P VA:2', alto: 'V V', franja: REPISA, contador: { x: 0.3 } },
    ] },
    // argana_alta_125: de María Morales Topham, acera sur, pasos 9,10 — hoja argana_alta/argana_alta_125.jpg — antes: #f0dd96 #f0dd96 #f0dd96
    { id: 'argana_alta_125', a: [-1652.5, -1873.2], b: [-1676.5, -1861.1], anchos: [7.3, 7.3, 12.2], altos: [6.6, 6.6, 6.6], casas: [
      { pared: '#efdca6', carp: MARRON_OSC, bajo: 'P V:2.6 P', alto: 'V V', franja: REPISA, zoc: { t: 'liso', c: '#7a2a30', h: 0.3 }, contador: { x: 0.25 } },
      { pared: '#efdca6', carp: MARRON_OSC, bajo: 'PA V:2', alto: 'V V', franja: REPISA },
      { pared: '#efdca6', carp: MARRON_OSC, bajo: 'V:2 P _ _ _ P', alto: 'VA _ V', franja: REPISA, contador: { x: 0.3 } },
    ] },
    // argana_alta_126: de María Morales Topham, acera sur, pasos 11,12,13,14,15,16 — hoja argana_alta/argana_alta_126.jpg — antes: #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96 #f0dd96
    { id: 'argana_alta_126', a: [-1680.7, -1859.2], b: [-1773.2, -1814.9], anchos: [8.1, 7.5, 7.5, 8.9, 8.9, 8.5, 8.5, 10.2, 10.2, 8.1, 8.1, 8.1], altos: [6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#efdba3', carp: MARRON_OSC, bajo: 'VR:0.8 V:2.2 _', alto: 'V', barandilla: '#2a2a2a' },
      { pared: '#efdba3', carp: MARRON_OSC, bajo: 'P _ V:2.4', alto: 'V V', franja: REPISA, contador: { x: 0.1 } },
      { pared: '#efdba3', carp: MARRON_OSC, bajo: 'V:2.4 _', alto: 'V V', zoc: { t: 'liso', c: '#c8673e', h: 0.5 } },
      { pared: '#efdba3', carp: MARRON_OSC, bajo: '_ V:2.4 PA', alto: 'V', franja: REPISA, contador: { x: 0.8 } },
      { pared: '#efdba3', carp: MARRON_OSC, bajo: 'V:2.6 _', alto: 'V V', zoc: { t: 'liso', c: '#c8673e', h: 0.15 } },
      { pared: '#efdba3', carp: '#3a2420', bajo: 'P _ _', alto: 'V', contador: { x: 0.1 } },
      { pared: '#efdba3', carp: '#2a2422', bajo: '_ P', alto: 'V V', zoc: { t: 'liso', c: '#a8644a', h: 2.6 }, contador: { x: 0.2 } },
      { pared: '#efdba3', carp: MARRON_OSC, bajo: 'V:2.6 PA', alto: 'V V', franja: REPISA, contador: { x: 0.85 } },
      { pared: '#efdba3', carp: MARRON_OSC, bajo: 'V:2.6 _', alto: 'V V', franja: REPISA },
      { pared: '#efdba3', carp: MARRON_OSC, bajo: '_ P', alto: 'V', contador: { x: 0.8 } },
      { pared: '#efdba3', carp: '#3a2a22', bajo: 'P V:2.2 VA:2', alto: 'V VR', franja: REPISA, num: 6, numX: 0.1 },
      { pared: '#efdba3', carp: MARRON_OSC, bajo: 'P _ V:2.2', alto: 'V V', franja: REPISA },
    ] },
    // argana_alta_127: de María Morales Topham, acera sur, pasos 2,3,4 — hoja argana_alta/argana_alta_127.jpg — antes: #f0dd96 #f0dd96 #f0dd96
    { id: 'argana_alta_127', a: [-1589.0, -1903.9], b: [-1615.4, -1890.5], anchos: [11.7, 9.1, 8.8], altos: [6.6, 6.6, 6.6], casas: [
      { pared: '#efdca6', carp: '#2a2422', bajo: 'P _ VR V:2 _', alto: 'V V V', franja: REPISA, num: 80, numX: 0.05, contador: { x: 0.02 } },
      { pared: '#efdca6', carp: '#3a2a22', bajo: 'P _ V:2.4 V', alto: 'V V', franja: REPISA, contador: { x: 0.15 } },
      { pared: '#efdca6', carp: '#5a2a20', bajo: 'V:2.4 V _ P', alto: 'V V', franja: REPISA, contador: { x: 0.95 } },
    ] },
  ],
};
