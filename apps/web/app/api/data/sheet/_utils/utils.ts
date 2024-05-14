/* eslint-disable @typescript-eslint/no-unused-vars */
import moment from "moment";
import { ColumnDef, RowDef } from "types/table-data";

/* 
GG Sheet Date format
* "MMM/DD/YYYY" : Oct/24/2010
* "MM-DD-YYYY"  : 10-24-2010
* "DD-MMM-YYYY" : 24-Oct-2010
* "YYYY-MM-DD"  : 2010-10-24
* "DD-MM-YYYY"  : 24-10-2010
*/
export function getBearerToken(
  authorizationHeader: string
): string | undefined {
  // Check if the header exists and starts with "Bearer " (case-insensitive)
  if (
    !authorizationHeader ||
    !authorizationHeader.toLowerCase().startsWith("bearer ")
  ) {
    return undefined;
  }

  // Split the header on space and return the second element (token)
  const parts = authorizationHeader.split(" ");
  return parts[1];
}

export const GoogleSheetDateFormat = [
  "MMM/DD/YYYY",
  "MM-DD-YYYY",
  "DD MMM YYYY",
  "YYYY-MM-DD",
  "DD-MM-YYYY",
  "MM/DD/YYYY",
  "MMM DD, YYYY",
];

export function getRangeDimensions(
  range: string
): { rows: number; columns: number } | undefined {
  const [startCell, endCell] = range.split(":");

  if (!startCell) {
    return;
  }

  if (!endCell) {
    return;
  }

  const startRow = Number.parseInt(startCell.slice(1), 10);
  const startCol = startCell.codePointAt(0)! - 65;
  const endRow = Number.parseInt(endCell.slice(1), 10);
  const endCol = endCell.codePointAt(0)! - 65;

  const rows = endRow - startRow + 1;
  const columns = endCol - startCol + 1;

  return { rows, columns };
}

export function formatSheetData(sheetData: any[], range: string, options: any) {
  if (sheetData.length === 0 || !sheetData[0]) {
    return;
  }

  const onlyRange = range.split("!")[1];
  const rangeResult = getRangeDimensions(onlyRange!);
  const indexRow = options.headerTitle === false ? 0 : 1;
  const indexCol = 0;

  if (!rangeResult || rangeResult.columns < 0 || rangeResult.rows < 0) {
    return;
  }

  const columns: ColumnDef[] = [];
  const rows: RowDef[] = [];

  // COLUMNS PROCESS
  for (let i = indexCol; i < rangeResult.columns; i++) {
    let type;
    let index = indexRow;

    while (type === undefined) {
      if (sheetData[i][index] !== undefined && sheetData[i][index] !== "") {
        if (typeof sheetData[i][index] === "string") {
          type = moment(sheetData[i]![index], GoogleSheetDateFormat).isValid()
            ? "date"
            : "text";
        }

        if (typeof sheetData[i][index] === "number") {
          type = "number";
        }

        if (typeof sheetData[i][index] === "boolean") {
          type = "boolean";
        }

        break;
      }

      index++;
    }

    const column: ColumnDef = {
      id:
        options.headerTitle === false
          ? `col-${i}`
          : `${sheetData[i][0]?.toLowerCase()}`,
      label:
        options.headerTitle === false ? `Column ${i}` : `${sheetData[i][0]}`,
      name:
        options.headerTitle === false ? `Column ${i}` : `${sheetData[i][0]}`,
      type: type,
      isActive: true,
      isPrimaryKey: true,
      isForeignKey: false,
      foreignKeyId: "",
    };

    columns.push(column);
  }

  // ROWS PROCESS
  for (let i = indexRow; i < rangeResult.rows; i++) {
    const row: RowDef = {
      id: indexRow === 0 ? i + 1 : i,
    };

    for (let j = indexCol; j < rangeResult.columns; j++) {
      if (columns[j]?.type === "text") {
        row[`${columns[j]?.id}`] = sheetData[j][i].toString();
      }

      if (columns[j]?.type === "number") {
        row[`${columns[j]?.id}`] = sheetData[j][i].toString();
      }

      if (columns[j]?.type === "boolean") {
        row[`${columns[j]?.id}`] = Boolean(sheetData[j][i]);
      }

      if (columns[j]?.type === "date") {
        row[`${columns[j]?.id}`] = moment(
          sheetData[j][i],
          GoogleSheetDateFormat
        ).format("YYYY-MM-DD");
      }
    }

    rows.push(row);
  }

  return {
    columns,
    rows,
  };
}

type ColumnPayload = {
  label: string;
  type: string;
};

export function formatColumnFromSheet(
  sheetData: any[],
  range: string,
  options: any
) {
  if (sheetData.length === 0 || !sheetData[0]) {
    return;
  }

  const onlyRange = range.split("!")[1];
  const rangeResult = getRangeDimensions(onlyRange!);
  const indexRow = options.headerTitle === false ? 0 : 1;
  const indexCol = 0;

  if (!rangeResult || rangeResult.columns < 0 || rangeResult.rows < 0) {
    return;
  }

  const columns: ColumnPayload[] = [];

  for (let i = indexCol; i < rangeResult.columns; i++) {
    let type;
    let index = indexRow;

    while (type === undefined) {
      if (sheetData[i][index] !== undefined && sheetData[i][index] !== "") {
        if (typeof sheetData[i][index] === "string") {
          type = moment(sheetData[i]![index], GoogleSheetDateFormat).isValid()
            ? "date"
            : "string";
        }
        if (typeof sheetData[i][index] === "number") {
          type = "integer";
        }
        if (typeof sheetData[i][index] === "boolean") {
          type = "boolean";
        }
        break;
      }
      index++;
    }

    const column = {
      label:
        options.headerTitle === false ? `Column ${i}` : `${sheetData[i][0]}`,
      type: type,
    };

    columns.push(column);
  }

  return columns;
}

export function formatDataFromSheet(
  columns,
  sheetData: any[],
  range: string,
  options: any
) {
  if (sheetData.length === 0 || !sheetData[0]) {
    return;
  }

  const onlyRange = range.split("!")[1];
  const rangeResult = getRangeDimensions(onlyRange!);
  const indexRow = options.headerTitle === false ? 0 : 1;
  const indexCol = 0;

  if (!rangeResult || rangeResult.columns < 0 || rangeResult.rows < 0) {
    return;
  }

  const rows: any = [];

  const columnsWithoutIds = columns.filter((column) => column.name !== "id");

  for (let i = indexRow; i < rangeResult.rows; i++) {
    const row = {};

    for (let j = indexCol; j < rangeResult.columns; j++) {
      if (columnsWithoutIds[j]?.type === "string") {
        row[`${columnsWithoutIds[j]?.name}`] = sheetData[j][i].toString();
      }

      if (columnsWithoutIds[j]?.type === "integer") {
        row[`${columnsWithoutIds[j]?.name}`] = sheetData[j][i].toString();
      }

      if (columnsWithoutIds[j]?.type === "boolean") {
        row[`${columnsWithoutIds[j]?.name}`] = Boolean(sheetData[j][i]);
      }

      if (columnsWithoutIds[j]?.type === "date") {
        row[`${columnsWithoutIds[j]?.name}`] = moment(
          sheetData[j][i],
          GoogleSheetDateFormat
        ).format("YYYY-MM-DD");
      }
    }

    rows.push(row);
  }

  return rows;
}
