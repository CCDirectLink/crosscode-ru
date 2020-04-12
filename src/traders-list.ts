// TODO: make item names and the detailed menu that comes up when clicking an
// offer in the traders list bigger.

ig.module('crosscode-ru.fixes.traders-list')
  .requires(
    'game.feature.menu.gui.trade.trade-misc',
    'game.feature.menu.gui.trade.trader-list',
    'localize-me.final-locale.ready',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    function patchTraderLocation(location: sc.TextGui): void {
      location.textBlock.linePadding = -3;
    }

    function setTraderLocationText(
      location: sc.TextGui,
      traderId: string,
    ): void {
      let foundTrader = sc.trade.getFoundTrader(traderId);
      location.setText(
        `${foundTrader.area || '???'}\n> ${foundTrader.map || '???'}`,
      );
    }

    sc.TradeButtonBox.inject({
      init(trader, ...args) {
        this.parent(trader, ...args);
        patchTraderLocation(this.location);
        setTraderLocationText(this.location, trader);
      },
    });

    const TRADERS_LIST_ADDITIONAL_WIDTH = 32;
    sc.TradersListBox.inject({
      init() {
        let setSizeOld = this.setSize;
        let setPivotOld = this.setPivot;
        let setPanelSizeOld = this.setPanelSize;
        this.setSize = (w, h): void =>
          setSizeOld.call(this, w + TRADERS_LIST_ADDITIONAL_WIDTH, h);
        this.setPivot = (x, y): void =>
          setPivotOld.call(this, x + TRADERS_LIST_ADDITIONAL_WIDTH, y);
        this.setPanelSize = (w, h): void =>
          setPanelSizeOld.call(this, w + TRADERS_LIST_ADDITIONAL_WIDTH, h);

        this.parent();

        this.setSize = setSizeOld;
        this.setPivot = setPivotOld;
        this.setPanelSize = setPanelSizeOld;
      },

      onCreateListEntries(list, ...args) {
        let listSetSizeOld = list.setSize;
        list.setSize = (w, h): void =>
          listSetSizeOld.call(list, w + TRADERS_LIST_ADDITIONAL_WIDTH, h);

        this.parent(list, ...args);

        list.setSize = listSetSizeOld;

        for (let hook of list.contentPane.hook.children) {
          hook.pos.x += TRADERS_LIST_ADDITIONAL_WIDTH;
        }
        for (let hook of (list as sc.ButtonListBox & {
          traderInfoGui: ig.GuiElementBase;
        }).traderInfoGui.hook.children) {
          hook.size.x += TRADERS_LIST_ADDITIONAL_WIDTH;
        }
      },
    });

    sc.TradeDetailsView.inject({
      init() {
        this.parent();
        this.hook.pos.x -= TRADERS_LIST_ADDITIONAL_WIDTH / 2;
        patchTraderLocation(this.location);
      },

      setTraderData(trader, ...args) {
        let shouldUpdateLocation = this._trader !== trader;
        this.parent(trader, ...args);
        if (shouldUpdateLocation) setTraderLocationText(this.location, trader);
      },
    });
  });
