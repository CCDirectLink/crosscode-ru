ig.module('crosscode-ru.fixes.main-menu')
  .requires('game.feature.menu.gui.main-menu', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.MainMenu.CurrentMenuDisplay.inject({
      init(...args) {
        this.parent(...args);
        this.setSize(this.hook.size.x + 10, this.hook.size.y);
      },

      pushMenuDisplay(...args) {
        this.parent(...args);
        let addedBox = this.boxes[this.boxes.length - 1];
        addedBox.setSize(this.hook.size.x, this.hook.size.y);
      },
    });
  });

ig.module('crosscode-ru.fixes.main-menu.time-and-money-gui')
  .requires('game.feature.menu.gui.menu-misc', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.TimeAndMoneyGUI.prototype.UI2_NUMBER_GUIS_OFFSET = 4;
  });
