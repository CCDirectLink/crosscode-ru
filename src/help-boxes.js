ig.module('crosscode-ru.fixes.help-boxes')
  .requires('game.feature.menu.gui.help-boxes', 'crosscode-ru.ticker-display')
  .defines(() => {
    sc.MultiPageBoxGui.inject({
      _createInitContent(width) {
        this.parent(width);
        this.header.setTickerConfig({
          maxSize: {
            x: width,
            y: this.header.font.charHeight + this.header.textBlock.linePadding,
          },
        });
      },
    });
  });
