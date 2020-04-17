ig.module('crosscode-ru.fixes.storage-area-and-map-names')
  .requires(
    'impact.feature.database.database',
    'game.feature.menu.area-loadable',
    'impact.base.system',
    'impact.feature.storage.storage',
  )
  .defines(() => {
    ig.Database.inject({
      onload(data) {
        sc.ru.areaAndMapNamesLookupTable = new Map();

        Promise.all(
          Object.entries(data.areas)
            .filter(([id, _area]) => id !== 'testing-grounds')
            .map(async ([id, { name: areaName }]) => {
              // Note that even though this is an async function,
              // `sc.AreaLoadable` is still created in the synchronous context
              // (because there are no prior async operations), so the execution
              // in this event loop tick hasn't reached the end of the overall
              // `onload` method yet. By the time `this.parent` is reached all
              // of these loadables will be registered with `ig.addResource` and
              // `ig.resources` won't be empty even though `ig.database` is
              // usually finishes loading the last.
              let areaLoadable = new sc.AreaLoadable(id);
              await sc.ru.waitForLoadable(areaLoadable);
              addAreaToLookupTable(areaName, areaLoadable.data);
              // I'm not decreasing the refcount of `areaLoadable` because this
              // data is downloaded unconditionally at the start of the game and
              // I don't want to waste this time and bandwidth
            }),
        ).catch(err => {
          ig.system.error(err);
        });

        this.parent(data);
      },
    });

    function addAreaToLookupTable(
      areaName: ig.LangLabel.Data,
      areaData: sc.AreaLoadable.Data,
    ): void {
      if (areaName.langUid == null) {
        throw new Error(`missing langUid of area ${areaName.en_US}`);
      }
      if (sc.ru.areaAndMapNamesLookupTable.has(areaName.langUid)) {
        throw new Error(`duplicate area langUid ${areaName.langUid}`);
      }

      let areaMaps = new Map<number, { name: ig.LangLabel.Data }>();
      for (let floor of areaData.floors) {
        for (let map of floor.maps) {
          if (map.name.langUid == null) {
            throw new Error(
              `missing langUid of map ${map.name.langUid} in area ${areaName.en_US}`,
            );
          }
          if (areaMaps.has(map.name.langUid)) {
            throw new Error(
              `duplicate langUid of map ${map.name.langUid} in area ${areaName.langUid}`,
            );
          }

          areaMaps.set(map.name.langUid, { name: map.name });
        }
      }

      sc.ru.areaAndMapNamesLookupTable.set(areaName.langUid, {
        name: areaName,
        maps: areaMaps,
      });
    }

    ig.Storage.inject({
      init(...args) {
        this.parent(...args);
        for (let slot of this.slots) this._fixAreaAndMapNames(slot.data);
        if (this.autoSlot != null) this._fixAreaAndMapNames(this.autoSlot.data);
      },

      _fixAreaAndMapNames(slot) {
        // NOTE 1: in this function I make an assumption that `en_US` is always
        // the same in both original files and save files
        // NOTE 2: `slot.floor`, as well as the floor names, appear to be
        // unused, so I'm not patching it. If someone finds where floor names
        // are shown in the GUI - please tell me.

        let { tradersFound, quests } = slot;
        fixAreaAndMapLangLabel(slot, 'area', 'specialMap');

        for (let traderFound of Object.values(tradersFound)) {
          fixAreaAndMapLangLabel(traderFound, 'area', 'map');
        }

        for (let quest of Object.values(quests.locale)) {
          fixAreaAndMapLangLabel(quest.location, 'area', 'map');
        }
      },
    });

    function fixAreaAndMapLangLabel<
      K1 extends PropertyKey,
      K2 extends PropertyKey
    >(
      obj: { [key in K1 | K2]: ig.LangLabel.Data },
      areaKey: K1,
      mapKey: K2,
    ): void {
      let areaLabel = obj[areaKey];
      if (areaLabel.langUid == null) return;
      let areaLookupData = sc.ru.areaAndMapNamesLookupTable.get(
        areaLabel.langUid,
      );
      if (areaLookupData == null) return;
      let {
        name: expectedAreaName,
        maps: mapNamesLookupTable,
      } = areaLookupData;
      if (expectedAreaName.en_US === areaLabel.en_US) {
        obj[areaKey] = expectedAreaName;
      }

      let mapLabel = obj[mapKey];
      if (mapLabel.langUid == null) return;
      let mapLookupData = mapNamesLookupTable.get(mapLabel.langUid);
      if (mapLookupData == null) return;
      let { name: expectedMapName } = mapLookupData;
      if (expectedMapName.en_US === mapLabel.en_US) {
        obj[mapKey] = expectedMapName;
      }
    }
  });
