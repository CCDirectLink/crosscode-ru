export interface Fetcher<T> {
  total: number;
  iterator: Iterator<PromiseLike<T>>;
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function limitConcurrency(
  promises: Iterator<PromiseLike<void>>,
  threads: number,
): Promise<void> {
  let iteratorFinished = false;

  async function next(): Promise<null> {
    if (iteratorFinished) return null;
    let result = promises.next();
    if (result.done) {
      iteratorFinished = true;
      return null;
    }
    return result.value.then(() => next());
  }

  let threadPromises = [];
  for (let i = 0; i < threads; i++) {
    let promise = next();
    if (iteratorFinished) break;
    threadPromises.push(promise);
  }
  await Promise.all(threadPromises);
}
