function createPatch(
  gameMenuModule,
  className,
  minLargeWidth,
  methodName = 'onTabButtonCreation',
) {
  return ig
    .module(`crosscode-ru.fixes.tab-button.${gameMenuModule}`)
    .requires(`game.feature.menu.gui.${gameMenuModule}`)
    .defines(() => {
      sc[className].inject({
        [methodName](...args) {
          let btn = this.parent(...args);
          btn._largeWidth = Math.max(btn._largeWidth, minLargeWidth);
          return btn;
        },
      });
    });
}

createPatch('quests.quest-tab-list', 'QuestListBox', 120, '_createTabButton');
createPatch('quest-hub.quest-hub-list', 'QuestHubList', 120);
createPatch('enemies.enemy-list', 'EnemyListBox', 120);
createPatch('lore.lore-list', 'LoreListBoxNew', 120);
createPatch('social.social-list', 'SocialList', 95);
createPatch('trade.trader-list', 'TradersListBox', 160);
createPatch('botanics.botanics-list', 'BotanicsListBox', 160);
createPatch('arena.arena-list', 'ArenaCupList', 145);
