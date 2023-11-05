import React, { useState } from "react";

const FloatingPanel = ({ children, top }) => {
   return (
      <div
         style={{
            position: "fixed",
            top: top,
            right: "20px",
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

const ConfigPanel = ({ id, label, setNodes, onSave, onRestore }) => {
   const [nodeName, setNodeName] = useState("Node 1");

   return (
      <>
         <FloatingPanel top="50%">
            <label>Label:</label>
            <input
               value={`test`}
               onChange={() => {}}
               style={{
                  padding: "5px",
                  borderRadius: "3px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                  width: "100%",
               }}
            />

            <label className="configNodePanel_bg">Background:</label>
            <input
               value={`temp`}
               onChange={() => {}}
               style={{
                  padding: "5px",
                  borderRadius: "3px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                  width: "100%",
               }}
            />

            <div className="configNodePanel_check">
               <label>Hidden?:</label>
               <input
                  type="checkbox"
                  checked={true}
                  onChange={(evt) => {}}
                  style={{
                     marginRight: "10px",
                  }}
               />
            </div>
         </FloatingPanel>

         <FloatingPanel top="70%">
			<div
				style={{
					margin: "10px",
				}}
			>
            <button
               onClick={onSave}
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
               onClick={onRestore}
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
         </FloatingPanel>
      </>
   );
};

export default ConfigPanel;
