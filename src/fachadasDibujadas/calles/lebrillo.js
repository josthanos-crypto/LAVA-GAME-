/**
 * Calle Lebrillo (Titerroy): cada casa dibujada a partir de sus fotos de Look Around (carpeta «Downloads\recursos lava
 * game 2026-11-25 web casa fachadas\titerroy\calle_lebrillo», pasos 1-11; solo se miran). Las aceras son las mismas
 * de src/barrios/compartido/fachadasCasa.js (a, b y anchos de las casas, de a hacia b). null = no se dibuja.
 * A ojo: qué foto es qué casa (la coordenada de cada paso baila) y el sitio de cada hueco en su fachada.
 */

const BLANCO = '#f3f1ea', CREMA = '#efe3c4';
const MARRON = '#4a2c1f', MARRON_OSC = '#2e211b', VERDE = '#1f7a45', AZUL = '#2a55a8';

export default {
  nombre: 'Calle Lebrillo',
  aceras: [
    {
      // acera norte, pasos 2-3: el bar El Salsero en la esquina con Santander, la casa de reja azul y la de bloque
      a: [-598.2, -325.1], b: [-564.4, -318.0], anchos: [12.1, 11.2, 11.2], altos: [6.6, 4.0, 4.0],
      casas: [
        { pared: BLANCO, carp: AZUL, bajo: 'VA M:2.4 P', alto: 'VA VA VA', franja: { c: AZUL, y: 3.0, h: 0.2 }, cables: true, contador: { x: 0.7 } },
        { pared: BLANCO, carp: AZUL, bajo: 'VR P VR', zoc: { t: 'liso', c: '#d9d6cf', h: 0.5 }, cables: true },
        { pared: 'bloque', carp: '#7a5a3a', bajo: 'T _ P' },
      ],
    },
    {
      // acera norte, pasos 4-5: la casa tostada del 39 (zócalo de piedra clara, puerta granate) y la terrera blanca del 35
      a: [-540.8, -314.7], b: [-523.6, -311.2], anchos: [8.7, 8.7], altos: [4.0, 4.0],
      casas: [
        { pared: '#dcb98c', carp: '#5a2430', bajo: 'V P', zoc: { t: 'piedra', c: '#b0916a', junta: '#e3d3b6', h: 1.0 }, corn: { c: '#caa47a' }, num: 39, numX: 0.62 },
        { pared: BLANCO, carp: MARRON_OSC, bajo: 'VC P V', zoc: { t: 'granito', c: '#a89a9b', h: 0.9 }, num: 35, numX: 0.47, cables: true, contador: { x: 0.62 } },
      ],
    },
    {
      // acera norte, pasos 6-11 (Version 182): la del 25 (piedra negra, cornisa verde con rombos), dos blancas de
      // carpintería marrón, la mostaza, la del garaje verde y la de la puerta de arco verde con zócalo de granito
      a: [-523.5, -311.6], b: [-472.3, -301.3], anchos: [9.6, 9.6, 8.1, 8.1, 8.4, 8.4], altos: [4.0, 4.0, 4.0, 4.0, 4.0, 4.0],
      casas: [
        { pared: BLANCO, carp: VERDE, bajo: 'P VR', zoc: { t: 'piedra', c: '#34302d', h: 1.05 }, corn: { c: VERDE, rombos: true }, esq: { c: VERDE, lados: [1] }, num: 25, numX: 0.1, cables: true },
        { pared: BLANCO, carp: MARRON, bajo: 'V P V', cables: true, contador: { x: 0.33 } },
        { pared: BLANCO, carp: '#3b2418', bajo: 'P V', cables: true },
        { pared: '#d9a640', carp: '#3b2418', bajo: 'P VC', zoc: { t: 'liso', c: '#b98a2e', h: 0.35 }, num: 23, numX: 0.08 },
        { pared: BLANCO, carp: '#1e6e3c', bajo: 'G:3', garajeVentanas: true, zoc: { t: 'granito', c: '#5c5a57', h: 1.1 }, esq: { c: '#3c3a38', t: 'sillares', lados: [0] }, contador: { x: 0.8 } },
        { pared: BLANCO, carp: '#17703a', bajo: 'PA V', zoc: { t: 'granito', c: '#7e8b86', h: 1.6 }, corn: { c: '#8f9696' }, esq: { c: '#8f9696', t: 'sillares', lados: [1] }, cables: true },
      ],
    },
    {
      // acera sur, pasos 1-3: la esquina crema de la persiana, el almacén de la persiana verde y la de rejas altas;
      // luego las dos blancas de zócalo gris (el portón de madera del 37 y la de contraventanas marrones)
      a: [-607.8, -319.1], b: [-571.2, -311.4], anchos: [4.5, 8.9, 8.9, 8.6, 8.6], altos: [6.6, 4.0, 4.0, 6.6, 6.6],
      casas: [
        { pared: CREMA, carp: '#8b8f93', bajo: 'M:2.2', alto: 'VA' },
        { pared: '#ece0c2', carp: '#3f7f76', marcoPersiana: '#3f7f76', bajo: 'P:0.8 M:3.4', contador: { x: 0.12 } },
        { pared: '#ece0c2', carp: '#3f7f68', bajo: 'VR VR', ventanaAlta: true, contador: { x: 0.08 } },
        { pared: BLANCO, carp: '#4a3326', bajo: 'PD', alto: 'VA VA', zoc: { t: 'liso', c: '#8e9093', h: 1.2 }, num: 37, numX: 0.86 },
        { pared: BLANCO, carp: MARRON, bajo: 'V V', alto: 'B VA', zoc: { t: 'liso', c: '#8e9093', h: 1.2 }, franja: { c: '#8e9093', y: 2.85, h: 0.18 } },
      ],
    },
    {
      // acera sur, pasos 9-11 (Version 182): portón marrón, los dos bajos de tienda (escaparate con reja blanca y
      // La Casona Isleña con su garaje blanco), la de la puerta de arco y la persiana oxidada de marco azul
      a: [-510.8, -299.1], b: [-474.2, -291.8], anchos: [4.5, 8.1, 8.1, 8.4, 8.4], altos: [6.6, 6.6, 6.6, 6.6, 6.6],
      casas: [
        { pared: BLANCO, carp: '#3b2a20', bajo: 'PD:2.2', alto: 'VA' },
        { pared: BLANCO, carp: MARRON, bajo: 'E P', alto: 'VA VA' },
        { pared: BLANCO, carp: '#f4f4f2', bajo: 'E:2.2 G:2.8', alto: 'B VA' },
        { pared: CREMA, carp: '#6b4a33', bajo: 'PA M:2.4', marcoPersiana: '#3a3330', alto: 'VA VA', zoc: { t: 'granito', c: '#9c6b6b', h: 0.8 } },
        { pared: CREMA, carp: '#5b8fb0', bajo: 'Mr:5', marcoPersiana: '#5b8fb0', alto: 'VA VA' },
      ],
    },
  ],
};
