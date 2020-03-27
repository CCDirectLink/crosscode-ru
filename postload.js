import initDebug from './src/debug.js';
import initLocale from './src/locale.js';
import initJsonPatches from './src/json-patches.js';

if (sc.ru == null) sc.ru = {};

initDebug();
initLocale();
initJsonPatches();
