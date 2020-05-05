ig.module('crosscode-ru.social-button')
  .requires(
    'game.feature.gui.screen.title-screen',
    'dom.ready',
    'localize-me.final-locale.ready',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    const LINKS = [
      { url: 'https://vk.com/crusscode', description: 'Наша группа в VK' },
      { url: 'https://discord.gg/QANXNbR', description: 'Наш Discord-сервер' },
      {
        url: 'https://github.com/dmitmel/crosscode-ru',
        description: 'Исходный код основного мода',
      },
      {
        url: 'https://gitlab.com/Dimava/crosscode-translation-ru',
        description: 'Исходный код инструмента переводчика',
      },
    ];

    // I hope this won't change in the next update. Also, developer names and
    // twitter handles aren't copyrighted material, ha!
    const DEVELOPER_TWITTER_ACCOUNTS = [
      { twitter: 'RadicalFishGame', role: 'Official Account' },
      { twitter: 'lachsen', role: 'Creative Direction, Programming' },
      { twitter: 'RadicalRegiden', role: 'Level Design, Programming' },
      { twitter: 'GFluegel', role: 'Quest Design' },
      { twitter: 'interovgm', role: 'Music' },
      { twitter: 'Teflonator', role: 'Sound Design' },
      { twitter: 'ThomasFroese', role: 'Pixel Art (Effects & Animations)' },
      { twitter: 'ma_jrv', role: 'Pixel Art (Environment)' },
      { twitter: 'VintalValentin', role: 'Pixel Art (Environment)' },
      { twitter: 'Indofrece', role: 'Concept Art' },
    ];

    function showRussianSocialDialog(): void {
      let container = document.createElement('div');
      container.classList.add('gameOverlayBox', 'twitterMessage');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'center';
      requestAnimationFrame(() => {
        container.classList.add('shown');
      });

      let scrollContainer = document.createElement('div');
      scrollContainer.style.alignSelf = 'stretch';
      scrollContainer.style.marginBottom = '8px';
      scrollContainer.style.overflow = 'auto';

      let russianHeader = document.createElement('h3');
      russianHeader.textContent = 'CRUSsCode / Русское сообщество CrossCode';
      scrollContainer.appendChild(russianHeader);

      let russianList = document.createElement('ul');
      for (let { url, description } of LINKS) {
        let a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.textContent = url;
        setupLink(a);

        let li = document.createElement('li');
        li.append(a, ` - ${description}`);
        russianList.append(li);
      }
      scrollContainer.append(russianList);

      let developerHeader = document.createElement('h3');
      developerHeader.textContent = 'Follow us on Twitter!';
      scrollContainer.appendChild(developerHeader);

      let developerList = document.createElement('ul');
      for (let { twitter, role } of DEVELOPER_TWITTER_ACCOUNTS) {
        let a = document.createElement('a');
        a.href = `https://twitter.com/${twitter}`;
        a.target = '_blank';
        a.textContent = `@${twitter}`;
        setupLink(a);

        let li = document.createElement('li');
        li.append(a, ` - ${role}`);
        developerList.append(li);
      }
      scrollContainer.append(developerList);

      // haven't I told already how much I hate HTML?
      let closeBtnContainer = document.createElement('div');
      let closeBtn = document.createElement('input');
      closeBtn.type = 'button';
      closeBtn.value = 'Закрыть';
      closeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        ig.system.regainFocus();
      });
      closeBtnContainer.append(closeBtn);

      container.append(scrollContainer, closeBtnContainer);

      document.body.append(container);
      ig.system.setFocusLost();

      const callback = (): void => {
        container.remove();
        ig.system.removeFocusListener(callback);
      };
      ig.system.addFocusListener(callback);
      closeBtn.focus();
    }

    function setupLink(a: HTMLAnchorElement): void {
      if (ig.platform === ig.PLATFORM_TYPES.DESKTOP) {
        a.addEventListener('click', function (event) {
          event.preventDefault();
          // eslint-disable-next-line no-invalid-this
          nw.Shell.openExternal(this.href);
        });
      }
    }

    sc.TitleScreenButtonGui.inject({
      init() {
        this.parent();

        let languageIndex =
          localizeMe.game_locale_config.added_locales.ru_RU
            .localizeme_global_index;
        let btn = this.followButton;
        btn.textChild.setText(`\\i[language-${languageIndex}]`);
        btn.textChild.setPos(
          btn.textChild.hook.pos.x + 1,
          btn.textChild.hook.pos.y - 1,
        );
        btn.onButtonPress = showRussianSocialDialog;
      },
    });
  });
