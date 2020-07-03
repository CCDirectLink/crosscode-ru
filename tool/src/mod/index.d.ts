declare namespace sc {
  interface TitleScreenButtonGui {
    translationToolButton: sc.ButtonGui;
  }

  interface PauseScreenGui {
    translationToolButton: sc.ButtonGui;
  }
}

declare namespace sc.ru {
  let translationTool: import('./tool-client').default;
}
