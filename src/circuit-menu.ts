ig.module('crosscode-ru.fixes.circuit-menu')
  .requires(
    'game.feature.menu.gui.circuit.circuit-detail-elements',
    'ultimate-localized-ui.ticker-display',
    'localize-me.final-locale.ready',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.CircuitInfoBox.inject({
      init(...args) {
        this.parent(...args);
        this.special.setPos(this.header.hook.pos.x, this.header.hook.pos.y);
        this.special.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM);
      },
    });

    sc.CircuitNodeMenu.inject({
      init(...args) {
        this.parent(...args);
        let btn = this.activate;
        btn.textChild.tickerHook.maxWidth = btn.hook.size.x - btn.textChild.hook.pos.x * 2 + 1;
      },
    });
  });
