declare namespace sc {
  interface SocialEntryButton {
    UI2_DRAW_STATUS_AS_TEXT_BLOCK: boolean;
    statusNinepatch: ig.NinePatch;
    statusWrapperGui: ig.BoxGui;
    statusTextGui: sc.TextGui;
    statusTextRecolors: Record<string, number[]>;
    statusTexts: Record<string, string>;
  }
}
