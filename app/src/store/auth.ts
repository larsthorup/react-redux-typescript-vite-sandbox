import { createSlice, SliceReducer } from '../lib/redux-slice';

export type User = {
  name: string;
};

export type AuthState = Readonly<{
  user: User | null;
}>;

type AuthReducer<TPayload = void> = SliceReducer<AuthState, TPayload>;

const initialState: AuthState = {
  user: null
};

const changeUserName: AuthReducer<{ name: string }> = (state, { name }) => {
  return {
    ...state,
    user: {
      ...state.user,
      name
    }
  };
};

const signin: AuthReducer<{ user: User }> = (state, { user }) => {
  return { ...state, user };
};

const signout: AuthReducer = state => {
  return { ...state, user: null };
};

export default createSlice({
  name: 'auth',
  initialState,
  reducers: {
    changeUserName,
    signin,
    signout
  }
});
