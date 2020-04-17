const LOCALIZE_ME_PACKS_DIR = 'ru-translation-tool/localize-me-packs/';
const LOCALIZE_ME_MAPPING_FILE = 'ru-translation-tool/localize-me-mapping.json';

const RUSSIAN_FONT_CHARACTERS =
  'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';

const PATCHED_FONT_URLS = [
  'media/font/ru_RU/hall-fetica-bold.png',
  'media/font/ru_RU/hall-fetica-small.png',
  'media/font/ru_RU/tiny.png',
];

const LEA_SPELLING =
  localStorage.getItem('options.crosscode-ru.lea-spelling') || '0';

// relevant Wikipedia page: https://ru.wikipedia.org/wiki/Падеж#Падежная_система_русского_языка
const LEA_SPELLING_CONVERSION_TABLES: Dictionary<Dictionary<string>> = {
  '1': {
    Лея: 'Лиа', // Именительный (1)
    Леи: 'Лии', // Родительный (2)
    Лее: 'Лие', // Дательный (3) + Предложный (6)
    Лею: 'Лию', // Винительный (4)
    Леей: 'Лией', // Творительный (5)
  },
};

let textFilter: ((text: string) => string) | null = null;
let leaSpellingTable = LEA_SPELLING_CONVERSION_TABLES[LEA_SPELLING];
if (leaSpellingTable != null) {
  let regex = new RegExp(Object.keys(leaSpellingTable).join('|'), 'g');
  textFilter = text => text.replace(regex, str => leaSpellingTable[str]);
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace LocalizeMe {
  interface FontPatchingContextCommon {
    russianFont: ig.Font;
  }
}

localizeMe.add_locale('ru_RU', {
  /* eslint-disable @typescript-eslint/camelcase */
  from_locale: 'en_US',
  map_file: LOCALIZE_ME_MAPPING_FILE,
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
  /* eslint-enable @typescript-eslint/camelcase */

  // eslint-disable-next-line @typescript-eslint/camelcase
  missing_cb: (langLabelOrString, dictPath) => {
    if (typeof langLabelOrString === 'string') {
      // eslint-disable-next-line @typescript-eslint/camelcase
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

    if (!sc.ru.debug.showUntranslatedStrings) return original;

    if (/^credits\/[^/]+\.json\/entries\/[^/]+\/names\/[^/]+$/.test(dictPath)) {
      return original;
    }

    if (
      dictPath.startsWith(
        'lang/sc/gui.en_US.json/labels/options/crosscode-ru/lea-spelling/',
      )
    ) {
      return original;
    }

    return `--${original}`;
  },

  // eslint-disable-next-line @typescript-eslint/camelcase
  text_filter: textFilter,

  // eslint-disable-next-line @typescript-eslint/camelcase
  pre_patch_font: async (context): Promise<void> => {
    let url = PATCHED_FONT_URLS[context.size_index];
    if (url != null) {
      context.russianFont = await sc.ui2.waitForLoadable(
        new ig.Font(url, context.char_height),
      );
    }
  },

  // eslint-disable-next-line @typescript-eslint/camelcase
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

  // eslint-disable-next-line @typescript-eslint/camelcase
  misc_time_function: (): string => {
    let date = new Date();
    // https://pikabu.ru/story/a_gdeto_seychas_rovno_polden_4223194
    // TODO: add this to Nota
    if (date.getHours() >= 11 && date.getHours() <= 13) return 'час расплаты';
    let h = date.getHours().toString();
    let m = date
      .getMinutes()
      .toString()
      .padStart(2, '0');
    return `${h}:${m}`;
  },
});
