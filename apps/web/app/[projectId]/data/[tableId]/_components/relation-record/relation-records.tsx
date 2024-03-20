'use client';

import React, { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  // DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Separator,
} from '@repo/ui';
import { Eye, FileText } from 'lucide-react';
// import AddRecord from './add-record';
import { TextWithIcon } from 'components/text/text-with-icon';
import { useMobxStore } from 'lib/mobx/store-provider';
import useSWR from 'swr';
import { RowDef } from 'types/table-data';
import { ButtonRercord } from './button-record';

// ? Progress: Using hard-data

export interface RelationRecordsType extends RowDef {
  linkedState: boolean;
}

/*
 * For now, let the referenceId !
 */
interface RelationRecordsProps {
  referenceTableId: string;
  linkedRecordIds: any;
  setNumberOfRecords: any;
  rowData: any;
  columnData: any;
}

function countTrueState(objects) {
  return objects.filter((object) => object.linkedState === true).length;
}

const RelationRecords = ({
  referenceTableId,
  setNumberOfRecords,
  linkedRecordIds,
  rowData,
}: RelationRecordsProps) => {
  const [linkedData, setLinkedData] = useState<RelationRecordsType[]>([]);

  const {
    projectData: { currentProjectId },
    tableData: { fetchTableRecords },
  } = useMobxStore();

  const { data, isLoading } = useSWR(
    `TABLE_DATA-${currentProjectId}-${referenceTableId}-rows`,
    () => fetchTableRecords(referenceTableId),
  );
  useEffect(() => {
    if (data) {
      const mappingData: RelationRecordsType[] = data.map((record) => ({
        ...record,
        linkedState: rowData.referenceRecords.includes(record.id.toString()),
      }));

      setLinkedData(mappingData);
    }
  }, [data]);

  useEffect(() => {
    setNumberOfRecords(countTrueState(linkedData));
  }, [linkedData]);

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  const handleItemClick = (id: number) => {
    setLinkedData((previousData) =>
      previousData.map((record) => {
        if (record.id === id) {
          if (record.linkedState === true) {
            const indexToRemove = linkedRecordIds.indexOf(id.toString());

            if (indexToRemove !== -1) {
              linkedRecordIds.splice(indexToRemove, 1);
            }
          } else {
            linkedRecordIds.push(id.toString());
          }

          return { ...record, linkedState: !record.linkedState };
        }

        return { ...record };
      }),
    );

    // NO IDEA WHY IN SET STATE RUN 2 TIMES
    linkedRecordIds = linkedRecordIds.filter(
      (item, index) => linkedRecordIds.indexOf(item) === index,
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center">
          <Button size={'sm'} variant="secondary" className="mr-4">
            <Eye size={24} />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="min-w-[300px]">
        <DialogHeader>
          <DialogTitle className="flex align-middle justify-between">
            <TextWithIcon icon={<FileText />}>Linked Records</TextWithIcon>
          </DialogTitle>
          <Separator></Separator>
        </DialogHeader>
        <div className="overflow-auto">
          {linkedData.length > 0 ? (
            <ul className="max-h-[400px]">
              {linkedData.map((data, index) => {
                return (
                  <ButtonRercord
                    key={index}
                    handleItemClick={handleItemClick}
                    record={data}
                  />
                  // <Button
                  //   key={index}
                  //   variant={'ghost'}
                  //   className="w-full justify-between flex"
                  //   data-id={data.id}
                  //   onClick={() => handleItemClick(data.id)}
                  // >
                  //   Record ID: {data.id}
                  // {data.linkedState && (
                  //   <span>
                  //     <Link className="text-ring" size={16}></Link>
                  //   </span>
                  // )}
                  // </Button>
                );
              })}
            </ul>
          ) : undefined}
        </div>
        <Separator></Separator>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RelationRecords;
