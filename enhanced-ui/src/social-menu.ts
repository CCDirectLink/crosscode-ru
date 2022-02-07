ig.module('ultimate-localized-ui.fixes.social-menu')
  .requires(
    'game.feature.menu.gui.social.social-list',
    'game.feature.menu.gui.social.social-misc',
    'ultimate-localized-ui.text-gui-utils',
  )
  .defines(() => {
    sc.SocialList.inject({
      onCreateListEntries(list, ...args) {
        this.parent(list, ...args);
        let entries = list.contentPane.hook.children;
        if (entries.length > 0) {
          let entry = entries[0].gui as sc.SocialEntryButton;
          let statusHeaderStr = ig.lang.get('sc.gui.menu.social.status');
          let statusHeaderHook = this.bg.hook.children.find(
            ({ gui }) => gui instanceof sc.TextGui && gui.text === statusHeaderStr,
          );
          if (statusHeaderHook != null) {
            let scrollbarWidth = 4;
            // This is done to achieve perfect centering, see a comment below.
            statusHeaderHook.size.x -= 1;
            statusHeaderHook.pos.x =
              entry.statusWrapperGui.hook.pos.x +
              scrollbarWidth +
              (entry.statusWrapperGui.hook.size.x - statusHeaderHook.size.x) / 2;
          }
        }
      },
    });

    sc.SocialEntryButton.inject({
      renderStatusAsTextBlock: false,

      statusNinepatch: new ig.NinePatch('mod://ultimate-localized-ui/media/menu.png', {
        width: 4,
        height: 0,
        left: 4,
        top: 9,
        right: 4,
        bottom: 0,
        offsets: {
          party: { x: 1, y: 1 },
          online: { x: 1, y: 9 },
          offline: { x: 1, y: 17 },
        },
      }),
      statusTextRecolors: {
        party: [0xd3, 0xed, 0xff],
        online: [0xad, 0xff, 0x94],
        offline: [0xee, 0x9d, 0x96],
      },

      init(...args) {
        this.parent(...args);
        if (!this.renderStatusAsTextBlock) return;

        this.statusTextGui = new sc.TextGui('', {
          font: sc.fontsystem.tinyFont,
          textAlign: ig.Font.ALIGN.CENTER,
        });
        this.statusTextGui.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
        this.statusTextGui.setPos(0, 0);

        this.statusTexts = ig.lang.get('sc.gui.menu.social.statuses');
        let newStatusWidth = 0;
        for (let text of Object.values(this.statusTexts)) {
          this.statusTextGui.setText(text);
          let ninepatch = this.statusNinepatch.tile;
          newStatusWidth = Math.max(
            newStatusWidth,
            this.statusTextGui.hook.size.x + (ninepatch.left + 1) + (ninepatch.right + 1) - 1,
          );
        }
        this.statusTextGui.setText('');

        let newButtonWidth = this.button.hook.size.x - (newStatusWidth - this.status.hook.size.x);
        let newLineWidth = this.hook.size.x - newButtonWidth;
        this.setWidth(newButtonWidth, newLineWidth);
        this.button.setWidth(newButtonWidth);

        this.statusWrapperGui = new ig.BoxGui(
          newStatusWidth,
          this.status.hook.size.y,
          false,
          this.statusNinepatch,
        );
        this.statusWrapperGui.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
        this.statusWrapperGui.setPos(this.status.hook.pos.x, this.status.hook.pos.y);
        this.addChildGui(this.statusWrapperGui);
        this.statusWrapperGui.addChildGui(this.statusTextGui);

        this.removeChildGui(this.status);
        this.status = null!;

        this.updateMemberStatus();
      },

      updateMemberStatus(...args) {
        if (!this.renderStatusAsTextBlock) {
          this.parent(...args);
          return;
        }

        let isPartyMember = sc.party.isPartyMember(this.key);
        let isOnline = sc.party.contacts[this.key].online;
        let state = isPartyMember ? 'party' : isOnline ? 'online' : 'offline';
        this.statusWrapperGui.currentTileOffset = state;
        this.statusTextGui.setText(this.statusTexts[state]);
        // To align in the middle perfectly, subtract the final empty pixel
        // added after each letter, including the last one.
        this.statusTextGui.hook.size.x -= 1;
        this.statusTextGui.setDrawCallback(() => {
          sc.ui2.textRecolorDrawCallback(
            this.statusTextGui.textBlock,
            this.statusTextRecolors[state],
          );
        });
        this.head.active = isPartyMember;
      },
    });
  });
