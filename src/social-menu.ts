ig.module('crosscode-ru.fixes.social-menu')
  .requires('ultimate-localized-ui.fixes.social-menu', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.SocialEntryButton.prototype.UI2_DRAW_STATUS_AS_TEXT_BLOCK = true;
  });
