// TODO: low-priority: perhaps this can be rewritten using 20kdc's patch for
// loadable dependencies

// TODO: use patcher dependencies here

const { imagePatches } = ccmod.resources;

imagePatches.add('media/entity/objects/history-of-bergen.png', async (canvas) => {
  // this label is practically a part of a dialog, so I'm not making it optional
  if (!sc.ru.shouldPatchSpriteLabels(true)) return;
  let ctx = canvas.getContext('2d')!;

  let ruImage = await ccmod.resources.loadImage('media/entity/objects/history-of-bergen.ru_RU.png');
  ctx.clearRect(183, 15, 28, 5);
  ctx.clearRect(187, 21, 24, 1);
  ctx.drawImage(ruImage, 0, 0, 21, 7, 187, 15, 21, 7);
});

imagePatches.add('media/map/jungle.png', async (canvas) => {
  if (!sc.ru.shouldPatchSpriteLabels()) return;
  let ctx = canvas.getContext('2d')!;

  let ruImage = await ccmod.resources.loadImage('media/map/open-closed-signs.ru_RU.png');
  ctx.drawImage(ruImage, 0, 0, 28, 11, 66, 929, 28, 11);
  ctx.drawImage(ruImage, 0, 0, 28, 11, 34, 977, 28, 11);
  ctx.drawImage(ruImage, 0, 11, 28, 11, 66, 977, 28, 11);
});

imagePatches.add('media/entity/style/jungle-city-map.png', async (canvas) => {
  if (!sc.ru.shouldPatchSpriteLabels()) return;
  let ctx = canvas.getContext('2d')!;

  let ruImage = await ccmod.resources.loadImage('media/map/open-closed-signs.ru_RU.png');
  ctx.drawImage(ruImage, 0, 11, 28, 11, 2, 1, 28, 11);
  for (let i = 0; i < 4; i++) {
    ctx.drawImage(ruImage, 0, 0, 28, 11, 34 + i * 32, 1, 28, 11);
  }
});

imagePatches.add('media/map/jungle-props.png', async (canvas) => {
  if (!sc.ru.shouldPatchSpriteLabels()) return;
  let ctx = canvas.getContext('2d')!;

  let ruImage = await ccmod.resources.loadImage('media/map/jungle-props.ru_RU.png');
  ctx.clearRect(361, 118, 6, 19);
  ctx.drawImage(ruImage, 0, 0, 6, 19, 361, 118, 6, 19);
});

imagePatches.add('media/map/bergen-trail.png', async (canvas) => {
  if (!sc.ru.shouldPatchSpriteLabels()) return;
  let ctx = canvas.getContext('2d')!;

  let innSign = await ccmod.resources.loadImage('media/map/inn-sign.ru_RU.png');
  ctx.clearRect(128, 720, 32, 16);
  ctx.drawImage(innSign, 0, 0, 32, 16, 128, 720, 32, 16);
});

imagePatches.add('media/map/bergen-village-inner.png', async (canvas) => {
  if (!sc.ru.shouldPatchSpriteLabels()) return;
  let ctx = canvas.getContext('2d')!;

  let innSign = await ccmod.resources.loadImage('media/map/inn-sign.ru_RU.png');
  ctx.clearRect(432, 144, 32, 16);
  ctx.drawImage(innSign, 0, 0, 32, 16, 432, 144, 32, 16);
});

imagePatches.add('media/map/rookie-harbor.png', async (canvas) => {
  if (!sc.ru.shouldPatchSpriteLabels()) return;
  let ctx = canvas.getContext('2d')!;

  let [innSign, ruImage] = await Promise.all([
    ccmod.resources.loadImage('media/map/inn-sign.ru_RU.png'),
    ccmod.resources.loadImage('media/map/rookie-harbor.ru_RU.png'),
  ]);
  ctx.clearRect(448, 432, 32, 16);
  ctx.drawImage(innSign, 0, 0, 32, 16, 448, 432, 32, 16);
  ctx.clearRect(432, 448, 48, 32);
  ctx.drawImage(ruImage, 0, 0, 48, 32, 432, 448, 48, 32);
});
