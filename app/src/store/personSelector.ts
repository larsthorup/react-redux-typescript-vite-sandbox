import * as R from "ramda";
import { createSelector } from "reselect";
import { shallowEqual } from "react-redux";
import { RootState, Selector, useSelector } from ".";
import { TableSortOrder } from "../lib/react-table";
import { Person } from "./person";

export const selectPeopleId = createSelector(
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
  },
  { 
    memoizeOptions: {
      // Note: return same array if equal
      resultEqualityCheck: shallowEqual,
    },
  }
);

const ageOf = (date: string) => {
  // console.log(date);
  return Math.trunc(
    (Date.now() - Date.parse(date)) / (24 * 60 * 60 * 1000 * 365)
  );
};

export type PersonInfo = Person & {
  age: number;
};

export const selectPeople = (state: RootState) => state.person;

export const selectPersonInfo: Selector<PersonInfo, string> = createSelector(
  (state: RootState, id: string) => state.person[id],
  (person) => {
    // console.log('selectPersonInfo', person);
    return {
      ...person,
      age: ageOf(person.birthDate),
    };
  }
)

export const selectPersonSummary: Selector<PersonInfo> = createSelector(
  selectPeople,
  (personSet) => {
    const idList = Object.keys(personSet);
    return {
      id: "",
      name: "",
      birthDate: "",
      age:
        idList.reduce((sum, id) => sum + ageOf(personSet[id].birthDate), 0) / idList.length,
    };
  }
);

export function usePersonInfo(id: string) {
  return useSelector((state) => selectPersonInfo(state, id));
}

export function usePersonSummary() {
  return useSelector(selectPersonSummary);
}

export function useIsPersonSelected(id: string) {
  return useSelector((state) => !!selectPeople(state)[id].selected)
}