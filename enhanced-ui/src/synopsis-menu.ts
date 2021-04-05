ig.module('ultimate-localized-ui.fixes.synopsis-menu')
  .requires('game.feature.menu.gui.synop.synop-misc', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.LogGuiTypeBase.inject({
      init(...args) {
        this.parent(...args);
        this.textGui.tickerHook.maxWidth = this.hook.size.x - this.textGui.hook.pos.x - 2;
      },
    });
  });
