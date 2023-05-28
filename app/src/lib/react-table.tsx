/**
 * <Table> component that will render to native HTML <table> elements
 *
 * The table component is optimized for efficiently re-rendering only rows which have changed data.
 * This gives snappy editing of large (10k rows) tables.
 *
 * Rows must be identified by an id / a key and the list of only those ids are passed to the Table,
 * not the data itself.
 *
 * Data is fetched by providing a React hook which must efficiently return data for the row by the given id
 * Being a hook means that it can access a React context or a Redux store.
 * By using selectors efficiently, changes in row data can render very efficiently.
 *
 * Cell rendering is provided per column by a function returning JSX and taking the row data as input
 * Only cells of changed rows will be re-rendered
 *
 * @see ../view/SimpleTable.tsx for simple usage
 *
 * Full documentation on types and members below
 */

import React, {
  CSSProperties,
  ChangeEventHandler,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type TRowBase = string | number;

/**
 * The type of each item of the `columns` prop on the `Table` component
 * You should usually type the collection like this:
 * `const columns: TableColumn<typeof rows[0], RowData>[] = [...]`
 */
export type TableColumn<TRow extends TRowBase, TRowData = any> = {
  /**
   * The ReactNode to render in the specified (column, rowIndex) cell
   */
  cell?:
    | ReactNode
    | ((row: TRow, rowIndex: number, data: TRowData) => ReactNode);
  /**
   * The CSSProperties to add to the `<td>` of the specified (column, rowIndex) cell
   */
  cellStyle?:
    | CSSProperties
    | ((row: TRow, rowIndex: number, data: TRowData) => CSSProperties);
  /**
   * The ReactNode to render in the specified (column) summary cell
   */
  cellSummary?: ReactNode | ((data: TRowData) => ReactNode);
  /**
   * `true` if this column is to contain a button for the user to edit data in the row
   */
  isEditColumn?: boolean;
  /**
   * `true` if this column is to contain a control for the user to select the row
   */
  isSelectColumn?: boolean;
  /**
   * `true` if this column should be excluded, e.g. based on a feature toggle
   */
  isExcluded?: boolean;
  /**
   * `true` if this column enables the user to sort the rows based on the column
   */
  isSortable?: boolean;
  /**
   * A unique name used to identify the column when sorting
   */
  name?: string;
  /**
   * The text to use as column header
   */
  title?: string;
  /**
   * `number` to right-align cell content
   */
  type?: "string" | "number";
};

/**
 * The type of the `rowOptions` prop on the `Table` component
 * You should usually type this object like this:
 * `const rowOptions: TableRowOptions<typeof rows[0], RowData>[] = [...]`
 */
export type TableRowOptions<TRow extends TRowBase, TRowData = any> = {
  /**
   * The ReactNode to render across the width of the table to enable the user to edit the data
   * of the specified row. Invoke `onClose` to close the editor
   */
  editor?: (
    onClose: () => void,
    row: TRow,
    index: number,
    data: TRowData
  ) => ReactElement;
  /**
   * `true`, if the user should be able to edit the specified row
   */
  isEditable?: (row: TRow, index: number, data: TRowData) => boolean;
  /**
   * `true` if this row should be excluded
   */
  isExcluded?: (row: TRow, index: number, data: TRowData) => boolean;
  /**
   * The name to use when labeling the current row, used on the edit button
   */
  label?: (row: TRow, index: number, data: TRowData) => string;
  /**
   * called when the selection of a row is changed by the user, null means all rows
   */
  onSelected?: (row: TRow | null, selected: boolean) => void;
  /**
   * Props to add to the `<tr>` of the specified row
   */
  props?: (row: TRow, index: number, data: TRowData) => { [name: string]: any };
  /**
   * The CSSProperties to add to the `<tr>` of the specified row
   */
  style?: (row: TRow, index: number, rowData: TRowData) => CSSProperties;
  /**
   * React Hook to select data for the current row which is passed along in most functions here.
   * Must observe Hook principles, such as never calling other hooks conditionally or in loops
   * Use this hook to avoid re-rendering the entire table when the user edits a single row, by keeping
   * editable row data in TRowData and only row ids in TRow.
   */
  useData?: (row: TRow, index: number) => TRowData;
  /**
   * React Hook to select data for the summary row which is passed to the cellSummary function.
   * Must observe Hook principles, such as never calling other hooks conditionally or in loops
   * Use this hook to avoid re-rendering the entire table when the user edits a single row.
   */
  useDataSummary?: () => TRowData;
  /**
   * React Hook to get the selection status of the current row
   * Must observe Hook principles, such as never calling other hooks conditionally or in loops
   * Use this hook to avoid re-rendering the entire table when the user selects a single row
   */
  useSelected?: (row: TRow) => boolean;
  /**
   * TBD - replaces table.rows
   */
  useNextRow?: (previousRow: null | TRow) => TRow | null;
};

export type TableSortDirection = "asc" | "desc";

const reverse = (direction: TableSortDirection) => {
  return direction === "asc" ? "desc" : "asc";
};

export type TableSortOrder = {
  columnName: string;
  direction: TableSortDirection;
};

type TableProps<TRow extends TRowBase> = {
  /**
   * How to render each column of the table
   */
  columns: TableColumn<TRow>[];
  /**
   * Invoked when the user requests a different sort order
   */
  onSortOrderChange?: (sortOrder: TableSortOrder) => void;
  /**
   * How to render each row of the table
   */
  rowOptions?: TableRowOptions<TRow>;
  /**
   * Data for each row of the table
   */
  rows?: TRow[];
  /**
   * The current sort order, if sorting is enabled for any columns
   */
  sortOrder?: TableSortOrder;
  /**
   * Not used yet
   */
  caption?: string;
};
function Table<TRow extends TRowBase>({
  columns,
  onSortOrderChange,
  rowOptions,
  rows,
  sortOrder,
  caption,
}: PropsWithChildren<TableProps<TRow>>) {
  const columnList = columns.filter((c) => !c.isExcluded);
  const hasSummary = rowOptions && rowOptions.useDataSummary;
  const onSelected = (selected: boolean) => {
    if (rowOptions && rowOptions.onSelected) {
      rowOptions.onSelected(null, selected);
    }
  };
  return (
    <table>
      {caption && <caption>{caption}</caption>}
      <thead>
        <TableHeaderRow
          columns={columnList}
          onSortOrderChange={onSortOrderChange}
          onSelected={onSelected}
          sortOrder={sortOrder}
        />
      </thead>
      <tbody>
        <TableRowIterator
          rowIndex={0}
          rowOptions={rowOptions || {}}
          rows={rows}
          previousRow={null}
          columns={columnList}
        />
        {hasSummary && (
          <TableSummaryRow columns={columnList} rowOptions={rowOptions || {}} />
        )}
      </tbody>
    </table>
  );
}

type TableRowIteratorProps<TRow extends TRowBase> = {
  rowIndex: number;
  columns: TableColumn<TRow>[];
  rows?: TRow[];
  rowOptions: TableRowOptions<TRow>;
  previousRow: TRow | null;
};
function TableRowIterator<TRow extends TRowBase>({
  rowIndex,
  columns,
  rowOptions,
  rows,
  previousRow,
}: PropsWithChildren<TableRowIteratorProps<TRow>>) {
  const useNextRow =
    rowOptions.useNextRow ||
    ((previousRow) =>
      rows
        ? rows[
            previousRow === null
              ? 0
              : rows.findIndex((r) => r === previousRow) + 1
          ]
        : undefined);
  const row = useNextRow(previousRow);
  if (!row) {
    return null;
  } else {
    return (
      <>
        <TableRow
          columns={columns}
          rowOptions={rowOptions}
          row={row}
          rowIndex={rowIndex}
          key={row}
        />
        <TableRowIterator
          rowIndex={rowIndex + 1}
          columns={columns}
          rowOptions={rowOptions}
          // rows={rows}
          previousRow={row}
        />
      </>
    );
  }
}

type TableHeaderRowProps<TRow extends TRowBase> = {
  columns: TableColumn<TRow>[];
  onSortOrderChange?: (sortOrder: TableSortOrder) => void;
  onSelected: (selected: boolean) => void;
  sortOrder?: TableSortOrder;
};
function TableHeaderRow<TRow extends TRowBase>({
  columns,
  onSortOrderChange,
  onSelected,
  sortOrder,
}: PropsWithChildren<TableHeaderRowProps<TRow>>) {
  const fontWeight = "bold";
  const allSelectedCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (allSelectedCheckboxRef.current) {
      allSelectedCheckboxRef.current.indeterminate = true;
    }
  });
  const [isAllSelected, setIsAllSelected] = useState(false);
  const toggleAllSelected: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const selected = ev.target.checked;
    setIsAllSelected(selected);
    onSelected(selected);
  };
  return (
    <tr>
      {columns.map(
        ({ name, isSelectColumn, isSortable, title, type = "string" }, key) => {
          const textAlign = type === "number" ? "right" : "left";
          const columnControl = (() => {
            if (isSelectColumn) {
              return (
                <input
                  ref={allSelectedCheckboxRef}
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleAllSelected}
                />
              );
            } else if (sortOrder && onSortOrderChange && isSortable && name) {
              const { columnName, direction } = sortOrder;
              const isSortedByThisColumn = columnName === name;
              const newDirection = isSortedByThisColumn
                ? reverse(direction)
                : "asc";
              const sortOrderChangeHandler = () =>
                onSortOrderChange({
                  columnName: name,
                  direction: newDirection,
                });
              const sortText = isSortedByThisColumn
                ? `sorted ${direction}`
                : "sort";
              return (
                <>
                  {title || ""}
                  <button onClick={sortOrderChangeHandler}>{sortText}</button>
                </>
              );
            } else {
              return <>{title || ""}</>;
            }
          })();
          return (
            <td style={{ fontWeight, textAlign }} key={key}>
              {columnControl}
            </td>
          );
        }
      )}
    </tr>
  );
}

type TableRowProps<TRow extends TRowBase> = {
  columns: TableColumn<TRow>[];
  rowOptions: TableRowOptions<TRow>;
  row: TRow;
  rowIndex: number;
};
function TableRow<TRow extends TRowBase>({
  columns,
  rowOptions,
  row,
  rowIndex,
}: PropsWithChildren<TableRowProps<TRow>>) {
  const useData = rowOptions.useData || (() => null);
  const rowData = useData(row, rowIndex);
  const useSelected = rowOptions.useSelected || (() => false);
  const isSelected = useSelected(row);
  const [isEditing, setIsEditing] = useState(false);
  const isExcluded =
    rowOptions.isExcluded && rowOptions.isExcluded(row, rowIndex, rowData);
  const editHandler = () => {
    setIsEditing(true);
  };
  const closeHandler = () => {
    setIsEditing(false);
  };
  const selectHandler = (selected: boolean) => {
    rowOptions.onSelected && rowOptions.onSelected(row, selected);
  };
  if (isExcluded) {
    return <tr style={{ display: "none" }} />;
  } else if (isEditing) {
    if (!rowOptions.editor)
      throw new Error(`Missing editor in <Table> rowOptions`);
    const editor = rowOptions.editor(closeHandler, row, rowIndex, rowData);
    const style = { backgroundColor: "yellow" };
    return (
      <tr>
        <td colSpan={columns.length} style={style}>
          {editor}
        </td>
      </tr>
    );
  } else {
    const isEditable = rowOptions.isEditable
      ? rowOptions.isEditable(row, rowIndex, rowData)
      : true;
    const rowProps = rowOptions.props
      ? rowOptions.props(row, rowIndex, rowData)
      : {};
    const style = rowOptions.style
      ? rowOptions.style(row, rowIndex, rowData)
      : {};
    rowRendered[rowIndex] = true;
    return (
      <tr style={style} {...rowProps}>
        <TableRowView
          row={row}
          rowData={rowData}
          rowIndex={rowIndex}
          isEditable={isEditable}
          isSelected={isSelected}
          onSelected={selectHandler}
          columns={columns}
          rowOptions={rowOptions}
          onEdit={editHandler}
        />
      </tr>
    );
  }
}

type TableRowViewProps<TRow extends TRowBase, TRowData> = {
  columns: TableColumn<TRow, TRowData>[];
  isEditable: boolean;
  onEdit: () => void;
  isSelected: boolean;
  onSelected: (selected: boolean) => void;
  rowOptions: TableRowOptions<TRow, TRowData>;
  row: TRow;
  rowData: TRowData;
  rowIndex: number;
};
function TableRowView<TRow extends TRowBase, TRowData>({
  columns,
  isEditable,
  isSelected,
  onEdit,
  onSelected,
  rowOptions,
  row,
  rowData,
  rowIndex,
}: PropsWithChildren<TableRowViewProps<TRow, TRowData>>) {
  const changeHandler: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const selected = ev.target.checked;
    onSelected(selected);
  };
  return (
    <>
      {columns.map((column, columnIndex) => {
        const {
          cell,
          cellStyle,
          isEditColumn,
          isSelectColumn,
          type = "string",
        } = column;
        const textAlign = type === "number" ? "right" : "left";
        const element = (
          <>
            {(() => {
              if (isSelectColumn) {
                return (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={changeHandler}
                  />
                );
              } else if (isEditable && isEditColumn) {
                const label = rowOptions.label
                  ? rowOptions.label(row, rowIndex, rowData)
                  : `row ${rowIndex + 1}`;
                return <button onClick={onEdit}>{`Edit ${label}`}</button>;
              } else if (typeof cell === "function") {
                return cell(row, rowIndex, rowData);
              } else {
                return cell;
              }
            })()}
          </>
        );
        const style = (() => {
          switch (typeof cellStyle) {
            case "undefined":
              return undefined;
            case "object":
              return cellStyle;
            case "function":
              return cellStyle(row, rowIndex, rowData);
          }
        })();
        return (
          <td style={{ textAlign, ...style }} key={columnIndex}>
            {element}
          </td>
        );
      })}
    </>
  );
}

type TableSummaryRowProps<TRow extends TRowBase> = {
  columns: TableColumn<TRow>[];
  rowOptions: TableRowOptions<TRow>;
};
function TableSummaryRow<TRow extends TRowBase>({
  columns,
  rowOptions,
}: PropsWithChildren<TableSummaryRowProps<TRow>>) {
  const useDataSummary = rowOptions.useDataSummary || (() => null);
  const rowData = useDataSummary();
  return (
    <tr>
      <TableSummaryRowView columns={columns} rowData={rowData} />
    </tr>
  );
}

type TableSummaryRowViewProps<TRow extends TRowBase, TRowData> = {
  columns: TableColumn<TRow, TRowData>[];
  rowData: TRowData;
};
function TableSummaryRowView<TRow extends TRowBase, TRowData>({
  columns,
  rowData,
}: PropsWithChildren<TableSummaryRowViewProps<TRow, TRowData>>) {
  return (
    <>
      {columns.map((column, columnIndex) => {
        const { cellSummary, type = "string" } = column;
        const textAlign = type === "number" ? "right" : "left";
        const element = (
          <>
            {(() => {
              if (typeof cellSummary === "function") {
                return cellSummary(rowData);
              } else {
                return cellSummary;
              }
            })()}
          </>
        );
        return (
          <td style={{ textAlign }} key={columnIndex}>
            {element}
          </td>
        );
      })}
    </>
  );
}

export default Table;

// Note: instrumentation for testing purposes
let rowRendered: Record<number, boolean> = {};
export const getRowRenderCount = () =>
  Object.values(rowRendered).filter((rendered) => rendered).length;
export const resetRowRenderCount = () => (rowRendered = {});
