ig.module('ultimate-localized-ui.fixes.quick-menu')
  .requires('game.feature.quick-menu.gui.quick-misc', 'ultimate-localized-ui.text-gui-utils')
  .defines(() => {
    sc.QuickBorderArrowLevelBox.inject({
      renderLevelLabelAsTextBlock: false,

      init(...args) {
        this.parent(...args);
        if (!this.renderLevelLabelAsTextBlock) return;

        this.levelLabel = new sc.TextGui(ig.lang.get('sc.gui.quick-menu.analyze.enemy-level'), {
          font: sc.fontsystem.tinyFont,
        });
        this.levelLabel.setDrawCallback(() => {
          sc.ui2.textRecolorDrawCallback(this.levelLabel!.textBlock, this.getLevelColorRgb());
        });

        this.levelLabel.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
        this.levelLabel.setPos(5, 1);
        this.addChildGui(this.levelLabel);

        let defaultLevelLabelWidth = 9;
        this.hook.size.x += this.levelLabel.hook.size.x - defaultLevelLabelWidth;
      },

      getLevelColorRgb() {
        switch (this.displayColor) {
          case sc.GUI_NUMBER_COLOR.WHITE:
            return [0xff, 0xff, 0xff];
          case sc.GUI_NUMBER_COLOR.RED:
            return [0xff, 0x69, 0x69];
          case sc.GUI_NUMBER_COLOR.GREEN:
            return [0x65, 0xff, 0x89];
          case sc.GUI_NUMBER_COLOR.GREY:
            return [0x80, 0x80, 0x80];
          case sc.GUI_NUMBER_COLOR.ORANGE:
            return [0xff, 0xc7, 0x31];
          default:
            return [0xff, 0xff, 0xff];
        }
      },

      updateDrawables(renderer) {
        if (!this.renderLevelLabelAsTextBlock) {
          this.parent(renderer);
          return;
        }

        // The background
        this.ninepatch.draw(renderer, this.hook.size.x, this.hook.size.y, 'default');
        // The small triangle pointing downwards at the entity
        renderer.addGfx(
          this.ninepatch.gfx,
          this.hook.size.x / 2 - 1.5,
          this.hook.size.y - 1,
          480,
          122,
          3,
          3,
        );
      },
    });
  });
