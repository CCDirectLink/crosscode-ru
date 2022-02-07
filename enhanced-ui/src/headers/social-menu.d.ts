declare namespace sc {
  interface SocialEntryButton {
    renderStatusAsTextBlock: boolean;
    statusNinepatch: ig.NinePatch;
    statusWrapperGui: ig.BoxGui;
    statusTextGui: sc.TextGui;
    statusTextRecolors: Record<string, number[]>;
    statusTexts: Record<string, string>;
  }
}
