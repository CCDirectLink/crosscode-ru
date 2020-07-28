import { Fragment } from './Notabenoid';

import paths from './node-builtin-modules/path.js';
import * as fsUtils from './utils/fs.js';
import * as miscUtils from './utils/misc.js';

type LocalizeMePack = Record<string, { orig: string; text: string }>;

export const INJECTED_IN_MOD_TAG = 'INJECTED_IN_MOD';
export const IGNORE_IN_MOD_TAG = 'IGNORE_IN_MOD';

export class LocalizeMePacker {
  public packs = new Map<string, LocalizeMePack>();
  private assetsCache = new Map<string, unknown>();

  public async addNotaFragment(f: Fragment): Promise<void> {
    if (f.translations.length === 0) return;
    if (f.original.descriptionText.includes(IGNORE_IN_MOD_TAG)) return;

    if (!(await this.validateFragment(f))) return;

    let localizeMeFilePath = f.original.file;
    if (localizeMeFilePath.startsWith('data/')) {
      localizeMeFilePath = localizeMeFilePath.slice('data/'.length);
    }
    let pack: LocalizeMePack = miscUtils.mapGetOrInsert(
      this.packs,
      localizeMeFilePath,
      {},
    );
    pack[`${localizeMeFilePath}/${f.original.jsonPath}`] = {
      orig: f.original.text,
      text: f.translations[0].text,
    };
  }

  public async validateFragment(f: Fragment): Promise<boolean> {
    let { file, jsonPath } = f.original;

    let realFilePath = paths.join('assets', file);
    let obj: unknown;
    try {
      obj = await this.getAsset(realFilePath);
    } catch (_err) {
      console.warn(`${file} ${jsonPath}: unknown file`);
      return false;
    }

    if (!f.original.descriptionText.includes(INJECTED_IN_MOD_TAG)) {
      obj = miscUtils.getValueByPath(obj, jsonPath.split('/'));

      let realOriginalText: string;
      if (file.endsWith('.en_US.json')) {
        if (typeof obj !== 'string') {
          console.warn(`${file} ${jsonPath}: not a string`);
          return false;
        }
        realOriginalText = obj;
      } else {
        if (typeof obj !== 'object' || obj == null) {
          console.warn(`${file} ${jsonPath}: not a string`);
          return false;
        }
        let obj2 = obj as {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          en_US?: unknown;
        };
        if (typeof obj2.en_US !== 'string') {
          console.warn(`${file} ${jsonPath}: not a string`);
          return false;
        }
        realOriginalText = obj2.en_US;
      }

      if (f.original.text !== realOriginalText) {
        console.warn(`${file} ${jsonPath}: stale translation`);
      }
    }

    return true;
  }

  private async getAsset(file: string): Promise<unknown> {
    if (this.assetsCache.has(file)) {
      return this.assetsCache.get(file);
    } else {
      let data = await fsUtils.readJsonFile(file);
      this.assetsCache.set(file, data);
      return data;
    }
  }
}
