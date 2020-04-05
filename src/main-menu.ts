ig.module('crosscode-ru.fixes.main-menu')
  .requires('game.feature.menu.gui.main-menu')
  .defines(() => {
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
