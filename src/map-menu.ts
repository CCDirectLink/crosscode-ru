ig.module('crosscode-ru.fixes.map-menu.teleport-to-prepositions')
  .requires('game.feature.menu.gui.map.map-area', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    // see Wikipedia if you have no idea about what linguistics are going on
    // https://en.wikipedia.org/wiki/Grammatical_case
    // https://en.wikipedia.org/wiki/Inflection

    sc.LandmarkGui.inject({
      teleportQuestion: '',
      init(key, landmark, floor, map, area) {
        this.parent(key, landmark, floor, map, area);
        let { teleportQuestion } = sc.map.getLandmark(key, area);
        if (teleportQuestion != null) {
          this.teleportQuestion = ig.LangLabel.getText(teleportQuestion, /* allowEmpty */ true);
        }
      },
    });

    sc.MapAreaContainer.inject({
      onLandmarkPressed(landmark) {
        let show = sc.Dialogs.showYesNoDialog;
        try {
          sc.Dialogs.showYesNoDialog = function (text, ...args): void {
            sc.Dialogs.showYesNoDialog = show;

            if (landmark.teleportQuestion.length > 0) text = landmark.teleportQuestion;
            return show.call(this, text, ...args);
          };

          this.parent(landmark);
        } finally {
          sc.Dialogs.showYesNoDialog = show;
        }
      },
    });
  });
