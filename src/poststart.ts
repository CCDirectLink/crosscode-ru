// You might be tempted to ask: "Why do you care about saving the value of this
// option?" Yes, it's description does say that it needs a restart, and I expect
// most users to hit that checkbox only once (after installing the mod), but you
// are forgetting one important fact: my software doesn't have any bugs! You see,
// if a user loads some patched sprites, then toggles this setting and loads
// other patched sprites - in the end they'll have both localized and not
// localized sprites in the same game instance! And, since this IS TEHCNICALLY
// a bug, I'll fix it as well.
let localizeSpritesOptionValue: boolean = sc.options.get(
  'crosscode-ru.localized-labels-on-sprites',
);
sc.ru.shouldPatchSpriteLabels = (notOptional) => {
  return ig.currentLang === 'ru_RU' && (notOptional || localizeSpritesOptionValue);
};

sc.Model.addObserver(sc.options, {
  modelChanged: (_model, message, _data) => {
    if (message !== sc.OPTIONS_EVENT.OPTION_CHANGED) return;
    // save this option in localStorage because it is used in
    // `locale.js` way before `sc.options` is even initialized
    localStorage.setItem(
      'options.crosscode-ru.lea-spelling',
      String(sc.options.get('crosscode-ru.lea-spelling')),
    );
  },
});
