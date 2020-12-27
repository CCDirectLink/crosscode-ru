ig.module('enhanced-ui.fixes.inventory-menu')
  .requires(
    'game.feature.menu.gui.item.item-status-trade',
    'enhanced-ui.ticker-display',
  )
  .defines(() => {
    sc.ItemStatusTrade.inject({
      _setTradeInfo(itemID) {
        this.parent(itemID);
        let contentBlockWidth = this.hook.size.x - 2 * this.content.hook.pos.x;
        for (let { gui } of this.content.hook.children) {
          if (!(gui instanceof sc.ItemStatusTrade.BaseEntryType)) continue;
          if (Boolean(gui.textEntry.text) && Boolean(gui.subEntry.text)) {
            gui.textEntry.tickerHook.maxWidth =
              contentBlockWidth - gui.textEntry.hook.pos.x;
            gui.subEntry.tickerHook.maxWidth =
              contentBlockWidth - gui.subEntry.hook.pos.x;
            gui.textEntry.setMaxWidth(null);
          }
        }
      },
    });
  });
