ig.module('ultimate-localized-ui.fixes.circuit-menu')
  .requires(
    'game.feature.menu.gui.circuit.circuit-misc',
    'game.feature.menu.gui.circuit.circuit-detail-elements',
  )
  .defines(() => {
    sc.CrossPointsOverview.Entry.inject({
      patchedGfx: new ig.Image('mod://ultimate-localized-ui/media/menu.png'),

      init(...args) {
        this.parent(...args);
        this.cpText = new sc.TextGui(ig.lang.get('sc.gui.menu.skill.cp'), {
          font: sc.fontsystem.tinyFont,
        });
        this.cpText.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
        this.cpText.setPos(25, 9);
        this.addChildGui(this.cpText);
      },

      updateDrawables(renderer) {
        let { addGfx } = renderer;
        try {
          renderer.addGfx = (gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY) => {
            if (gfx === this.gfx && srcX === 368 && srcY === 272 && sizeX === 52 && sizeY === 11) {
              return addGfx.call(renderer, this.patchedGfx, posX, posY, 1, 26, sizeX, sizeY);
            }
            return addGfx.call(renderer, gfx, posX, posY, srcX, srcY, sizeX, sizeY, flipX, flipY);
          };
          this.parent(renderer);
        } finally {
          renderer.addGfx = addGfx;
        }
      },
    });

    function patchCpCostLabel(costGui: sc.TextGui): void {
      let cpStr = ig.lang.get('sc.gui.menu.skill.cp');
      if (cpStr !== 'cp' && costGui.text != null) {
        let text = costGui.text.toString();
        if (text.endsWith('cp\\c[0]')) {
          costGui.setText(`${text.slice(0, -7)}${cpStr}\\c[0]`);
        } else if (text.endsWith('cp')) {
          costGui.setText(`${text.slice(0, -2)}${cpStr}`);
        }
      }
    }

    sc.CircuitNodeMenu.inject({
      init(...args) {
        this.parent(...args);
        patchCpCostLabel(this.costCP);
      },
      _setContent(...args) {
        this.parent(...args);
        patchCpCostLabel(this.costCP);
      },
    });

    sc.CircuitInfoBox.inject({
      init(...args) {
        this.parent(...args);
        patchCpCostLabel(this.cpCost);
      },
      _setContent(...args) {
        this.parent(...args);
        patchCpCostLabel(this.cpCost);
      },
    });
  });
