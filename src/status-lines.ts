const ORIG_STATUS_LINE_START_X = 0;
const ORIG_STATUS_LINE_START_Y = 329;
const ORIG_STATUS_LINE_SIMPLE_START_X = 144;
const ORIG_STATUS_LINE_SIMPLE_START_Y = 408;

const STATUS_LINE_START_X = 0;
const STATUS_LINE_START_Y = 12;
const STATUS_LINE_SIMPLE_START_X = 0;
const STATUS_LINE_SIMPLE_START_Y = 84;

const STATUS_LINE_HEIGHT = 11;

ig.module('crosscode-ru.fixes.status-line-graphics.enemy-list')
  .requires('game.feature.menu.gui.enemies.enemy-pages', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.EnemyBaseParamLine.inject({
      patchedGfx: new ig.Image('media/gui/menu.ru_RU.png'),

      updateDrawables(renderer) {
        let { addGfx } = renderer;
        try {
          renderer.addGfx = (gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY) => {
            if (gfx === this.gfx && srcX === 520 && srcY === 48 && sizeX === 118 && sizeY === 11) {
              gfx = this.patchedGfx;
              srcX = 0;
              srcY = 0;
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

ig.module('crosscode-ru.fixes.status-line-graphics.simple-status-display')
  .requires('game.feature.menu.gui.menu-misc', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.SimpleStatusDisplay.inject({
      patchedGfx: new ig.Image('media/gui/menu.ru_RU.png'),

      init(...args) {
        this.parent(...args);
        if (this.currentValueGui != null) {
          this.currentValueGui.hook.pos.x -= 2;
        }
        if (this.percentCurrentGui != null) {
          this.percentCurrentGui.hook.pos.x -= 2;
        }
        if (this.arrowGui != null) {
          this.arrowGui.hook.pos.x -= 2;
        }
      },

      updateDrawables(renderer) {
        let { addGfx } = renderer;
        try {
          let lineOffsetY = this.lineID * (STATUS_LINE_HEIGHT + 1);
          let simple = this.simpleMode;
          let origStartX = simple ? ORIG_STATUS_LINE_SIMPLE_START_X : ORIG_STATUS_LINE_START_X;
          let origStartY = simple ? ORIG_STATUS_LINE_SIMPLE_START_Y : ORIG_STATUS_LINE_START_Y;
          let replaceStartX = simple ? STATUS_LINE_SIMPLE_START_X : STATUS_LINE_START_X;
          let replaceStartY = simple ? STATUS_LINE_SIMPLE_START_Y : STATUS_LINE_START_Y;
          renderer.addGfx = (gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY) => {
            if (gfx === this.gfx && sizeX === this.width && sizeY === STATUS_LINE_HEIGHT) {
              if (srcX === origStartX && srcY === origStartY + lineOffsetY) {
                gfx = this.patchedGfx;
                srcX = replaceStartX;
                srcY = replaceStartY + lineOffsetY;
              }
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

ig.module('crosscode-ru.fixes.status-line-graphics.status-menu')
  .requires('game.feature.menu.gui.status.status-misc', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.StatusParamBar.inject({
      patchedGfx: new ig.Image('media/gui/menu.ru_RU.png'),
      updateDrawables(renderer) {
        let { addGfx } = renderer;
        try {
          renderer.addGfx = (gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY) => {
            let lineSrcX = srcX - ORIG_STATUS_LINE_START_X;
            let lineSrcY = srcY - ORIG_STATUS_LINE_START_Y;
            if (
              gfx === this.gfx &&
              ((lineSrcX === 0 && sizeX === 90) || (lineSrcX === 90 && sizeX === 79)) &&
              lineSrcY >= 0 &&
              lineSrcY < 6 * (STATUS_LINE_HEIGHT + 1) &&
              lineSrcY % (STATUS_LINE_HEIGHT + 1) === 0
            ) {
              gfx = this.patchedGfx;
              srcX = STATUS_LINE_START_X + lineSrcX;
              srcY = STATUS_LINE_START_Y + lineSrcY;
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
