export function* enumerate<T>(iterable: Iterable<T>): Generator<[number, T]> {
  let index = 0;
  for (let element of iterable) {
    yield [index, element];
    index++;
  }
}
