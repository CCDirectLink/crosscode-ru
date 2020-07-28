type MaybePromise<T> = T | Promise<T>;
type NullablePartial<T> = { [P in keyof T]?: T[P] | null };
