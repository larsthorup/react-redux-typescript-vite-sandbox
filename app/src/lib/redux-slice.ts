import * as R from 'ramda';
import {
  AnyAction,
  ActionCreator,
  createActionCreator,
  PayloadAction
} from './redux-action';

// SliceReducer can be used to type the reducers in a slice
export type SliceReducer<TState, TPayload = void> = (
  state: TState, // Note: state is never undefined
  payload: TPayload // Note: receives payload directly
) => TState;

// SliceReducers is used below to restrict the type of a set of reducers in a slice
type SliceReducers<TState> = {
  [key: string]: SliceReducer<TState, any>;
};

// Reducer is used below to type the "reducer" returned by createSlice()
type Reducer<TState> = (state: TState | undefined, action: AnyAction) => TState;

// SliceConfig can be used to type the parameter to createSlice()
type SliceConfig<TState, TSliceReducers extends SliceReducers<TState>> = {
  name: string;
  initialState: TState;
  reducers: TSliceReducers;
};

// Slice can be used to type the result of createSlice()
type Slice<TState, TSliceReducers extends SliceReducers<TState>> = {
  name: string;
  actions: Actions<TState, TSliceReducers>;
  reducer: Reducer<TState>;
};

// createSlice transforms SliceReducers to Redux-compatible Actions and a Reducer
type CreateSlice = <TState, TSliceReducers extends SliceReducers<TState>>(
  sliceConfig: SliceConfig<TState, TSliceReducers>
) => Slice<TState, TSliceReducers>;
export const createSlice: CreateSlice = sliceConfig => {
  const actions = createActions(sliceConfig);
  const reducer = createReducer(sliceConfig);
  return {
    name: sliceConfig.name,
    actions,
    reducer
  };
};

// Actions is used in Slice to type the "actions" returned by createSlice()
type Actions<TState, TSliceReducers extends SliceReducers<TState>> = {
  [Prop in keyof TSliceReducers]: ActionCreator<
    PayloadParameterTypeOf<TSliceReducers[Prop]>
  >;
};

// PayloadParameterTypeOf is used by Actions to extract the type of the "payload" parameter of a slice reducer
type PayloadParameterTypeOf<
  TSliceReducer extends SliceReducer<any, any>
> = Parameters<TSliceReducer>[1] extends {}
  ? Parameters<TSliceReducer>[1]
  : void;

// createActions() uses createActionCreator() to turn sliceReducers into actions
const createActions = <TState, TSliceReducers extends SliceReducers<any>>(
  sliceConfig: SliceConfig<TState, TSliceReducers>
) => {
  return R.mapObjIndexed(
    (_, key: string) => createActionCreator(`${sliceConfig.name}.${key}`),
    sliceConfig.reducers
  ) as Actions<TState, TSliceReducers>;
};

// createReducer applies the sliceReducer corresponding to the passed in action
const createReducer = <TState, TSliceReducers extends SliceReducers<any>>(
  sliceConfig: SliceConfig<TState, TSliceReducers>
) => {
  const sliceReducerByType = R.fromPairs(
    R.toPairs(sliceConfig.reducers).map(([key, r]: [string, any]) => [
      `${sliceConfig.name}.${key}`,
      r
    ])
  );
  const reducer = (
    state = sliceConfig.initialState,
    action: AnyAction
  ): TState => {
    const sliceReducer = sliceReducerByType[action.type];
    if (sliceReducer) {
      return sliceReducer(state, (action as PayloadAction<any>).payload);
    } else {
      return state;
    }
  };
  return reducer;
};
