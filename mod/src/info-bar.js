ig.module('crosscode-ru.fixes.info-bar')
  .requires('game.feature.menu.gui.menu-misc', 'crosscode-ru.ticker-display')
  .defines(() => {
    // TODO: ticker required for:
    // sc.MainMenu
    // sc.TradeMenu
    // sc.QuickMenu

    sc.InfoBar.inject({
      init(width, height, skipRender) {
        if (width == null) width = ig.system.width;
        if (height == null) height = 21;
        if (skipRender == null) skipRender = false;
        ig.GuiElementBase.prototype.init.call(this);
        console.log(width, height);
        this.setSize(width, height);
        this.setStateValue('HIDDEN', 'offsetY', -this.hook.size.y);
        this.skipRender = skipRender;
        this.text = new sc.ru.LongHorizontalTextGui('');
        this.text.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_CENTER);
        this.text.setPos(8, 0);
        this.text.hook.transitions = {
          DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.EASE },
          FADE_OUT: {
            state: { alpha: 0 },
            time: 0.2,
            timeFunction: KEY_SPLINES.LINEAR,
          },
          HIDDEN: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        };
        this.text.doStateTransition('HIDDEN', true);
        this.addChildGui(this.text);
        this.doStateTransition('HIDDEN', true);
      },
    });
  });
