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

    function addInventoryStatsLevelText(level: sc.NumberGui): sc.TextGui {
      let lvlText = new sc.TextGui(ig.lang.get('sc.gui.status-hud.lvl'), {
        font: sc.fontsystem.tinyFont,
      });
      lvlText.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
      lvlText.setPos(level.hook.pos.x + level.hook.size.x + 1, level.hook.pos.y - 1);
      return lvlText;
    }

    function drawInventoryStatsHeader(
      renderer: ig.GuiRenderer,
      origGfx: ig.Image,
      callback: (renderer: ig.GuiRenderer) => void,
    ): void {
      let { addGfx } = renderer;
      try {
        renderer.addGfx = (gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY) => {
          if (gfx === origGfx) {
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
        callback(renderer);
      } finally {
        renderer.addGfx = addGfx;
      }
    }

    sc.ItemStatusDefault.inject({
      init(...args) {
        this.parent(...args);
        this.lvlText = addInventoryStatsLevelText(this.level);
        this.addChildGui(this.lvlText);
      },

      updateDrawables(renderer) {
        drawInventoryStatsHeader(renderer, this.menuGfx, this.parent.bind(this));
      },
    });

    sc.StatusViewMainParameters.inject({
      init(...args) {
        this.parent(...args);
        this.lvlText = addInventoryStatsLevelText(this.level);
        this.addChildGui(this.lvlText);
      },

      updateDrawables(renderer) {
        drawInventoryStatsHeader(renderer, this.menuGfx, this.parent.bind(this));
      },
    });

    sc.ItemStatusDefaultBar.inject({
      nameGui: null,

      init(name, type, ...args) {
        this.parent(name, type, ...args);
        for (let { gui } of this.hook.children) {
          if (!(gui instanceof sc.TextGui && gui.text === name)) continue;
          this.nameGui = gui;
          switch (type) {
            case sc.MENU_BAR_TYPE.EXP:
              if (name === 'EXP') this.nameGui.setText(ig.lang.get('sc.gui.status-hud.exp'));
              break;
            case sc.MENU_BAR_TYPE.HP:
              if (name === 'HP') this.nameGui.setText(ig.lang.get('sc.gui.status-hud.hp'));
              break;
            case sc.MENU_BAR_TYPE.SP:
              if (name === 'SP') this.nameGui.setText(ig.lang.get('sc.gui.status-hud.sp'));
              break;
          }
          break;
        }
      },
    });
  });
