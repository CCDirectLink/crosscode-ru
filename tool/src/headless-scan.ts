import './hacked-require/nodejs.js';

import * as paths from 'path';
import * as fs from 'fs';
import yargs from 'yargs';
import * as tmp from 'tmp-promise';
import * as subprocess from 'child_process';
import { ScanDb, ScanFragment } from './crosslocale/scan.js';
import * as fsUtils from './utils/fs.js';
import { fileURLToPath } from 'url';

const THIS_FILENAME = fileURLToPath(import.meta.url);
const THIS_DIRNAME = paths.dirname(THIS_FILENAME);

async function main(): Promise<void> {
  let opts = await yargs(process.argv.slice(2))
    .usage('$0')
    .help()
    .strict()
    .options({
      gameAssetsDir: {
        string: true,
        requiresArg: true,
        demandOption: true,
        normalize: true,
      },
      ccloaderDir: {
        string: true,
        requiresArg: true,
        demandOption: true,
        normalize: true,
      },
      outputFile: {
        string: true,
        requiresArg: true,
        demandOption: true,
        normalize: true,
      },
      crosslocaleBin: {
        string: true,
        requiresArg: true,
        default: 'crosslocale',
      },
      includeRuSpecificPatches: {
        boolean: true,
        default: false,
      },
    })
    .parse();

  let scanDbFile = await tmp.file({ detachDescriptor: true });
  try {
    let assetOverridesDir = await tmp.dir({ unsafeCleanup: true });
    try {
      //

      let filePatches = new Map<string, sc.ui2.LocaleJsonPatchesLib.PatcherCallback[]>();
      let currentLang = opts.includeRuSpecificPatches ? 'ru_RU' : 'en_US';
      let localeJsonPatchesLib: sc.ui2.LocaleJsonPatchesLib = {
        isRuntime: false,

        patchFile(path, callback) {
          let list = filePatches.get(path);
          if (list == null) {
            list = [];
            filePatches.set(path, list);
          }
          list.push(callback);
        },

        getCurrentLang() {
          return currentLang;
        },

        getLangLabelText(data, forLocale) {
          return data[forLocale ?? currentLang];
        },

        // <https://github.com/phoboslab/Impact/blob/463c166740c507ce5c507de36e8ca5d31f712009/lib/impact/impact.js#L140>
        // TODO: REWRITE
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mergeObjects(original: any, extended: any): any {
          for (let key in extended) {
            let ext = extended[key];
            if (typeof ext !== 'object' || ext == null || Array.isArray(ext)) {
              original[key] = ext;
            } else {
              if (!original[key] || typeof original[key] !== 'object') {
                original[key] = ext instanceof Array ? [] : {};
              }
              this.mergeObjects(original[key], ext);
            }
          }
          return original;
        },
      };

      async function addPatchScript(path: string): Promise<void> {
        path = paths.resolve(THIS_DIRNAME, path);
        let module: { default: (lib: sc.ui2.LocaleJsonPatchesLib) => void } = await import(path);
        module.default(localeJsonPatchesLib);
      }

      function addPatchFile(assetsDir: string, gameFilePath: string): void {
        let patchFilePath = paths.join(
          paths.resolve(THIS_DIRNAME, assetsDir),
          `${gameFilePath}.patch`,
        );
        localeJsonPatchesLib.patchFile(gameFilePath, async (data) => {
          return localeJsonPatchesLib.mergeObjects(data, await fsUtils.readJsonFile(patchFilePath));
        });
      }

      addPatchFile('../../enhanced-ui/assets', 'data/lang/sc/gui.en_US.json');
      addPatchFile(`${opts.ccloaderDir}/runtime/assets`, 'data/lang/sc/gui.en_US.json');
      await addPatchScript('../../enhanced-ui/dist/locale-json-patches.js');
      if (opts.includeRuSpecificPatches) {
        await addPatchScript('../../dist/locale-json-patches.js');
      }

      for (let [filePath, patchers] of filePatches) {
        let text: string;
        try {
          text = await fs.promises.readFile(paths.join(opts.gameAssetsDir, filePath), 'utf8');
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            continue;
          }
          throw error;
        }

        let data = JSON.parse(text);
        for (let patcher of patchers) {
          let newData = await patcher(data);
          // eslint-disable-next-line no-undefined
          if (newData !== undefined) data = newData;
        }
        text = JSON.stringify(data);

        await fs.promises.mkdir(paths.join(assetOverridesDir.path, paths.dirname(filePath)), {
          recursive: true,
        });
        await fs.promises.writeFile(paths.join(assetOverridesDir.path, filePath), text, 'utf8');
      }

      subprocess.execFileSync(
        opts.crosslocaleBin,
        [
          'scan',
          '--compact',
          `--output=${scanDbFile.path}`,
          `--add-assets-overrides-dir=${assetOverridesDir.path}`,
          '--',
          opts.gameAssetsDir,
        ],
        { stdio: 'inherit' },
      );

      let scanDb = ScanDb.fromJSON(await fsUtils.readJsonFile(scanDbFile.path));

      for (let scanGameFile of scanDb.gameFiles.values()) {
        for (let scanFragment of scanGameFile.fragments.values()) {
          if (isFragmentIgnored(scanFragment)) {
            scanGameFile.fragments.delete(scanFragment.jsonPath);
          }
        }
        if (scanGameFile.fragments.size === 0) {
          scanDb.gameFiles.delete(scanGameFile.path);
        }
      }

      await fsUtils.writeJsonFile(opts.outputFile, scanDb.toJSON());

      //
    } finally {
      await assetOverridesDir.cleanup();
    }
  } finally {
    await scanDbFile.cleanup();
  }
}

const IGNORED_STRINGS = new Set<string>([
  'en_US',
  'LOL, DO NOT TRANSLATE THIS!',
  'LOL, DO NOT TRANSLATE THIS! (hologram)',
  '\\c[1][DO NOT TRANSLATE THE FOLLOWING]\\c[0]',
  '\\c[1][DO NOT TRANSLATE FOLLOWING TEXTS]\\c[0]',
]);

// <https://github.com/dmitmel/crosscode-localization-engine/blob/f153b1c4ed338a8f2424eec36bd4b4fb9786badf/src/cli/scan.rs#L375-L407>
function isFragmentIgnored(fragment: ScanFragment): boolean {
  let mainLocaleText = fragment.text.get('en_US')!;
  if (mainLocaleText.trim().length === 0 || IGNORED_STRINGS.has(mainLocaleText)) {
    return true;
  }

  let filePath = fragment.file.path;
  let filePrefix = fragment.file.assetRoot;
  if (filePath.startsWith(filePrefix)) filePath = filePath.slice(filePrefix.length);
  let { jsonPath } = fragment;

  if (filePath.startsWith('data/enemies/') && jsonPath.startsWith('meta/')) {
    return true;
  }

  if (filePath.startsWith('data/credits/') && /^entries\/[^/]+\/names\/[^/]+$/.test(jsonPath)) {
    return true;
  }

  return false;
}

void main();
