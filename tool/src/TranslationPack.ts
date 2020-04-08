import * as Nota from './Notabenoid';

import path from './node-builtin-modules/path.js';
import * as fsUtils from './utils/fs.js';

type LocalizeMePack = Record<string, { orig: string; text: string }>;

const INJECTED_IN_MOD_TAG = 'INJECTED_IN_MOD';

export class LocalizeMePacker {
  packs: Map<string, LocalizeMePack> = new Map();
  private assetsCache: Map<string, unknown> = new Map();

  async addNotaFragments(fragments: Nota.Fragment[]): Promise<void> {
    for (let f of fragments) {
      if (f.translations.length === 0) continue;
      let { file, jsonPath, text: originalText } = f.original;

      // eslint-disable-next-line no-await-in-loop
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
        obj = (obj as Record<string, unknown>)[currentKey];
        currentKey = '';
      }
    }
    if (currentKey.length > 0) {
      if (jsonPath.length > 0) jsonPath += '/';
      jsonPath += currentKey;
    }

    if (!nota.descriptionText.includes(INJECTED_IN_MOD_TAG)) {
      let realOriginalText: string;
      if (file.endsWith('.en_US.json')) {
        if (typeof obj !== 'string') return null;
        realOriginalText = obj;
      } else {
        if (typeof obj !== 'object' || obj == null) return null;
        let obj2 = obj as { en_US?: unknown };
        if (typeof obj2.en_US !== 'string') return null;
        realOriginalText = obj2.en_US;
      }
      if (text === realOriginalText.trimRight()) text = realOriginalText;

      if (text !== realOriginalText) {
        console.warn(`${file} ${jsonPath}: stale translation`);
      }
    }

    return { file, jsonPath, text };
  }

  private async getAsset(file: string): Promise<unknown> {
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
