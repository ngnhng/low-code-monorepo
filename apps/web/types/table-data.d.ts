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

interface TableItem {
  id: string;
  name: string;
  source: string;
  created: string;
  updated: string;
  status: string;
  columns: ColumnDef[];
  referenceTables?: string[];
}

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

type ColumnType = 'date' | 'text' | 'number' | 'boolean' | LinkColumn | 'link';

interface ColumnDef {
  id: string;
  label: string;
  type: ColumnType;
  isActive: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referenceTable?: string;
  foreignKeyId?: string;
  defaultValue?: string;
}

interface RowDef {
  id: number;
  [key: string]: any;
}

type LinkColumn = {
  referenceTableId: string;
  referenceRecords: string[]; // recordId:
};
