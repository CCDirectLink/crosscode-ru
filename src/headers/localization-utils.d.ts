declare namespace sc.ru {
  interface LocalizableFragment {
    orig: string;
    text: string;
  }

  function localize(value: string, fragment: sc.ru.LocalizableFragment): string;
  function localizeProp<K extends PropertyKey>(
    obj: { [key in K]: string },
    prop: K,
    fragment: sc.ru.LocalizableFragment,
  ): void;

  function shouldPatchSpriteLabels(notOptional?: boolean): boolean;
}
