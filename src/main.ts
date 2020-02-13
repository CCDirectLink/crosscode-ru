/// <reference types="nw.js" />

import { NotaClient } from './Notabenoid.js';

(async () => {
  await new Promise(resolve => {
    nw.Window.get().showDevTools(undefined, resolve);
  });

  let client = new NotaClient({
    anonymous: true,
  });
  let ids = await client.fetchAreaIds();
  console.log(ids);
  console.log(await client.fetchArea(ids['tree-dng']));
})();
