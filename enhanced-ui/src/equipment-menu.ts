ig.module('ultimate-localized-ui.fixes.equipment-menu')
  .requires('game.feature.menu.gui.equip.equip-misc')
  .defines(() => {
    sc.EquipLevelOverview.inject({
      init(...args) {
        this.parent(...args);
        for (let { gui } of this.hook.children) {
          if (gui instanceof sc.TextGui && gui.text === 'LVL') {
            gui.setText(ig.lang.get('sc.gui.menu.equip.lvl'));
            break;
          }
        }
      },
    });
  });
