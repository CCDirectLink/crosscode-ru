// NOTE: A list of every descendant of sc.TabbedPane and similar tab pane classes:
// sc.ItemTabbedBox
// sc.OptionsTabBox
// sc.QuestListBox
// sc.QuestHubList
// sc.EnemyListBox
// sc.LoreListBoxNew
// sc.StatsListBox
// sc.TrophyList
// sc.SocialList
// sc.TradersListBox
// sc.BotanicsListBox
// sc.ArenaRoundList
// sc.ArenaCupList

function autoAdjustTabWidths(
  container: sc.ui2.TabbedPaneMixin,
  newIndex: number,
  tabs: sc.ItemTabbedBox.TabButton[],
): boolean {
  let newBtn = tabs[newIndex];
  let width = 0;

  if (container.UI2_INCREASE_TAB_BUTTON_WIDTH != null) {
    width = Math.max(newBtn._largeWidth, container.UI2_INCREASE_TAB_BUTTON_WIDTH);
  } else if (container.UI2_TAB_BTN_AUTO_WIDTH) {
    let prevPressed = newBtn.pressed;
    let prevText = newBtn.textChild.text;
    try {
      newBtn.pressed = true;
      newBtn.textChild.setText(newBtn.getButtonText());
      width = newBtn.textChild.hook.size.x + (container.UI2_TAB_BTN_AUTO_WIDTH_PADDING ?? 16);
    } finally {
      newBtn.pressed = prevPressed;
      newBtn.textChild.setText(prevText);
    }
    let newBtnMinWidth = container.UI2_TAB_BTN_AUTO_WIDTH_MIN ?? newBtn._largeWidth;
    width = tabs.reduce((x, otherBtn, idx) => {
      return Math.max(x, idx === newIndex ? newBtnMinWidth : otherBtn._largeWidth);
    }, width);
  } else {
    return false;
  }

  let changedAny = false;
  for (let btn of tabs) {
    if (btn._largeWidth !== width) changedAny = true;
    btn._largeWidth = width;
    btn.hook.size.x = btn.pressed ? btn._largeWidth : btn._smallWidth;
  }
  return changedAny;
}

ig.module('ultimate-localized-ui.fixes.tab-buttons')
  .requires('game.feature.menu.gui.tab-box')
  .defines(() => {
    sc.TabbedPane.inject({
      addTab(key, index, settings, ...args) {
        let result = this.parent(key, index, settings, ...args);
        let changedAny = autoAdjustTabWidths(this, index, this.tabArray);
        if (changedAny) {
          this.rearrangeTabs();
        }
        return result;
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.tab-buttons.item-list')
  .requires('game.feature.menu.gui.item.item-list')
  .defines(() => {
    sc.ItemTabbedBox.inject({
      _createTabButton(name, icon, x, type, subType, ...args) {
        let btn = this.parent(name, icon, x, type, subType, ...args);
        autoAdjustTabWidths(this, x, this.tabArray);
        return btn;
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.tab-buttons.options-list')
  .requires('game.feature.menu.gui.options.options-list')
  .defines(() => {
    sc.OptionsTabBox.inject({
      _createTabButton(name, x, type, ...args) {
        let btn = this.parent(name, x, type, ...args);
        autoAdjustTabWidths(this, x, this.tabArray);
        return btn;
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.tab-buttons.quest-tab-list')
  .requires('game.feature.menu.gui.quests.quest-tab-list')
  .defines(() => {
    sc.QuestListBox.inject({
      _createTabButton(name, x, type, ...args) {
        let btn = this.parent(name, x, type, ...args);
        autoAdjustTabWidths(this, x, this.tabArray);
        return btn;
      },
    });
  });
