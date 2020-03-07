ig.module('crosscode-ru.fixes.quest-menu')
  .requires(
    'game.feature.menu.gui.quests.quest-misc',
    'impact.feature.gui.gui',
    'crosscode-ru.ticker-display',
  )
  .defines(() => {
    sc.QuestInfoBox.inject({
      init() {
        this.parent();
        let locationIconHook = this.locationGui.hook.children.find(
          ({ gui }) => gui instanceof ig.ImageGui && gui.image === this.gfx,
        );
        this.locationText.setTickerConfig({
          maxSize: {
            x:
              this.locationGui.hook.size.x -
              this.locationText.hook.pos.x -
              locationIconHook.pos.x,
          },
        });
      },
    });
  });
