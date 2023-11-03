import React from 'react'
// import { Node } from 'reactflow';
import { CustomNodeType } from '../../utils';

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }

  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the right.</div>
      {
        CustomNodeType.map((type, index ) => (
          <div key={index} className="dndnode" onDragStart={(event) => onDragStart(event, type)} draggable>
            {`${type.toUpperCase()} Node`}
          </div>
        ))
      }
    </aside>
  );
}

export default Sidebar