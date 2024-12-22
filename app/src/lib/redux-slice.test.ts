import { expect } from "chai";
import * as Redux from "redux";
import { createSlice, SliceReducer } from "../lib/redux-slice";

type User = {
  name: string;
};

type AuthState = Readonly<{
  user: User | null;
}>;

describe("redux-slice", () => {
  it("createSlice", () => {
    // Given a store with a slice
    const initialState = {
      user: null,
    } as AuthState;
    const signin: SliceReducer<AuthState, { user: User }> = (
      state,
      { user }
    ) => {
      return { ...state, user };
    };
    const signout: SliceReducer<AuthState> = (state) => {
      return { ...state, user: null };
    };
    const slice = createSlice({
      name: "auth",
      initialState,
      reducers: {
        signin,
        signout,
      },
    });
    const rootReducer = Redux.combineReducers({
      auth: slice.reducer,
    });
    const store = Redux.createStore(rootReducer);
    const { dispatch, getState } = store;

    // Initially, slice state is initial state
    expect(getState().auth.user).to.be.null; // eslint-disable-line @typescript-eslint/no-unused-expressions

    // When dispatching an action
    dispatch(slice.actions.signin({ user: { name: "Lars" } }));

    // Then, slice state has updated accordingly
    expect(getState().auth.user).to.deep.equal({ name: "Lars" });

    // When dispatching another action
    dispatch(slice.actions.signout());

    // Then, slice state has updated accordingly
    expect(getState().auth.user).to.be.null; // eslint-disable-line @typescript-eslint/no-unused-expressions
  });
});
