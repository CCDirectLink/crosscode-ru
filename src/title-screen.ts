ig.module('crosscode.fixes.title-screen')
  .requires('game.feature.gui.screen.title-screen')
  .defines(() => {
    sc.TitleScreenButtonGui.inject({
      init() {
        this.parent();

        let oldChangelogButtonWidth = this.changelogButton.hook.size.x;
        this.changelogButton.setText(
          sc.ru.localize(this.changelogButton.text as string, {
            orig: '\\i[menu]Changelog',
            text: '\\i[menu]История изменений',
          }),
        );

        this.changelogButton.hook.transitions.HIDDEN.state.offsetX! -=
          this.changelogButton.hook.size.x - oldChangelogButtonWidth;
        // forcibly transition to the changed state
        this.changelogButton.hook.currentStateName = '';
        this.changelogButton.doStateTransition('HIDDEN', true);
      },
    });
  });
