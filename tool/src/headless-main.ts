/* eslint-disable no-loop-func */

import { ChapterStatus, Fragment, NotaClient } from './Notabenoid';
import { NodejsNotaHttpClient } from './Notabenoid/nodejs';

import * as asyncUtils from './utils/async.js';

import * as fs from 'fs';
import * as yargs from 'yargs';

interface CliOptions {
  username: string;
  password: string;
  output: string;
  force: boolean;
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
      },
      force: {
        alias: 'f',
        boolean: true,
        default: false,
        description: 'Whether to download all chapters even if some were unchanged',
      },
    })
    .help().argv;
}

async function main(): Promise<void> {
  let opts = parseCliOptions();

  let notaClient = new NotaClient(new NodejsNotaHttpClient());
  await notaClient.login(opts.username, opts.password);

  let chapterStatuses: Map<string, ChapterStatus> = await notaClient.fetchAllChapterStatuses();
  let chapterFragments = new Map<string, Fragment[]>();

  let totalNotaPagesCount = 0;
  let fetchedNotaPagesCount = 0;
  for (let chapter of chapterStatuses.values()) {
    totalNotaPagesCount += chapter.pages;
  }

  for (let chapterStatus of chapterStatuses.values()) {
    let fragments: Fragment[] = [];

    let { iterator } = notaClient.createChapterFragmentFetcher(chapterStatus);
    await asyncUtils.limitConcurrency(
      (function* () {
        for (let promise of iterator) {
          yield promise.then((pageFragments) => {
            fragments.push(...pageFragments);
            fetchedNotaPagesCount++;
            console.log(`[${fetchedNotaPagesCount}/${totalNotaPagesCount}] ${chapterStatus.name}`);
          });
        }
      })(),
      16,
    );

    fragments.sort((f1, f2) => f1.orderNumber - f2.orderNumber);
    chapterFragments.set(chapterStatus.name, fragments);
  }
}

void main();
