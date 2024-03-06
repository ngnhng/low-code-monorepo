import React, { useState } from 'react'

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
} from '@repo/ui'
import { FileText, Link, Plus } from 'lucide-react'
// import AddRecord from './add-record';

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
]

// interface RelationRecordsProps {
//   linkedData: DemoDataType[];
//   setLinkedData: any;
// }

const RelationRecords = () => {

  const [linkedData, setLinkedData] = useState(HardData);
  // const [open, setOpen] = useState(true);

  // TODO: SWR to get records data
  const handleItemClick = (id: string) => {
    setLinkedData((previousData) =>
      previousData.map((data) => {
        return data.id === id ? { ... data, linkedState: !data.linkedState} : { ...data}
      })
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild> 
        <Button size={"sm"} variant="secondary" className=''>
          <Plus size={24} /> Records
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex align-middle justify-between'>
            <p className=''>Linked Records</p>
            <FileText className='flex-1'></FileText>
          </DialogTitle>
          <Separator></Separator>
        </DialogHeader>

        <ul>
          {
            linkedData.map((data, index) => {
              // ? When come to real ? data.linkedState &&
              return  (
                <Button 
                  key={index} 
                  variant={"ghost"} 
                  className='w-full justify-between flex'
                  data-id={data.id}
                  onClick={() => handleItemClick(data.id)} 
                >
                  {data.content}
                  {data.linkedState && (<span><Link className='text-ring' size={16}></Link></span>)}
                </Button>
              )
            })
          }
        </ul>
        <Separator></Separator>
        <DialogFooter>
          {/* <Separator></Separator> */}
          {/* <AddRecord  linkedData={linkedData} setLinkedData={setLinkedData}/> */}
          <Button type="submit" disabled>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RelationRecords