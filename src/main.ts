/// <reference types="nw.js" />

import { NotaClient, Fragment } from './Notabenoid.js';
import { LocalizeMePacker } from './TranslationPack.js';

import fs from './node-builtin-modules/fs.js';
import * as fsUtils from './utils/fs.js';
import path from './node-builtin-modules/path.js';

import * as asyncUtils from './utils/async.js';
import * as iteratorUtils from './utils/iterator.js';

const MOD_DATA_DIR = path.join('assets', 'ru-translation-tool-ng');
const CHAPTER_STATUSES_FILE = path.join(MOD_DATA_DIR, 'chapter-statuses.json');
const CHAPTER_FRAGMENTS_DIR = path.join(MOD_DATA_DIR, 'chapter-fragments');
const LOCALIZE_ME_PACKS_DIR = path.join(MOD_DATA_DIR, 'localize-me-packs');
const LOCALIZE_ME_MAPPING_FILE = path.join(
  MOD_DATA_DIR,
  'localize-me-mapping.json',
);

(async () => {
  await new Promise(resolve => {
    nw.Window.get().showDevTools(undefined, resolve);
  });

  await fs.promises.mkdir(MOD_DATA_DIR, { recursive: true });

  let client = new NotaClient({
    anonymous: true,
  });

  let chapters = await client.fetchAllChapterStatuses();
  console.log(chapters);

  await fsUtils.writeJsonFile(CHAPTER_STATUSES_FILE, chapters);

  await fs.promises.mkdir(CHAPTER_FRAGMENTS_DIR, { recursive: true });

  let packer = new LocalizeMePacker();
  for (let [id, status] of Object.entries(chapters)) {
    let fragments: Fragment[] = [];
    await asyncUtils.limitConcurrency(
      iteratorUtils.map(client.createChapterFragmentFetcher(status), promise =>
        promise.then(pageFragments => {
          fragments = fragments.concat(pageFragments);
        }),
      ),
      8,
    );

    await packer.addNotaFragments(fragments);
    await fsUtils.writeJsonFile(
      path.join(CHAPTER_FRAGMENTS_DIR, `${id}.json`),
      fragments,
    );
  }

  let mappingTable: Record<string, string> = {};

  await fs.promises.mkdir(LOCALIZE_ME_PACKS_DIR, { recursive: true });

  for (let [originalFile, packContents] of packer.packs.entries()) {
    mappingTable[originalFile] = originalFile;
    console.log(`writing pack for ${originalFile}`);
    await fs.promises.mkdir(
      path.join(LOCALIZE_ME_PACKS_DIR, path.dirname(originalFile)),
      { recursive: true },
    );
    await fsUtils.writeJsonFile(
      path.join(LOCALIZE_ME_PACKS_DIR, originalFile),
      packContents,
    );
  }

  await fsUtils.writeJsonFile(LOCALIZE_ME_MAPPING_FILE, mappingTable);
})().catch(console.error);
