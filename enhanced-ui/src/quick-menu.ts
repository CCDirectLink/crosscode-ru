ig.module('ultimate-localized-ui.fixes.quick-menu')
  .requires('game.feature.quick-menu.gui.quick-misc')
  .defines(() => {
    function recolorTextImageData(imageData: ImageData, color: [number, number, number]): void {
      let pixels = imageData.data;
      for (let i = 0, len = imageData.width * imageData.height * 4; i < len; i += 4) {
        if ((pixels[i + 0] > 0 || pixels[i + 1] > 0 || pixels[i + 2] > 0) && pixels[i + 3] > 0) {
          pixels[i + 0] = color[0];
          pixels[i + 1] = color[1];
          pixels[i + 2] = color[2];
        }
      }
    }

    sc.QuickBorderArrowLevelBox.inject({
      renderLevelLabelAsTextBlock: false,

      init(...args) {
        this.parent(...args);
        if (!this.renderLevelLabelAsTextBlock) return;

        this.levelLabel = new sc.TextGui(ig.lang.get('sc.gui.quick-menu.analyze.enemy-level'), {
          font: sc.fontsystem.tinyFont,
        });
        this.levelLabel.setDrawCallback(() => {
          let fragment = this.levelLabel!.textBlock.buffer;
          let scale = ig.system.scale * ig.imageAtlas.scale;
          let imageData = ig.system.context.getImageData(
            fragment.offX,
            fragment.offY,
            fragment.width * scale,
            fragment.height * scale,
          );
          recolorTextImageData(imageData, this.getLevelColorRgb());
          ig.system.context.putImageData(imageData, fragment.offX, fragment.offY);
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
