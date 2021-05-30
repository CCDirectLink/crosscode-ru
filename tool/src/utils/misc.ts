export function hasKey<
  K extends PropertyKey,
  // `{}` in TypeScript means "any non-nullish value"
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends {} = {},
>(obj: T, key: K): obj is T & { [k in K]: unknown } {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function getValueByPath(obj: unknown, path: Array<string | number>): unknown {
  for (let key of path) {
    if (isObject(obj) && hasKey(obj, key)) {
      obj = obj[key];
    } else {
      // TODO: arrrgghhh, goddammit... for now I'm following the JS convention
      // of silently ignoring errors, have to come up with a better solution
      // here, e.g. throwing an exception or returning a `Maybe`-style object.
      return undefined; // eslint-disable-line no-undefined
    }
  }
  return obj;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isObject(value: unknown): value is {} {
  // eslint-disable-next-line eqeqeq
  return typeof value === 'object' && value !== null;
}

// A small wrapper to avoid `any` contamination.
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function mapGetOrInsert<K, V>(map: Map<K, V>, key: K, defaultValue: V): V {
  if (map.has(key)) {
    return map.get(key)!;
  } else {
    map.set(key, defaultValue);
    return defaultValue;
  }
}

export function objectToMap<K extends PropertyKey, V>(obj: Record<K, V>): Map<K, V> {
  let map = new Map();
  for (let k in obj) {
    if (hasKey(obj, k)) {
      map.set(k, obj[k]);
    }
  }
  return map;
}

export function mapToObject<K extends PropertyKey, V>(map: Map<K, V>): Record<K, V> {
  let obj = {} as Record<K, V>;
  for (let [k, v] of map) {
    obj[k] = v;
  }
  return obj;
}

export function* objectIterator<K extends PropertyKey, V>(obj: Record<K, V>): Generator<[K, V]> {
  for (let k in obj) {
    if (hasKey(obj, k)) {
      yield [k, obj[k]];
    }
  }
}
