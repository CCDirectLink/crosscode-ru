/* global simplify, simplifyResources */

function createArTextProp(rest) {
  return {
    scalableX: true,
    scalableY: false,
    wallY: 0,
    renderMode: 'lighter',
    collType: 'NONE',
    effects: {
      sheet: 'ar',
      show: 'show',
      hide: 'hide',
    },
    ...rest,
  };
}

// my answer to CC's JSON templates
function createRussianDungeonArText({ gfx, srcX, srcY, width, reverse }) {
  // well, I haven't implemented deepCopy yet, so... TODO I guess?
  return createArTextProp({
    baseSize: {
      x: 16,
      y: 8,
      z: 8,
    },
    scalableStep: 16,
    gfx,
    gfxBaseX: 0,
    gfxBaseY: 0,
    patterns: {
      x: srcX,
      y: srcY,
      w: width,
      h: 16,
      xCount: 1,
      yCount: 1,
    },
    gfxEnds: {
      west: {
        STOP: {
          x: 0,
          y: 0,
          w: 8,
          h: 16,
          xCount: 6,
          animFrames: reverse ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0],
          flipX: true,
        },
      },
      east: {
        STOP: {
          x: 0,
          y: 0,
          w: 8,
          h: 16,
          xCount: 6,
          animFrames: reverse ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5],
        },
      },
    },
    animTime: 0.05,
    timePadding: {
      x: (reverse ? 1 : -1) * 24,
      y: 0,
    },
  });
}

const PATCHES = {
  // sorry, Felix... not many people watch credits until the end, so I'll have
  // to inject our names in the first data file. hope RFG doesn't mind :P
  'data/credits/radicalfish-core.json': async data => {
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
    data.entries.textWelcome = createRussianDungeonArText({
      gfx: 'media/entity/objects/dungeon-ar.ru_RU.png',
      srcX: 0,
      srcY: 16,
      width: 128,
      reverse: false,
    });
    data.entries.textComplete = createRussianDungeonArText({
      gfx: 'media/entity/objects/dungeon-ar.ru_RU.png',
      srcX: 0,
      srcY: 32,
      width: 128,
      reverse: false,
    });
    return data;
  },

  'data/scale-props/dungeon-ar-special.json': data => {
    data.entries.textWait = createRussianDungeonArText({
      gfx: 'media/entity/objects/dungeon-ar-special.ru_RU.png',
      srcX: 0,
      srcY: 16,
      width: 96,
      reverse: true,
    });
    data.entries.textLea = createRussianDungeonArText({
      gfx: 'media/entity/objects/dungeon-ar-special.ru_RU.png',
      srcX: 0,
      srcY: 32,
      width: 144,
      reverse: true,
    });
    return data;
  },

  'data/scale-props/trading-ar.json': data => {
    function createTradingArProp({ srcX, srcY, width }) {
      return createArTextProp({
        baseSize: {
          x: 16,
          y: 8,
          z: 4,
        },
        scalableStep: 4,
        gfx: 'media/map/trading-autumn.ru_RU.png',
        gfxBaseX: 0,
        gfxBaseY: 0,
        patterns: {
          x: srcX,
          y: srcY,
          w: width,
          h: 12,
          xCount: 1,
          yCount: 1,
        },
        gfxEnds: {
          west: {
            SHORT: {
              x: 0,
              y: 0,
              w: 3,
              h: 12,
              xCount: 1,
            },
            LONG: {
              x: 0,
              y: 0,
              w: 3,
              h: 24,
              xCount: 1,
              renderHeight: 4,
            },
          },
          east: {
            SHORT: {
              x: 0,
              y: 0,
              w: 3,
              h: 12,
              xCount: 1,
            },
            LONG: {
              x: 0,
              y: 0,
              w: 3,
              h: 24,
              xCount: 1,
              renderHeight: 4,
            },
          },
        },
        timePadding: {
          x: 12,
          y: 0,
        },
      });
    }

    data.entries.textCups = createTradingArProp({
      srcX: 8,
      srcY: 0,
      width: 45,
    });
    data.entries.textInfo = createTradingArProp({
      srcX: 8,
      srcY: 12,
      width: 39,
    });

    return data;
  },

  'data/scale-props/rhombus-sqr.json': data => {
    function createRhombusSignProp({ srcX, srcY, width }) {
      return {
        baseSize: {
          x: 16,
          y: 16,
          z: 0,
        },
        scalableX: true,
        scalableY: false,
        scalableStep: 4,
        renderMode: 'lighter',
        collType: 'NONE',
        gfx: 'media/map/rhombus-sign.ru_RU.png',
        gfxBaseX: 0,
        gfxBaseY: 0,
        patterns: {
          x: srcX,
          y: srcY,
          w: width,
          h: 16,
          xCount: 1,
          yCount: 1,
        },
        timePadding: {
          x: 16,
          y: 0,
        },
      };
    }

    data.entries.wallARweapon = createRhombusSignProp({
      srcX: 63,
      srcY: 0,
      width: 64,
    });
    data.entries.wallARcrosscentral = createRhombusSignProp({
      srcX: 47,
      srcY: 16,
      width: 80,
    });
    data.entries.wallARitem = createRhombusSignProp({
      srcX: 71,
      srcY: 32,
      width: 56,
    });
    data.entries.wallARbooster = createRhombusSignProp({
      srcX: 71,
      srcY: 48,
      width: 56,
    });
    data.entries.wallARarena = createRhombusSignProp({
      srcX: 15,
      srcY: 32,
      width: 56,
    });
    data.entries.wallARcurios = createRhombusSignProp({
      srcX: 13,
      srcY: 48,
      width: 50,
    });
    data.entries.wallARclosed = createRhombusSignProp({
      srcX: 7,
      srcY: 0,
      width: 48,
    });

    return data;
  },
};

export default function initJsonPatches() {
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
      let patchFunction = PATCHES[url];
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
}
