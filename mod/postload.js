window.localizeMe.add_locale('ru_RU', {
  from_locale: 'en_US',
  map_file: () => {
    return (jsonPath, _json) => {
      return () => {
        return (dictPath, langLabel) => {
          console.log(jsonPath, dictPath, langLabel);
          return null;
        };
      };
    };
  },
  language: {
    en_US: 'Russian',
    de_DE: 'Russisch',
    fr_FR: 'Russe',
    ru_RU: 'Русский',
  },
  flag: 'media/font/languages/ru_RU.png',
});
