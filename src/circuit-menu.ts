ig.module('crosscode-ru.fixes.circuit-menu')
  .requires(
    'game.feature.menu.gui.circuit.circuit-detail-elements',
    'enchanced-ui.ticker-display',
  )
  .defines(() => {
    sc.CircuitInfoBox.inject({
      init(scrollHook) {
        this.parent(scrollHook);
        this.special.setPos(8, 2);
        this.special.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM);
      },
    });

    sc.CircuitNodeMenu.inject({
      init(scrollHook) {
        this.parent(scrollHook);
        let btn = this.activate;
        btn.textChild.tickerHook.maxSize = {
          x: btn.hook.size.x - btn.textChild.hook.pos.x * 2 + 1,
        };
      },
    });
  });
