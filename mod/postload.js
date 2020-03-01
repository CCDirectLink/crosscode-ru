if (sc.ru == null) sc.ru = {};

const LOCALIZE_ME_PACKS_DIR = `ru-translation-tool-ng/localize-me-packs/`;
const LOCALIZE_ME_MAPPING_FILE = `ru-translation-tool-ng/localize-me-mapping.json`;

const RUSSIAN_FONT_CHARACTERS =
  'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';

const PATCHED_FONT_URLS = [
  'media/font/ru_RU/hall-fetica-bold.png',
  'media/font/ru_RU/hall-fetica-small.png',
  'media/font/ru_RU/tiny.png',
];

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
  flag: 'media/font/ru_RU/flag.png',

  missing_cb: (langLabelOrString, dictPath) => {
    let original = langLabelOrString.en_US || langLabelOrString;
    if (/^credits\/[^/]+.json\/entries\/[^/]+\/names\/[^/]+$/.test(dictPath)) {
      return original;
    }
    return `--${original}`;
  },

  pre_patch_font: async context => {
    let url = PATCHED_FONT_URLS[context.size_index];
    if (url != null) {
      const font = new ig.Font(url, context.char_height);
      context.russianFont = font;
      return new Promise(resolve => {
        const oldOnload = font.onload;
        font.onload = (...a) => {
          oldOnload.apply(font, a);
          resolve();
        };
      });
    }
  },
  patch_base_font: (canvas, context) => {
    let { russianFont } = context;
    if (russianFont != null) {
      let context2d = canvas.getContext('2d');
      for (let i = 0; i < RUSSIAN_FONT_CHARACTERS.length; i++) {
        let width = russianFont.widthMap[i] + 1;
        let rect = context.reserve_char(canvas, width);
        let char = RUSSIAN_FONT_CHARACTERS[i];
        context.set_char_pos(char, rect);
        let srcX = russianFont.indicesX[i];
        let srcY = russianFont.indicesY[i];
        context2d.drawImage(
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

  misc_time_function: () => {
    let date = new Date();
    // https://pikabu.ru/story/a_gdeto_seychas_rovno_polden_4223194
    if (date.getHours() >= 11 && date.getHours() <= 13) return 'час расплаты';
    let h = date.getHours().toString();
    let m = date
      .getMinutes()
      .toString()
      .padStart(2, '0');
    return `${h}:${m}`;
  },
});
