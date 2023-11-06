import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow';

const GatewayNode = ({data, id, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) => {
  return (
    <div className='handleWrapper'>
      <div className='gatewayNode'>
          {""}
        <Handle type='target' position={targetPosition}/>
        <Handle type='source' position={sourcePosition}/>
      </div>
    </div>
  )
}

export default GatewayNode