const nw = require('nw.gui');

export class RuTranslationToolNgClient {
  constructor(baseDirectory) {
    this.baseDirectory = baseDirectory;
    this.gameWindow = nw.Window.get();
    this.toolWindow = null;
    this.toolWindowIsOpening = false;

    // TODO: enable this when I find a workaround for listening to window
    //       events in the game iframe
    // this.gameWindow.on('close', this.onGameWindowClose.bind(this));
  }

  open() {
    if (this.toolWindowIsOpening) return;
    if (this.toolWindow != null) {
      this.toolWindow.focus();
      return;
    }

    this.toolWindowIsOpening = true;
    nw.Window.open(
      `${this.baseDirectory}/main.html`,
      // magic values from the game's package.json
      { width: 1136, height: 640 },
      toolWindow => {
        this.toolWindow = toolWindow;
        this.toolWindowIsOpening = false;

        this.toolWindow.window.gameWindow = this.gameWindow;

        this.toolWindow.on('closed', () => {
          this.toolWindow = null;
        });
      },
    );
  }

  onGameWindowClose() {
    if (this.toolWindow != null) this.toolWindow.close();
    this.gameWindow.close(true);
  }
}
