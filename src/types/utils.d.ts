type MaybePromise<T> = T | Promise<T>;
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Dictionary<T> = { [key: string]: T };
type NullablePartial<T> = { [P in keyof T]?: T[P] | null };
