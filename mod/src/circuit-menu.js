ig.module('crosscode-ru.fixes.circuit-menu')
  .requires('game.feature.menu.gui.circuit.circuit-detail-elements')
  .defines(() => {
    sc.CircuitInfoBox.inject({
      init(scrollHook) {
        this.parent(scrollHook);
        this.special.setPos(8, 2);
        this.special.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM);
      },
    });
  });
