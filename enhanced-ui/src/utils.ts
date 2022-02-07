// again, I have to copy the whole type signature, because I can't use names of
// the generics otherwise... well, at least I'll get an error if I update only
// one of the signatures.
sc.ui2.waitForLoadable = <T extends ig.Loadable | ig.SingleLoadable>(loadable: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (loadable.loaded) {
      resolve(loadable);
      return;
    }
    if (loadable.failed) {
      reject(new Error(`Failed to load resource: ${loadable.path}`));
      return;
    }

    let loadingFinished = loadable.loadingFinished as (this: T, success: boolean) => void;
    loadable.loadingFinished = function (this: T, success: boolean): void {
      try {
        loadingFinished.call(this, success);
      } catch (err) {
        reject(err);
        throw err;
      }
      if (success) resolve(loadable);
      else reject(new Error(`Failed to load resource: ${this.path}`));
    };
  });
};

// TODO: explain why this function is needed
// NOTE: I hope I won't need this anytime soon...
sc.ui2.forciblyTriggerResourceLoad = () => {
  if (ig.ready) return;
  ig.mainLoader._loadCallback('FakeResource', `FakeResource/${Math.random()}`, true);
};

ig.module('ultimate-localized-ui.text-gui-utils')
  .requires(
    'impact.base.system',
    'impact.feature.gui.gui',
    'game.feature.gui.base.text',
    'impact.base.font',
    'game.feature.font.font-system',
  )
  .defines(() => {
    sc.ui2.textRecolorDrawCallback = (textBlock, newColor) => {
      let fragment = textBlock.buffer;
      if (fragment.width === 0 || fragment.height === 0) return;
      let scale = ig.system.scale * ig.imageAtlas.scale;
      let imageData = ig.system.context.getImageData(
        fragment.offX,
        fragment.offY,
        fragment.width * scale,
        fragment.height * scale,
      );
      let pixels = imageData.data;
      for (let i = 0, len = imageData.width * imageData.height * 4; i < len; i += 4) {
        if ((pixels[i + 0] > 0 || pixels[i + 1] > 0 || pixels[i + 2] > 0) && pixels[i + 3] > 0) {
          pixels[i + 0] = newColor[0];
          pixels[i + 1] = newColor[1];
          pixels[i + 2] = newColor[2];
        }
      }
      ig.system.context.putImageData(imageData, fragment.offX, fragment.offY);
    };
  });
