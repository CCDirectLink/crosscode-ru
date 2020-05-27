export function map<T, U>(
  iterator: Iterator<T>,
  callback: (value: T) => U,
): Iterator<U> {
  return {
    next(...args): IteratorResult<U> {
      let result = iterator.next(...args);
      return {
        done: result.done,
        // eslint-disable-next-line no-undefined
        value: result.done ? undefined : callback(result.value),
      } as IteratorResult<U>;
    },
  };
}
