import * as Nota from './Notabenoid';

type LocalizeMePack = Record<string, { orig: string; text: string }>;

export class LocalizeMePacker {
  packs: Map<string, LocalizeMePack> = new Map();

  addNotaFragments(fragments: Nota.Fragment[]): void {
    fragments.forEach(f => {
      if (f.translations.length === 0) return;
      let { file, jsonPath } = f.original;
      if (!file.startsWith('data/')) return;
      file = `${file.slice('data/'.length)}.json`;
      jsonPath = jsonPath.replace(/\./g, '/');

      if (file === 'LANG.json') {
        for (let feature of ['gimmick', 'gui', 'map-content']) {
          let prefix = `sc/${feature}/`;
          if (jsonPath.startsWith(prefix)) {
            file = `lang/sc/${feature}.en_US.json`;
            jsonPath = jsonPath.slice(prefix.length);
            break;
          }
        }
      }

      let pack: LocalizeMePack;
      if (this.packs.has(file)) {
        pack = this.packs.get(file)!;
      } else {
        pack = {};
        this.packs.set(file, pack);
      }
      pack[`${file}/${jsonPath}`] = {
        orig: f.original.text,
        text: f.translations[0].text,
      };
    });
  }
}
