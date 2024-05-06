import moment from "moment";

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
      return "string";
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

export function inferTypeFromService(type: string, value) {
  switch (type) {
    case "integer": {
      return Number.parseInt(value);
    }
    case "boolean": {
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
