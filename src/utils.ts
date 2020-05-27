// why the hell do I have to copy the entire signature, TypeScript?
sc.ru.objectFromEntries = <K extends PropertyKey = PropertyKey, T = unknown>(
  entries: ReadonlyArray<readonly [K, T]>,
): Record<K, T> =>
  entries.reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {} as Record<K, T>); // eslint-disable-line @typescript-eslint/prefer-reduce-type-parameter

sc.ru.insertAfterOrAppend = (array, beforeIndex, ...items) => {
  if (beforeIndex >= 0) array.splice(beforeIndex + 1, 0, ...items);
  else array.push(...items);
};
