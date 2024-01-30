'use client';

import React, { useState, useEffect } from 'react';
// import { QueryBuilder } from 'react-querybuilder';
// import 'react-querybuilder/dist/query-builder.css';
import Modeler from 'bpmn-js/lib/Modeler';
import axios from 'axios';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import { 
   BpmnPropertiesPanelModule, 
   BpmnPropertiesProviderModule
 } from 'bpmn-js-properties-panel';

const Page = () => {
  const [diagram, diagramSet] = useState('');
  const container: HTMLElement = document.getElementById('bpmn-container')!;

  useEffect(() => {
    if (diagram.length === 0) {
      axios
        .get(
          'https://cdn.statically.io/gh/camunda/camunda-modeler/v3.5.0/resources/diagram/simple.bpmn',
        )
        .then((r) => {
          diagramSet(r.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [diagram]);

  if (diagram.length > 0) {
    const modeler = new Modeler({
      container,
      keyboard: {
        bindTo: document,
      },
      // propertiesPanel: {
      //    parent: '#properties-panel'
      //  },
      //  additionalModules: [
      //    BpmnPropertiesPanelModule,
      //    BpmnPropertiesProviderModule
      //  ],
    });

    modeler.createDiagram();
  }

  return (
    <div>
      <div
        id="bpmn-container"
        style={{
          //  border: "1px solid #000000",
          height: '90vh',
          width: '90vw',
          margin: 'auto',
        }}
      ></div>
    </div>
  );
};

export default Page;

// import { ReactFlowProvider } from "reactflow";
// import Sidebar from "./components/Sidebar/Sidebar";
// import "reactflow/dist/style.css";
// import "./style.css";
// import { DnDFlow } from "./components/DnDFlow/DnDFlow";

// export default function Page() {
//    return (
//       <div className="dndflow">
//          <ReactFlowProvider>
//             <Sidebar />
//             <DnDFlow />
//          </ReactFlowProvider>
//       </div>
//    );
// }

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
