ig.module('crosscode-ru.fixes.saves-menu')
  .requires('game.feature.menu.gui.save.save-misc', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.SaveSlotButton.inject({
      init(...args) {
        this.parent(...args);
        let playtimeStr = ig.lang.get('sc.gui.menu.save-menu.playtime');
        let creditStr = ig.lang.get('sc.gui.menu.save-menu.credit');
        let playtimeAndCreditContainerHook = this.content.hook.children.find((hook) => {
          let foundPlaytime = false;
          let foundCredit = false;
          for (let { gui } of hook.children) {
            if (!(gui instanceof sc.TextGui)) continue;
            if (gui.text === playtimeStr) foundPlaytime = true;
            if (gui.text === creditStr) foundCredit = true;
            if (foundPlaytime && foundCredit) return true;
          }
          return false;
        });
        if (playtimeAndCreditContainerHook != null) playtimeAndCreditContainerHook.pos.x += 4;
      },
    });
  });
