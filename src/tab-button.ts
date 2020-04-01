function createPatch<C extends keyof typeof sc>(
  gameMenuModule: string,
  className: C,
  minLargeWidth: number,
  methodName = 'onTabButtonCreation',
): void {
  ig.module(`crosscode-ru.fixes.tab-button.${gameMenuModule}`)
    .requires(`game.feature.menu.gui.${gameMenuModule}`)
    .defines(() => {
      (sc[className] as ig.ClassConstructor).inject({
        [methodName](
          this: ig.Class & {
            parent(...args: unknown[]): sc.ItemTabbedBox.TabButton;
          },
          ...args: unknown[]
        ): sc.ItemTabbedBox.TabButton {
          let btn = this.parent(...args);
          btn._largeWidth = Math.max(btn._largeWidth, minLargeWidth);
          return btn;
        },
      });
    });
}

createPatch('arena.arena-list', 'ArenaCupList', 145);
createPatch('botanics.botanics-list', 'BotanicsListBox', 160);
createPatch('enemies.enemy-list', 'EnemyListBox', 120);
createPatch('lore.lore-list', 'LoreListBoxNew', 120);
createPatch('options.options-list', 'OptionsTabBox', 105, '_createTabButton');
createPatch('quest-hub.quest-hub-list', 'QuestHubList', 120);
createPatch('quests.quest-tab-list', 'QuestListBox', 120, '_createTabButton');
createPatch('social.social-list', 'SocialList', 95);
createPatch('trade.trader-list', 'TradersListBox', 160);
