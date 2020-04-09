ig.module('crosscode-ru.fixes.status-combat-arts')
  .requires(
    'game.feature.menu.gui.status.status-view-combat-arts',
    'localize-me.final-locale.ready',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.StatusViewCombatArtsEntry.inject({
      getConditionType() {
        let conditions = ig.lang.get<string[]>('sc.gui.menu.status.conditions');
        return `\\i[status-cond-${sc.menu.statusElement}]${
          conditions[sc.menu.statusElement]
        }`;
      },
    });
  });
