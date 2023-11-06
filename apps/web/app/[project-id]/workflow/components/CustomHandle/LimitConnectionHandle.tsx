import React, { useMemo } from 'react';
import { getConnectedEdges, Handle, useNodeId, useStore } from 'reactflow';

const selector = (s) => {
  return ({
    nodeInternals: s.nodeInternals,
    edges: s.edges
  })
}

const LimitConnectHandle = (props: any) => {
  const {nodeInternals, edges} = useStore(selector);
  const nodeId = useNodeId();

  const isHandleConnectable = useMemo(() => {
    if (typeof props.isConnectable === 'number') {
      const node = nodeInternals.get(nodeId);
      const connectedEdges = getConnectedEdges([node], edges);
      return connectedEdges.length < props.isConnectable;
    }

    return props.isConnectable;
  }, [nodeInternals, edges, nodeId, props.isConnectable])


  return (
    <Handle {...props} isConnectable={isHandleConnectable}></Handle>
  )
}

export default LimitConnectHandle;
