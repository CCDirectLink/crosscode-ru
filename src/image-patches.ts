function waitForLoadable<T extends ig.Loadable>(loadable: T): Promise<T> {
  return new Promise((resolve, reject) => {
    if (loadable.loaded) {
      resolve(loadable);
      return;
    }

    let { loadingFinished } = loadable;
    loadable.loadingFinished = function(success: boolean): void {
      try {
        loadingFinished.call(this, success);
      } catch (err) {
        reject(err);
      }
      if (success) resolve(loadable);
      else reject(new Error(`Failed to load resource: ${this.path}`));
    };
  });
}

type MaybePromise<T> = T | Promise<T>;
type ImagePatchFunction = (
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) => MaybePromise<void | null | ig.Image.Data>;

const PATCHES: { [path: string]: ImagePatchFunction } = {
  'media/entity/objects/history-of-bergen.png': async ctx => {
    if (ig.currentLang !== 'ru_RU') return;
    let ruImage = await waitForLoadable(
      new ig.Image('media/entity/objects/history-of-bergen.ru_RU.png'),
    );
    ctx.clearRect(183, 15, 28, 5);
    ctx.clearRect(187, 21, 24, 1);
    ctx.drawImage(ruImage.data, 0, 0, 21, 7, 187, 15, 21, 7);
  },

  'media/map/jungle-props.png': async ctx => {
    if (ig.currentLang !== 'ru_RU') return;
    let ruImage = await waitForLoadable(
      new ig.Image('media/map/jungle-props.ru_RU.png'),
    );
    ctx.clearRect(361, 118, 6, 19);
    ctx.drawImage(ruImage.data, 0, 0, 6, 19, 361, 118, 6, 19);
  },

  'media/map/bergen-trail.png': async ctx => {
    if (ig.currentLang !== 'ru_RU') return;
    let innSign = await waitForLoadable(
      new ig.Image('media/map/inn-sign.ru_RU.png'),
    );
    ctx.clearRect(128, 720, 32, 16);
    ctx.drawImage(innSign.data, 0, 0, 32, 16, 128, 720, 32, 16);
  },

  'media/map/bergen-village-inner.png': async ctx => {
    if (ig.currentLang !== 'ru_RU') return;
    let innSign = await waitForLoadable(
      new ig.Image('media/map/inn-sign.ru_RU.png'),
    );
    ctx.clearRect(432, 144, 32, 16);
    ctx.drawImage(innSign.data, 0, 0, 32, 16, 432, 144, 32, 16);
  },

  'media/map/rookie-harbor.png': async ctx => {
    if (ig.currentLang !== 'ru_RU') return;
    let innSign = await waitForLoadable(
      new ig.Image('media/map/inn-sign.ru_RU.png'),
    );
    ctx.clearRect(448, 432, 32, 16);
    ctx.drawImage(innSign.data, 0, 0, 32, 16, 448, 432, 32, 16);
  },
};

export default function initImagePatches(): void {
  ig.Image.inject({
    async onload(...args) {
      let oldOnload = this.parent;

      this.width = this.data.width;
      this.height = this.data.height;

      let patchFunction = PATCHES[this.path];
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

      oldOnload.apply(this, args);
    },
  });
}
