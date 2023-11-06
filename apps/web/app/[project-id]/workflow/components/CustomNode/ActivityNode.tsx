import React, { useEffect, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow';
import ConfigPanel from '../ConfigPanel/ConfigPanel';

const ActivityNode = ({data, id, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(data.label);

  useEffect(() => {
    data.label = label;
  }, [label])
  
  return (
    <>
      <div className='activityNode' onClick={() => setOpen(!open)}>
        <Handle type='target' position={targetPosition}/>
          {label}
        <Handle type='source' position={sourcePosition}/>
      </div>
      <ConfigPanel id={id} label={label} open={open} setLabel={setLabel} />
    </>
  )
}

export default ActivityNode