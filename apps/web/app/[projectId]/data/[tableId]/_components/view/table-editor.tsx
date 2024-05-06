import { useEffect, useMemo, useState } from "react";

import {
  checkboxColumn,
  Column,
  textColumn,
  keyColumn,
  intColumn,
  // dateColumn,
  DynamicDataSheetGrid,
  AddRowsComponentProps,
  isoDateColumn,
} from "react-datasheet-grid";
import "react-datasheet-grid/dist/style.css";
import { Operation } from "react-datasheet-grid/dist/types";
import { ColumnType, DataTable, RowDef, ColumnDef } from "types/table-data";

import { ViewMenuBar } from "./view-menu-bar";
import RelationRecords from "../relation-record/relation-records";
import { Button } from "@repo/ui";

type CommitFunc = (
  // eslint-disable-next-line no-unused-vars
  localColumns: ColumnDef[],
  // eslint-disable-next-line no-unused-vars
  localData: RowDef[],
  // eslint-disable-next-line no-unused-vars
  addedRowIds: Set<number>,
  // eslint-disable-next-line no-unused-vars
  deletedRowIds: Set<number>,
  // eslint-disable-next-line no-unused-vars
  updatedRowIds: Set<number>,
  createdColumns: Set<ColumnDef>,
  // addedRows: Set<RowDef>,
  // deletedRows: Set<RowDef>,
  // updatedRows: Set<RowDef>,
  // eslint-disable-next-line no-unused-vars
  newReferenceTableId: any
) => void;

type TableEditorProps = {
  tableId: string;
  tableData: DataTable;
  onCommit: CommitFunc;
  yalcToken: string;
  isSubmitting: boolean;
};

// TODO: handle types
interface TitleDataSheetProps {
  column: ColumnDef;
  handleSortClickAsc?: any;
  handleSortClickDesc?: any;
}

export const TableEditor = ({
  tableId,
  tableData,
  onCommit,
  yalcToken,
  isSubmitting,
}: TableEditorProps) => {
  const [localData, setLocalData] = useState<RowDef[]>(tableData.rows);
  const [localColumns, setLocalColumns] = useState<ColumnDef[]>(
    tableData.columns
  );
  const [fields, setFields] = useState<Column[]>([]);
  const [maxIndex, setMaxIndex] = useState(tableData.maxIndex);

  const [newReferenceTableId, setNewReferenceTableId] = useState<string[]>([]);

  const createdRowIds = useMemo(() => new Set<number>(), [tableId]);
  const deletedRowIds = useMemo(() => new Set<number>(), [tableId]);
  const updatedRowIds = useMemo(() => new Set<number>(), [tableId]);
  const createdColumns = useMemo(() => new Set<ColumnDef>(), [tableId]);

  // const addedRows = useMemo(() => new Set<RowDef>(), [tableId]);

  const createdColumn = useMemo(() => new Set<string>(), [tableId]);
  const deletedColumn = useMemo(() => new Set<string>(), [tableId]);

  useEffect(() => {
    const createColumn = (column) => {
      const isLinkType = column.type === "link";
      const isId = column.id === "id";
      const colType = isLinkType
        ? colTypeMapper(column.type, column, tableId)
        : colTypeMapper(column.type);
      const disabled = isId;

      return {
        ...keyColumn<RowDef>(column.id, colType),
        title: (
          <TitleDataSheet
            column={column}
            // handleSortClickAsc={handleSortClickAsc}
            // handleSortClickDesc={handleSortClickDesc}
          />
        ),
        disabled,
      };
    };

    const columns = localColumns.map((element) => createColumn(element));

    setFields(columns.filter((column) => column.id !== "id"));
  }, [localColumns, tableId]);

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleChange = (value: RowDef[], ops: Operation[]) => {
    for (const op of ops) {
      switch (op.type) {
        case "CREATE": {
          for (const row of value.slice(op.fromRowIndex, op.toRowIndex)) {
            createdRowIds.add(row.id);
          }
          break;
        }
        case "UPDATE": {
          for (const row of value.slice(op.fromRowIndex, op.toRowIndex)) {
            if (!createdRowIds.has(row.id) && !deletedRowIds.has(row.id)) {
              updatedRowIds.add(row.id);
            }
          }
          break;
        }
        case "DELETE": {
          for (const [, { id }] of localData
            .slice(op.fromRowIndex, op.toRowIndex)
            .entries()) {
            updatedRowIds.delete(id);
            if (createdRowIds.has(id)) {
              createdRowIds.delete(id);
            }

            deletedRowIds.add(id);
          }

          // re-add the deleted rows
          value.splice(
            op.fromRowIndex,
            op.toRowIndex - op.fromRowIndex,
            ...localData.slice(op.fromRowIndex, op.toRowIndex + 1)
          );

          break;
        }
      }
    }

    setLocalData(value);
  };

  const discardData = () => {
    setLocalData(tableData.rows);
    setLocalColumns(tableData.columns);
    updatedRowIds.clear();
    createdRowIds.clear();
    deletedRowIds.clear();
    createdColumn.clear();
    setNewReferenceTableId([]);
  };

  const genId = () => {
    const newMax = maxIndex + 1;
    setMaxIndex(newMax);
    return newMax;
  };

  return (
    <div className="flex flex-col h-full">
      <ViewMenuBar
        onCommit={onCommit}
        discardData={discardData}
        setLocalColumns={setLocalColumns}
        setLocalData={setLocalData}
        localColumns={localColumns}
        localData={localData}
        deletedRowIds={deletedRowIds}
        updatedRowIds={updatedRowIds}
        addedRowIds={createdRowIds}
        createdColumns={createdColumns}
        newReferenceTableId={newReferenceTableId}
        setNewReferenceTableId={setNewReferenceTableId}
        tableId={tableId}
        yalcToken={yalcToken}
        isSubmitting={isSubmitting}
      />
      <div className="mx-4 h-full">
        <DynamicDataSheetGrid
          value={localData}
          columns={fields}
          rowKey={"id"}
          height={700}
          headerRowHeight={50}
          rowHeight={100}
          gutterColumn={{ component: ({ rowData }) => <div>{rowData.id}</div> }}
          onChange={handleChange}
          createRow={() => {
            const rowReturn = {
              ...Object.fromEntries(
                localColumns.map((col) => [
                  col.id,
                  returnDefaultValue(col.type, col.referenceTable),
                ])
              ),
            };

            return {
              ...rowReturn,
              id: genId(),
            };
          }}
          duplicateRow={({ rowData }) => {
            return {
              ...recreateNestedObjects(rowData),
              id: genId(),
            };
          }}
          rowClassName={({ rowData }) => {
            if (deletedRowIds.has(rowData.id)) {
              return "row-deleted";
            }
            if (createdRowIds.has(rowData.id)) {
              return "row-created";
            }
            if (updatedRowIds.has(rowData.id)) {
              return "row-updated";
            }
          }}
          cellClassName={({ columnId }) => {
            if (createdColumn.has(columnId || "")) {
              return "cell-created";
            }
            if (deletedColumn.has(columnId || "")) {
              return "cell-deleted";
            }
          }}
          addRowsComponent={(props) => <AddRows {...props} table={tableData} />}
        />
      </div>
    </div>
  );
};

const TitleDataSheet = ({
  column,
  // eslint-disable-next-line no-unused-vars
  // handleSortClickAsc,
  // eslint-disable-next-line no-unused-vars
  // handleSortClickDesc,
}: TitleDataSheetProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>{column.label}</div>

      {/* <DropdownMenu>
        <DropdownMenuTrigger>
          <FlaskConical size={24} />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Action Filter</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleSortClickAsc(column)}>
              Sort A - Z
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortClickDesc(column)}>
              Sort Z - A
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu> */}
    </div>
  );
};

const LinkCell = ({ rowData, columnData }) => {
  // * rowData: is the value of the cell
  // * columnData: is the props (attributes) of the column containing cells
  const [numberOfRecords, setNumberOfRecords] = useState();

  if (!rowData) {
    rowData = {
      referenceTableId: columnData.referenceTable,
      referenceRecords: [],
    };
  }

  // console.log(rowData);
  // console.log(columnData);

  return (
    <div className="flex items-center">
      <RelationRecords
        referenceTableId={rowData.referenceTableId}
        linkedRecordIds={rowData.referenceRecords}
        setNumberOfRecords={setNumberOfRecords}
        rowData={rowData}
        columnData={columnData}
      />
      <span>
        {numberOfRecords} records -{" "}
        <span className="text-emerald-500">{columnData.referenceTable}</span>
      </span>
    </div>
  );
};

const LinkColumnCell = (columnData, tableId) => {
  columnData = { ...columnData, tableId: tableId };

  return {
    component: LinkCell,
    deleteValue: () => "",
    copyValue: ({ rowData }) => rowData,
    pasteValue: ({ value }) => value,
    columnData: { ...columnData, tableId: tableId },
  };
};

const colTypeMapper = (
  type: ColumnType,
  columnData?: any,
  tableId?: string
) => {
  switch (type) {
    case "text": {
      return textColumn;
    }
    case "number": {
      return intColumn;
    }
    case "boolean": {
      return checkboxColumn;
    }
    case "link": {
      return LinkColumnCell(columnData, tableId);
    }
    case "date": {
      return isoDateColumn;
    }
    default: {
      return textColumn;
    }
  }
};

function AddRows({ addRows }: AddRowsComponentProps & { table: DataTable }) {
  return (
    <div>
      <Button onClick={() => addRows(1)} className="ml-4 mt-4">
        Add 1 row
      </Button>
    </div>
  );
}

function recreateNestedObjects(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.map((item) => recreateNestedObjects(item))];
      } else if (typeof value === "object" && value !== null) {
        return [key, recreateNestedObjects(value)];
      } else {
        return [key, value];
      }
    })
  );
}

function returnDefaultValue(type: ColumnType, referenceTable?: string) {
  switch (type) {
    case "text": {
      return "";
    }
    case "number": {
      return;
    }
    case "boolean": {
      return false;
    }
    case "link": {
      return {
        referenceTableId: referenceTable,
        referenceRecords: [],
      };
    }
    case "date": {
      return;
    }
    default: {
      return "";
    }
  }
}
