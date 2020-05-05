export default class CrossCodeRuPlugin {
  private version: string;

  constructor(mod: Mod) {
    this.version = mod.version;
  }

  postload(): void {
    if (sc.ru == null) sc.ru = {} as typeof sc.ru;
    sc.ru.version = this.version;
  }
}
