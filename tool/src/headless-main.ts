import { ChapterStatus, Fragment, NotaClient } from './Notabenoid.js';
import { NodejsNotaHttpClient } from './Notabenoid/nodejs.js';

import * as asyncUtils from './utils/async.js';
import * as fsUtils from './utils/fs.js';
import * as miscUtils from './utils/misc.js';

import * as fs from 'fs';
import * as paths from 'path';
import * as yargs from 'yargs';
import * as ProgressBar from 'progress';

interface CliOptions {
  username: string;
  password: string;
  output: string;
  force: boolean;
  progress: boolean;
  fetchConnections: number;
}

function parseCliOptions(): CliOptions {
  function loadSecretOption(arg: unknown): string {
    let argStr = String(arg);
    if (argStr.startsWith('@')) {
      return argStr.slice(1);
    } else {
      return fs.readFileSync(argStr, 'utf8').trim();
    }
  }

  return yargs(process.argv.slice(2))
    .usage('$0')
    .options({
      username: {
        string: true,
        requiresArg: true,
        alias: 'u',
        demandOption: true,
        coerce: loadSecretOption,
        description: 'Notabenoid.org username',
      },
      password: {
        string: true,
        requiresArg: true,
        alias: 'p',
        demandOption: true,
        coerce: loadSecretOption,
        description: 'Notabenoid.org password',
      },
      output: {
        string: true,
        requiresArg: true,
        alias: 'o',
        demandOption: true,
        description: 'Path to the local database dir',
        normalize: true,
      },
      force: {
        alias: 'f',
        boolean: true,
        default: false,
        description: 'Download all chapters even if some were unchanged',
      },
      progress: {
        alias: 's',
        boolean: true,
        default: false,
        description: 'Report progress',
      },
      fetchConnections: {
        alias: 'j',
        number: true,
        default: 8,
        description: 'Number of parallel connections for fetching chapters from Notabenoid',
      },
    })
    .help().argv;
}

async function main(): Promise<void> {
  let opts = parseCliOptions();
  await fs.promises.mkdir(opts.output, { recursive: true });
  let chapterStatusesFile = paths.join(opts.output, 'chapter-statuses.json');
  let chapterFragmentsDir = paths.join(opts.output, 'chapter-fragments');

  function createProgressBar(format: string, total: number): ProgressBar | null {
    let stream = process.stderr;
    return stream.isTTY
      ? new ProgressBar(format, {
          total,
          stream,
          complete: '=',
          incomplete: ' ',
        })
      : null;
  }

  let notaClient = new NotaClient(new NodejsNotaHttpClient());
  await notaClient.login(opts.username, opts.password);

  let chapterStatuses: Map<string, ChapterStatus> = await notaClient.fetchAllChapterStatuses();
  let prevStatuses: Map<string, ChapterStatus> = miscUtils.objectToMap(
    (await fsUtils.readJsonFileOptional(paths.join(opts.output, 'chapter-statuses.json'))) ?? {},
  );

  await fs.promises.mkdir(chapterFragmentsDir, { recursive: true });

  let chaptersWithUpdates: ChapterStatus[] = [];
  let chaptersWithoutUpdates: ChapterStatus[] = [];
  for (let status of chapterStatuses.values()) {
    let prevStatus = prevStatuses.get(status.name);
    let needsUpdate =
      prevStatus == null || status.modificationTimestamp !== prevStatus.modificationTimestamp;
    (opts.force || needsUpdate ? chaptersWithUpdates : chaptersWithoutUpdates).push(status);
  }

  if (chaptersWithUpdates.length === 0) {
    console.log('All chapters are up to date!');
    return;
  }

  console.log(
    `${chaptersWithUpdates.length}/${
      chaptersWithUpdates.length + chaptersWithoutUpdates.length
    } chapter(s) need to be updated.`,
  );

  let totalNotaPagesCount = 0;
  let fetchedNotaPagesCount = 0;
  let fetchers: Array<{ chapterName: string; fetcher: asyncUtils.Fetcher<Fragment[]> }> = [];
  for (let chapter of chaptersWithUpdates) {
    let fetcher = notaClient.createChapterFragmentFetcher(chapter);
    totalNotaPagesCount += fetcher.total;
    fetchers.push({ chapterName: chapter.name, fetcher });
  }

  let progress = createProgressBar(
    '[:bar] :percent  :rate pages/s  ETA :etas ',
    totalNotaPagesCount,
  );

  for (let [i, { chapterName, fetcher }] of fetchers.entries()) {
    i++;
    if (opts.progress) {
      progress?.interrupt(
        `[${i}/${chaptersWithUpdates.length}] downloading chapter '${chapterName}'`,
      );
    }
    let fragments: Fragment[] = [];

    await asyncUtils.limitConcurrency(
      (function* () {
        for (let promise of fetcher.iterator) {
          yield promise.then((pageFragments) => {
            fragments.push(...pageFragments);
            fetchedNotaPagesCount++;
            if (opts.progress) {
              if (progress != null) {
                progress.tick(1);
              } else {
                console.log(
                  `[${i}/${chaptersWithUpdates.length}] [${fetchedNotaPagesCount}/${totalNotaPagesCount}] downloading chapter '${chapterName}'`,
                );
              }
            }
          });
        }
      })(),
      opts.fetchConnections,
    );

    fragments.sort((f1, f2) => f1.orderNumber - f2.orderNumber);
    await fsUtils.writeJsonFile(paths.join(chapterFragmentsDir, `${chapterName}.json`), fragments);
  }

  progress?.terminate();
  await fsUtils.writeJsonFile(chapterStatusesFile, miscUtils.mapToObject(chapterStatuses));
}

void main();
