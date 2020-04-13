// why the hell do I have to copy the entire signature, TypeScript?
sc.ru.objectFromEntries = <K extends PropertyKey = PropertyKey, T = unknown>(
  entries: ReadonlyArray<readonly [K, T]>,
): Record<K, T> =>
  entries.reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {} as Record<K, T>);

sc.ru.insertAfterOrAppend = (array, beforeIndex, ...items) => {
  if (beforeIndex >= 0) array.splice(beforeIndex + 1, 0, ...items);
  else array.push(...items);
};

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
