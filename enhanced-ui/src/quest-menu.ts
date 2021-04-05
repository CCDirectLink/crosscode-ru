ig.module('ultimate-localized-ui.fixes.quest-menu')
  .requires('game.feature.menu.gui.quests.quest-misc', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.QuestInfoBox.inject({
      init() {
        this.parent();
        let locationIconHook = this.locationGui.hook.children.find(
          ({ gui }) => gui instanceof ig.ImageGui && gui.image === this.gfx,
        );
        if (locationIconHook != null) {
          this.locationText.tickerHook.maxWidth =
            this.locationGui.hook.size.x -
            this.locationText.hook.pos.x -
            locationIconHook.pos.x / 2;
        }
      },
    });
  });
