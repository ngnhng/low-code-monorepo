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
import { Link, Plus } from 'lucide-react'
import { DemoDataType } from './relation-records'

const newHardData: DemoDataType[] = [
  {
    id: '6',
    content: 'Linked Record 6 from Table A',
    linkedState: false,
  },
  {
    id: '7',
    content: 'Linked Record 7 from Table A',
    linkedState: false,
  },
  {
    id: '8',
    content: 'Linked Record 8 from Table A',
    linkedState: false,
  },
  {
    id: '9',
    content: 'Linked Record 9 from Table A',
    linkedState: false,
  },
  {
    id: '10',
    content: 'Linked Record 10 from Table A',
    linkedState: false,
  },
]

interface AddRecordProps {
  linkedData: DemoDataType[];
  setLinkedData: any;
}

const AddRecord = (
  {
    linkedData,
    setLinkedData,
  } : AddRecordProps
) => {
  
  const [tableRecord, setTableRecord] = useState(newHardData);
  
  // console.log("Checking State:", tableRecord);

  const handleItemClick = (id: string) => {
    setTableRecord((previousData) =>
      previousData.map((data) => {
        if (data.id === id) {
          if (data.linkedState === false) {
            const newLinkedData = [...linkedData]
            newLinkedData.push({
              ...data,
              linkedState: true,
            });
            setLinkedData(newLinkedData);
          }

          return {
            ...data,
            linkedState: !data.linkedState,
          }
        }

        return {
          ...data
        }
        // return data.id === id ? { ... data, linkedState: !data.linkedState} : { ...data}
      })
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
        >
          <Plus size={16} className='mr-2'></Plus>
          Add Record
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Record</DialogTitle>
          <Separator></Separator>
        </DialogHeader>

        <ul>
          {
            tableRecord.map((data, index) => {
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
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddRecord