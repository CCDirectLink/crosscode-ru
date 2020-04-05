/// <reference types="nw.js" />

ig.module('crosscode-ru.social-button')
  .requires('game.feature.gui.screen.title-screen', 'dom.ready')
  .defines(() => {
    const BUTTON_GAP = 4;

    const LINKS = [
      { url: 'https://vk.com/crusscode', description: 'Наша группа в VK' },
      { url: 'https://discord.gg/QANXNbR', description: 'Наш Discord-сервер' },
      {
        url: 'https://github.com/dmitmel/crosscode-ru-ng',
        description: 'Исходный код основного мода',
      },
      {
        url: 'https://gitlab.com/Dimava/crosscode-translation-ru',
        description: 'Исходный код инструмента переводчика',
      },
    ];

    function showRussianSocialDialog(): void {
      let container = document.createElement('div');
      container.classList.add('gameOverlayBox', 'twitterMessage');
      requestAnimationFrame(() => {
        container.classList.add('shown');
      });

      let header = document.createElement('h3');
      header.textContent = 'CRUSsCode / Русское сообщество CrossCode';
      container.appendChild(header);

      let list = document.createElement('ul');
      LINKS.forEach(({ url, description }) => {
        let a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.textContent = url;

        if (ig.platform === ig.PLATFORM_TYPES.DESKTOP) {
          a.addEventListener('click', function(event) {
            event.preventDefault();
            // eslint-disable-next-line no-invalid-this
            nw.Shell.openExternal(this.href);
          });
        }

        let li = document.createElement('li');
        li.append(a, ` - ${description}`);

        list.append(li);
      });
      container.append(list);

      let closeBtn = document.createElement('input');
      closeBtn.type = 'button';
      closeBtn.value = 'Закрыть';
      closeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        ig.system.regainFocus();
      });
      container.append(closeBtn);

      document.body.append(container);
      ig.system.setFocusLost();

      ig.system.addFocusListener(() => {
        container.remove();
      });
      closeBtn.focus();
    }

    sc.TitleScreenButtonGui.inject({
      russianSocialButton: null,

      init() {
        this.parent();

        let languageIndex =
          localizeMe.game_locale_config.added_locales.ru_RU
            .localizeme_global_index;
        let followBtnHook = this.followButton.hook;
        let btn = new sc.ButtonGui(
          `\\i[language-${languageIndex}]`,
          followBtnHook.size.x,
        );
        btn.textChild.hook.pos.x += 1;
        btn.onButtonPress = showRussianSocialDialog;
        this.russianSocialButton = btn;
        btn.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_BOTTOM);
        btn.setPos(
          followBtnHook.pos.x,
          followBtnHook.pos.y + followBtnHook.size.y + BUTTON_GAP,
        );
        btn.hook.transitions = followBtnHook.transitions;
        btn.doStateTransition('HIDDEN', true);
        this.buttonGroup.addFocusGui(btn, 2, 3);
        this.addChildGui(btn);
      },

      show() {
        this.parent();
        this.russianSocialButton.doStateTransition('DEFAULT');
      },

      hide(skipTransition) {
        this.parent(skipTransition);
        this.russianSocialButton.doStateTransition('HIDDEN', skipTransition);
      },
    });
  });
