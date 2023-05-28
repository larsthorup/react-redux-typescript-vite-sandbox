import * as R from "ramda";
import { createSlice, SliceReducer } from "../lib/redux-slice";

export type Person = {
  id: string;
  name: string;
  birthDate: string;
  selected?: boolean;
};

export type PersonState = Readonly<{ [id: string]: Person }>;

type PersonReducer<TPayload> = SliceReducer<PersonState, TPayload>;

const initialState: PersonState = {};

const addPerson: PersonReducer<Person> = (state, person) => {
  const id = (Object.keys(state).length + 1).toString()
  return {
    ...state,
    ...{ [id]: {...person, id} },
  };
};

const addPeople: PersonReducer<{ [id: string]: Person }> = (state, people) => {
  return {
    ...state,
    ...people,
  };
};

const selectPerson: PersonReducer<{ id: string | null; selected: boolean }> = (
  state,
  { id, selected }
) => {
  if (id === null) {
    return R.mapObjIndexed((person) => ({ ...person, selected }), state);
  } else {
    return {
      ...state,
      [id]: {
        ...state[id],
        selected,
      },
    };
  }
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
  name: "person",
  initialState,
  reducers: {
    addPeople,
    addPerson,
    selectPerson,
    updateBirthDate,
    updateName,
  },
});
