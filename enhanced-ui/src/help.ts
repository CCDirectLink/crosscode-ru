ig.module('ultimate-localized-ui.fixes.help.boxes')
  .requires('game.feature.menu.gui.help-boxes', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.MultiPageBoxGui.inject({
      _createInitContent(width) {
        this.parent(width);
        this.header.tickerHook.maxWidth = width;
      },
    });
  });
