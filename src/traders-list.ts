ig.module('crosscode-ru.fixes.traders-list')
  .requires(
    'game.feature.menu.gui.trade.trade-misc',
    'game.feature.menu.gui.trade.trader-list',
    'ultimate-localized-ui.fixes.traders-list',
    'localize-me.final-locale.ready',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.TradeButtonBox.prototype.UI2_SPLIT_LOCATION_INTO_TWO_LINES = true;
    sc.TradersListBox.prototype.UI2_ADDITIONAL_WIDTH = 32;
  });
