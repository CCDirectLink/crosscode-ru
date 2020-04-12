ig.module('enchanced-ui.fixes.help.boxes')
  .requires('game.feature.menu.gui.help-boxes', 'enchanced-ui.ticker-display')
  .defines(() => {
    sc.MultiPageBoxGui.inject({
      _createInitContent(width) {
        this.parent(width);
        this.header.tickerHook.maxWidth = width;
      },
    });
  });
