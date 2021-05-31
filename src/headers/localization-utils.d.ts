declare namespace sc.ru {
  function shouldPatchSpriteLabels(notOptional?: boolean): boolean;
}

declare namespace sc {
  namespace OPTIONS_DEFINITION {
    interface KnownTypesMap {
      'crosscode-ru.localized-labels-on-sprites': sc.OptionDefinition.CHECKBOX;
      'crosscode-ru.lea-spelling': sc.OptionDefinition.BUTTON_GROUP;
    }
  }
}
