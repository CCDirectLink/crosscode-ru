import { Settings, readSettings } from '../settings.js';

const TOOL_HTML_PAGE_URL: URL = new URL('../../main.html', import.meta.url);

export default class TranslationToolClient {
  private gameWindow: nw.Window = nw.Window.get();
  private toolWindow: nw.Window | null = null;
  private toolWindowIsOpening = false;

  public constructor() {
    this.gameWindow.on('close', this.onGameWindowClose.bind(this));
  }

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
    let windowOpenOptions: nw.Window.Manifest = { ...nw.App.manifest.window };
    delete windowOpenOptions.toolbar;
    nw.Window.open(TOOL_HTML_PAGE_URL.href, windowOpenOptions, (toolWindow) => {
      if (toolWindow == null) return;

      this.toolWindow = toolWindow;
      this.toolWindowIsOpening = false;

      // (this.toolWindow.window as any).gameWindow = this.gameWindow;
      this.toolWindow.on('closed', () => {
        this.toolWindow = null;
      });
    });
  }

  private onGameWindowClose(): void {
    if (this.toolWindow != null) this.toolWindow.close();
    this.gameWindow.close(true);
  }
}
