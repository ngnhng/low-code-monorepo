import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow';

const ActivityNode = ({data, id, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) => {
  return (
    <div className='activityNode'>
      <Handle type='target' position={targetPosition}/>
        {""}
      <Handle type='source' position={sourcePosition}/>
    </div>
  )
}

export default ActivityNode