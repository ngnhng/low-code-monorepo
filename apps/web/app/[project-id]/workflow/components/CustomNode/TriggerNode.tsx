import React, { useCallback } from 'react'
import { Handle, Position } from 'reactflow';
import LimitConnectHandle from '../CustomHandle/LimitConnectionHandle';
import message from './assets/icons8-gmail-login-24.png'
import Image from 'next/image';

const TriggerNode = ({data}) => {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="trigger-node">
      <Image  src={message} width={24} height={24} alt='Msg'/>
      {/* <Image  src={data.icon} width={24} height={24} alt='Msg'/> */}
      <LimitConnectHandle isConnectable={2} type="source" position={Position.Bottom} />
    </div>
  )
}

export default TriggerNode