ig.module('ultimate-localized-ui.fixes.lore-menu')
  .requires('game.feature.menu.gui.lore.lore-misc', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.LoreInfoBox.inject({
      init(...args) {
        this.parent(...args);

        this.title.tickerHook.focusTarget = this;
        this.alternative.tickerHook.focusTarget = this;
      },

      setLore(...args) {
        let result = this.parent(...args);

        const TITLE_HORIZONTAL_MARGIN_LEFT = 33;
        let overflow = this.title.hook.size.x > this.hook.size.x - TITLE_HORIZONTAL_MARGIN_LEFT * 2;
        if (overflow) {
          this.title.setAlign(ig.GUI_ALIGN.X_LEFT, this.title.hook.align.y);
          this.title.setPos(TITLE_HORIZONTAL_MARGIN_LEFT, this.title.hook.pos.y);
          this.title.tickerHook.maxWidth =
            this.scrollContainer.hook.pos.x +
            this.scrollContainer.hook.size.x -
            this.title.hook.pos.x;
        } else {
          this.title.setAlign(ig.GUI_ALIGN.X_CENTER, this.title.hook.align.y);
          this.title.setPos(0, this.title.hook.pos.y);
          this.title.tickerHook.maxWidth = null;
        }

        this.alternative.tickerHook.maxWidth =
          this.scrollContainer.hook.pos.x +
          this.scrollContainer.hook.size.x -
          this.alternative.hook.pos.x;

        return result;
      },
    });
  });
