const LOCALIZE_ME_PACKS_DIR = `ru-translation-tool-ng/localize-me-packs/`;
const LOCALIZE_ME_MAPPING_FILE = `ru-translation-tool-ng/localize-me-mapping.json`;

window.localizeMe.add_locale('ru_RU', {
  from_locale: 'en_US',
  map_file: LOCALIZE_ME_MAPPING_FILE,
  url_prefix: LOCALIZE_ME_PACKS_DIR,
  language: {
    en_US: 'Russian',
    de_DE: 'Russisch',
    fr_FR: 'Russe',
    ru_RU: 'Русский',
  },
  flag: 'media/font/languages/ru_RU.png',
});
