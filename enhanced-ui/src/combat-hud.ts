ig.module('enhanced-ui.fixes.combat-hud')
  .requires('game.feature.combat.gui.hp-bar-boss', 'game.feature.combat.model.enemy-type')
  .defines(() => {
    sc.SUB_HP_EDITOR.BOSS.inject({
      init(...args) {
        this.parent(...args);
        if (this.labelGui.text === 'Boss') {
          this.labelGui.setText(ig.lang.get('sc.gui.combat-hud.boss'));
        }
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

ig.module('enhanced-ui.fixes.pvp')
  .requires('game.feature.combat.gui.pvp-gui')
  .defines(() => {
    sc.PvpRoundGui.inject({
      init(...args) {
        this.parent(...args);
        for (let { gui } of this.hook.children) {
          if (gui instanceof sc.TextGui && gui.text === 'Round') {
            gui.setText(ig.lang.get('sc.gui.combat-hud.pvp-round'));
            break;
          }
        }
      },
    });
  });
