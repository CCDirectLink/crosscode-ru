ig.module('crosscode-ru.fixes.item-lists')
  .requires('game.feature.menu.gui.menu-misc', 'crosscode-ru.ticker-display')
  .defines(() => {
    sc.ButtonGui.inject({
      iconTextChild: null,

      _getDefaultTextChildPos() {
        return { x: this.buttonType.alignXPadding || 0, y: 0 };
      },
    });

    function parseButtonIconText(text) {
      if (text == null) text = '';
      if (typeof text === 'object') text = text.toString();

      let iconSequence = null;
      let match = /^\\i\[[^\]]+\]/.exec(text);
      if (match != null) {
        iconSequence = match[0];
        text = text.slice(iconSequence.length);
      }

      return { iconSequence, text };
    }

    sc.ListBoxButton.inject({
      init(text, ...args) {
        let iconSequence;
        if (this.enableTickerDisplay) {
          ({ iconSequence, text } = parseButtonIconText(text));
        }

        this.parent(text, ...args);

        if (this.enableTickerDisplay) this._setIconSequence(iconSequence);
      },

      setText(text) {
        if (!this.enableTickerDisplay) return this.parent(text);

        let iconSequence;
        ({ iconSequence, text } = parseButtonIconText(text));

        let btn = this.button;
        btn.text = text;
        btn.textChild.setText(btn.getButtonText());
        btn.setWidth(this._width);

        this._setIconSequence(iconSequence);
      },

      _setIconSequence(icon) {
        let { iconTextChild } = this.button;
        if (icon != null) {
          if (iconTextChild != null) iconTextChild.setText(icon);
          else this._addButtonIconTextChild(icon);
        } else if (iconTextChild != null) {
          this._removeButtonIconTextChild();
        }
        this._updateButtonTextChildTickerConfig();
      },

      _addButtonIconTextChild(iconSequence) {
        let btn = this.button;

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
        this.setDrawCallback(null);
        btn.removeChildGui(btn.iconTextChild);
        btn.iconTextChild = null;
        let pos = btn._getDefaultTextChildPos();
        btn.textChild.setPos(pos.x, pos.y);
      },

      _updateButtonTextChildTickerConfig() {
        let btn = this.button;
        let padding = sc.BUTTON_TYPE.ITEM.alignXPadding;
        let tickerMaxWidth =
          btn.hook.size.x - btn.textChild.hook.pos.x - padding;
        if (btn.textChild.hook.align.x === ig.GUI_ALIGN_X.CENTER)
          tickerMaxWidth -= padding;
        btn.textChild.setTickerConfig({
          maxSize: { x: tickerMaxWidth },
          focusTarget: btn,
        });
      },

      setDrawCallback(callback) {
        if (!this.enableTickerDisplay) return this.parent(callback);

        let btn = this.button;
        if (btn.iconTextChild == null) {
          if (callback == null) return;
          throw new Error(
            'crosscode-ru: sc.ListBoxButton.setDrawCallback: unsupported on a button without an icon because I am lazy',
          );
        }
        // fortunately, the whole drawCallback feature is used only for
        // adding levels to equipment icons
        btn.iconTextChild.setDrawCallback(callback);
      },

      setButtonText(_text) {
        // well... [insert shrug face here]
        // setButtonText isn't used at all in the entire codebase
        throw new Error(
          'crosscode-ru: sc.ListBoxButton.setButtonText: unimplemented',
        );
      },
    });

    // here's a full list of classes which are descendants of sc.ListBoxButton:
    // sc.ItemBoxButton
    // sc.DebugSkillLearner.ItemBoxButton
    // sc.ShopItemButton
    // sc.SocialEntryButton
    // sc.EnemyEntryButton
    // sc.LoreEntryButton
    // sc.TradeItem
    // - TradeEntryButton
    // sc.BotanicsEntryButton
    // sc.ArenaEntryButton
    // - sc.ArenaRoundEntryButton
    // sc.NewGameOptionButton
    // TODO: put these in separate modules
    sc.ItemBoxButton.inject({ enableTickerDisplay: true });
    sc.ShopItemButton.inject({ enableTickerDisplay: true });
    sc.TradeItem.inject({ enableTickerDisplay: true });
    sc.BotanicsEntryButton.inject({ enableTickerDisplay: true });
    sc.NewGameOptionButton.inject({ enableTickerDisplay: true });
  });

ig.module('crosscode-ru.fixes.new-game-menu')
  .requires('game.feature.menu.gui.new-game.new-game-misc')
  .defines(() => {
    sc.NewGameOptionButton.inject({
      name: null,

      init(name, ...args) {
        this.name = name;
        this.parent('', ...args);
      },

      updateToggleState() {
        let enabled = sc.newgame.options[this.data.id] || false;
        let text = '\\i[toggle-item-';
        text += enabled ? 'on' : 'off';
        if (this.set.type === sc.TOGGLE_SET_TYPE.SINGLE) text += '-radio';
        if (!this.active) text += '-grey';
        text += ']';
        text += this.name;
        // the original implementation calls this.button.textChild.setText
        this.setText(text);
      },
    });
  });

ig.module('crosscode-ru.fixes.item-lists.trade-gui')
  .requires(
    'game.feature.trade.gui.trade-icon',
    'game.feature.trade.gui.equip-toggle-stats',
    'crosscode-ru.ticker-display',
  )
  .defines(() => {
    sc.TradeToggleStats.inject({
      _createContent() {
        this.parent();
        this.compareItem.setTickerConfig({
          maxSize: {
            x:
              this.hook.size.x -
              this.compareItem.hook.pos.x -
              this.compareHelpText.hook.pos.x,
          },
        });
      },
    });

    sc.TradeIconGui.inject({
      _createContent() {
        this.parent();
        this.entries.forEach(entry => {
          entry.gui.setTickerConfig({ maxSize: { x: this.hook.size.x } });
        });
      },
    });
  });

ig.module('crosscode-ru.fixes.item-lists.status-main-equipment')
  .requires(
    'game.feature.menu.gui.status.status-view-main',
    'crosscode-ru.ticker-display',
  )
  .defines(() => {
    sc.StatusViewMainEquipment.Entry.inject({
      init(...args) {
        this.parent(...args);
        this.itemGui.hook.pos.x = this.textGui.hook.pos.x;
        this.itemGui.setTickerConfig({
          maxSize: {
            x: this.hook.size.x - this.itemGui.hook.pos.x * 2,
          },
        });
      },
    });
  });

ig.module('crosscode-ru.fixes.item-lists.social-menu')
  .requires(
    'game.feature.menu.gui.social.social-misc',
    'crosscode-ru.ticker-display',
  )
  .defines(() => {
    sc.SocialInfoBox.inject({
      setCharacter(id) {
        this.parent(id);
        this.equip.hook.children.forEach(({ gui }) => {
          gui.setTickerConfig({
            maxSize: { x: this.equip.hook.size.x },
          });
        });
      },
    });
  });
