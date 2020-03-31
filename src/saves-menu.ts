ig.module('crosscode-ru.fixes.saves-menu')
  .requires('game.feature.menu.gui.save.save-misc')
  .defines(() => {
    sc.SaveSlotButton.inject({
      init(...args) {
        this.parent(...args);
        // ah, whatever. here goes nothing!
        let playTimeAndCreditContainerHook = this.content.hook.children[6];
        playTimeAndCreditContainerHook.pos.x += 4;
      },
    });
  });
