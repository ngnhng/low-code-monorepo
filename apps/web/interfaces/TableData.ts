export interface TableData {
   columns: ColumnProps[];
   rows?: RowProps[];
}

export type ColumnProps = {
   key: string;
   label: string;
   type: string;
   role?: string;
};

export type RowProps = {
   [key: string]: string;
};
