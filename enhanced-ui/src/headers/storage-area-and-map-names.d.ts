declare namespace ig {
  interface Database {
    areaLoadables: Map<string, sc.AreaLoadable>;
  }

  interface Storage {
    _areaAndMapNamesLookupTable: Map<
      number,
      {
        name: ig.LangLabel.Data;
        maps: Map<number, { name: ig.LangLabel.Data }>;
      }
    >;

    _addAreaToLookupTable(
      this: this,
      areaName: ig.LangLabel.Data,
      areaData: sc.AreaLoadable.Data,
    ): void;
    _fixAreaAndMapNames(this: this, slot: ig.SaveSlot): void;
    _fixAreaAndMapLangLabel<K1 extends PropertyKey, K2 extends PropertyKey>(
      this: this,
      obj: { [key in K1 | K2]: ig.LangLabel.Data },
      areaKey: K1,
      mapKey: K2,
    ): void;
  }
}

declare namespace sc {
  interface MapModel {
    skipCurrentPlayerFloorValidation: boolean;
  }
}
