import { Node, Edge, MarkerType } from 'reactflow';

export const initialNodes: Node[] = [
  {
    id: '0',
    type: 'default',
    data: { label: 'Default Node' },
    position: { x: 0, y: 0 },
  },
  {
    id: '1',
    type: 'default',
    data: { label: 'Default Node' },
    position: { x: 0, y: 100 },
  },
]

export const initialEdges: Edge[] = [
  {
    id: 'init-edge',
    source: '0',
    target: '1',
    label: '+',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }
]

