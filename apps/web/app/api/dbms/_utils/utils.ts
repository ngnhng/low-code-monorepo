import moment from "moment";
import { ColumnType } from "types/table-data";

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

export function mappingTypeToUI(type: string): string {
  switch (type) {
    case "string": {
      return "text";
    }
    case "integer": {
      return "number";
    }
    case "boolean": {
      return "boolean";
    }
    case "link": {
      return "link";
    }
    case "date": {
      return "date";
    }
    default: {
      return type;
    }
  }
}

export const supportedDateFormat = [
  "MMM/DD/YYYY",
  "MM-DD-YYYY",
  "DD MMM YYYY",
  "YYYY-MM-DD",
  "DD-MM-YYYY",
  "MM/DD/YYYY",
  "MMM DD, YYYY",
  "YYYY-MM-DD hh:mm:ss",
];

export function inferValueType(type: string, value) {
  switch (type) {
    case "number": {
      return Number.parseInt(value);
    }
    case "boolean": {
      if (value === undefined) {
        return value;
      }

      return value === "true" ? true : false;
    }
    case "link": {
      return value;
    }
    case "text": {
      return value;
    }
    case "date": {
      return moment(value, supportedDateFormat).format("YYYY-MM-DD");
    }
    default: {
      return value;
    }
  }
}

export function inferTypeFromService(type: string, value) {
  switch (type) {
    case "integer": {
      return Number.parseInt(value);
    }
    case "boolean": {
      if (value === undefined) {
        return value;
      }

      return value === "true" ? true : false;
    }
    case "link": {
      return value;
    }
    case "string": {
      return value;
    }
    case "date": {
      return moment(value, supportedDateFormat).format("YYYY-MM-DD");
    }
    default: {
      return value;
    }
  }
}

export const formatValidUiDate = (value: string) => {
  return moment(value, supportedDateFormat).format("YYYY-MM-DD");
};

export function mappingType(type: ColumnType) {
  switch (type) {
    case "text": {
      return "string";
    }
    case "number": {
      return "integer";
    }
    case "boolean": {
      return "boolean";
    }
    case "date": {
      return "date";
    }
    case "link": {
      return "link";
    }
    default: {
      return "string";
    }
  }
}

export function mappingValueDate(columns, rows) {
  for (const row of rows) {
    const fields = Object.keys(row);
    for (const field of fields) {
      const matchingColumn = columns.find((column) => column.name === field);

      if (matchingColumn && matchingColumn.type === "date") {
        row[field] = formatValidUiDate(row[field]);
      }
    }
  }

  return rows;
}
