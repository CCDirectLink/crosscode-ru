/* global simplify, simplifyResources */

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
