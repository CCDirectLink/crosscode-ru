/// <reference types="nw.js" />

import { NotaClient, Fragment, ChapterStatuses } from './Notabenoid.js';
import { LocalizeMePacker } from './TranslationPack.js';
import { readSettings } from './settings.js';
import * as paths from './paths.js';

import fs from './node-builtin-modules/fs.js';
import * as fsUtils from './utils/fs.js';
import path from './node-builtin-modules/path.js';

import * as asyncUtils from './utils/async.js';
import * as iteratorUtils from './utils/iterator.js';

window.addEventListener('load', () => start());

async function start(): Promise<void> {
  try {
    let settings = await readSettings();
    await showDevTools();
    console.log(settings);
  } catch (err) {
    console.error(err);
  }
}

function showDevTools(): Promise<void> {
  return new Promise(resolve =>
    nw.Window.get().showDevTools(undefined, () => resolve()),
  );
}

async function updateTranslations() {
  await fs.promises.mkdir(paths.MOD_DATA_DIR, { recursive: true });

  let client = new NotaClient({
    anonymous: true,
  });

  let statuses: ChapterStatuses = await client.fetchAllChapterStatuses();
  let prevStatuses: ChapterStatuses = {};

  try {
    prevStatuses = await fsUtils.readJsonFile(
      paths.CHAPTER_STATUSES_FILE,
      'utf8',
    );
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  await fs.promises.mkdir(paths.CHAPTER_FRAGMENTS_DIR, { recursive: true });

  let packer = new LocalizeMePacker();
  for (let [id, status] of Object.entries(statuses)) {
    let prevStatus = prevStatuses[id];
    let needsUpdate =
      prevStatus == null ||
      status.modificationTimestamp !== prevStatus.modificationTimestamp;

    let fragments: Fragment[] = [];
    if (needsUpdate) {
      console.log(`updating ${id}`);

      await asyncUtils.limitConcurrency(
        iteratorUtils.map(
          client.createChapterFragmentFetcher(status),
          promise =>
            promise.then(pageFragments => {
              fragments = fragments.concat(pageFragments);
            }),
        ),
        8,
      );

      fragments.sort((f1, f2) => f1.orderNumber - f2.orderNumber);

      await fsUtils.writeJsonFile(
        path.join(paths.CHAPTER_FRAGMENTS_DIR, `${id}.json`),
        fragments,
      );
    } else {
      console.log(`loading ${id} from disk`);

      fragments = await fsUtils.readJsonFile(
        path.join(paths.CHAPTER_FRAGMENTS_DIR, `${id}.json`),
        'utf8',
      );
    }

    await packer.addNotaFragments(fragments);
  }

  let mappingTable: Record<string, string> = {};

  await fs.promises.mkdir(paths.LOCALIZE_ME_PACKS_DIR, { recursive: true });

  for (let [originalFile, packContents] of packer.packs.entries()) {
    mappingTable[originalFile] = originalFile;
    console.log(`writing pack for ${originalFile}`);
    await fs.promises.mkdir(
      path.join(paths.LOCALIZE_ME_PACKS_DIR, path.dirname(originalFile)),
      { recursive: true },
    );
    await fsUtils.writeJsonFile(
      path.join(paths.LOCALIZE_ME_PACKS_DIR, originalFile),
      packContents,
    );
  }

  await fsUtils.writeJsonFile(paths.LOCALIZE_ME_MAPPING_FILE, mappingTable);

  await fsUtils.writeJsonFile(paths.CHAPTER_STATUSES_FILE, statuses);

  console.log('DONE');
}
