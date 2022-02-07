import './hacked-require/nodejs.js';

import * as fs from 'fs';
import * as fsUtils from './utils/fs.js';
import { ChapterStatus, Fragment } from './Notabenoid.js';
import { EMPTY_STRING_TAG, IGNORE_IN_MOD_TAG, LocalizeMePack } from './TranslationPack.js';
import * as miscUtils from './utils/misc.js';
import * as paths from 'path';

async function main(): Promise<void> {
  if (process.argv.length !== 3) {
    console.log(`usage: ${process.argv[1]} path/to/local/chapter/database`);
    process.exitCode = 1;
    return;
  }

  let toolDataDir = process.argv[2];

  let chapterStatuses: Map<string, ChapterStatus> = miscUtils.objectToMap(
    await fsUtils.readJsonFile(paths.join(toolDataDir, 'chapter-statuses.json')),
  );

  let packs = new Map<string, LocalizeMePack>();
  let mappingTable: Record<string, string> = {};

  for (let chapterName of chapterStatuses.keys()) {
    let fragments: Fragment[] = await fsUtils.readJsonFile(
      paths.join(toolDataDir, 'chapter-fragments', `${chapterName}.json`),
    );

    for (let f of fragments) {
      if (f.translations.length === 0) continue;
      if (f.original.descriptionText.includes(IGNORE_IN_MOD_TAG)) return;

      let { file, jsonPath } = f.original;
      if (file.startsWith('data/')) file = file.slice('data/'.length);

      let translation = f.translations[0].text;
      if (translation === EMPTY_STRING_TAG) translation = '';

      let pack: LocalizeMePack = miscUtils.mapGetOrInsert(packs, file, {});
      pack[`${file}/${jsonPath}`] = {
        orig: f.original.text,
        text: translation,
      };
    }
  }

  let packsDir = paths.join(toolDataDir, 'localize-me-packs');
  await fs.promises.mkdir(packsDir, { recursive: true });

  for (let [originalFile, packContents] of packs.entries()) {
    mappingTable[originalFile] = originalFile;
    let outputPath = paths.join(packsDir, originalFile);
    await fs.promises.mkdir(paths.dirname(outputPath), { recursive: true });
    await fsUtils.writeJsonFile(outputPath, packContents);
  }

  await fsUtils.writeJsonFile(paths.join(toolDataDir, 'localize-me-mapping.json'), mappingTable);
}

void main();
