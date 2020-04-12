declare namespace sc.ru {
  function waitForLoadable<T extends ig.Loadable>(loadable: T): Promise<T>;
}
