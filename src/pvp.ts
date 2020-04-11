ig.module('crosscode-ru.fixes.pvp')
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
