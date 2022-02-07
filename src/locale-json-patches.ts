/* eslint-disable @typescript-eslint/no-explicit-any */

export default function registerLocalePatches(localePatches: sc.ui2.LocaleJsonPatchesLib): void {
  localePatches.patchFile('data/lang/sc/gui.en_US.json', (data: any): any => {
    data = localePatches.mergeObjects(data, {
      labels: {
        options: {
          'crosscode-ru': {
            'localized-labels-on-sprites': {
              name: 'Localized labels on sprites',
              description:
                'Enables translated labels on sprites such as signs in the game world. \\c[1]Needs a restart!',
            },
          },
        },
        'misc-time-var': {
          '12-00': "It's High Noon",
        },
      },
    });
    if (localePatches.isRuntime) {
      data = localePatches.mergeObjects(data, {
        labels: {
          options: {
            'crosscode-ru': {
              // This option is untranslated because it doesn't make sense in
              // other locales, plus I can trick Localize Me into not running
              // `text_filter` (which corrects spelling of "Lea" literally
              // everywhere) on these string by patching them directly in the
              // original files.
              'lea-spelling': {
                name: 'Перевод имени "Lea"',
                description:
                  '\\c[3]Лея\\c[0]: Более естественно звучащий вариант. \\c[3]Лиа\\c[0]: Сохраняет каноническое произношение. \\c[1]Требуется перезапуск!',
                group: ['Лея', 'Лиа'],
              },
            },
          },
        },
      });
    }
    return data;
  });

  localePatches.patchFile('data/database.json', (data: any): any => {
    if (localePatches.getCurrentLang() !== 'ru_RU') return;

    for (let area of Object.values<any>(data.areas)) {
      let { landmarks } = area;
      if (landmarks == null) continue;
      for (let landmark of Object.values<any>(landmarks)) {
        if (landmark.teleportQuestion == null && landmark.name != null) {
          let str = `Teleport to ${localePatches.getLangLabelText(landmark.name, 'en_US')}?`;
          landmark.teleportQuestion = { en_US: str };
        }
      }
    }
  });
}
