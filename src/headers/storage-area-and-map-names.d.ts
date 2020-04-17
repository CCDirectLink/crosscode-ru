declare namespace sc.ru {
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
    _fixAreaAndMapNames(this: this, slot: ig.SaveSlot.Data): void;
  }
}
