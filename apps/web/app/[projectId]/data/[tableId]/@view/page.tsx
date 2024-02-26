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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui"

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

export default function Page({ params: { tableId, projectId } }) {
  const {
    tableData: { fetchTableData, fetchAppliedQueries },
    projectData: { currentProjectId },
  } = useMobxStore();

  const router = useRouter();

  const { data, isLoading, error, mutate } = useSWR<DataTable>(
    `TABLE_DATA-${currentProjectId}-${tableId}`,
    () =>
      fetchTableData({
        tableId,
        ...fetchAppliedQueries(tableId),
      }),
  );

  // console.log("Data loaded:", data);

  const handleCommit = async (localColumns: ColumnDef[], localData: RowDef[]) => {
    try {
      await axios.put(`/api/mock/${projectId}/data/${tableId}`, {
        data: {
          columns: localColumns,
          rows: localData,
        },
      });
      toast.success('Table updated');
      mutate();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
    // TODO: axios data
    console.log('committing data', data);
  };

  const handleQuery = (query: any, data: any) => {
    // TODO: query
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
        onQuery={handleQuery}
      />
    </>
  );
}

const TableEditor = ({
  tableId,
  data,
  onCommit,
  onQuery,
}: {
  tableId: string;
  data: DataTable;
  onCommit: any;
  onQuery: any;
}) => {
  const [localData, setLocalData] = useState<RowDef[]>(data.rows);
  const [localColumns, setLocalColumns] = useState(data.columns);
  const [maxIndex, setMaxIndex] = useState(data.maxIndex);
  const [fields, setFields] = useState<Column[]>([]);

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

  console.log("Data Recieved: ", data);
  console.log("Data present:", localData);

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
    
    console.log("Keys:", keys);
    console.log(search);

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

    console.log("sorted", data);

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
          }
        : {
            ...keyColumn<RowDef>(column.id, colTypeMapper(column.type)),
            title: (
              <TitleDataSheet column={column} handleSortClickAsc={handleSortClickAsc} handleSortClickDesc={handleSortClickDesc} />
            ),
          },
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
  };

  return (
    <>
      <ViewMenubar
        onCommit={onCommit}
        discardData={discardData}
        onAddNewColumn={() => {}}
        onQuery={onQuery}
        setSearch={setSearch}
        localColumns={localColumns}
        localData={localData}
        setLocalColumns={setLocalColumns}
        setLocalData={setLocalData}
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
        cellClassName={({ rowData, rowIndex, columnId }) => {
          if (createdColumn.has(columnId || '')) {
            return 'cell-created';
          }
          if (deletedColumn.has(columnId || '')) {
            return 'cell-deleted';
          }
        }}
        //gutterColumn={{ component: ({ rowData }) => <div>{rowData.id}</div> }}
        gutterColumn={false}
        addRowsComponent={(props) => <AddRows {...props} table={data} />}
      />
    </>
  );
};

function AddRows({
  addRows,
  table,
}: AddRowsComponentProps & { table: DataTable }) {
  return <button onClick={() => addRows(10)}>Add 10 rows</button>;
}

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
    case 'date': {
      return dateColumn;
    }
    default: {
      return textColumn;
    }
  }
};

const ViewMenubar = ({
  onCommit,
  discardData,
  onAddNewColumn,
  onQuery,
  setSearch,
  localColumns,
  localData,
  setLocalColumns,
  setLocalData,
}: {
  onCommit: any;
  discardData: any;
  onAddNewColumn: any;
  onQuery: any;
  setSearch: any;
  localColumns: ColumnDef[];
  localData: RowDef[];
  setLocalColumns: any;
  setLocalData: any;
}) => {

  return (
    <div className="flex items-center justify-between w-full px-4">
      <div className="flex flex-start space-x-4">
        <Button onClick={() => onCommit(localColumns, localData)}>Commit</Button>
        <Button onClick={discardData}>Discard</Button>
      </div>
      {/* <div className="flex flex-start">
        <Button onClick={onAddNewColumn}>Add New Column</Button>
      </div> */}
      <div className="flex flex-end space-x-4 pb-2">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="email" placeholder="Find Present ..." onChange={(e) => setSearch(e.target.value)}/>
        </div>

        <div className="flex w-full max-w-sm items-center space-x-2">
          <CreateColumnForm  
            setLocalColumns={setLocalColumns}
            setLocalData={setLocalData}
          />
        </div>
      </div>
    </div>
  );
}

// A button "Filter" - can be clicked to filter by each columns
// 

const TitleDataSheet = ({
  column,
  handleSortClickAsc,
  handleSortClickDesc,
}: {
  column: any;
  handleSortClickAsc: any,
  handleSortClickDesc: any,
}) => {
  const [position, setPosition] = useState("bottom")
  const onSelect = (event: Event) => {
    event.preventDefault();
  }

  return (
    <div className='flex items-center justify-between'>
      <div>{column.label}</div>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button size={"sm"} variant={"ghost"}>
            <FlaskConical size={24}/>
          </Button>
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

          <DropdownMenuGroup>
            <DropdownMenuItem>Filter By Conditions</DropdownMenuItem>
            <DropdownMenuItem className='' onSelect={onSelect}>
              Filter By Values
              <Input type="email" placeholder="Find ..."/>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {/* <DropdownMenuSeparator /> */}

          {/* <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Group By</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                  <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>  
  )
}
