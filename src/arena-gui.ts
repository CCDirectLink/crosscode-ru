ig.module('crosscode-ru.fixes.arena-gui')
  .requires('game.feature.arena.gui.arena-round-gui')
  .defines(() => {
    sc.ArenaRoundEndButtons.inject({
      init(...args) {
        this.parent(...args);
        this.buttons.forEach(btn => {
          let oldWidth = btn.hook.size.x;
          btn.setWidth(sc.BUTTON_DEFAULT_WIDTH);
          btn.hook.transitions.HIDDEN.state.offsetX! -=
            btn.hook.size.x - oldWidth;
          // forcibly transition to the changed state
          btn.hook.currentStateName = '';
          btn.doStateTransition('HIDDEN', true);
        });
      },
    });
  });
