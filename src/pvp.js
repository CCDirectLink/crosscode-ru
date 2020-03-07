ig.module('crosscode-ru.fixes.pvp')
  .requires('game.feature.combat.gui.pvp-gui')
  .defines(() => {
    sc.PvpRoundGui.inject({
      init(...args) {
        this.parent(...args);
        this.hook.children[0].gui.setText('Раунд');
      },
    });
  });
