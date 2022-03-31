function createPatch<M extends string>(
  gameMenuModule: string,
  getConstructor: () => ImpactClass<
    { UI2_INCREASE_TAB_BUTTON_WIDTH: number } & { [onTabButtonCreation in M]: unknown }
  >,
  methodName: M,
): void {
  ig.module(`ultimate-localized-ui.fixes.tab-buttons.${gameMenuModule}`)
    .requires(`game.feature.menu.gui.${gameMenuModule}`)
    .defines(() => {
      (getConstructor() as unknown as typeof sc.TabbedPane).inject({
        UI2_INCREASE_TAB_BUTTON_WIDTH: null,
        init(...args) {
          this.parent(...args);
          // Don't look at me like that.
          let strOnTabButtonCreation = methodName as unknown as 'onTabButtonCreation';
          let origOnTabButtonCreation = this[strOnTabButtonCreation];
          // This method needs to be patched out in the constructor because in
          // sc.TabbedPane it is just an empty stub, so, naturally, its
          // descendants don't bother calling that empty function. Either way,
          // even if they did, that function would not be of much use unless it
          // instantiated the sc.ItemTabbedBox.TabButton.
          this[strOnTabButtonCreation] = function (...args) {
            let btn = origOnTabButtonCreation.apply(this, args);
            let minLargeWidth = this.UI2_INCREASE_TAB_BUTTON_WIDTH;
            if (minLargeWidth != null) {
              btn._largeWidth = Math.max(btn._largeWidth, minLargeWidth);
            }
            return btn;
          };
        },
      });
    });
}

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
createPatch('tab-box', () => sc.TabbedPane, 'onTabButtonCreation');
createPatch('item.item-list', () => sc.ItemTabbedBox, '_createTabButton');
createPatch('options.options-list', () => sc.OptionsTabBox, '_createTabButton');
createPatch('quests.quest-tab-list', () => sc.QuestListBox, '_createTabButton');
