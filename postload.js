import initDebug from './src/debug.js';
import initLocale from './src/locale.js';
/* <tool> */
import { RuTranslationToolNgClient } from './tool/dist/tool-client.js';
/* </tool> */

if (sc.ru == null) sc.ru = {};

initDebug();
initLocale();

/* <tool> */
sc.ru.translationTool = new RuTranslationToolNgClient();
/* </tool> */
