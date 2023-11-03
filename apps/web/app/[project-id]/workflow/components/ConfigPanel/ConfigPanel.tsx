import React, { useState } from 'react'

const ConfigPanel = ({id, label, setNodes}) => {
  console.log("props: ", id);
  console.log("label: ", label);

  const [nodeName, setNodeName] = useState('Node 1');

  return (
    <div className='configNodePanel'>
      <label>label:</label>
      <input value={`test`} onChange={() => {}} />

      <label className="configNodePanel_bg">background:</label>
      <input value={`temp`} onChange={() => {}} />

      <div className="configNodePanel_check">
          <label>hidden:</label>
          <input
            type="checkbox"
            checked={true}
            onChange={(evt) => {}}
          />
        </div>
    </div>
  )
}

export default ConfigPanel