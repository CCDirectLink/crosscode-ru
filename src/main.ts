/// <reference types="nw.js" />

import { fetchAreaUrls, fetchAreaFragments } from './Notabenoid.js';

(async () => {
  await new Promise(resolve => {
    nw.Window.get().showDevTools(undefined, resolve);
  });

  let links = await fetchAreaUrls({
    anonymous: true,
  });
  console.log(await fetchAreaFragments(links['cargo-ship']));
})();
