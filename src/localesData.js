import { MACCHERONI, SAKURA, CERVECERIA } from './localesComida.js';
import { BUGANVILLAS } from './localesBuganvillas.js';
import { FUNERARIA, TANATORIO } from './localesArroyo.js';
import { GASOLINERA_MANEJE } from './gasolineraManeje.js';
import { OPEN_MALL } from './localesOpenMall.js';
import { POLIDEPORTIVO } from './localesPolideportivo.js';
import { CROSSFIT_LANZAROTE } from './crossfitLanzarote.js';

/** los locales de los clientes en los que se puede entrar */
export const LOCAL_DEFS = [MACCHERONI, BUGANVILLAS, SAKURA, CERVECERIA, FUNERARIA, TANATORIO, GASOLINERA_MANEJE, OPEN_MALL, POLIDEPORTIVO, CROSSFIT_LANZAROTE];

export { buildTanatorioFacade, tuneTanatorio } from './localesArroyo.js';
