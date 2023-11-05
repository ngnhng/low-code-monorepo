import React, { useState } from "react";
import { CustomNodeType } from "../../utils";

const Sidebar = () => {
   const onDragStart = (event: React.DragEvent, nodeType) => {
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
   };

   const nodeGroups = ["Group 1", "Group 2", "Group 3"];
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
		}}
	  >
         <div className="description">
            You can drag these nodes to the pane on the right.
         </div>
         {nodeGroups.map((group, index) => (
            <div key={index}>
               <div
                  style={{
                     backgroundColor: expandedGroups.includes(group)
                        ? "var(--puck-color-rose-6)"
                        : "var(--puck-color-rose-7)",
                     color: "white",
                     padding: "5px",
                     cursor: "pointer",
                  }}
                  onClick={() => toggleGroup(group)}
               >
                  {group}
               </div>
               {expandedGroups.includes(group) &&
                  CustomNodeType.map((type, index) => (
                     <div
                        key={index}
                        className="dndnode"
                        onDragStart={(event) => onDragStart(event, type)}
                        draggable
                     >
                        {`${type.toUpperCase()} Node`}
                     </div>
                  ))}
            </div>
         ))}
      </aside>
   );
};

export default Sidebar;
