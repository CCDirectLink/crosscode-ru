ig.module('crosscode-ru.fixes.combat-hud')
  .requires(
    'game.feature.combat.gui.hp-bar-boss',
    'game.feature.combat.model.enemy-type',
  )
  .defines(() => {
    sc.SUB_HP_EDITOR.BOSS.inject({
      init(...args) {
        this.parent(...args);
        this.labelGui.setText(ig.lang.get('sc.gui.combat-hud.boss'));
      },
    });

    sc.EnemyType.inject({
      onload(...args) {
        this.parent(...args);
        if (this.bossLabel === 'Boss') {
          this.bossLabel = ig.lang.get('sc.gui.combat-hud.boss');
        }
      },
    });
  });
