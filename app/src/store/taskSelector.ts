import * as R from "ramda";
import { createSelector } from "reselect";
import { createObjectSelector } from "reselect-map";
import { RootState, Selector } from ".";
import cacheResultOf from "../lib/cacheResultOf";
import { TableSortOrder } from "../lib/react-table";
import { Task } from "./task";

const selectTaskIdListUncached = createSelector(
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
  }
);
export const selectTaskIdList = cacheResultOf(selectTaskIdListUncached);

const ageOf = (date: string) => {
  return Math.trunc((Date.now() - Date.parse(date)) / (24 * 60 * 60 * 1000));
};

export type TaskInfo = Task & {
  age: number;
};

export const selectTasks = createObjectSelector(
  (state: RootState) => state.task,
  (task) => {
    return {
      ...task,
      age: ageOf(task.dueDate),
    };
  }
) as unknown as Selector<{ [id: string]: TaskInfo }>; // TODO: fix type of createObjectSelector

export const selectTaskSummary: Selector<TaskInfo> = createSelector(
  selectTasks,
  (taskSet) => {
    const idList = Object.keys(taskSet);
    return {
      id: "",
      title: "",
      dueDate: "",
      age: idList.reduce((sum, id) => sum + taskSet[id].age, 0) / idList.length,
    };
  }
);
