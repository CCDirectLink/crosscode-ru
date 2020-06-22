ig.module('enhanced-ui.fixes.storage-area-and-map-names')
  .requires(
    'impact.feature.database.database',
    'game.feature.menu.area-loadable',
    'impact.base.system',
    'impact.feature.storage.storage',
  )
  .defines(() => {
    ig.Database.inject({
      areaLoadables: null,

      onload(data, ...args) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.areaLoadables = new Map();
        for (let id of Object.keys(data.areas)) {
          if (id === 'testing-grounds') continue;
          // I won't be decreasing the refcount of `areaLoadable` because this
          // data is downloaded unconditionally at the start of the game and I
          // don't want to waste this time and bandwidth
          this.areaLoadables.set(id, new sc.AreaLoadable(id));
        }

        this.parent(data, ...args);
      },
    });

    ig.Storage.inject({
      init(...args) {
        this.parent(...args);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._areaAndMapNamesLookupTable = new Map();
        let areas = ig.database.get('areas');
        for (let [id, loadable] of ig.database.areaLoadables) {
          this._addAreaToLookupTable(areas[id].name, loadable.data);
        }

        for (let slot of this.slots) this._fixAreaAndMapNames(slot);
        if (this.autoSlot != null) this._fixAreaAndMapNames(this.autoSlot);
      },

      _addAreaToLookupTable(
        areaName: ig.LangLabel.Data,
        areaData: sc.AreaLoadable.Data,
      ): void {
        if (areaName.langUid == null) {
          throw new Error(`missing langUid of area ${areaName.en_US}`);
        }
        if (this._areaAndMapNamesLookupTable.has(areaName.langUid)) {
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

        this._areaAndMapNamesLookupTable.set(areaName.langUid, {
          name: areaName,
          maps: areaMaps,
        });
      },

      _fixAreaAndMapNames(slot) {
        // NOTE 1: in this function I make an assumption that `en_US` is always
        // the same in both original files and save files
        // NOTE 2: `slot.floor`, as well as the floor names, appear to be
        // unused, so I'm not patching it. If someone finds where floor names
        // are shown in the GUI - please tell me.

        let { tradersFound, quests } = slot.data;
        this._fixAreaAndMapLangLabel(slot.data, 'area', 'specialMap');

        for (let traderFound of Object.values(tradersFound)) {
          this._fixAreaAndMapLangLabel(traderFound, 'area', 'map');
        }

        for (let quest of Object.values(quests.locale)) {
          this._fixAreaAndMapLangLabel(quest.location, 'area', 'map');
        }

        // if a rebuild of the encrypted data is needed, uncomment this:
        // slot.mergeData({});
      },

      // so it looks like whenever "this codebase" and "generic functions" meet,
      // generic parameters break automatic type inference and I have to specify
      // all of the types manually. Moreover, here I need to define `this` as
      // well because as soon as I introduce generic parameters in this exact
      // spot `this` inference breaks as well.
      _fixAreaAndMapLangLabel<K1 extends PropertyKey, K2 extends PropertyKey>(
        this: ImpactClassMethodThis<
          '_fixAreaAndMapLangLabel',
          typeof ig['Storage'],
          typeof ig['Storage']['prototype'],
          typeof ig['Storage']['prototype']
        >,
        obj: { [key in K1 | K2]: ig.LangLabel.Data },
        areaKey: K1,
        mapKey: K2,
      ): void {
        let areaLabel = obj[areaKey];
        if (
          areaLabel == null ||
          typeof areaLabel !== 'object' ||
          areaLabel.langUid == null
        ) {
          return;
        }

        let areaLookupData = this._areaAndMapNamesLookupTable.get(
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
        if (
          mapLabel == null ||
          typeof mapLabel !== 'object' ||
          mapLabel.langUid == null
        ) {
          return;
        }

        let mapLookupData = mapNamesLookupTable.get(mapLabel.langUid);
        if (mapLookupData == null) return;
        let { name: expectedMapName } = mapLookupData;
        if (expectedMapName.en_US === mapLabel.en_US) {
          obj[mapKey] = expectedMapName;
        }
      },
    });
  });

// HACK: This code is required to allow loading of some maps whose floors
// contain `zMin` and `zMax` properties. Let me to explain why this is needed.
// Note that this bug happens when said maps are loaded when the cache is cold,
// that is, right after starting the game. You see, `sc.MapModel#onLevelLoadStart`
// instantiates an `sc.AreaLoadable` and attaches itself as the load listener to
// it via `ig.Loadable#addLoadListener`. The `sc.MapModel#onLoadableComplte`
// method contains a call to `sc.MapModel#validateCurrentPlayerFloor` which
// internally uses `ig.game.playerEntity`. This is the root of all evils in this
// case. Due to the fact that I preload all areas at the game loading time, the
// instantiated `sc.AreaLoadable` will be marked as loaded and its
// `addLoadListener` will immediately/synchronously invoke
// `sc.MapModel#validateCurrentPlayerFloor`. Unfortunately, `ig.Game#playerEntity`
// is still `null` at this point: at the first map load it will be created a bit
// later in the `ig.Game#loadLevel` function, which calls `ig.GameAddon#onLevelLoadStart`
// and only after it `ig.Game#createPlayer`. Hence, since the relevant code was
// written under assumption that the cache of `sc.AreaLoadable` is cold and the
// `sc.AreaLoadable` will be loaded and `sc.MapModel#onLoadableComplte` will be
// executed in another event loop tick, alignment of all of these stars causes
// crash on some specific areas (e.g. Sapphire Ridge). I fixed this bug by
// deferring current player floor validation after `ig.Game#createPlayer` in
// case `ig.Game#playerEntity` is `null`. Theoretically validation could be
// moved into `ig.GameAddon#onLevelLoaded`, but I wanted to make this process
// as seamless as possible due to the fact that `ig.GameAddon#onLevelLoaded` is
// executed after literally all of the map loading code.
ig.module('enhanced-ui.fixes.storage-area-and-map-names.map-model-fix')
  .requires('game.feature.menu.map-model')
  .defines(() => {
    sc.MapModel.inject({
      skipCurrentPlayerFloorValidation: false,

      onLevelLoadStart(...args) {
        try {
          this.skipCurrentPlayerFloorValidation = ig.game.playerEntity == null;
          return this.parent(...args);
        } finally {
          this.skipCurrentPlayerFloorValidation = false;
        }
      },

      validateCurrentPlayerFloor(...args) {
        if (!this.skipCurrentPlayerFloorValidation) this.parent(...args);
      },
    });

    sc.CrossCode.inject({
      createPlayer(...args) {
        let shouldValidateCurrentPlayerFloor = this.playerEntity == null;
        this.parent(...args);
        if (shouldValidateCurrentPlayerFloor) {
          sc.map.validateCurrentPlayerFloor();
        }
      },
    });
  });
