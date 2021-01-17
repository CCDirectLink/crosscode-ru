ig.module('enhanced-ui.fixes.combat-hud')
  .requires('game.feature.combat.gui.hp-bar-boss', 'game.feature.combat.model.enemy-type')
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

ig.module('enhanced-ui.fixes.pvp')
  .requires('game.feature.combat.gui.pvp-gui')
  .defines(() => {
    sc.PvpRoundGui.inject({
      init(...args) {
        this.parent(...args);
        let textGui = this.hook.children[0].gui as sc.TextGui;
        textGui.setText(ig.lang.get('sc.gui.combat-hud.pvp-round'));
      },
    });
  });
