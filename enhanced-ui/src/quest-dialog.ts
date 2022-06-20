ig.module('ultimate-localized-ui.fixes.quest-dialog')
  .requires(
    'game.feature.menu.gui.quests.quest-misc',
    'game.feature.menu.gui.quests.quest-details',
    'ultimate-localized-ui.ticker-display',
  )
  .defines(() => {
    sc.QuestDialog.inject({
      setQuestRewards(quest, hideRewards, finished, ...args) {
        let hooksIdx = this.hook.children.indexOf(this.titleGui.hook);
        let descHook = this.descriptionGui.hook;
        let sepHook = finished ? this.solvedGui!.hook : this.hook.children[hooksIdx + 2];
        let taskHook = finished ? this.endDescriptionGui!.hook : this.firstTaskGui!.hook;
        let rewardsIconHook = this.hook.children[hooksIdx + 4];
        let rewardsLineHook = this.hook.children[hooksIdx + 5];
        let itemsHook = this.itemsGui.hook;

        for (let hook of [sepHook, taskHook, rewardsIconHook, rewardsLineHook, itemsHook]) {
          let gui2: ig.GuiElementBase & { initialPosY?: number } = hook.gui;
          gui2.initialPosY ??= hook.pos.y;
          hook.pos.y = gui2.initialPosY;
        }

        this.parent(quest, hideRewards, finished, ...args);

        let margin = 0;

        margin = this.solvedGui != null ? 3 : 2;
        sepHook.pos.y += Math.max(0, descHook.pos.y + descHook.size.y + margin - sepHook.pos.y);

        margin = this.solvedGui != null ? 3 : 4;
        taskHook.pos.y += Math.max(0, sepHook.pos.y + sepHook.size.y + margin - taskHook.pos.y);

        margin = 1;
        let delta = Math.max(0, taskHook.pos.y + taskHook.size.y + margin - rewardsLineHook.pos.y);
        rewardsIconHook.pos.y += delta;
        rewardsLineHook.pos.y += delta;
        itemsHook.pos.y += delta;

        // The positions of these elements are not stored in the loop at the
        // beginning of the function because the original function resets them
        // to absolute values with `setPos`, but only conditionally (and so we
        // follow the said conditions here).
        if (quest.rewards.exp) this.expGui.hook.pos.y += delta;
        if (quest.rewards.money) this.creditGui.hook.pos.y += delta;
        if (quest.rewards.cp) this.cpGui.hook.pos.y += delta;
      },
    });

    sc.QuestInfoBox.inject({
      init(...args) {
        this.parent(...args);
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

      setQuest(quest, ...args) {
        let descHook = this.descriptionGui.hook;
        let viewHook1 = this.activeView.hook;
        let viewHook2 = this.solvedView.hook;

        for (let hook of [viewHook1, viewHook2]) {
          let gui2: ig.GuiElementBase & { initialPosY?: number } = hook.gui;
          gui2.initialPosY ??= hook.pos.y;
          hook.pos.y = gui2.initialPosY;
        }

        this.parent(quest, ...args);

        let margin = 4;
        viewHook1.pos.y += Math.max(0, descHook.pos.y + descHook.size.y + margin - viewHook1.pos.y);
        viewHook2.pos.y += Math.max(0, descHook.pos.y + descHook.size.y + margin - viewHook2.pos.y);
      },
    });

    sc.QuestDetailsView.inject({
      _setQuest(quest, ...args) {
        let descHook = this.descriptionGui.hook;
        let viewHook1 = this.activeView.hook;
        let viewHook2 = this.solvedView.hook;

        for (let hook of [viewHook1, viewHook2]) {
          let gui2: ig.GuiElementBase & { initialSizeY?: number } = hook.gui;
          gui2.initialSizeY ??= hook.size.y;
          hook.size.y = gui2.initialSizeY;
        }

        this.parent(quest, ...args);

        let margin = 2;
        // The vertical alignments on these are ig.GUI_ALIGN.Y_BOTTOM
        let viewHook1PosY = viewHook1.parentHook!.size.y - viewHook1.size.y - viewHook1.pos.y;
        viewHook1.size.y -= Math.max(0, descHook.pos.y + descHook.size.y + margin - viewHook1PosY);
        let viewHook2PosY = viewHook2.parentHook!.size.y - viewHook2.size.y - viewHook2.pos.y;
        viewHook2.size.y -= Math.max(0, descHook.pos.y + descHook.size.y + margin - viewHook2PosY);

        let { container } = this.activeView;
        if (container.hook.size.y !== viewHook1.size.y) {
          container.setSize(container.hook.size.x, viewHook1.size.y);
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
