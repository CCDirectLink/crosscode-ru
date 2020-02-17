/// <reference types="nw.js" />

import { NotaClient } from './Notabenoid.js';
import { notaChapterToPack } from './TranslationPack.js';

(async () => {
  await new Promise(resolve => {
    nw.Window.get().showDevTools(undefined, resolve);
  });

  let client = new NotaClient({
    anonymous: true,
  });
  let chapters = await client.fetchAllChapterStatuses();
  console.log(chapters);
  let chapter = await client.fetchChapterFragments(chapters['tree-dng']);
  console.log(chapter);
  console.log(notaChapterToPack(chapter));
})();
