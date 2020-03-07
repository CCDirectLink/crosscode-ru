ig.module('crosscode-ru.fixes.item-lists')
  .requires()
  .defines(() => {
    sc.ButtonGui.inject({
      iconTextChild: null,

      _getDefaultTextChildPos() {
        return { x: this.buttonType.alignXPadding || 0, y: 0 };
      },
    });

    function parseButtonIconText(text) {
      if (text == null) text = '';

      let iconSequence = null;
      let match = /^\\i\[[^\]]+\]/.exec(text);
      if (match != null) {
        iconSequence = match[0];
        text = text.slice(iconSequence.length);
      }

      return { iconSequence, text };
    }

    sc.ItemBoxButton.inject({
      init(
        text,
        buttonWidth,
        lineWidth,
        amount,
        id,
        description,
        noLine,
        alignCenter,
        sound,
        maxNumber,
        level,
      ) {
        if (maxNumber == null) maxNumber = 99;

        let iconSequence;
        ({ iconSequence, text } = parseButtonIconText(text));

        sc.ListBoxButton.prototype.init.call(
          this,
          text,
          buttonWidth,
          lineWidth,
          id,
          description,
          noLine,
          alignCenter,
          sound,
        );

        if (iconSequence != null) {
          this.level = level;
          this._addButtonIconTextChild(iconSequence);
        }
        this._updateButtonTextChildTickerConfig();

        // from the constructor of sc.ItemBoxButton
        if (amount >= 0) {
          this.amount = new sc.NumberGui(maxNumber);
          this.amount.setNumber(amount, true);
          this.amount.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
          this.amount.setPos(5, 7);
          this.addChildGui(this.amount);
        }
      },

      setText(text) {
        let iconSequence;
        ({ iconSequence, text } = parseButtonIconText(text));
        this.button.textChild.setText(text);
        if (iconSequence != null) this._addButtonIconTextChild(iconSequence);
        else this._removeButtonIconTextChild();
        this._updateButtonTextChildTickerConfig();
      },

      _addButtonIconTextChild(iconSequence) {
        let btn = this.button;
        if (btn.iconTextChild != null) {
          btn.iconTextChild.setText(iconSequence);
          return;
        }

        let { textChild } = btn;
        let iconTextChild = new sc.TextGui(iconSequence, {
          speed: ig.TextBlock.SPEED.IMMEDIATE,
        });
        iconTextChild.setAlign(textChild.hook.align.x, textChild.hook.align.y);

        let pos = btn._getDefaultTextChildPos();
        iconTextChild.setPos(pos.x, pos.y);
        textChild.setPos(pos.x + iconTextChild.hook.size.x, pos.y);

        btn.iconTextChild = iconTextChild;
        btn.addChildGui(iconTextChild);
        this.setLevel(this.level);
      },

      _removeButtonIconTextChild() {
        let btn = this.button;
        if (btn.iconTextChild == null) return;
        this.setDrawCallback(null);
        btn.removeChildGui(btn.iconTextChild);
        btn.iconTextChild = null;
        let pos = btn._getDefaultTextChildPos();
        btn.textChild.setPos(pos.x, pos.y);
      },

      _updateButtonTextChildTickerConfig() {
        let btn = this.button;
        let tickerMaxWidth =
          btn.hook.size.x - sc.BUTTON_TYPE.ITEM.alignXPadding * 2;
        if (btn.iconTextChild != null) {
          tickerMaxWidth -= btn.iconTextChild.hook.size.x;
        }
        btn.textChild.setTickerConfig({
          maxSize: { x: tickerMaxWidth },
          focusTarget: btn,
        });
      },

      setDrawCallback(callback) {
        let btn = this.button;
        if (btn.iconTextChild == null) {
          // fortunately, the whole drawCallback feature is used only for
          // adding levels to item icons
          throw new Error(
            'crosscode-ru: sc.ItemBoxButton.setDrawCallback: unsupported on a button without an icon because I am lazy',
          );
        }
        btn.iconTextChild.setDrawCallback(callback);
      },

      setButtonText(_text) {
        // well... [insert shrug face here]
        // setButtonText isn't used at all in the entire codebase
        throw new Error(
          'crosscode-ru: sc.ItemBoxButton.setButtonText: unimplemented',
        );
      },
    });
  });
