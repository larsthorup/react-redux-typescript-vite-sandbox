import * as Redux from 'redux';
import * as ReduxThunk from 'redux-thunk';

export type Saga<TState, TArg = void, TResult = void> = (
  args: TArg
) => ReduxThunk.ThunkAction<
  Promise<TResult>,
  TState,
  unknown,
  Redux.Action<string>
>;
