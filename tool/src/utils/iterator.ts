export function* empty(): Generator<void> {}

export function* once<T>(value: T): Generator<T> {
  yield value;
}

export function* counter(count: number): Generator<number> {
  for (let i = 0; i < count; i++) {
    yield i;
  }
}

export function* enumerate<T>(iterable: Iterable<T>): Generator<[number, T]> {
  let index = 0;
  for (let element of iterable) {
    yield [index, element];
    index++;
  }
}

export function* map<T, U>(iterable: Iterable<T>, callback: (value: T) => U): Generator<U> {
  for (let element of iterable) {
    yield callback(element);
  }
}
