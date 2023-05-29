import * as R from "ramda";
import React, { useState } from "react";
import Table, {
  TableColumn,
  TableRowOptions,
  TableSortOrder,
} from "../lib/react-table";
import { historyBack } from "../lib/redux-history";
import useAsyncEffect from "../lib/useAsyncEffect";
import { useDispatch, useSelector } from "../store";
import { default as task, default as taskSlice } from "../store/task";
import {
  TaskInfo,
  selectTaskIdList,
  selectTaskSummary,
  selectTasks,
} from "../store/taskSelector";

const initialTasks = {
  "1": { id: "1", title: "Swim", dueDate: "2023-04-01", completed: true },
  "2": { id: "2", title: "Play", dueDate: "2023-04-05" },
  "3": { id: "3", title: "Work", dueDate: "2023-04-02", completed: true },
  "4": { id: "4", title: "Sleep", dueDate: "2023-04-09" },
};

const manyTasks = Object.fromEntries(
  R.range(10, 10000)
    .map((i) => i.toString())
    .map((id) => {
      const title = btoa(Math.random().toString()).substring(14, 20);
      const dueDate = `2023-04-${Math.trunc(Math.random() * 28 + 1)}`;
      return [id, { id, title, dueDate }];
    })
);

const TaskTable: React.FC = () => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [sortOrder, setSortOrder] = useState({
    columnName: "title",
    direction: "asc",
  } as TableSortOrder);
  const taskIdList = useSelector((state) =>
    selectTaskIdList(state, { sortOrder })
  );
  const { isRunning, isCompleted } = useAsyncEffect(async () => {
    // Note: simulate server request
    await new Promise((resolve) => setTimeout(resolve, 10));
    dispatch(task.actions.addTasks(initialTasks));
  });
  const addManyTasks = () => {
    dispatch(task.actions.addTasks(manyTasks));
  };
  const rows = taskIdList;
  const rowOptions: TableRowOptions<typeof rows[0], TaskInfo> = {
    label: (id, i, person) => person.title,
    onSelected: (id, selected) =>
      dispatch(task.actions.selectTask({ id, selected })),
    useData: (id) => useSelector((state) => selectTasks(state)[id]),
    useDataSummary: () => useSelector(selectTaskSummary),
    useSelected: (id) =>
      useSelector((state) => !!selectTasks(state)[id].selected),
  };
  const columns: TableColumn<typeof rows[0], TaskInfo>[] = [
    {
      isSelectColumn: true,
      cellSummary: () => "Average age",
    },
    {
      name: "title",
      title: "Title",
      isSortable: true,
      cell: (id, i, { title }) =>
        isEditing ? (
          <input
            placeholder="title"
            value={title}
            onChange={(ev) =>
              dispatch(
                taskSlice.actions.updateTitle({ id, title: ev.target.value })
              )
            }
          />
        ) : (
          title
        ),
    },
    {
      name: "completed",
      title: "Completed?",
      isSortable: true,
      cell: (id, i, { completed }) =>
        isEditing ? (
          <input
            type="checkbox"
            checked={completed}
            onChange={(ev) =>
              dispatch(
                taskSlice.actions.completeTask({
                  id,
                  completed: ev.target.checked,
                })
              )
            }
          />
        ) : completed ? (
          "✓"
        ) : (
          ""
        ),
    },
    {
      name: "dueDate",
      title: "Due",
      type: "number",
      isSortable: true,
      cell: (id, i, { dueDate }) =>
        isEditing ? (
          <input
            value={dueDate}
            onChange={(ev) =>
              dispatch(
                taskSlice.actions.updateDueDate({
                  id,
                  dueDate: ev.target.value,
                })
              )
            }
          />
        ) : (
          dueDate
        ),
      cellSummary: (personSummary) => personSummary.age,
    },
  ];
  const onSave = () => {
    setIsEditing(false);
    // Note: should also post the data to server and refetch
  };
  const onCancel = () => {
    setIsEditing(false);
    // Note: reset edited tasks back to what was initially fetched
    const isMany = taskIdList.length > Object.keys(initialTasks).length;
    dispatch(taskSlice.actions.setTasks(initialTasks));
    if (isMany) {
      dispatch(taskSlice.actions.addTasks(manyTasks));
    }
  };
  return (
    <>
      {isRunning && <p>Loading...</p>}
      {isCompleted && (
        <>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          ) : (
            <span>
              <button onClick={onSave}>Save</button>
              <button onClick={onCancel}>Cancel</button>
            </span>
          )}
          <Table
            columns={columns}
            rows={rows}
            rowOptions={rowOptions}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
          {/* <SimpleTable /> */}
        </>
      )}
      <button onClick={() => dispatch(historyBack())}>Back</button>
      <button onClick={addManyTasks}>Add many more</button>
    </>
  );
};

export default TaskTable;
