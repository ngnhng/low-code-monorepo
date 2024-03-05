'use client';

import {
  checkboxColumn,
  Column,
  textColumn,
  keyColumn,
  intColumn,
  dateColumn,
  DynamicDataSheetGrid,
  AddRowsComponentProps,
} from 'react-datasheet-grid';

// Import the style only once in your app!
import 'react-datasheet-grid/dist/style.css';
import { Operation } from 'react-datasheet-grid/dist/types';
import useSWR from 'swr';
import { useMobxStore } from 'lib/mobx/store-provider';
import { ColumnDef, ColumnType, DataTable, RowDef } from 'types/table-data';
import { useEffect, useMemo, useState } from 'react';
import { Button, Input } from '@repo/ui';
import { FlaskConical  } from 'lucide-react';

import { toast } from 'sonner'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import CreateColumnForm from '../../_components/create-form/create-column-form';
import QueryBuilderList from '../_components/query-builder-list';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui"
import RelationRecords from '../_components/relation-record/relation-records';

// const handleQuery = async () => {
//   console.log("ABC")
// };

export default function Page({ params: { tableId, projectId } }) {
  const {
    tableData: { fetchTableData, fetchAppliedQueries },
    projectData: { currentProjectId },
  } = useMobxStore();

  const router = useRouter();

  const { data, isLoading, mutate } = useSWR<DataTable>(
    `TABLE_DATA-${currentProjectId}-${tableId}`,
    () =>
      fetchTableData({
        tableId,
        ...fetchAppliedQueries(tableId),
      }),
  );

  // console.log("Data loaded:", data);

  const handleCommit = async (localColumns: ColumnDef[], localData: RowDef[], deletedRowIds: Set<number>, newReferenceTable) => {
    if (deletedRowIds.size > 0) {
      localData = localData.filter(row => !deletedRowIds.has(row.id));
    }

    try {
      await axios.put(`/api/mock/${projectId}/data/${tableId}`, {
        data: {
          columns: localColumns,
          rows: localData,
        },
        newReferenceTableId: newReferenceTable,
      });
      toast.success("Table has been updated.", {
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(newReferenceTable, undefined, 2)}</code>
          </pre>
        ),
      })
      mutate();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TableEditor
        tableId={tableId}
        data={data}
        onCommit={handleCommit}
        // onQuery={handleQuery}
      />
    </>
  );
}

const TableEditor = ({
  tableId,
  data,
  onCommit,
  // onQuery,
}: {
  tableId: string;
  data: DataTable;
  onCommit: any;
  // onQuery: any;
}) => {
  const [localData, setLocalData] = useState<RowDef[]>(data.rows);
  const [localColumns, setLocalColumns] = useState(data.columns);
  const [maxIndex, setMaxIndex] = useState(data.maxIndex);
  const [fields, setFields] = useState<Column[]>([]);
  const [newReferenceTableId, setNewReferenceTableId] = useState<string[]>([]);

  const createdRowIds = useMemo(() => new Set<number>(), [tableId]);
  const deletedRowIds = useMemo(() => new Set<number>(), [tableId]);
  const updatedRowIds = useMemo(() => new Set<number>(), [tableId]);

  const createdColumn = useMemo(() => new Set<string>(), [tableId]);
  const deletedColumn = useMemo(() => new Set<string>(), [tableId]);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({
    keyToSort: "",
    direction: "",
  })

  const handleSortClickDesc = (header) => {
    setSort({
      keyToSort: header.id,
      direction: "desc"
    })
  }

  const handleSortClickAsc = (header) => {
    setSort({
      keyToSort: header.id,
      direction: "asc"
    })
  }

  const handleSearch = (data) => {
    if (search === "" ) {
      return data
    }

    const keys = localColumns.map(column => column.id);
    const result = data.filter((row) => {
      return keys.some((key) => row[key].toString().toLowerCase().includes(search.toLowerCase()))
    })

    console.log("result", result);

    return result;
  }

  const getSortedData = (data) => {
    if (search !== "") {
      data = handleSearch(data);
    }

    if (sort.direction === "asc") {
      return data.sort((a, b) => (a[sort.keyToSort] > b[sort.keyToSort] ? 1 : -1))
    }

    return data.sort((a, b) => (a[sort.keyToSort] > b[sort.keyToSort] ? -1 : 1))
  }

  useEffect(() => {
    const columns = localColumns.map((column) =>
      column.id === 'id'
        ? {
            ...keyColumn<RowDef>(column.id, colTypeMapper(column.type)),
            title: (
              <TitleDataSheet column={column} handleSortClickAsc={handleSortClickAsc} handleSortClickDesc={handleSortClickDesc} />
            ),
            disabled: true,
          }:{
            ...keyColumn<RowDef>(column.id, colTypeMapper(column.type)),
            title: (
              <TitleDataSheet column={column} handleSortClickAsc={handleSortClickAsc} handleSortClickDesc={handleSortClickDesc} />
            ),
          }
    );

    setFields(columns);
  }, [localColumns]);

  const handleChange = (value: RowDef[], ops: Operation[]) => {
    for (const op of ops) {
      switch (op.type) {
        case 'CREATE': {
          for (const row of value.slice(op.fromRowIndex, op.toRowIndex)) {
            createdRowIds.add(row.id);
          }

          break;
        }

        case 'UPDATE': {
          for (const row of value.slice(op.fromRowIndex, op.toRowIndex)) {
            if (!createdRowIds.has(row.id) && !deletedRowIds.has(row.id)) {
              updatedRowIds.add(row.id);
            }
          }

          break;
        }

        case 'DELETE': {
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
            ...localData.slice(op.fromRowIndex, op.toRowIndex + 1),
          );

          break;
        }
      }

      console.log(
        'OP:',
        op.type,
        'VAL:',
        value.slice(op.fromRowIndex, op.toRowIndex + 1),
        'Created:',
        createdRowIds,
        'Deleted:',
        deletedRowIds,
        'Updated:',
        updatedRowIds,
      );
    }

    setLocalData(value);
  };

  //  const addNewColumn = () => {
  //	const newCol = keyColumn('newCol', textColumn, title: 'New Column');

  //    createdColumn.add(newCol.id);
  //    setLocalColumns([...localColumns, newCol]);
  //  };

  const genId = () => {
    const newMax = maxIndex + 1;
    setMaxIndex(newMax);
    return newMax;
  };

  const discardData = () => {
    setLocalData(data.rows);
    setLocalColumns(data.columns);
    setNewReferenceTableId([]);
  };

  return (
    <>
      <ViewMenubar
        onCommit={onCommit}
        discardData={discardData}
        // onAddNewColumn={() => {}}
        // onQuery={onQuery}
        setSearch={setSearch}
        localColumns={localColumns}
        localData={localData}
        setLocalColumns={setLocalColumns}
        setLocalData={setLocalData}
        deletedRowIds={deletedRowIds}
        tableId={tableId}
        newReferenceTableId={newReferenceTableId}
        setNewReferenceTableId={setNewReferenceTableId}
      />

      <DynamicDataSheetGrid
        value={getSortedData(localData)}
        onChange={handleChange}
        columns={fields}
        height={700}
        rowKey="id"
        createRow={() => {
          return {
            ...Object.fromEntries(localColumns.map((col) => [col.id, ''])),
            id: genId(),
          };
        }}
        duplicateRow={({ rowData }) => {
          return {
            ...rowData,
            id: genId(),
          };
        }}
        rowClassName={({ rowData }) => {
          if (deletedRowIds.has(rowData.id)) {
            return 'row-deleted';
          }
          if (createdRowIds.has(rowData.id)) {
            return 'row-created';
          }
          if (updatedRowIds.has(rowData.id)) {
            return 'row-updated';
          }
        }}
        // rowData, rowIndex,
        cellClassName={({  columnId }) => {
          if (createdColumn.has(columnId || '')) {
            return 'cell-created';
          }
          if (deletedColumn.has(columnId || '')) {
            return 'cell-deleted';
          }
        }}
        gutterColumn={{ component: ({ rowData }) => <div>{rowData.id}</div> }}
        // gutterColumn={false}
        addRowsComponent={(props) => <AddRows {...props} table={data} />}
      />
    </>
  );
};

function AddRows({
  addRows,
  // table,
}: AddRowsComponentProps & { table: DataTable }) {
  return (
    <div>
      <Button onClick={() => addRows(1)} className='ml-4 mt-4'>Add 1 row</Button>
    </div>
  );
}

const LinkCell = (props) => {
  console.log("rowData:", props);  

  return (
    <>
      <RelationRecords referenceTableId=''/>
      {/* <Button variant={"secondary"} size={'sm'}>
        <Plus size={24} /> Records
      </Button> */}
      {/* <Dialog>
        <DialogTrigger>
          ABC
        </DialogTrigger>
      </Dialog> */}
    </>
  );
}

const LinkColumnNofunc = {
  component: LinkCell,
  deleteValue: () => '',
  copyValue: ({ rowData }) => rowData,
  pasteValue: ({ value }) => value,
  columnData: 1,
}

// const LinkColumn = (columnData) => ({
//   component: LinkCell,
//   deleteValue: () => '',
//   copyValue: ({ rowData }) => rowData,
//   pasteValue: ({ value }) => value,
// }) as Partial<Column<any, any, string>>;

const colTypeMapper = (type: ColumnType) => {
  switch (type) {
    case 'text': {
      return textColumn;
    }
    case 'number': {
      return intColumn;
    }
    case 'boolean': {
      return checkboxColumn;
    }
    case 'link': {
      return LinkColumnNofunc;
    }
    case 'date': {
      return dateColumn;
    }
    // case 'link': {
    //   return LinkCell;
    // }
    default: {
      return textColumn;
    }
  }
};

const ViewMenubar = ({
  onCommit,
  discardData,
  // onAddNewColumn,
  // onQuery,
  setSearch,
  localColumns,
  localData,
  setLocalColumns,
  setLocalData,
  deletedRowIds,
  tableId,
  setNewReferenceTableId,
  newReferenceTableId
}: {
  onCommit: any;
  discardData: any;
  // onAddNewColumn: any;
  // onQuery: any;
  setSearch: any;
  localColumns: ColumnDef[];
  localData: RowDef[];
  setLocalColumns: any;
  setLocalData: any;
  deletedRowIds: any;
  tableId: any;
  setNewReferenceTableId: any;
  newReferenceTableId: any;
}) => {

  return (
    <div className="flex items-center justify-between w-full px-4">
      <div className="flex flex-start space-x-4">
        <Button disabled onClick={() => onCommit(localColumns, localData, deletedRowIds, newReferenceTableId)}>Commit</Button>
        <Button onClick={discardData}>Discard</Button>
        <QueryBuilderList columns={localColumns}/>
      </div>
      
      <div className="flex flex-end space-x-4 pb-2">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="email" placeholder="Find Present ..." onChange={(e) => setSearch(e.target.value)}/>
        </div>

        <div className="flex w-full max-w-sm items-center space-x-2">
          <CreateColumnForm  
            setLocalColumns={setLocalColumns}
            setLocalData={setLocalData}
            tableId={tableId}
            setNewReferenceTableId={setNewReferenceTableId}
          />
        </div>
      </div>
    </div>
  );
}

const TitleDataSheet = ({
  column,
  handleSortClickAsc,
  handleSortClickDesc,
}: {
  column: any;
  handleSortClickAsc: any,
  handleSortClickDesc: any,
}) => {
  // const [position, setPosition] = useState("bottom")
  // const onSelect = (event: Event) => {
  //   event.preventDefault();
  // }

  return (
    <div className='flex items-center justify-between'>
      <div>{column.label}</div>

      <DropdownMenu>
        <DropdownMenuTrigger>
            <FlaskConical size={24}/> 
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
      </DropdownMenu>
    </div>  
  )
}
