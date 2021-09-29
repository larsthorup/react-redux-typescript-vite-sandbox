import { createSlice, SliceReducer } from '../lib/redux-slice';

export type Person = {
  id: string;
  name: string;
  birthDate: string;
  selected?: boolean;
};

export type PersonState = Readonly<{ [id: string]: Person }>;

type PersonReducer<TPayload> = SliceReducer<PersonState, TPayload>;

const initialState: PersonState = {};

const addPeople: PersonReducer<{ [id: string]: Person }> = (state, people) => {
  return {
    ...state,
    ...people,
  };
};

const selectPerson: PersonReducer<{ id: string; selected: boolean }> = (
  state,
  { id, selected }
) => {
  return {
    ...state,
    [id]: {
      ...state[id],
      selected,
    },
  };
};

const updateBirthDate: PersonReducer<{ id: string; birthDate: string }> = (
  state,
  { id, birthDate }
) => {
  return {
    ...state,
    [id]: {
      ...state[id],
      birthDate,
    },
  };
};

const updateName: PersonReducer<{ id: string; name: string }> = (
  state,
  { id, name }
) => {
  return {
    ...state,
    [id]: {
      ...state[id],
      name,
    },
  };
};

export default createSlice({
  name: 'person',
  initialState,
  reducers: {
    addPeople,
    selectPerson,
    updateBirthDate,
    updateName,
  },
});
