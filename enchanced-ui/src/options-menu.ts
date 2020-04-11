ig.module('enchanced-ui.fixes.options-menu')
  .requires(
    'game.feature.menu.gui.options.options-types',
    'game.feature.menu.gui.options.options-misc',
    'enchanced-ui.ticker-display',
  )
  .defines(() => {
    sc.OptionRow.inject({
      init(option, ...args) {
        this.parent(option, ...args);
        let lineHook = this.hook.children[1];
        let slopeHook = this.hook.children[2];

        if (this.option.type === 'CHECKBOX') {
          // NOTE: injections in simplify's "main" stage is executed much later
          // than this code, so I disable checkboxRightAlign here to avoid
          // interference with simplify because I do the same checkboxRightAlign
          // does, but apply it to every checkbox.
          this.option.checkboxRightAlign = false;

          let checkbox = (this.typeGui as sc.OPTION_GUIS_defs.CHECKBOX).button;
          checkbox.hook.align.x = ig.GUI_ALIGN.X_RIGHT;
          const additionalWidth =
            this.typeGui.hook.size.x - checkbox.hook.size.x;
          lineHook.size.x += additionalWidth;
          slopeHook.pos.x += additionalWidth;
        }

        this.nameGui.tickerHook.maxSize = {
          x: lineHook.size.x - this.nameGui.hook.pos.x + 2,
        };
        this.nameGui.tickerHook.speed.x *= 1.25;
        this.nameGui.tickerHook.delayAtBorders.x /= 1.25;
      },

      update() {
        this.parent();
        // this._hasEntered is set in onMouseInteract of this class
        // TODO: check whether this.typeGui is focused
        if (!this._hasEntered) this.nameGui.tickerHook.timer = 0;
      },
    });

    sc.KeyBinderGui.inject({
      init() {
        this.parent();
        this.anykeyText = this.box.hook.children[2].gui as sc.TextGui;
      },

      show(...args) {
        this.parent(...args);

        let maxButtonWidth = Math.max(
          this.button.hook.size.x,
          this.back.hook.size.x,
        );
        this.button.setWidth(maxButtonWidth);
        this.back.setWidth(maxButtonWidth);

        this.box.setSize(
          Math.max(
            150,
            this.anykeyText.hook.size.x + this.anykeyText.hook.pos.y * 2,
            this.button.hook.pos.x +
              maxButtonWidth +
              4 +
              maxButtonWidth +
              this.back.hook.pos.x,
          ),
          this.box.hook.size.y,
        );
      },
    });
  });
