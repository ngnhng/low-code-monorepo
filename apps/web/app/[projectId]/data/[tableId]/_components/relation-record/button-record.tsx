import React from "react";

import { Button, Dialog, DialogContent, DialogTrigger } from "@repo/ui";
import { RelationRecordsType } from "./relation-records";
import { Link } from "lucide-react";
import { DetailedRecord } from "./detailed-record";

interface ButtonRecordProps {
  record: RelationRecordsType;
  handleItemClick: any;
  referenceTableId: string;
}

export const ButtonRercord = ({
  record,
  handleItemClick,
  referenceTableId,
}: ButtonRecordProps) => {
  return (
    <Button
      variant={"outline"}
      data-id={record.id}
      onClick={() => handleItemClick(record.id)}
      size={"default"}
      className="w-full flex justify-between h-[100px] mb-2"
    >
      {/* <div className="flex flex-col w-full"> */}
      {/* <div className="flex items-center justify-between rounded-md border p-6 w-full"> */}
      <div className="flex flex-col items-start justify-start">
        <h3 className="text-muted-foreground font-bold text-sm">
          Record ID: {record.id}
        </h3>

        <Dialog>
          <DialogTrigger
            asChild
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <p className="mt-4 text-xs text-blue-500 underline hover:cursor-pointer">
              Preview Item
            </p>
          </DialogTrigger>
          <DialogContent
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DetailedRecord
              record={record}
              referenceTableId={referenceTableId}
            />
          </DialogContent>
        </Dialog>
      </div>
      {record.linkedState ? (
        <span>
          <Link className="text-ring" size={16}></Link>
        </span>
      ) : (
        <div className="pl-[16px]" />
      )}
      {/* </div> */}
    </Button>
  );
};
