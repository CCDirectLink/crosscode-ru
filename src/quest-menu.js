ig.module('crosscode-ru.fixes.quest-menu')
  .requires(
    'game.feature.menu.gui.quests.quest-misc',
    'crosscode-ru.ticker-display',
  )
  .defines(() => {
    sc.QuestInfoBox.inject({
      init() {
        this.parent();
        let locationIconHook = this.locationGui.hook.children[1];
        this.locationText.tickerHook.setMaxSize({
          x:
            this.locationGui.hook.size.x -
            this.locationText.hook.pos.x -
            locationIconHook.pos.x,
        });
      },
    });
  });
