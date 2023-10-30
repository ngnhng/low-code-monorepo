'use client';

import React, { useState, useRef, useCallback } from 'react';

import 'reactflow/dist/style.css';

import './components/Sidebar/style.css';

import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  addEdge,
  // FitViewOptions,
	// DefaultEdgeOptions,
  // applyNodeChanges,
  // applyEdgeChanges,
  Node,
  Edge,
  // OnNodesChange,
  // OnEdgesChange,
  OnConnect,
  ReactFlowInstance,
} from 'reactflow';

import Sidebar from './components/Sidebar/Sidebar';

// import CustomNode from './CustomNode';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef<HTMLParagraphElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    if (reactFlowWrapper) {
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (reactFlowInstance && reactFlowBounds) {
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
          id: getId(),
          type,
          position,
          data: { label: `${type} node` },
        };

        setNodes((nds) => nds.concat(newNode));

      }
    } else {
      return;
    }
  }, [reactFlowInstance])

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <Sidebar />
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Controls position='bottom-left'/>
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}

// const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

// const fitViewOptions: FitViewOptions = {
//   padding: 0.2,
// };

// const defaultEdgeOptions: DefaultEdgeOptions = {
//   animated: true,
// };

// const nodeTypes: NodeTypes = {
//   custom: CustomNode,
// };

// function Flow() {
//   const [nodes, setNodes] = useState<Node[]>(initialNodes);
//   const [edges, setEdges] = useState<Edge[]>(initialEdges);

//   const onNodesChange: OnNodesChange = useCallback(
//     (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
//     [setNodes]
//   );
//   const onEdgesChange: OnEdgesChange = useCallback(
//     (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
//     [setEdges]
//   );
//   const onConnect: OnConnect = useCallback(
//     (connection) => setEdges((eds) => addEdge(connection, eds)),
//     [setEdges]
//   );

//   return (
//     <ReactFlow
//       nodes={nodes}
//       edges={edges}
//       onNodesChange={onNodesChange}
//       onEdgesChange={onEdgesChange}
//       onConnect={onConnect}
//       fitView
//       fitViewOptions={fitViewOptions}
//       defaultEdgeOptions={defaultEdgeOptions}
//       // nodeTypes={nodeTypes}
//     />
//   );
// }

export default function Page() {
  return (
    <>
			<DnDFlow />
    </>
  )
}