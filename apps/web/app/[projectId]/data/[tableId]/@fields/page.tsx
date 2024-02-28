'use client';

import useSWR from 'swr';
import { useMobxStore } from 'lib/mobx/store-provider';
import { ColumnDef, DataTable } from 'types/table-data';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ReactFlow, {
  addEdge,
  useEdgesState,
  useNodesState,
  Background,
  Controls,
  Handle,
  Position
} from 'reactflow';

import 'reactflow/dist/style.css';
import { table } from 'console';

const nodeTypes = {
  entity: EntityNode,
};

export default function Page({ params: { tableId } }) {
  const {
    tableData: { fetchTableData, fetchAppliedQueries, fetchTableRelations },
    projectData: { currentProjectId },
  } = useMobxStore();

  // const { data, isLoading, error, mutate } = useSWR<DataTable>(
  //   `TABLE_DATA-${currentProjectId}-${tableId}`,
  //   () =>
  //     fetchTableData({
  //       tableId,
  //       ...fetchAppliedQueries(tableId),
  //     }),
  // );

  const { data, isLoading, error, mutate } = useSWR(
    `TABLE_DATA-${currentProjectId}-${tableId}-relations`,
    () => fetchTableRelations(tableId),
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    
    const displayNodes: any[] = []
    const displayEdges: any[] = []

    for (const d in data) {
      const newNodes = [
        {
          id: data[d].id,
          type: 'entity',
          data: { fields: data[d], isSource: data[d].id === tableId },
          position: { x: 100, y: 100 },
        },
      ];

      displayNodes.push(...newNodes);
    }

    if (data) {
      for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < displayNodes.length; j++) {
          if (data[i]?.referenceTables?.includes(data[j]?.id as string)) {
            const edge = {
              id: `${data[i]?.id}-${data[j]?.id}`,
              source: data[i]?.id,
              target: data[j]?.id,
            }

            displayEdges.push(edge);
          }
        }
      }
    }

    setNodes(displayNodes);
    setEdges(displayEdges);
  }, [data, isLoading]);

  // const onConnect = useCallback(
  //   (params) => setEdges((eds) => addEdge(params, eds)),
  //   [setEdges],
  // );

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        // onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function EntityNode({ data }: { data }) {

  return (
    <div>
      {/* {data.isSource ? 
        <Handle type="source" position={Position.Right} className="!bg-teal-500" /> :
        <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      } */}
      <Handle type="source" position={Position.Right} className="!bg-teal-500" /> :
      <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      <table className='bg-accent rounded-custom'>
        <thead className='bg-primary text-white border border-solid border-blue-700'>
          <tr>
            <th className='p-4'>{data.fields.name}</th>
          </tr>
        </thead>
        <tbody>
          {
            data.fields.columns.map((field, index) => (
              <tr key={index} className='border border-solid border-blue-700'>
                <td className='p-2'>{field.label}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

// ! Notes for the foreign key, primary key:

// * has one more fields called "Foreign key" contains field_id and table_id