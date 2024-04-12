import React from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui";

import { RelationRecordsType } from "./relation-records";
import { X } from "lucide-react";

interface DetailedRecordProps {
  record: RelationRecordsType;
}

export const DetailedRecord = ({ record }: DetailedRecordProps) => {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Record: {record.id}</CardTitle>
        <CardDescription>Details of the Records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <div>
            {objectToArray(record).map((r, index) => {
              return (
                r.key !== "linkedState" && (
                  <div key={index} className="mb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {r.key}
                      </p>
                      <p className="text-sm text-muted-foreground">{r.value}</p>
                    </div>
                  </div>
                )
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <X className="mr-2 h-4 w-4" /> Close
        </Button>
      </CardFooter>
    </Card>
  );
};

// eslint-disable-next-line no-unused-vars
function objectToArray(obj: any) {
  const result: any[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // result += `${key}: ${obj[key]}`;
      result.push({
        key: `${key}`,
        value: `${obj[key]}`,
      });
    }
  }
  return result;
}
