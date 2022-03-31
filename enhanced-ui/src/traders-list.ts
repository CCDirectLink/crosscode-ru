ig.module('ultimate-localized-ui.fixes.traders-list')
  .requires('game.feature.menu.gui.trade.trade-misc', 'game.feature.menu.gui.trade.trader-list')
  .defines(() => {
    sc.TradersListBox.inject({
      UI2_ADDITIONAL_WIDTH: 0,

      init(...args) {
        let additionalWidth = this.UI2_ADDITIONAL_WIDTH;
        if (additionalWidth === 0) {
          this.parent(...args);
          return;
        }

        let setSizeOld = this.setSize;
        let setPivotOld = this.setPivot;
        let setPanelSizeOld = this.setPanelSize;
        try {
          this.setSize = (w, h) => setSizeOld.call(this, w + additionalWidth, h);
          this.setPivot = (x, y) => setPivotOld.call(this, x + additionalWidth, y);
          this.setPanelSize = (w, h) => setPanelSizeOld.call(this, w + additionalWidth, h);
          this.parent(...args);
        } finally {
          this.setSize = setSizeOld;
          this.setPivot = setPivotOld;
          this.setPanelSize = setPanelSizeOld;
        }
      },

      onCreateListEntries(list, ...args) {
        let additionalWidth = this.UI2_ADDITIONAL_WIDTH;
        if (additionalWidth === 0) {
          this.parent(list, ...args);
          return;
        }

        let listSetSizeOld = list.setSize;
        try {
          list.setSize = (w, h) => listSetSizeOld.call(list, w + additionalWidth, h);
          this.parent(list, ...args);
        } finally {
          list.setSize = listSetSizeOld;
        }

        for (let hook of list.contentPane.hook.children) {
          hook.pos.x += additionalWidth;
        }
        for (let hook of (list as sc.ButtonListBox & { traderInfoGui: ig.GuiElementBase })
          .traderInfoGui.hook.children) {
          hook.size.x += additionalWidth;
        }
      },
    });

    function patchTraderLocation(location: sc.TextGui): void {
      location.textBlock.linePadding = -3;
    }

    function setTraderLocationText(location: sc.TextGui, traderId: string): void {
      let foundTrader = sc.trade.getFoundTrader(traderId);
      location.setText(`${foundTrader.area || '???'}\n> ${foundTrader.map || '???'}`);
    }

    sc.TradeDetailsView.inject({
      init(...args) {
        this.parent(...args);
        let additionalWidth = sc.TradersListBox.prototype.UI2_ADDITIONAL_WIDTH;
        if (additionalWidth !== 0) {
          this.hook.pos.x -= additionalWidth / 2;
        }
        if (sc.TradeButtonBox.prototype.UI2_SPLIT_LOCATION_INTO_TWO_LINES) {
          patchTraderLocation(this.location);
        }
      },

      setTraderData(trader, ...args) {
        let shouldUpdateLocation = this._trader !== trader;
        this.parent(trader, ...args);
        if (shouldUpdateLocation && sc.TradeButtonBox.prototype.UI2_SPLIT_LOCATION_INTO_TWO_LINES) {
          setTraderLocationText(this.location, trader);
        }
      },
    });

    sc.TradeButtonBox.inject({
      init(trader, ...args) {
        this.parent(trader, ...args);
        if (this.UI2_SPLIT_LOCATION_INTO_TWO_LINES) {
          patchTraderLocation(this.location);
          setTraderLocationText(this.location, trader);
        }
      },
    });
  });
