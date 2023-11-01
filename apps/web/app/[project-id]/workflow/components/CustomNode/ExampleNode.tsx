import React, { memo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

const handleStyle = { left: 10 };

const ExampleNode: React.FC<{data: any, isConnectable: boolean}> = ({data, isConnectable = true}) => {
  const onChange = useCallback((event) => {
    console.log(event.target.value);
  }, []);
  
  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      />
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  )
}

export default memo(ExampleNode)