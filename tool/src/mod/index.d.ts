declare namespace sc {
  interface TitleScreenButtonGui {
    translationToolButton: sc.ButtonGui;
  }

  interface PauseScreenGui {
    translationToolButton: sc.ButtonGui;
  }
}

declare namespace sc.ru {
  namespace TranslationToolClient {
    interface Settings {
      autoOpen?: boolean;
    }
  }

  interface TranslationToolClient {
    readSettings(this: this): Promise<sc.ru.TranslationToolClient.Settings>;
    open(this: this): void;
  }

  let translationTool: TranslationToolClient;
}
