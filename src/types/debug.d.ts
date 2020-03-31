declare namespace sc.ru.debug {
  let showTickerBoundaryBoxes: boolean;
  let showUntranslatedStrings: boolean;

  function highlightUpdateDrawables(
    this: ig.GuiElementBase & {
      parent(this: ig.GuiElementBase, renderer: ig.GuiRenderer): void;
    },
    renderer: ig.GuiRenderer,
  ): void;

  function highlightGuiInstances(clazz: { prototype: ig.GuiElementBase }): void;
}
