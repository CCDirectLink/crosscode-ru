import { Settings, readSettings } from '../settings.js';

let scriptUrl: string = import.meta.url;
let scriptDir = scriptUrl.slice(0, scriptUrl.lastIndexOf('/'));

export default class TranslationToolClient {
  // private gameWindow: nw.Window = nw.Window.get();
  private toolWindow: nw.Window | null = null;
  private toolWindowIsOpening = false;

  // TODO: enable this when I find a workaround for listening to window events
  // in the game iframe
  // constructor() {
  //   this.gameWindow.on('close', this.onGameWindowClose.bind(this));
  // }

  public readSettings(): Promise<Settings> {
    return readSettings();
  }

  public open(): void {
    if (this.toolWindowIsOpening) return;
    if (this.toolWindow != null) {
      this.toolWindow.focus();
      return;
    }

    this.toolWindowIsOpening = true;
    nw.Window.open(
      `${scriptDir}/../../main.html`,
      // magic values from the game's package.json
      { width: 1136, height: 640 },
      (toolWindow) => {
        if (toolWindow == null) return;

        this.toolWindow = toolWindow;
        this.toolWindowIsOpening = false;

        // (this.toolWindow.window as any).gameWindow = this.gameWindow;
        this.toolWindow.on('closed', () => {
          this.toolWindow = null;
        });
      },
    );
  }

  // private onGameWindowClose(): void {
  //   if (this.toolWindow != null) this.toolWindow.close();
  //   this.gameWindow.close(true);
  // }
}
