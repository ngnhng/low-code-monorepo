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
} from 'reactflow';

import 'reactflow/dist/style.css';
import { table } from 'console';

const nodeTypes = {
  entity: EntityNode,
};

export default function Page({ params: { tableId } }) {
  const {
    tableData: { fetchTableData, fetchAppliedQueries, fetchTables },
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
    `TABLE_DATA-${currentProjectId}-all`,
    () => fetchTables(),
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    console.log(data);

    if (data) {
      const tempNodes: any[] = [];

      for (const d in data) {
        const newNodes = [
          {
            id: data[d]?.id,
            type: 'entity',
            data: { fields: data[d] },
            position: { x: 100, y: 100 },
          },
        ];

        tempNodes.push(...newNodes);
      }

      console.log("temp: ", tempNodes);

      setNodes(tempNodes);
    }
  }, [data, isLoading]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

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
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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