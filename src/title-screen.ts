// TODO: move to enhanced-ui
ig.module('crosscode-ru.fixes.title-screen')
  .requires('game.feature.gui.screen.title-screen')
  .defines(() => {
    sc.TitleScreenButtonGui.inject({
      init() {
        this.parent();

        let oldChangelogButtonWidth = this.changelogButton.hook.size.x;
        this.changelogButton.setText(
          `\\i[menu]${ig.lang.get('sc.gui.title-screen.changelog')}`,
        );

        this.changelogButton.hook.transitions.HIDDEN.state.offsetX! -=
          this.changelogButton.hook.size.x - oldChangelogButtonWidth;
        // forcibly transition to the changed state
        this.changelogButton.hook.currentStateName = '';
        this.changelogButton.doStateTransition('HIDDEN', true);
      },
    });
  });
