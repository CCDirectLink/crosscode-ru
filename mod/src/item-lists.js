ig.module('crosscode-ru.fixes.item-lists')
  .requires()
  .defines(() => {
    sc.ButtonGui.inject({
      iconTextChild: null,
    });

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
        if (text == null) text = '';
        if (maxNumber == null) maxNumber = 99;

        let iconSequence = null;
        let match = /^\\i\[[^\]]+\]/.exec(text);
        if (match != null) {
          iconSequence = match[0];
          text = text.slice(iconSequence.length);
        }

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
          let { button } = this;
          let { textChild } = button;

          let iconTextChild = new sc.TextGui(iconSequence, {
            speed: ig.TextBlock.SPEED.IMMEDIATE,
          });
          iconTextChild.setAlign(
            textChild.hook.align.x,
            textChild.hook.align.y,
          );
          iconTextChild.setPos(textChild.hook.pos.x, textChild.hook.pos.y);

          button.iconTextChild = iconTextChild;
          button.addChildGui(iconTextChild);
          let alignXPadding = textChild.hook.pos.x;
          textChild.hook.pos.x += iconTextChild.hook.size.x;

          let tickerMaxWidth =
            button.hook.size.x - iconTextChild.hook.size.x - alignXPadding * 2;
          textChild.setTickerConfig({
            maxSize: { x: tickerMaxWidth },
          });
        }

        // from the constructor of sc.ItemBoxButton
        if (amount >= 0) {
          this.amount = new sc.NumberGui(maxNumber);
          this.amount.setNumber(amount, true);
          this.amount.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
          this.amount.setPos(5, 7);
          this.addChildGui(this.amount);
        }
        this.setLevel(level);
      },

      setLevel(level) {
        if (level == null) level = 0;
        this.level = level;
        let target =
          this.button.iconTextChild != null
            ? this.button.iconTextChild
            : this.button.textChild;
        target.setDrawCallback(
          this.level > 0
            ? (a, b) => {
                sc.MenuHelper.drawLevel(this.level, a, b, this.numberGfx);
              }
            : null,
        );
      },

      // well... [insert shrug face here]

      setDrawCallback(_callback) {
        // setDrawCallback is used only in setLevel which I overwrite here
        throw new Error(
          'crosscode-ru: sc.ItemBoxButton.setDrawCallback: unimplemented',
        );
      },

      setButtonText(_text) {
        // setButtonText isn't used at all in the entire codebase
        throw new Error(
          'crosscode-ru: sc.ItemBoxButton.setButtonText: unimplemented',
        );
      },

      setText(_text) {
        // setText may be used somewhere, but I was too lazy to search for its
        // usages. I guess I'll find this out when the game crashes.
        throw new Error(
          'crosscode-ru: sc.ItemBoxButton.setText: unimplemented',
        );
      },
    });
  });
