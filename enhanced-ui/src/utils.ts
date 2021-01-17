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
