import { Node, Edge, XYPosition, MarkerType } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'
import { TriggerNode, GatewayNode, ActivityNode } from '../components/CustomNode'

export function createNode(type: string, position: XYPosition, data?: object, payload?: any): Node {  
  if (payload) {
    return {
      id : `node_${uuidv4()}`,
      type : type,
      position : position,
      data: data,
      ...payload
    }
  }
  
  return {
    id : `node_${uuidv4()}`,
    type : type,
    position : position,
    data: data
  }
}

export function createEdge(source: string, target: string): Edge {
  return {
    id: `edge_${uuidv4()}`,
    source: source,
    target: target,
    label: '+',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }
}

export const CustomNodeType: string[] = ["trigger", "activity", "gateway"];

export const CustomNode = {
  trigger: TriggerNode,
  activity: ActivityNode,
  gateway: GatewayNode
}

export type DataPayloadNode = {
  label: string, 
  parentId?: string
}