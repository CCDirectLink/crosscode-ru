/// <reference types="nw.js" />

import { NotaClient } from './Notabenoid.js';

(async () => {
  await new Promise(resolve => {
    nw.Window.get().showDevTools(undefined, resolve);
  });

  let client = new NotaClient({
    anonymous: true,
  });
  let areas = await client.fetchAllAreaStatuses();
  console.log(areas);
  console.log(await client.fetchAreaFragments(areas['tree-dng'].id));
})();
