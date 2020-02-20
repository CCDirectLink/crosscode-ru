import { RuTranslationToolNgClient } from './src/tool-client.js';

export default class RuTranslationToolNgPlugin extends Plugin {
  constructor(mod) {
    super();
    this.baseDirectory = mod.baseDirectory;
  }

  postload() {
    return import('./postload.js');
  }

  prestart() {
    window.ruTranslationToolNg = new RuTranslationToolNgClient(
      `${this.baseDirectory}/tool`,
    );
    return import('./prestart.js');
  }
}
