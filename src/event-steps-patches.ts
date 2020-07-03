ig.module('crosscode-ru.fixes.event-steps.shakeit')
  .requires('game.feature.npc.npc-steps')
  .defines(() => {
    // well, RFG doesn't use their own utility functions, so do I :shrug_face:
    function randomElement<T>(array: T[]): T {
      return array[Math.floor(Math.random() * array.length)];
    }

    ig.EVENT_STEP.DO_THE_SHAKE.inject({
      start() {
        if (this.charExpression) {
          sc.model.message.setExpression(this.person, this.charExpression);
        }

        let start = ig.lang.get('sc.gui.shakeit.start');

        let parts: string[] = ['first', 'second', 'third'].map((s) =>
          randomElement(ig.lang.get(`sc.gui.shakeit.${s}`)),
        );
        let swapFirstAndSecond = Math.random() >= 0.5;
        if (swapFirstAndSecond) {
          // this simple swap gives us exactly twice as many unique combinations
          let tmp = parts[0];
          parts[0] = parts[1];
          parts[1] = tmp;
        }

        this.message = `${start} ${parts.join('\n')}!`;
        sc.model.message.showMessage(this.person, this.message, false);
      },
    });
  });
