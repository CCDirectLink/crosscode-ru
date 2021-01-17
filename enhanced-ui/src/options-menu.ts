ig.module('enhanced-ui.fixes.options-menu')
  .requires(
    'game.feature.menu.gui.options.options-types',
    'game.feature.menu.gui.options.options-misc',
    'enhanced-ui.ticker-display',
  )
  .defines(() => {
    sc.OptionRow.inject({
      childFocusTargets: [],

      init(optionName, row, rowGroup, ...args) {
        let option = sc.OPTIONS_DEFINITION[optionName];
        if (option.type === 'CHECKBOX') option.checkboxRightAlign = true;

        let rowGroupAddFocusGui = rowGroup.addFocusGui;
        let focusTargets: ig.FocusGui[] = [];
        try {
          rowGroup.addFocusGui = function (gui, ...args2) {
            focusTargets.push(gui);
            return rowGroupAddFocusGui.call(this, gui, ...args2);
          };

          this.parent(optionName, row, rowGroup, ...args);
        } finally {
          rowGroup.addFocusGui = rowGroupAddFocusGui;
        }

        this.childFocusTargets = focusTargets;

        let lineHook = this.hook.children[1];
        this.nameGui.tickerHook.maxWidth = lineHook.size.x - this.nameGui.hook.pos.x + 2;
        this.nameGui.tickerHook.speed *= 1.25;
        this.nameGui.tickerHook.delayAtBorders /= 1.25;
      },

      update() {
        this.parent();
        // this._hasEntered is set in onMouseInteract of this class
        if (!this._hasEntered && !this.childFocusTargets.some((target) => target.focus)) {
          this.nameGui.tickerHook.timer = 0;
        }
      },
    });

    sc.KeyBinderGui.inject({
      init() {
        this.parent();
        this.anykeyText = this.box.hook.children[2].gui as sc.TextGui;
      },

      show(...args) {
        this.parent(...args);

        let maxButtonWidth = Math.max(this.button.hook.size.x, this.back.hook.size.x);
        this.button.setWidth(maxButtonWidth);
        this.back.setWidth(maxButtonWidth);

        this.box.setSize(
          Math.max(
            150,
            this.anykeyText.hook.size.x + this.anykeyText.hook.pos.y * 2,
            this.button.hook.pos.x + maxButtonWidth + 4 + maxButtonWidth + this.back.hook.pos.x,
          ),
          this.box.hook.size.y,
        );
      },
    });
  });
