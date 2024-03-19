'use client';

import React, { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Separator,
} from '@repo/ui';
import { Eye, FileText, Link } from 'lucide-react';
// import AddRecord from './add-record';
import { TextWithIcon } from 'components/text/text-with-icon';
import { useMobxStore } from 'lib/mobx/store-provider';
import useSWR from 'swr';
// import { RowDef } from 'types/table-data';

// interface RelationRecordsProps {
//   referenceTableId: string;
// }

// ? Progress: Using hard-data

export interface RelationRecordsType {
  id: number;
  content?: string;
  linkedState: boolean;
}

// export const HardData: RelationRecordsType[] = [
//   {
//     id: '1',
//     content: 'Linked Record 1 from Table A',
//     linkedState: true,
//   },
//   {
//     id: '2',
//     content: 'Linked Record 2 from Table A',
//     linkedState: true,
//   },
//   {
//     id: '3',
//     content: 'Linked Record 3 from Table A',
//     linkedState: true,
//   },
//   {
//     id: '4',
//     content: 'Linked Record 4 from Table A',
//     linkedState: true,
//   },
//   {
//     id: '5',
//     content: 'Linked Record 5 from Table A',
//     linkedState: true,
//   },
// ];

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
        id: record.id,
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
    console.log('click');
    setLinkedData((previousData) =>
      previousData.map((record) => {
        if (record.id === id) {
          if (record.linkedState === true) {
            const indexToRemove = linkedRecordIds.indexOf(id.toString());

            if (indexToRemove !== -1) {
              linkedRecordIds.splice(indexToRemove, 1);
            }

            console.log(linkedRecordIds);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex align-middle justify-between">
            <TextWithIcon icon={<FileText />}>Linked Records</TextWithIcon>
          </DialogTitle>
          <Separator></Separator>
        </DialogHeader>

        {linkedData.length > 0 ? (
          <ul>
            {linkedData.map((data, index) => {
              // ? When come to real ? data.linkedState &&
              return (
                <Button
                  key={index}
                  variant={'ghost'}
                  className="w-full justify-between flex"
                  data-id={data.id}
                  onClick={() => handleItemClick(data.id)}
                >
                  Record ID: {data.id}
                  {data.linkedState && (
                    <span>
                      <Link className="text-ring" size={16}></Link>
                    </span>
                  )}
                </Button>
              );
            })}
          </ul>
        ) : undefined}
        <Separator></Separator>
        <DialogFooter>
          <Button type="submit" disabled>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RelationRecords;
