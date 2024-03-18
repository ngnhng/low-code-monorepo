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

// interface RelationRecordsProps {
//   referenceTableId: string;
// }

// ? Progress: Using hard-data

export interface DemoDataType {
  id: string;
  content: string;
  linkedState: boolean;
}

export const HardData: DemoDataType[] = [
  {
    id: '1',
    content: 'Linked Record 1 from Table A',
    linkedState: true,
  },
  {
    id: '2',
    content: 'Linked Record 2 from Table A',
    linkedState: true,
  },
  {
    id: '3',
    content: 'Linked Record 3 from Table A',
    linkedState: true,
  },
  {
    id: '4',
    content: 'Linked Record 4 from Table A',
    linkedState: true,
  },
  {
    id: '5',
    content: 'Linked Record 5 from Table A',
    linkedState: true,
  },
];

/*
 * For now, let the referenceId !
 */
interface RelationRecordsProps {
  referenceTableId: string;
  linkedRecordIds: any;
  setNumberOfRecords: any;
}

function countTrueState(objects) {
  return objects.filter((object) => object.linkedState === true).length;
}

const RelationRecords = ({
  setNumberOfRecords,
  linkedRecordIds,
}: RelationRecordsProps) => {
  const [linkedData, setLinkedData] = useState(HardData);

  useEffect(() => {
    setNumberOfRecords(countTrueState(linkedData));
  }, [linkedData]);

  // TODO: SWR to get records data
  const handleItemClick = (id: string) => {
    setLinkedData((previousData) =>
      previousData.map((data) => {
        return data.id === id
          ? { ...data, linkedState: !data.linkedState }
          : { ...data };
      }),
    );

    linkedRecordIds.push(id); //
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
            {/* <p className=''>Linked Records</p>
            <FileText className='flex-1'></FileText> */}
            <TextWithIcon icon={<FileText />}>Linked Records</TextWithIcon>
          </DialogTitle>
          <Separator></Separator>
        </DialogHeader>

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
                {data.content}
                {data.linkedState && (
                  <span>
                    <Link className="text-ring" size={16}></Link>
                  </span>
                )}
              </Button>
            );
          })}
        </ul>
        <Separator></Separator>
        <DialogFooter>
          {/* <Separator></Separator> */}
          {/* <AddRecord  linkedData={linkedData} setLinkedData={setLinkedData}/> */}
          <Button type="submit" disabled>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RelationRecords;
