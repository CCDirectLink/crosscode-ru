ig.module('crosscode-ru-translation-tool-ng.open-translation-tool-button')
  .requires('game.feature.gui.screen.title-screen')
  .defines(() => {
    sc.TitleScreenButtonGui.inject({
      translationToolButton: null,

      init() {
        this.parent();

        const firstButtonHook = this.buttonGroup.elements[1].find(
          value => value,
        ).hook;
        this.translationToolButton = new sc.ButtonGui(
          'Переводилка',
          firstButtonHook.size.x,
        );
        this.translationToolButton.setAlign(
          firstButtonHook.align.x,
          firstButtonHook.align.y,
        );
        this.translationToolButton.setPos(
          firstButtonHook.pos.x,
          firstButtonHook.pos.y + firstButtonHook.size.y + 4,
        );
        this.translationToolButton.onButtonPress =
          window.ruTranslationToolNg.openWindow;
        this.translationToolButton.hook.transitions =
          firstButtonHook.transitions;
        this.translationToolButton.doStateTransition('HIDDEN', true);
        this.buttonGroup.insertFocusGui(this.translationToolButton, 1, 0);
        this.insertChildGui(this.translationToolButton);
      },

      show() {
        this.parent();
        this.translationToolButton.doStateTransition('DEFAULT');
      },

      hide(timingBoolean) {
        this.parent(timingBoolean);
        this.translationToolButton.doStateTransition('HIDDEN', timingBoolean);
      },
    });

    sc.PauseScreenGui.inject({
      translationToolButton: null,

      init() {
        this.parent();

        this.translationToolButton = new sc.ButtonGui(
          'Переводилка',
          sc.BUTTON_DEFAULT_WIDTH,
        );
        this.translationToolButton.setAlign(
          ig.GUI_ALIGN.X_RIGHT,
          ig.GUI_ALIGN.Y_BOTTOM,
        );
        this.translationToolButton.onButtonPress =
          window.ruTranslationToolNg.openWindow;
        this.insertChildGui(this.translationToolButton);
      },

      updateButtons() {
        this.removeChildGui(this.translationToolButton);

        this.parent();

        this.addChildGui(this.translationToolButton);

        const firstButtonHook = this.buttonGroup.elements[0][0].hook;
        this.translationToolButton.setPos(
          firstButtonHook.pos.x,
          firstButtonHook.pos.y + firstButtonHook.size.y + 16,
        );
        this.buttonGroup.insertFocusGui(this.translationToolButton, 0, 0);
      },
    });
  });
