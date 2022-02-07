ig.module('crosscode-ru.fixes.social-menu')
  .requires('ultimate-localized-ui.fixes.social-menu', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.SocialEntryButton.prototype.renderStatusAsTextBlock = true;
  });
