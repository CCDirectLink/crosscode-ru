ig.module('enhanced-ui.fixes.storage-area-and-map-names')
  .requires(
    'impact.feature.database.database',
    'game.feature.menu.area-loadable',
    'impact.base.system',
    'impact.feature.storage.storage',
  )
  .defines(() => {
    ig.Database.inject({
      async onload(data) {
        let onload = this.parent;

        try {
          sc.ui2.areaAndMapNamesLookupTable = new Map();

          let promises = Object.entries(data.areas)
            .filter(([id, _area]) => id !== 'testing-grounds')
            .map(async ([id, { name: areaName }]) => {
              let areaLoadable = new sc.AreaLoadable(id);
              await sc.ui2.waitForLoadable(areaLoadable);
              addAreaToLookupTable(areaName, areaLoadable.data);
              // I'm not decreasing the refcount of `areaLoadable` because this
              // data is downloaded unconditionally at the start of the game and
              // I don't want to waste this time and bandwidth
            });

          // usually at this point there are no more resources to load, so I
          // have to trigger loading forcibly
          sc.ui2.forciblyTriggerResourceLoad();

          await Promise.all(promises);
        } catch (err) {
          ig.system.error(err);
        }

        onload.call(this, data);
      },
    });

    function addAreaToLookupTable(
      areaName: ig.LangLabel.Data,
      areaData: sc.AreaLoadable.Data,
    ): void {
      if (areaName.langUid == null) {
        throw new Error(`missing langUid of area ${areaName.en_US}`);
      }
      if (sc.ui2.areaAndMapNamesLookupTable.has(areaName.langUid)) {
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

      sc.ui2.areaAndMapNamesLookupTable.set(areaName.langUid, {
        name: areaName,
        maps: areaMaps,
      });
    }

    ig.Storage.inject({
      init(...args) {
        this.parent(...args);
        for (let slot of this.slots) this._fixAreaAndMapNames(slot);
        if (this.autoSlot != null) this._fixAreaAndMapNames(this.autoSlot);
      },

      _fixAreaAndMapNames(slot) {
        // NOTE 1: in this function I make an assumption that `en_US` is always
        // the same in both original files and save files
        // NOTE 2: `slot.floor`, as well as the floor names, appear to be
        // unused, so I'm not patching it. If someone finds where floor names
        // are shown in the GUI - please tell me.

        let { tradersFound, quests } = slot.data;
        fixAreaAndMapLangLabel(slot.data, 'area', 'specialMap');

        for (let traderFound of Object.values(tradersFound)) {
          fixAreaAndMapLangLabel(traderFound, 'area', 'map');
        }

        for (let quest of Object.values(quests.locale)) {
          fixAreaAndMapLangLabel(quest.location, 'area', 'map');
        }

        // if a rebuild of the encrypted data is needed, uncomment this:
        // slot.mergeData({});
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
      let areaLookupData = sc.ui2.areaAndMapNamesLookupTable.get(
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
