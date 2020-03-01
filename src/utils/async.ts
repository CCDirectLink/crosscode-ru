export interface Fetcher<T> {
  total: number;
  iterator: Iterator<PromiseLike<T>>;
}

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export async function limitConcurrency(
  promises: Iterator<PromiseLike<any>>,
  threads: number,
): Promise<void> {
  let iteratorFinished = false;

  function next(): PromiseLike<any> | null {
    if (iteratorFinished) return null;
    let { done, value } = promises.next();
    if (done) {
      iteratorFinished = true;
      return null;
    }
    return (value as PromiseLike<any>).then(() => next());
  }

  let threadPromises = [];
  for (let i = 0; i < threads; i++) {
    let promise = next();
    if (iteratorFinished) break;
    threadPromises.push(promise!);
  }
  await Promise.all(threadPromises);
}
