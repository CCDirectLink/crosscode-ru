ig.module('ultimate-localized-ui.fixes.combat-hud')
  .requires(
    'game.feature.combat.gui.hp-bar-boss',
    'game.feature.combat.model.enemy-type',
    'game.feature.gui.hud.combat-hud',
  )
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

    sc.CombatUpperHud.inject({
      init(...args) {
        this.parent(...args);
        let { rankLabel } = this.sub.ranked;
        if (rankLabel.text === 'Rank') {
          rankLabel.setText(ig.lang.get('sc.gui.combat-hud.rank'));
        }
      },
    });
  });

ig.module('ultimate-localized-ui.fixes.pvp')
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

ig.module('ultimate-localized-ui.fixes.param-hud')
  .requires('game.feature.gui.hud.param-hud')
  .defines(() => {
    sc.ParamHudGui.inject({
      init(...args) {
        this.parent(...args);
        let offset = 0;
        for (let param of [this.hp, this.atk, this.def, this.foc]) {
          param.hook.pos.x += offset;
          let newParamWidth = Math.max(
            param.hook.size.x,
            param._text.hook.pos.x + param._text.hook.size.x + param.hook.size.y - 1,
          );
          offset += newParamWidth - param.hook.size.x;
          param.hook.size.x = newParamWidth;
        }
      },
    });
  });
