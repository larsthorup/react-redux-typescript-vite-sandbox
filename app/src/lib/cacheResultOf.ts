import * as R from 'ramda';

type Selector<TResult> = (...args: any[]) => TResult; // eslint-disable-line @typescript-eslint/no-explicit-any

const cacheResultOf = <TResult>(
  selector: Selector<TResult>
): Selector<TResult> => {
  let cache: TResult | null = null;
  return (...args: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const result: TResult = selector(...args);
    if (cache && R.equals(cache, result)) {
      return cache;
    } else {
      cache = result;
      return result;
    }
  };
};

export default cacheResultOf;
