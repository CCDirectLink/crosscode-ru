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
    _fixAreaAndMapLangLabel(this: this, obj: unknown, areaKey: string, mapKey: string): void;
  }
}

declare namespace sc {
  interface MapModel {
    skipCurrentPlayerFloorValidation: boolean;
  }
}
