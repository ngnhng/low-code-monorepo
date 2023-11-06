import { Node, Edge, MarkerType } from 'reactflow';

export const initialNodes: Node[] = [
  {
    id: '0',
    type: 'trigger',
    data: { label: 'Trigger Node' },
    position: { x: 0, y: 0 },
  },
  // {
  //   id: '1',
  //   type: 'activity',
  //   data: { label: 'Activity Node' },
  //   position: { x: 0, y: 100 },
  // },
  // {
  //   id: '2',
  //   type: 'gateway',
  //   data: { label: 'Gateway Node' },
  //   position: { x: 0, y: 200 },
  // },
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

