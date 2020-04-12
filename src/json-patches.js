/* global simplify, simplifyResources */

function addEnglishLabelsToLangFile(data) {
  return ig.merge(data, {
    labels: {
      'combat-hud': {
        'pvp-round': 'Round',
      },
      'title-screen': {
        changelog: 'Changelog',
      },
      options: {
        headers: {
          'crosscode-ru': {
            options: 'crosscode-ru options',
          },
        },
        'crosscode-ru': {
          'localized-labels-in-maps': {
            name: 'localized-labels-in-maps',
            description:
              'localized-labels-in-maps description. \\c[1]Needs a restart!',
          },
        },
      },
    },
  });
}

const JSON_PATCHES = {
  'data/lang/sc/gui.de_DE.json': addEnglishLabelsToLangFile,
  'data/lang/sc/gui.en_US.json': addEnglishLabelsToLangFile,
  'data/lang/sc/gui.ja_JP.json': addEnglishLabelsToLangFile,
  'data/lang/sc/gui.ko_KR.json': addEnglishLabelsToLangFile,
  'data/lang/sc/gui.zh_CN.json': addEnglishLabelsToLangFile,

  'data/maps/jungle/grove/grove-path-02.json': data => {
    if (ig.currentLang !== 'ru_RU') return data;

    sc.ru.localizeProp(data.entities[892].settings.event[0], 'value', {
      orig: '[Inspecting]',
      text: '[Изучает]',
    });
    sc.ru.localizeProp(data.entities[892].settings.event[1], 'value', {
      orig: '[Escort Linde here]',
      text: '[Сопровождайте Линдэ]',
    });
    return data;
  },

  // sorry, Felix... not many people watch credits until the end, so I'll have
  // to inject our names in the first data file. hope RFG doesn't mind :P
  'data/credits/radicalfish-core.json': async data => {
    if (ig.currentLang !== 'ru_RU') return data;

    let entries = Object.entries(data.entries);

    // TODO: get mod instance through the Plugin constructor and use
    // simplify.resources.loadJSON
    let russianCreditsData = await simplify.resources.loadJSONPatched(
      'data/credits/crosscode-ru.json',
    );
    let russianEntries = Object.entries(russianCreditsData.entries);

    let felixIndex = entries.findIndex(
      ([key, _value]) => key === 'creativeDirector',
    );
    // don't forget that entries here has type `Array<[K, V]>`
    entries[felixIndex][1].bottomPad = 80;
    entries.splice(felixIndex + 1, 0, ...russianEntries);

    data.entries = entries.reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

    return data;
  },

  'data/scale-props/dungeon-ar.json': data => {
    if (!sc.ru.shouldPatchSpriteLabels()) return data;

    data.jsonTEMPLATES.ArTextRu = Object.assign(data.jsonTEMPLATES.ArText, {
      gfx: 'media/entity/objects/dungeon-ar.ru_RU.png',
      gfxBaseX: 0,
      gfxBaseY: 0,
    });

    Object.assign(data.entries.textWelcome, {
      jsonINSTANCE: 'ArTextRu',
      srcX: 0,
      srcY: 16,
      width: 128,
    });
    Object.assign(data.entries.textComplete, {
      jsonINSTANCE: 'ArTextRu',
      srcX: 0,
      srcY: 32,
      width: 128,
    });

    return data;
  },

  'data/scale-props/dungeon-ar-special.json': data => {
    if (!sc.ru.shouldPatchSpriteLabels()) return data;

    data.jsonTEMPLATES.ArTextRu = Object.assign(data.jsonTEMPLATES.ArText, {
      gfx: 'media/entity/objects/dungeon-ar-special.ru_RU.png',
      gfxBaseX: 0,
      gfxBaseY: 0,
    });

    Object.assign(data.entries.textWait, {
      jsonINSTANCE: 'ArTextRu',
      srcX: 0,
      srcY: 16,
      width: 96,
    });
    Object.assign(data.entries.textLea, {
      jsonINSTANCE: 'ArTextRu',
      srcX: 0,
      srcY: 32,
      width: 144,
    });
    return data;
  },

  'data/scale-props/trading-ar.json': data => {
    if (!sc.ru.shouldPatchSpriteLabels()) return data;

    data.jsonTEMPLATES.ArTextRu = Object.assign(data.jsonTEMPLATES.ArText, {
      gfx: 'media/map/trading-autumn.ru_RU.png',
      gfxBaseX: 0,
      gfxBaseY: 0,
    });

    Object.assign(data.entries.textCups, {
      jsonINSTANCE: 'ArTextRu',
      srcX: 8,
      srcY: 0,
      width: 45,
    });
    Object.assign(data.entries.textInfo, {
      jsonINSTANCE: 'ArTextRu',
      srcX: 8,
      srcY: 12,
      width: 39,
    });

    return data;
  },

  'data/scale-props/rhombus-sqr.json': data => {
    if (!sc.ru.shouldPatchSpriteLabels()) return data;

    function patchProp(prop, { srcX, srcY, width }) {
      Object.assign(prop, {
        gfx: 'media/map/rhombus-sign.ru_RU.png',
        gfxBaseX: 0,
        gfxBaseY: 0,
      });
      Object.assign(prop.patterns, { x: srcX, y: srcY, w: width });
    }

    patchProp(data.entries.wallARweapon, {
      srcX: 63,
      srcY: 0,
      width: 64,
    });
    patchProp(data.entries.wallARcrosscentral, {
      srcX: 47,
      srcY: 16,
      width: 80,
    });
    patchProp(data.entries.wallARitem, {
      srcX: 71,
      srcY: 32,
      width: 56,
    });
    patchProp(data.entries.wallARbooster, {
      srcX: 71,
      srcY: 48,
      width: 56,
    });
    patchProp(data.entries.wallARarena, {
      srcX: 15,
      srcY: 32,
      width: 56,
    });
    patchProp(data.entries.wallARcurios, {
      srcX: 13,
      srcY: 48,
      width: 50,
    });
    patchProp(data.entries.wallARclosed, {
      srcX: 7,
      srcY: 0,
      width: 48,
    });

    return data;
  },

  'data/props/rhombus-area-text.json': data => {
    if (!sc.ru.shouldPatchSpriteLabels()) return data;

    for (let prop of data.props) {
      switch (prop.name) {
        case 'titleItem':
        case 'titleScore':
        case 'contentItem':
        case 'contentScore':
          prop.fix.gfx = 'media/entity/objects/rhombus-arena-text.ru_RU.png';
      }
    }
    return data;
  },
};

// ha ha... ha ha ha ha ha! I don't know who designed such "genius" system,
// but it looks like during the postload phase an instance of
// SimplifyResources is available through the simplifyResources global, BUT
// WHEN main PHASE IS EXECUTED, the `Simplify` instance assigns that instance
// of SimplifyResources to itself and sets simplifyResources to `undefined`.
// Ah, genius API design of simplify...
simplifyResources.registerHandler(
  // callback
  // See https://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings
  // for explanation of what `settings` is. `url` is the requested URL without
  // the `IG_ROOT` prefix.
  (settings, url) => {
    let patchFunction = JSON_PATCHES[url];
    if (patchFunction == null) return;

    let oldSuccess = settings.success;
    let oldError = settings.error;
    settings.success = function(json, state, xhr) {
      new Promise(resolve =>
        resolve(
          // if `patchFunction` returns a promise here `resolve` will wait for
          // it to resolve and then continue execution of the overall promise
          patchFunction(json),
        ),
      ).then(
        // not sure what to do with state if it is `notmodified` or `nocontent`...
        patchedJson => {
          oldSuccess.call(this, patchedJson, state, xhr);
        },
        error => {
          // well, since CrossCode doesn't care about actual errors returned
          // by $.ajax, I have to log this one myself.
          console.error(`Could not load patch for ${url}: ${error}`);
          oldError.call(this, xhr, 'error', error);
        },
      );
    };
  },
  // filter
  // I set it to an empty string here so that it is treated as a falsy value
  // in simplify (see https://github.com/CCDirectLink/CCLoader/blob/6d3641bfa780bd477ec0512f019128b2f8206429/assets/mods/simplify/postloadModule.js#L269)
  // and my handler gets to see all requests. This probably should've been
  // a regex, but... whatever.
  '',
  // beforeCall
  // I set it to false so that my patch runs after all others because it is
  // the most important one >:) (see https://github.com/CCDirectLink/CCLoader/blob/6d3641bfa780bd477ec0512f019128b2f8206429/assets/mods/simplify/postloadModule.js#L237-L255)
  // Seriously, I MUST set `beforeCall` to something, otherwise because of a
  // weird comparison in `simplifyResources._callHandlers` my callback never
  // gets called.
  false,
);
