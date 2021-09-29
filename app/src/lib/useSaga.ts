import { useState } from 'react';

import { Saga } from './redux-saga';

// Note: based loosely on https://react-query.tanstack.com/docs/api#usemutation

type SagaState<TResult> = {
  data: TResult | undefined;
  error: Error | null;
  isRunning: boolean;
  isCompleted: boolean;
};

const useSaga = <TState, TArg, TResult>(
  saga: Saga<TState, TArg, TResult>,
  options?: { throwOnError?: boolean }
): [Saga<TState, TArg, TResult | undefined>, SagaState<TResult>] => {
  const [state, setState] = useState({
    data: undefined,
    error: null,
    isRunning: false,
    isCompleted: false,
  } as SagaState<TResult>);
  const instrumentedSaga: Saga<TState, TArg, TResult | undefined> = (
    arg: TArg
  ) => async (dispatch, getState, extra) => {
    setState({
      ...state,
      isRunning: true,
      isCompleted: false,
      error: null,
    });
    try {
      const data = await saga(arg)(dispatch, getState, extra);
      setState({
        ...state,
        data,
        isRunning: false,
        isCompleted: true,
      });
      return data;
    } catch (error: any) {
      setState({
        ...state,
        error: error instanceof Error ? error : new Error(error.toString()),
        isRunning: false,
      });
      if (options?.throwOnError) throw error;
    }
  };
  return [instrumentedSaga, state];
};

export default useSaga;
