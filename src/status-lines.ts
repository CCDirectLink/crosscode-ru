// TODO reduce number of colored sprites and figure out more constants

// R.D. (Stefan) said that it's okay to copy copyrighted code from the
// game, so I'll copy the copyrighted source code, specifically constants
// (because they aren't present in the compiled code)

const STATUS_LINE_START_X = 0;
const STATUS_LINE_START_Y = 12;
const STATUS_LINE_HEIGHT = 11;

const STATUS_LINE_START_SIMPLE_X = 0;
const STATUS_LINE_START_SIMPLE_Y = 84;

ig.module('crosscode-ru.fixes.status-line-graphics.enemy-list')
  .requires('game.feature.menu.gui.enemies.enemy-pages')
  .defines(() => {
    sc.EnemyBaseParamLine.inject({
      patchedGfx: new ig.Image('media/gui/status-lines.png'),

      updateDrawables(renderer) {
        renderer.addGfx(this.patchedGfx, 0, 0, 0, 0, 118, 11);
        renderer.addGfx(
          this.gfx,
          0,
          0,
          sc.MODIFIER_ICON_DRAW.X + this.icon * 12,
          sc.MODIFIER_ICON_DRAW.Y,
          11,
          11,
        );
      },
    });
  });

ig.module('crosscode-ru.fixes.status-line-graphics.simple-status-display')
  .requires('game.feature.menu.gui.menu-misc')
  .defines(() => {
    sc.SimpleStatusDisplay.inject({
      patchedGfx: new ig.Image('media/gui/status-lines.png'),

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
        let x = this.simpleMode
          ? STATUS_LINE_START_SIMPLE_X
          : STATUS_LINE_START_X;
        let y =
          (this.simpleMode ? STATUS_LINE_START_SIMPLE_Y : STATUS_LINE_START_Y) +
          this.lineID * (STATUS_LINE_HEIGHT + 1);
        renderer.addGfx(
          this.patchedGfx,
          0,
          0,
          x,
          y,
          this.noPercentMode ? 74 : this.hook.size.x,
          STATUS_LINE_HEIGHT,
        );

        if (this.noPercentMode) {
          renderer.addGfx(
            this.patchedGfx,
            72,
            0,
            x + sc.MODIFIER_ICON_DRAW.SIZE,
            y,
            12,
            STATUS_LINE_HEIGHT,
          );
          renderer.addGfx(
            this.patchedGfx,
            84,
            STATUS_LINE_HEIGHT - 1,
            x + 84,
            y,
            this.simpleMode ? 45 : 88,
            STATUS_LINE_HEIGHT,
          );
        }

        renderer.addGfx(
          this.gfx,
          0,
          0,
          sc.MODIFIER_ICON_DRAW.X +
            this.iconIndex.x * (sc.MODIFIER_ICON_DRAW.SIZE + 1),
          sc.MODIFIER_ICON_DRAW.Y +
            this.iconIndex.y * (sc.MODIFIER_ICON_DRAW.SIZE + 1),
          sc.MODIFIER_ICON_DRAW.SIZE,
          sc.MODIFIER_ICON_DRAW.SIZE,
        );
      },
    });
  });

ig.module('crosscode-ru.fixes.status-line-graphics.status-menu')
  .requires('game.feature.menu.gui.status.status-misc')
  .defines(() => {
    const LINE_COLORS = [
      '#8bb5ff',
      '#ba0000',
      '#0036d0',
      '#a121bc',
      '#00994c',
      '#c7c7c7',
    ];

    sc.StatusParamBar.inject({
      patchedGfx: new ig.Image('media/gui/status-lines.png'),

      updateDrawables(renderer) {
        // goddammit, RFG, you are kidding me...

        let { x } = this.hook.size;
        let y = this.lineID * (STATUS_LINE_HEIGHT + 1);

        if (this._hideAll) {
          renderer.addColor(LINE_COLORS[this.lineID], 0, 10, 152, 1);
          renderer.addGfx(
            this.patchedGfx,
            152,
            0,
            STATUS_LINE_START_X + 74,
            STATUS_LINE_START_Y + 60,
            13,
            11,
          );
          renderer.addColor(LINE_COLORS[this.lineID], 165, 0, x - 244, 1);
        } else {
          renderer.addGfx(
            this.patchedGfx,
            0,
            0,
            STATUS_LINE_START_X,
            STATUS_LINE_START_Y + y,
            90,
            11,
          );
          renderer.addColor(LINE_COLORS[this.lineID], 90, 0, x - 90 - 79, 1);
        }

        renderer.addGfx(
          this.patchedGfx,
          x - 79,
          0,
          STATUS_LINE_START_X + 90,
          STATUS_LINE_START_Y + y,
          79,
          1,
        );
        if (!this.skipVertLine) {
          renderer.addColor(
            LINE_COLORS[this.lineID],
            209 - (this._skillHidden ? 44 : 0),
            0,
            1,
            this.hook.size.y,
          );
        }

        if (this.usePercent && !this._hideAll) {
          renderer.addGfx(this.gfx, 107, 3, this._baseRed ? 9 : 0, 407, 8, 8);
          renderer.addGfx(this.gfx, 151, 3, this._equipRed ? 9 : 0, 407, 8, 8);
          if (!this._skillHidden) {
            renderer.addGfx(
              this.gfx,
              195,
              3,
              this._skillsRed ? 9 : 0,
              407,
              8,
              8,
            );
          }
          if (sc.menu.statusDiff) {
            renderer.addGfx(this.gfx, 151, 13, 0, 416, 8, 8);
            if (!this._skillHidden) {
              renderer.addGfx(this.gfx, 195, 13, 0, 416, 8, 8);
            }
          }
        }

        renderer.addGfx(
          this.gfx,
          0,
          0,
          sc.MODIFIER_ICON_DRAW.X +
            this.iconIndex.x * (sc.MODIFIER_ICON_DRAW.SIZE + 1),
          sc.MODIFIER_ICON_DRAW.Y +
            this.iconIndex.y * (sc.MODIFIER_ICON_DRAW.SIZE + 1),
          sc.MODIFIER_ICON_DRAW.SIZE,
          sc.MODIFIER_ICON_DRAW.SIZE,
        );
      },
    });
  });
