ig.module('crosscode-ru.fixes.pause-screen')
  .requires('game.feature.gui.screen.pause-screen', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.PauseScreenGui.inject({
      init() {
        this.parent();
        this._fixButtonWidths();
      },

      updateButtons(refocus) {
        this.parent(refocus);
        this._fixButtonWidths();
      },

      _fixButtonWidths() {
        for (let btn of [
          this.resumeButton,
          this.skipButton,
          this.cancelButton,
          this.toTitleButton,
          this.saveGameButton,
          this.optionsButton,
          this.arenaRestart,
          this.arenaLobby,
        ]) {
          btn.setWidth(sc.BUTTON_DEFAULT_WIDTH + 10);
        }
      },
    });
  });
