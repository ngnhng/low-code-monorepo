'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  addEdge,
  Node,
  Edge,
  OnConnect,
  ReactFlowInstance,
  Panel,
  useReactFlow,
  MarkerType
} from 'reactflow';
import Sidebar from './components/Sidebar/Sidebar';
import { ConditionalNode, ExampleNode } from './components/CustomNode';
import { initialNodes, initialEdges } from './data';
import { v4 as uuidv4 } from 'uuid'
import 'reactflow/dist/style.css';
import './style.css';

const flowKey = 'example-flow';
// let id = 1;
// const getId = () => `${id++}`;
const getId = () => `${uuidv4()}`;

const DnDFlow = () => {
  const nodeTypes = useMemo(() => ({ example: ExampleNode, conditional: ConditionalNode }), []);

  const reactFlowWrapper = useRef<HTMLParagraphElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { setViewport } = useReactFlow();

  // TODO: Modify that can choose which node created
  const initialNodeType: Node = {
    id : getId(),
    type : 'default',
    position : { x: initialNodes[0].position.x, y: nodes.length*100},
    data: { label: 'New Node' },
    width: 150
  }

  const initialEdge: Edge = {
    id: String(parseInt(`${Math.random()*1000000}`)),
    source: nodes[nodes.length-2].id,
    target: nodes[nodes.length-1].id,
    label: '+',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }

  // * QUITE SAME WITH WORKFLOW BUILDER NOVU
  const tempHandleEdgeClick = (event, data: Edge) => {
    const targetNode: Node | undefined = nodes.find((node) => {
      return node.id === data.target
    })
    
    if (targetNode) {
      const changeEdge: Edge | undefined = edges.find((edge) => {
        return edge.source === data.source && edge.target === data.target
      });
      
      // TODO: Function to return Node and Edge
      const newNode: Node = {
        id : getId(),
        type : 'default',
        position : { x: initialNodes[0].position.x, y: nodes.length*100},
        data: { label: `New Node` },
        width: 150
      }
      
      if (changeEdge) {
        changeEdge.target = newNode.id;
      }
      
      const newEdge: Edge = {
        id: getId(),
        source: newNode.id,
        target: targetNode.id,
        label: '+',
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      }
      
      setEdges((prev) => prev.concat(newEdge));
      setNodes((prev) => prev.concat(newNode));
    }
  }

  const tempHandleNodeClick = (event, data: Node) => {
    const newNode: Node = {
      id : getId(),
      type : 'default',
      position : { x: initialNodes[0].position.x, y: nodes.length*100},
      data: { label: `New Node` },
      width: 150
    }

    const newEdge: Edge = {
      id: getId(),
        source: data.id,
        target: newNode.id,
        label: '+',
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
    }

    setEdges((prev) => prev.concat(newEdge));
    setNodes((prev) => prev.concat(newNode));
  }

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

      console.log("type: " + type);

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

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));

      console.log("format: ", JSON.stringify(flow));
    }


  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {

      if (!localStorage.getItem(flowKey)) {
        return;
      }

      const flow = JSON.parse(localStorage.getItem(flowKey) || "");

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  return (
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeClick={tempHandleEdgeClick}
            onNodeClick={tempHandleNodeClick}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Panel position="top-right">
              <button onClick={onSave}>save</button>
              <button onClick={onRestore}>restore</button>
            </Panel>
            <Controls position='bottom-left'/>
          </ReactFlow>
        </div>
  );
}

export default function Page() {
  return (
    <div className='dndflow'>
        <ReactFlowProvider>
          <Sidebar />
			    <DnDFlow />
        </ReactFlowProvider>
    </div>
  )
}


/* 
* NOTE: QUITE SAME WITH THE WORKFLOW BUILDER OF REACT-FLOW-PRO

const [addNode, setAddNode] = useState<boolean>(false);
const [addChildNode, setAddChildNode] = useState<boolean>(false);
const [parentNode, setParentNode] = useState<Node | null>(null);

useEffect(() => {
   if (addNode) {
      const findFirstNode = nodes.find(
         (item) => item.id === initialEdge.target
      );
      setEdges((eds) =>
         eds.concat({
            ...initialEdge,
            // source: parentNode.id,
         })
      );
      setAddNode(false);
      setParentNode(null);
   }

   if (addChildNode) {
      setEdges((eds) =>
         eds.concat({
            id: String(parseInt(`${Math.random() * 1000000}`)),
            source: parentNode.id,
            target: nodes[nodes.length - 1].id,
            label: "+",
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 4,
            labelBgStyle: { fill: "#FFCC00", color: "#fff", fillOpacity: 0.7 },
            markerEnd: {
               type: MarkerType.ArrowClosed,
            },
         })
      );
      setAddChildNode(false);
      setParentNode(null);
   }
}, [nodes]);

const handleEdgeClick = (event, data: Edge) => {
   const findSourceNode: Node | undefined = nodes.find(
      (item) => item.id === data.source
   );

   if (findSourceNode) {
      setNodes((nds) =>
         nds.concat({
            ...initialNodeType,
            parentNode: data.target,
            data: { parentId: data.target, ...initialNodeType.data },
         })
      );

      setParentNode(findSourceNode);
      setAddNode(true);
   }
   return;
};

const handleNodeClick = (event, data: Node) => {
   const filterNodesWithSameSource = nodes.filter((node) => {
      node.parentNode === data?.id;
   });

   const newNode: Node = {
      id: getId(),
      type: "default",
      position: {
         x: data.position.x + filterNodesWithSameSource.length * 160,
         y: data.position.y + 100,
      },
      data: { label: "New Node", parentId: data.id },
      parentNode: data.id,
      width: 150,
   };

   setNodes((nds) => nds.concat(newNode));
   setAddChildNode(true);
   setParentNode(data);
};

*/