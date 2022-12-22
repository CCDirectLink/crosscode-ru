ig.module('ultimate-localized-ui.fixes.enemies-menu')
  .requires('game.feature.menu.gui.enemies.enemy-misc')
  .defines(() => {
    sc.EnemyInfoBox.inject({
      init(...args) {
        this.parent(...args);
        for (let { gui } of this.hook.children) {
          if (gui instanceof sc.TextGui && gui.text === 'lvl') {
            gui.setText(ig.lang.get('sc.gui.menu.enemy.lvl'));
            break;
          }
        }
      },
    });
  });
