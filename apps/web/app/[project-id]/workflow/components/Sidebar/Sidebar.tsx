import React, { useState } from "react";
import {
   Artifacts,
   BpmnElementCategory,
   Choreography,
   ConnectingObjects,
   Conversations,
   FlowObjects,
   Swimlanes,
} from "../../types/BPMN/BPMN";
import { CustomNodeMapping, CustomNodeType } from "../../utils";

const Sidebar = () => {
   const onDragStart = (event: React.DragEvent, nodeType) => {
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
   };

   const nodeGroups = [
      { category: "Flow Objects", values: Object.values(FlowObjects) },
      {
         category: "Connecting Objects",
         values: Object.values(ConnectingObjects),
      },
      { category: "Swimlanes", values: Object.values(Swimlanes) },
      { category: "Artifacts", values: Object.values(Artifacts) },
      { category: "Conversations", values: Object.values(Conversations) },
      { category: "Choreography", values: Object.values(Choreography) },
   ];

   const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

   const toggleGroup = (group: string) => {
      setExpandedGroups((prev) =>
         prev.includes(group)
            ? prev.filter((g) => g !== group)
            : [...prev, group]
      );
   };

   return (
      <aside
         style={{
            backgroundColor: "var(--puck-color-rose-9)",
            overflowY: "scroll",
            maxHeight: "calc(100vh - 60px)",
         }}
      >
         <div className="description">
            You can drag these nodes to the pane on the right.
         </div>
         {nodeGroups.map((group, index) => (
            <div key={index}>
               <div
                  style={{
                     backgroundColor: expandedGroups.includes(group.category)
                        ? "var(--puck-color-rose-6)"
                        : "var(--puck-color-rose-7)",
                     color: "white",
                     padding: "5px",
                     cursor: "pointer",
                  }}
                  onClick={() => toggleGroup(group.category)}
               >
                  {group.category}
               </div>
               {expandedGroups.includes(group.category) && (
                  <NodeGroup group={group} onDragStart={onDragStart} />
               )}
            </div>
         ))}
      </aside>
   );
};

const NodeGroup = ({ group, onDragStart }) => {
   return (
      <div
         style={{
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
            margin: "10px 0",
         }}
      >
         {group.values.map((type: string, index: number) => {
            const NodeComponent = CustomNodeMapping[type];
            if (NodeComponent) {
               console.log(type);
            }
            return NodeComponent ? (
               <Node
                  key={index}
                  type={type}
                  onDragStart={(event) =>
                     onDragStart(event, type.toLowerCase())
                  }
               />
            ) : (
               <div>Node not found</div>
            );
         })}
      </div>
   );
};

const Node = ({ key, type, onDragStart }) => (
   <div key={key} className="dndnode" onDragStart={onDragStart} draggable>
      {`${type} Node`}
   </div>
);

export default Sidebar;
