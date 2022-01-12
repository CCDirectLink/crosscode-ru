function guiMapChildren<T extends ig.GuiElementBase = ig.GuiElementBase>(
  gui: ig.GuiElementBase,
  callback: (child: T, index: number) => T,
): void {
  let oldChildHooks = [...gui.hook.children];
  gui.removeAllChildren();
  for (let i = 0, len = oldChildHooks.length; i < len; i++) {
    let oldChildHook = oldChildHooks[i];
    let newChild = callback(oldChildHook.gui as T, i);
    gui.addChildGui(newChild as ig.GuiElementBase);
  }
}

ig.module('ultimate-localized-ui.fixes.item-lists')
  .requires('game.feature.menu.gui.menu-misc', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.ListBoxButton.inject({
      init(...args) {
        this.parent(...args);

        if (this.enableTickerDisplay) {
          let oldTextChild = this.button.textChild;
          let newTextChild = new sc.ui2.IconTextGui(this.button.textChild.text);
          newTextChild.setAlign(oldTextChild.hook.align.x, oldTextChild.hook.align.y);
          newTextChild.setPos(oldTextChild.hook.pos.x, oldTextChild.hook.pos.y);
          newTextChild.tickerHook.maxWidth =
            this.button.hook.size.x - (this.button.buttonType.alignXPadding ?? 0) * 2;
          newTextChild.tickerHook.focusTarget = this.button;

          this.button.removeChildGui(oldTextChild);
          this.button.addChildGui(newTextChild);
          this.button.textChild = newTextChild as unknown as sc.TextGui;
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
        throw new Error('ultimate-localized-ui: sc.ListBoxButton.setButtonText: unimplemented');
      },
    });
  });

function createListButtonPatch<T extends sc.ListBoxButton>(
  gameFeatureModule: string,
  getConstructor: () => { prototype: T & { enableTickerDisplay: boolean } },
): void {
  ig.module(`ultimate-localized-ui.fixes.item-lists.${gameFeatureModule}`)
    .requires(`game.feature.${gameFeatureModule}`)
    .defines(() => {
      getConstructor().prototype.enableTickerDisplay = true;
    });
}

// here's a full list of classes which are descendants of sc.ListBoxButton:
// sc.ItemBoxButton
// sc.DebugSkillLearner.ItemBoxButton
// sc.ShopItemButton
// sc.SocialEntryButton
// sc.EnemyEntryButton
// sc.LoreEntryButton
// sc.TradeItem
// - sc.TradeEntryButton
// sc.BotanicsEntryButton
// sc.ArenaEntryButton
// - sc.ArenaRoundEntryButton
// sc.NewGameOptionButton
// prettier-ignore
// eslint-disable-next-line no-lone-blocks
{
  createListButtonPatch('menu.gui.menu-misc', () => sc.ItemBoxButton);
  createListButtonPatch('menu.gui.shop.shop-list', () => sc.ShopItemButton);
  createListButtonPatch('trade.gui.trade-dialog', () => sc.TradeItem);
  createListButtonPatch('menu.gui.botanics.botanics-misc', () => sc.BotanicsEntryButton);
  createListButtonPatch('menu.gui.new-game.new-game-misc', () => sc.NewGameOptionButton);
  createListButtonPatch('menu.gui.lore.lore-misc', () => sc.LoreEntryButton);
  createListButtonPatch('menu.gui.arena.arena-misc', () => sc.ArenaEntryButton);
}

ig.module('ultimate-localized-ui.fixes.arena-menu')
  .requires(
    'ultimate-localized-ui.fixes.item-lists.menu.gui.arena.arena-misc',
    'game.feature.menu.gui.arena.arena-misc',
    'ultimate-localized-ui.ticker-display',
  )
  .defines(() => {
    sc.ArenaRoundEntryButton.inject({
      init(...args) {
        this.parent(...args);
        if (this.enableTickerDisplay && this.button.textChild.hook.pos.x > 0) {
          this.button.textChild.tickerHook.maxWidth! -=
            this.button.textChild.hook.pos.x - (this.button.buttonType.alignXPadding ?? 0);
        }
      },
    });

    sc.ArenaInfoBox.inject({
      init(...args) {
        this.parent(...args);
        this.title.tickerHook.maxWidth =
          this.hook.size.x - (this.level.hook.pos.x * 3 + this.level.hook.size.x) * 2;
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.new-game-menu')
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

ig.module('ultimate-localized-ui.fixes.item-lists.trade-gui')
  .requires(
    'game.feature.trade.gui.trade-icon',
    'game.feature.trade.gui.equip-toggle-stats',
    'game.feature.menu.gui.shop.shop-stats',
    'game.feature.menu.gui.trade.trade-misc',
    'ultimate-localized-ui.ticker-display',
  )
  .defines(() => {
    sc.TradeToggleStats.inject({
      _createContent() {
        this.parent();

        let newCompareItem = new sc.ui2.IconTextGui('');
        newCompareItem.setPos(this.compareItem.hook.pos.x, this.compareItem.hook.pos.y);

        this.removeChildGui(this.compareItem);
        this.addChildGui(newCompareItem);
        this.compareItem = newCompareItem as unknown as sc.TextGui;

        this._updateTickerMaxSize();
      },

      _updateTickerMaxSize() {
        this.compareItem.tickerHook.maxWidth =
          this.hook.size.x - this.compareItem.hook.pos.x - this.compareHelpText.hook.pos.x;
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
        for (let entry of this.entries) {
          let { gui } = entry;
          let newGui = new sc.ui2.IconTextGui(gui.text) as sc.ui2.IconTextGui & {
            tradeName: string;
          };
          newGui.tradeName = gui.tradeName;
          newGui.setAlign(gui.hook.align.x, gui.hook.align.y);
          newGui.setPos(gui.hook.pos.x, gui.hook.pos.y);
          let { level, numberGfx, isScalable } = gui;
          if (level > 0) {
            newGui.setDrawCallback((width, height) =>
              sc.MenuHelper.drawLevel(level, width, height, numberGfx, isScalable),
            );
          }
          newGui.tickerHook.maxWidth = this.hook.size.x - 3 * 2;

          this.removeChildGui(gui);
          this.addChildGui(newGui);
          entry.gui = newGui as unknown as sc.TextGui & {
            tradeName: string;
          } & sc.TextGui.LevelDrawData;
        }
      },
    });

    sc.TradeDetailsView.inject({
      setTraderData(...args) {
        this.parent(...args);

        for (let { gui } of [...this.requireGui.hook.children, ...this.getGui.hook.children]) {
          if (gui instanceof sc.TradeItem) {
            // make ticker displays permanent here because there is no way to
            // move the mouse over those "buttons"
            gui.button.textChild.tickerHook.focusTarget = null;
          }
        }
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.item-lists.shop-confirm')
  .requires('game.feature.menu.gui.shop.shop-confirm', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.ShopConfirmEntry.inject({
      init(...args) {
        this.parent(...args);
        let newItem = new sc.ui2.IconTextGui(this.item.text);
        newItem.setPos(this.item.hook.pos.x, this.item.hook.pos.y);
        // Dammit, not this again... The "times" and "equals" signs are rendered
        // in `updateDrawables` (instead of something like `sc.ImageGui`s or
        // even text blocks), as such I need to hardcode some constants for the
        // max width calculation.
        newItem.tickerHook.maxWidth = this.amount.hook.pos.x - 17;

        this.removeChildGui(this.item);
        this.addChildGui(newItem);
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.item-lists.status-main-equipment')
  .requires('game.feature.menu.gui.status.status-view-main', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.StatusViewMainEquipment.Entry.inject({
      init(...args) {
        this.parent(...args);
        let newItemGui = new sc.ui2.IconTextGui(this.itemGui.text);
        newItemGui.setPos(this.textGui.hook.pos.x, this.itemGui.hook.pos.y);
        newItemGui.tickerHook.maxWidth = this.hook.size.x - this.itemGui.hook.pos.x * 2;

        this.removeChildGui(this.itemGui);
        this.addChildGui(newItemGui);
        this.itemGui = newItemGui as unknown as sc.TextGui & sc.TextGui.LevelDrawData;
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.item-lists.social-menu')
  .requires('game.feature.menu.gui.social.social-misc', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.SocialInfoBox.inject({
      createEquipEntry(itemID, ...args) {
        let result = this.parent(itemID, ...args);

        let lastIndex = this.equip.hook.children.length - 1;
        if (lastIndex >= 0) {
          let gui = this.equip.removeChildGuiByIndex(lastIndex) as sc.TextGui &
            sc.TextGui.LevelDrawData;
          let item = sc.inventory.getItem(itemID);
          let isScalable = item != null && Boolean(item.isScalable);

          let newGui = new sc.ui2.IconTextGui(gui.text);
          newGui.setPos(gui.hook.pos.x, gui.hook.pos.y);
          let { level, numberGfx } = gui;
          newGui.setDrawCallback((width, height) =>
            sc.MenuHelper.drawLevel(level, width, height, numberGfx, isScalable),
          );
          newGui.tickerHook.maxWidth = this.equip.hook.size.x;

          this.equip.addChildGui(newGui);
        }

        return result;
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.item-lists.quests')
  .requires('game.feature.menu.gui.quests.quest-entries', 'ultimate-localized-ui.ticker-display')
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
        this.textGui = newTextGui as unknown as sc.TextGui;

        this._updateTickerMaxSize();
      },

      _updateTickerMaxSize() {
        let maxWidth = this.hook.size.x;
        maxWidth -= this.textGui.hook.pos.x; // left margin
        maxWidth -= this.textGui.hook.pos.x / 2; // right margin
        // check GUI elements created in subclasses
        let { numberGui } = this as unknown as {
          numberGui: ig.GuiElementBase;
        };
        if (numberGui != null) {
          maxWidth -= numberGui.hook.pos.x + numberGui.hook.size.x;
        }
        this.textGui.tickerHook.maxWidth = maxWidth;
      },
    });

    sc.TaskEntry.inject({
      setTask(...args) {
        this.parent(...args);
        for (let subTaskEntry of this._subtasks) {
          subTaskEntry._updateTickerMaxSize();
        }
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.item-lists.equipment-menu')
  .requires('game.feature.menu.gui.equip.equip-bodypart', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.EquipBodyPartContainer.Entry.inject({
      init(...args) {
        this.parent(...args);

        let oldTextChild = this.button.textChild;
        let newTextChild = new sc.ui2.IconTextGui(oldTextChild.text);
        newTextChild.setAlign(oldTextChild.hook.align.x, oldTextChild.hook.align.y);
        newTextChild.setPos(oldTextChild.hook.pos.x, oldTextChild.hook.pos.y);
        newTextChild.setDrawCallback((width, height) => {
          if (this.level > 0) {
            sc.MenuHelper.drawLevel(this.level, width, height, this.numberGfx, this.isScalable);
          }
        });
        newTextChild.tickerHook.maxWidth = this.button.hook.size.x - 5 * 2;
        newTextChild.tickerHook.focusTarget = this.button;
        newTextChild.tickerHook.focusTargetKeepPressed = true;

        this.button.removeChildGui(oldTextChild);
        this.button.addChildGui(newTextChild);
        this.button.textChild = newTextChild as unknown as sc.TextGui;
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.item-lists.quest-dialog')
  .requires('game.feature.menu.gui.quests.quest-misc', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.QuestDialog.inject({
      setQuestRewards(quest, ...args) {
        this.parent(quest, ...args);

        guiMapChildren<sc.TextGui & sc.TextGui.LevelDrawData>(this.itemsGui, (gui, i) => {
          let item = sc.inventory.getItem(quest.rewards.items[i].id);
          let isScalable = item != null && Boolean(item.isScalable);

          let newGui = new sc.ui2.IconTextGui(gui.text);
          newGui.setPos(gui.hook.pos.x, gui.hook.pos.y);
          let { level, numberGfx } = gui;
          if (gui.textBlock.drawCallback != null) {
            newGui.setDrawCallback((width, height) =>
              sc.MenuHelper.drawLevel(level, width, height, numberGfx, isScalable),
            );
          }
          newGui.tickerHook.maxWidth = this.itemsGui.hook.size.x;

          return newGui as unknown as sc.TextGui & sc.TextGui.LevelDrawData;
        });
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.item-lists.quest-details-view')
  .requires('game.feature.menu.gui.quests.quest-details', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.QuestDetailsView.inject({
      _setQuest(quest) {
        this.parent(quest);
        guiMapChildren<sc.TextGui & sc.TextGui.LevelDrawData>(this.itemsGui, (gui, i) => {
          // `isScalable` is added to the `sc.TextGui` instance in all other
          // cases, but here it is instead captured into a closure from the
          // local scope?  :SanCheeseAngry:.  This means that I have to look
          // `isScalable` up manually.
          let item = sc.inventory.getItem(quest.rewards.items[i].id);
          let isScalable = item != null && Boolean(item.isScalable);

          let newGui = new sc.ui2.IconTextGui(gui.text);
          newGui.setPos(gui.hook.pos.x, gui.hook.pos.y);
          let { level, numberGfx } = gui;
          if (gui.textBlock.drawCallback == null) {
            newGui.setDrawCallback((width, height) =>
              sc.MenuHelper.drawLevel(level, width, height, numberGfx, isScalable),
            );
          }
          newGui.tickerHook.maxWidth =
            this.personCharGui.hook.pos.x +
            this.personCharGui.hook.size.x -
            (this.itemsGui.hook.pos.x + gui.hook.pos.x);

          return newGui as unknown as sc.TextGui & sc.TextGui.LevelDrawData;
        });
      },
    });
  });
