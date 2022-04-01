declare namespace sc.ui2 {
  function waitForLoadable<T extends ig.Loadable | ig.SingleLoadable>(loadable: T): Promise<T>;

  function textRecolorDrawCallback(textBlock: ig.TextBlock, newColor: number[]): void;
}
