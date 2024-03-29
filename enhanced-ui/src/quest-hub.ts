ig.module('ultimate-localized-ui.fixes.quest-hub')
  .requires('game.feature.menu.gui.quest-hub.quest-hub-misc')
  .defines(() => {
    sc.QuestHubListEntry.inject({
      init(...args) {
        this.parent(...args);

        let locationHook = this.questLocation.hook;
        let rewardsHook = this.rewards.hook;
        let calculatedHeight = locationHook.pos.y + locationHook.size.y + rewardsHook.pos.y;
        let oldHeight = this.hook.size.y;
        if (calculatedHeight > oldHeight) {
          this.hook.size.y = calculatedHeight;
          rewardsHook.size.y += calculatedHeight - oldHeight;
        }

        for (let { gui } of this.levelContent.hook.children) {
          if (gui instanceof sc.TextGui && gui.text === 'LvL') {
            gui.setText(ig.lang.get('sc.gui.menu.questHub.lvl'));
            break;
          }
        }
      },
    });
  });
