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
