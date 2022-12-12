ig.module('ultimate-localized-ui.fixes.inventory-menu')
  .requires(
    'game.feature.menu.gui.item.item-status-trade',
    'game.feature.menu.gui.item.item-status-default',
    'ultimate-localized-ui.ticker-display',
  )
  .defines(() => {
    sc.ItemStatusTrade.inject({
      _setTradeInfo(itemID) {
        this.parent(itemID);
        let contentBlockWidth = this.hook.size.x - 2 * this.content.hook.pos.x;
        for (let { gui } of this.content.hook.children) {
          if (!(gui instanceof sc.ItemStatusTrade.BaseEntryType)) continue;
          if (Boolean(gui.textEntry.text) && Boolean(gui.subEntry.text)) {
            gui.textEntry.tickerHook.maxWidth = contentBlockWidth - gui.textEntry.hook.pos.x;
            gui.subEntry.tickerHook.maxWidth = contentBlockWidth - gui.subEntry.hook.pos.x;
            gui.textEntry.setMaxWidth(null);
          }
        }
      },
    });

    sc.ItemStatusDefault.inject({
      init(...args) {
        this.parent(...args);
        this.lvlText = new sc.TextGui(ig.lang.get('sc.gui.status-hud.lvl'), {
          font: sc.fontsystem.tinyFont,
        });
        this.lvlText.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
        this.lvlText.setPos(
          this.level.hook.pos.x + this.level.hook.size.x + 1,
          this.level.hook.pos.y - 1,
        );
        this.addChildGui(this.lvlText);
      },

      updateDrawables(renderer) {
        let { addGfx } = renderer;
        try {
          renderer.addGfx = (gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY) => {
            if (gfx === this.menuGfx) {
              if (srcX === 280 && srcY === 472 && sizeX === 126 && sizeY === 35) {
                // This code cuts out a small rectangle with the "LVL" text.
                let lvlSrcX = 84;
                let lvlSrcY = 2;
                let lvlSizeX = 13;
                let lvlSizeY = 5;
                // prettier-ignore
                const addSubGfx = (subPosX: number, subPosY: number, subSizeX: number, subSizeY: number): ig.GuiDrawable => {
                  return addGfx.call(renderer, gfx, posX + subPosX, posY + subPosY, srcX + subPosX, srcY + subPosY, subSizeX, subSizeY);
                };
                addSubGfx(0, 0, lvlSrcX, sizeY);
                addSubGfx(lvlSrcX, lvlSrcY + lvlSizeY, sizeX - lvlSrcX, sizeY - lvlSrcY - lvlSizeY);
                addSubGfx(lvlSrcX + lvlSizeX, lvlSrcY, sizeX - lvlSrcX - lvlSizeX, lvlSizeY);
                addSubGfx(lvlSrcX, 0, sizeX - lvlSrcX, lvlSrcY);
                return null!;
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
