declare namespace sc {
  interface QuickBorderArrowLevelBox {
    UI2_DRAW_LEVEL_LABEL_AS_TEXT_BLOCK: boolean;

    levelLabel?: sc.TextGui | null;

    getLevelColorRgb(this: this): number[];
  }
}
