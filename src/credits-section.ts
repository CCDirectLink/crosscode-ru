ig.module('crosscode-ru.fixes.credits-section')
  .requires('game.feature.credits.gui.credits-gui', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    // TODO: calculate total credits length and derive CREDITS_SPEED from it
    const CREDITS_SPEED_DEFAULT = 30;
    const CREDITS_SPEED = 36.45;
    const HEADER_TRANSITION_DELAY = 1.2 * (CREDITS_SPEED_DEFAULT / CREDITS_SPEED);
    const NAME_TRANSITION_DELAY = 1 * (CREDITS_SPEED_DEFAULT / CREDITS_SPEED);

    ig.GUI.CreditSection.inject({
      update() {
        // TODO: use sc.credits.speed for adjusting the credits speed, this
        // removes the need for injections into `update` and (possibly)
        // `createHeader`
        let y = this.content.hook.pos.y - CREDITS_SPEED * ig.system.actualTick * sc.credits.speed;
        this.finished = y <= -this.content.hook.size.y + ig.system.height;
        this.isOffscreen = y <= -this.content.hook.size.y && this.finished;
        if (this.isOffscreen) this.remove();
        this.content.hook.pos.y = y;
      },

      createHeader(text, pos, namesEmpty) {
        this.parent(text, pos, namesEmpty);

        let addedChildren = this.content.hook.children.slice(-(namesEmpty ? 1 : 2));
        for (let { gui } of addedChildren) {
          gui.onVisibilityChange = (visible) => {
            if (visible) {
              gui.doStateTransition(
                'DEFAULT',
                false,
                false,
                null,
                HEADER_TRANSITION_DELAY / sc.credits.speed,
              );
            } else {
              gui.doStateTransition('HIDDEN', true);
            }
          };
        }
      },

      createNames(names, columns, columnGuis, pos) {
        this.parent(names, columns, columnGuis, pos);

        let { content } = this;
        let columnContainerGui = columnGuis[0];
        for (let i = 0; i < columns; i++) {
          let columnGui = columnGuis[i + 1];
          // unfortunately the '?' marker on fields in TS allows only undefined
          // and not null, so I have to make an obviously wrong assertion here
          columnGui.onVisibilityChange = null!;
          for (let nameHook of columnGui.hook.children) {
            nameHook.doStateTransition('HIDDEN', true);
            // // request screenCoords calculation
            // nameHook.screenCoords = {
            //   x: 0,
            //   y: 0,
            //   w: nameHook.size.x,
            //   h: nameHook.size.y,
            //   active: false,
            //   zIndex: 0,
            // };
          }

          // Unfortunately, 'onVisibilityChange' works incorrectly on children
          // of 'columnGui'. Well, I have one more trick up my sleeve:
          let currentNameIndex = 0;
          let { update } = columnGui;
          columnGui.update = () => {
            update.call(columnGui);

            // as you can see, I'm using a simple optimization instead of
            // looping over EVERY child of `columnGui`
            let { children } = columnGui.hook;
            while (currentNameIndex < children.length) {
              let nameHook = children[currentNameIndex];
              let absoluteY = content.hook.pos.y + columnContainerGui.hook.pos.y + nameHook.pos.y;
              // NOTE: screenCoords are broken, don't use.
              // let absoluteY = nameHook.screenCoords!.y;
              if (absoluteY >= ig.system.height) break;

              nameHook.doStateTransition(
                'DEFAULT',
                false,
                false,
                null,
                NAME_TRANSITION_DELAY / sc.credits.speed,
              );
              currentNameIndex++;
            }
          };
        }
      },
    });
  });
