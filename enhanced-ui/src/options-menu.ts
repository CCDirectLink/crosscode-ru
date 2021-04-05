ig.module('ultimate-localized-ui.fixes.options-menu')
  .requires(
    'game.feature.menu.gui.options.options-types',
    'game.feature.menu.gui.options.options-misc',
    'ultimate-localized-ui.ticker-display',
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

        let lineHook = this.hook.children.find(({ gui }) => gui instanceof ig.ColorGui);
        if (lineHook != null) {
          this.nameGui.tickerHook.maxWidth = lineHook.size.x - this.nameGui.hook.pos.x + 2;
          this.nameGui.tickerHook.speed *= 1.25;
          this.nameGui.tickerHook.delayAtBorders /= 1.25;
        }
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
      anykeyText: null,

      init() {
        this.parent();
        let anykeyTextStr = ig.lang.get('sc.gui.options.controls.anykey');
        for (let { gui } of this.box.hook.children) {
          if (gui instanceof sc.TextGui && gui.text === anykeyTextStr) {
            this.anykeyText = gui;
            break;
          }
        }
      },

      show(...args) {
        this.parent(...args);
        if (this.anykeyText == null) return;

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
