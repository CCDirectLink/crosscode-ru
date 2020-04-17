type MaybePromise<T> = T | Promise<T>;
type Dictionary<T> = { [key: string]: T };
type NullablePartial<T> = { [P in keyof T]?: T[P] | null };
