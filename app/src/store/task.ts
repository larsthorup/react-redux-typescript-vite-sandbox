import { createSlice, SliceReducer } from "../lib/redux-slice";

export type Task = {
  id: string;
  title: string;
  dueDate: string;
  completed?: boolean;
  selected?: boolean;
};

export type TaskState = Readonly<{ [id: string]: Task }>;

type TaskReducer<TPayload> = SliceReducer<TaskState, TPayload>;

const initialState: TaskState = {};

const addTasks: TaskReducer<{ [id: string]: Task }> = (state, tasks) => {
  return {
    ...state,
    ...tasks,
  };
};

const setTasks: TaskReducer<{ [id: string]: Task }> = (state, tasks) => {
  return {
    ...tasks,
  };
};

const completeTask: TaskReducer<{ id: string; completed: boolean }> = (
  state,
  { id, completed }
) => {
  return {
    ...state,
    [id]: {
      ...state[id],
      completed,
    },
  };
};

const selectTask: TaskReducer<{ id: string; selected: boolean }> = (
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
const updateDueDate: TaskReducer<{ id: string; dueDate: string }> = (
  state,
  { id, dueDate }
) => {
  return {
    ...state,
    [id]: {
      ...state[id],
      dueDate,
    },
  };
};

const updateTitle: TaskReducer<{ id: string; title: string }> = (
  state,
  { id, title }
) => {
  return {
    ...state,
    [id]: {
      ...state[id],
      title,
    },
  };
};

export default createSlice({
  name: "task",
  initialState,
  reducers: {
    addTasks,
    setTasks,
    completeTask,
    selectTask,
    updateDueDate,
    updateTitle,
  },
});
