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
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  MarkerType,
  Background
} from 'reactflow';
import Sidebar from './components/Sidebar/Sidebar';
import ConfigPanel from './components/ConfigPanel/ConfigPanel';
import { v4 as uuidv4 } from 'uuid'
import { initialNodes, initialEdges } from './data';
import { createNode, createEdge, CustomNode } from './utils';
import 'reactflow/dist/style.css';
import './style.css';

const flowKey = 'example-flow';

const getId = () => `${uuidv4()}`;

const DnDFlow = () => {
  const nodeTypes = useMemo(() => (CustomNode), []);

  const reactFlowWrapper = useRef<HTMLParagraphElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { setViewport } = useReactFlow();
  // const {}
  const [edgeClick, setEdgeClick] = useState<Edge | null>(null);
  const [nodeCheck, setNodeCheck] = useState<Node | null>(null);

  useEffect(() => {
    if (edgeClick) {
      // * change the edge 
      const newEdge = createEdge(nodes[nodes.length - 1].id, edgeClick.target);

      setEdges((prev) => {
        prev.map(e => {
          if (e.id === edgeClick.id) {
            e.target = nodes[nodes.length - 1].id;
          }
          return e;
        })

        return prev.concat(newEdge)
      });

      setEdgeClick(null);
      setNodeCheck(null);
    }
  }, [nodes])

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

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

	const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

	// TODO: Refactor this to save to database
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

  const handleNodeClick = (event, data: Node) => {
    const newNode: Node = createNode('default', { x: data.position.x, y: data.position.y + 100}, { label: `New Node` })
    const newEdge: Edge = createEdge(data.id, newNode.id)
    setEdges((prev) => prev.concat(newEdge));
    setNodes((prev) => prev.concat(newNode));
  }

  const handleEdgeClick = (event, data: Edge) => {
    const targetNode: Node | undefined = nodes.find((node) => {
      return node.id === data.target
    })

    // Assume 1: 
    if (targetNode) {
      const newNode: Node = createNode('default', {x: targetNode.position.x, y: targetNode.position.y},{ label: `New Node` })
      setNodes((prev) => prev.concat(newNode));
      setEdgeClick(data);
      setNodeCheck(targetNode);
    }

    return;
  }

  const onNodesDelete = useCallback((deleted: Node[]) => {
    setEdges(
      deleted.reduce((acc, node) => {
        const incomers = getIncomers(node, nodes, edges);
        const outgoers = getOutgoers(node, nodes, edges);
        const connectedEdges = getConnectedEdges([node], edges);

        const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));

        const createdEdges = incomers.flatMap(({ id: source }) =>
          outgoers.map(({ id: target }) => ({ id: `${source}->${target}`, source, target }))
        );

        return [...remainingEdges, ...createdEdges];
      }, edges)
    )
  },[nodes, edges])

  return (
    <div className='reactflow-wrapper' ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodesDelete={onNodesDelete}
				onDrop={onDrop}
				onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onConnect={onConnect}
        fitView
      >
				<Panel position="bottom-right">
              <button onClick={onSave}>save</button>
              <button onClick={onRestore}>restore</button>
            </Panel>
        <Controls position='bottom-left'/>
        <Background variant="dots" gap={12} size={1} />
        <ConfigPanel id="abc" label="abc" setNodes={setNodes}/>
      </ReactFlow>
    </div>
  )
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
* The ReactFlowInstance provides a collection of methods to query and manipulate the internal state of your flow

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