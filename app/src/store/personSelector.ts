import * as R from "ramda";
import { createSelector } from "reselect";
import { createObjectSelector } from "reselect-map";
import { RootState, Selector } from ".";
import cacheResultOf from "../lib/cacheResultOf";
import { TableSortOrder } from "../lib/react-table";
import { Person } from "./person";

const selectPeopleIdUncached = createSelector(
  (state: RootState) => state.person,
  (_: RootState, { sortOrder }: { sortOrder: TableSortOrder }) => sortOrder,
  (personSet, sortOrder) => {
    // console.log('selectPeopleId');
    const personListUnsorted = Object.values(personSet);
    const personListSorted = R.sortBy(
      (p) => (sortOrder.columnName === "name" ? p.name : p.birthDate),
      personListUnsorted
    );
    const personList =
      sortOrder.direction === "asc"
        ? personListSorted
        : personListSorted.reverse();
    return personList.map((p) => p.id);
  }
);
// TODO as Selector<string[]>
export const selectPeopleId = cacheResultOf(selectPeopleIdUncached);

const ageOf = (date: string) => {
  // console.log(date);
  return Math.trunc(
    (Date.now() - Date.parse(date)) / (24 * 60 * 60 * 1000 * 365)
  );
};

export type PersonInfo = Person & {
  age: number;
};

export const selectPeople = createObjectSelector(
  (state: RootState) => state.person,
  (person) => {
    // console.log('selectPeople', person);
    return {
      ...person,
      age: ageOf(person.birthDate),
    };
  }
) as unknown as Selector<{ [id: string]: PersonInfo }>; // TODO: fix type of createObjectSelector

export const selectPersonSummary: Selector<PersonInfo> = createSelector(
  selectPeople,
  (personSet) => {
    const idList = Object.keys(personSet);
    return {
      id: "",
      name: "",
      birthDate: "",
      age:
        idList.reduce((sum, id) => sum + personSet[id].age, 0) / idList.length,
    };
  }
);
