ig.module('enhanced-ui.fixes.trophies-menu')
  .requires('game.feature.menu.gui.trophy.trophy-misc')
  .defines(() => {
    sc.TrophyListEntry.inject({
      init(...args) {
        this.parent(...args);

        let descriptionHook = this.description.hook;
        let calculatedHeight = descriptionHook.pos.y + descriptionHook.size.y + 7;
        let oldHeight = this.hook.size.y;
        if (calculatedHeight > oldHeight) this.hook.size.y = calculatedHeight;
      },
    });
  });
