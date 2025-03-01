import * as R from "ramda";
import { createSelector } from "reselect";
import { RootState, Selector, useSelector } from ".";
import { TableSortOrder } from "../lib/react-table";
import { Task } from "./task";

export const selectTaskIdList = createSelector(
  (state: RootState) => state.task,
  (_: RootState, { sortOrder }: { sortOrder: TableSortOrder }) => sortOrder,
  (taskSet, sortOrder) => {
    const taskListUnsorted = Object.values(taskSet);
    const taskListSorted = R.sortBy(
      (p) => (sortOrder.columnName === "title" ? p.title : p.dueDate),
      taskListUnsorted
    );
    const taskList =
      sortOrder.direction === "asc" ? taskListSorted : taskListSorted.reverse();
    return taskList.map((p) => p.id);
  },
  {
    memoizeOptions: {
      // Note: return same array if equal
      resultEqualityCheck: R.equals,
    },
  }
);

const ageOf = (date: string) => {
  return Math.trunc((Date.now() - Date.parse(date)) / (24 * 60 * 60 * 1000));
};

export type TaskInfo = Task & {
  age: number;
};

export const selectTasks = (state: RootState) => state.task;

export const selectTaskInfo = createSelector(
  (state: RootState, id: string) => state.task[id],
  (task) => {
    return {
      ...task,
      age: ageOf(task.dueDate),
    };
  }
)

export const selectTaskSummary: Selector<TaskInfo> = createSelector(
  selectTasks,
  (taskSet) => {
    const idList = Object.keys(taskSet);
    return {
      id: "",
      title: "",
      dueDate: "",
      age: idList.reduce((sum, id) => sum + ageOf(taskSet[id].dueDate), 0) / idList.length,
    };
  }
);

export function useTaskInfo(id: string) {
  return useSelector((state) => selectTaskInfo(state, id));
}

export function useTaskSummary() {
  return useSelector(selectTaskSummary);
}

export function useIsTaskSelected(id: string) {
  return useSelector((state) => !!selectTasks(state)[id].selected);
}