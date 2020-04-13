ig.module('enhanced-ui.fixes.quest-menu')
  .requires(
    'game.feature.menu.gui.quests.quest-misc',
    'enhanced-ui.ticker-display',
  )
  .defines(() => {
    sc.QuestInfoBox.inject({
      init() {
        this.parent();
        let locationIconHook = this.locationGui.hook.children[1];
        this.locationText.tickerHook.maxWidth =
          this.locationGui.hook.size.x -
          this.locationText.hook.pos.x -
          locationIconHook.pos.x;
      },
    });
  });
