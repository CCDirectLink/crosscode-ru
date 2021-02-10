/* eslint-disable no-loop-func */

import { ChapterStatus, Fragment, NotaClient } from './Notabenoid';
import { NodejsNotaHttpClient } from './Notabenoid/nodejs';

import * as asyncUtils from './utils/async.js';

async function main(): Promise<void> {
  let notaClient = new NotaClient(new NodejsNotaHttpClient());
  await notaClient.login('username', 'password');

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
