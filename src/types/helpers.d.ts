type ReplaceThisParameter<T, U> = unknown extends ThisParameterType<T>
  ? T
  : T extends (...args: infer A) => infer R
  ? (this: U, ...args: A) => R
  : T;

type NullablePartial<T> = {
  [P in keyof T]?: T[P] | null | undefined;
};
