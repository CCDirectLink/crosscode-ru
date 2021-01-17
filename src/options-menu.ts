ig.module('crosscode-ru.fixes.options-menu')
  .requires('game.feature.model.options-model', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    // dammit, why are people relying on the order of keys in objects?
    let optionsDefinitionEntries = Object.entries(sc.OPTIONS_DEFINITION);
    let languageOptionIndex = optionsDefinitionEntries.findIndex(
      ([key, _value]) => key === 'language',
    );
    sc.ru.insertAfterOrAppend(
      optionsDefinitionEntries,
      languageOptionIndex,
      [
        'crosscode-ru.localized-labels-on-sprites',
        {
          cat: sc.OPTION_CATEGORY.GENERAL,
          type: 'CHECKBOX',
          init: true,
          restart: true,
        },
      ],
      [
        'crosscode-ru.lea-spelling',
        {
          cat: sc.OPTION_CATEGORY.GENERAL,
          type: 'BUTTON_GROUP',
          data: { natural: 0, canonical: 1 },
          init: 0,
          restart: true,
        },
      ],
    );
    sc.OPTIONS_DEFINITION = sc.ru.objectFromEntries(optionsDefinitionEntries);
  });
