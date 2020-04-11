function guiMapChildren<T extends ig.GuiElementBase = ig.GuiElementBase>(
  gui: ig.GuiElementBase,
  callback: (child: T) => T,
): void {
  let oldChildHooks = [...gui.hook.children];
  gui.removeAllChildren();
  oldChildHooks.forEach(oldChildHook => {
    let newChild = callback(oldChildHook.gui as T);
    gui.addChildGui(newChild as ig.GuiElementBase);
  });
}

ig.module('crosscode-ru.fixes.item-lists')
  .requires('game.feature.menu.gui.menu-misc', 'enchanced-ui.ticker-display')
  .defines(() => {
    sc.ListBoxButton.inject({
      init(...args) {
        this.parent(...args);

        if (this.enableTickerDisplay) {
          let oldTextChild = this.button.textChild;
          let newTextChild = new sc.ui2.IconTextGui(this.button.textChild.text);
          newTextChild.setAlign(
            oldTextChild.hook.align.x,
            oldTextChild.hook.align.y,
          );
          newTextChild.setPos(oldTextChild.hook.pos.x, oldTextChild.hook.pos.y);
          newTextChild.tickerHook.maxSize = {
            x: this.button.hook.size.x - sc.BUTTON_TYPE.ITEM.alignXPadding! * 2,
          };
          newTextChild.tickerHook.focusTarget = this.button;

          this.button.removeChildGui(oldTextChild);
          this.button.addChildGui(newTextChild);
          this.button.textChild = (newTextChild as unknown) as sc.TextGui;
        }
      },

      setText(text) {
        this.button.text = text;
        this.button.textChild.setText(this.button.getButtonText());
        this.button.setWidth(this._width);
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
        let enabled = sc.newgame.options[this.data.id];
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
    'game.feature.menu.gui.shop.shop-stats',
    'enchanced-ui.ticker-display',
  )
  .defines(() => {
    sc.TradeToggleStats.inject({
      _createContent() {
        this.parent();

        let newCompareItem = new sc.ui2.IconTextGui('');
        newCompareItem.setPos(
          this.compareItem.hook.pos.x,
          this.compareItem.hook.pos.y,
        );

        this.removeChildGui(this.compareItem);
        this.addChildGui(newCompareItem);
        this.compareItem = (newCompareItem as unknown) as sc.TextGui;

        this._updateTickerMaxSize();
      },

      _updateTickerMaxSize() {
        this.compareItem.tickerHook.maxSize = {
          x:
            this.hook.size.x -
            this.compareItem.hook.pos.x -
            this.compareHelpText.hook.pos.x,
        };
      },
    });

    sc.ShopEquipStats.inject({
      init() {
        this.parent();
        // despite the fact that sc.ShopEquipStats extends sc.TradeToggleStats,
        // ticker config must be recalculated here once again because
        // constructor of sc.ShopEquipStats modifies this.hook.size
        this._updateTickerMaxSize();
      },
    });

    sc.TradeIconGui.inject({
      _createContent() {
        this.parent();
        this.entries.forEach(entry => {
          let { gui } = entry;
          let newGui = new sc.ui2.IconTextGui(
            gui.text,
          ) as sc.ui2.IconTextGui & {
            tradeName: string;
          };
          newGui.tradeName = gui.tradeName;
          newGui.setAlign(gui.hook.align.x, gui.hook.align.y);
          newGui.setPos(gui.hook.pos.x, gui.hook.pos.y);
          let { level, numberGfx } = gui;
          if (level > 0) {
            newGui.setDrawCallback((width, height) =>
              sc.MenuHelper.drawLevel(level, width, height, numberGfx),
            );
          }
          newGui.tickerHook.maxSize = { x: this.hook.size.x - 3 * 2 };

          this.removeChildGui(gui);
          this.addChildGui(newGui);
          entry.gui = (newGui as unknown) as sc.TextGui & {
            tradeName: string;
          } & sc.TextGui.LevelDrawData;
        });
      },
    });
  });

ig.module('crosscode-ru.fixes.item-lists.status-main-equipment')
  .requires(
    'game.feature.menu.gui.status.status-view-main',
    'enchanced-ui.ticker-display',
  )
  .defines(() => {
    sc.StatusViewMainEquipment.Entry.inject({
      init(...args) {
        this.parent(...args);
        let newItemGui = new sc.ui2.IconTextGui(this.itemGui.text);
        newItemGui.setPos(this.textGui.hook.pos.x, this.itemGui.hook.pos.y);
        newItemGui.tickerHook.maxSize = {
          x: this.hook.size.x - this.itemGui.hook.pos.x * 2,
        };

        this.removeChildGui(this.itemGui);
        this.addChildGui(newItemGui);
        this.itemGui = (newItemGui as unknown) as sc.TextGui &
          sc.TextGui.LevelDrawData;
      },
    });
  });

ig.module('crosscode-ru.fixes.item-lists.social-menu')
  .requires(
    'game.feature.menu.gui.social.social-misc',
    'enchanced-ui.ticker-display',
  )
  .defines(() => {
    sc.SocialInfoBox.inject({
      setCharacter(id) {
        this.parent(id);

        guiMapChildren<sc.TextGui & sc.TextGui.LevelDrawData>(
          this.equip,
          gui => {
            let newGui = new sc.ui2.IconTextGui(gui.text);
            newGui.setPos(gui.hook.pos.x, gui.hook.pos.y);
            let { level, numberGfx } = gui;
            newGui.setDrawCallback((width, height) =>
              sc.MenuHelper.drawLevel(level, width, height, numberGfx),
            );
            newGui.tickerHook.maxSize = { x: this.equip.hook.size.x };

            return (newGui as unknown) as sc.TextGui & sc.TextGui.LevelDrawData;
          },
        );
      },
    });
  });

ig.module('crosscode-ru.fixes.item-lists.quests')
  .requires(
    'game.feature.menu.gui.quests.quest-entries',
    'enchanced-ui.ticker-display',
  )
  .defines(() => {
    sc.SubTaskEntryBase.inject({
      init(...args) {
        this.parent(...args);

        let newTextGui = new sc.ui2.IconTextGui('', {
          font: sc.fontsystem.smallFont,
        });
        newTextGui.setPos(this.textGui.hook.pos.x, this.textGui.hook.pos.y);

        this.removeChildGui(this.textGui);
        this.addChildGui(newTextGui);
        this.textGui = (newTextGui as unknown) as sc.TextGui;

        this._updateTickerMaxSize();
      },

      _updateTickerMaxSize() {
        let maxWidth = this.hook.size.x;
        maxWidth -= this.textGui.hook.pos.x; // left margin
        maxWidth -= this.textGui.hook.pos.x / 2; // right margin
        // check GUI elements created in subclasses
        // eslint-disable-next-line prefer-destructuring
        let numberGui: ig.GuiElementBase = (this as any).numberGui;
        if (numberGui != null) {
          maxWidth -= numberGui.hook.pos.x + numberGui.hook.size.x;
        }
        this.textGui.tickerHook.maxSize = { x: maxWidth };
      },
    });

    sc.TaskEntry.inject({
      setTask(...args) {
        this.parent(...args);
        this._subtasks.forEach(subTaskEntry => {
          subTaskEntry._updateTickerMaxSize();
        });
      },
    });
  });

ig.module('crosscode-ru.fixes.item-lists.equipment-menu')
  .requires(
    'game.feature.menu.gui.equip.equip-bodypart',
    'enchanced-ui.ticker-display',
  )
  .defines(() => {
    sc.EquipBodyPartContainer.Entry.inject({
      init(...args) {
        this.parent(...args);

        let oldTextChild = this.button.textChild;
        let newTextChild = new sc.ui2.IconTextGui(oldTextChild.text);
        newTextChild.setAlign(
          oldTextChild.hook.align.x,
          oldTextChild.hook.align.y,
        );
        newTextChild.setPos(oldTextChild.hook.pos.x, oldTextChild.hook.pos.y);
        newTextChild.setDrawCallback((width, height) => {
          if (this.level > 0) {
            sc.MenuHelper.drawLevel(this.level, width, height, this.numberGfx);
          }
        });
        newTextChild.tickerHook.maxSize = {
          x: this.button.hook.size.x - 5 * 2,
        };
        newTextChild.tickerHook.focusTarget = this.button;

        this.button.removeChildGui(oldTextChild);
        this.button.addChildGui(newTextChild);
        this.button.textChild = (newTextChild as unknown) as sc.TextGui;
      },
    });
  });

ig.module('crosscode-ru.fixes.item-lists.quest-dialog')
  .requires(
    'game.feature.menu.gui.equip.equip-bodypart',
    'enchanced-ui.ticker-display',
  )
  .defines(() => {
    sc.QuestDialog.inject({
      setQuestRewards(quest, hideRewards, finished) {
        this.parent(quest, hideRewards, finished);

        guiMapChildren<sc.TextGui & sc.TextGui.LevelDrawData>(
          this.itemsGui,
          gui => {
            let newGui = new sc.ui2.IconTextGui(gui.text);
            newGui.setPos(gui.hook.pos.x, gui.hook.pos.y);
            let { level, numberGfx } = gui;
            if (level > 0 && !hideRewards) {
              newGui.setDrawCallback((width, height) =>
                sc.MenuHelper.drawLevel(level, width, height, numberGfx),
              );
            }
            newGui.tickerHook.maxSize = { x: this.itemsGui.hook.size.x };

            return (newGui as unknown) as sc.TextGui & sc.TextGui.LevelDrawData;
          },
        );
      },
    });
  });
