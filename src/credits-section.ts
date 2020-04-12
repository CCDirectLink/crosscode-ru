ig.module('crosscode-ru.fixes.credits-section')
  .requires(
    'game.feature.credits.gui.credits-gui',
    'localize-me.final-locale.ready',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    const CREDITS_SPPED_DEFAULT = 30;
    const CREDITS_SPEED = 36;
    const HEADER_TRANSITION_DELAY =
      1.2 * (CREDITS_SPPED_DEFAULT / CREDITS_SPEED);
    const NAME_TRANSITION_DELAY = 2 * (CREDITS_SPPED_DEFAULT / CREDITS_SPEED);

    ig.GUI.CreditSection.inject({
      update() {
        let y = this.content.hook.pos.y - CREDITS_SPEED * ig.system.actualTick;
        this.finished = y <= -this.content.hook.size.y + ig.system.height;
        this.isOffscreen = y <= -this.content.hook.size.y;
        if (this.isOffscreen) this.remove();
        this.content.hook.pos.y = y;
      },

      createHeader(text, pos, namesEmpty) {
        this.parent(text, pos, namesEmpty);

        let addedChildren = this.content.hook.children.slice(
          -(namesEmpty ? 1 : 2),
        );
        for (let { gui } of addedChildren) {
          gui.onVisibilityChange = (visible): void => {
            if (visible) {
              gui.doStateTransition(
                'DEFAULT',
                false,
                false,
                null,
                HEADER_TRANSITION_DELAY,
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
          }

          // Unfortunately, 'onVisibilityChange' works incorrectly on children
          // of 'columnGui'. Well, I have one more trick up my sleeve:
          let currentNameIndex = 0;
          let { update } = columnGui;
          // eslint-disable-next-line no-loop-func
          columnGui.update = (): void => {
            update.call(columnGui);

            // as you can see, I'm using a simple optimization instead of
            // looping over EVERY child of `columnGui`
            let { children } = columnGui.hook;
            while (currentNameIndex < children.length) {
              let nameHook = children[currentNameIndex];
              let absoluteY =
                content.hook.pos.y +
                columnContainerGui.hook.pos.y +
                nameHook.pos.y;
              if (absoluteY >= ig.system.height) break;

              nameHook.doStateTransition(
                'DEFAULT',
                false,
                false,
                null,
                NAME_TRANSITION_DELAY,
              );
              currentNameIndex++;
            }
          };
        }
      },
    });
  });
