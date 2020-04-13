import { TranslationToolClient } from './tool-client.js';

ig.module('crosscode-ru.translation-tool')
  .requires(
    'game.main',
    'game.feature.gui.screen.title-screen',
    'localize-me.final-locale.ready',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.ru.translationTool = new TranslationToolClient();

    sc.CrossCode.inject({
      onGameLoopStart() {
        this.parent();
        sc.ru.translationTool.readSettings().then(settings => {
          if (settings.autoOpen) sc.ru.translationTool.open();
        });
      },
    });

    function createTranslationToolButton(): sc.ButtonGui {
      let btn = new sc.ButtonGui('Переводилка', sc.BUTTON_DEFAULT_WIDTH);
      btn.onButtonPress = (): void => sc.ru.translationTool.open();
      return btn;
    }

    sc.TitleScreenButtonGui.inject({
      translationToolButton: null,

      init() {
        this.parent();

        let btn = createTranslationToolButton();
        this.translationToolButton = btn;
        btn.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
        let exitButtonHook = this.buttons[0].hook;
        btn.setPos(exitButtonHook.pos.x, exitButtonHook.pos.y);
        btn.hook.transitions = ig.copy(exitButtonHook.transitions);
        btn.doStateTransition('HIDDEN', true);
        let btnGroup = this.buttonGroup;
        btnGroup.addFocusGui(btn, 0, btnGroup.largestIndex.y + 1);
        this.addChildGui(btn);
      },

      show() {
        this.parent();
        this.translationToolButton.doStateTransition('DEFAULT');
      },

      hide(skipTransition) {
        this.parent(skipTransition);
        this.translationToolButton.doStateTransition('HIDDEN', skipTransition);
      },
    });

    sc.PauseScreenGui.inject({
      translationToolButton: null,

      init() {
        this.parent();

        let btn = createTranslationToolButton();
        this.translationToolButton = btn;
        btn.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
        this.addChildGui(btn);
      },

      updateButtons(refocus) {
        let btn = this.translationToolButton;
        this.removeChildGui(btn);

        this.parent(refocus);

        this.addChildGui(btn);
        const toTitleButtonHook = this.toTitleButton.hook;
        btn.setPos(toTitleButtonHook.pos.x, toTitleButtonHook.pos.y);
        let btnGroup = this.buttonGroup;
        btnGroup.addFocusGui(btn, btnGroup.largestIndex.x + 1, 0);
      },
    });
  });
