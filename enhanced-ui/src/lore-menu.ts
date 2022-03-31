ig.module('ultimate-localized-ui.fixes.lore-menu')
  .requires('game.feature.menu.gui.lore.lore-misc', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    const LORE_TITLE_HORIZONTAL_MARGIN_LEFT = 33;
    sc.LoreInfoBox.inject({
      init(...args) {
        this.parent(...args);

        this.title.tickerHook.enable = false;
        this.title.tickerHook.maxWidth =
          this.scrollContainer.hook.pos.x +
          this.scrollContainer.hook.size.x -
          LORE_TITLE_HORIZONTAL_MARGIN_LEFT;

        this.alternative.tickerHook.maxWidth =
          this.scrollContainer.hook.pos.x +
          this.scrollContainer.hook.size.x -
          this.alternative.hook.pos.x;

        this.title.tickerHook.focusTarget = this;
        this.alternative.tickerHook.focusTarget = this;
      },

      setLore(...args) {
        let result = this.parent(...args);

        let overflow =
          this.title.hook.size.x > this.hook.size.x - LORE_TITLE_HORIZONTAL_MARGIN_LEFT * 2;
        this.title.setAlign(
          overflow ? ig.GUI_ALIGN.X_LEFT : ig.GUI_ALIGN.X_CENTER,
          this.title.hook.align.y,
        );
        this.title.setPos(overflow ? LORE_TITLE_HORIZONTAL_MARGIN_LEFT : 0, this.title.hook.pos.y);
        this.title.tickerHook.enable = overflow;

        return result;
      },
    });
  });
