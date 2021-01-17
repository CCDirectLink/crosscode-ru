ig.module('crosscode-ru.fixes.map-menu.teleport-to-prepositions')
  .requires('game.feature.menu.gui.map.map-area', 'localize-me.final-locale.ready')
  .defines(() => {
    if (ig.currentLang !== 'ru_RU') return;

    // see Wikipedia if you have no idea about what linguistics are going on
    // https://en.wikipedia.org/wiki/Grammatical_case
    // https://en.wikipedia.org/wiki/Inflection

    // I changed some of the map names here because "Teleport in Cargo Hold"
    // sounds way better than "Teleport to Teleporter"
    // TODO: add this to Nota
    const CORRECT_MAP_NAMES_WITH_PREPOSITIONS: Map<string, string> = new Map([
      ['arid.town-2', 'в Западный город'],
      ['autumn.path4', 'к Озеру у обелиска'],
      ['autumn.path-8', 'к Северному выходу'],
      ['autumn.entrance', 'ко Входу'],
      ['autumn.lake-observatory', 'к Старой обсерватории'],
      ['autumn.guild.entrance', 'в Резиденции Осени'],
      ['autumn-fall.path-01', 'к Южному выходу'],
      ['autumn-fall.path-05', 'к Северному выходу'],
      ['autumn-fall.path-07', 'в Руины деревни'],
      ['autumn-fall.raid.raid-01', 'на Райский остров'],
      ['autumn-fall.path-03', 'к Восточному выходу'],
      ['bergen.bergen', 'на Юг Бергена'],
      ['bergen.bergen2', 'на Север Бергена'],
      ['bergen-trail.path-1-entrance', 'ко Входу'],
      ['bergen-trail.path-8', 'на Восходящий путь 5'],
      ['bergen-trail.path-5', 'к Шипастым высотам'],
      ['cargo-ship.teleporter', 'в Грузовой отсек'],
      ['forest.path-01-entrance', 'к Западному выходу'],
      ['forest.path-04-hostel', 'к Пещерному трактиру'],
      ['forest.path-08', 'на Резную тропу'],
      ['forest.path-10', 'к Старому додзё'],
      ['forest.path-12', 'в Храм вознесения'],
      ['heat.path-01-entrance', 'к Восточному входу'],
      ['heat.oasis.oasis-path-02', 'в Бордовый оазис'],
      ['heat.path-07', 'на Эстакаду'],
      ['heat.path-10', 'к Великому шраму'],
      ['heat.path-11', 'к Западному входу'],
      ['heat.dng-exterior', "на Балкон Фай'ро"],
      ['heat-village.baki-2', 'на Площадь'],
      ['jungle.path-01-entrance', 'ко Входу в Джунгли'],
      ['jungle.grove.grove-path-02', 'в Королевскую рощу'],
      ['jungle.clearing.clear-path-02', 'в Восточный Вирда Виль'],
      ['jungle.path-04-end', 'к Хризолитовому подходу'],
      ['jungle.infested.infested-path-03', 'на Южное заражённое болото'],
      ['jungle.dng.dng-crossing', 'к Обряду посвящения'],
      ['jungle-city.center', 'в Центрум'],
      ['rhombus-sqr.central-inner', 'в CrossCentral'],
      ['rhombus-sqr.center-s', 'к Южной арке'],
      ['rhombus-sqr.shops-1', 'в Торговый квартал'],
      ['rhombus-sqr.central', 'на Балкон CrossCentral'],
      ['rookie-harbor.center', 'на Рыночную площадь'],
      ['rookie-harbor.teleporter', 'к Арке новобранцев'],
    ]);

    sc.MapAreaContainer.inject({
      onLandmarkPressed(landmark) {
        let show = sc.Dialogs.showYesNoDialog;
        try {
          sc.Dialogs.showYesNoDialog = function (text, ...args): void {
            sc.Dialogs.showYesNoDialog = show;

            let mapName = CORRECT_MAP_NAMES_WITH_PREPOSITIONS.get(landmark.map.path);
            if (mapName != null) text = `Телепортироваться ${mapName}?`;
            return show.call(this, text, ...args);
          };

          this.parent(landmark);
        } finally {
          sc.Dialogs.showYesNoDialog = show;
        }
      },
    });
  });
