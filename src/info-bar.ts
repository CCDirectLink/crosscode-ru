ig.module('crosscode-ru.fixes.info-bar')
  .requires('game.feature.menu.gui.menu-misc', 'crosscode-ru.ticker-display')
  .defines(() => {
    sc.InfoBar.inject({
      _associatedBuffInfo: null,

      init(...args) {
        this.parent(...args);

        let newText = new sc.ru.LongHorizontalTextGui('');
        newText.setAlign(this.text.hook.align.x, this.text.hook.align.y);
        newText.setPos(this.text.hook.pos.x, this.text.hook.pos.y);
        newText.hook.transitions = this.text.hook.transitions;
        newText.doStateTransition('HIDDEN', true);

        this.removeChildGui(this.text);
        this.addChildGui(newText);
        // API of sc.ru.LongHorizontalTextGui is almost identical to sc.TextGui,
        // so I hope that replacing the later with the former doesn't break
        // anything
        this.text = (newText as unknown) as sc.TextGui;

        // TODO: does this really speed up?
        this.text.tickerHook.speed.x *= 2;
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
          this._associatedBuffInfo = gui;
          let buffInfoSetText = this._associatedBuffInfo.setText;
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          let infoBar = this;
          this._associatedBuffInfo.setText = function(text, initDelay): void {
            buffInfoSetText.call(this, text, initDelay);
            if (initDelay == null || initDelay <= 0)
              infoBar._updateTickerMaxSize();
          };
        }
      },

      _updateTickerMaxSize() {
        let maxWidth = this.hook.size.x - this.text.hook.pos.x * 2;
        let buffInfo = this._associatedBuffInfo;
        if (buffInfo != null && buffInfo._width > 0) {
          maxWidth -= buffInfo._width + buffInfo.hook.pos.x;
        }
        this.text.tickerHook.setMaxSize({ x: maxWidth });
      },
    });
  });
