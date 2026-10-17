import { MACCHERONI, SAKURA, CERVECERIA } from './localesComida.js';
import { BUGANVILLAS } from './localesBuganvillas.js';
import { FUNERARIA, TANATORIO } from './localesArroyo.js';

/** los locales de los clientes en los que se puede entrar */
export const LOCAL_DEFS = [MACCHERONI, BUGANVILLAS, SAKURA, CERVECERIA, FUNERARIA, TANATORIO];

export { buildTanatorioFacade, tuneTanatorio } from './localesArroyo.js';
