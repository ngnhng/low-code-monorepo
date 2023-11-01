import React from 'react'
// import { Node } from 'reactflow';

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }

  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the right.</div>
      <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'input')} draggable>
        Input Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Default Node
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Output Node
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'example')} draggable>
        Example Node
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'conditional')} draggable>
        Conditional Node
      </div>
    </aside>
  );
}

export default Sidebar