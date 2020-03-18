export function map<T, U>(
  iterator: Iterator<T>,
  callback: (value: T) => U,
): Iterator<U> {
  return {
    next(...args): IteratorResult<U> {
      let { value, done } = iterator.next(...args);
      return {
        done,
        // eslint-disable-next-line no-undefined
        value: done ? undefined : callback(value),
      } as IteratorResult<U>;
    },
  };
}
