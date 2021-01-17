ig.module('crosscode-ru.fixes.arena-gui')
  .requires('game.feature.arena.gui.arena-round-gui', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.ArenaRoundEndButtons.inject({
      init(...args) {
        this.parent(...args);
        for (let btn of this.buttons) {
          let oldWidth = btn.hook.size.x;
          btn.setWidth(sc.BUTTON_DEFAULT_WIDTH);
          btn.hook.transitions.HIDDEN.state.offsetX! -= btn.hook.size.x - oldWidth;
          // forcibly transition to the changed state
          btn.hook.currentStateName = '';
          btn.doStateTransition('HIDDEN', true);
        }
      },
    });
  });
