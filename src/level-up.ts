ig.module('crosscode-ru.fixes.level-up')
  .requires(
    'game.feature.gui.widget.level-up-hud',
    'localize-me.final-locale.ready',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.LevelUpContentGui.inject({
      patchedGfx: new ig.Image('media/gui/status-gui.ru_RU.png'),

      updateDrawables(renderer) {
        renderer.addGfx(this.patchedGfx, 0, 0, 0, 0, 114, 20);

        let oldAddGfx = renderer.addGfx;
        let addGfxCalls = 0;
        renderer.addGfx = (
          ...args: Parameters<ig.GuiRenderer['addGfx']>
        ): void => {
          addGfxCalls++;
          // skip the first call of addGfx
          if (addGfxCalls < 2) return;
          renderer.addGfx = oldAddGfx;
          renderer.addGfx(...args);
        };

        renderer.addTransform().setTranslate(3, 0);
        this.parent(renderer);
        renderer.undoTransform();

        renderer.addGfx = oldAddGfx;
      },
    });
  });
