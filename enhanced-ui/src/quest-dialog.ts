ig.module('ultimate-localized-ui.fixes.quest-dialog')
  .requires('game.feature.menu.gui.quests.quest-misc', 'ultimate-localized-ui.ticker-display')
  .defines(() => {
    sc.QuestInfoBox.inject({
      init() {
        this.parent();
        let locationIconHook = this.locationGui.hook.children.find(
          ({ gui }) => gui instanceof ig.ImageGui && gui.image === this.gfx,
        );
        if (locationIconHook != null) {
          this.locationText.tickerHook.maxWidth =
            this.locationGui.hook.size.x -
            this.locationText.hook.pos.x -
            locationIconHook.pos.x / 2;
        }
      },
    });

    const QUEST_COLOR_DEFAULT = '#545454';
    const QUEST_COLOR_SOLVED = '#008277';
    const QUEST_COLOR_ELITE = '#8d0000';
    const QUEST_LEVEL_LABEL_POS_X = 6;
    const QUEST_LEVEL_LABEL_POS_Y = 3;
    const QUEST_LEVEL_LABEL_WIDTH = 15;
    const QUEST_LEVEL_LABEL_HEIGHT = 7;

    sc.QuestBaseBox.inject({
      tileOffsetToColorMapping: {
        dialog: QUEST_COLOR_DEFAULT,
        default: QUEST_COLOR_DEFAULT,
        solved: QUEST_COLOR_SOLVED,
        overlay: QUEST_COLOR_SOLVED,
        'dialog-solved': QUEST_COLOR_SOLVED,
        elite: QUEST_COLOR_ELITE,
        'elite-darker': QUEST_COLOR_ELITE,
      },

      init(...args) {
        this.parent(...args);
        this.levelLabel = new sc.TextGui(ig.lang.get('sc.gui.menu.quests.lvl'), {
          font: sc.fontsystem.tinyFont,
        });
        this.levelLabel.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
        this.levelLabel.setPos(QUEST_LEVEL_LABEL_POS_X, QUEST_LEVEL_LABEL_POS_Y);
        this.addChildGui(this.levelLabel);
      },

      updateDrawables(renderer) {
        this.parent(renderer);
        let color = this.tileOffsetToColorMapping[this.currentTileOffset];
        renderer.addColor(
          color,
          this.hook.size.x - QUEST_LEVEL_LABEL_WIDTH - QUEST_LEVEL_LABEL_POS_X,
          QUEST_LEVEL_LABEL_POS_Y,
          QUEST_LEVEL_LABEL_WIDTH,
          QUEST_LEVEL_LABEL_HEIGHT,
        );
      },
    });

    sc.QuestStartDialogButtonBox.inject({
      init(...args) {
        this.parent(...args);
        let btn1 = this.acceptButton;
        let btn2 = this.declineButton;
        // left border + right border
        let totalBorderWidth = this.hook.size.x - btn1.hook.size.x;
        let prevBtnWidth = Math.max(btn1.hook.size.x, btn2.hook.size.x);
        // This will forcibly recompute the width of the buttons
        btn1.setText(btn1.text, false);
        btn2.setText(btn2.text, false);
        let newBtnWidth = Math.max(prevBtnWidth, btn1.hook.size.x, btn2.hook.size.x);
        btn1.setWidth(newBtnWidth);
        btn2.setWidth(newBtnWidth);
        this.hook.size.x = newBtnWidth + totalBorderWidth;
      },
    });
  });
