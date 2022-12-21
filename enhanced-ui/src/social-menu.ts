ig.module('ultimate-localized-ui.fixes.social-menu')
  .requires(
    'game.feature.menu.gui.social.social-list',
    'game.feature.menu.gui.social.social-misc',
    'ultimate-localized-ui.text-gui-utils',
  )
  .defines(() => {
    const STATUS_TEXT_GUI_SETTINGS: sc.TextGui.Settings = {
      font: sc.fontsystem.tinyFont,
      textAlign: ig.Font.ALIGN.CENTER,
    };

    sc.SocialList.inject({
      onCreateListEntries(list, ...args) {
        this.parent(list, ...args);
        if (!sc.SocialEntryButton.prototype.UI2_DRAW_STATUS_AS_TEXT_BLOCK) return;

        let allStatusTexts: Record<string, string> = ig.lang.get('sc.gui.menu.social.statuses');
        let dummyStatusTextGui = new sc.TextGui('', STATUS_TEXT_GUI_SETTINGS);
        let newStatusWidth = 0;
        let ninepatch = sc.SocialEntryButton.prototype.statusNinepatch.tile;
        for (let text of Object.values(allStatusTexts)) {
          dummyStatusTextGui.setText(text);
          newStatusWidth = Math.max(
            newStatusWidth,
            dummyStatusTextGui.hook.size.x - 1 + (ninepatch.left + 1) + (ninepatch.right + 1),
          );
        }
        dummyStatusTextGui.setText('');

        let statusHeaderStr = ig.lang.get('sc.gui.menu.social.status');
        let statusHeaderHook = this.bg.hook.children.find(
          ({ gui }) => gui instanceof sc.TextGui && gui.text === statusHeaderStr,
        );

        for (let { gui } of list.contentPane.hook.children) {
          if (!(gui instanceof sc.SocialEntryButton)) continue;

          let newButtonWidth =
            gui.button.hook.size.x - (newStatusWidth - gui.statusTextBg.hook.size.x);
          let newLineWidth = gui.hook.size.x - newButtonWidth;
          gui.setWidth(newButtonWidth, newLineWidth);
          gui.button.setWidth(newButtonWidth);
          gui.statusTextBg.setSize(newStatusWidth, gui.statusTextBg.hook.size.y);

          if (statusHeaderHook != null) {
            let scrollbarWidth = 4;
            // This is done to achieve perfect centering, see a comment below.
            statusHeaderHook.size.x -= 1;
            statusHeaderHook.pos.x =
              gui.statusTextBg.hook.pos.x +
              scrollbarWidth +
              (gui.statusTextBg.hook.size.x - statusHeaderHook.size.x) / 2;
            statusHeaderHook = null!;
          }
        }
      },
    });

    sc.SocialEntryButton.inject({
      UI2_DRAW_STATUS_AS_TEXT_BLOCK: false,

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
        party: 0xd3edff,
        online: 0xadff94,
        offline: 0xee9d96,
      },

      init(...args) {
        this.parent(...args);
        if (!this.UI2_DRAW_STATUS_AS_TEXT_BLOCK) return;

        this.statusTextGui = new sc.TextGui('', STATUS_TEXT_GUI_SETTINGS);
        this.statusTextGui.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
        this.statusTextGui.setPos(0, 0);

        this.statusTextBg = new ig.BoxGui(
          this.status.hook.size.x,
          this.status.hook.size.y,
          false,
          this.statusNinepatch,
        );
        this.statusTextBg.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
        this.statusTextBg.setPos(this.status.hook.pos.x, this.status.hook.pos.y);
        this.statusTextBg.addChildGui(this.statusTextGui);
        this.addChildGui(this.statusTextBg);

        this.removeChildGui(this.status);
        this.status = null!;

        this.updateMemberStatus();
      },

      updateMemberStatus(...args) {
        if (!this.UI2_DRAW_STATUS_AS_TEXT_BLOCK) {
          this.parent(...args);
          return;
        }

        let isPartyMember = sc.party.isPartyMember(this.key);
        let isOnline = sc.party.contacts[this.key].online;
        let state = isPartyMember ? 'party' : isOnline ? 'online' : 'offline';

        this.head.active = isPartyMember;
        this.statusTextBg.currentTileOffset = state;

        this.statusTextGui.setText(ig.lang.get(`sc.gui.menu.social.statuses.${state}`));
        // To align in the middle perfectly, subtract the final empty pixel
        // added after each letter, including the last one.
        this.statusTextGui.hook.size.x -= 1;
        this.statusTextGui.setDrawCallback(() => {
          sc.ui2.textRecolorDrawCallback(
            this.statusTextGui.textBlock,
            this.statusTextRecolors[state],
          );
        });
      },
    });

    sc.SocialBaseInfoBox.inject({
      init(...args) {
        this.parent(...args);
        for (let { gui } of this.hook.children) {
          if (gui instanceof sc.TextGui && gui.text === 'LVL') {
            gui.setText(ig.lang.get('sc.gui.status-hud.lvl'));
            break;
          }
        }
      },
    });
  });
