import './namespace.js';
import initDebug from './debug.js';
import './utils.js';
import initLocale from '../src/locale.js';
import initLocalizeMeReady from './localize-me-ready-module.js';
import initJsonPatches from '../src/json-patches.js';
import initImagePatches from './image-patches.js';

initDebug();
initLocale();
initLocalizeMeReady();
initJsonPatches();
initImagePatches();
