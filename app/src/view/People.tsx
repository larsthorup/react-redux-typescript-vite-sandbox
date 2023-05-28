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
import {
  Person,
  default as person,
  default as personSlice,
} from "../store/person";
import {
  PersonInfo,
  selectNextRows,
  selectPeople,
  selectPersonSummary,
} from "../store/personSelector";
import TextField from "./TextField";

const PeopleTable: React.FC = () => {
  const dispatch = useDispatch();
  const [sortOrder, setSortOrder] = useState({
    columnName: "name",
    direction: "asc",
  } as TableSortOrder);
  const { isRunning, isCompleted } = useAsyncEffect(async () => {
    // Note: simulate server request
    await new Promise((resolve) => setTimeout(resolve, 100));
    dispatch(
      person.actions.setPeople({
        "1": { id: "1", name: "Adam", birthDate: "2012" },
        "2": { id: "2", name: "Susan", birthDate: "1994" },
        "3": { id: "3", name: "Joey", birthDate: "1966" },
        "4": { id: "4", name: "Ronja", birthDate: "1977" },
      })
    );
  });
  const addOnePerson = () => {
    const newPerson: Person = {
      id: "dummy",
      name: "Unnamed",
      birthDate: "2023",
    };
    dispatch(person.actions.addPeople([newPerson]));
  };
  const addManyPeople = () => {
    const manyPeople = 
      R.range(0, 1000)
        .map((i) => {
          const id = "dummy";
          const name = btoa(Math.random().toString()).substring(14, 20);
          const birthDate = Math.trunc(Math.random() * 50 + 1950).toString();
          return { id, name, birthDate };
        });
    dispatch(person.actions.addPeople(manyPeople));
  };
  const rowOptions: TableRowOptions<string, PersonInfo> = {
    editor: (onClose, id) => <PersonEditForm id={id} onClose={onClose} />,
    label: (id, i, person) => person.name,
    onSelected: (id, selected) =>
      dispatch(person.actions.selectPerson({ id, selected })),
    useData: (id) => useSelector((state) => selectPeople(state)[id]),
    useDataSummary: () => useSelector(selectPersonSummary),
    useSelected: (id) =>
      useSelector((state) => !!selectPeople(state)[id].selected),
    useNextRow: (previousRow) => useSelector((state) => selectNextRows(state)[previousRow || '']),
  };
  const columns: TableColumn<string, PersonInfo>[] = [
    {
      isSelectColumn: true,
      cellSummary: () => "Average",
    },
    {
      name: "name",
      title: "Name",
      isSortable: true,
      cell: (id, i, person) => person.name,
    },
    {
      name: "age",
      title: "Age",
      type: "number",
      isSortable: true,
      cell: (id, i, person) => person.age,
      cellSummary: (personSummary) => personSummary.age,
    },
    { isEditColumn: true },
  ];
  return (
    <>
      {isRunning && <p>Loading...</p>}
      {isCompleted && (
        <Table
          columns={columns}
          rowOptions={rowOptions}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
      )}
      <button onClick={() => dispatch(historyBack())}>Back</button>
      <button onClick={addOnePerson}>Add one more</button>
      <button onClick={addManyPeople}>Add many more</button>
    </>
  );
};

const PersonEditForm: React.FC<{ id: string; onClose: () => void }> = ({
  id,
  onClose,
}) => {
  const dispatch = useDispatch();
  const person = useSelector((state) => state.person[id]);
  const birthDateChangeHandler = (birthDate: string) => {
    dispatch(personSlice.actions.updateBirthDate({ id, birthDate }));
  };
  const nameChangeHandler = (name: string) => {
    dispatch(personSlice.actions.updateName({ id, name }));
  };
  return (
    <>
      <TextField
        label="name"
        value={person.name}
        onChange={nameChangeHandler}
      />
      <TextField
        label="date of birth"
        value={person.birthDate}
        onChange={birthDateChangeHandler}
      />
      <button onClick={onClose}>{`Close ${person.name}`}</button>
    </>
  );
};

export default PeopleTable;
