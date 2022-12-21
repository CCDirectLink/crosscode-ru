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

ig.module('ultimate-localized-ui.fixes.status-hud')
  .requires(
    'game.feature.gui.hud.param-hud',
    'game.feature.gui.hud.hp-hud',
    'game.feature.gui.hud.sp-hud',
  )
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

    sc.HpHudGui.inject({
      UI2_DRAW_LABEL_AS_TEXT_BLOCK: true,
      hpText: null,

      init(...args) {
        this.parent(...args);
        if (!this.UI2_DRAW_LABEL_AS_TEXT_BLOCK) return;
        this.hpText = new sc.TextGui(ig.lang.get('sc.gui.status-hud.hp'), {
          font: sc.fontsystem.tinyFont,
          linePadding: 0,
          drawCallback: () => sc.ui2.textRecolorDrawCallback(this.hpText.textBlock, 0x9c9c9c),
        });
        this.hpText.setPos(8, 0);
        this.addChildGui(this.hpText);
      },

      updateDrawables(renderer) {
        this.parent(renderer);
        if (!this.UI2_DRAW_LABEL_AS_TEXT_BLOCK) return;
        let { pos, size } = this.hpText.hook;
        renderer.addColor('#000000', pos.x, pos.y, size.x, size.y);
      },
    });

    sc.SpHudGui.inject({
      UI2_DRAW_LABEL_AS_TEXT_BLOCK: true,
      spText: null,

      init(...args) {
        this.parent(...args);
        if (!this.UI2_DRAW_LABEL_AS_TEXT_BLOCK) return;
        this.spText = new sc.TextGui(ig.lang.get('sc.gui.status-hud.sp'), {
          font: sc.fontsystem.tinyFont,
          linePadding: 0,
          drawCallback: () => sc.ui2.textRecolorDrawCallback(this.spText.textBlock, 0x9c9c9c),
        });
        this.spText.setPos(8, 0);
        this.addChildGui(this.spText);
      },

      updateDrawables(renderer) {
        this.parent(renderer);
        if (!this.UI2_DRAW_LABEL_AS_TEXT_BLOCK) return;
        let { pos, size } = this.spText.hook;
        renderer.addColor('#000000', pos.x, pos.y, size.x, size.y);
      },
    });
  });
