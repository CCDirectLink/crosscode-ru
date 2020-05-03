declare namespace sc.ui2 {
  let areaAndMapNamesLookupTable: Map<
    number,
    {
      name: ig.LangLabel.Data;
      maps: Map<number, { name: ig.LangLabel.Data }>;
    }
  >;
}

declare namespace ig {
  interface Storage {
    _fixAreaAndMapNames(this: this, slot: ig.SaveSlot): void;
  }
}

declare namespace sc {
  interface MapModel {
    skipCurrentPlayerFloorValidation: boolean;
  }
}
