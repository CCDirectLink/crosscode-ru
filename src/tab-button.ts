function createPatch<T extends ImpactClass<unknown>>(
  gameMenuModule: string,
  getConstructor: () => T,
  minLargeWidth: number,
  methodName = 'onTabButtonCreation',
): void {
  ig.module(`crosscode-ru.fixes.tab-button.${gameMenuModule}`)
    .requires(`game.feature.menu.gui.${gameMenuModule}`, 'localize-me.final-locale.ready')
    .defines(() => {
      if (ig.currentLang !== 'ru_RU') return;

      ((getConstructor() as unknown) as typeof ig.Class).inject({
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

createPatch('arena.arena-list', () => sc.ArenaCupList, 145);
createPatch('botanics.botanics-list', () => sc.BotanicsListBox, 160);
createPatch('enemies.enemy-list', () => sc.EnemyListBox, 120);
createPatch('lore.lore-list', () => sc.LoreListBoxNew, 120);
// prettier-ignore
createPatch('options.options-list', () => sc.OptionsTabBox, 105, '_createTabButton');
createPatch('quest-hub.quest-hub-list', () => sc.QuestHubList, 120);
// prettier-ignore
createPatch('quests.quest-tab-list', () => sc.QuestListBox, 120, '_createTabButton');
createPatch('social.social-list', () => sc.SocialList, 95);
createPatch('trade.trader-list', () => sc.TradersListBox, 160);
