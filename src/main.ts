export default class {
  public postload(mod: Mod): void {
    if (sc.ru == null) sc.ru = {} as typeof sc.ru;
    sc.ru.version = mod.version.toString();
  }
}
