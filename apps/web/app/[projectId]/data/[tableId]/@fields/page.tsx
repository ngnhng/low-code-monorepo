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

const nodeTypes = {
  entity: EntityNode,
};

export default function Page({ params: { tableId } }) {
  const {
    tableData: { fetchTableData, fetchAppliedQueries },
    projectData: { currentProjectId },
  } = useMobxStore();

  const { data, isLoading, error, mutate } = useSWR<DataTable>(
    `TABLE_DATA-${currentProjectId}-${tableId}`,
    () =>
      fetchTableData({
        tableId,
        ...fetchAppliedQueries(tableId),
      }),
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (data) {
      const newNodes = [
        {
          id: 'initialNode',
          type: 'entity',
          data: { fields: data.columns },
          position: { x: 100, y: 100 },
        },
      ];
      setNodes(newNodes);
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

function EntityNode({ data }: { data: { fields: ColumnDef[] | [] } }) {
  return (
    <div className="bg-primary rounded-custom p-4 ">
      {data.fields.map((field, index) => (
        <div key={index}>{field.label}</div>
      ))}
    </div>
  );
}
