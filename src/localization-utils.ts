ig.module('crosscode-ru.utils.localization')
  .requires('localize-me.final-locale.ready')
  .defines(() => {
    // poor man's Localize-me
    // see https://github.com/L-Sherry/Localize-me/blob/master/Documentation.md#plain-text-variant
    sc.ru.localize = (value, fragment): string => {
      if (value === fragment.orig) value = fragment.text;
      return value;
    };

    sc.ru.localizeProp = (obj, prop, fragment): void => {
      obj[prop] = sc.ru.localize(obj[prop], fragment);
    };
  });
