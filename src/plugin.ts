export default class CrossCodeRuPlugin {
  private version: string;

  public constructor(mod: Mod) {
    this.version = mod.version;
  }

  public postload(): void {
    if (sc.ru == null) sc.ru = {} as typeof sc.ru;
    sc.ru.version = this.version;
  }
}
