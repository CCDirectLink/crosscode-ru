ig.module('crosscode-ru.utils.localization')
  .requires('localize-me.final-locale.ready')
  .defines(() => {
    // poor man's Localize-me
    // see https://github.com/L-Sherry/Localize-me/blob/master/Documentation.md#plain-text-variant
    sc.ru.localize = (value, fragment) => {
      if (value === fragment.orig) value = fragment.text;
      return value;
    };

    sc.ru.localizeProp = (obj, prop, fragment) => {
      obj[prop] = sc.ru.localize(obj[prop], fragment);
    };
  });

ig.module('crosscode-ru.utils.localization.sprites')
  .requires(
    'crosscode-ru.utils.localization',
    'game.feature.model.options-model',
  )
  .defines(() => {
    // Perhaps this thing could go into `main`... TODO: put this in `poststart`
    // when ccloader v3 is ready.
    sc.OptionModel.inject({
      init() {
        this.parent();

        // You might be tempted to ask: "Why do you care about saving the value of
        // this option?" Yes, it's description does say that it needs a restart, and
        // I expect most users to hit that checkbox only once (after installing the
        // mod), but you are forgetting one important fact: my software doesn't have
        // any bugs! You see, if a user loads some patched sprites, then toggles
        // this setting and loads other patched sprites - in the end they'll have
        // both localized and not localized sprites in the same game instance! And,
        // since this IS TEHCNICALLY a bug, I'll fix it as well.
        let localizeSpritesOptionValue: boolean = this.get(
          'crosscode-ru.localized-labels-on-sprites',
        );
        sc.ru.shouldPatchSpriteLabels = notOptional => {
          return (
            ig.currentLang === 'ru_RU' &&
            (notOptional || localizeSpritesOptionValue)
          );
        };
      },
    });
  });
