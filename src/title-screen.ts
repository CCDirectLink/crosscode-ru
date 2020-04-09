ig.module('crosscode.fixes.title-screen')
  .requires(
    'game.feature.gui.screen.title-screen',
    'localize-me.final-locale.ready',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

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
