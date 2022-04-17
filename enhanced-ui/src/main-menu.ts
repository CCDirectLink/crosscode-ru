ig.module('ultimate-localized-ui.fixes.main-menu.time-and-money-gui')
  .requires('game.feature.menu.gui.menu-misc')
  .defines(() => {
    sc.TimeAndMoneyGUI.inject({
      UI2_NUMBER_GUIS_OFFSET: 0,

      init() {
        this.parent();
        let offset = this.UI2_NUMBER_GUIS_OFFSET;
        if (offset === 0) return;

        for (let { hook } of [this.credit, this.timeSec, this.timeMin, this.timeHour]) {
          hook.pos.x -= offset;
        }
      },

      updateDrawables(renderer) {
        let offset = this.UI2_NUMBER_GUIS_OFFSET;
        if (offset === 0) {
          this.parent(renderer);
          return;
        }

        let { addGfx } = renderer;
        try {
          renderer.addGfx = (gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY) => {
            if (gfx === this.gfx || gfx === this.timeGfx) {
              posX += offset;
            }
            return addGfx.call(renderer, gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY);
          };
          this.parent(renderer);
        } finally {
          renderer.addGfx = addGfx;
        }
      },
    });
  });
