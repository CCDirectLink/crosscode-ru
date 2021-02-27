ig.module('crosscode-ru.fixes.social-menu')
  .requires(
    'game.feature.menu.gui.social.social-list',
    'game.feature.menu.gui.social.social-misc',
    'localize-me.final-locale.ready',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.SocialList.inject({
      init() {
        this.parent();
        let statusStr = ig.lang.get('sc.gui.menu.social.status');
        let statusHeaderHook = this.bg.hook.children.find(
          ({ gui }) => gui instanceof sc.TextGui && gui.text === statusStr,
        );
        if (statusHeaderHook != null) statusHeaderHook.pos.x -= 2;
      },
    });

    sc.SocialEntryButton.inject({
      // this image is used only to initialize `this.status` which I override in
      // the injected constructor anyway, so it's no big deal if I reuse this
      // field
      gfx2: new ig.Image('media/gui/menu.ru_RU.png'),

      init(name, model) {
        this.parent(name, model);
        this.status.offsetX = 0;
        this.status.offsetY = 162;
        this.status.setSize(45, 7);
        this.status.hook.pos.x -= 6;
        this.updateMemberStatus();
      },

      updateMemberStatus() {
        let isPartyMember = sc.party.isPartyMember(this.key);
        let isOnline = sc.party.contacts[this.key].online;
        let index = isPartyMember ? 0 : isOnline ? 1 : 2;
        this.status.offsetY = 162 + index * 8;
        this.head.active = isPartyMember;
      },
    });
  });
