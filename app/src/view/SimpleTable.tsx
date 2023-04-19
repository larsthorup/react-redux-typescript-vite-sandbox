import React from "react";
import Table, { TableColumn, TableRowOptions } from "../lib/react-table";

export default function SimpleTable() {
  type RowData = { name: string; age: number };
  const data: Record<string, RowData> = {
    "1": { name: "Lars", age: 56 },
    "2": { name: "Mono", age: 10 },
  };
  const rows = Object.keys(data);
  const columns: TableColumn<typeof rows[0], RowData>[] = [
    {
      title: "Name",
      cell: (id, i, { name }) => name,
    },
    {
      title: "Age",
      cell: (id, i, { age }) => age.toString(),
    },
  ];
  const rowOptions: TableRowOptions<typeof rows[0], RowData> = {
    useData: (id) => data[id],
  };
  return <Table columns={columns} rows={rows} rowOptions={rowOptions} />;
}
