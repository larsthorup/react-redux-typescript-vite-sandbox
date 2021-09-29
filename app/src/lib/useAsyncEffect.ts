import { useEffect } from 'react';

import useAsync from './useAsync';

const useAsyncEffect = <TArg = void, TResult = void>(
  fn: () => Promise<TResult | undefined>
): {
  data: TResult | undefined;
  error: Error | null;
  isRunning: boolean;
  isCompleted: boolean;
} => {
  const [fnAsync, { data, error, isRunning, isCompleted }] = useAsync(fn);
  useEffect(() => {
    if (!isCompleted && !isRunning && !error) {
      fnAsync();
    }
  }, [error, isCompleted, isRunning, fnAsync]);
  return { data, error, isRunning, isCompleted };
};

export default useAsyncEffect;
