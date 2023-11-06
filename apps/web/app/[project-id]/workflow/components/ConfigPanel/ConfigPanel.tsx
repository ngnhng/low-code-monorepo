import React, { useState } from "react";
// import Dropdown from "../CustomEdge/Dropdown";

const FloatingPanel = ({ children, top }) => {
   return (
      <div
         style={{
            position: "fixed",
            top: top,
            right: "-200px",
            backgroundColor: "#fff",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
            height: "fit-content",
            transform: "translateY(-50%)",
            maxWidth: "120px",
         }}
      >
         {children}
      </div>
   );
};

const ConfigPanel = ({ id, label, open, setLabel }) => {
   const [nodeName, setNodeName] = useState(label);

   return (
      <div className={`configPanel ${open ? 'active' : 'inactive'}`}>
         {/* the ref of the canvas make the logic dropdown failed */}
         {/* <FloatingPanel top='100%'>
            <Dropdown></Dropdown>
         </FloatingPanel> */}

         <FloatingPanel top="50%">
            <label>Label:</label>
            <input
               value={nodeName}
               onChange={(e) => {
                  setNodeName(e.target.value);
                  setLabel(e.target.value);
               }}
               style={{
                  padding: "5px",
                  borderRadius: "3px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                  width: "100%",
               }}
            />
            {/* <Dropdown></Dropdown> */}
         </FloatingPanel>

         {/* <FloatingPanel top="100%">
			<div
				style={{
					margin: "10px",
				}}
			>
            <button
               // onClick={onSave}
               style={{
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "#008CBA",
                  color: "white",
                  cursor: "pointer",
				  width: "100%",
				  height: "40px",
				  margin: "5px",
               }}
            >
               Save
            </button>
            <button
               // onClick={onRestore}
               style={{
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "#f44336",
                  color: "white",
                  cursor: "pointer",
				  width: "100%",
				  height: "40px",
				  margin: "5px",
               }}
            >
               Restore
            </button>
			</div>
         </FloatingPanel> */}
      </div>
   );
};

export default ConfigPanel;
