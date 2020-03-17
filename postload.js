if (sc.ru == null) sc.ru = {};

/* <tool> */
import { RuTranslationToolNgClient } from './tool/dist/tool-client.js';
sc.ru.translationTool = new RuTranslationToolNgClient();
/* </tool> */

import './src/locale.js';
