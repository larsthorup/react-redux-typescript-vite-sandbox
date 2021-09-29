import { useCallback } from 'react';

import useSaga from './useSaga';

const useAsync = <TArg = void, TResult = void>(
  fn: (arg: TArg) => Promise<TResult | undefined>
): [
  (arg: TArg) => Promise<TResult | undefined>,
  {
    data: TResult | undefined;
    error: Error | null;
    isRunning: boolean;
    isCompleted: boolean;
  }
] => {
  // Note: wrap in saga
  const [instrumentedSaga, { data, error, isRunning, isCompleted }] = useSaga(
    (arg: TArg) => async () => {
      return fn(arg);
    }
  );
  // Note: unwrap from saga
  const instrumentedFn = useCallback(
    (arg: TArg) => {
      return (instrumentedSaga(arg) as () => Promise<TResult | undefined>)();
    },
    [instrumentedSaga]
  );
  return [instrumentedFn, { data, error, isRunning, isCompleted }];
};

export default useAsync;
