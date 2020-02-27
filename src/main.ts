/// <reference types="nw.js" />

import {
  NotaClient,
  Fragment,
  ChapterStatus,
  ChapterStatuses,
} from './Notabenoid.js';
import { LocalizeMePacker } from './TranslationPack.js';
import { readSettings, writeSettings } from './settings.js';
import * as paths from './paths.js';

import fs from './node-builtin-modules/fs.js';
import * as fsUtils from './utils/fs.js';
import path from './node-builtin-modules/path.js';

import * as asyncUtils from './utils/async.js';
import * as iteratorUtils from './utils/iterator.js';

window.addEventListener('load', () => {
  new Main().start();
});

class Main {
  // yeah, the following fields are one of the most weird things I've ever
  // written, but hold on, I want to test the "God class" pattern in JS
  notaClient: NotaClient = null!;
  progressBar: ProgressBar = null!;

  async start(): Promise<void> {
    try {
      await fs.promises.mkdir(paths.MOD_DATA_DIR, { recursive: true });

      let settings = await readSettings();

      let autoOpenCheckbox = document.getElementById(
        'settings_translations_autoOpen',
      )! as HTMLInputElement;
      autoOpenCheckbox.disabled = false;
      autoOpenCheckbox.checked = settings.autoOpen;
      autoOpenCheckbox.addEventListener('change', () => {
        settings.autoOpen = autoOpenCheckbox.checked;
        writeSettings(settings);
      });

      this.progressBar = new ProgressBar();

      await showDevTools();

      this.notaClient = new NotaClient({ anonymous: true });

      let updateButton = document.getElementById(
        'settings_translations_update',
      )! as HTMLButtonElement;
      updateButton.disabled = false;
      updateButton.addEventListener('click', () => {
        this.downloadTranslations();
      });
    } catch (err) {
      console.error(err);
    }
  }

  async downloadTranslations(): Promise<void> {
    try {
      this.progressBar.setTaskInfo('Скачивание данных о главах на Ноте...');
      this.progressBar.setIndeterminate();

      let statuses: ChapterStatuses = await this.notaClient.fetchAllChapterStatuses();
      let prevStatuses: ChapterStatuses = await this.readChapterStatuses();

      await fs.promises.mkdir(paths.CHAPTER_FRAGMENTS_DIR, { recursive: true });

      let chaptersWithUpdates: ChapterStatus[] = [];
      let chaptersWithoutUpdates: ChapterStatus[] = [];
      for (let status of Object.values(statuses)) {
        let prevStatus = prevStatuses[status.name];
        let needsUpdate =
          prevStatus == null ||
          status.modificationTimestamp !== prevStatus.modificationTimestamp;
        (needsUpdate ? chaptersWithUpdates : chaptersWithoutUpdates).push(
          status,
        );
      }

      let chapterFragments: Record<string, Fragment[]> = {};

      for (let i = 0, len = chaptersWithoutUpdates.length; i < len; i++) {
        let id = chaptersWithoutUpdates[i].name;
        console.log(`loading ${id} from disk`);
        this.progressBar.setTaskInfo(`Чтение главы '${id}' с диска...`);
        this.progressBar.setValue(i, len);

        chapterFragments[id] = await fsUtils.readJsonFile(
          path.join(paths.CHAPTER_FRAGMENTS_DIR, `${id}.json`),
          'utf8',
        );
      }

      for (let i = 0, len = chaptersWithUpdates.length; i < len; i++) {
        let status = chaptersWithUpdates[i];
        let id = status.name;
        console.log(`downloading ${id}`);
        this.progressBar.setTaskInfo(`Скачивание главы '${id}' с Ноты...`);
        this.progressBar.setValue(i, len);

        let fragments: Fragment[] = [];

        await asyncUtils.limitConcurrency(
          iteratorUtils.map(
            this.notaClient.createChapterFragmentFetcher(status),
            promise =>
              promise.then(pageFragments => {
                fragments = fragments.concat(pageFragments);
              }),
          ),
          8,
        );

        fragments.sort((f1, f2) => f1.orderNumber - f2.orderNumber);
        chapterFragments[id] = fragments;

        await fsUtils.writeJsonFile(
          path.join(paths.CHAPTER_FRAGMENTS_DIR, `${id}.json`),
          fragments,
        );
      }

      // let packer = new LocalizeMePacker();
      // for (let [id, status] of Object.entries(statuses)) {
      //   let prevStatus = prevStatuses[id];
      //   let needsUpdate =
      //     prevStatus == null ||
      //     status.modificationTimestamp !== prevStatus.modificationTimestamp;

      //   let fragments: Fragment[] = [];
      //   if (needsUpdate) {
      //     console.log(`updating ${id}`);

      //     await asyncUtils.limitConcurrency(
      //       iteratorUtils.map(
      //         this.notaClient.createChapterFragmentFetcher(status),
      //         promise =>
      //           promise.then(pageFragments => {
      //             fragments = fragments.concat(pageFragments);
      //           }),
      //       ),
      //       8,
      //     );

      //     fragments.sort((f1, f2) => f1.orderNumber - f2.orderNumber);

      //     await fsUtils.writeJsonFile(
      //       path.join(paths.CHAPTER_FRAGMENTS_DIR, `${id}.json`),
      //       fragments,
      //     );
      //   } else {
      //     console.log(`loading ${id} from disk`);

      //     fragments = await fsUtils.readJsonFile(
      //       path.join(paths.CHAPTER_FRAGMENTS_DIR, `${id}.json`),
      //       'utf8',
      //     );
      //   }

      //   await packer.addNotaFragments(fragments);
      // }

      // let mappingTable: Record<string, string> = {};

      // await fs.promises.mkdir(paths.LOCALIZE_ME_PACKS_DIR, { recursive: true });

      // for (let [originalFile, packContents] of packer.packs.entries()) {
      //   mappingTable[originalFile] = originalFile;
      //   console.log(`writing pack for ${originalFile}`);
      //   await fs.promises.mkdir(
      //     path.join(paths.LOCALIZE_ME_PACKS_DIR, path.dirname(originalFile)),
      //     { recursive: true },
      //   );
      //   await fsUtils.writeJsonFile(
      //     path.join(paths.LOCALIZE_ME_PACKS_DIR, originalFile),
      //     packContents,
      //   );
      // }

      // await fsUtils.writeJsonFile(paths.LOCALIZE_ME_MAPPING_FILE, mappingTable);

      // await fsUtils.writeJsonFile(paths.CHAPTER_STATUSES_FILE, statuses);

      console.log('DONE');
      this.progressBar.setTaskInfo('Скачивание переводов успешно завершено!');
      this.progressBar.setDone();
    } catch (err) {
      console.error('err', err);
      this.progressBar.setTaskError(err);
    }
  }

  async readChapterStatuses(): Promise<ChapterStatuses> {
    let data: ChapterStatuses | null = await fsUtils.readJsonFileOptional(
      paths.CHAPTER_STATUSES_FILE,
      'utf8',
    );
    if (data == null) data = {};
    return data;
  }
}

function showDevTools(): Promise<void> {
  return new Promise(resolve =>
    nw.Window.get().showDevTools(undefined, () => resolve()),
  );
}

class ProgressBar {
  element = document.getElementById(
    'settings_translations_progress',
  )! as HTMLProgressElement;
  taskElement = document.getElementById(
    'settings_translations_progressTask',
  )! as HTMLElement;
  taskErrorElement = document.getElementById(
    'settings_translations_progressTask_error',
  )! as HTMLElement;
  countElement = document.getElementById(
    'settings_translations_progressCount',
  )! as HTMLElement;

  setTaskInfo(info: { toString(): string }): void {
    this.taskErrorElement.style.display = 'none';
    this.taskElement.textContent = info.toString();
  }

  setTaskError(err: { toString(): string }): void {
    this.taskErrorElement.style.display = 'inline';
    this.taskElement.textContent = err.toString();
    this.setDone();
  }

  setIndeterminate(): void {
    this.element.removeAttribute('value');
    this.countElement.textContent = '';
  }

  setValue(value: number, total: number): void {
    this.element.value = value;
    this.element.max = total;
    let percentStr = ((value / total) * 100).toFixed();
    this.countElement.textContent = `${percentStr}% (${value} / ${total})`;
  }

  setDone(): void {
    this.element.value = 0;
    this.countElement.textContent = '';
  }
}
