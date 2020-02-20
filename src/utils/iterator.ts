export function map<T, U>(
  iterator: Iterator<T>,
  callback: (value: T) => U,
): Iterator<U> {
  return {
    next(...args) {
      let { value, done } = iterator.next(...args);
      return {
        done,
        value: done ? undefined : callback(value),
      } as IteratorResult<U>;
    },
  };
}
