import React, { useState } from 'react';
import { useSelector, useDispatch } from '../store';
import personSlice from '../store/person';
import {
  selectPeopleId,
  selectPersonSummary,
  selectPeople,
  PersonInfo,
} from '../store/personSelector';
import Table, {
  TableColumn,
  TableRowOptions,
  TableSortOrder,
} from '../lib/react-table';
import { historyBack } from '../lib/redux-history';
import useAsyncEffect from '../lib/useAsyncEffect';
import person from '../store/person';
import TextField from './TextField';

const PeopleTable: React.FC = () => {
  const dispatch = useDispatch();
  const [sortOrder, setSortOrder] = useState({
    columnName: 'name',
    direction: 'asc',
  } as TableSortOrder);
  const personIdList = useSelector((state) =>
    selectPeopleId(state, { sortOrder })
  );
  const { isRunning, isCompleted } = useAsyncEffect(async () => {
    // Note: simulate server request
    await new Promise((resolve) => setTimeout(resolve, 100));
    dispatch(
      person.actions.addPeople({
        '1': { id: '1', name: 'Adam', birthDate: '2012' },
        '2': { id: '2', name: 'Susan', birthDate: '1994' },
        '3': { id: '3', name: 'Joey', birthDate: '1966' },
        '4': { id: '4', name: 'Ronja', birthDate: '1977' },
      })
    );
  });
  const rows = personIdList;
  const rowOptions: TableRowOptions<typeof rows[0], PersonInfo> = {
    editor: (onClose, id) => <PersonEditForm id={id} onClose={onClose} />,
    label: (id, i, person) => person.name,
    onSelected: (id, selected) =>
      dispatch(person.actions.selectPerson({ id, selected })),
    useData: (id) => useSelector((state) => selectPeople(state)[id]),
    useDataSummary: () => useSelector(selectPersonSummary),
    useSelected: (id) =>
      useSelector((state) => !!selectPeople(state)[id].selected),
  };
  const columns: TableColumn<typeof rows[0], PersonInfo>[] = [
    {
      isSelectColumn: true,
      cellSummary: () => 'Average',
    },
    {
      name: 'name',
      title: 'Name',
      isSortable: true,
      cell: (id, i, person) => person.name,
    },
    {
      name: 'age',
      title: 'Age',
      type: 'number',
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
          rows={rows}
          rowOptions={rowOptions}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
      )}
      <button onClick={() => dispatch(historyBack())}>Back</button>
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
