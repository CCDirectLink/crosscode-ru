ig.module('crosscode-ru.fixes.level-up')
  .requires('game.feature.gui.widget.level-up-hud', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.LevelUpContentGui.inject({
      patchedGfx: new ig.Image('media/gui/status-gui.ru_RU.png'),

      updateDrawables(renderer) {
        renderer.addTransform().setTranslate(3, 0);

        let { addGfx } = renderer;
        try {
          renderer.addGfx = (gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY) => {
            if (gfx === this.gfx && srcX === 0 && srcY === 192 && sizeX === 112 && sizeY === 20) {
              return addGfx.call(renderer, this.patchedGfx, -3, 0, 0, 0, 114, 20);
            }
            return addGfx.call(renderer, gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY);
          };
          this.parent(renderer);
        } finally {
          renderer.addGfx = addGfx;
        }

        renderer.undoTransform();
      },
    });
  });
