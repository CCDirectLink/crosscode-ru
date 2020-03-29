ig.module('crosscode-ru.fixes.pvp')
  .requires(
    'game.feature.combat.gui.pvp-gui',
    'crosscode-ru.utils.localization',
  )
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    sc.PvpRoundGui.inject({
      init(...args) {
        this.parent(...args);
        let textGui = this.hook.children[0].gui;
        textGui.setText(
          sc.ru.localize(textGui.text, { orig: 'Round', text: 'Раунд' }),
        );
      },
    });
  });
