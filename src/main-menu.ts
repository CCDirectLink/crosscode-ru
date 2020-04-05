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

ig.module('crosscode-ru.fixes.main-menu.time-and-money-gui')
  .requires('game.feature.menu.gui.menu-misc')
  .defines(() => {
    const MONEY_ICON_WIDTH = 10;
    const MONEY_ICON_HEIGHT = 8;
    const MONEY_X_PADDING = 8 - 4;
    const MONEY_Y_PADDING = 7;
    const MONEY_TILE_X = 0;
    const MONEY_TILE_Y = 88;

    const TIME_TILE_X = 107;
    const TIME_TILE_Y = 1;
    const TIME_WIDTH = 3;
    const TIME_HEIGHT = 7;

    sc.TimeAndMoneyGUI.inject({
      init() {
        this.parent();
        [this.credit, this.timeSec, this.timeMin, this.timeHour].forEach(
          ({ hook }) => {
            hook.pos.x -= 4;
          },
        );
      },

      updateDrawables(renderer) {
        sc.MenuPanel.prototype.updateDrawables.call(this, renderer);

        renderer.addGfx(
          this.gfx,
          this.hook.size.x - MONEY_ICON_WIDTH - MONEY_X_PADDING,
          MONEY_Y_PADDING,
          MONEY_TILE_X,
          MONEY_TILE_Y,
          MONEY_ICON_WIDTH,
          MONEY_ICON_HEIGHT,
        );

        renderer.addGfx(
          this.timeGfx,
          111,
          21,
          TIME_TILE_X,
          TIME_TILE_Y,
          TIME_WIDTH,
          TIME_HEIGHT,
        );
        renderer.addGfx(
          this.timeGfx,
          86,
          21,
          TIME_TILE_X,
          TIME_TILE_Y,
          TIME_WIDTH,
          TIME_HEIGHT,
        );
      },
    });
  });
