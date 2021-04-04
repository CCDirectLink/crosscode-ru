// NOTE: Most of the commented out code in this file is a brilliant solution to
// the problem of duplicated lang labels in the `meta` object of files in
// `data/enemies/`: the lang labels `meta/species` and `meta/descriptions/*/text`
// are actually contained in `data/database.json` as well, their text values
// are 100% identical, and moreover the database contains more entries, but for
// some reason they are duplicated in the enemies files. But see, apparently the
// source code of the game doesn't contain even a single mention of the word
// `meta`, and the only class which loads those files (`sc.EnemyType`) doesn't
// access either of the duplicate lang labels, but the code I wrote was too
// brilliant, so I decided to keep it in the source tree.

const TRANSLATION_DATA_DIR = 'mod://crosscode-ru/assets/ru-translation-tool/';
const LOCALIZE_ME_PACKS_DIR = `${TRANSLATION_DATA_DIR}localize-me-packs/`;
const LOCALIZE_ME_MAPPING_FILE = `${TRANSLATION_DATA_DIR}localize-me-mapping.json`;

const RUSSIAN_FONT_CHARACTERS =
  'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';

const PATCHED_FONT_URLS = [
  'media/font/ru_RU/hall-fetica-bold.png',
  'media/font/ru_RU/hall-fetica-small.png',
  'media/font/ru_RU/tiny.png',
];

const LEA_SPELLING = localStorage.getItem('options.crosscode-ru.lea-spelling') || '0';

// relevant Wikipedia page: https://ru.wikipedia.org/wiki/Падеж#Падежная_система_русского_языка
const LEA_SPELLING_CONVERSION_TABLES = new Map<string, Map<string, string>>([
  [
    '1',
    new Map([
      ['Лея', 'Лиа'], // Именительный (1)
      ['ЛЕЯ', 'ЛИА'],
      ['Леи', 'Лии'], // Родительный (2)
      ['ЛЕИ', 'ЛИИ'],
      ['Лее', 'Лие'], // Дательный (3) + Предложный (6)
      ['ЛЕЕ', 'ЛИЕ'],
      ['Лею', 'Лию'], // Винительный (4)
      ['ЛЕЮ', 'ЛИЮ'],
      ['Леей', 'Лией'], // Творительный (5)
      ['ЛЕЕЙ', 'ЛИЕЙ'],
    ]),
  ],
]);

const IGNORED_LABELS = new Set<string>([
  '',
  'en_US',
  'LOL, DO NOT TRANSLATE THIS!',
  'LOL, DO NOT TRANSLATE THIS! (hologram)',
  '\\c[1][DO NOT TRANSLATE THE FOLLOWING]\\c[0]',
  '\\c[1][DO NOT TRANSLATE FOLLOWING TEXTS]\\c[0]',
]);

let textFilter = (text: string): string => text;
const leaSpellingTable = LEA_SPELLING_CONVERSION_TABLES.get(LEA_SPELLING);
if (leaSpellingTable != null) {
  let regex = new RegExp(
    // prettier-ignore
    `([^а-яА-ЯёЁ]|^)(${Array.from(leaSpellingTable.keys()).join('|')})([^а-яА-ЯёЁ]|$)`,
    'g',
  );
  textFilter = (text) =>
    text.replace(regex, (_wholeStr, leftBoundary: string, str: string, rightBoundary: string) => {
      return `${leftBoundary}${leaSpellingTable.get(str)}${rightBoundary}`;
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace LocalizeMe {
  interface FontPatchingContextCommon {
    russianFont: ig.Font;
  }
}

// let improvisedEnemiesTrPack = new Map<string, LocalizeMe.TranslationResult>();

localizeMe.add_locale('ru_RU', {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  from_locale: 'en_US',

  // map_file: async () => {
  //   let mapping: Record<string, string> = await ccmod.resources.loadJSON(LOCALIZE_ME_MAPPING_FILE);
  //   return (urlToPatch) => {
  //     if (!hasKey(mapping, urlToPatch)) return null;
  //     let trPackPath = mapping[urlToPatch];

  //     return async () => {
  //       let trPackData: LocalizeMe.TranslationPack = await ccmod.resources.loadJSON(
  //         `${LOCALIZE_ME_PACKS_DIR}${trPackPath}`,
  //       );

  //       if (urlToPatch === 'database.json') {
  //         for (let key in trPackData) {
  //           if (hasKey(trPackData, key) && key.startsWith('database.json/enemies/')) {
  //             improvisedEnemiesTrPack.set(key, trPackData[key]);
  //           }
  //         }
  //       }

  //       return trPackData;
  //     };
  //   };
  // },

  // eslint-disable-next-line @typescript-eslint/naming-convention
  map_file: LOCALIZE_ME_MAPPING_FILE,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  url_prefix: LOCALIZE_ME_PACKS_DIR,
  language: {
    en_US: 'Russian',
    de_DE: 'Russisch',
    fr_FR: 'Russe',
    ru_RU: 'Русский',
    zh_CN: '俄文',
    ja_JP: 'ロシア語',
    ko_KR: '러시아어',
  },
  flag: 'media/font/ru_RU/flag.png',

  // eslint-disable-next-line @typescript-eslint/naming-convention
  missing_cb: (langLabelOrString, dictPath) => {
    if (typeof langLabelOrString === 'string') {
      langLabelOrString = { en_US: langLabelOrString };
    }
    let original = langLabelOrString.en_US;

    // `missing_cb` is called even when the lang label actually contains a
    // corresponding language field. You see, a lot of lang labels were
    // "translated" into French simply by setting their translations to the
    // string "fr_FR". Unfortunately for Satcher, the author of Localize-me
    // and French-CC, this meant that they couldn't reliably detect
    // untranslated lang labels. So, translation is considered missing ONLY
    // AND ONLY IF the translation pack doesn't contain a translation. Which
    // kind of makes my life a bit harder because for now I want to put some
    // assets with localizable strings directly in the repository, before I
    // migrate them to Notabenoid or something else.
    let translated = langLabelOrString.ru_RU;
    if (translated) return translated;

    if (original === 'en_US') return 'ru_RU';

    // Pattern matches must be ordered by frequency of successful firing when
    // playing the game normally. database.json and gui.en_US.json for instance
    // are read every time the game is booted.

    if (/^database\.json\/areas\/[^/]+\/landmarks\/[^/]+\/teleportQuestion$/.test(dictPath)) {
      return '';
    }

    // if (dictPath.startsWith('enemies/')) {
    //   let match = /^enemies\/(.+?)\.json\/meta\/(.+)$/.exec(dictPath);
    //   if (match != null && match.length === 3) {
    //     let enemyPath = match[1];
    //     let jsonPath = match[2];
    //     let enemyId = enemyPath.replace(/\//g, '.');
    //     let result = improvisedEnemiesTrPack.get(`database.json/enemies/${enemyId}/${jsonPath}`);
    //     if (result != null && result.orig === original) {
    //       return textFilter(result.text);
    //     }
    //   }
    // }

    if (!sc.ru.debug.showUntranslatedStrings) return original;

    if (IGNORED_LABELS.has(original.trim())) {
      return original;
    }

    if (dictPath.startsWith('lang/sc/gui.en_US.json/labels/options/crosscode-ru/lea-spelling/')) {
      return original;
    }

    if (/^credits\/[^/]+\.json\/entries\/[^/]+\/names\/[^/]+$/.test(dictPath)) {
      return original;
    }

    return `--${original}`;
  },

  // eslint-disable-next-line @typescript-eslint/naming-convention
  text_filter: textFilter,

  // eslint-disable-next-line @typescript-eslint/naming-convention
  pre_patch_font: async (context): Promise<void> => {
    let url = PATCHED_FONT_URLS[context.size_index];
    if (url != null) {
      context.russianFont = await sc.ui2.waitForLoadable(new ig.Font(url, context.char_height));
    }
  },

  // eslint-disable-next-line @typescript-eslint/naming-convention
  patch_base_font: (canvas, context) => {
    let { russianFont } = context;
    if (russianFont != null) {
      let ctx2d = canvas.getContext('2d')!;
      for (let i = 0; i < RUSSIAN_FONT_CHARACTERS.length; i++) {
        let width = russianFont.widthMap[i] + 1;
        let rect = context.reserve_char(canvas, width);
        let char = RUSSIAN_FONT_CHARACTERS[i];
        context.set_char_pos(char, rect);
        let srcX = russianFont.indicesX[i];
        let srcY = russianFont.indicesY[i];
        ctx2d.drawImage(
          russianFont.data,
          srcX,
          srcY,
          width,
          russianFont.charHeight,
          rect.x,
          rect.y,
          rect.width,
          rect.height,
        );
      }
    }
    return canvas;
  },

  // eslint-disable-next-line @typescript-eslint/naming-convention
  misc_time_function: (): string => {
    let date = new Date();
    // https://pikabu.ru/story/a_gdeto_seychas_rovno_polden_4223194
    if (date.getHours() >= 11 && date.getHours() <= 13) {
      return ig.lang.get('sc.gui.misc-time-var.12-00');
    }
    let h = date.getHours().toString();
    let m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  },
});
