import {
  ChapterStatus,
  ChapterStatuses,
  Fragment,
  NotaClient,
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
  let app = new Main();
  (window as any).app = app;
  app.start();
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
        this.downloadTranslations(false);
      });

      let redownloadButton = document.getElementById(
        'settings_translations_redownload',
      )! as HTMLButtonElement;
      redownloadButton.disabled = false;
      redownloadButton.addEventListener('click', () => {
        this.downloadTranslations(true);
      });
    } catch (err) {
      console.error(err);
    }
  }

  async downloadTranslations(force: boolean): Promise<void> {
    try {
      this.progressBar.setTaskInfo('Скачивание данных о главах на Ноте...');
      this.progressBar.setIndeterminate();

      let statuses: ChapterStatuses = await this.notaClient.fetchAllChapterStatuses();
      let prevStatuses: ChapterStatuses = await this.readChapterStatuses();

      await fs.promises.mkdir(paths.CHAPTER_FRAGMENTS_DIR, { recursive: true });

      let chaptersWithUpdates: ChapterStatus[] = [];
      let chaptersWithoutUpdates: ChapterStatus[] = [];
      for (let status of Object.values(statuses)) {
        let id = status.name;
        let prevStatus = prevStatuses[id];
        let needsUpdate =
          prevStatus == null ||
          status.modificationTimestamp !== prevStatus.modificationTimestamp;
        (force || needsUpdate
          ? chaptersWithUpdates
          : chaptersWithoutUpdates
        ).push(status);
      }

      let chapterFragments: Record<string, Fragment[]> = {};

      /* eslint-disable no-await-in-loop */
      for (let i = 0, len = chaptersWithoutUpdates.length; i < len; i++) {
        let id = chaptersWithoutUpdates[i].name;
        console.log(`loading ${id} from disk`);
        this.progressBar.setTaskInfo(`Чтение главы '${id}' с диска...`);
        this.progressBar.setValue(i, len);

        chapterFragments[id] = await fsUtils.readJsonFile(
          path.join(paths.CHAPTER_FRAGMENTS_DIR, `${id}.json`),
        );
      }

      for (let i = 0, len = chaptersWithUpdates.length; i < len; i++) {
        let status = chaptersWithUpdates[i];
        let id = status.name;
        console.log(`downloading ${id}`);
        this.progressBar.setTaskInfo(`Скачивание главы '${id}' с Ноты...`);
        this.progressBar.setValue(i, len);

        let fragments: Fragment[] = [];

        let {
          total: notaPageCount,
          iterator,
        } = this.notaClient.createChapterFragmentFetcher(status);
        console.log('notaPageCount', notaPageCount);
        await asyncUtils.limitConcurrency(
          iteratorUtils.map(iterator, promise =>
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

      let packer = new LocalizeMePacker();

      let chapterIds = Object.keys(chapterFragments);
      for (let i = 0, len = chapterIds.length; i < len; i++) {
        let id = chapterIds[i];
        let fragments = chapterFragments[id];
        console.log(`generating packs for ${id}`);
        this.progressBar.setTaskInfo(
          `Генерация транслейт-паков Localize-me для главы '${id}'...`,
        );
        this.progressBar.setValue(i, len);
        await packer.addNotaFragments(fragments);
      }

      let mappingTable: Record<string, string> = {};

      await fs.promises.mkdir(paths.LOCALIZE_ME_PACKS_DIR, { recursive: true });

      let totalPackCount = packer.packs.size;
      let currentPackIndex = 0;
      for (let [originalFile, packContents] of packer.packs.entries()) {
        mappingTable[originalFile] = originalFile;
        this.progressBar.setTaskInfo(
          `Запись транслейт-пака '${originalFile}'...`,
        );
        this.progressBar.setValue(currentPackIndex, totalPackCount + 1);
        currentPackIndex++;
        await fs.promises.mkdir(
          path.join(paths.LOCALIZE_ME_PACKS_DIR, path.dirname(originalFile)),
          { recursive: true },
        );
        await fsUtils.writeJsonFile(
          path.join(paths.LOCALIZE_ME_PACKS_DIR, originalFile),
          packContents,
        );
      }
      /* eslint-enable no-await-in-loop */

      this.progressBar.setTaskInfo(
        `Запись таблицы маппингов транслейт-паков...`,
      );
      this.progressBar.setValue(totalPackCount, totalPackCount + 1);
      await fsUtils.writeJsonFile(paths.LOCALIZE_ME_MAPPING_FILE, mappingTable);

      await fsUtils.writeJsonFile(paths.CHAPTER_STATUSES_FILE, statuses);

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
    );
    if (data == null) data = {};
    return data;
  }
}

function showDevTools(): Promise<void> {
  return new Promise(resolve =>
    // eslint-disable-next-line no-undefined
    nw.Window.get().showDevTools(undefined, () => resolve()),
  );
}

class ProgressBar {
  element = document.getElementById(
    'settings_translations_progress',
  )! as HTMLProgressElement;
  taskElement = document.getElementById('settings_translations_progressTask')!;
  taskErrorElement = document.getElementById(
    'settings_translations_progressTask_error',
  )!;
  countElement = document.getElementById(
    'settings_translations_progressCount',
  )!;

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
