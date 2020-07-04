ig.module('crosscode-ru.fixes.lore-menu')
  .requires('game.feature.menu.gui.lore.lore-misc')
  .defines(() => {
    const TITLE_HORIZONTAL_MARGIN_LEFT = 33;

    sc.LoreInfoBox.inject({
      init(...args) {
        this.parent(...args);
        this.alternative.tickerHook.maxWidth =
          this.scrollContainer.hook.pos.x +
          this.scrollContainer.hook.size.x -
          this.alternative.hook.pos.x;
        this.alternative.tickerHook.focusTarget = this;
      },

      setLore(...args) {
        let result: void = this.parent(...args);

        let overflow =
          this.title.hook.size.x >
          this.hook.size.x - TITLE_HORIZONTAL_MARGIN_LEFT * 2;
        this.title.setAlign(
          overflow ? ig.GUI_ALIGN.X_LEFT : ig.GUI_ALIGN.X_CENTER,
          this.title.hook.align.y,
        );
        this.title.setPos(
          overflow ? TITLE_HORIZONTAL_MARGIN_LEFT : 0,
          this.title.hook.pos.y,
        );

        return result;
      },
    });
  });
