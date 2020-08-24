export default class implements modloader.Mod.MainClass {
  public constructor() {
    if (
      modloader.loadedMods.has('CCLoader display version') ||
      modloader.loadedMods.has('Simplify')
    ) {
      alert(
        'У Вас установлен Simplify и/или ccloader-version-display из состава CCLoader 2, но с ру-модом теперь расспространяется CCLoader 3. Это вызовет краш при запуске игры. Вы прочитали заметку об обновлении на странице релиза? https://github.com/dmitmel/crosscode-ru/releases/tag/v1.1.0',
      );
    }
  }

  public postload(mod: modloader.Mod): void {
    if (sc.ru == null) sc.ru = {} as typeof sc.ru;
    sc.ru.version = mod.version!.toString();
  }
}
