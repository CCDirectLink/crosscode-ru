declare namespace sc.ui2.debug {
  let showTickerBoundaryBoxes: boolean;

  function highlightUpdateDrawables(
    this: ig.GuiElementBase & {
      parent(this: ig.GuiElementBase, renderer: ig.GuiRenderer): void;
    },
    renderer: ig.GuiRenderer,
  ): void;

  function highlightGuiInstances(clazz: { prototype: ig.GuiElementBase }): void;
}
