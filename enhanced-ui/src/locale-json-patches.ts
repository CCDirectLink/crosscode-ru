/* eslint-disable @typescript-eslint/no-explicit-any */

function hasKey(obj: unknown, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export default function registerLocalePatches(localePatches: sc.ui2.LocaleJsonPatchesLib): void {
  localePatches.patchFile('data/maps/bergen/bergen.json', (data: any): any => {
    let entity = data.entities.find(
      (ent: any) => ent.type === 'NPC' && ent.settings.name === 'holiday-man',
    );
    patchSantamaRecursively(entity.settings.npcStates);

    function patchSantamaRecursively(value: any): void {
      if (value == null || typeof value !== 'object') return;

      if (
        hasKey(value, 'type') &&
        value.type === 'ADD_MSG_PERSON' &&
        hasKey(value, 'name') &&
        value.name === 'Holiday Man'
      ) {
        value.name = { en_US: value.name };
        return;
      }

      for (let key in value) {
        if (hasKey(value, key)) {
          patchSantamaRecursively(value[key]);
        }
      }
    }
  });
}
