export type UnwrapPromise<T> = T extends PromiseLike<infer U> ? U : T;

export type OptionalPromise<T> = Promise<T> | T;
