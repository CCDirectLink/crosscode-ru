declare namespace sc.ru.debug {
  let showUntranslatedStrings: boolean;
  let consoleTimers: Map<string, number>;
}

declare namespace ig {
  namespace EVENT_STEP {
    namespace CONSOLE_TIME_START {
      interface Settings {
        label: string;
      }
    }
    interface CONSOLE_TIME_START extends ig.EventStepBase {
      label: string;
    }
    interface CONSOLE_TIME_START_CONSTRUCTOR extends ImpactClass<CONSOLE_TIME_START> {
      new (settings: CONSOLE_TIME_START.Settings): CONSOLE_TIME_START;
    }
    let CONSOLE_TIME_START: CONSOLE_TIME_START_CONSTRUCTOR;

    namespace CONSOLE_TIME_END {
      interface Settings {
        label: string;
      }
    }
    interface CONSOLE_TIME_END extends ig.EventStepBase {
      label: string;
    }
    interface CONSOLE_TIME_END_CONSTRUCTOR extends ImpactClass<CONSOLE_TIME_END> {
      new (settings: CONSOLE_TIME_END.Settings): CONSOLE_TIME_END;
    }
    let CONSOLE_TIME_END: CONSOLE_TIME_END_CONSTRUCTOR;
  }
}
