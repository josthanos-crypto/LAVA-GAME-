/**
 * Fachadas dibujadas: altavista, tanda 1 (28 tramos de
 * src/barrios/compartido/fachadasCasa.js). Cada casa se describe mirando la hoja de fotos de su tramo
 * (carpeta _trabajo_fachadas); null = no se dibuja. Método: skill lava-game-fachadas.
 */

export default {
  nombre: 'altavista 1',
  aceras: [
    // altavista_000: de Almería, acera sur, pasos 8,9 — hoja altavista/altavista_000.jpg — antes: #f1eee7 #f1eee7
    { id: 'altavista_000', a: [-29.7, -1200.5], b: [-52.7, -1190.4], anchos: [12.7, 12.4], altos: [4, 4], casas: [
      { pared: '#f3f1ea', carp: '#3b2418', barandilla: '#4a2c1f', bajo: 'PA _ PA V:1.6 _ _', num: 27, numX: 0.08, contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#3b2a22', bajo: 'G:3 _ V:1.8 P', zoc: { t: 'granito', c: '#bfaea2', h: 2.4 }, franja: { c: '#3a3634', y: 2.4, h: 0.12 }, cables: true, contador: { x: 0.4 } },
    ] },
    // altavista_001: Chimia, acera este, pasos 2,3,4,5 — hoja altavista/altavista_001.jpg — antes: #efe6c8 #efe6c8 #f1eee7 #a9abad #f1eee7
    { id: 'altavista_001', a: [-11.7, -1396.6], b: [-3.7, -1439.5], anchos: [7.3, 7.3, 8.1, 10.1, 10.8], altos: [6.6, 6.6, 4, 4, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#4a3326', bajo: 'VC:1.2 P _ PD:2.4', zoc: { t: 'granito', c: '#6f716f', h: 1.0 }, cables: true },
      { pared: '#f3f1ea', carp: '#1d2b26', bajo: 'G:3 _ P', cables: true, contador: { x: 0.8 } },
      { pared: '#f3f1ea', carp: '#1d2a26', bajo: 'G:2.6 P VA:1.8', cables: true, contador: { x: 0.45 } },
      { pared: '#f3f1ea', carp: '#1f6e4a', bajo: 'V P:0.9 VA:1.5 _ V:1.4 P', num: 8, numX: 0.22, cables: true, contador: { x: 0.75 } },
      null,
    ] },
    // altavista_002: Chimia, acera este, pasos 1 — hoja altavista/altavista_002.jpg — antes: #f1eee7
    { id: 'altavista_002', a: [-11.7, -1396.6], b: [-9.6, -1408.1], anchos: [11.7], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#4a3326', bajo: 'VC:1.2 P _ PD:2.4 _ G:2.8', zoc: { t: 'granito', c: '#6f716f', h: 1.0 }, cables: true },
    ] },
    // altavista_003: de Granada, acera este, pasos 3 — hoja altavista/altavista_003.jpg — antes: #f1eee7/tienda
    { id: 'altavista_003', a: [86.9, -1312.2], b: [88.8, -1322.4], anchos: [10.4], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#5a3a2a', marcoPersiana: '#9fb3c0', persiana: '#a9bcc8', marcoEscaparate: '#f4f4f2', rejaEscaparate: '#f4f4f2', barandilla: '#f4f4f2', bajo: 'M:3.6 _ E:2.2 P G:1.8', alto: '_ _ VB VB', contador: { x: 0.6 } },
    ] },
    // altavista_004: de la Peña del Espino, acera este, pasos 2,3,4 — hoja altavista/altavista_004.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'altavista_004', a: [275.3, -1779.8], b: [280.6, -1809.3], anchos: [13.5, 12, 4.5], altos: [4, 4, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#3b2418', bajo: '_ V:1 P V:1.4 _ _ VA:0.9 PA V:1.8', zoc: { t: 'piedra', c: '#a8653a', junta: '#d9b08a', h: 2.6 }, num: 10, numX: 0.25, contador: { x: 0.3 } },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: '_ V:1.4 PA VC:1.2 _', num: 14, numX: 0.55, contador: { x: 0.25 } },
      { pared: '#f3f1ea', carp: '#2a6a3a', bajo: 'VA:0.9 P VR:1.8', alto: 'VA:2', zoc: { t: 'piedra', c: '#b5735a', junta: '#e8dcd0', h: 2.6 }, contador: { x: 0.2 } },
    ] },
    // altavista_005: de la Peña del Espino, acera este, pasos 7,8,9,10 — hoja altavista/altavista_005.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'altavista_005', a: [284.5, -1830.0], b: [292.6, -1874.9], anchos: [7, 11.1, 13.3, 7.1, 7.1], altos: [6.6, 6.6, 4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VA:1.1 P VA:1.1', alto: '_ VA', num: 20, numX: 0.4, contador: { x: 0.25 } },
      { pared: '#f3f1ea', carp: '#1f7a45', bajo: 'VA:0.9 _ P VA:0.9 _ P VC:1', esq: { c: '#a89070', t: 'sillares', lados: [1] }, zoc: { t: 'piedra', c: '#8a7a6a', junta: '#c9bba8', h: 1.4 }, num: 22, numX: 0.72, contador: { x: 0.2 } },
      { pared: '#f3f1ea', carp: '#1f8a4a', bajo: 'P _ P VC:1.4 _ _', zoc: { t: 'piedra', c: '#8a7a6a', junta: '#c9bba8', h: 1.5 }, esq: { c: '#a89070', t: 'sillares', lados: [0, 1] }, num: 24, numX: 0.3, contador: { x: 0.4 } },
      { pared: '#f3f1ea', carp: '#2e211b', barandilla: '#2e211b', bajo: 'VC:2.6 P:1.1', num: 26, numX: 0.75, contador: { x: 0.85 } },
      { pared: '#f3f1ea', carp: '#3b2418', bajo: 'VA:0.9 PA VC:1.4 _ V:1.2 V:1.2', zoc: { t: 'piedra', c: '#8a7a6e', junta: '#c8bfb5', h: 2.6 } },
    ] },
    // altavista_006: de la Peña del Espino, acera este, pasos 1 — hoja altavista/altavista_006.jpg — antes: #f1eee7 #f1eee7
    { id: 'altavista_006', a: [272.5, -1763.6], b: [275.5, -1780.4], anchos: [8.5, 8.5], altos: [6.6, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#1f6e52', bajo: '_ _ P', alto: '_ V' },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'VR:1 VR:1 PA V:1.1 _ V:0.9 P', alto: '_ _ B:2.4 V', num: 4, numX: 0.45, contador: { x: 0.2 } },
    ] },
    // altavista_007: Mosta, acera sur, pasos 1,2 — hoja altavista/altavista_007.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'altavista_007', a: [207.0, -1752.8], b: [174.6, -1759.3], anchos: [11.1, 11.1, 10.9], altos: [6.6, 6.6, 6.6], casas: [
      null,
      null,
      null,
    ] },
    // altavista_008: Mosta, acera norte, pasos 14,15,16 — hoja altavista/altavista_008.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #f1eee7
    { id: 'altavista_008', a: [49.1, -1802.1], b: [10.7, -1808.8], anchos: [10.3, 13.1, 7.8, 7.8], altos: [6.6, 4, 6.6, 6.6], casas: [
      { pared: '#c4c0b4', carp: '#f4f4f2', bajo: 'V:1.4 _ V:1.4', alto: 'V V', esq: { c: '#8a8a86' }, franja: { c: '#8a8a86', y: 3.1, h: 0.25 } },
      { pared: '#e2d6ac', carp: '#4a2c1f', bajo: '_ P _ V:1.8 _ PD:2.2', zoc: { t: 'liso', c: '#8e959a', h: 1.4 }, num: 47, numX: 0.12, cables: true, contador: { x: 0.3 } },
      { pared: '#e6d9b0', carp: '#5a2e22', bajo: '_ PD:2.4 _' },
      { pared: '#ecebe6', carp: '#b5b8b8', bajo: '_ PD:2.6 _', cables: true, contador: { x: 0.65 } },
    ] },
    // altavista_009: Mosta, acera sur, pasos 17 — hoja altavista/altavista_009.jpg — antes: #f1eee7
    { id: 'altavista_009', a: [19.2, -1796.1], b: [9.5, -1797.8], anchos: [9.9], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#1f6e52', bajo: 'PD:1.6 _ P _ G:3', alto: 'VC:2.6 V _ _', cables: true, contador: { x: 0.35 } },
    ] },
    // altavista_010: Mosta, acera norte, pasos 23 — hoja altavista/altavista_010.jpg — antes: #f1eee7/solar
    { id: 'altavista_010', a: [272.5, -1763.5], b: [282.8, -1761.9], anchos: [10.4], altos: [0], casas: [
      null,
    ] },
    // altavista_011: Mosta, acera norte, pasos 33 — hoja altavista/altavista_011.jpg — antes: #f1eee7
    { id: 'altavista_011', a: [409.7, -1737.5], b: [416.0, -1738.4], anchos: [6.4], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#2e211b', bajo: '_ _ _', alto: '_ VA:0.7 _' },
    ] },
    // altavista_012: Mosta, acera sur, pasos 15,16 — hoja altavista/altavista_012.jpg — antes: #efe6c8 #efe6c8 #efe6c8 #ece8e0 #ece8e0
    { id: 'altavista_012', a: [47.8, -1791.0], b: [9.5, -1797.7], anchos: [8, 8, 8, 7.4, 7.4], altos: [6.6, 6.6, 6.6, 4, 4], casas: [
      null,
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P _ VA:2.2 _', zoc: { t: 'piedra', c: '#6e6a66', junta: '#c9c7c2', h: 1.3 }, num: 17, numX: 0.1, cables: true, contador: { x: 0.85 } },
      { pared: '#f3f1ea', carp: '#6b3a2a', bajo: 'PD:2.4 _ _', cables: true },
      { pared: '#f3f1ea', carp: '#1f7a52', bajo: '_ _ P', num: 19, numX: 0.82, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'G:3 _', num: 21, numX: 0.62, cables: true },
    ] },
    // altavista_013: Mosta, acera norte, pasos 17 — hoja altavista/altavista_013.jpg — antes: #f1eee7
    { id: 'altavista_013', a: [21.2, -1807.3], b: [10.7, -1809.1], anchos: [10.6], altos: [6.6], casas: [
      { pared: '#ece4c4', carp: '#5a4038', reja: '#3a2a22', bajo: 'PD:3 _ VR:0.9 _', alto: '_ _ VR:0.8 _', ventanaAlta: true, zoc: { t: 'piedra', c: '#5c5e60', junta: '#7a7c7e', h: 1.6 }, corn: { c: '#f3f1ea' }, esq: { c: '#4e5052', lados: [1] }, cables: true },
    ] },
    // altavista_014: Mosta, acera sur, pasos 18,19,20 — hoja altavista/altavista_014.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'altavista_014', a: [188.9, -1755.2], b: [206.8, -1751.7], anchos: [13.4, 12, 4.5], altos: [6.6, 6.6, 6.6], casas: [
      null,
      null,
      null,
    ] },
    // altavista_015: Blasco Ibáñez, acera este, pasos 25 — hoja altavista/altavista_015.jpg — antes: #f1eee7
    { id: 'altavista_015', a: [153.8, -1076.6], b: [156.0, -1071.4], anchos: [5.6], altos: [6.6], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', reja: '#f4f4f2', bajo: 'P VR:0.6 G:3', alto: 'VA VA', ventanaAlta: true, garajeVentanas: true, zoc: { t: 'liso', c: '#5e585c', h: 2.8 }, cables: true, contador: { x: 0.12 } },
    ] },
    // altavista_016: Blasco Ibáñez, acera este, pasos 34,35,36,37 — hoja altavista/altavista_016.jpg — antes: #9d9890 #f1eee7 #f1eee7 #f1eee7
    { id: 'altavista_016', a: [188.8, -996.0], b: [201.8, -966.8], anchos: [9.4, 9.9, 9.9, 4.5], altos: [4, 4, 4, 4], casas: [
      { pared: 'bloque', carp: '#2aa37a', bajo: '_ P:1.3 _ PD:2.4 _' },
      { pared: '#f3f1ea', carp: '#8b8f93', reja: '#f4f4f2', bajo: 'VR:1.6 _ P VR', num: 10, numX: 0.75, contador: { x: 0.5 } },
      { pared: '#f3f1ea', carp: '#2e211b', bajo: '_ V:1.4 _ P:1.4' },
      null,
    ] },
    // altavista_017: Blasco Ibáñez, acera este, pasos 38,39,40,41,42,43 — hoja altavista/altavista_017.jpg — antes: #f1eee7 #f1eee7 #f1eee7 #ece8e0/tienda #f0dd96 #b9b2a4/tienda #efe6c8/tienda
    { id: 'altavista_017', a: [216.1, -940.9], b: [230.8, -910.1], anchos: [2.2, 2.2, 10, 10, 10, 10, 6.5], altos: [9.4, 4, 4, 4, 6.6, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#f4f4f2', bajo: 'P:1', alto: 'V:1.2', zoc: { t: 'liso', c: '#7d7f82', h: 0.9 } },
      { pared: '#f3f1ea', carp: '#3a3a3a', reja: '#f4f4f2', bajo: 'VR:1.4' },
      { pared: '#ecebe6', carp: '#8b8f93', marcoEscaparate: '#e9e9e6', rejaEscaparate: '#d9dcdc', bajo: '_ E:3.2 _ VR:1.2', zoc: { t: 'granito', c: '#b8a09a', h: 0.9 } },
      { pared: '#f3f1ea', carp: '#6b4a33', bajo: 'VR:1 _ P:1.2 _ _', zoc: { t: 'granito', c: '#b8a09a', h: 0.9 } },
      { pared: '#bfa9a5', carp: '#6b4a33', marcoEscaparate: '#8b8f93', bajo: 'Es:1.8 _ P:2 _ Es:1.8', alto: 'VA:2 VA:2 VA:2', corn: { c: '#f3f1ea' } },
      null,
      { pared: '#ecebe6', carp: '#8b8f93', marcoEscaparate: '#e9e9e6', rejaEscaparate: '#d9dcdc', bajo: 'VR:1.2 _ E:3', zoc: { t: 'granito', c: '#b8a09a', h: 1.2 } },
    ] },
    // altavista_018: Blasco Ibáñez, acera este, pasos 45,46,47,48,49 — hoja altavista/altavista_018.jpg — antes: #f1eee7 #efe6c8 #efe6c8 #f1eee7 #f1eee7/solar
    { id: 'altavista_018', a: [240.6, -884.2], b: [250.0, -863.4], anchos: [6.1, 9.9, 10, 10, 4.5], altos: [4, 4, 4, 6.6, 0], casas: [
      { pared: '#f3f1ea', carp: '#1f7a52', bajo: 'P _ V:2.4', zoc: { t: 'piedra', c: '#a08a7a', junta: '#d8c8b8', h: 1.3 }, num: 4, numX: 0.12, cables: true, contador: { x: 0.05 } },
      null,
      { pared: '#e6dcc0', carp: '#5a3a2a', bajo: 'VR:1.4 _ V:2.2', zoc: { t: 'piedra', c: '#9a8a84', junta: '#d8ccc6', h: 1.3 }, cables: true },
      { pared: '#e8dcb8', carp: '#5a3a2a', bajo: '_ V:1.8 _', zoc: { t: 'piedra', c: '#9a8a84', junta: '#d8ccc6', h: 1.4 }, num: 10, numX: 0.85, cables: true, contador: { x: 0.8 } },
      null,
    ] },
    // altavista_019: Blasco Ibáñez, acera oeste, pasos 5 — hoja altavista/altavista_019.jpg — antes: #f1eee7 #f1eee7
    { id: 'altavista_019', a: [48.1, -1274.8], b: [55.3, -1257.4], anchos: [9.4, 9.4], altos: [6.6, 6.6], casas: [
      null,
      { pared: '#f3f1ea', carp: '#f4f4f2', barandilla: '#f4f4f2', bajo: 'VC:0.8 PA:1.3 VC:0.8 _ P:1.1 _ VC:0.8 PA:1.3 VC:0.8', alto: 'B:2.6 VC:1 B:2.6', zoc: { t: 'liso', c: '#2a2a2a', h: 0.45 }, contador: { x: 0.45 } },
    ] },
    // altavista_020: Blasco Ibáñez, acera oeste, pasos 26 — hoja altavista/altavista_020.jpg — antes: #ece8e0/tienda #ece8e0/tienda
    { id: 'altavista_020', a: [147.4, -1064.3], b: [155.0, -1048.7], anchos: [8.7, 8.7], altos: [6.6, 6.6], casas: [
      { pared: '#dfe5dc', carp: '#3a2a22', marcoEscaparate: '#2e2e2e', bajo: 'Es:2.6 _ _ P:1.2', alto: '_ _ VR:1.2', cables: true },
      { pared: '#eef0f0', carp: '#8b8f93', marcoPersiana: '#8b8f93', persiana: '#8b8f93', bajo: 'M:2.4 _ _', cables: true, contador: { x: 0.1 } },
    ] },
    // altavista_021: Blasco Ibáñez, acera oeste, pasos 31 — hoja altavista/altavista_021.jpg — antes: #e6d3b8
    { id: 'altavista_021', a: [169.4, -1017.0], b: [171.7, -1011.9], anchos: [5.7], altos: [6.6], casas: [
      { pared: '#ead9c2', carp: '#f4f4f2', bajo: 'V:1.4 _ V:2.6', contador: { x: 0.85 } },
    ] },
    // altavista_022: Blasco Ibáñez, acera oeste, pasos 32,33,34,35 — hoja altavista/altavista_022.jpg — antes: #e6d3b8 #f1eee7 #efe6c8 #efe6c8
    { id: 'altavista_022', a: [172.4, -1012.2], b: [186.3, -979.3], anchos: [10.8, 10, 10, 5.1], altos: [6.6, 6.6, 6.6, 6.6], casas: [
      { pared: '#ebdcbc', carp: '#f4f4f2', bajo: 'VA:2.4 _ VA:1.2 VA:1.2', contador: { x: 0.1 } },
      { pared: '#f3f1ea', carp: '#4a2c1f', bajo: 'G:3 _ _ P', cables: true, contador: { x: 0.9 } },
      { pared: '#ece2c6', carp: '#3b2a22', barandilla: '#222', bajo: 'V:1.4 _ _', alto: 'VR _ B' },
      { pared: '#ece2c6', carp: '#3b2a22', bajo: '_ V:1.4', zoc: { t: 'liso', c: '#d6c095', h: 0.9 } },
    ] },
    // altavista_023: Blasco Ibáñez, acera oeste, pasos 37,38,39 — hoja altavista/altavista_023.jpg — antes: #f1eee7 #f1eee7 #f1eee7
    { id: 'altavista_023', a: [191.2, -969.3], b: [206.5, -936.5], anchos: [14, 10, 12.1], altos: [4, 4, 4], casas: [
      { pared: '#f3f1ea', carp: '#2a74b8', marcoPersiana: '#2a74b8', persiana: '#2a74b8', bajo: 'M:3.2 _ M:3.2' },
      { pared: '#f3f1ea', carp: '#1f8a4a', bajo: '_ PD:3.2 _ P _', cables: true },
      { pared: '#f3f1ea', carp: '#1f8a4a', bajo: '_ VC:1.3 _ _ VC:1.3 _', cables: true },
    ] },
    // altavista_024: Blasco Ibáñez, acera oeste, pasos 41,42,43,44 — hoja altavista/altavista_024.jpg — antes: #efe6c8 #efe6c8 #f1eee7 #f1eee7
    { id: 'altavista_024', a: [210.2, -925.4], b: [226.4, -891.7], anchos: [6.2, 10, 10, 11.2], altos: [4, 4, 4, 4], casas: [
      { pared: '#ecdcb4', carp: '#4a2c1f', bajo: 'V:1.6 _ V:1', zoc: { t: 'granito', c: '#3a3a3e', h: 1.5 }, corn: { c: '#9a9a96' }, cables: true },
      { pared: '#ecdcb4', carp: '#5a3a2a', bajo: 'P _ _ G:2.6', garajeVentanas: true, zoc: { t: 'granito', c: '#3a3a3e', h: 1.5 }, corn: { c: '#9a9a96' }, num: 5, numX: 0.1, cables: true, contador: { x: 0.25 } },
      { pared: '#f3f1ea', carp: '#1f5a3a', bajo: '_ _ VC:1 _ P', zoc: { t: 'liso', c: '#a9abad', h: 0.9 }, cables: true },
      { pared: '#f3f1ea', carp: '#f4f4f2', reja: '#f4f4f2', bajo: '_ VR:1 _ _ VR:1 _', zoc: { t: 'liso', c: '#b0b2b2', h: 0.9 }, cables: true },
    ] },
    // altavista_025: Blasco Ibáñez, acera oeste, pasos 45 — hoja altavista/altavista_025.jpg — antes: #f1eee7
    { id: 'altavista_025', a: [231.6, -883.2], b: [236.7, -871.3], anchos: [13], altos: [4], casas: [
      { pared: '#f3f1ea', carp: '#2e211b', reja: '#222', bajo: '_ _ _ VR:1.2 _ VR:0.5', zoc: { t: 'piedra', c: '#7a5a48', junta: '#b8a898', h: 1.2 }, franja: { c: '#e2e0da', y: 2.6, h: 0.12 }, cables: true },
    ] },
    // altavista_026: Blasco Ibáñez, acera oeste, pasos 47,48,49 — hoja altavista/altavista_026.jpg — antes: #f1eee7/tienda #f1eee7 #f1eee7
    { id: 'altavista_026', a: [241.0, -862.2], b: [250.1, -842.5], anchos: [5.9, 9.9, 5.8], altos: [4, 4, 6.6], casas: [
      { pared: '#f3f1ea', carp: '#2a7a5a', marcoPersiana: '#2a7a5a', marcoEscaparate: '#8b8f93', bajo: '_ Es:2.4 _', contador: { x: 0.12 } },
      { pared: '#f3f1ea', carp: '#3f7f6a', marcoPersiana: '#2a7a5a', persiana: '#2a7a5a', bajo: 'M:1.6 _ _ V:1.2 _ VR:0.6' },
      null,
    ] },
    // altavista_027: Blasco Ibáñez, acera oeste, pasos 51 — hoja altavista/altavista_027.jpg — antes: #f1eee7 #f1eee7
    { id: 'altavista_027', a: [253.5, -833.1], b: [262.2, -815.4], anchos: [9.9, 9.9], altos: [6.6, 6.6], casas: [
      { pared: '#eceeee', carp: '#8b8f93', barandilla: '#8b8f93', bajo: 'VA:1 _ VB:1.3 _', alto: '_ VB:1.3 _', zoc: { t: 'piedra', c: '#b39a7e', junta: '#d8c8b4', h: 0.5 } },
      { pared: '#eceeee', carp: '#8b8f93', barandilla: '#8b8f93', bajo: '_ VB:1.3 _', alto: 'VB:1.3 _', zoc: { t: 'piedra', c: '#b39a7e', junta: '#d8c8b4', h: 0.5 } },
    ] },
  ],
};
