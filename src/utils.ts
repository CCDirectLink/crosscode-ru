sc.ru.waitForLoadable = loadable => {
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
};
