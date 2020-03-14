ig.module('crosscode-ru.fixes.info-bar')
  .requires('game.feature.menu.gui.menu-misc', 'crosscode-ru.ticker-display')
  .defines(() => {
    sc.InfoBar.inject({
      init(width, height, skipRender) {
        if (width == null) width = ig.system.width;
        if (height == null) height = 21;
        if (skipRender == null) skipRender = false;

        // THE ORIGINAL CODE INCOMING
        ig.GuiElementBase.prototype.init.call(this);
        this.setSize(width, height);
        this.setStateValue('HIDDEN', 'offsetY', -this.hook.size.y);
        this.skipRender = skipRender;
        // this is the only changed line:
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
        // END OF THE ORIGINAL COdE

        this.text.tickerHook.speed.x *= 1.5;
        this._updateTickerMaxSize();
      },

      update() {
        let shouldUpdateMaxSize = this.sizeTransition != null;
        this.parent();
        if (shouldUpdateMaxSize) this._updateTickerMaxSize();
      },

      doSizeTransition(width, height, time, timeFunction, delay) {
        this.parent(width, height, time, timeFunction, delay);
        if (time == null) this._updateTickerMaxSize();
      },

      addChildGui(gui) {
        this.parent(gui);
        if (gui instanceof sc.BuffInfo) {
          this.associatedBuffInfo = gui;
          let buffInfoSetText = this.associatedBuffInfo.setText;
          this.associatedBuffInfo.setText = (text, initDelay) => {
            buffInfoSetText.call(this.associatedBuffInfo, text, initDelay);
            if (initDelay == null || initDelay <= 0)
              this._updateTickerMaxSize();
          };
        }
      },

      _updateTickerMaxSize() {
        let maxWidth = this.hook.size.x - this.text.hook.pos.x * 2;
        let buffInfo = this.associatedBuffInfo;
        if (buffInfo != null && buffInfo._width > 0) {
          maxWidth -= buffInfo._width + buffInfo.hook.pos.x;
        }
        this.text.tickerHook.setMaxSize({ x: maxWidth });
      },
    });
  });
