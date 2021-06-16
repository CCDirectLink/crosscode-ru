if (sc.ru.debug == null) sc.ru.debug = {} as typeof sc.ru.debug;

sc.ru.debug.showUntranslatedStrings = false;

ig.module('crosscode-ru.debug.timer-steps')
  .requires('impact.base.event')
  .defines(() => {
    sc.ru.debug.consoleTimers = new Map<string, number>();

    ig.EVENT_STEP.CONSOLE_TIME_START = ig.EventStepBase.extend({
      label: '',
      init(settings) {
        this.label = settings.label;
      },
      start() {
        sc.ru.debug.consoleTimers.set(this.label, performance.now());
      },
    });

    ig.EVENT_STEP.CONSOLE_TIME_END = ig.EventStepBase.extend({
      label: '',
      init(settings) {
        this.label = settings.label;
      },
      start() {
        let endTime = performance.now();
        let startTime = sc.ru.debug.consoleTimers.get(this.label);
        if (startTime != null) {
          let delta = endTime - startTime;
          console.log(`${this.label}: ${delta.toFixed(3)}ms`);
          sc.ru.debug.consoleTimers.delete(this.label);
        } else {
          console.warn(`Timer '${this.label}' does not exist`);
        }
      },
    });
  });
