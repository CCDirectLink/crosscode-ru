export default class implements modloader.Mod.MainClass {
  public postload(mod: modloader.Mod): void {
    if (sc.ru == null) sc.ru = {} as typeof sc.ru;
    sc.ru.version = mod.version.toString();
  }
}
