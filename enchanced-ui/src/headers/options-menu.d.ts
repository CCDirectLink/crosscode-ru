declare namespace sc {
  interface OptionRow {
    childFocusTargets: ig.FocusGui[];
  }

  interface KeyBinderGui {
    anykeyText: sc.TextGui;
  }

  namespace OPTIONS_DEFINITION {
    interface KnownTypesMap {
      'crosscode-ru.localized-labels-on-sprites': sc.OptionDefinition.CHECKBOX;
    }
  }
}
