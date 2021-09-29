import * as R from 'ramda';

type Selector<TResult> = (...args: any[]) => TResult;

const cacheResultOf = <TResult>(
  selector: Selector<TResult>
): Selector<TResult> => {
  let cache: TResult | null = null;
  return (...args: any[]) => {
    const result: TResult = selector.apply(null, args);
    if (cache && R.equals(cache, result)) {
      return cache;
    } else {
      cache = result;
      return result;
    }
  };
};

export default cacheResultOf;
