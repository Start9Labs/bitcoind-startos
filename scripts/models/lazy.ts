const NOT_COMPUTED = Symbol("not_computed");
type Once<T> = () => T;
function once<T>(val: () => T) {
  let computed: unknown = NOT_COMPUTED;
  return (() => {
    if (computed === NOT_COMPUTED) {
      computed = val();
    }
    return computed;
  }) as Once<T>;
}
function lazy_primative<T>(val: () => T): Lazy<T> {
  return {
    val,
    map(next) {
      return lazy(() => next(val()));
    },
  };
}

export type Lazy<T> = {
  val(): T;
  map<U>(fn: (t: T) => U): Lazy<U>;
};
export const lazy = <T>(x: () => T) => lazy_primative(once(x));
