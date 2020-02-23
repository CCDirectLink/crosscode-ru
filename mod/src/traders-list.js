// TODO: make item names and the detailed menu that comes up when clicking an
// offer in the traders list bigger.

ig.module('crosscode-ru.fixes.traders-list')
  .requires(
    'game.feature.menu.gui.trade.trade-misc',
    'game.feature.menu.gui.trade.trader-list',
  )
  .defines(() => {
    sc.TradeButtonBox.inject({
      init(traderName, buttonGroup, buttonStartIndex) {
        this.parent(traderName, buttonGroup, buttonStartIndex);
        this.location.textBlock.linePadding = -2;
        let foundTrader = sc.trade.getFoundTrader(traderName);
        this.location.setText(
          (foundTrader.area || '???') + '\n> ' + (foundTrader.map || '???'),
        );
      },
    });

    const TRADERS_LIST_ADDITIONAL_WIDTH = 32;
    sc.TradersListBox.inject({
      init(...args) {
        let setSizeOld = this.setSize;
        let setPivotOld = this.setPivot;
        let setPanelSizeOld = this.setPanelSize;
        this.setSize = (w, h) =>
          setSizeOld.call(this, w + TRADERS_LIST_ADDITIONAL_WIDTH, h);
        this.setPivot = (x, y) =>
          setPivotOld.call(this, x + TRADERS_LIST_ADDITIONAL_WIDTH, y);
        this.setPanelSize = (w, h) =>
          setPanelSizeOld.call(this, w + TRADERS_LIST_ADDITIONAL_WIDTH, h);

        this.parent(...args);

        this.setSize = setSizeOld;
        this.setPivot = setPivotOld;
        this.setPanelSize = setPanelSizeOld;
      },

      onCreateListEntries(list, ...args) {
        let listSetSizeOld = list.setSize;
        list.setSize = (w, h) =>
          listSetSizeOld.call(list, w + TRADERS_LIST_ADDITIONAL_WIDTH, h);

        this.parent(list, ...args);

        list.setSize = listSetSizeOld;

        list.contentPane.hook.children.forEach(hook => {
          hook.pos.x += TRADERS_LIST_ADDITIONAL_WIDTH;
        });
        list.traderInfoGui.hook.children.forEach(hook => {
          hook.size.x += TRADERS_LIST_ADDITIONAL_WIDTH;
        });
      },
    });
  });
