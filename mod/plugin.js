export default class CrossCodeRuTranslationToolNgPlugin extends Plugin {
  constructor(mod) {
    super();
    this.baseDirectory = mod.baseDirectory;
  }

  postload() {
    return import('./postload.js');
  }

  prestart() {
    window.ruTranslationToolNg = {
      openWindow: () => {
        const nw = require('nw.gui');
        nw.Window.open(
          `${this.baseDirectory}/tool/main.html`,
          // magic values from the game's package.json
          { width: 1136, height: 640 },
          toolWindow => {
            toolWindow.window.gameWindow = window;
          },
        );
      },
    };

    return import('./prestart.js');
  }
}
