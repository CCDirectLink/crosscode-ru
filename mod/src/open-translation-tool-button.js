ig.module('crosscode-ru-translation-tool-ng.open-translation-tool-button')
  .requires('game.feature.gui.screen.title-screen')
  .defines(() => {
    function createTranslationToolButton() {
      let btn = new sc.ButtonGui('Переводилка', sc.BUTTON_DEFAULT_WIDTH);
      btn.onButtonPress = () => window.ruTranslationToolNg.open();
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
        btn.hook.transitions = exitButtonHook.transitions;
        btn.doStateTransition('HIDDEN', true);
        let btnGroup = this.buttonGroup;
        btnGroup.addFocusGui(btn, btnGroup.largestIndex.x + 1, 0);
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

      updateButtons() {
        let btn = this.translationToolButton;
        this.removeChildGui(btn);

        this.parent();

        this.addChildGui(btn);
        const toTitleButtonHook = this.toTitleButton.hook;
        btn.setPos(toTitleButtonHook.pos.x, toTitleButtonHook.pos.y);
        let btnGroup = this.buttonGroup;
        btnGroup.addFocusGui(btn, btnGroup.largestIndex.x + 1, 0);
      },
    });
  });
