ig.module('crosscode-ru.fixes.status-combat-arts')
  .requires('game.feature.menu.gui.status.status-view-combat-arts')
  .defines(() => {
    sc.StatusViewCombatArtsEntry.inject({
      getConditionType() {
        let conditions = ig.lang.get('sc.gui.menu.status.conditions');
        return `\\i[status-cond-${sc.menu.statusElement}]${
          conditions[sc.menu.statusElement]
        }`;
      },
    });
  });
