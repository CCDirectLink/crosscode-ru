type ImagePatchFunction = (
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) => MaybePromise<void | null | ig.Image.Data>;

// TODO: rewrite the mess that is `ig.Loader`, and use loadables instead of this
// function. Sorry, no matter what I try - I can't get this not to block in some
// edge-cases with the current implementation of `ig.Loader`.
function loadImageTemporary(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.src = path;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

const IMAGE_PATCHES: { [path: string]: ImagePatchFunction } = {
  'media/entity/objects/history-of-bergen.png': async (ctx) => {
    // this label is practically a part of a dialog, so I'm not making it optional
    if (!sc.ru.shouldPatchSpriteLabels(true)) return;
    // let ruImage = await sc.ui2.waitForLoadable(
    //   new ig.Image('media/entity/objects/history-of-bergen.ru_RU.png'),
    // );
    let ruImage = await loadImageTemporary(
      'media/entity/objects/history-of-bergen.ru_RU.png',
    );
    ctx.clearRect(183, 15, 28, 5);
    ctx.clearRect(187, 21, 24, 1);
    // ctx.drawImage(ruImage.data, 0, 0, 21, 7, 187, 15, 21, 7);
    ctx.drawImage(ruImage, 0, 0, 21, 7, 187, 15, 21, 7);
    // ruImage.decreaseRef();
  },

  'media/map/jungle.png': async (ctx) => {
    if (!sc.ru.shouldPatchSpriteLabels()) return;
    // let ruImage = await sc.ui2.waitForLoadable(
    //   new ig.Image('media/map/open-closed-signs.ru_RU.png'),
    // );
    let ruImage = await loadImageTemporary(
      'media/map/open-closed-signs.ru_RU.png',
    );
    // ctx.drawImage(ruImage.data, 0, 0, 28, 11, 66, 929, 28, 11);
    ctx.drawImage(ruImage, 0, 0, 28, 11, 66, 929, 28, 11);
    // ctx.drawImage(ruImage.data, 0, 0, 28, 11, 34, 977, 28, 11);
    ctx.drawImage(ruImage, 0, 0, 28, 11, 34, 977, 28, 11);
    // ctx.drawImage(ruImage.data, 0, 11, 28, 11, 66, 977, 28, 11);
    ctx.drawImage(ruImage, 0, 11, 28, 11, 66, 977, 28, 11);
    // ruImage.decreaseRef();
  },

  'media/entity/style/jungle-city-map.png': async (ctx) => {
    if (!sc.ru.shouldPatchSpriteLabels()) return;
    // let ruImage = await sc.ui2.waitForLoadable(
    //   new ig.Image('media/map/open-closed-signs.ru_RU.png'),
    // );
    let ruImage = await loadImageTemporary(
      'media/map/open-closed-signs.ru_RU.png',
    );
    // ctx.drawImage(ruImage.data, 0, 11, 28, 11, 2, 1, 28, 11);
    ctx.drawImage(ruImage, 0, 11, 28, 11, 2, 1, 28, 11);
    for (let i = 0; i < 4; i++) {
      // ctx.drawImage(ruImage.data, 0, 0, 28, 11, 34 + i * 32, 1, 28, 11);
      ctx.drawImage(ruImage, 0, 0, 28, 11, 34 + i * 32, 1, 28, 11);
    }
    // ruImage.decreaseRef();
  },

  'media/map/jungle-props.png': async (ctx) => {
    if (!sc.ru.shouldPatchSpriteLabels()) return;
    // let ruImage = await sc.ui2.waitForLoadable(
    //   new ig.Image('media/map/jungle-props.ru_RU.png'),
    // );
    let ruImage = await loadImageTemporary('media/map/jungle-props.ru_RU.png');
    ctx.clearRect(361, 118, 6, 19);
    // ctx.drawImage(ruImage.data, 0, 0, 6, 19, 361, 118, 6, 19);
    ctx.drawImage(ruImage, 0, 0, 6, 19, 361, 118, 6, 19);
    // ruImage.decreaseRef();
  },

  'media/map/bergen-trail.png': async (ctx) => {
    if (!sc.ru.shouldPatchSpriteLabels()) return;
    // let innSign = await sc.ui2.waitForLoadable(
    //   new ig.Image('media/map/inn-sign.ru_RU.png'),
    // );
    let innSign = await loadImageTemporary('media/map/inn-sign.ru_RU.png');
    ctx.clearRect(128, 720, 32, 16);
    // ctx.drawImage(innSign.data, 0, 0, 32, 16, 128, 720, 32, 16);
    ctx.drawImage(innSign, 0, 0, 32, 16, 128, 720, 32, 16);
    // innSign.decreaseRef();
  },

  'media/map/bergen-village-inner.png': async (ctx) => {
    if (!sc.ru.shouldPatchSpriteLabels()) return;
    // let innSign = await sc.ui2.waitForLoadable(
    //   new ig.Image('media/map/inn-sign.ru_RU.png'),
    // );
    let innSign = await loadImageTemporary('media/map/inn-sign.ru_RU.png');
    ctx.clearRect(432, 144, 32, 16);
    // ctx.drawImage(innSign.data, 0, 0, 32, 16, 432, 144, 32, 16);
    ctx.drawImage(innSign, 0, 0, 32, 16, 432, 144, 32, 16);
    // innSign.decreaseRef();
  },

  'media/map/rookie-harbor.png': async (ctx) => {
    if (!sc.ru.shouldPatchSpriteLabels()) return;
    let [innSign, ruImage] = await Promise.all([
      // sc.ui2.waitForLoadable(new ig.Image('media/map/inn-sign.ru_RU.png')),
      // sc.ui2.waitForLoadable(new ig.Image('media/map/rookie-harbor.ru_RU.png')),
      loadImageTemporary('media/map/inn-sign.ru_RU.png'),
      loadImageTemporary('media/map/rookie-harbor.ru_RU.png'),
    ]);
    ctx.clearRect(448, 432, 32, 16);
    // ctx.drawImage(innSign.data, 0, 0, 32, 16, 448, 432, 32, 16);
    ctx.drawImage(innSign, 0, 0, 32, 16, 448, 432, 32, 16);
    ctx.clearRect(432, 448, 48, 32);
    // ctx.drawImage(ruImage.data, 0, 0, 48, 32, 432, 448, 48, 32);
    ctx.drawImage(ruImage, 0, 0, 48, 32, 432, 448, 48, 32);
    // innSign.decreaseRef();
    // ruImage.decreaseRef();
  },
};

ig.Image.inject({
  loadInternal(...args) {
    this.parent(...args);
    (this.data as HTMLImageElement).onload = this._patchBeforeOnload.bind(this);
  },

  reload(...args) {
    this.parent(...args);
    (this.data as HTMLImageElement).onload = this._patchBeforeOnload.bind(this);
  },

  async _patchBeforeOnload(...args) {
    this.width = this.data.width;
    this.height = this.data.height;

    let patchFunction = IMAGE_PATCHES[this.path];
    if (patchFunction != null) {
      let context: CanvasRenderingContext2D;

      // TODO: Consider supporting `OffscreenCanvas`. Also consider using
      // `ig.system.getBufferContext`.
      if (this.data instanceof HTMLCanvasElement) {
        context = this.data.getContext('2d')!;
      } else {
        let canvas = ig.$new('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        context = canvas.getContext('2d')!;
        context.drawImage(
          this.data,
          0,
          0,
          this.width,
          this.height,
          0,
          0,
          this.width,
          this.height,
        );
        this.data = canvas;
      }

      let newData = await patchFunction(context, this.data);
      if (newData != null) {
        this.data = newData;
        this.width = newData.width;
        this.height = newData.height;
      }
    }

    this.onload(...args);
  },
});
