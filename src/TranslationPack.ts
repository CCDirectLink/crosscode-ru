import * as Nota from './Notabenoid';

import path from './node-builtin-modules/path.js';
import * as fsUtils from './utils/fs.js';

type LocalizeMePack = Record<string, { orig: string; text: string }>;

export class LocalizeMePacker {
  packs: Map<string, LocalizeMePack> = new Map();
  private assetsCache: Map<string, any> = new Map();

  async addNotaFragments(fragments: Nota.Fragment[]): Promise<void> {
    for (let f of fragments) {
      if (f.translations.length === 0) continue;
      let { file, jsonPath, text: originalText } = f.original;

      let fixedOriginal = await this.fixNotaOriginal(f.original);
      if (fixedOriginal == null) continue;
      ({ file, jsonPath, text: originalText } = fixedOriginal);

      let pack: LocalizeMePack;
      if (this.packs.has(file)) {
        pack = this.packs.get(file)!;
      } else {
        pack = {};
        this.packs.set(file, pack);
      }
      pack[`${file}/${jsonPath}`] = {
        orig: originalText,
        text: f.translations[0].text,
      };
    }
  }

  private async fixNotaOriginal(
    nota: Nota.Original,
  ): Promise<{ file: string; jsonPath: string; text: string } | null> {
    let { file, jsonPath, text } = nota;

    if (!file.startsWith('data/')) return null;
    file = `${file.slice('data/'.length)}.json`;

    if (file === 'LANG.json') {
      for (let feature of ['gimmick', 'gui', 'map-content']) {
        let prefix = `sc.${feature}.`;
        if (jsonPath.startsWith(prefix)) {
          file = `lang/sc/${feature}.en_US.json`;
          jsonPath = jsonPath.slice(prefix.length);
          break;
        }
      }
    }

    let obj = await this.getAsset(file);

    let jsonPathComponents = jsonPath.split('.');
    jsonPath = '';
    let currentKey = '';
    for (let key of jsonPathComponents) {
      if (currentKey.length > 0) currentKey += '.';
      currentKey += key;
      if (Object.prototype.hasOwnProperty.call(obj, currentKey)) {
        if (jsonPath.length > 0) jsonPath += '/';
        jsonPath += currentKey;
        obj = obj[currentKey];
        currentKey = '';
      }
    }

    let realOriginalText;
    if (file.endsWith('.en_US.json')) {
      if (typeof obj !== 'string') return null;
      realOriginalText = obj;
    } else {
      if (typeof obj !== 'object' || typeof obj.en_US !== 'string') return null;
      realOriginalText = obj.en_US;
    }
    if (text === realOriginalText.trimRight()) text = realOriginalText;

    return { file, jsonPath, text };
  }

  private async getAsset(file: string): Promise<any> {
    if (this.assetsCache.has(file)) {
      return this.assetsCache.get(file);
    } else {
      let data = await fsUtils.readJsonFile(
        path.join('assets', 'data', file),
        'utf8',
      );
      this.assetsCache.set(file, data);
      return data;
    }
  }
}
