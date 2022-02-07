declare namespace sc {
  interface QuickBorderArrowLevelBox {
    renderLevelLabelAsTextBlock: boolean;

    levelLabel?: sc.TextGui | null;

    getLevelColorRgb(this: this): number[];
  }
}
