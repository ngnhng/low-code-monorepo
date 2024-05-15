import React from "react";

import {
  // Button,
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui";

import { RelationRecordsType } from "./relation-records";
import { useMobxStore } from "lib/mobx/store-provider";
// import { X } from "lucide-react";

interface DetailedRecordProps {
  record: RelationRecordsType;
  referenceTableId: string;
}

export const DetailedRecord = ({
  record,
  referenceTableId,
}: DetailedRecordProps) => {
  const {
    tableData: { tables },
  } = useMobxStore();

  const referenceTable = tables.find((table) => table.id === referenceTableId);

  const modifiedRecord: RelationRecordsType = referenceTable
    ? mappingToLabelKey(referenceTable.columns, record)
    : record;

  return (
    <Card className="border-none overflow-auto max-h-[80vh]">
      <CardHeader>
        <CardTitle>Record: {record.id}</CardTitle>
        <CardDescription>Details of the Record</CardDescription>
      </CardHeader>
      <CardContent>
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <div>
            {Object.entries(modifiedRecord).map(([key, value], index) => {
              if (typeof value === "object") {
                return;
              }

              if (key === "linkedState") {
                return;
              }

              return (
                <div key={index} className="mb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{key}</p>
                    <p className="text-sm text-muted-foreground">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      {/* <CardFooter>
        <Button className="w-full">
          <X className="mr-2 h-4 w-4" /> Close
        </Button>
      </CardFooter> */}
    </Card>
  );
};

function mappingToLabelKey(columns, row) {
  // eslint-disable-next-line unicorn/no-array-for-each
  Object.entries(row).forEach(([key, value]) => {
    const column = columns.find((column) => column.name === key);

    if (column && column.name !== "id") {
      row[column.label] = value;
      delete row[key];
    }
  });

  console.log("MAPPING", row);

  return row;
}

// eslint-disable-next-line no-unused-vars
// function objectToArray(obj: any) {
//   const result: any[] = [];
//   for (const key in obj) {
//     if (Object.prototype.hasOwnProperty.call(obj, key)) {
//       // result += `${key}: ${obj[key]}`;
//       result.push({
//         key: `${key}`,
//         value: `${obj[key]}`,
//       });
//     }
//   }
//   return result;
// }
