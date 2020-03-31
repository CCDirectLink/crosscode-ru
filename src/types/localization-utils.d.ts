declare namespace sc.ru {
  interface LocalizableFragment {
    orig: string;
    text: string;
  }

  function localize(value: string, fragment: LocalizableFragment): string;
  function localizeProp<K extends keyof any>(
    obj: { [key in K]: string },
    prop: K,
    fragment: LocalizableFragment,
  ): void;
}
