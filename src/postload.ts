import initDebug from './debug.js';
import initLocale from '../src/locale.js';
import initLocalizeMeReady from './localize-me-ready-module.js';
import initJsonPatches from '../src/json-patches.js';
import initImagePatches from './image-patches.js';

if (sc.ru == null) sc.ru = {} as typeof sc.ru;

initDebug();
initLocale();
initLocalizeMeReady();
initJsonPatches();
initImagePatches();
