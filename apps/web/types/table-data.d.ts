export type GetTableDataParams = {
  tableId: string;
  page: number;
  limit: number;
  query?: any;
};

export type TableQueries = {
  [projectId: string]: {
    [tableId: string]: {
      page: number;
      limit: number;
      query: any;
    };
  };
};

export interface GetTableDataResponse extends DataTable {}

export interface GetTablesResponse extends TableItem {}

export type TableItem = { id: string } & TableListAttributes;

// interface TableOperation {
//   type: 'update' | 'insert' | 'delete';
//   row: number;
//   column: number;
//   value: any;
// }

interface DataTable {
  columns: ColumnDef[] | [];
  rows: RowDef[] | [];
  pagination: {
    page: number;
    pageSize: number;
    totalPage: number;
  };
  maxIndex: number;
}

type ColumnType = "date" | "text" | "number" | "boolean" | LinkColumn | "link";

export type ColumnDef = { id: string } & ColumnAttributes;

export type RowDef = { id: number } & RowAttributes;

export type RowAttributes = {
  [key: string]: any;
};

export type ColumnAttributes = {
  label: string;
  type: ColumnType;
  isActive: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referenceTable?: string;
  foreignKeyId?: string;
  defaultValue?: string;
};

export type TableListAttributes = {
  name: string;
  source: string;
  created: string;
  updated: string;
  status: string;
  referenceTables: string[];
  columns: ColumnDef[];
};

type LinkColumn = {
  referenceTableId: string;
  referenceRecords: string[]; // recordId:
};
