import { TranslationToolClient } from './tool-client.js';

declare global {
  namespace sc {
    interface TitleScreenButtonGui {
      translationToolButton: sc.ButtonGui;
    }

    interface PauseScreenGui {
      translationToolButton: sc.ButtonGui;
    }
  }

  namespace sc.ru {
    let translationTool: TranslationToolClient;
  }
}
