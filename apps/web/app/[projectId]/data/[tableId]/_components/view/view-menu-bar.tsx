"use client";

import { Button, Input } from "@repo/ui";
import CreateColumnForm from "app/[projectId]/data/_components/create-form/create-column-form";
import React from "react";
import { ColumnDef, RowDef } from "types/table-data";
import QueryBuilderList from "../query-builder-list";

interface ViewMenuBarProps {
  onCommit: any;
  discardData: any;
  // eslint-disable-next-line no-unused-vars
  setSearch?: (e: string) => void;
  setLocalColumns: any;
  setLocalData: any;
  setNewReferenceTableId: any;
  deletedRowIds: Set<number>;
  updatedRowIds: Set<number>;
  addedRowIds: Set<number>;
  createdColumns: Set<ColumnDef>;
  localColumns: ColumnDef[];
  localData: RowDef[];
  tableId: string;
  newReferenceTableId: string[];
  yalcToken: string;
}

export const ViewMenuBar = ({
  onCommit,
  discardData,
  // setSearch,
  setLocalColumns,
  setLocalData,
  deletedRowIds,
  updatedRowIds,
  addedRowIds,
  createdColumns,
  localColumns,
  localData,
  tableId,
  setNewReferenceTableId,
  newReferenceTableId,
  yalcToken,
}: ViewMenuBarProps) => {
  return (
    <div className="flex items-center justify-between w-full px-4">
      <div className="flex flex-start space-x-4">
        <Button
          // disabled
          onClick={() =>
            onCommit(
              localColumns,
              localData,
              addedRowIds,
              deletedRowIds,
              updatedRowIds,
              createdColumns,
              newReferenceTableId
            )
          }
        >
          Commit
        </Button>
        <Button onClick={discardData}>Discard</Button>
        <QueryBuilderList
          columns={localColumns}
          tableId={tableId}
          yalcToken={yalcToken}
          setLocalColumns={setLocalColumns}
          setLocalData={setLocalData}
        />
      </div>

      <div className="flex flex-end space-x-4 mb-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="email"
            placeholder="Find Present ..."
            // onChange={(e) => setSearch!(e.target.value)}
          />
        </div>

        <div className="flex w-full max-w-sm items-center space-x-2">
          <CreateColumnForm
            setLocalColumns={setLocalColumns}
            setLocalData={setLocalData}
            tableId={tableId}
            setNewReferenceTableId={setNewReferenceTableId}
            createdColumns={createdColumns}
          />
        </div>
      </div>
    </div>
  );
};
